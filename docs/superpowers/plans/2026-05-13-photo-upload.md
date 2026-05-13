# Photo Upload Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add property photo management and per-job photo upload to the YoSnowMow requester flow, and display submitted photos on the worker's job cards.

**Architecture:** Photos in Phase 0 are stored as `URL.createObjectURL()` object URLs in React state and MockStateContext — no backend or Firebase Storage required. `MockStateContext.mockUser` gains a `propertyPhotos` state array (up to 5 URLs); job objects already have `photoUrls: []`. The PostJob Step 3 collects photos from both sources and passes them through the existing `postJob()` API call for future Phase 1 use.

**Tech Stack:** React 19, CSS custom properties (design tokens), existing `Modal` component, browser File API (`URL.createObjectURL`, `<input type="file">`), MockStateContext

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `frontend/src/context/MockStateContext.jsx` | Modify | Add `propertyPhotos` state to provider; expose `setPropertyPhotos`; seed demo photos on MOCK_JOBS |
| `frontend/src/pages/requester/Property.jsx` | **Create** | My Property page — manage up to 5 saved property photos |
| `frontend/src/layouts/RequesterLayout.jsx` | Modify | Add Property to desktop nav, mobile bottom nav, and avatar link |
| `frontend/src/App.jsx` | Modify | Register `/requester/property` route |
| `frontend/src/pages/requester/PostJob.jsx` | Modify | Add two-section photo UI to Step 3; validate ≥1 photo; pass photoUrls to postJob() |
| `frontend/src/pages/worker/JobRequest.jsx` | Modify | Add photo thumbnail strip to job card; add full-size photo modal |

---

## Task 1: MockStateContext — property photos state + demo seed data

**Files:**
- Modify: `frontend/src/context/MockStateContext.jsx`

- [ ] **Step 1: Add demo photo data URIs above MOCK_JOBS**

Open `frontend/src/context/MockStateContext.jsx`. Add these two constants at the very top of the file, before the `MOCK_JOBS` declaration:

```jsx
const DEMO_PHOTO_1 = 'data:image/svg+xml,' + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96"><rect width="96" height="96" fill="#7aa3c8"/><rect x="20" y="30" width="56" height="40" rx="4" fill="#fff" opacity="0.6"/><rect x="38" y="18" width="20" height="16" rx="2" fill="#fff" opacity="0.6"/></svg>'
)
const DEMO_PHOTO_2 = 'data:image/svg+xml,' + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96"><rect width="96" height="96" fill="#7ac87a"/><ellipse cx="48" cy="60" rx="30" ry="18" fill="#fff" opacity="0.5"/><rect x="30" y="30" width="36" height="24" rx="6" fill="#fff" opacity="0.5"/></svg>'
)
```

- [ ] **Step 2: Add demo photos to MOCK_JOBS[0]**

In `MOCK_JOBS`, find the first job object (`SR-2026-001`). Change its `photoUrls` from:
```jsx
photoUrls: [],
```
to:
```jsx
photoUrls: [DEMO_PHOTO_1, DEMO_PHOTO_2],
```

- [ ] **Step 3: Add `propertyPhotos` state inside `MockStateProvider`**

Inside the `MockStateProvider` function body, add a new state variable after the existing `useState` declarations:

```jsx
const [propertyPhotos, setPropertyPhotos] = useState([])
```

- [ ] **Step 4: Expose `propertyPhotos` on `mockUser` and export `setPropertyPhotos`**

Find the `<Ctx.Provider value={{...}}>` return. Change:
```jsx
mockUser: MOCK_USER, mockWorker: MOCK_WORKER
```
to:
```jsx
mockUser: { ...MOCK_USER, propertyPhotos }, mockWorker: MOCK_WORKER,
setPropertyPhotos,
```

- [ ] **Step 5: Verify the context shape in the browser**

Start the dev server (`cd frontend && npm run dev`). Open the browser console and run:
```js
// In DevRoleSwitcher, switch to REQUESTER role and check that the context value
// includes mockUser.propertyPhotos (should be an empty array initially)
```
No errors expected. The app should load normally.

- [ ] **Step 6: Commit**

```bash
git add frontend/src/context/MockStateContext.jsx
git commit -m "feat: add propertyPhotos state to MockStateContext; seed demo photos on SR-2026-001"
```

---

## Task 2: Property.jsx — new My Property page

**Files:**
- Create: `frontend/src/pages/requester/Property.jsx`

- [ ] **Step 1: Create the file**

Create `frontend/src/pages/requester/Property.jsx` with the full contents below:

```jsx
import { useRef, useState } from 'react'
import { useMock } from '../../context/MockStateContext'

const MAX_PHOTOS = 5
const MAX_SIZE_BYTES = 10 * 1024 * 1024

export default function Property() {
  const { mockUser, setPropertyPhotos } = useMock()
  const { propertyPhotos } = mockUser
  const inputRef = useRef(null)
  const [sizeError, setSizeError] = useState(null)

  function handleFileChange(e) {
    const file = e.target.files[0]
    e.target.value = ''
    if (!file) return
    if (file.size > MAX_SIZE_BYTES) {
      setSizeError(`"${file.name}" exceeds 10 MB. Please choose a smaller image.`)
      return
    }
    setSizeError(null)
    const url = URL.createObjectURL(file)
    setPropertyPhotos(prev => [...prev, url].slice(0, MAX_PHOTOS))
  }

  function removePhoto(index) {
    setPropertyPhotos(prev => {
      URL.revokeObjectURL(prev[index])
      return prev.filter((_, i) => i !== index)
    })
  }

  return (
    <div style={{ maxWidth: 560 }}>
      <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700, color: 'var(--gray-800)', marginBottom: 'var(--sp-2)' }}>
        My Property Photos
      </h2>
      <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-500)', marginBottom: 'var(--sp-6)' }}>
        Up to 5 photos saved to your account. Included automatically when you post a job.
      </p>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--sp-3)', marginBottom: 'var(--sp-3)' }}>
        {propertyPhotos.map((url, i) => (
          <div key={url} style={{ position: 'relative', width: 96, height: 96, flexShrink: 0 }}>
            <img
              src={url}
              alt={`Property photo ${i + 1}`}
              style={{ width: 96, height: 96, borderRadius: 10, objectFit: 'cover', border: '1px solid var(--gray-200)', display: 'block' }}
            />
            <button
              onClick={() => removePhoto(i)}
              aria-label={`Remove photo ${i + 1}`}
              style={{
                position: 'absolute', top: 4, right: 4, width: 22, height: 22,
                borderRadius: '50%', background: 'rgba(0,0,0,0.55)', border: 'none',
                color: '#fff', fontSize: 12, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700,
              }}
            >✕</button>
          </div>
        ))}

        {propertyPhotos.length < MAX_PHOTOS && (
          <button
            onClick={() => { setSizeError(null); inputRef.current?.click() }}
            style={{
              width: 96, height: 96, borderRadius: 10,
              border: '2px dashed var(--blue)', background: 'var(--blue-light)',
              cursor: 'pointer', display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: 4, color: 'var(--blue)',
            }}
          >
            <span style={{ fontSize: 'var(--font-size-2xl)' }}>+</span>
            <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600 }}>Add Photo</span>
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      {sizeError && (
        <p style={{ fontSize: 'var(--font-size-xs)', color: '#c0392b', marginBottom: 'var(--sp-3)' }}>
          ⚠ {sizeError}
        </p>
      )}

      <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--gray-400)', marginBottom: 'var(--sp-6)' }}>
        {propertyPhotos.length} of {MAX_PHOTOS} slots used · JPG, PNG, WEBP · max 10 MB each
      </p>

      <div style={{
        background: 'var(--blue-light)', borderRadius: 10, padding: 'var(--sp-4)',
        fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)',
        border: '1px solid var(--gray-200)',
      }}>
        💡 These photos are shown to Workers whenever you post a job. Keep them up to date — clear shots of your driveway, walkway, and steps help Workers give you a fair price.
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/pages/requester/Property.jsx
git commit -m "feat: add My Property page for managing up to 5 saved property photos"
```

---

## Task 3: Register route and update nav

**Files:**
- Modify: `frontend/src/App.jsx`
- Modify: `frontend/src/layouts/RequesterLayout.jsx`

- [ ] **Step 1: Import Property in App.jsx**

In `frontend/src/App.jsx`, add the import after the existing requester page imports:

```jsx
import Property from './pages/requester/Property'
```

- [ ] **Step 2: Add the route in App.jsx**

Inside the `<Route path="/requester" element={<RequesterLayout />}>` block, add after the `workers/:workerId` route:

```jsx
<Route path="property" element={<Property />} />
```

- [ ] **Step 3: Add Property to desktop nav in RequesterLayout.jsx**

In `frontend/src/layouts/RequesterLayout.jsx`, find the desktop nav array:
```jsx
{ to: '/requester', label: 'Home', end: true },
{ to: '/requester/post-job', label: 'Post a Job' },
{ to: '/requester/jobs', label: 'My Jobs' },
```

Replace with:
```jsx
{ to: '/requester', label: 'Home', end: true },
{ to: '/requester/post-job', label: 'Post a Job' },
{ to: '/requester/jobs', label: 'My Jobs' },
{ to: '/requester/property', label: 'My Property' },
```

- [ ] **Step 4: Add Property to mobile bottom nav in RequesterLayout.jsx**

Find the mobile bottom nav array:
```jsx
{ to: '/requester', icon: '🏠', label: 'Home', end: true },
{ to: '/requester/post-job', icon: '➕', label: 'Post' },
{ to: '/requester/jobs', icon: '📋', label: 'Jobs' },
```

Replace with:
```jsx
{ to: '/requester', icon: '🏠', label: 'Home', end: true },
{ to: '/requester/post-job', icon: '➕', label: 'Post' },
{ to: '/requester/jobs', icon: '📋', label: 'Jobs' },
{ to: '/requester/property', icon: '📸', label: 'Property' },
```

- [ ] **Step 5: Make the avatar circle a link to My Property**

In `RequesterLayout.jsx`, find the avatar `<div>` (the circle showing initials):
```jsx
<div style={{
  width: 34, height: 34, borderRadius: '50%', background: '#1A6FDB',
  color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
  fontSize: 13, fontWeight: 700,
}}>{initials}</div>
```

Replace with a `NavLink` wrapping the same div:
```jsx
<NavLink to="/requester/property" style={{ textDecoration: 'none' }}>
  <div style={{
    width: 34, height: 34, borderRadius: '50%', background: '#1A6FDB',
    color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 13, fontWeight: 700, cursor: 'pointer',
  }}>{initials}</div>
</NavLink>
```

- [ ] **Step 6: Verify in browser**

Navigate to `http://localhost:3000/requester`. Confirm:
- Desktop nav shows "My Property" link
- Mobile bottom nav shows 📸 Property tab
- Clicking the avatar navigates to `/requester/property`
- The Property page loads with empty photo grid and Add Photo button
- Adding a photo via the button shows a thumbnail; removing it clears it

- [ ] **Step 7: Commit**

```bash
git add frontend/src/App.jsx frontend/src/layouts/RequesterLayout.jsx
git commit -m "feat: register /requester/property route and add Property to requester nav"
```

---

## Task 4: PostJob Step 3 — two-section photo UI

**Files:**
- Modify: `frontend/src/pages/requester/PostJob.jsx`

- [ ] **Step 1: Add `useRef` to the React import and import `useMock`**

At the top of `frontend/src/pages/requester/PostJob.jsx`, find:
```jsx
import { useState, useNavigate, ... } from 'react'
```
Add `useRef` to that import. Also add below the existing imports:
```jsx
import { useMock } from '../../context/MockStateContext'
```

- [ ] **Step 2: Add photo state variables and refs inside the component**

At the top of the `PostJob` component function, after the existing `useState` declarations, add:

```jsx
const { mockUser } = useMock()
const reqPhotoInputRef = useRef(null)
// null = not yet initialised; initialised when user first reaches Step 3
const [selectedPropPhotos, setSelectedPropPhotos] = useState(null)
const [reqPhotos, setReqPhotos] = useState([]) // [{ file: File, url: string }]
const [photoError, setPhotoError] = useState(null)
```

- [ ] **Step 3: Add photo helper functions**

After the existing helper functions (e.g. `validateStep1`, `submit`), add:

```jsx
function togglePropPhoto(url) {
  setSelectedPropPhotos(prev => {
    const next = new Set(prev)
    if (next.has(url)) next.delete(url)
    else next.add(url)
    return next
  })
}

function handleReqPhotoChange(e) {
  const files = Array.from(e.target.files)
  e.target.value = ''
  const remaining = 3 - reqPhotos.length
  const candidates = files.slice(0, remaining)
  const oversized = []
  const valid = []
  for (const f of candidates) {
    if (f.size > 10 * 1024 * 1024) oversized.push(f.name)
    else valid.push({ file: f, url: URL.createObjectURL(f) })
  }
  if (oversized.length) setPhotoError(`Skipped (over 10 MB): ${oversized.join(', ')}`)
  else setPhotoError(null)
  setReqPhotos(prev => [...prev, ...valid].slice(0, 3))
}

function removeReqPhoto(index) {
  setReqPhotos(prev => {
    URL.revokeObjectURL(prev[index].url)
    return prev.filter((_, i) => i !== index)
  })
}

function goToStep3() {
  // Initialise property photo selection to "all selected" on first visit
  if (selectedPropPhotos === null) {
    setSelectedPropPhotos(new Set(mockUser.propertyPhotos))
  }
  setStep(3)
}

function goToStep4() {
  const totalPhotos = (selectedPropPhotos ? selectedPropPhotos.size : 0) + reqPhotos.length
  if (totalPhotos === 0) {
    setPhotoError('Add at least 1 photo to continue.')
    return
  }
  setPhotoError(null)
  setStep(4)
}
```

- [ ] **Step 4: Derive `totalPhotoCount` for the live counter**

After the helper functions, add:

```jsx
const totalPhotoCount =
  (selectedPropPhotos ? selectedPropPhotos.size : mockUser.propertyPhotos.length) +
  reqPhotos.length
```

- [ ] **Step 5: Update the Step 2 → Step 3 "Next" button**

In the Step 2 JSX, find the button that navigates to Step 3. It will look like:
```jsx
onClick={() => setStep(3)}
```
Change it to:
```jsx
onClick={goToStep3}
```

- [ ] **Step 6: Add the photo section to Step 3 JSX**

In Step 3's JSX, find the notes textarea section. It ends with the closing of the notes `</div>` block. Immediately after that block (before the nav buttons row), insert:

```jsx
{/* ── Photos ─────────────────────────────── */}
<div style={{ borderTop: '1px solid var(--gray-200)', paddingTop: 'var(--sp-4)', marginTop: 'var(--sp-4)' }}>

  {/* Sub-section A: saved property photos */}
  {mockUser.propertyPhotos.length > 0 && (
    <div style={{ marginBottom: 'var(--sp-5)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--sp-1)' }}>
        <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 700, color: 'var(--gray-700)' }}>
          🏠 Your property photos
        </span>
        <a
          href="/requester/property"
          target="_blank"
          rel="noopener noreferrer"
          style={{ fontSize: 'var(--font-size-xs)', color: 'var(--blue)', fontWeight: 600, textDecoration: 'none' }}
        >
          Manage →
        </a>
      </div>
      <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--gray-500)', marginBottom: 'var(--sp-3)' }}>
        All selected by default. Tap any to leave out.
      </p>
      <div style={{ display: 'flex', gap: 'var(--sp-2)', flexWrap: 'wrap' }}>
        {mockUser.propertyPhotos.map(url => {
          const selected = selectedPropPhotos ? selectedPropPhotos.has(url) : true
          return (
            <button
              key={url}
              onClick={() => togglePropPhoto(url)}
              aria-label={selected ? 'Deselect photo' : 'Select photo'}
              style={{
                position: 'relative', width: 68, height: 68, padding: 0, flexShrink: 0,
                border: selected ? '2px solid var(--blue)' : '2px solid var(--gray-300)',
                borderRadius: 8, cursor: 'pointer', background: 'none',
                opacity: selected ? 1 : 0.45,
              }}
            >
              <img
                src={url}
                alt="Property"
                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 6, display: 'block' }}
              />
              <span style={{
                position: 'absolute', top: -6, right: -6, width: 20, height: 20,
                borderRadius: '50%', background: selected ? 'var(--blue)' : 'var(--gray-400)',
                border: '2px solid #fff', color: '#fff',
                fontSize: 11, fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {selected ? '✓' : '✕'}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )}

  {/* Sub-section B: per-request uploads */}
  <div>
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--sp-2)', marginBottom: 'var(--sp-1)' }}>
      <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 700, color: 'var(--gray-700)' }}>
        📷 Add photos for this request
      </span>
      <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--gray-400)' }}>(optional)</span>
    </div>
    <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--gray-500)', marginBottom: 'var(--sp-3)' }}>
      Show current conditions — fresh snow, problem areas, etc. Up to 3.
    </p>
    <div style={{ display: 'flex', gap: 'var(--sp-2)', flexWrap: 'wrap', marginBottom: 'var(--sp-2)' }}>
      {reqPhotos.map((p, i) => (
        <div key={p.url} style={{ position: 'relative', width: 68, height: 68, flexShrink: 0 }}>
          <img
            src={p.url}
            alt={`Request photo ${i + 1}`}
            style={{ width: 68, height: 68, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--gray-200)', display: 'block' }}
          />
          <button
            onClick={() => removeReqPhoto(i)}
            aria-label="Remove photo"
            style={{
              position: 'absolute', top: 3, right: 3, width: 18, height: 18,
              borderRadius: '50%', background: 'rgba(0,0,0,0.55)', border: 'none',
              color: '#fff', fontSize: 10, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700,
            }}
          >✕</button>
        </div>
      ))}
      {reqPhotos.length < 3 && (
        <button
          onClick={() => { setPhotoError(null); reqPhotoInputRef.current?.click() }}
          style={{
            width: 68, height: 68, borderRadius: 8,
            border: '2px dashed var(--blue)', background: 'var(--blue-light)',
            cursor: 'pointer', display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: 2, color: 'var(--blue)',
          }}
        >
          <span style={{ fontSize: 20 }}>+</span>
          <span style={{ fontSize: 10, fontWeight: 600 }}>Add Photo</span>
        </button>
      )}
    </div>
    <input
      ref={reqPhotoInputRef}
      type="file"
      accept="image/*"
      multiple
      style={{ display: 'none' }}
      onChange={handleReqPhotoChange}
    />
    <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--gray-400)' }}>
      {reqPhotos.length} of 3 · JPG, PNG, WEBP · max 10 MB each
    </p>
  </div>

  {/* Validation error */}
  {photoError && (
    <p style={{ fontSize: 'var(--font-size-xs)', color: '#c0392b', marginTop: 'var(--sp-3)' }}>
      ⚠ {photoError}
    </p>
  )}
</div>
```

- [ ] **Step 7: Update the Step 3 "Review →" button**

Find the Step 3 navigation button that calls `setStep(4)`:
```jsx
onClick={() => setStep(4)}
```
Change it to:
```jsx
onClick={goToStep4}
```

- [ ] **Step 8: Add the live photo counter below the Review button**

Immediately after the Step 3 "Review →" button, add:

```jsx
{totalPhotoCount > 0 && (
  <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--gray-500)', textAlign: 'center', marginTop: 'var(--sp-2)' }}>
    {totalPhotoCount} photo{totalPhotoCount !== 1 ? 's' : ''} will be included with this job
  </p>
)}
```

- [ ] **Step 9: Pass `photoUrls` in the `submit()` function**

Inside `submit()`, find the `postJob(...)` call. Just before it, add:

```jsx
const photoUrls = [
  ...(selectedPropPhotos ? [...selectedPropPhotos] : mockUser.propertyPhotos),
  ...reqPhotos.map(p => p.url),
]
```

Then add `photoUrls` to the `postJob(...)` call's data object:
```jsx
const job = await postJob({
  scope,
  propertyAddressText:  fullAddress,
  startWindowEarliest,
  startWindowLatest:    null,
  notesForWorker,
  personalWorkerOnly:   false,
  postedPriceCents:     postedPrice,
  photoUrls,
})
```

- [ ] **Step 10: Verify in browser**

Navigate to `http://localhost:3000/requester/post-job`. Step through to Step 3 and confirm:
- If `mockUser.propertyPhotos` is empty: only Sub-section B appears
- After adding property photos on the My Property page (in a new tab), returning to Step 3 and re-entering: Sub-section A appears with photos all pre-selected
- Tapping a property photo toggles it (opacity change + badge swap)
- "Add Photo" in Sub-section B opens file picker; selected image appears as thumbnail
- X removes thumbnails; counter updates
- "N photos will be included" footer updates live
- Trying to proceed with 0 photos shows error and blocks Next
- With ≥1 photo, Next proceeds to Step 4

- [ ] **Step 11: Commit**

```bash
git add frontend/src/pages/requester/PostJob.jsx
git commit -m "feat: add two-section photo upload to PostJob Step 3 with validation"
```

---

## Task 5: JobRequest — photo strip on job card and full-size modal

**Files:**
- Modify: `frontend/src/pages/worker/JobRequest.jsx`

- [ ] **Step 1: Add `photoModal` state**

In `frontend/src/pages/worker/JobRequest.jsx`, add a new state variable with the existing `useState` declarations:

```jsx
// null when closed; { photos: string[], index: number } when open
const [photoModal, setPhotoModal] = useState(null)
```

- [ ] **Step 2: Add the photo strip inside the browsable job card**

In the browsable jobs section, find the `job.notesForWorker` display block (the block that optionally shows the notes string). Immediately after that block, and before the Accept/Counter action buttons row, insert:

```jsx
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
          style={{ padding: 0, border: 'none', borderRadius: 6, cursor: 'pointer', background: 'none', flexShrink: 0 }}
        >
          <img
            src={url}
            alt={`Job photo ${i + 1}`}
            style={{ width: 56, height: 56, objectFit: 'cover', borderRadius: 6, border: '1px solid var(--gray-200)', display: 'block' }}
          />
        </button>
      ))}
      {job.photoUrls.length > 5 && (
        <button
          onClick={() => setPhotoModal({ photos: job.photoUrls, index: 5 })}
          style={{
            width: 56, height: 56, borderRadius: 6,
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
```

- [ ] **Step 3: Add the full-size photo modal**

At the end of the component's JSX return, just before the final closing `</div>`, add:

```jsx
{/* Full-size photo modal */}
{photoModal && (
  <Modal
    isOpen={true}
    onClose={() => setPhotoModal(null)}
    title={`Photo ${photoModal.index + 1} of ${photoModal.photos.length}`}
  >
    <div style={{ background: '#111', borderRadius: 8, overflow: 'hidden' }}>
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
              background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 6,
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
              background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 6,
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
```

- [ ] **Step 4: Verify in browser**

Switch to Worker role via DevRoleSwitcher. Navigate to the Job Request page. Confirm:
- The SR-2026-001 job card shows a "PHOTOS" label with 2 blue/green placeholder thumbnails
- Clicking a thumbnail opens the full-size modal with a dark background
- Prev/Next buttons navigate between photos; counter shows "1 / 2"
- Closing the modal (× button or backdrop) dismisses it

- [ ] **Step 5: Commit**

```bash
git add frontend/src/pages/worker/JobRequest.jsx
git commit -m "feat: add photo thumbnail strip and full-size modal to worker job cards"
```

---

## Task 6: Push and verify deploy

- [ ] **Step 1: Update DIARY.md**

Append a dated entry to `DIARY.md` documenting all changes made across Tasks 1–5: what was built, key decisions (object URLs for Phase 0, SVG data URIs for demo seeds, new tab for Manage link to preserve form state), and files changed.

- [ ] **Step 2: Push to GitHub**

```bash
git push origin main
```

- [ ] **Step 3: Monitor GitHub Actions**

Open `https://github.com/perelgut/YoSnowMow/actions`. The `Frontend Deploy` workflow will trigger automatically (frontend files changed). Wait for it to complete (≈2–3 minutes). Verify the deploy succeeds.

- [ ] **Step 4: Smoke test on yosnowmow.com**

- Sign in as Requester → navigate to My Property → add and remove a photo
- Post a Job → reach Step 3 → confirm photo sections appear → add a request photo → proceed
- Switch to Worker role → confirm photo strip appears on the SR-2026-001 card → click thumbnail → modal opens with navigation
