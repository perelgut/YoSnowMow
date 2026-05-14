/**
 * api.js — Axios HTTP client for the YoSnowMow Spring Boot backend (P1-19).
 *
 * Every outgoing request automatically attaches the current user's Firebase ID
 * token as an Authorization: Bearer header.  If no user is signed in the
 * request is sent without a token and the backend will return 401.
 *
 * Base URL is read from VITE_API_BASE_URL (set in .env.local):
 *   Local dev:    http://localhost:8080
 *   Cloud Run:    https://yosnowmow-api-<hash>.a.run.app   (set in P1-02)
 */

import axios from 'axios'
import { auth } from './firebase'

// ── Axios instance ──────────────────────────────────────────────────────────

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
  timeout: 15000,
})

// Attach Firebase ID token to every request (if a user is signed in)
api.interceptors.request.use(async (config) => {
  const user = auth.currentUser
  if (user) {
    const token = await user.getIdToken()
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Log 4xx/5xx errors; surface 401 as a warning.
// Also normalise RFC 7807 Problem JSON: copy 'detail' → 'message' so every
// caller can use err.response?.data?.message regardless of error format.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn('[api] 401 Unauthorized — Firebase token missing or expired')
    } else if (error.response?.status === 403) {
      console.warn('[api] 403 Forbidden — user lacks required role')
    } else {
      console.error('[api] Request failed:', error.response?.status, error.message)
    }
    const data = error.response?.data
    if (data && data.detail && !data.message) {
      data.message = data.detail
    }
    return Promise.reject(error)
  }
)

// ── Admin API ───────────────────────────────────────────────────────────────

/**
 * Fetch platform summary statistics for the admin overview tab.
 * @returns {Promise<AdminStatsResponse>}
 */
export const getAdminStats = () =>
  api.get('/api/admin/stats').then(r => r.data)

/**
 * Fetch a paginated, optionally filtered list of jobs.
 * @param {{ status?, requesterId?, workerId?, page?, size? }} params
 * @returns {Promise<PagedResponse<Job>>}
 */
export const getAdminJobs = (params = {}) =>
  api.get('/api/admin/jobs', { params }).then(r => r.data)

/**
 * Fetch a paginated, optionally filtered list of users.
 * @param {{ role?, status?, page?, size? }} params
 * @returns {Promise<PagedResponse<User>>}
 */
export const getAdminUsers = (params = {}) =>
  api.get('/api/admin/users', { params }).then(r => r.data)

/**
 * List disputes for admin review.
 * @param {string} [status] - optional filter: 'OPEN' or 'RESOLVED'
 * @returns {Promise<Dispute[]>}
 */
export const getAdminDisputes = (status) =>
  api.get('/api/admin/disputes', { params: status ? { status } : {} }).then(r => r.data)

/**
 * Override the status of a job (admin only).
 * @param {string} jobId
 * @param {string} targetStatus
 * @param {string} reason
 * @returns {Promise<Job>}
 */
export const overrideJobStatus = (jobId, targetStatus, reason) =>
  api.patch(`/api/admin/jobs/${jobId}/status`, { targetStatus, reason }).then(r => r.data)

/**
 * Issue a full refund for a job (admin only).
 * @param {string} jobId
 * @returns {Promise<void>}
 */
export const refundJob = (jobId) =>
  api.post(`/api/admin/jobs/${jobId}/refund`).then(r => r.data)

/**
 * Force-release the worker payout for a job (admin only).
 * @param {string} jobId
 * @returns {Promise<void>}
 */
export const releasePayment = (jobId) =>
  api.post(`/api/admin/jobs/${jobId}/release`).then(r => r.data)

/**
 * Ban a user account (admin only).
 * @param {string} uid
 * @param {string} reason
 * @returns {Promise<void>}
 */
export const banUser = (uid, reason) =>
  api.post(`/api/admin/users/${uid}/ban`, { reason }).then(r => r.data)

/**
 * Lift a ban or suspension from a user account (admin only).
 * @param {string} uid
 * @param {string} reason
 * @returns {Promise<void>}
 */
export const unbanUser = (uid, reason) =>
  api.post(`/api/admin/users/${uid}/unban`, { reason }).then(r => r.data)

/**
 * Temporarily suspend a user account (admin only).
 * @param {string} uid
 * @param {string} reason
 * @param {number} durationDays
 * @returns {Promise<void>}
 */
export const suspendUser = (uid, reason, durationDays) =>
  api.post(`/api/admin/users/${uid}/suspend`, { reason, durationDays }).then(r => r.data)

/**
 * Apply a bulk action to a list of jobs (admin only).
 * @param {string[]} jobIds
 * @param {'release'|'refund'} action
 * @returns {Promise<{ succeeded: number, failed: number, errors: string[] }>}
 */
export const bulkJobAction = (jobIds, action) =>
  api.post('/api/admin/jobs/bulk-action', { jobIds, action }).then(r => r.data)

// ── Job API ─────────────────────────────────────────────────────────────────

/**
 * Post a new job.
 * @param {{ scope: string[], propertyAddressText: string, startWindowEarliest?: string,
 *           startWindowLatest?: string, notesForWorker?: string,
 *           personalWorkerOnly?: boolean }} data
 * @returns {Promise<Job>}
 */
export const postJob = (data) =>
  api.post('/api/jobs', data).then(r => r.data)

/**
 * Validate that an address string can be geocoded.
 * @param {string} addressText
 * @returns {Promise<{ valid: boolean, resolvedAddress?: string }>}
 */
export const validateAddress = (addressText) =>
  api.post('/api/address/validate', { addressText }).then(r => r.data)

/**
 * List jobs for the current user (requester sees their own jobs; admin sees all).
 * @param {{ status?: string, page?: number, size?: number }} params
 * @returns {Promise<Job[]>}
 */
export const listJobs = (params = {}) =>
  api.get('/api/jobs', { params }).then(r => r.data)

/**
 * Fetch a single job by ID (admin or job participant).
 * @param {string} jobId
 * @returns {Promise<Job>}
 */
export const getJob = (jobId) =>
  api.get(`/api/jobs/${jobId}`).then(r => r.data)

/**
 * Cancel a job. A $10 + HST fee applies if status is ESCROW_HELD.
 * @param {string} jobId
 * @returns {Promise<Job>}
 */
export const cancelJob = (jobId) =>
  api.post(`/api/jobs/${jobId}/cancel`).then(r => r.data)

/**
 * Open a dispute on a PENDING_APPROVAL or INCOMPLETE job (requester only, within 2-hour window).
 * Returns the newly created Dispute document.
 * @param {string} jobId
 * @param {string} statement  Requester's account of what happened (required)
 * @returns {Promise<Dispute>}
 */
export const disputeJob = (jobId, statement) =>
  api.post(`/api/jobs/${jobId}/dispute`, { statement }).then(r => r.data)

// ── User API ─────────────────────────────────────────────────────────────────

/**
 * Register a new user profile after Firebase Auth sign-up.
 * @param {{ name, dateOfBirth, roles, tosVersion, privacyPolicyVersion, phoneNumber }} body
 * @returns {Promise<User>}
 */
export const createUser = (body) =>
  api.post('/api/users', body).then(r => r.data)

/**
 * Fetch a user profile by UID (own profile or admin).
 * @param {string} userId
 * @returns {Promise<User>}
 */
export const getUser = (userId) =>
  api.get(`/api/users/${userId}`).then(r => r.data)

/**
 * Fetch the public Worker profile for display in the negotiation UI.
 * Returns only { displayName, averageRating, totalJobsCompleted }.
 * Safe to call for any Worker on a job you participate in.
 * @param {string} workerId  Firebase Auth UID of the Worker
 * @returns {Promise<{ displayName: string, averageRating: number|null, totalJobsCompleted: number }>}
 */
export const getWorkerPublicProfile = (workerId) =>
  api.get(`/api/users/${workerId}/worker/public`).then(r => r.data)

/**
 * Register or refresh the FCM device token for push notifications (P1-18).
 * Called after login and whenever the browser grants notification permission.
 * @param {string} userId
 * @param {string|null} fcmToken  null to clear the token
 * @returns {Promise<void>}
 */
export const updateFcmToken = (userId, fcmToken) =>
  api.patch(`/api/users/${userId}/fcm-token`, { fcmToken })

/**
 * Activate the Worker role for the current user and store initial profile data.
 * Called at signup for users who select a worker role.
 * @param {{ designation: string, baseAddressFullText: string, serviceRadiusKm: number, bufferOptIn: boolean, hstRegistered: boolean, tiers: Array<{maxDistanceKm: number, priceCAD: number}> }} body
 * @returns {Promise<User>}
 */
export const activateWorker = (body) =>
  api.post('/api/users/me/worker', body).then(r => r.data)

// ── Worker job-lifecycle API ──────────────────────────────────────────────────

/**
 * List all worker offers for a job (requester view).
 * @param {string} jobId
 * @returns {Promise<JobOffer[]>}
 */
export const getOffersForJob = (jobId) =>
  api.get(`/api/jobs/${jobId}/offers`).then(r => r.data)

/**
 * Worker submits or updates an offer on a POSTED/NEGOTIATING job.
 * @param {string} jobId
 * @param {{ action: 'accept'|'counter'|'photo_request'|'withdraw', priceCents?: number, note?: string }} body
 * @returns {Promise<JobOffer>}
 */
export const submitOffer = (jobId, body) =>
  api.post(`/api/jobs/${jobId}/offers`, body).then(r => r.data)

/**
 * Requester responds to a specific worker's offer.
 * @param {string} jobId
 * @param {string} workerId
 * @param {{ action: 'accept'|'counter'|'reject', priceCents?: number, note?: string }} body
 * @returns {Promise<JobOffer>}
 */
export const respondToOffer = (jobId, workerId, body) =>
  api.put(`/api/jobs/${jobId}/offers/${workerId}`, body).then(r => r.data)

/**
 * Requester explicitly approves completed work (PENDING_APPROVAL → RELEASED).
 * @param {string} jobId
 * @returns {Promise<Job>}
 */
export const approveJob = (jobId) =>
  api.post(`/api/jobs/${jobId}/approve`).then(r => r.data)

/**
 * Sandbox-only: simulates a successful Stripe escrow payment (AGREED → ESCROW_HELD)
 * without going through the real Stripe flow.
 * @param {string} jobId
 * @returns {Promise<Job>}
 */
export const simulatePayment = (jobId) =>
  api.post(`/api/jobs/${jobId}/simulate-payment`).then(r => r.data)

/**
 * @deprecated Use respondToOffer / getOffersForJob instead (Phase A redesign).
 * Accept or decline a pending job offer.
 * @param {string} requestId  Composite ID: "{jobId}_{workerId}"
 * @param {boolean} accepted
 * @returns {Promise<void>}
 */
export const respondToJobRequest = (requestId, accepted) =>
  api.post(`/api/job-requests/${requestId}/respond`, { accepted }).then(r => r.data)

/**
 * Worker checks in at the property (CONFIRMED → IN_PROGRESS).
 * @param {string} jobId
 * @returns {Promise<Job>}
 */
export const startJob = (jobId) =>
  api.post(`/api/jobs/${jobId}/start`).then(r => r.data)

/**
 * Worker marks a job as complete (IN_PROGRESS → PENDING_APPROVAL).
 * Starts the 2-hour auto-approval Quartz timer on the backend.
 * @param {string} jobId
 * @returns {Promise<Job>}
 */
export const completeJob = (jobId) =>
  api.post(`/api/jobs/${jobId}/complete`).then(r => r.data)

/**
 * Upload a completion photo for a job (JPEG/PNG, max 10 MB, max 5 per job).
 * Job must be IN_PROGRESS or COMPLETE.
 * @param {string} jobId
 * @param {File} file
 * @returns {Promise<{ url: string, totalPhotos: number }>}
 */
export const uploadJobPhoto = (jobId, file) => {
  const formData = new FormData()
  formData.append('file', file)
  return api.post(`/api/jobs/${jobId}/photos`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then(r => r.data)
}

// ── Dispute API — P2-01/P2-02 ────────────────────────────────────────────────

/**
 * Fetch a dispute document by ID.
 * Caller must be a party to the associated job, or an Admin.
 * @param {string} disputeId
 * @returns {Promise<Dispute>}
 */
export const getDispute = (disputeId) =>
  api.get(`/api/disputes/${disputeId}`).then(r => r.data)

/**
 * Admin resolves an open dispute.
 * @param {string} disputeId
 * @param {{ resolution: 'RELEASED'|'REFUNDED'|'SPLIT',
 *           splitPercentageToWorker: number,
 *           adminNotes: string }} body
 * @returns {Promise<Dispute>}
 */
export const resolveDispute = (disputeId, body) =>
  api.post(`/api/disputes/${disputeId}/resolve`, body).then(r => r.data)

/**
 * Upload an evidence file to a dispute (JPEG/PNG/PDF, max 20 MB, max 5 per party).
 * @param {string} disputeId
 * @param {FormData} formData  must contain a 'file' field
 * @returns {Promise<{ url: string, totalEvidenceCount: number }>}
 */
export const uploadEvidence = (disputeId, formData) =>
  api.post(`/api/disputes/${disputeId}/evidence`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then(r => r.data)

/**
 * Add or update a party's statement on an open dispute.
 * Requester sets requesterStatement; Worker sets workerStatement.
 * @param {string} disputeId
 * @param {string} statement
 * @returns {Promise<Dispute>}
 */
export const addDisputeStatement = (disputeId, statement) =>
  api.post(`/api/disputes/${disputeId}/statement`, { statement }).then(r => r.data)

// ── Analytics API — P2-07 ────────────────────────────────────────────────────

/**
 * Fetch daily analytics stats for a date range plus all-time summary totals.
 * Both dates are inclusive; range capped at 90 days on the backend.
 * @param {string} from  start date, YYYY-MM-DD
 * @param {string} to    end date, YYYY-MM-DD
 * @returns {Promise<{ dailyStats: DailyStat[], summary: SummaryDoc }>}
 */
export const getAdminAnalytics = (from, to) =>
  api.get('/api/admin/analytics', { params: { from, to } }).then(r => r.data)

/**
 * Fetch the top Workers ranked by completed job count.
 * @param {number} size  number of Workers to return (max 50, default 10)
 * @returns {Promise<{ uid, name, completedJobCount, rating }[]>}
 */
export const getTopWorkers = (size = 10) =>
  api.get('/api/admin/workers', { params: { size } }).then(r => r.data)

/**
 * Trigger an immediate recompute of daily analytics for the given date (admin only).
 * Useful when the nightly Quartz job did not fire (Cloud Run scaled to zero).
 * @param {string} date  YYYY-MM-DD (defaults to yesterday on the backend if omitted)
 * @returns {Promise<void>}
 */
export const recomputeAnalytics = (date) =>
  api.post('/api/admin/analytics/recompute', null, { params: { date } }).then(r => r.data)

/**
 * Download a transaction export CSV for the given date range (P3-07).
 * Returns a Blob; the caller is responsible for triggering the browser download.
 * @param {string} from  start date, YYYY-MM-DD
 * @param {string} to    end date, YYYY-MM-DD
 * @returns {Promise<Blob>}
 */
export const exportTransactions = (from, to) =>
  api.get('/api/admin/reports/transactions', {
    params: { from, to, format: 'csv' },
    responseType: 'blob',
  }).then(r => r.data)

/**
 * Submit a rating for a completed job.
 * Backend derives the raterRole from the caller's UID (REQUESTER or WORKER).
 * @param {string} jobId
 * @param {{ stars: number, reviewText?: string, wouldRepeat: boolean }} data
 * @returns {Promise<Rating>}
 */
export const submitRating = (jobId, data) =>
  api.post(`/api/jobs/${jobId}/rating`, data).then(r => r.data)

/**
 * Fetch all ratings for a job (0–2 documents: one per role).
 * @param {string} jobId
 * @returns {Promise<Rating[]>}
 */
export const getRatings = (jobId) =>
  api.get(`/api/jobs/${jobId}/ratings`).then(r => r.data)
