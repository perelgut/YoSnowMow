import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import useAuth from '../hooks/useAuth'
import logoColor from '../assets/logo.png'

export default function RequesterLayout() {
  const { userProfile, signOut } = useAuth()
  const navigate = useNavigate()
  const displayName = userProfile?.name || 'User'
  const initials = displayName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

  async function handleSignOut() {
    await signOut()
    navigate('/login', { replace: true })
  }

  return (
    <div style={{ minHeight: '100vh', paddingBottom: 'var(--nav-h)' }}>
      {/* Top header */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 50,
        minHeight: 'var(--header-h)', background: '#fff',
        borderBottom: '1px solid var(--gray-200)',
        display: 'flex', alignItems: 'center', padding: 'var(--sp-2) var(--sp-6)', gap: 'var(--sp-8)',
        boxShadow: 'var(--shadow-sm)',
      }}>
        <NavLink to="/requester" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
          <img src={logoColor} alt="YoSnowMow" style={{ height: 168, width: 'auto' }} />
        </NavLink>

        <nav className="hide-mobile" style={{ display: 'flex', gap: 'var(--sp-6)', flex: 1 }}>
          {[
            { to: '/requester', label: 'Home', end: true },
            { to: '/requester/post-job', label: 'Post a Job' },
            { to: '/requester/jobs', label: 'My Jobs' },
            { to: '/requester/property', label: 'My Property' },
          ].map(({ to, label, end }) => (
            <NavLink key={to} to={to} end={end} style={({ isActive }) => ({
              fontWeight: 600, fontSize: 14, color: isActive ? '#1A6FDB' : '#4A5568',
              borderBottom: isActive ? '2px solid #1A6FDB' : '2px solid transparent',
              paddingBottom: 2, transition: 'color .15s',
            })}>{label}</NavLink>
          ))}
        </nav>

        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 'var(--sp-3)' }}>
          {/* Notification bell — active jobs or messages */}
          <button aria-label="Notifications" style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: 20, lineHeight: 1, padding: 'var(--sp-1)',
            color: 'var(--gray-600)',
          }}>🔔</button>
          <span style={{ fontSize: 13, color: 'var(--gray-600)' }} className="hide-mobile">{displayName}</span>
          <NavLink to="/requester/property" style={{ textDecoration: 'none' }}>
            <div style={{
              width: 34, height: 34, borderRadius: '50%', background: '#1A6FDB',
              color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 13, fontWeight: 700, cursor: 'pointer',
            }}>{initials}</div>
          </NavLink>
          <button onClick={handleSignOut} style={{
            background: 'none', border: '1px solid var(--gray-300)', borderRadius: 6,
            padding: '4px 10px', fontSize: 12, color: 'var(--gray-600)', cursor: 'pointer',
          }}>Sign out</button>
        </div>
      </header>

      {/* Content */}
      <main style={{ maxWidth: 'var(--max-w)', margin: '0 auto', padding: 'var(--sp-6) var(--sp-6)' }}>
        <Outlet />
      </main>

      {/* Mobile bottom nav */}
      <nav className="hide-desktop" style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, height: 'var(--nav-h)',
        background: '#fff', borderTop: '1px solid var(--gray-200)',
        display: 'flex', zIndex: 50,
      }}>
        {[
          { to: '/requester', icon: '🏠', label: 'Home', end: true },
          { to: '/requester/post-job', icon: '➕', label: 'Post' },
          { to: '/requester/jobs', icon: '📋', label: 'Jobs' },
          { to: '/requester/property', icon: '📸', label: 'Property' },
        ].map(({ to, icon, label, end }) => (
          <NavLink key={to} to={to} end={end} style={({ isActive }) => ({
            flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', gap: 2, fontSize: 10, fontWeight: 600,
            color: isActive ? '#1A6FDB' : '#9AA5B4',
          })}>
            <span style={{ fontSize: 20 }}>{icon}</span>
            {label}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
