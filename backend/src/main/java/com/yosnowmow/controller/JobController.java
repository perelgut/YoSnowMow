package com.yosnowmow.controller;

import com.yosnowmow.dto.CannotCompleteRequest;
import com.yosnowmow.dto.CreateJobRequest;
import com.yosnowmow.dto.DisputeRequest;
import com.yosnowmow.model.Dispute;
import com.yosnowmow.model.Job;
import com.yosnowmow.security.AuthenticatedUser;
import com.yosnowmow.security.RequiresRole;
import com.yosnowmow.service.DisputeService;
import com.yosnowmow.service.JobService;
import com.yosnowmow.service.MatchingService;
import com.yosnowmow.service.PaymentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * REST controller for job lifecycle management.
 *
 * Base path: {@code /api/jobs}
 *
 * <h3>Endpoints (P1-08)</h3>
 * <ul>
 *   <li>POST /api/jobs              — post a new job (REQUESTER)</li>
 *   <li>GET  /api/jobs              — list jobs for the caller; admin can filter all</li>
 *   <li>GET  /api/jobs/{jobId}      — get a single job</li>
 * </ul>
 *
 * <h3>Endpoints (P1-13 / P1-14)</h3>
 * <ul>
 *   <li>POST /api/jobs/{jobId}/start            — Worker starts the job (IN_PROGRESS)</li>
 *   <li>POST /api/jobs/{jobId}/complete         — Worker marks the job complete</li>
 *   <li>POST /api/jobs/{jobId}/cannot-complete  — Worker reports they cannot finish</li>
 *   <li>POST /api/jobs/{jobId}/dispute          — Requester opens a dispute</li>
 *   <li>POST /api/jobs/{jobId}/release          — Admin releases payment (RELEASED)</li>
 *   <li>POST /api/jobs/{jobId}/cancel           — Requester or Admin cancels the job (P1-14)</li>
 * </ul>
 */
@RestController
@RequestMapping("/api/jobs")
public class JobController {

    private final JobService     jobService;
    private final MatchingService matchingService;
    private final PaymentService  paymentService;
    private final DisputeService  disputeService;

    public JobController(JobService jobService,
                         MatchingService matchingService,
                         PaymentService paymentService,
                         DisputeService disputeService) {
        this.jobService      = jobService;
        this.matchingService = matchingService;
        this.paymentService  = paymentService;
        this.disputeService  = disputeService;
    }

    // ── P1-08: Create and read ────────────────────────────────────────────────

    /**
     * Posts a new job (REQUESTED state).
     *
     * Kicks off Worker matching asynchronously after the response is returned —
     * the Requester does not wait for matching to complete.
     */
    @PostMapping
    @RequiresRole("requester")
    public ResponseEntity<Job> postJob(
            @AuthenticationPrincipal AuthenticatedUser caller,
            @Valid @RequestBody CreateJobRequest req) {

        Job created = jobService.createJob(caller, req);
        matchingService.matchAndStoreWorkers(created.getJobId());
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    /**
     * Returns a single job document.
     *
     * Per spec §5.3, {@code propertyAddress} is hidden from Workers until the
     * job reaches CONFIRMED.
     */
    @GetMapping("/{jobId}")
    public ResponseEntity<Job> getJob(
            @PathVariable String jobId,
            @AuthenticationPrincipal AuthenticatedUser caller) {

        Job job = jobService.getJobForCaller(jobId, caller);

        if (caller.hasRole("worker")
                && !caller.hasRole("admin")
                && !isConfirmedOrLater(job.getStatus())) {
            job.setPropertyAddress(null);
            job.setPropertyCoords(null);
        }

        return ResponseEntity.ok(job);
    }

    /**
     * Lists jobs.  Regular users see only their own; admins may filter by status,
     * requesterId, or workerId.
     */
    @GetMapping
    public ResponseEntity<List<Job>> listJobs(
            @AuthenticationPrincipal AuthenticatedUser caller,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String requesterId,
            @RequestParam(required = false) String workerId,
            @RequestParam(defaultValue = "20") int limit) {

        List<Job> jobs = caller.hasRole("admin")
                ? jobService.listJobs(status, requesterId, workerId, limit)
                : jobService.listJobsForUser(caller.uid());

        return ResponseEntity.ok(jobs);
    }

    // ── P1-13: State-machine transitions ─────────────────────────────────────

    /**
     * Worker starts the job — transitions ESCROW_HELD → IN_PROGRESS.
     *
     * Only the assigned Worker may call this endpoint.
     * Permission is enforced inside {@code JobService.transition()}.
     */
    @PostMapping("/{jobId}/start")
    @RequiresRole("worker")
    public ResponseEntity<Job> startJob(
            @PathVariable String jobId,
            @AuthenticationPrincipal AuthenticatedUser caller) {

        Job job = jobService.transition(jobId, "IN_PROGRESS", caller.uid(),
                caller.hasRole("admin"));
        return ResponseEntity.ok(job);
    }

    /**
     * Worker marks the job complete — transitions IN_PROGRESS → PENDING_APPROVAL.
     *
     * Only the assigned Worker may call this endpoint.
     * Scheduling the approval-window auto-release Quartz timer is a side effect inside
     * {@code JobService.transition()}.
     */
    @PostMapping("/{jobId}/complete")
    @RequiresRole("worker")
    public ResponseEntity<Job> completeJob(
            @PathVariable String jobId,
            @AuthenticationPrincipal AuthenticatedUser caller) {

        Job job = jobService.transition(jobId, "PENDING_APPROVAL", caller.uid(),
                caller.hasRole("admin"));
        return ResponseEntity.ok(job);
    }

    /**
     * Requester explicitly approves a completed job — transitions PENDING_APPROVAL → RELEASED.
     *
     * If the Requester does not act within the approval window, the system auto-releases.
     * After the status transition, the controller triggers the Stripe transfer via
     * {@code PaymentService.releasePayment()} so the Worker is paid out.
     */
    @PostMapping("/{jobId}/approve")
    @RequiresRole("requester")
    public ResponseEntity<Job> approveJob(
            @PathVariable String jobId,
            @AuthenticationPrincipal AuthenticatedUser caller) {

        jobService.transition(jobId, "RELEASED", caller.uid(), caller.hasRole("admin"));
        paymentService.releasePayment(jobId);
        return ResponseEntity.ok(jobService.getJob(jobId));
    }

    /**
     * Worker reports they cannot complete the job — transitions IN_PROGRESS → INCOMPLETE.
     *
     * The reason and optional note are stored on the job document.
     * A Worker or Admin may call this endpoint.
     */
    @PostMapping("/{jobId}/cannot-complete")
    @RequiresRole("worker")
    public ResponseEntity<Job> cannotComplete(
            @PathVariable String jobId,
            @AuthenticationPrincipal AuthenticatedUser caller,
            @Valid @RequestBody CannotCompleteRequest req) {

        // Persist the reason and note before transitioning.
        Map<String, Object> extras = new HashMap<>();
        extras.put("cannotCompleteReason", req.getReason());
        extras.put("cannotCompleteNote",   req.getNote());
        extras.put("cannotCompleteAt",
                com.google.cloud.Timestamp.now());

        jobService.transitionStatus(jobId, "INCOMPLETE", caller.uid(), extras);
        return ResponseEntity.ok(jobService.getJob(jobId));
    }

    /**
     * Requester opens a dispute on a COMPLETE or INCOMPLETE job.
     *
     * Delegates to {@link DisputeService#openDispute} which:
     * <ul>
     *   <li>Creates a Dispute document in Firestore</li>
     *   <li>Transitions the job to DISPUTED via the validated state machine</li>
     *   <li>Notifies the Requester, Worker, and Admin</li>
     * </ul>
     *
     * For COMPLETE → DISPUTED, the 2-hour dispute window is enforced in DisputeService
     * and again in the JobService state machine guard.
     *
     * @return 201 Created with the newly created Dispute document
     */
    @PostMapping("/{jobId}/dispute")
    @RequiresRole("requester")
    public ResponseEntity<Dispute> disputeJob(
            @PathVariable String jobId,
            @AuthenticationPrincipal AuthenticatedUser caller,
            @Valid @RequestBody DisputeRequest req) {

        Dispute dispute = disputeService.openDispute(jobId, caller.uid(), req);
        return ResponseEntity.status(HttpStatus.CREATED).body(dispute);
    }

    /**
     * Admin releases payment — transitions COMPLETE, INCOMPLETE, or DISPUTED → RELEASED.
     *
     * After the status transition, the controller triggers the Stripe transfer via
     * {@code PaymentService.releasePayment()} so the Worker is paid out.
     */
    @PostMapping("/{jobId}/release")
    @RequiresRole("admin")
    public ResponseEntity<Job> releaseJob(
            @PathVariable String jobId,
            @AuthenticationPrincipal AuthenticatedUser caller) {

        Job job = jobService.getJob(jobId);
        jobService.transition(jobId, "RELEASED", caller.uid(), true);
        paymentService.releasePayment(jobId);
        return ResponseEntity.ok(jobService.getJob(jobId));
    }

    // ── P1-14: Cancellation ───────────────────────────────────────────────────

    /**
     * Cancels a job.  The caller must be the Requester who owns the job or an Admin.
     *
     * <p>Cancellation rules (spec §6 / v1.1):
     * <ul>
     *   <li>POSTED / NEGOTIATING → CANCELLED: free (no payment collected yet)</li>
     *   <li>AGREED      → CANCELLED: Stripe PaymentIntent is cancelled</li>
     *   <li>ESCROW_HELD → CANCELLED: $10 CAD + HST fee charged; remainder refunded</li>
     *   <li>IN_PROGRESS or later: not permitted — use the dispute process</li>
     * </ul>
     *
     * @param jobId  Firestore document ID
     * @param caller authenticated caller
     * @return the updated Job (status = CANCELLED)
     */
    @PostMapping("/{jobId}/cancel")
    public ResponseEntity<Job> cancelJob(
            @PathVariable String jobId,
            @AuthenticationPrincipal AuthenticatedUser caller) {

        boolean isAdmin = caller.hasRole("admin");

        // Validate + transition (throws InvalidTransitionException / AccessDeniedException).
        String previousStatus = jobService.cancelJob(jobId, caller.uid(), isAdmin);

        // Trigger appropriate Stripe operation based on the previous status.
        switch (previousStatus) {
            case "ESCROW_HELD" -> paymentService.cancelWithFee(jobId);
            case "AGREED"      -> paymentService.cancelPaymentIntent(jobId);
            // POSTED / NEGOTIATING: no payment was collected — nothing to do.
        }

        return ResponseEntity.ok(jobService.getJob(jobId));
    }

    // ── Sandbox / Phase-0 helpers ─────────────────────────────────────────────

    /**
     * Simulates a successful escrow payment without Stripe — for sandbox testing only.
     *
     * Transitions the job directly from AGREED → ESCROW_HELD.  This endpoint bypasses
     * the normal Stripe PaymentIntent flow so the full job lifecycle can be exercised
     * without payment credentials.
     *
     * The caller must be the Requester who owns the job.
     *
     * TODO: remove or gate behind a dev-mode flag before production launch.
     *
     * @param jobId  Firestore document ID of the job
     * @param caller authenticated requester
     * @return the updated Job (status = ESCROW_HELD)
     */
    @PostMapping("/{jobId}/simulate-payment")
    @RequiresRole("requester")
    public ResponseEntity<Job> simulatePayment(
            @PathVariable String jobId,
            @AuthenticationPrincipal AuthenticatedUser caller) {

        Job job = jobService.getJob(jobId);
        if (!job.getRequesterId().equals(caller.uid()) && !caller.hasRole("admin")) {
            throw new org.springframework.web.server.ResponseStatusException(
                    HttpStatus.FORBIDDEN, "You do not own this job");
        }
        if (!"AGREED".equals(job.getStatus())) {
            throw new org.springframework.web.server.ResponseStatusException(
                    HttpStatus.UNPROCESSABLE_ENTITY,
                    "Job is not awaiting payment (status: " + job.getStatus() + ")");
        }

        jobService.transitionStatus(jobId, "ESCROW_HELD", caller.uid(), null);
        return ResponseEntity.ok(jobService.getJob(jobId));
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    /** Worker address visibility: hide until escrow is held. */
    private boolean isConfirmedOrLater(String status) {
        return switch (status) {
            case "ESCROW_HELD", "IN_PROGRESS", "PENDING_APPROVAL", "INCOMPLETE",
                 "DISPUTED", "RELEASED", "REFUNDED", "SETTLED" -> true;
            default -> false;
        };
    }
}
