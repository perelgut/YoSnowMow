import { useNavigate } from 'react-router-dom'
import Modal from '../../components/Modal'

// ─── Star renderer ─────────────────────────────────────────────────────────────

function Stars({ rating, size = 16 }) {
  const full  = Math.floor(rating ?? 0)
  const empty = 5 - full
  return (
    <span style={{ fontSize: size, color: '#F6AD55', letterSpacing: 1 }}>
      {'★'.repeat(full)}{'☆'.repeat(empty)}
    </span>
  )
}

// ─── Badge definitions ─────────────────────────────────────────────────────────

const BADGE_META = {
  VERIFIED:    { icon: '✓', label: 'Background Checked', tooltip: 'Criminal background check passed', color: '#1A6FDB', bg: '#EBF3FF' },
  INSURED:     { icon: '🛡', label: 'Insured',            tooltip: 'Liability insurance on file',      color: '#27AE60', bg: '#EAFAF1' },
  TOP_RATED:   { icon: '★', label: 'Top Rated',           tooltip: '4.8+ rating with 25+ jobs',        color: '#D4A017', bg: '#FEF9E7' },
  EXPERIENCED: { icon: '◆', label: 'Experienced',         tooltip: '100+ jobs completed',               color: '#8E44AD', bg: '#F5EEF8' },
}

function TrustBadge({ badgeId }) {
  const meta = BADGE_META[badgeId]
  if (!meta) return null
  return (
    <span title={meta.tooltip} style={{
      fontSize: 'var(--font-size-xs)', fontWeight: 600, padding: '5px 15px', borderRadius: 20,
      background: meta.bg, color: meta.color, border: `1px solid ${meta.color}`, cursor: 'default',
    }}>
      {meta.icon} {meta.label}
    </span>
  )
}

function fmtDate(ts) {
  if (!ts) return ''
  try {
    const d = ts.seconds ? new Date(ts.seconds * 1000) : new Date(ts)
    return d.toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' })
  } catch { return '' }
}

// ─── Shared profile content ────────────────────────────────────────────────────

/**
 * @param {object} worker     Public worker profile from getWorkerPublicProfile()
 * @param {Array}  jobRatings Ratings for the current job (from getRatings(jobId))
 */
function WorkerProfileContent({ worker, jobRatings = [] }) {
  const displayName   = worker?.displayName   ?? 'Worker'
  const avgRating     = worker?.averageRating ?? 0
  const jobsCompleted = worker?.totalJobsCompleted ?? 0
  const badges        = worker?.badges        ?? ['VERIFIED']

  // Rating this requester left for the worker (raterRole = REQUESTER)
  const myReview = jobRatings.find(r => r.raterRole === 'REQUESTER')

  const initials = displayName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>

      {/* Header */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-4)' }}>
          <div style={{
            width: 96, height: 96, borderRadius: '50%',
            background: 'var(--blue)', color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 'var(--font-size-xl)', fontWeight: 700, flexShrink: 0,
          }}>
            {initials}
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 'var(--font-size-lg)' }}>{displayName}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)', marginTop: 'var(--sp-1)' }}>
              <Stars rating={avgRating} size={24} />
              <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, color: 'var(--gray-700)' }}>
                {avgRating > 0 ? avgRating.toFixed(1) : 'No rating yet'}
              </span>
            </div>
            <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-500)', marginTop: 'var(--sp-1)' }}>
              {jobsCompleted} job{jobsCompleted !== 1 ? 's' : ''} completed
            </div>
          </div>
        </div>

        {badges.length > 0 && (
          <div style={{ display: 'flex', gap: 'var(--sp-2)', flexWrap: 'wrap' }}>
            {badges.map(id => <TrustBadge key={id} badgeId={id} />)}
          </div>
        )}
      </div>

      {/* Your review of this worker */}
      {myReview && (
        <div className="card" style={{ background: 'var(--blue-light)', border: '1.5px solid var(--blue)' }}>
          <h3 style={{ fontWeight: 700, fontSize: 'var(--font-size-sm)', marginBottom: 'var(--sp-3)', color: 'var(--blue)' }}>
            Your Review
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--sp-2)' }}>
            <Stars rating={myReview.stars} size={24} />
            {myReview.createdAt && (
              <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--gray-400)' }}>{fmtDate(myReview.createdAt)}</span>
            )}
          </div>
          {myReview.reviewText ? (
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-700)', lineHeight: 1.5, margin: `0 0 var(--sp-1)` }}>
              "{myReview.reviewText}"
            </p>
          ) : (
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-400)', fontStyle: 'italic' }}>No written review</p>
          )}
          {myReview.wouldRepeat != null && (
            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--gray-500)', marginTop: 'var(--sp-2)' }}>
              {myReview.wouldRepeat ? '👍 Would hire again' : '👎 Would not hire again'}
            </div>
          )}
        </div>
      )}

    </div>
  )
}

// ─── Standalone page ──────────────────────────────────────────────────────────

export default function WorkerProfile() {
  const navigate = useNavigate()
  return (
    <div style={{ maxWidth: 600, margin: '0 auto' }}>
      <button
        onClick={() => navigate(-1)}
        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 'var(--font-size-sm)', color: 'var(--gray-400)', marginBottom: 'var(--sp-5)', padding: 0 }}
      >
        ← Back
      </button>
      <WorkerProfileContent />
    </div>
  )
}

// ─── Modal wrapper (named export) ─────────────────────────────────────────────

export function WorkerProfileModal({ isOpen, onClose, worker, jobRatings }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Worker Profile" size="lg">
      <WorkerProfileContent worker={worker} jobRatings={jobRatings} />
    </Modal>
  )
}
