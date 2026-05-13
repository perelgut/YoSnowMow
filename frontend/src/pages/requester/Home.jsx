import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { listJobs } from '../../services/api'
import StatusPill from '../../components/StatusPill'
import logoColor from '../../assets/logo.png'

// Format a CAD dollar amount (double) returned by the backend.
const fmtCAD = amount => amount != null ? '$' + Number(amount).toFixed(2) : null

// Convert a backend scope array to a readable label.
const SCOPE_LABELS = { driveway: 'Driveway', sidewalk: 'Walkway / Sidewalk' }
const fmtScope = scope => scope?.map(s => SCOPE_LABELS[s] ?? s).join(' · ') ?? '—'

export default function RequesterHome() {
  const [jobs,    setJobs]    = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    listJobs()
      .then(data => setJobs(Array.isArray(data) ? data : []))
      .catch(err => console.error('[Home] Failed to load jobs:', err))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      {/* Hero */}
      <div style={{
        background: 'linear-gradient(135deg, #1A6FDB 0%, #0F4FA8 100%)',
        borderRadius: 16, padding: 'var(--sp-10) var(--sp-8)', marginBottom: 'var(--sp-8)',
        color: '#fff', textAlign: 'center',
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 'var(--sp-4)' }}>
          <img src={logoColor} alt="YoSnowMow" style={{ height: 360, width: 'auto' }} />
        </div>
        <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, marginBottom: 'var(--sp-2)' }}>Snow cleared or lawns mowed. Fast.</h1>
        <p style={{ opacity: .85, marginBottom: 'var(--sp-6)', fontSize: 'var(--text-md)' }}>Connect with a local worker in minutes.</p>
        <Link to="/requester/post-job" className="btn btn-lg" style={{ background: '#fff', color: '#1A6FDB' }}>
          ➕ Post a Job
        </Link>
      </div>

      {/* Jobs list */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--sp-4)' }}>
        <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 700 }}>My Jobs</h2>
        <Link to="/requester/post-job" className="btn btn-secondary btn-sm">+ New Job</Link>
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
              <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-4)', cursor: 'pointer', transition: 'box-shadow .15s' }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = 'var(--shadow)'}
                onMouseLeave={e => e.currentTarget.style.boxShadow = 'var(--shadow-sm)'}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, marginBottom: 'var(--sp-1)' }} className="truncate">
                    {job.propertyAddress?.fullText ?? '—'}
                  </div>
                  <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-400)' }}>
                    {fmtScope(job.scope)} &nbsp;·&nbsp; {job.jobId}
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
