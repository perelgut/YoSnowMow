import { createContext, useContext, useState } from 'react'

const Ctx = createContext(null)

// Demo placeholder images used to seed the first job with sample property photos
const DEMO_PHOTO_1 = 'data:image/svg+xml,' + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96"><rect width="96" height="96" fill="#7aa3c8"/><rect x="20" y="30" width="56" height="40" rx="4" fill="#fff" opacity="0.6"/><rect x="38" y="18" width="20" height="16" rx="2" fill="#fff" opacity="0.6"/></svg>'
)
const DEMO_PHOTO_2 = 'data:image/svg+xml,' + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96"><rect width="96" height="96" fill="#7ac87a"/><ellipse cx="48" cy="60" rx="30" ry="18" fill="#fff" opacity="0.5"/><rect x="30" y="30" width="36" height="24" rx="6" fill="#fff" opacity="0.5"/></svg>'
)

const MOCK_JOBS = [
  {
    jobId: 'SR-2026-001',
    requesterId: 'user-1',
    status: 'ESCROW_HELD',
    serviceTypes: ['Driveway Clearing', 'Walkway'],
    address: '183 Maple Street, East York, ON M4J 3K2',
    scheduledTime: 'ASAP',
    specialNotes: 'Side gate is open. Dog is inside.',
    postedPriceCents: 6500,
    agreedPriceCents: 6500,
    depositAmountCents: 7345,
    platformFeeCents: 985,
    hstCents: 956,
    netWorkerCents: 5404,
    currentWorkerName: 'Alex M.',
    currentWorkerRating: 4.8,
    currentWorkerDistance: '1.4 km',
    createdAt: '2026-04-03T09:14:00Z',
    pendingApprovalAt: null,
    photoUrls: [DEMO_PHOTO_1, DEMO_PHOTO_2],
  },
  {
    jobId: 'SR-2026-002',
    requesterId: 'user-1',
    status: 'RELEASED',
    serviceTypes: ['Driveway Clearing'],
    address: '42 Oak Avenue, North York, ON M2N 1A1',
    scheduledTime: '2026-03-28T08:00:00Z',
    specialNotes: '',
    postedPriceCents: 4500,
    agreedPriceCents: 4500,
    depositAmountCents: 5085,
    platformFeeCents: 675,
    hstCents: 663,
    netWorkerCents: 4074,
    currentWorkerName: 'Jamie R.',
    currentWorkerRating: 4.6,
    createdAt: '2026-03-28T07:30:00Z',
    pendingApprovalAt: '2026-03-28T09:15:00Z',
    photoUrls: [],
  },
]

const MOCK_USER = { displayName: 'Sarah K.', email: 'sarah@example.com', uid: 'user-1' }
const MOCK_WORKER = { displayName: 'Alex M.', email: 'alex@example.com', uid: 'worker-1', averageRating: 4.8, totalJobsCompleted: 47 }

const STATE_ORDER = ['POSTED','NEGOTIATING','AGREED','ESCROW_HELD','IN_PROGRESS','PENDING_APPROVAL','RELEASED']

export function MockStateProvider({ children }) {
  const [role, setRole] = useState('REQUESTER')
  const [jobs, setJobs] = useState(MOCK_JOBS)
  const [nextId, setNextId] = useState(3)
  // propertyPhotos holds the requester's saved property photo data URIs
  const [propertyPhotos, setPropertyPhotos] = useState([])

  function setJobStatus(jobId, status) {
    setJobs(prev => prev.map(j => j.jobId === jobId ? {
      ...j, status,
      pendingApprovalAt: status === 'PENDING_APPROVAL' ? new Date().toISOString() : j.pendingApprovalAt,
    } : j))
  }

  function addJob(data) {
    const id = `SR-2026-00${nextId}`
    setNextId(n => n + 1)
    const job = {
      jobId: id, requesterId: 'user-1', status: 'POSTED',
      currentWorkerName: 'Alex M.', currentWorkerRating: 4.8, currentWorkerDistance: '1.2 km',
      createdAt: new Date().toISOString(), pendingApprovalAt: null, photoUrls: [],
      postedPriceCents: 0, agreedPriceCents: null,
      depositAmountCents: 0, platformFeeCents: 0, hstCents: 0, netWorkerCents: 0,
      ...data,
    }
    setJobs(prev => [job, ...prev])
    return id
  }

  function advanceJob(jobId) {
    setJobs(prev => prev.map(j => {
      if (j.jobId !== jobId) return j
      const idx = STATE_ORDER.indexOf(j.status)
      const next = idx < STATE_ORDER.length - 1 ? STATE_ORDER[idx + 1] : j.status
      return {
        ...j, status: next,
        pendingApprovalAt: next === 'PENDING_APPROVAL' ? new Date().toISOString() : j.pendingApprovalAt,
      }
    }))
  }

  return (
    <Ctx.Provider value={{ role, setRole, jobs, setJobStatus, addJob, advanceJob, mockUser: { ...MOCK_USER, propertyPhotos }, mockWorker: MOCK_WORKER, setPropertyPhotos }}>
      {children}
    </Ctx.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useMock() {
  return useContext(Ctx)
}
