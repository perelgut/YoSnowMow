import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { collection, query, where, onSnapshot, doc, updateDoc } from 'firebase/firestore'
import { db } from '../../services/firebase'
import { getJob, submitOffer } from '../../services/api'
import useAuth from '../../hooks/useAuth'
import Modal from '../../components/Modal'

// ── Constants ──────────────────────────────────────────────────────────────

const SCOPE_LABELS = { driveway: 'Driveway', sidewalk: 'Walkway / Sidewalk', both: 'Driveway + Walkway' }

// ── Distance helpers ───────────────────────────────────────────────────────

/** Haversine great-circle distance in kilometres. */
function haversineKm(lat1, lon1, lat2, lon2) {
  const R  = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a  = Math.sin(dLat / 2) ** 2
           + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180)
           * Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

/** Format a distance for display: under 1 km shows metres, ≥ 1 km shows X.X km. */
function fmtDistance(km) {
  if (km == null) return null
  return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`
}
const fmtScope = scope => scope?.map(s => SCOPE_LABELS[s] ?? s).join(', ') ?? '—'
const fmtCAD = cents => cents != null ? '$' + (cents / 100).toFixed(2) : '—'

// Offer statuses where the worker needs to take action (requester countered)
const NEEDS_RESPONSE = new Set(['COUNTERED'])
// Offer statuses that are "live" (not concluded)
const LIVE_STATUSES = new Set(['OPEN', 'COUNTERED', 'PHOTO_REQUESTED'])
// Offer statuses that are concluded
const DONE_STATUSES = new Set(['ACCEPTED', 'REJECTED', 'WITHDRAWN'])

// Notification types that indicate a new job opportunity for the worker
const JOB_NOTIFICATION_TYPES = new Set(['NEW_JOB_POSTED'])

// ── JobRequest page ─────────────────────────────────────────────────────────

export default function JobRequest() {
  const { currentUser, userProfile } = useAuth()

  // Offers the worker has already submitted (from Firestore jobOffers collection)
  const [myOffers, setMyOffers] = useState([])
  // Notifications about new jobs posted nearby (from notifications feed)
  const [jobNotifs, setJobNotifs] = useState([])
  // Cached job details by jobId
  const [jobCache, setJobCache] = useState({})
  // Counter-offer modal state
  const [counterModal, setCounterModal] = useState(null) // { jobId, workerId, currentPrice, mode: 'new'|'respond' }
  const [counterPrice, setCounterPrice] = useState('')
  const [counterNote, setCounterNote] = useState('')
  const [submitting, setSubmitting] = useState(null) // jobId being acted on
  // null when closed; { photos: string[], index: number } when open
  const [photoModal, setPhotoModal] = useState(null)

  const uid = currentUser?.uid

  // ── Real-time listener: worker's own offers ──────────────────────────────
  useEffect(() => {
    if (!uid) return
    const q = query(collection(db, 'jobOffers'), where('workerId', '==', uid))
    return onSnapshot(q, snap => {
      setMyOffers(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    }, err => console.error('[JobRequest] jobOffers listener error:', err))
  }, [uid])

  // ── Real-time listener: all POSTED jobs (direct browse) ──────────────────
  const [postedJobs, setPostedJobs] = useState([])
  useEffect(() => {
    const q = query(collection(db, 'jobs'), where('status', '==', 'POSTED'))
    return onSnapshot(q, snap => {
      setPostedJobs(snap.docs.map(d => ({ ...d.data(), jobId: d.id })))
    }, err => console.error('[JobRequest] posted jobs listener error:', err))
  }, [])

  // ── Real-time listener: notification feed ─────────────────────────────────
  useEffect(() => {
    if (!uid) return
    const feedRef = collection(db, 'notifications', uid, 'feed')
    const q = query(feedRef, where('isRead', '==', false))
    return onSnapshot(q, snap => {
      const jobNotifications = snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .filter(n => JOB_NOTIFICATION_TYPES.has(n.type) && n.data?.jobId)
      setJobNotifs(jobNotifications)
    }, err => console.error('[JobRequest] notification feed error:', err))
  }, [uid])

  // ── Fetch job details for any jobId not yet cached ───────────────────────
  useEffect(() => {
    const offerJobIds  = myOffers.map(o => o.jobId).filter(Boolean)
    const notifJobIds  = jobNotifs.map(n => n.data?.jobId).filter(Boolean)
    const allJobIds    = [...new Set([...offerJobIds, ...notifJobIds])]
    const missing      = allJobIds.filter(id => !jobCache[id])

    if (missing.length === 0) return

    missing.forEach(jobId => {
      getJob(jobId)
        .then(job => setJobCache(prev => ({ ...prev, [jobId]: job })))
        .catch(err => {
          console.warn('[JobRequest] Could not load job', jobId, err.message)
          // Mark as failed so we don't retry on every render
          setJobCache(prev => ({ ...prev, [jobId]: { _error: true, jobId } }))
        })
    })
  }, [myOffers, jobNotifs, jobCache])

  // ── Derived data ──────────────────────────────────────────────────────────

  // Jobs from notifications where the worker has NOT yet submitted an offer
  const offerJobIds = new Set(myOffers.map(o => o.jobId))
  const newOpportunities = jobNotifs
    .filter(n => !offerJobIds.has(n.data?.jobId))
    .reduce((acc, n) => {
      if (!acc.find(x => x.data?.jobId === n.data?.jobId)) acc.push(n)
      return acc
    }, []) // deduplicate by jobId

  // Active offers: submitted but not concluded
  const activeOffers = myOffers.filter(o => LIVE_STATUSES.has(o.status))
  // Concluded offers: rejected or withdrawn
  const doneOffers   = myOffers.filter(o => DONE_STATUSES.has(o.status))

  // ── Handlers ─────────────────────────────────────────────────────────────

  async function handleAccept(jobId, priceCents) {
    setSubmitting(jobId)
    try {
      await submitOffer(jobId, { action: 'accept', priceCents })
      markJobNotificationsRead(jobId)
    } catch (err) {
      alert(err.response?.data?.detail ?? 'Could not accept — please try again.')
    } finally {
      setSubmitting(null)
    }
  }

  function openCounterModal(jobId, currentPrice, mode = 'new') {
    setCounterPrice(String(Math.round((currentPrice ?? 0) / 100)))
    setCounterNote('')
    setCounterModal({ jobId, currentPrice, mode })
  }

  async function handleSubmitCounter() {
    if (!counterModal) return
    const { jobId } = counterModal
    const priceCents = Math.round(parseFloat(counterPrice) * 100)
    if (!priceCents || priceCents < 100) {
      alert('Please enter a valid amount (minimum $1.00)')
      return
    }
    setSubmitting(jobId)
    setCounterModal(null)
    try {
      await submitOffer(jobId, { action: 'counter', priceCents, note: counterNote || undefined })
      markJobNotificationsRead(jobId)
    } catch (err) {
      alert(err.response?.data?.detail ?? 'Could not submit counter — please try again.')
    } finally {
      setSubmitting(null)
    }
  }

  async function handleWithdraw(jobId) {
    if (!window.confirm('Withdraw your offer on this job?')) return
    setSubmitting(jobId)
    try {
      await submitOffer(jobId, { action: 'withdraw' })
    } catch (err) {
      alert(err.response?.data?.detail ?? 'Could not withdraw — please try again.')
    } finally {
      setSubmitting(null)
    }
  }

  // Mark all job-related notifications for a jobId as read
  function markJobNotificationsRead(jobId) {
    if (!uid) return
    jobNotifs
      .filter(n => n.data?.jobId === jobId)
      .forEach(n => {
        updateDoc(doc(db, 'notifications', uid, 'feed', n.id), { isRead: true })
          .catch(err => console.warn('[JobRequest] Failed to mark notification read:', err))
      })
  }

  // ── Render ────────────────────────────────────────────────────────────────

  // Worker's base location and service radius for distance filtering
  const baseCoords     = userProfile?.worker?.baseCoords
  const radiusKm       = userProfile?.worker?.serviceRadiusKm ?? Infinity

  // Compute distance from worker base to each posted job, then filter by radius.
  // Jobs without coords are always shown (geocoding may still be in progress).
  const browsableJobs = postedJobs
    .filter(j => !offerJobIds.has(j.jobId))
    .map(j => {
      const pc = j.propertyCoords
      const distKm = (baseCoords && pc)
        ? haversineKm(baseCoords.latitude, baseCoords.longitude, pc.latitude, pc.longitude)
        : null
      return { ...j, _distKm: distKm }
    })
    .filter(j => j._distKm == null || j._distKm <= radiusKm)
    .sort((a, b) => (a._distKm ?? Infinity) - (b._distKm ?? Infinity))

  const isEmpty = newOpportunities.length === 0 && activeOffers.length === 0 && browsableJobs.length === 0

  return (
    <div style={{ maxWidth: 520, margin: '0 auto' }}>
      <h1 style={{ fontSize: 'var(--text-xl)', fontWeight: 800, marginBottom: 'var(--sp-6)' }}>
        Job Offers
      </h1>

      {/* ── Active / pending offers ──────────────────────────────────────── */}
      {activeOffers.length > 0 && (
        <section style={{ marginBottom: 'var(--sp-6)' }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: .5, marginBottom: 'var(--sp-3)' }}>
            My Active Offers
          </h2>
          {activeOffers.map(offer => (
            <OfferCard
              key={offer.id}
              offer={offer}
              job={jobCache[offer.jobId]}
              submitting={submitting === offer.jobId}
              onAccept={priceCents => handleAccept(offer.jobId, priceCents)}
              onCounter={() => openCounterModal(offer.jobId, offer.requesterPriceCents ?? offer.workerPriceCents, 'respond')}
              onWithdraw={() => handleWithdraw(offer.jobId)}
            />
          ))}
        </section>
      )}

      {/* ── New job opportunities ─────────────────────────────────────────── */}
      {newOpportunities.length > 0 && (
        <section style={{ marginBottom: 'var(--sp-6)' }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: .5, marginBottom: 'var(--sp-3)' }}>
            New Nearby Jobs
          </h2>
          {newOpportunities.map(notif => {
            const jobId = notif.data?.jobId
            const job   = jobCache[jobId]
            return (
              <OpportunityCard
                key={notif.id}
                notif={notif}
                job={job}
                submitting={submitting === jobId}
                onAccept={() => handleAccept(jobId, notif.data?.price ? parseInt(notif.data.price) : null)}
                onCounter={() => openCounterModal(jobId, notif.data?.price ? parseInt(notif.data.price) : 0, 'new')}
              />
            )
          })}
        </section>
      )}

      {/* ── Browse available POSTED jobs (direct Firestore query) ─────────── */}
      {browsableJobs.length > 0 && (
        <section style={{ marginBottom: 'var(--sp-6)' }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: .5, marginBottom: 'var(--sp-3)' }}>
            Available Jobs
          </h2>
          {browsableJobs.map(job => (
            <div key={job.jobId} className="card" style={{ marginBottom: 'var(--sp-3)', padding: 'var(--sp-4)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--sp-2)' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{job.propertyAddress?.fullText ?? 'Address pending'}</div>
                  <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-500)', marginTop: 'var(--sp-1)' }}>
                    {job.scope?.join(', ') ?? '—'}
                    {job.postedPriceCents ? ` · $${(job.postedPriceCents / 100).toFixed(2)} posted` : ''}
                  </div>
                </div>
                {job._distKm != null && (
                  <div style={{
                    flexShrink: 0, marginLeft: 'var(--sp-3)',
                    background: 'var(--blue-light)', color: 'var(--blue-dark)',
                    borderRadius: 'var(--radius-lg)', padding: '3px 15px', fontSize: 'var(--font-size-xs)', fontWeight: 700,
                    whiteSpace: 'nowrap',
                  }}>
                    {fmtDistance(job._distKm)}
                  </div>
                )}
              </div>
              {job.notesForWorker && (
                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)', marginBottom: 'var(--sp-3)' }}>{job.notesForWorker}</p>
              )}
              {/* Photo strip */}
              {job.photoUrls?.length > 0 && (
                <div style={{ borderTop: '1px solid var(--gray-100)', paddingTop: 'var(--sp-2)', marginTop: 'var(--sp-2)', marginBottom: 'var(--sp-2)' }}>
                  <p style={{
                    fontSize: 'var(--font-size-xs)', color: 'var(--gray-400)',
                    fontWeight: 600, letterSpacing: '0.06em',
                    marginBottom: 'var(--sp-2)',
                  }}>
                    PHOTOS
                  </p>
                  <div style={{ display: 'flex', gap: 'var(--sp-2)', flexWrap: 'wrap' }}>
                    {job.photoUrls.slice(0, 5).map((url, i) => (
                      <button
                        key={url}
                        onClick={() => setPhotoModal({ photos: job.photoUrls, index: i })}
                        style={{ padding: 0, border: 'none', borderRadius: 'var(--radius-md)', cursor: 'pointer', background: 'none', flexShrink: 0 }}
                      >
                        <img
                          src={url}
                          alt={`Job photo ${i + 1}`}
                          style={{ width: 56, height: 56, objectFit: 'cover', borderRadius: 'var(--radius-md)', border: '1px solid var(--gray-200)', display: 'block' }}
                        />
                      </button>
                    ))}
                    {job.photoUrls.length > 5 && (
                      <button
                        onClick={() => setPhotoModal({ photos: job.photoUrls, index: 5 })}
                        style={{
                          width: 56, height: 56, borderRadius: 'var(--radius-md)',
                          background: 'var(--gray-200)', border: 'none', cursor: 'pointer',
                          fontSize: 'var(--font-size-xs)', fontWeight: 700, color: 'var(--gray-600)',
                        }}
                      >
                        +{job.photoUrls.length - 5}
                      </button>
                    )}
                  </div>
                </div>
              )}
              <div style={{ display: 'flex', gap: 'var(--sp-2)' }}>
                <button className="btn btn-primary" disabled={submitting === job.jobId}
                  onClick={() => openCounterModal(job.jobId, job.postedPriceCents ?? 0, 'new')}
                  style={{ flex: 1 }}>
                  Make Offer
                </button>
                {job.postedPriceCents && (
                  <button className="btn btn-secondary" disabled={submitting === job.jobId}
                    onClick={() => handleAccept(job.jobId, job.postedPriceCents)}
                    style={{ flex: 1 }}>
                    Accept Price
                  </button>
                )}
              </div>
            </div>
          ))}
        </section>
      )}

      {/* ── Empty state ─────────────────────────────────────────────────── */}
      {isEmpty && (
        <div className="card" style={{ textAlign: 'center', padding: 'var(--sp-10)', color: 'var(--gray-400)' }}>
          <div style={{ fontSize: 72, marginBottom: 'var(--sp-3)' }}>🔔</div>
          <p style={{ fontWeight: 600, marginBottom: 'var(--sp-2)' }}>No job opportunities right now</p>
          <p style={{ fontSize: 'var(--font-size-sm)' }}>
            When a homeowner posts a job in your service area, you'll be notified here.
          </p>
        </div>
      )}

      {/* ── Concluded offers (collapsed) ─────────────────────────────────── */}
      {doneOffers.length > 0 && (
        <section>
          <h2 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, color: 'var(--gray-400)', marginBottom: 'var(--sp-2)' }}>
            Concluded ({doneOffers.length})
          </h2>
          {doneOffers.map(offer => (
            <div key={offer.id} className="card" style={{ padding: 'var(--sp-3) var(--sp-4)', marginBottom: 'var(--sp-2)', opacity: .65, display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-size-sm)' }}>
              <span style={{ color: 'var(--gray-600)' }}>{jobCache[offer.jobId]?.jobId ?? offer.jobId}</span>
              <span style={{ fontWeight: 600, color: offer.status === 'REJECTED' ? 'var(--red)' : 'var(--gray-400)' }}>
                {offer.status}
              </span>
            </div>
          ))}
        </section>
      )}

      {/* ── Counter-offer modal ───────────────────────────────────────────── */}
      <Modal
        isOpen={!!counterModal}
        onClose={() => setCounterModal(null)}
        title={counterModal?.mode === 'respond' ? 'Respond with Counter' : 'Make a Counter Offer'}
        size="sm"
      >
        {counterModal && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
            <div>
              <label style={{ display: 'block', fontWeight: 600, fontSize: 'var(--font-size-sm)', marginBottom: 'var(--sp-2)' }}>
                Your price (CAD)
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)' }}>
                <span style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700 }}>$</span>
                <input
                  type="number"
                  min="1"
                  step="0.01"
                  value={counterPrice}
                  onChange={e => setCounterPrice(e.target.value)}
                  style={{ flex: 1, padding: 'var(--sp-3) var(--sp-4)', fontSize: 'var(--font-size-lg)', fontWeight: 700, border: '2px solid var(--blue)', borderRadius: 'var(--radius-md)' }}
                  autoFocus
                />
              </div>
              <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--gray-400)', marginTop: 'var(--sp-1)' }}>
                After {counterModal.mode === 'respond'
                  ? `requester's counter of ${fmtCAD(counterModal.currentPrice)}`
                  : `their posted price of ${fmtCAD(counterModal.currentPrice)}`
                }
              </p>
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: 600, fontSize: 'var(--font-size-sm)', marginBottom: 'var(--sp-2)' }}>
                Note to requester (optional)
              </label>
              <textarea
                value={counterNote}
                onChange={e => setCounterNote(e.target.value)}
                maxLength={500}
                rows={3}
                style={{ width: '100%', padding: 'var(--sp-3)', borderRadius: 'var(--radius-md)', border: '1px solid var(--gray-300)', resize: 'vertical', fontFamily: 'inherit', fontSize: 'var(--font-size-sm)', boxSizing: 'border-box' }}
                placeholder="Explain your pricing, availability, etc."
              />
            </div>
            <div style={{ display: 'flex', gap: 'var(--sp-3)' }}>
              <button className="btn btn-ghost" onClick={() => setCounterModal(null)} style={{ flex: '0 0 auto' }}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleSubmitCounter} style={{ flex: 1 }}>
                Send Counter Offer
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Full-size photo modal */}
      {photoModal && (
        <Modal
          isOpen={true}
          onClose={() => setPhotoModal(null)}
          title={`Photo ${photoModal.index + 1} of ${photoModal.photos.length}`}
        >
          <div style={{ background: '#111', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
            <img
              src={photoModal.photos[photoModal.index]}
              alt={`Photo ${photoModal.index + 1}`}
              style={{ width: '100%', maxHeight: '60vh', objectFit: 'contain', display: 'block' }}
            />
            {photoModal.photos.length > 1 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--sp-3)' }}>
                <button
                  onClick={() => setPhotoModal(m => ({ ...m, index: Math.max(0, m.index - 1) }))}
                  disabled={photoModal.index === 0}
                  style={{
                    background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 'var(--radius-md)',
                    padding: 'var(--sp-2) var(--sp-3)', color: '#fff', cursor: 'pointer',
                    fontWeight: 700, fontSize: 'var(--font-size-sm)',
                    opacity: photoModal.index === 0 ? 0.3 : 1,
                  }}
                >← Prev</button>
                <span style={{ color: '#ccc', fontSize: 'var(--font-size-xs)' }}>
                  {photoModal.index + 1} / {photoModal.photos.length}
                </span>
                <button
                  onClick={() => setPhotoModal(m => ({ ...m, index: Math.min(m.photos.length - 1, m.index + 1) }))}
                  disabled={photoModal.index === photoModal.photos.length - 1}
                  style={{
                    background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 'var(--radius-md)',
                    padding: 'var(--sp-2) var(--sp-3)', color: '#fff', cursor: 'pointer',
                    fontWeight: 700, fontSize: 'var(--font-size-sm)',
                    opacity: photoModal.index === photoModal.photos.length - 1 ? 0.3 : 1,
                  }}
                >Next →</button>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  )
}

// ── Sub-components ───────────────────────────────────────────────────────────

/**
 * Card for a new job opportunity (no offer submitted yet).
 */
// Job statuses that still accept new offers from workers
const OFFER_OPEN_STATUSES = new Set(['POSTED', 'NEGOTIATING'])

function OpportunityCard({ notif, job, submitting, onAccept, onCounter }) {
  const postedCents = notif.data?.price ? parseInt(notif.data.price) : null
  const hasJob      = job && !job._error
  // Once the job is loaded, check whether it's still accepting offers.
  // While loading (job == null) we optimistically show buttons; on error we also show them.
  const isOpen      = !hasJob || OFFER_OPEN_STATUSES.has(job.status)

  return (
    <div className="card" style={{ marginBottom: 'var(--sp-4)', borderLeft: `4px solid ${isOpen ? 'var(--blue)' : 'var(--gray-300)'}` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--sp-3)' }}>
        <div>
          <span style={{ fontSize: 11, fontWeight: 700, color: isOpen ? 'var(--blue)' : 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: .5 }}>
            {isOpen ? '🔔 New Job Nearby' : 'Job no longer available'}
          </span>
          <h3 style={{ fontWeight: 700, fontSize: 15, marginTop: 4 }}>
            {hasJob ? fmtScope(job.scope) : 'Snow clearing nearby'}
          </h3>
          {hasJob && job.notesForWorker && isOpen && (
            <p style={{ fontSize: 13, color: 'var(--gray-500)', marginTop: 4 }}>{job.notesForWorker}</p>
          )}
        </div>
        {postedCents != null && isOpen && (
          <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 'var(--sp-4)' }}>
            <div style={{ fontSize: 11, color: 'var(--gray-400)', fontWeight: 600 }}>Posted price</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: 'var(--green)' }}>{fmtCAD(postedCents)}</div>
          </div>
        )}
      </div>

      {isOpen ? (
        <>
          {/* Address hidden until ESCROW_HELD — show area note */}
          <p style={{ fontSize: 12, color: 'var(--gray-400)', marginBottom: 'var(--sp-4)' }}>
            📍 Address revealed once your offer is agreed and escrow is paid
          </p>
          <div style={{ display: 'flex', gap: 'var(--sp-2)' }}>
            <button
              className="btn btn-ghost"
              onClick={onCounter}
              disabled={submitting}
              style={{ flex: '0 0 auto' }}
            >
              Counter
            </button>
            <button
              className="btn btn-primary"
              onClick={onAccept}
              disabled={submitting || postedCents == null}
              style={{ flex: 1 }}
            >
              {submitting ? 'Submitting…' : `✓ Accept ${postedCents != null ? fmtCAD(postedCents) : ''}`}
            </button>
          </div>
        </>
      ) : (
        <p style={{ fontSize: 13, color: 'var(--gray-400)' }}>
          This job has been filled or cancelled.
        </p>
      )}
    </div>
  )
}

/**
 * Card for an already-submitted offer, showing its current status.
 */
function OfferCard({ offer, job, submitting, onAccept, onCounter, onWithdraw }) {
  const navigate      = useNavigate()
  const hasJob        = job && !job._error
  const needsResponse = NEEDS_RESPONSE.has(offer.status)
  const isAccepted    = offer.status === 'ACCEPTED'

  // Status pill styling
  const statusStyle = {
    OPEN:             { bg: '#EFF6FF', color: '#1A6FDB', label: 'Offer sent — awaiting response' },
    COUNTERED:        { bg: '#FFFBEB', color: '#B45309', label: '⚡ Requester countered — respond now' },
    PHOTO_REQUESTED:  { bg: '#F5F3FF', color: '#7C3AED', label: 'Photo requested' },
    ACCEPTED:         { bg: '#ECFDF5', color: '#059669', label: '✓ Offer agreed — awaiting escrow' },
    REJECTED:         { bg: '#FEF2F2', color: '#DC2626', label: 'Offer rejected' },
    WITHDRAWN:        { bg: '#F9FAFB', color: '#6B7280', label: 'Withdrawn' },
  }
  const s = statusStyle[offer.status] ?? { bg: '#F9FAFB', color: '#6B7280', label: offer.status }

  return (
    <div className="card" style={{ marginBottom: 'var(--sp-4)', borderLeft: `4px solid ${s.color}` }}>
      {/* Status banner */}
      <div style={{ background: s.bg, color: s.color, borderRadius: 6, padding: '6px 10px', fontSize: 13, fontWeight: 600, marginBottom: 'var(--sp-3)' }}>
        {s.label}
      </div>

      {/* Job summary */}
      <div style={{ fontSize: 14, marginBottom: 'var(--sp-3)' }}>
        <div style={{ fontWeight: 700, marginBottom: 4 }}>
          {hasJob ? fmtScope(job.scope) : 'Snow clearing'}
        </div>
      </div>

      {/* Price thread */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 13, marginBottom: 'var(--sp-3)' }}>
        {offer.workerPriceCents != null && (
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--gray-500)' }}>Your offer</span>
            <span style={{ fontWeight: 700 }}>{fmtCAD(offer.workerPriceCents)}</span>
          </div>
        )}
        {offer.requesterPriceCents != null && (
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--gray-500)' }}>Requester counter</span>
            <span style={{ fontWeight: 700, color: '#B45309' }}>{fmtCAD(offer.requesterPriceCents)}</span>
          </div>
        )}
      </div>

      {/* Notes */}
      {offer.workerNote && (
        <p style={{ fontSize: 12, color: 'var(--gray-500)', marginBottom: 'var(--sp-2)', fontStyle: 'italic' }}>
          Your note: "{offer.workerNote}"
        </p>
      )}

      {/* Actions — only for offers that need a response */}
      {needsResponse && offer.requesterPriceCents != null && (
        <div style={{ display: 'flex', gap: 'var(--sp-2)', marginTop: 'var(--sp-2)' }}>
          <button className="btn btn-ghost" onClick={onCounter} disabled={submitting} style={{ flex: '0 0 auto' }}>
            Counter Again
          </button>
          <button
            className="btn btn-primary"
            onClick={() => onAccept(offer.requesterPriceCents)}
            disabled={submitting}
            style={{ flex: 1 }}
          >
            {submitting ? 'Accepting…' : `✓ Accept ${fmtCAD(offer.requesterPriceCents)}`}
          </button>
        </div>
      )}

      {/* Withdraw for open offers */}
      {offer.status === 'OPEN' && (
        <button
          className="btn btn-ghost"
          onClick={onWithdraw}
          disabled={submitting}
          style={{ fontSize: 12, color: 'var(--gray-400)', marginTop: 'var(--sp-2)' }}
        >
          Withdraw offer
        </button>
      )}

      {/* Agreed state — waiting for escrow, or escrow paid and ready to start */}
      {isAccepted && (
        <div style={{ marginTop: 'var(--sp-2)' }}>
          {job?.status === 'ESCROW_HELD' ? (
            <>
              <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 6, padding: '10px 12px', marginBottom: 'var(--sp-2)', fontSize: 13, color: '#059669' }}>
                ✓ Agreed at {fmtCAD(offer.workerPriceCents)}. Escrow paid — ready to start!
              </div>
              <button
                className="btn btn-primary btn-full"
                onClick={() => navigate('/worker/active-job')}
              >
                Go to Active Job →
              </button>
            </>
          ) : (
            <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 6, padding: '10px 12px', fontSize: 13, color: '#059669' }}>
              ✓ Agreed at {fmtCAD(offer.workerPriceCents)}. Waiting for the homeowner to pay escrow — you'll be notified when the job is confirmed.
            </div>
          )}
        </div>
      )}
    </div>
  )
}
