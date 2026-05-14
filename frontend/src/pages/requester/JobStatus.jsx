import { useState, useEffect, useCallback } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  getJob, cancelJob, disputeJob,
  getOffersForJob, respondToOffer, approveJob, simulatePayment,
  getWorkerPublicProfile, getRatings,
} from '../../services/api'
import StatusPill from '../../components/StatusPill'
import Modal from '../../components/Modal'
import { WorkerProfileModal } from './WorkerProfile'

// Format a CAD dollar amount (double from backend, may be null before pricing is set)
const fmtCAD = amount => amount != null ? '$' + Number(amount).toFixed(2) : '—'

// Format a cents integer (int from backend)
const fmtCents = cents => cents != null ? '$' + (cents / 100).toFixed(2) : '—'

// Convert scope array to readable label
const SCOPE_LABELS = { driveway: 'Driveway', sidewalk: 'Walkway / Sidewalk' }
const fmtScope = scope => scope?.map(s => SCOPE_LABELS[s] ?? s).join(', ') ?? '—'

// Format a backend timestamp (Firestore Timestamp object, ISO string, or null)
function fmtTimestamp(ts) {
  if (!ts) return 'ASAP'
  try {
    const d = ts.seconds ? new Date(ts.seconds * 1000) : new Date(ts)
    return d.toLocaleString('en-CA', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
  } catch {
    return String(ts)
  }
}

// v1.1 timeline states (terminal / exception states not on main path)
const TIMELINE_STATES = ['POSTED', 'NEGOTIATING', 'AGREED', 'ESCROW_HELD', 'IN_PROGRESS', 'PENDING_APPROVAL']
const TIMELINE_LABELS = {
  POSTED:           'Job Posted',
  NEGOTIATING:      'Reviewing Offers',
  AGREED:           'Price Agreed',
  ESCROW_HELD:      'Payment Secured',
  IN_PROGRESS:      'In Progress',
  PENDING_APPROVAL: 'Awaiting Approval',
}

const STATUS_DESC = {
  POSTED:           "Your job is live. Nearby workers are reviewing it and may submit offers.",
  NEGOTIATING:      "Workers have submitted offers. Review them below and accept or negotiate.",
  AGREED:           "You've agreed on a price. Complete payment to lock in your booking.",
  ESCROW_HELD:      "Payment is held securely in escrow. Your worker will arrive soon.",
  IN_PROGRESS:      "Your worker has checked in and is clearing your snow.",
  PENDING_APPROVAL: "Work is done! Approve to release payment, or raise a dispute within 2 hours.",
  RELEASED:         "Payment has been released to your worker. Job closed.",
  DISPUTED:         "A dispute has been raised. Our admin team will review within 24 hours.",
  CANCELLED:        "This job has been cancelled.",
  INCOMPLETE:       "The worker was unable to complete this job. Please contact support.",
  REFUNDED:         "A refund has been issued to your payment method.",
  SETTLED:          "This job has been settled by our admin team.",
}

const OFFER_STATUS_META = {
  OPEN:            { label: 'New Offer',         color: 'var(--blue)' },
  COUNTERED:       { label: 'Counter Offer',     color: '#E67E22' },
  PHOTO_REQUESTED: { label: 'Photo Requested',   color: '#E67E22' },
  ACCEPTED:        { label: 'Accepted',          color: 'var(--green)' },
  REJECTED:        { label: 'Rejected',          color: 'var(--red)' },
  WITHDRAWN:       { label: 'Withdrawn',         color: 'var(--gray-400)' },
}

export default function JobStatus() {
  const { id }   = useParams()
  const navigate = useNavigate()

  const [job,          setJob]          = useState(null)
  const [worker,       setWorker]       = useState(null)
  const [ratings,      setRatings]      = useState([])
  const [loading,      setLoading]      = useState(true)
  const [error,        setError]        = useState(null)
  const [submitting,   setSubmitting]   = useState(false)

  // Offer negotiation state
  const [offers,         setOffers]         = useState([])
  const [offerWorkers,   setOfferWorkers]   = useState({})

  // Modal open states
  const [cancelOpen,      setCancelOpen]      = useState(false)
  const [disputeOpen,     setDisputeOpen]     = useState(false)
  const [disputeReason,   setDisputeReason]   = useState('')
  const [profileOpen,     setProfileOpen]     = useState(false)
  const [approveOpen,     setApproveOpen]     = useState(false)
  const [ackOpen,         setAckOpen]         = useState(false)
  const [acceptWorkerId,  setAcceptWorkerId]  = useState(null)
  const [counterOpen,     setCounterOpen]     = useState(false)
  const [counterWorkerId, setCounterWorkerId] = useState(null)
  const [counterPrice,    setCounterPrice]    = useState('')
  const [counterNote,     setCounterNote]     = useState('')

  // Load job on mount and whenever the id changes
  useEffect(() => {
    setLoading(true)
    setError(null)
    getJob(id)
      .then(data => setJob(data))
      .catch(err => {
        console.error('[JobStatus] Failed to load job:', err)
        setError('Could not load this job. Please try again.')
      })
      .finally(() => setLoading(false))
  }, [id])

  // Load assigned worker profile once workerId is known
  useEffect(() => {
    if (!job?.workerId) { setWorker(null); return }
    getWorkerPublicProfile(job.workerId)
      .then(data => setWorker(data))
      .catch(err => console.error('[JobStatus] Failed to load worker profile:', err))
  }, [job?.workerId])

  // Load ratings once the job reaches a rateable state
  useEffect(() => {
    const rateable = ['PENDING_APPROVAL', 'DISPUTED', 'RELEASED', 'SETTLED']
    if (!job?.jobId || !rateable.includes(job.status)) { setRatings([]); return }
    getRatings(job.jobId)
      .then(data => setRatings(data ?? []))
      .catch(() => {})
  }, [job?.jobId, job?.status])

  // Load offers while the job is in the negotiation phase
  useEffect(() => {
    if (!job || !['POSTED', 'NEGOTIATING'].includes(job.status)) {
      setOffers([])
      return
    }
    getOffersForJob(id)
      .then(data => setOffers(data ?? []))
      .catch(err => console.error('[JobStatus] Failed to load offers:', err))
  }, [id, job?.status])

  // Load public worker profile for each offer (fire-and-forget; cached in offerWorkers state)
  useEffect(() => {
    offers.forEach(offer => {
      getWorkerPublicProfile(offer.workerId)
        .then(u => setOfferWorkers(prev => ({ ...prev, [offer.workerId]: u })))
        .catch(() => {})
    })
  }, [offers])

  // ── Helpers ───────────────────────────────────────────────────────────────

  const refreshJob = useCallback(async () => {
    const [updatedJob, updatedOffers] = await Promise.all([
      getJob(id),
      getOffersForJob(id).catch(() => null),
    ])
    setJob(updatedJob)
    if (updatedOffers) setOffers(updatedOffers)
  }, [id])

  // Poll every 5 s while the job is awaiting a Worker action, so the Requester
  // sees the state change (POSTED → NEGOTIATING → AGREED) without a manual refresh.
  useEffect(() => {
    if (!job?.status) return
    if (!['POSTED', 'NEGOTIATING'].includes(job.status)) return
    const interval = setInterval(refreshJob, 5000)
    return () => clearInterval(interval)
  }, [job?.status, refreshJob])

  // ── Handlers ──────────────────────────────────────────────────────────────

  async function handleCancel() {
    setSubmitting(true)
    try {
      const updated = await cancelJob(id)
      setJob(updated)
      setCancelOpen(false)
    } catch (err) {
      console.error('[JobStatus] Cancel failed:', err)
      alert('Cancel failed — please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleSimulatePayment() {
    setSubmitting(true)
    try {
      const updated = await simulatePayment(id)
      setJob(updated)
    } catch (err) {
      console.error('[JobStatus] Simulate payment failed:', err)
      alert('Payment simulation failed — please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDispute() {
    setSubmitting(true)
    try {
      const updated = await disputeJob(id, disputeReason)
      setJob(updated)
      setDisputeOpen(false)
      setDisputeReason('')
    } catch (err) {
      console.error('[JobStatus] Dispute failed:', err)
      alert('Dispute submission failed — please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  function openAcceptModal(workerId) {
    setAcceptWorkerId(workerId)
    setAckOpen(true)
  }

  async function confirmAcceptOffer() {
    setSubmitting(true)
    try {
      await respondToOffer(id, acceptWorkerId, { action: 'accept' })
      setAckOpen(false)
      await refreshJob()
    } catch (err) {
      console.error('[JobStatus] Accept offer failed:', err)
      alert('Failed to accept offer — please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleRejectOffer(workerId) {
    if (!window.confirm('Reject this offer? The worker will be notified.')) return
    setSubmitting(true)
    try {
      await respondToOffer(id, workerId, { action: 'reject' })
      await refreshJob()
    } catch (err) {
      console.error('[JobStatus] Reject offer failed:', err)
      alert('Failed to reject offer — please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  function openCounterModal(workerId, currentPriceCents) {
    setCounterWorkerId(workerId)
    setCounterPrice(currentPriceCents ? (currentPriceCents / 100).toFixed(2) : '')
    setCounterNote('')
    setCounterOpen(true)
  }

  async function handleCounterOffer() {
    const priceCents = Math.round(parseFloat(counterPrice) * 100)
    if (!counterPrice || isNaN(priceCents) || priceCents < 100) {
      alert('Please enter a valid price (minimum $1.00).')
      return
    }
    setSubmitting(true)
    try {
      await respondToOffer(id, counterWorkerId, {
        action: 'counter', priceCents, note: counterNote || undefined,
      })
      setCounterOpen(false)
      await refreshJob()
    } catch (err) {
      console.error('[JobStatus] Counter offer failed:', err)
      alert('Failed to send counter offer — please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleApprove() {
    setSubmitting(true)
    try {
      await approveJob(id)
      setApproveOpen(false)
      const updated = await getJob(id)
      setJob(updated)
    } catch (err) {
      console.error('[JobStatus] Approve failed:', err)
      alert('Failed to approve — please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  // ── Loading / error states ────────────────────────────────────────────────

  if (loading) return (
    <div className="card" style={{ textAlign: 'center', padding: 'var(--sp-10)', color: 'var(--gray-400)' }}>
      Loading job…
    </div>
  )

  if (error || !job) return (
    <div className="card" style={{ textAlign: 'center', padding: 'var(--sp-10)' }}>
      <p style={{ color: 'var(--gray-400)' }}>{error ?? 'Job not found.'}</p>
      <Link to="/requester/jobs" className="btn btn-primary" style={{ marginTop: 16, display: 'inline-flex' }}>← My Jobs</Link>
    </div>
  )

  // ── Derived state ─────────────────────────────────────────────────────────

  const terminalStates  = ['DISPUTED', 'CANCELLED', 'INCOMPLETE', 'REFUNDED', 'SETTLED']
  const timelineIdx     = terminalStates.includes(job.status)
    ? TIMELINE_STATES.length
    : TIMELINE_STATES.indexOf(job.status)

  const canCancel     = ['POSTED', 'NEGOTIATING', 'AGREED', 'ESCROW_HELD'].includes(job.status)
  const canDispute    = job.status === 'PENDING_APPROVAL'
  const canApprove    = job.status === 'PENDING_APPROVAL'
  const alreadyRated  = ratings.some(r => r.raterRole === 'REQUESTER')
  const canRate       = ['PENDING_APPROVAL', 'DISPUTED', 'RELEASED', 'SETTLED'].includes(job.status) && !!job.workerId
  const showOffers    = ['POSTED', 'NEGOTIATING'].includes(job.status)
  const showPayment   = job.status === 'AGREED'
  const workerVisible = job.workerId && ['NEGOTIATING', 'AGREED', 'ESCROW_HELD', 'IN_PROGRESS',
    'PENDING_APPROVAL', 'RELEASED', 'DISPUTED'].includes(job.status)
  const pricingAvailable = job.totalAmountCAD != null

  const workerInitials = worker?.displayName
    ? worker.displayName.split(' ').map(w => w[0]).join('').toUpperCase()
    : '?'

  const platformFeeCAD = (job.tierPriceCAD != null && job.workerPayoutCAD != null)
    ? job.tierPriceCAD - job.workerPayoutCAD
    : null

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div style={{ maxWidth: 600, margin: '0 auto' }}>

      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)', marginBottom: 'var(--sp-6)', fontSize: 'var(--font-size-sm)' }}>
        <Link to="/requester/jobs" style={{ color: 'var(--gray-400)', textDecoration: 'none' }}>← My Jobs</Link>
        <span style={{ color: 'var(--gray-300)' }}>/</span>
        <span style={{ fontWeight: 600 }}>{job.jobId}</span>
      </div>

      {/* Status banner */}
      <div className="card" style={{ marginBottom: 'var(--sp-4)', background: 'linear-gradient(135deg, #1A6FDB 0%, #0F4FA8 100%)', color: '#fff' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--sp-2)' }}>
          <h1 style={{ fontSize: 'var(--text-lg)', fontWeight: 800 }}>Job Status</h1>
          <StatusPill status={job.status} labelOverrides={{ RELEASED: 'Worker Paid', SETTLED: 'Worker Paid' }} />
        </div>
        <div style={{ opacity: .85, fontSize: 'var(--font-size-sm)' }}>{STATUS_DESC[job.status] ?? job.status}</div>
      </div>

      {/* Timeline */}
      <div className="card" style={{ marginBottom: 'var(--sp-4)' }}>
        <h2 style={{ fontWeight: 700, marginBottom: 'var(--sp-4)', fontSize: 'var(--font-size-base)' }}>Timeline</h2>
        {TIMELINE_STATES.map((state, i) => {
          const done   = i < timelineIdx
          const active = i === timelineIdx && !terminalStates.includes(job.status)
          return (
            <div key={state} style={{ display: 'flex', gap: 'var(--sp-3)', marginBottom: i < TIMELINE_STATES.length - 1 ? 'var(--sp-1)' : 0 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{
                  width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                  background: done ? 'var(--green)' : active ? 'var(--blue)' : 'var(--gray-200)',
                  color: (done || active) ? '#fff' : 'var(--gray-400)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 'var(--font-size-xs)', fontWeight: 700,
                }}>{done ? '✓' : i + 1}</div>
                {i < TIMELINE_STATES.length - 1 && (
                  <div style={{ width: 2, height: 42, background: done ? 'var(--green)' : 'var(--gray-200)', margin: '3px 0' }} />
                )}
              </div>
              <div style={{ paddingTop: 'var(--sp-1)', paddingBottom: i < TIMELINE_STATES.length - 1 ? 'var(--sp-4)' : 0 }}>
                <div style={{ fontWeight: active ? 700 : 600, fontSize: 'var(--font-size-sm)', color: active ? 'var(--blue)' : done ? 'var(--gray-600)' : 'var(--gray-400)' }}>
                  {TIMELINE_LABELS[state]}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Offers panel — POSTED / NEGOTIATING */}
      {showOffers && (
        <div className="card" style={{ marginBottom: 'var(--sp-4)' }}>
          <h2 style={{ fontWeight: 700, marginBottom: 'var(--sp-1)', fontSize: 'var(--font-size-base)' }}>Worker Offers</h2>
          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-500)', marginBottom: 'var(--sp-4)' }}>
            Your opening offer: <strong>{fmtCents(job.postedPriceCents)}</strong>.
            Workers may accept or propose a different price.
          </p>

          {offers.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 'var(--sp-5) 0', color: 'var(--gray-400)', fontSize: 'var(--font-size-sm)' }}>
              No offers yet — nearby workers have been notified.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
              {offers.map(offer => {
                const offerWorker  = offerWorkers[offer.workerId]
                const workerName   = offerWorker?.displayName ?? offer.workerId
                const statusMeta   = OFFER_STATUS_META[offer.status] ?? { label: offer.status, color: 'var(--gray-400)' }
                const canAct       = (offer.status === 'OPEN' || offer.status === 'COUNTERED') && offer.lastMoveBy === 'worker'
                const waitingOnMe  = canAct
                const displayPrice = offer.workerPriceCents ?? offer.requesterPriceCents

                return (
                  <div key={offer.offerId} style={{
                    border: `1.5px solid ${waitingOnMe ? 'var(--blue)' : 'var(--gray-200)'}`,
                    borderRadius: 'var(--radius)',
                    padding: 'var(--sp-4)',
                    background: waitingOnMe ? 'var(--blue-light)' : '#fff',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 'var(--sp-2)' }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 'var(--font-size-base)' }}>{workerName}</div>
                        {offerWorker && (
                          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--gray-500)', marginTop: 'var(--sp-1)' }}>
                            {'★'.repeat(Math.round(offerWorker.averageRating ?? 0))}
                            {'☆'.repeat(5 - Math.round(offerWorker.averageRating ?? 0))}
                            {' '}{(offerWorker.averageRating ?? 0).toFixed(1)} · {offerWorker.totalJobsCompleted ?? 0} jobs
                          </div>
                        )}
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 700, fontSize: 'var(--font-size-md)', color: 'var(--blue)' }}>{fmtCents(displayPrice)}</div>
                        <div style={{ fontSize: 'var(--font-size-xs)', color: statusMeta.color, fontWeight: 600 }}>{statusMeta.label}</div>
                      </div>
                    </div>

                    {offer.workerNote && (
                      <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)', fontStyle: 'italic', marginBottom: 'var(--sp-2)' }}>
                        "{offer.workerNote}"
                      </div>
                    )}

                    {!canAct && (offer.status === 'OPEN' || offer.status === 'COUNTERED') && (
                      <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--gray-400)' }}>Waiting for worker's response…</div>
                    )}

                    {canAct && (
                      <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                        <button
                          className="btn btn-primary btn-sm"
                          style={{ flex: 1 }}
                          disabled={submitting}
                          onClick={() => openAcceptModal(offer.workerId)}
                        >
                          Accept
                        </button>
                        <button
                          className="btn btn-secondary btn-sm"
                          style={{ flex: 1 }}
                          disabled={submitting}
                          onClick={() => openCounterModal(offer.workerId, displayPrice)}
                        >
                          Counter
                        </button>
                        <button
                          className="btn btn-ghost btn-sm"
                          style={{ color: 'var(--red)' }}
                          disabled={submitting}
                          onClick={() => handleRejectOffer(offer.workerId)}
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Payment required — AGREED state */}
      {showPayment && (
        <div className="card" style={{ marginBottom: 'var(--sp-4)', border: '1.5px solid var(--blue)', background: 'var(--blue-light)' }}>
          <h2 style={{ fontWeight: 700, marginBottom: 8, fontSize: 15 }}>Payment Required</h2>
          <p style={{ fontSize: 14, color: 'var(--gray-600)', marginBottom: 'var(--sp-4)', lineHeight: 1.5 }}>
            Price agreed: <strong>{fmtCents(job.agreedPriceCents)}</strong>.
            Pay now to secure your booking — funds are held in escrow until work is approved.
          </p>
          <button
            className="btn btn-primary btn-lg btn-full"
            disabled={submitting}
            onClick={handleSimulatePayment}
          >
            {submitting ? 'Processing…' : 'Pay & Hold Escrow'}
          </button>
        </div>
      )}

      {/* Approve payment — PENDING_APPROVAL state */}
      {canApprove && (
        <div className="card" style={{ marginBottom: 'var(--sp-4)', border: '1.5px solid var(--green)', background: '#EAFAF1' }}>
          <h2 style={{ fontWeight: 700, marginBottom: 8, fontSize: 15, color: 'var(--green)' }}>Work Complete</h2>
          <p style={{ fontSize: 14, color: 'var(--gray-600)', marginBottom: 'var(--sp-4)', lineHeight: 1.5 }}>
            Your worker has marked the job done. Approve to release payment, or raise a dispute within 2 hours.
            Payment releases automatically after 2 hours.
          </p>
          <button
            className="btn btn-lg btn-full"
            style={{ background: 'var(--green)', color: '#fff' }}
            disabled={submitting}
            onClick={() => setApproveOpen(true)}
          >
            Approve & Release Payment
          </button>
        </div>
      )}

      {/* Worker card — shown from NEGOTIATING onward (once a worker is assigned) */}
      {workerVisible && (
        <div className="card" style={{ marginBottom: 'var(--sp-4)' }}>
          <h2 style={{ fontWeight: 700, marginBottom: 'var(--sp-4)', fontSize: 15 }}>Your Worker</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-4)' }}>
            <div style={{
              width: 52, height: 52, borderRadius: '50%',
              background: '#0F4FA8', color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 700, fontSize: 18, flexShrink: 0,
            }}>
              {workerInitials}
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 15 }}>{worker?.displayName ?? 'Loading…'}</div>
              {worker && (
                <div style={{ fontSize: 13, color: 'var(--gray-500)', marginTop: 2 }}>
                  {'★'.repeat(Math.round(worker.averageRating ?? 0))}
                  {'☆'.repeat(5 - Math.round(worker.averageRating ?? 0))}
                  {' '}{(worker.averageRating ?? 0).toFixed(1)} · {worker.totalJobsCompleted ?? 0} jobs
                </div>
              )}
              <div style={{ fontSize: 12, color: 'var(--gray-400)', marginTop: 2 }}>✓ Background checked</div>
            </div>

            <button
              onClick={() => setProfileOpen(true)}
              style={{ fontSize: 13, color: 'var(--blue)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', flexShrink: 0, padding: 0 }}
            >
              View Profile
            </button>
          </div>
        </div>
      )}

      {/* Job details */}
      <div className="card" style={{ marginBottom: 'var(--sp-4)', fontSize: 14 }}>
        <h2 style={{ fontWeight: 700, marginBottom: 'var(--sp-4)', fontSize: 15 }}>Job Details</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--gray-500)' }}>Address</span>
            <span style={{ fontWeight: 600, textAlign: 'right', maxWidth: '60%' }}>
              {job.propertyAddress?.fullText ?? '—'}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--gray-500)' }}>Services</span>
            <span style={{ fontWeight: 600, textAlign: 'right', maxWidth: '60%' }}>{fmtScope(job.scope)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--gray-500)' }}>Scheduled</span>
            <span style={{ fontWeight: 600 }}>{fmtTimestamp(job.startWindowEarliest)}</span>
          </div>
          {job.postedPriceCents != null && (
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--gray-500)' }}>Opening offer</span>
              <span style={{ fontWeight: 600 }}>{fmtCents(job.postedPriceCents)}</span>
            </div>
          )}
          {job.notesForWorker && (
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--gray-500)' }}>Notes</span>
              <span style={{ fontWeight: 600, textAlign: 'right', maxWidth: '60%' }}>{job.notesForWorker}</span>
            </div>
          )}
        </div>

        <div className="divider" style={{ margin: '16px 0' }} />

        {pricingAvailable ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--gray-500)' }}>Agreed price</span>
              <span>{fmtCAD(job.tierPriceCAD)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--gray-500)' }}>HST (13%)</span>
              <span>+ {fmtCAD(job.hstAmountCAD)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
              <span>Total charged</span>
              <span style={{ color: 'var(--blue)' }}>{fmtCAD(job.totalAmountCAD)}</span>
            </div>
            <div className="divider" style={{ margin: '2px 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--gray-500)' }}>Less platform fee</span>
              <span style={{ color: 'var(--gray-500)' }}>− {fmtCAD(platformFeeCAD)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
              <span>{job.status === 'RELEASED' ? 'Paid to Worker' : 'To be paid to Worker'}</span>
              <span style={{ color: 'var(--green)' }}>{fmtCAD(job.workerPayoutCAD)}</span>
            </div>
          </div>
        ) : (
          <p style={{ fontSize: 13, color: 'var(--gray-400)', textAlign: 'center', padding: 'var(--sp-3) 0' }}>
            Pricing appears once a price is agreed with a worker.
          </p>
        )}
      </div>

      {/* PENDING_APPROVAL secondary actions (approve card shown above) */}
      {canApprove && canDispute && (
        <div style={{ marginBottom: 'var(--sp-4)' }}>
          <button
            className="btn btn-lg btn-full btn-secondary"
            style={{ borderColor: 'var(--amber)', color: 'var(--amber)' }}
            onClick={() => setDisputeOpen(true)}
          >
            ⚠ Raise a Dispute
          </button>
        </div>
      )}

      {/* Rate worker — available at any post-completion state */}
      {canRate && (
        <div style={{ marginBottom: 'var(--sp-4)' }}>
          {alreadyRated ? (
            <button
              className="btn btn-lg btn-full btn-secondary"
              onClick={() => navigate(`/requester/jobs/${job.jobId}/rate`)}
            >
              ★ View Your Rating
            </button>
          ) : (
            <button
              className="btn btn-lg btn-full"
              style={{ background: '#F6AD55', color: '#fff', border: 'none' }}
              onClick={() => navigate(`/requester/jobs/${job.jobId}/rate`)}
            >
              ★ Rate Your Worker
            </button>
          )}
        </div>
      )}

      {/* Cancel button — available for POSTED / NEGOTIATING / AGREED / ESCROW_HELD */}
      {canCancel && (
        <div style={{ marginBottom: 'var(--sp-4)', textAlign: 'center' }}>
          <button className="btn btn-ghost btn-sm" style={{ color: 'var(--red)' }}
            onClick={() => setCancelOpen(true)}
          >
            Cancel Job
          </button>
        </div>
      )}

      {/* ── Modals ── */}

      {/* Accept offer — escrow acknowledgment */}
      <Modal
        isOpen={ackOpen}
        onClose={() => setAckOpen(false)}
        title="Accept Offer"
        size="sm"
        footer={
          <div style={{ display: 'flex', gap: 'var(--sp-3)', justifyContent: 'flex-end' }}>
            <button className="btn btn-ghost" onClick={() => setAckOpen(false)} disabled={submitting}>Back</button>
            <button className="btn btn-primary" onClick={confirmAcceptOffer} disabled={submitting}>
              {submitting ? 'Accepting…' : 'Accept & Proceed to Payment'}
            </button>
          </div>
        }
      >
        <p style={{ fontSize: 14, color: 'var(--gray-600)', lineHeight: 1.6 }}>
          By accepting, you agree that payment will be <strong>automatically released to the Worker
          2 hours after work is marked complete</strong>, unless you raise a dispute during that window.
        </p>
      </Modal>

      {/* Counter offer */}
      <Modal
        isOpen={counterOpen}
        onClose={() => setCounterOpen(false)}
        title="Send Counter Offer"
        size="sm"
        footer={
          <div style={{ display: 'flex', gap: 'var(--sp-3)', justifyContent: 'flex-end' }}>
            <button className="btn btn-ghost" onClick={() => setCounterOpen(false)} disabled={submitting}>Cancel</button>
            <button className="btn btn-primary" onClick={handleCounterOffer} disabled={submitting}>
              {submitting ? 'Sending…' : 'Send Counter'}
            </button>
          </div>
        }
      >
        <div className="field" style={{ marginBottom: 'var(--sp-4)' }}>
          <label className="label">Your counter price (CAD) *</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontWeight: 700, fontSize: 18 }}>$</span>
            <input
              type="number"
              min="1"
              step="0.01"
              className="input"
              placeholder="35.00"
              value={counterPrice}
              onChange={e => setCounterPrice(e.target.value)}
              style={{ maxWidth: 120 }}
            />
          </div>
        </div>
        <div className="field">
          <label className="label">Note to worker (optional)</label>
          <textarea
            className="input"
            rows={2}
            placeholder="Brief message…"
            value={counterNote}
            onChange={e => setCounterNote(e.target.value)}
            maxLength={500}
          />
        </div>
      </Modal>

      {/* Approve payment */}
      <Modal
        isOpen={approveOpen}
        onClose={() => setApproveOpen(false)}
        title="Release Payment"
        size="sm"
        footer={
          <div style={{ display: 'flex', gap: 'var(--sp-3)', justifyContent: 'flex-end' }}>
            <button className="btn btn-ghost" onClick={() => setApproveOpen(false)} disabled={submitting}>Cancel</button>
            <button
              className="btn"
              style={{ background: 'var(--green)', color: '#fff' }}
              onClick={handleApprove}
              disabled={submitting}
            >
              {submitting ? 'Releasing…' : 'Yes, Release Payment'}
            </button>
          </div>
        }
      >
        <p style={{ fontSize: 14, color: 'var(--gray-600)', lineHeight: 1.5 }}>
          This will release <strong>{fmtCAD(job.workerPayoutCAD)}</strong> to your worker.
          This action cannot be undone.
        </p>
      </Modal>

      {/* Cancel confirmation */}
      <Modal
        isOpen={cancelOpen}
        onClose={() => setCancelOpen(false)}
        title="Cancel this job?"
        size="sm"
        footer={
          <div style={{ display: 'flex', gap: 'var(--sp-3)', justifyContent: 'flex-end' }}>
            <button className="btn btn-ghost" onClick={() => setCancelOpen(false)} disabled={submitting}>Keep Job</button>
            <button className="btn btn-danger" onClick={handleCancel} disabled={submitting}>
              {submitting ? 'Cancelling…' : 'Yes, Cancel'}
            </button>
          </div>
        }
      >
        <p style={{ fontSize: 14, color: 'var(--gray-600)', lineHeight: 1.5 }}>
          Are you sure you want to cancel job <strong>{job.jobId}</strong>?
          {job.status === 'ESCROW_HELD' && (
            <><br /><br /><strong>Note:</strong> A $10 + HST cancellation fee applies since payment is already held in escrow.</>
          )}
        </p>
      </Modal>

      {/* Worker profile modal */}
      <WorkerProfileModal isOpen={profileOpen} onClose={() => setProfileOpen(false)} worker={worker} jobRatings={ratings} />

      {/* Dispute modal */}
      <Modal
        isOpen={disputeOpen}
        onClose={() => { setDisputeOpen(false); setDisputeReason('') }}
        title="Raise a Dispute"
        size="md"
        footer={
          <div style={{ display: 'flex', gap: 'var(--sp-3)', justifyContent: 'flex-end' }}>
            <button className="btn btn-ghost" onClick={() => { setDisputeOpen(false); setDisputeReason('') }} disabled={submitting}>Cancel</button>
            <button
              className="btn btn-primary"
              disabled={disputeReason.trim().length < 10 || submitting}
              onClick={handleDispute}
            >
              {submitting ? 'Submitting…' : 'Submit Dispute'}
            </button>
          </div>
        }
      >
        <p style={{ fontSize: 14, color: 'var(--gray-600)', marginBottom: 'var(--sp-4)', lineHeight: 1.5 }}>
          Our admin team will review your dispute within 24 hours and may contact both parties.
        </p>
        <div className="field">
          <label className="label">Reason for dispute *</label>
          <textarea
            className="input"
            rows={4}
            placeholder="Describe what went wrong (e.g. work incomplete, property damaged…)"
            value={disputeReason}
            onChange={e => setDisputeReason(e.target.value)}
            maxLength={1000}
          />
          <span style={{ fontSize: 11, color: 'var(--gray-400)', textAlign: 'right' }}>{disputeReason.length}/1000</span>
        </div>
      </Modal>

    </div>
  )
}
