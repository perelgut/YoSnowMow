import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { listJobs } from '../../services/api'
import useAuth from '../../hooks/useAuth'
import StatusPill from '../../components/StatusPill'

// Format a CAD amount (double from backend, may be null before pricing is set)
const fmtCAD = amount => amount != null ? '$' + Number(amount).toFixed(2) : '—'

// Convert scope array to readable label
const SCOPE_LABELS = { driveway: 'Driveway', sidewalk: 'Walkway / Sidewalk' }
const fmtScope = scope => scope?.map(s => SCOPE_LABELS[s] ?? s).join(' · ') ?? '—'

// Format a Firestore timestamp as "Jan 2025"
function fmtMemberSince(ts) {
  if (!ts) return ''
  try {
    const d = ts.seconds ? new Date(ts.seconds * 1000) : new Date(ts)
    return d.toLocaleString('en-CA', { month: 'short', year: 'numeric' })
  } catch { return '' }
}

export default function WorkerEarnings() {
  const { currentUser, userProfile } = useAuth()
  const location = useLocation()
  const showWelcome = location.state?.welcome === true

  const [jobs,        setJobs]        = useState([])
  const [loading,     setLoading]     = useState(true)
  const [expandedJob, setExpandedJob] = useState(null)

  useEffect(() => {
    listJobs()
      .then(data => setJobs(Array.isArray(data) ? data : []))
      .catch(err => console.error('[Earnings] Failed to load jobs:', err))
      .finally(() => setLoading(false))
  }, [])

  const worker = userProfile?.worker

  // Financial summaries — null-safe (pricing is null until worker accepts)
  const completedJobs  = jobs.filter(j => ['COMPLETE', 'RELEASED', 'SETTLED'].includes(j.status))
  const totalEarned    = completedJobs.reduce((sum, j) => sum + (j.workerPayoutCAD ?? 0), 0)
  const pendingJobs    = jobs.filter(j => ['CONFIRMED', 'IN_PROGRESS'].includes(j.status))
  const pendingAmount  = pendingJobs.reduce((sum, j) => sum + (j.workerPayoutCAD ?? 0), 0)

  const workerName   = userProfile?.name ?? currentUser?.displayName ?? 'Worker'
  const firstName    = workerName.split(' ')[0]
  const memberSince  = fmtMemberSince(userProfile?.createdAt)
  const rating       = worker?.rating
  const ratingStars  = Math.round(rating ?? 0)

  return (
    <div>
      {showWelcome && (
        <div className="alert alert-success" style={{ marginBottom: 'var(--sp-5)' }}>
          Welcome to YoSnowMow, {firstName}! Your registration is complete. Start accepting jobs from the Requests tab.
        </div>
      )}
      <h1 style={{ fontSize: 'var(--text-xl)', fontWeight: 800, marginBottom: 'var(--sp-6)' }}>Earnings</h1>

      {/* Stats row */}
      <div className="grid-3" style={{ marginBottom: 'var(--sp-6)' }}>
        {[
          { label: 'Total Earned', value: fmtCAD(totalEarned),  color: 'var(--green)'    },
          { label: 'Pending',      value: fmtCAD(pendingAmount), color: 'var(--blue)'     },
          { label: 'Jobs Done',    value: worker?.completedJobCount ?? 0, color: 'var(--gray-700)' },
        ].map(stat => (
          <div key={stat.label} className="card" style={{ textAlign: 'center', padding: 'var(--sp-5) var(--sp-4)' }}>
            <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: stat.color }}>{stat.value}</div>
            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--gray-400)', fontWeight: 600, marginTop: 'var(--sp-1)' }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Rating / profile card */}
      <div className="card" style={{ marginBottom: 'var(--sp-6)', display: 'flex', alignItems: 'center', gap: 'var(--sp-5)' }}>
        <div style={{ textAlign: 'center', flexShrink: 0 }}>
          <div style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 900, color: 'var(--blue)' }}>
            {rating != null ? Number(rating).toFixed(1) : '—'}
          </div>
          <div style={{ fontSize: 'var(--font-size-lg)', color: '#FBBF24', letterSpacing: -2 }}>
            {'★'.repeat(ratingStars)}{'☆'.repeat(5 - ratingStars)}
          </div>
          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--gray-400)', marginTop: 'var(--sp-1)' }}>Rating</div>
        </div>
        <div className="divider" style={{ width: 1, height: 90, margin: '0' }} />
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 'var(--font-size-base)', marginBottom: 'var(--sp-1)' }}>{workerName}</div>
          {memberSince && (
            <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-500)', marginBottom: 'var(--sp-1)' }}>
              Worker since {memberSince}
            </div>
          )}
          <span style={{ background: 'var(--green)', color: '#fff', padding: '3px 12px', borderRadius: 4, fontWeight: 600, fontSize: 'var(--font-size-xs)' }}>
            Background Checked ✓
          </span>
        </div>
      </div>

      {/* Job history */}
      <h2 style={{ fontSize: 'var(--text-md)', fontWeight: 700, marginBottom: 'var(--sp-4)' }}>Job History</h2>

      {loading ? (
        <div className="card" style={{ textAlign: 'center', padding: 'var(--sp-8)', color: 'var(--gray-400)' }}>
          Loading jobs…
        </div>
      ) : jobs.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 'var(--sp-8)', color: 'var(--gray-400)' }}>
          No jobs yet.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
          {jobs.map(job => {
            const isOpen = expandedJob === job.jobId
            const paid   = ['RELEASED', 'SETTLED'].includes(job.status)
            const platformFeeCAD = (job.tierPriceCAD != null && job.workerPayoutCAD != null)
              ? job.tierPriceCAD - job.workerPayoutCAD : null
            return (
              <div key={job.jobId} className="card" style={{ cursor: 'pointer' }}
                onClick={() => setExpandedJob(isOpen ? null : job.jobId)}
              >
                {/* Summary row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-4)' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)', marginBottom: 'var(--sp-1)' }} className="truncate">
                      {job.propertyAddress?.fullText ?? job.jobId}
                    </div>
                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--gray-400)' }}>
                      {fmtScope(job.scope)} · {job.jobId}
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 'var(--sp-1)', flexShrink: 0 }}>
                    <StatusPill status={job.status} labelOverrides={{ RELEASED: 'Completed & Paid', SETTLED: 'Completed & Paid' }} />
                    {job.workerPayoutCAD != null && (
                      <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 700, color: 'var(--green)' }}>
                        {fmtCAD(job.workerPayoutCAD)}
                      </span>
                    )}
                  </div>
                  <span style={{ color: 'var(--gray-300)', fontSize: 'var(--font-size-lg)', flexShrink: 0 }}>
                    {isOpen ? '▲' : '▼'}
                  </span>
                </div>

                {/* Expanded billing breakdown */}
                {isOpen && (
                  <div style={{ marginTop: 'var(--sp-4)', paddingTop: 'var(--sp-4)', borderTop: '1px solid var(--gray-100)', fontSize: 'var(--font-size-sm)' }}>
                    {job.totalAmountCAD != null ? (
                      <>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--sp-2)' }}>
                          <span style={{ color: 'var(--gray-500)' }}>Contracted price</span>
                          <span style={{ fontWeight: 600 }}>{fmtCAD(job.tierPriceCAD)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--sp-2)' }}>
                          <span style={{ color: 'var(--gray-500)' }}>HST (13%)</span>
                          <span style={{ fontWeight: 600 }}>+ {fmtCAD(job.hstAmountCAD)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--sp-2)', fontWeight: 700, borderTop: '1px solid var(--gray-200)', paddingTop: 'var(--sp-2)' }}>
                          <span>Total billed to customer</span>
                          <span>{fmtCAD(job.totalAmountCAD)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--sp-2)' }}>
                          <span style={{ color: 'var(--gray-500)' }}>Less platform fee (15%)</span>
                          <span style={{ color: 'var(--gray-500)' }}>− {fmtCAD(platformFeeCAD)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, borderTop: '1px solid var(--gray-200)', paddingTop: 'var(--sp-2)' }}>
                          <span>{paid ? 'Paid to you' : 'To be paid to you'}</span>
                          <span style={{ color: 'var(--green)', fontSize: 'var(--font-size-md)' }}>{fmtCAD(job.workerPayoutCAD)}</span>
                        </div>
                      </>
                    ) : (
                      <p style={{ color: 'var(--gray-400)', textAlign: 'center', padding: 'var(--sp-2) 0' }}>
                        Earnings confirmed when a worker accepts.
                      </p>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
