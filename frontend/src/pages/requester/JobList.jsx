import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { listJobs } from '../../services/api'
import StatusPill from '../../components/StatusPill'

const fmtCAD   = amount => amount != null ? '$' + Number(amount).toFixed(2) : null
const SCOPE_LABELS = { driveway: 'Driveway', sidewalk: 'Walkway / Sidewalk' }
const fmtScope = scope => scope?.map(s => SCOPE_LABELS[s] ?? s).join(' · ') ?? '—'

export default function JobList() {
  const [jobs,    setJobs]    = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    listJobs()
      .then(data => setJobs(Array.isArray(data) ? data : []))
      .catch(err => console.error('[JobList] Failed to load jobs:', err))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--sp-6)' }}>
        <h1 style={{ fontSize: 'var(--text-xl)', fontWeight: 800 }}>My Jobs</h1>
        <Link to="/requester/post-job" className="btn btn-primary btn-sm">+ New Job</Link>
      </div>

      {loading ? (
        <div className="card" style={{ textAlign: 'center', padding: 'var(--sp-10)', color: 'var(--gray-400)' }}>
          Loading jobs…
        </div>
      ) : jobs.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 'var(--sp-10)', color: 'var(--gray-400)' }}>
          <p>No jobs yet. Post your first job to get started.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
          {jobs.map(job => (
            <Link key={job.jobId} to={`/requester/jobs/${job.jobId}`} style={{ textDecoration: 'none' }}>
              <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-4)', cursor: 'pointer' }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = 'var(--shadow)'}
                onMouseLeave={e => e.currentTarget.style.boxShadow = 'var(--shadow-sm)'}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, marginBottom: 'var(--sp-1)' }} className="truncate">
                    {job.propertyAddress?.fullText ?? '—'}
                  </div>
                  <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-400)', marginBottom: 'var(--sp-1)' }}>
                    {fmtScope(job.scope)}
                  </div>
                  <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-400)' }}>
                    {job.jobId}
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 'var(--sp-1)', flexShrink: 0 }}>
                  <StatusPill status={job.status} labelOverrides={{ RELEASED: 'Worker Paid', SETTLED: 'Worker Paid' }} />
                  {fmtCAD(job.totalAmountCAD) && (
                    <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, color: 'var(--gray-600)' }}>
                      {fmtCAD(job.totalAmountCAD)}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
