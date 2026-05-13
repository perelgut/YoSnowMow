import { useState, useEffect } from 'react'
import { listJobs, startJob, completeJob, uploadJobPhoto, submitRating, getRatings } from '../../services/api'
import StatusPill from '../../components/StatusPill'

// Format a CAD amount (double from backend)
const fmtCAD = amount => amount != null ? '$' + Number(amount).toFixed(2) : '—'

// Convert scope array to readable label
const SCOPE_LABELS = { driveway: 'Driveway', sidewalk: 'Walkway / Sidewalk', both: 'Driveway + Walkway' }
const fmtScope = scope => scope?.map(s => SCOPE_LABELS[s] ?? s).join(', ') ?? '—'

// Format a backend timestamp for display
function fmtTimestamp(ts) {
  if (!ts) return 'ASAP'
  try {
    const d = ts.seconds ? new Date(ts.seconds * 1000) : new Date(ts)
    return d.toLocaleString('en-CA', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
  } catch { return String(ts) }
}

const STAR_LABELS = ['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent!']

// Statuses where the worker has completed work and can rate the requester
const RATEABLE_STATUSES = ['PENDING_APPROVAL', 'DISPUTED', 'RELEASED', 'SETTLED']

export default function ActiveJob() {
  const [job,            setJob]            = useState(null)
  const [loading,        setLoading]        = useState(true)
  const [photoUploaded,  setPhotoUploaded]  = useState(false)
  const [photoUploading, setPhotoUploading] = useState(false)
  const [submitting,     setSubmitting]     = useState(false)

  // Rating state
  const [ratingStars,    setRatingStars]    = useState(0)
  const [ratingHover,    setRatingHover]    = useState(0)
  const [ratingText,     setRatingText]     = useState('')
  const [wouldRepeat,    setWouldRepeat]    = useState(null)
  const [ratingSubmitting, setRatingSubmitting] = useState(false)
  const [ratingSubmitted,  setRatingSubmitted]  = useState(false)
  const [ratingError,    setRatingError]    = useState('')
  const [alreadyRated,   setAlreadyRated]   = useState(false)

  // Load worker's active or recently completed job on mount
  useEffect(() => {
    listJobs()
      .then(jobs => {
        if (!Array.isArray(jobs)) return
        // Prefer truly active; fall back to most recently completed/disputed
        const active    = jobs.find(j => ['ESCROW_HELD', 'IN_PROGRESS'].includes(j.status))
        const completed = jobs.find(j => RATEABLE_STATUSES.includes(j.status))
        setJob(active ?? completed ?? null)
      })
      .catch(err => console.error('[ActiveJob] Failed to load jobs:', err))
      .finally(() => setLoading(false))
  }, [])

  // Check if the worker already rated this job
  useEffect(() => {
    if (!job?.jobId || !RATEABLE_STATUSES.includes(job.status)) return
    getRatings(job.jobId)
      .then(data => {
        const rated = (data ?? []).some(r => r.raterRole === 'WORKER')
        setAlreadyRated(rated)
        if (rated) setRatingSubmitted(true)
      })
      .catch(() => {})
  }, [job?.jobId, job?.status])

  // ── Handlers ─────────────────────────────────────────────────────────────

  async function handleCheckIn() {
    setSubmitting(true)
    try {
      const updated = await startJob(job.jobId)
      setJob(updated)
    } catch (err) {
      console.error('[ActiveJob] Check-in failed:', err)
      alert('Check-in failed — please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handlePhotoChange(e) {
    const file = e.target.files[0]
    if (!file) return
    setPhotoUploading(true)
    try {
      await uploadJobPhoto(job.jobId, file)
      setPhotoUploaded(true)
    } catch (err) {
      console.error('[ActiveJob] Photo upload failed:', err)
      alert('Photo upload failed — please try again.')
    } finally {
      setPhotoUploading(false)
    }
  }

  async function handleComplete() {
    setSubmitting(true)
    try {
      const updated = await completeJob(job.jobId)
      setJob(updated)
    } catch (err) {
      console.error('[ActiveJob] Complete failed:', err)
      alert('Could not mark job as complete — please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleRateRequester() {
    if (ratingStars === 0) { setRatingError('Please select a star rating.'); return }
    if (wouldRepeat === null) { setRatingError('Please answer "Would you work for them again?"'); return }
    setRatingError('')
    setRatingSubmitting(true)
    try {
      await submitRating(job.jobId, {
        stars: ratingStars,
        reviewText: ratingText.trim() || undefined,
        wouldRepeat,
      })
      setRatingSubmitted(true)
      setAlreadyRated(true)
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to submit rating.'
      setRatingError(msg)
    } finally {
      setRatingSubmitting(false)
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────

  if (loading) return (
    <div>
      <h1 style={{ fontSize: 'var(--text-xl)', fontWeight: 800, marginBottom: 'var(--sp-6)' }}>Active Job</h1>
      <div className="card" style={{ textAlign: 'center', padding: 'var(--sp-10)', color: 'var(--gray-400)' }}>
        Loading…
      </div>
    </div>
  )

  if (!job) return (
    <div>
      <h1 style={{ fontSize: 'var(--text-xl)', fontWeight: 800, marginBottom: 'var(--sp-6)' }}>Active Job</h1>
      <div className="card" style={{ textAlign: 'center', padding: 'var(--sp-10)', color: 'var(--gray-400)' }}>
        <div style={{ fontSize: 72, marginBottom: 'var(--sp-3)' }}>❄️</div>
        <p style={{ fontWeight: 600, marginBottom: 'var(--sp-2)' }}>No active job</p>
        <p style={{ fontSize: 'var(--font-size-sm)' }}>Once your offer is agreed and the homeowner pays, your job will appear here.</p>
      </div>
    </div>
  )

  const isPendingApproval = job.status === 'PENDING_APPROVAL'
  const isDisputedOrDone  = ['DISPUTED', 'RELEASED', 'SETTLED'].includes(job.status)
  const canRateNow        = RATEABLE_STATUSES.includes(job.status) && !alreadyRated
  const bannerBg = isPendingApproval || isDisputedOrDone
    ? 'var(--color-success)'
    : 'var(--color-primary)'

  return (
    <div style={{ maxWidth: 480, margin: '0 auto' }}>
      <h1 style={{ fontSize: 'var(--text-xl)', fontWeight: 800, marginBottom: 'var(--sp-6)' }}>Active Job</h1>

      {/* Status banner */}
      <div className="card" style={{ marginBottom: 'var(--sp-4)', background: bannerBg, color: '#fff' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 'var(--font-size-xs)', opacity: .8, fontWeight: 600, marginBottom: 'var(--sp-1)' }}>Current Status</div>
            <div style={{ fontWeight: 800, fontSize: 'var(--font-size-lg)' }}>
              {job.status === 'ESCROW_HELD'      && '🚗 Head to the property'}
              {job.status === 'IN_PROGRESS'      && '❄️ Clearing in progress'}
              {job.status === 'PENDING_APPROVAL' && '✅ Work submitted — awaiting homeowner approval'}
              {job.status === 'DISPUTED'         && '⚠️ Dispute raised — admin is reviewing'}
              {job.status === 'RELEASED'         && '💰 Payment released — job complete'}
              {job.status === 'SETTLED'          && '✅ Job settled by admin'}
            </div>
          </div>
          <StatusPill status={job.status} labelOverrides={{ RELEASED: 'Completed & Paid', SETTLED: 'Completed & Paid' }} />
        </div>
      </div>

      {/* Job details */}
      <div className="card" style={{ marginBottom: 'var(--sp-4)' }}>
        <h2 style={{ fontWeight: 700, fontSize: 'var(--font-size-base)', marginBottom: 'var(--sp-4)' }}>Job Details</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)', fontSize: 'var(--font-size-sm)' }}>
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
            <span style={{ color: 'var(--gray-500)' }}>Schedule</span>
            <span style={{ fontWeight: 600 }}>{fmtTimestamp(job.startWindowEarliest)}</span>
          </div>
          {job.notesForWorker && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-1)' }}>
              <span style={{ color: 'var(--gray-500)' }}>Customer Notes</span>
              <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 'var(--radius-sm)', padding: 'var(--sp-3)', fontSize: 'var(--font-size-sm)' }}>
                {job.notesForWorker}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Earnings */}
      <div className="card" style={{ marginBottom: 'var(--sp-4)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--gray-400)', fontWeight: 600 }}>Your earnings</div>
          <div style={{ fontSize: 'var(--text-xl)', fontWeight: 900, color: 'var(--green)' }}>
            {fmtCAD(job.workerPayoutCAD)}
          </div>
        </div>
        <div style={{ fontSize: 12, color: 'var(--gray-400)', textAlign: 'right' }}>
          <div>Released after</div>
          <div style={{ fontWeight: 600 }}>homeowner approval</div>
          <div style={{ color: 'var(--gray-300)' }}>(auto-approves in 2 hrs)</div>
        </div>
      </div>

      {/* ESCROW_HELD: head to property */}
      {job.status === 'ESCROW_HELD' && (
        <div className="card">
          <h3 style={{ fontWeight: 700, fontSize: 14, marginBottom: 12 }}>Ready to start?</h3>
          <p style={{ fontSize: 13, color: 'var(--gray-500)', marginBottom: 16 }}>
            Tap Check In when you arrive at the property. The homeowner will be notified.
          </p>
          <button className="btn btn-primary btn-full btn-lg" onClick={handleCheckIn} disabled={submitting}>
            {submitting ? 'Checking in…' : '📍 Check In at Property'}
          </button>
        </div>
      )}

      {/* IN_PROGRESS: photo upload + complete */}
      {job.status === 'IN_PROGRESS' && (
        <div className="card">
          <h3 style={{ fontWeight: 700, fontSize: 14, marginBottom: 12 }}>Finishing up?</h3>

          <input
            type="file"
            id="photo-upload"
            accept="image/jpeg,image/png"
            style={{ display: 'none' }}
            onChange={handlePhotoChange}
            disabled={photoUploading || photoUploaded}
          />
          <label
            htmlFor="photo-upload"
            style={{
              display: 'block',
              border: `2px dashed ${photoUploaded ? 'var(--green)' : 'var(--gray-300)'}`,
              borderRadius: 'var(--radius-md)', padding: 'var(--sp-5)', textAlign: 'center',
              background: photoUploaded ? '#F0FDF4' : '#fff',
              cursor: photoUploaded ? 'default' : 'pointer',
              marginBottom: 'var(--sp-4)',
              opacity: photoUploading ? .6 : 1,
            }}
          >
            {photoUploaded ? (
              <>
                <div style={{ fontSize: 48, marginBottom: 'var(--sp-1)' }}>✅</div>
                <div style={{ fontWeight: 600, color: 'var(--green)', fontSize: 'var(--font-size-sm)' }}>Photo uploaded</div>
              </>
            ) : photoUploading ? (
              <>
                <div style={{ fontSize: 48, marginBottom: 'var(--sp-1)' }}>⏳</div>
                <div style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>Uploading…</div>
              </>
            ) : (
              <>
                <div style={{ fontSize: 48, marginBottom: 'var(--sp-1)' }}>📷</div>
                <div style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)', marginBottom: 'var(--sp-1)' }}>Upload completion photo</div>
                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--gray-400)' }}>JPEG or PNG · max 10 MB</div>
              </>
            )}
          </label>

          <button
            className="btn btn-primary btn-full btn-lg"
            onClick={handleComplete}
            disabled={!photoUploaded || submitting}
          >
            {submitting ? 'Saving…' : '✓ Mark Work Complete'}
          </button>
          {!photoUploaded && (
            <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--gray-400)', textAlign: 'center', marginTop: 'var(--sp-2)' }}>
              Upload a completion photo before marking as complete
            </p>
          )}
        </div>
      )}

      {/* PENDING_APPROVAL: waiting for homeowner */}
      {job.status === 'PENDING_APPROVAL' && (
        <div className="card" style={{ textAlign: 'center', background: '#F0FDF4', border: '1px solid #BBF7D0', marginBottom: 'var(--sp-4)' }}>
          <div style={{ fontSize: 60, marginBottom: 'var(--sp-2)' }}>🎉</div>
          <div style={{ fontWeight: 800, fontSize: 'var(--font-size-md)', color: 'var(--green)', marginBottom: 'var(--sp-1)' }}>Work submitted!</div>
          <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-500)', marginBottom: 'var(--sp-2)' }}>
            The homeowner has 2 hours to approve or raise a dispute.
          </div>
          <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)', fontWeight: 600 }}>
            Payment of {fmtCAD(job.workerPayoutCAD)} releases automatically after approval.
          </div>
        </div>
      )}

      {/* DISPUTED: admin reviewing */}
      {job.status === 'DISPUTED' && (
        <div className="card" style={{ textAlign: 'center', background: '#FFFBEB', border: '1px solid #FDE68A', marginBottom: 'var(--sp-4)' }}>
          <div style={{ fontSize: 60, marginBottom: 'var(--sp-2)' }}>⚠️</div>
          <div style={{ fontWeight: 800, fontSize: 'var(--font-size-md)', color: '#D97706', marginBottom: 'var(--sp-1)' }}>Dispute in progress</div>
          <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-500)' }}>
            The homeowner raised a dispute. Our admin team will review and reach out within 24 hours.
          </div>
        </div>
      )}

      {/* RELEASED / SETTLED */}
      {(job.status === 'RELEASED' || job.status === 'SETTLED') && (
        <div className="card" style={{ textAlign: 'center', background: '#F0FDF4', border: '1px solid #BBF7D0', marginBottom: 'var(--sp-4)' }}>
          <div style={{ fontSize: 60, marginBottom: 'var(--sp-2)' }}>💰</div>
          <div style={{ fontWeight: 800, fontSize: 'var(--font-size-md)', color: 'var(--green)', marginBottom: 'var(--sp-1)' }}>
            {job.status === 'SETTLED' ? 'Job settled' : 'Payment released'}
          </div>
          <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)', fontWeight: 600 }}>
            {fmtCAD(job.workerPayoutCAD)} sent to your account.
          </div>
        </div>
      )}

      {/* Rate the Requester — shown once work is complete */}
      {RATEABLE_STATUSES.includes(job.status) && (
        <div className="card">
          <h2 style={{ fontWeight: 700, fontSize: 'var(--font-size-base)', marginBottom: 'var(--sp-4)' }}>Rate this homeowner</h2>

          {ratingSubmitted ? (
            <div style={{ textAlign: 'center', padding: 'var(--sp-4) 0' }}>
              <div style={{ fontSize: 48, marginBottom: 'var(--sp-2)' }}>✓</div>
              <div style={{ fontWeight: 700, color: 'var(--green)' }}>Rating submitted — thanks!</div>
            </div>
          ) : (
            <>
              {/* Star widget */}
              <div style={{ display: 'flex', gap: 'var(--sp-2)', marginBottom: 'var(--sp-3)' }}>
                {[1, 2, 3, 4, 5].map(n => (
                  <button key={n} type="button"
                    onClick={() => setRatingStars(n)}
                    onMouseEnter={() => setRatingHover(n)}
                    onMouseLeave={() => setRatingHover(0)}
                    aria-label={`${n} star${n > 1 ? 's' : ''}`}
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      fontSize: 54, lineHeight: 1, padding: 3,
                      color: n <= (ratingHover || ratingStars) ? '#F6AD55' : 'var(--gray-200)',
                      transition: 'color .1s, transform .1s',
                      transform: n <= (ratingHover || ratingStars) ? 'scale(1.15)' : 'scale(1)',
                    }}
                  >★</button>
                ))}
              </div>
              {(ratingHover || ratingStars) > 0 && (
                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-500)', marginBottom: 'var(--sp-3)' }}>
                  {STAR_LABELS[ratingHover || ratingStars]}
                </div>
              )}

              <div className="field">
                <label className="label">Leave a comment (optional)</label>
                <textarea className="input" rows={3}
                  placeholder="Was the property accessible? Clear instructions? Paid promptly?"
                  value={ratingText}
                  onChange={e => setRatingText(e.target.value)}
                  maxLength={500}
                />
                <span style={{ fontSize: 11, color: 'var(--gray-400)', textAlign: 'right' }}>{ratingText.length}/500</span>
              </div>

              <div style={{ marginBottom: 'var(--sp-4)' }}>
                <div className="label" style={{ marginBottom: 8 }}>Would you work for them again?</div>
                <div style={{ display: 'flex', gap: 'var(--sp-3)' }}>
                  {[{ val: true, label: '👍 Yes' }, { val: false, label: '👎 No' }].map(({ val, label }) => (
                    <button key={String(val)} type="button"
                      onClick={() => setWouldRepeat(wouldRepeat === val ? null : val)}
                      className="btn"
                      style={{
                        background: wouldRepeat === val ? (val ? 'var(--green-bg)' : 'var(--red-bg)') : 'var(--gray-100)',
                        color:      wouldRepeat === val ? (val ? 'var(--green)'    : 'var(--red)')    : 'var(--gray-600)',
                        border: `1.5px solid ${wouldRepeat === val ? (val ? 'var(--green)' : 'var(--red)') : 'var(--gray-200)'}`,
                        fontWeight: 600,
                      }}
                    >{label}</button>
                  ))}
                </div>
              </div>

              {ratingError && <div className="alert alert-error" style={{ marginBottom: 'var(--sp-3)' }}>{ratingError}</div>}
              <button className="btn btn-primary btn-full" onClick={handleRateRequester} disabled={ratingSubmitting}>
                {ratingSubmitting ? 'Submitting…' : 'Submit Rating'}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}
