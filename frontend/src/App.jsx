import { Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom'
import useAuth          from './hooks/useAuth'
import RequesterLayout from './layouts/RequesterLayout'
import WorkerLayout from './layouts/WorkerLayout'
import AdminLayout from './layouts/AdminLayout'

import RequesterHome from './pages/requester/Home'
import PostJob from './pages/requester/PostJob'
import JobList from './pages/requester/JobList'
import JobStatus from './pages/requester/JobStatus'
import RateWorker from './pages/requester/RateWorker'
import WorkerProfile from './pages/requester/WorkerProfile'
import Property from './pages/requester/Property'

import WorkerEarnings from './pages/worker/Earnings'
import JobRequest from './pages/worker/JobRequest'
import ActiveJob from './pages/worker/ActiveJob'
import Register from './pages/worker/Register'

import AdminDashboard from './pages/admin/Dashboard'
import AdminJobDetail from './pages/admin/JobDetail'
import Analytics from './pages/admin/Analytics'

import Login from './pages/auth/Login'
import Signup from './pages/auth/Signup'

/**
 * Role-aware default redirect. Waits for auth to resolve before choosing
 * a destination — prevents an admin landing on /requester just because
 * the root redirect fired before the token was ready.
 */
function DefaultRedirect() {
  const { currentUser, userProfile, loading } = useAuth()
  if (loading) return null
  if (!currentUser) return <Navigate to="/login" replace />
  const roles = userProfile?.roles ?? []
  if (roles.includes('admin'))                                   return <Navigate to="/admin"     replace />
  if (roles.includes('worker') && !roles.includes('requester')) return <Navigate to="/worker"    replace />
  return <Navigate to="/requester" replace />
}

/**
 * ProtectedRoute — renders its children only when the user is signed in.
 *
 * While the initial auth state is loading, renders nothing (prevents a
 * flash of the login page on hard reload).  Once resolved, unauthenticated
 * users are redirected to /login; the current path is passed via
 * location.state.from so Login can redirect them back after sign-in.
 */
function ProtectedRoute() {
  const { currentUser, loading } = useAuth()
  const location = useLocation()

  if (loading)      return null
  if (!currentUser) return <Navigate to="/login" state={{ from: location.pathname }} replace />
  return <Outlet />
}

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<DefaultRedirect />} />

        {/* All requester / worker / admin routes require sign-in */}
        <Route element={<ProtectedRoute />}>
          <Route path="/requester" element={<RequesterLayout />}>
            <Route index element={<RequesterHome />} />
            <Route path="post-job" element={<PostJob />} />
            <Route path="jobs" element={<JobList />} />
            <Route path="jobs/:id" element={<JobStatus />} />
            <Route path="jobs/:id/rate" element={<RateWorker />} />
            <Route path="workers/:workerId" element={<WorkerProfile />} />
            <Route path="property" element={<Property />} />
          </Route>

          <Route path="/worker" element={<WorkerLayout />}>
            <Route index element={<WorkerEarnings />} />
            <Route path="register" element={<Register />} />
            <Route path="job-request" element={<JobRequest />} />
            <Route path="job-request/:requestId" element={<JobRequest />} />
            <Route path="active-job" element={<ActiveJob />} />
          </Route>

          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="jobs" element={<AdminDashboard tab="jobs" />} />
            <Route path="jobs/:id" element={<AdminJobDetail />} />
            <Route path="users" element={<AdminDashboard tab="users" />} />
            <Route path="disputes" element={<AdminDashboard tab="disputes" />} />
            <Route path="analytics" element={<Analytics />} />
          </Route>
        </Route>

        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route path="*" element={<DefaultRedirect />} />
      </Routes>
    </>
  )
}
