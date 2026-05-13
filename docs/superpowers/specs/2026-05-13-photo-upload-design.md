# Photo Upload — Design Spec

**Date:** 2026-05-13  
**Phase:** Phase 0 (mock prototype)  
**Status:** Approved

---

## Overview

Requesters must attach at least one photo of their property when posting a job, so Workers can fairly assess the scope of work before accepting or countering. Photos come from two sources: saved property photos (registered to the Requester's account, up to 5) and per-request uploads (fresh shots for the current job, up to 3 additional).

---

## Feature 1 — My Property Page (`/requester/property`)

A new page in the Requester area where Requesters manage up to 5 saved property photos. These photos represent the Requester's property in a general, durable sense (standard driveway shot, walkway, steps, etc.) and are automatically included whenever a job is posted.

### Access points
- **Requester bottom nav** — new "Property" tab added alongside Home, Post Job, My Jobs
- **Requester header** — profile icon/menu links to this page (settings area)
- **PostJob Step 3** — "Manage →" shortcut link next to the saved photos section header

### Layout
- Grid of up to 5 photo slots
- Each filled slot shows the photo thumbnail with an X button to remove it
- Empty slots show an "Add Photo" button (dashed border, + icon)
- Once all 5 slots are filled, no Add button is shown
- Counter below grid: "N of 5 slots used"
- Informational tip: "These photos are shown to Workers whenever you post a job. Keep them up to date."

### Behaviour
- Clicking Add Photo triggers a hidden `<input type="file" accept="image/*">` (single file per click)
- Max file size: 10 MB per photo — validated client-side; show inline error if exceeded
- Accepted types: JPG, PNG, WEBP (`accept="image/*"` covers these on all major browsers)
- Photos are stored as `File` objects; preview URLs generated via `URL.createObjectURL()`
- In Phase 0: property photos stored in `MockStateContext` on `mockUser.propertyPhotos` (array of object URLs, max 5)
- Removing a photo removes it from `mockUser.propertyPhotos` immediately

### Phase 1 migration note
In Phase 1, property photos upload to Firebase Storage under `users/{userId}/property/`. The `propertyPhotos` field on the Firestore user document holds permanent download URLs. The UI component is unchanged — only the persistence layer differs.

---

## Feature 2 — PostJob Step 3 (Schedule + Details + Photos)

The existing Step 3 gains a photo section below Notes. Photos are split into two sub-sections.

### Sub-section A: Saved property photos

- Appears only when `mockUser.propertyPhotos` has at least one entry
- Header: "🏠 Your property photos" with a "Manage →" link (navigates to `/requester/property`, opens in a **new tab** to preserve PostJob form state)
- Subtext: "All selected by default. Uncheck any to leave out."
- All saved photos render as 68×68 px thumbnails, each with a blue checkmark badge (selected state)
- Tapping a thumbnail toggles it: selected → deselected (greyed to 45% opacity, X badge replaces checkmark)
- Tapping again re-selects it
- No minimum on this sub-section individually — but at least 1 photo total (across both sub-sections) is required before Step 3 → Step 4 is allowed

### Sub-section B: Add photos for this request

- Header: "📷 Add photos for this request" with "(optional)" label
- Subtext: "Show current conditions — fresh snow, problem areas, etc. Up to 3."
- Thumbnail grid: uploaded photos (68×68 px) with X to remove, plus an "Add Photo" button
- Hidden `<input type="file" accept="image/*" multiple>` (allows picking multiple at once, capped to remaining slots)
- Counter below grid: "N of 3 · JPG, PNG, WEBP · max 10 MB each"
- Add Photo button is hidden once 3 request photos are uploaded
- Max file size: 10 MB per photo — validated client-side; skip oversized files and show inline error

### Validation

- **Minimum**: At least 1 photo total (selected property photos + request photos) before Next is enabled
- If the Requester has no saved property photos and has not uploaded any request photos, Next button is disabled and shows: "Add at least 1 photo to continue"
- If the Requester has saved property photos but deselects all of them and has no request photos, same disabled state and message
- Footer below Next button shows: "N photos will be included with this job" (updates live)

### What is NOT shown post-submission

Photos are not shown on the Requester's JobStatus page after posting. They are for Workers only.

---

## Feature 3 — Worker Job Card (JobRequest page)

Workers see photos in two places on the job browsing screen.

### Thumbnail strip on the job card

- Appears only when `job.photoUrls.length > 0`
- Positioned between the scope tags and the Accept/Counter buttons
- Section label: "PHOTOS" (small caps, muted)
- Thumbnails: 56×56 px, rounded corners, horizontal row, tappable
- If more than 5 photos, show first 4 + a "+N more" overflow chip

### Full-size photo modal

- Tapping any thumbnail opens the existing `Modal` component
- Modal shows the selected photo full-size (object-fit: contain, dark background)
- Left/right arrow buttons for navigation if multiple photos
- Photo counter: "2 / 5" shown at bottom
- Close button (×) at top right

---

## Data model changes (Phase 0 mock)

### `MockStateContext`

```js
// mockUser gains:
propertyPhotos: []  // array of object URLs (string[]), max 5

// addJob() already accepts photoUrls via spread — no change needed
// PostJob passes the combined array:
photoUrls: [
  ...selectedPropertyPhotoUrls,  // subset of mockUser.propertyPhotos
  ...requestPhotoUrls,           // new object URLs from per-request uploads
]
```

### Job object

`photoUrls: string[]` — already present in mock jobs, no schema change.

---

## Files to create or modify

| File | Change |
|---|---|
| `frontend/src/pages/requester/Property.jsx` | New page — My Property photo management |
| `frontend/src/layouts/RequesterLayout.jsx` | Add Property tab to bottom nav + header profile link |
| `frontend/src/pages/requester/PostJob.jsx` | Step 3: add two-section photo UI, validation, live counter |
| `frontend/src/context/MockStateContext.jsx` | Add `propertyPhotos: []` to `mockUser`; expose setter |
| `frontend/src/pages/worker/JobRequest.jsx` | Add photo strip to job card; add full-size modal |
| `frontend/src/App.jsx` (or router) | Register `/requester/property` route |

---

## Out of scope (this spec)

- Firebase Storage integration (Phase 1)
- Backend API for property photo persistence (Phase 1)
- Photo shown on Requester's JobStatus page (explicitly excluded)
- Image compression or resizing (Phase 1)
- Admin view of job photos (future)
- Notification-based OpportunityCard photos (future — cards load from job object already)
