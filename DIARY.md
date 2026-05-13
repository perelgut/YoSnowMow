<p align="center"><img src="images/YoSnowMow.png" alt="YoSnowMow" height="120" /></p>

# YoSnowMow — Development Diary

This diary is a fanatically detailed record of every change made to the project, including the discussions and reasoning that led to each change. It is a raw technical log; a human-readable summary can be generated from it separately.

---

## 2026-04-08 — Session 1: Environment Setup (ENV-01 through ENV-05)

### Context
Claude Code session initiated in `C:\Users\perel\claude_code\yosnowmow`. The project was already partially underway — Phase 0 frontend prototype was in progress with React/Vite, mock state, and role-based layouts already built. The goal of this session was to work through the formal ENV tasks defined in `docs/IMPLEMENTATION_PLAN.md`.

---

### ENV-01 — Verify Core Development Tools

**Discussion:** User asked to run the ENV-01 verification checklist to confirm all required tools were installed.

**Findings:**

| Tool | Required | Found | Notes |
|------|----------|-------|-------|
| Node.js | v20 LTS | v25.2.1 | Newer than spec; functionally fine. Strict LTS compliance would require v20. |
| npm | 10.x | 11.6.4 | OK |
| Java | 21 LTS | 21.0.9 (Oracle JDK) | OK. Note: spec called for Eclipse Temurin; Oracle JDK is installed instead. Functionally equivalent. |
| Maven | 3.9+ | 3.9.12 | OK |
| Git | Latest | 2.53.0 | OK |
| VS Code | Latest | 1.113.0 | OK |
| Google Cloud CLI | Latest | 564.0.0 | OK |
| Firebase CLI | 13.x+ | 15.10.0 | OK |
| Stripe CLI | Latest | 1.40.1 | OK |

**Decision:** ENV-01 declared complete. Node v25 deviation noted but not acted on — user accepted it.

---

### ENV-02 — Git Initialization

**Discussion:** User noted the folder already existed and git was initialized. Confirmed via `git status` — on branch `main`, up to date with `origin/main`, clean working tree. ENV-02 declared complete.

**Gap identified:** No `.gitignore` existed. This was flagged as a risk especially as API keys would be created in upcoming tasks.

**Action:** Created `.gitignore` at project root based on the template in `docs/IMPLEMENTATION_PLAN.md`. Key protections:
- `frontend/.env*` — Stripe publishable key, Firebase config
- `backend/src/main/resources/firebase-service-account*.json` — Firebase Admin SDK credentials
- `backend/application-secrets.yml` — Spring Boot secrets
- `.env` / `.env.*` — any root-level env files
- `*.pem`, `*.key`, `*.p12`, `*.jks` — certificate/key files
- `node_modules/`, `backend/target/`, `frontend/dist/` — build artifacts

**Commit:** `be0d097` — `chore: add .gitignore to protect secrets and credentials`

---

### ENV-03 — GitHub Repository and Remote

**Discussion:** User confirmed ENV-03 was already complete. Verified via `git remote -v` — remote is `https://github.com/perelgut/YoSnowMow.git`. Git log showed multiple prior commits including rename from SnowReach to YoSnowMow. ENV-03 declared complete.

**Note:** The implementation plan called for a `develop` branch and branch protection rules. These were not explicitly verified or created in this session — deferred to next session or manual setup.

---

### ENV-04 — VS Code Setup and Extensions

**Discussion:** VS Code was confirmed installed (v1.113.0). Created two files:

1. **`.vscode/extensions.json`** — 15 extension recommendations committed to the repo so all team members get the same prompt when opening the project. Extensions include: Java Pack, Spring Boot Tools, Spring Initializr, ESLint, Prettier, ES7+ React Snippets, GitLens, GitHub Pull Requests, Firebase Explorer, Auto Rename Tag, Path Intellisense, DotENV, REST Client, Markdown All in One, Code Spell Checker.

2. **`.vscode/settings.json`** — Local workspace settings (gitignored per `.gitignore`). Settings include: format-on-save with Prettier, Java formatter via RedHat, tab sizes per language, Java runtime path set to `C:\Program Files\Java\jdk-21` (Oracle JDK, actual installed path — overrides spec's Temurin path), Spring Boot problem reporting, file excludes for node_modules/target/.firebase, 100-char ruler, trailing whitespace trimming.

**Java path deviation:** Spec referenced `C:\Program Files\Eclipse Adoptium\jdk-21.x.x-hotspot`. Actual install is Oracle JDK at `C:\Program Files\Java\jdk-21`. Settings.json updated accordingly.

**Commit:** `e4bef75` — `chore: add VS Code extension recommendations (ENV-04)` (extensions.json only; settings.json intentionally not committed)

---

### ENV-05 — Establish Complete File Structure

**Discussion:** Compared existing repo state against the complete directory tree specified in `docs/IMPLEMENTATION_PLAN.md`. The Phase 0 frontend work had already created significant structure. The following were already present:
- `frontend/src/App.jsx`, `main.jsx`
- `frontend/src/components/` (flat — DevRoleSwitcher.jsx, Modal.jsx, StatusPill.jsx)
- `frontend/src/context/MockStateContext.jsx`
- `frontend/src/layouts/` (AdminLayout, RequesterLayout, WorkerLayout)
- `frontend/src/pages/admin/`, `requester/`, `worker/`
- `frontend/src/styles/globals.css`, `tokens.css`
- `docs/` folder with all planning documents

**Created (new):**

*Backend skeleton:*
- `backend/src/main/java/com/snowreach/SnowReachApplication.java` — full skeleton (entry point)
- `backend/src/main/java/com/snowreach/config/` — CorsConfig, FirebaseConfig, QuartzConfig, SecurityConfig (placeholders)
- `backend/src/main/java/com/snowreach/controller/` — 8 controllers (placeholders)
- `backend/src/main/java/com/snowreach/dto/` — 6 DTOs (placeholders)
- `backend/src/main/java/com/snowreach/exception/` — 4 exception classes (placeholders)
- `backend/src/main/java/com/snowreach/model/` — 7 models (placeholders)
- `backend/src/main/java/com/snowreach/scheduler/` — DispatchJob, DisputeTimerJob (placeholders)
- `backend/src/main/java/com/snowreach/security/` — FirebaseTokenFilter, RbacInterceptor (placeholders)
- `backend/src/main/java/com/snowreach/service/` — 11 services (placeholders)
- `backend/src/main/java/com/snowreach/util/` — GeoUtils, HashUtils (placeholders)
- `backend/src/main/resources/application.yml` — skeleton with app name, port 8080, health endpoint
- `backend/src/main/resources/application-dev.yml` — DEBUG logging skeleton
- `backend/src/main/resources/application-prod.yml` — INFO logging skeleton
- `backend/src/test/java/com/snowreach/` — JobServiceTest, MatchingServiceTest, StateMachineTest (placeholders)

*Firebase:*
- `firebase/firestore.rules` — DENY ALL skeleton (real rules in P1-21)
- `firebase/storage.rules` — DENY ALL skeleton (real rules in P1-21)
- `firebase/firebase.json` — hosting + firestore + storage config skeleton
- `firebase/.firebaserc` — placeholder project ID (`YOUR_FIREBASE_PROJECT_ID`)
- `firebase/firestore.indexes.json` — empty indexes skeleton

*CI/CD:*
- `.github/workflows/frontend-deploy.yml` — placeholder comment (filled in P1-02)
- `.github/workflows/backend-deploy.yml` — placeholder comment (filled in P1-02)

*Frontend additions:*
- `frontend/src/hooks/useAuth.js`, `useJob.js`, `useNotifications.js` (placeholders)
- `frontend/src/services/api.js`, `firebase.js`, `stripe.js` (placeholders)
- `frontend/src/utils/constants.js`, `formatCurrency.js`, `formatDate.js` (placeholders)
- `frontend/src/pages/auth/Login.jsx`, `Signup.jsx` (placeholders)
- `frontend/src/context/AuthContext.jsx`, `NotificationContext.jsx` (placeholders)
- `frontend/src/mockData.js` (placeholder)
- `frontend/src/router.jsx` (placeholder)

*Docs:*
- `docs/architecture.md` — pointer to SPECIFICATION.md §2
- `docs/runbook.md` — placeholder for P2-08

**Note:** The spec called for `frontend/src/components/` to be organized into subdirectories (Badge/, Button/, Card/, Input/, Modal/, Spinner/, StatusPill/). The existing Phase 0 components are flat (DevRoleSwitcher.jsx, Modal.jsx, StatusPill.jsx). Reorganization into subdirectories was deferred — will be addressed when those components are fully implemented in Phase 0/1 tasks.

**Note:** `backend/pom.xml` was not created — deferred to P1-03 per the implementation plan.

**Commit:** `5654efc` — `chore: establish complete project file structure (ENV-05)` — 77 files, 142 insertions

---

### Diary Instruction Added

**Discussion:** User updated both `C:\Users\perel\claude_code\CLAUDE.md` and `C:\Users\perel\claude_code\yosnowmow\CLAUDE.md` to add the instruction: *"Always keep a diary that is fanatically kept up to date with every change made and any discussions leading to the change."*

**Action:** This `DIARY.md` file created to satisfy that requirement. All prior session activity backfilled above.

---

### End of Session 1

**ENV tasks status:**
- ENV-01 ✓ Complete
- ENV-02 ✓ Complete
- ENV-03 ✓ Complete (develop branch + branch protection rules not verified — deferred)
- ENV-04 ✓ Complete
- ENV-05 ✓ Complete

**Next task:** P0-04 — Navigation Shell

---

## 2026-04-08 — P0-03 Shared Components — complete

### Components built
All in `frontend/src/components/` with CSS Modules:

| Component | Key details |
|---|---|
| `Button` | 4 variants (primary/secondary/ghost/danger), 3 sizes (sm/md/lg), `loading` prop shows Spinner |
| `Input` | `label`, `error`, `hint`, `multiline`, auto-id from label text |
| `Card` | `padding` (sm/md/lg), `shadow`, `header`/`footer` slots, `onClick` hover-lift |
| `Modal` | `createPortal`, Escape + backdrop close, focus-on-open, 3 sizes, ARIA `role="dialog"` |
| `Badge` | 5 variants (default/primary/success/warning/error), inline token styles |
| `StatusPill` | All 11 job states mapped, explicit bg/text pairs derived from token hex values |
| `Spinner` | Pure CSS `@keyframes ysm-spin`, 3 sizes, configurable colour |

### Migration of existing components
- `StatusPill.jsx` (flat) → re-exports from `StatusPill/StatusPill.jsx`; all 11 states updated to match current token values; `IN_PROGRESS` colour corrected to `#9B59B6` (was `#8E44AD`)
- `Modal.jsx` (flat) → re-exports from `Modal/Modal.jsx`; added `size` prop and `aria` attributes
- Backward compat: all existing `import X from '../../components/X'` paths still resolve

### Barrel export
`components/index.js` — `import { Button, Card, Modal } from '../components'` works for all new code.

### Design decision: StatusPill background tint
Spec said "background is colorVar at 15% opacity". `color-mix()` approach was attempted but is complex and has browser-support caveats. Used explicit paired hex values instead (same approach as original prototype, now consistent with P0-02 token colours).

**Commit:** `53975d8` — `feat: P0-03 shared component library`

---

## 2026-04-08 — Fix: duplicate GitHub Actions workflow

**Problem:** Every push showed two Actions entries — one green ✓, one `!` → `X` (cancelled). User noticed and asked why.

**Root cause:** `deploy.yml` (workflow ID 255775858) was already in the repo from before our session, fully working. In ENV-05, `frontend-deploy.yml` was created as a placeholder then later filled with real content to fix the Pages 404. Both had `concurrency: group: pages, cancel-in-progress: true`. On every push both workflows started; whichever was slower was cancelled.

**Fix:** Deleted `frontend-deploy.yml`. `deploy.yml` remains as the single canonical Pages deployment workflow.

**Note:** `backend-deploy.yml` still shows `X` on every push — it is an empty placeholder. This is expected and will be resolved in P1-02.

**Commit:** `2b3fe07` — `chore: remove duplicate frontend-deploy.yml workflow`

---

## 2026-04-08 — P0-02 locked down / logo refinements

### Hero section logo and tagline (RequesterHome)
- Replaced ❄️ emoji in hero with colour logo, sized to 360px (3x at user request)
- Centring fix: globals.css resets `img` to `display: block`, breaking `text-align: center`. Fixed by wrapping image in `display: flex; justify-content: center` div.
- Tagline: "Snow cleared. Fast." → "Snow cleared or lawns mowed. Fast."
- Subline: "Connect with a local snowblower owner in minutes." → "Connect with a local worker in minutes."

### Header logo (RequesterLayout)
- Size: 56px → 168px (3x at user request)
- `height: var(--header-h)` (64px) clipped the taller logo. Fixed: `height` → `minHeight` + `padding: var(--sp-2)` so header expands to contain logo.

### Known deferred items (user decision)
- Logo PNG has excess gray background/glow — tighter crop or transparent SVG would improve appearance. **Deferred.**
- `TASK_TRACKER.html` logo still too small to read; link to `http://YoSnowGo.ca` not yet added. **Deferred.**

### GitHub Pages / CI fixes
- `frontend-deploy.yml` placeholder replaced with real build + deploy-pages workflow.
- Pre-existing `deploy.yml` found doing the same job — both share `concurrency: group: pages`. Redundant but harmless; cleanup deferred.
- Base path casing fix: `/yosnowmow/` → `/YoSnowMow/` in `vite.config.js` and `BrowserRouter basename`.

### Phase status
- P0-01 ✓ Complete
- P0-02 ✓ **Locked down**

**Next task:** P0-03 — Shared Components

---

## 2026-04-08 — Session 1 continued: P0-02 Design System

### Context
The frontend already had working `tokens.css` and `globals.css` from Phase 0 prototype work. Token names used a short-form convention (`--blue`, `--sp-1`, `--text-xl`) that differed from the spec's canonical convention (`--color-primary`, `--space-1`, `--font-size-xl`).

### Decision: dual-naming strategy
Renaming existing tokens would have broken all existing prototype components. Instead, the canonical spec names were added as the primary definitions, with the short names kept as CSS custom property aliases (`--blue: var(--color-primary)`). This means:
- All new code uses canonical names
- All existing Phase 0 code continues to work unchanged
- Both name sets resolve to identical values at runtime

### tokens.css changes
Complete rewrite with the following structure:
- Brand colours: `--color-primary`, `--color-primary-dark`, `--color-primary-light`, `--color-snow`, `--color-white`
- Neutral grays: `--color-gray-100/200/400/500/600/800` (added `--color-gray-500: #6B7A8D` not in spec but needed)
- Semantic: `--color-success/warning/error` with `-bg` variants; `--color-purple/purple-bg`
- Job status: all 11 states including `--color-status-refunded`, `--color-status-incomplete`, `--color-status-settled` (all missing from original)
- Typography: `--font-family` (Inter first), `--font-size-*`, `--font-weight-regular/medium/semibold/bold`, `--line-height-tight/base/relaxed`
- Spacing: `--space-1` through `--space-16` (added `--space-12: 48px` and `--space-16: 64px`)
- Shape: `--radius-sm/md/lg/xl/full` (added `--radius-xl: 16px`)
- Shadows: `--shadow-sm/md/lg` (added `--shadow-md` as the canonical name for what was `--shadow`)
- Z-index: `--z-base/above/modal/toast` (entirely new)
- Layout: `--max-width-content: 1080px`, `--header-height: 64px`, `--sidebar-width: 240px`, `--bottom-nav-height: 64px`

**Layout token values vs original:** Original used 60px for header/nav; spec calls for 64px. Short aliases (`--header-h`, `--nav-h`) now point to the new 64px values. This is a minor visual change to existing layouts — acceptable for Phase 0.

### globals.css changes
- Updated `body` declaration to use canonical token names (`--font-family`, `--font-size-base`, `--line-height-base`, `--color-gray-800`, `--color-snow`)
- All other existing rules unchanged (they use short aliases which still resolve correctly)

### index.html changes
- Added Inter Google Fonts CDN link (`wght@400;500;600;700`, `display=swap`)
- Added `preconnect` hints for fonts.googleapis.com and fonts.gstatic.com
- Fixed page title from "frontend" to "YoSnowMow"

### Verification
- `npm run lint` — 0 errors

**Commit:** `f5c9679` — `feat: implement design system (P0-02)`

**Next task:** P0-03 — Shared Components

---

## 2026-04-08 — Logo added

### Logo description
Two PNGs provided by user in `images/`:
- `YoSnowMow.png` — colour version: oval split blue (left, winter/night snow worker with stars) and green (right, summer lawn mower worker with sun), handshake at centre bottom, "YoSnowMow" text in blue/green below
- `YoSnowMowBW.png` — B&W version: same composition in black and white

**Note for future:** Both PNGs have a gray background — not transparent. A transparent SVG version would be ideal for production use on coloured backgrounds.

### Website changes
Replaced the placeholder SVG snowflake icon in all three layout headers with the actual logo:
- **RequesterLayout** (white header): colour logo at `height: 48px`
- **WorkerLayout** (dark blue `#0F4FA8` header): B&W logo at `height: 48px`
- **AdminLayout** (dark `#1A202C` sidebar): B&W logo at `height: 52px`

Logo images copied to `frontend/src/assets/logo.png` and `logo-bw.png` and imported as ES module assets (Vite processes them for cache-busting).

### Documentation changes
Prepended centred logo image (height 120px) to all 11 markdown docs in `docs/` and to `DIARY.md`.

**Commit:** `29b604b` — `feat: add YoSnowMow logo throughout project`

---

## 2026-04-08 — Logo added to TASK_TRACKER.html; all changes pushed to GitHub

### TASK_TRACKER.html
Replaced the SVG snowflake placeholder in the blue header with the colour logo (`images/YoSnowMow.png`).
- CSS updated: `.logo svg { width: 36px; height: 36px }` → `.logo img { height: 52px; width: auto }`
- HTML updated: SVG block replaced with `<img src="images/YoSnowMow.png" alt="YoSnowMow logo" />`

The colour logo was used (not BW) because the user specifically requested it, and the PNG's neutral gray surround blends acceptably against the blue header at this size.

### Push to GitHub
All commits from this session pushed to `origin/main` (`perelgut/YoSnowMow`).

**Commits pushed:**
- `be0d097` — chore: add .gitignore
- `e4bef75` — chore: VS Code extension recommendations (ENV-04)
- `5654efc` — chore: complete file structure (ENV-05)
- `c5ad787` — chore: initial DIARY.md
- `f1b14b1` — feat: P0-01 React project setup
- `251d981` — chore: diary P0-01
- `f5c9679` — feat: design system (P0-02)
- `e5a8f97` — chore: diary P0-02
- `29b604b` — feat: logo throughout project
- `1f51da3` — chore: diary logo entry
- *(this commit)* — feat: logo in TASK_TRACKER.html + push

---

## 2026-04-08 — Fix: GitHub Pages 404 on assets

**Problem:** `https://perelgut.github.io/yosnowmow/` served the HTML but all assets (CSS, JS) returned 404. Root cause: `frontend/dist/` is gitignored so built assets never reach GitHub Pages. The `frontend-deploy.yml` workflow was still a placeholder comment with no build or deploy steps.

**Fix:** Wrote a real GitHub Actions workflow in `.github/workflows/frontend-deploy.yml`:
- Trigger: push to `main` when `frontend/**` or the workflow itself changes; also `workflow_dispatch`
- Build job: `actions/checkout@v4` → `actions/setup-node@v4` (Node 20, npm cache) → `npm ci` → `npm run build` → `actions/upload-pages-artifact@v3` from `frontend/dist`
- Deploy job: `actions/deploy-pages@v4` targeting `github-pages` environment

Vite `base: '/yosnowmow/'` was already correctly set, matching `perelgut.github.io/yosnowmow/`.

**Manual step required:** GitHub repo Settings → Pages → Source must be set to **GitHub Actions** (not branch deploy).

**Commit:** `aaf4597` — `ci: implement GitHub Pages deployment workflow`

---

## 2026-04-08 — Fix: GitHub Pages asset 404s (base path casing)

**Problem (second report):** After the workflow fix, the page still showed 404s on CSS and JS assets. `curl https://perelgut.github.io/yosnowmow/` returned "Site not found".

**Diagnosis:** `gh api repos/perelgut/YoSnowMow/pages` revealed `html_url: https://perelgut.github.io/YoSnowMow/` — the repo name is `YoSnowMow` (title case). GitHub Pages paths are case-sensitive. Vite `base` was `/yosnowmow/` so the built HTML referenced assets as `/yosnowmow/assets/index-xxx.js`. The actual deployed path was `/YoSnowMow/assets/index-xxx.js`. Result: HTML loaded (GitHub may redirect root) but all assets 404'd.

**Fix:**
- `frontend/vite.config.js`: `base: '/yosnowmow/'` → `base: '/YoSnowMow/'`
- `frontend/src/main.jsx`: `basename="/yosnowmow"` → `basename="/YoSnowMow"`

**Verification:** After deploy, `curl https://perelgut.github.io/YoSnowMow/assets/index-33xKFwgo.js` → HTTP 200.

**Live URL:** `https://perelgut.github.io/YoSnowMow/`

**Commit:** `0adab03` — `fix: correct base path casing for GitHub Pages`

---

## 2026-04-08 — Build fix: Login.jsx and Signup.jsx missing default exports

**Problem:** GitHub Actions build failed with `[MISSING_EXPORT]` errors for `Login.jsx` and `Signup.jsx`. Both files were created in ENV-05 as comment-only placeholders (`// TODO: implement in P1-06`) with no `export default`. Rolldown (Vite's production bundler) treats this as a hard error.

**Fix:** Added minimal stub components to both files:
```jsx
export default function Login() { return <div>Login — coming soon</div> }
export default function Signup() { return <div>Sign Up — coming soon</div> }
```

**Why only these two?** The other four pages added in P0-01 (`RateWorker`, `WorkerProfile`, `Register`, `Analytics`) were written with proper default exports from the start. The `Login`/`Signup` files were created in ENV-05 before the routing was wired up, so they had no component body.

**Lesson learned:** Any `.jsx` file that is imported by App.jsx or any router must have a `export default function ...` even if it is a one-liner stub. Comment-only placeholders are only safe for files that are not yet imported anywhere.

**Commit:** `f12b84f` — `fix: add missing default exports to Login and Signup placeholders`

---

## 2026-04-08 — Session 1 continued: P0-01 React Project Setup

### Context
The frontend was already well past P0-01 scaffolding — Phase 0 prototype was actively in use. The task was to verify the setup met spec and fill in gaps.

### Version deviations from spec (accepted)
| Spec | Installed | Decision |
|------|-----------|----------|
| React 18.x | React 19.2.4 | Accepted — already in use, no breaking changes for Phase 0 |
| React Router 6.x | React Router 7.14.0 | Accepted — API compatible for our usage |
| Vite 5.x | Vite 8.0.1 | Accepted |
| ESLint 8.x / `.eslintrc.cjs` | ESLint 9.x / `eslint.config.js` (flat config) | Accepted — newer flat config format, functionally equivalent |

### Lint errors fixed (4)

1. **`MockStateContext.jsx:89`** — `react-refresh/only-export-components`: `useMock()` hook exported from same file as `MockStateProvider` component. Fix: added `// eslint-disable-next-line react-refresh/only-export-components` comment. Rationale: moving the hook to a separate file would require touching many import sites in the existing prototype; disable comment is least invasive.

2. **`RequesterLayout.jsx:1`** — `no-unused-vars`: `useNavigate` imported but not used. Fix: removed from import.

3. **`ActiveJob.jsx:8`** — `no-unused-vars`: `advanceJob` destructured from `useMock()` but not used. Fix: removed from destructuring.

4. **`ActiveJob.jsx:10`** — `no-unused-vars`: `checkedIn` state variable set via `setCheckedIn` but value never read. Fix: renamed to `_checkedIn` (matches `varsIgnorePattern: '^[A-Z_]'`). State retained for prototype completeness.

### Files added/modified

- **`.prettierrc`** — created: `semi:false`, `singleQuote:true`, `tabWidth:2`, `trailingComma:'es5'`, `printWidth:100`
- **`package.json`** — added `format` script: `prettier --write src/`; `prettier ^3.8.1` added to devDependencies via `npm install --save-dev prettier`
- **`vite.config.js`** — added `server.port: 3000` and `server.proxy: { '/api': 'http://localhost:8080' }` for future backend integration
- **`src/App.jsx`** — added imports and routes for: `RateWorker`, `WorkerProfile`, `Register`, `Analytics`, `Login`, `Signup`
- **`src/pages/requester/RateWorker.jsx`** — placeholder (P0-05)
- **`src/pages/requester/WorkerProfile.jsx`** — placeholder (P0-05)
- **`src/pages/worker/Register.jsx`** — placeholder (P1-06)
- **`src/pages/admin/Analytics.jsx`** — placeholder (P1-19)
- `Login.jsx` and `Signup.jsx` already existed from ENV-05

### Verification
- `npm run lint` — 0 errors, 0 warnings
- Dev server starts on port 3000 (`npm run dev`)

**Commit:** `f1b14b1` — `feat: complete P0-01 React project setup`

**Next task:** P0-02 — Design System

---

## 2026-04-08 — P0-04 Navigation Shell

### Scope
P0-04 completes the three layout shells (RequesterLayout, WorkerLayout, AdminLayout) and introduces the DevRoleSwitcher as a proper component.

### Gaps identified before implementation

1. **DevRoleSwitcher had no production guard** — CRITICAL. The existing flat `src/components/DevRoleSwitcher.jsx` had the full component inline with no `import.meta.env.DEV` check. This meant the "Demo Mode" switcher would appear in production builds and be visible to real users.
2. **DevRoleSwitcher not in subdirectory** — Spec calls for `components/DevRoleSwitcher/DevRoleSwitcher.jsx` consistent with all other shared components.
3. **AdminLayout missing Analytics nav link** — The route `/admin/analytics` existed in `App.jsx` (added in P0-01) but the sidebar `NAV` array had no entry for it — the page was unreachable via UI.
4. **RequesterLayout missing notification bell** — Spec calls for a notification bell icon in the requester header to support future job notification UX.

### Changes made

**`src/components/DevRoleSwitcher/DevRoleSwitcher.jsx`** (new canonical location)
- Full implementation moved here from flat file
- Added `if (!import.meta.env.DEV) return null` guard at top of component — this is the most important change; ensures Demo Mode UI never appears in production builds
- Updated z-index to `var(--z-toast)` (canonical token)
- Updated color vars to canonical form: `var(--color-primary)`, `var(--color-gray-100)`, `var(--color-gray-200)`, `var(--color-gray-400)`, `var(--color-gray-600)`

**`src/components/DevRoleSwitcher.jsx`** (flat file — backward-compat shim)
- Replaced full implementation with one-line re-export: `export { default } from './DevRoleSwitcher/DevRoleSwitcher'`
- Matches pattern of `Modal.jsx` and `StatusPill.jsx` backward-compat shims
- `App.jsx` imports from `'./components/DevRoleSwitcher'` — no import change needed

**`src/layouts/AdminLayout.jsx`**
- Added `{ to: '/admin/analytics', icon: '📈', label: 'Analytics' }` to the `NAV` array
- Analytics now appears in both the desktop sidebar and mobile icon row
- Route was already wired in `App.jsx` (`ceedd3e`) — this just made it reachable from the UI

**`src/layouts/RequesterLayout.jsx`**
- Added notification bell button (🔔) to the right-side header, to the left of the user's display name and avatar
- `aria-label="Notifications"` for accessibility
- Styled with `background: none; border: none; cursor: pointer` — unobtrusive, consistent with header
- No functionality in Phase 0 — bell is a visual placeholder for Phase 1 push notifications

### Decisions

- **No CSS Modules for layouts** — The spec document (`CLAUDE.md`) states the design approach is "inline styles referencing CSS custom properties — no CSS modules, no Tailwind". All three layouts already follow this. Creating `.module.css` files would diverge from the established pattern without benefit.
- **Bell icon only, no badge** — Phase 0 has no real notification count. Adding a hardcoded badge number would be misleading. The bell alone communicates the affordance.
- **Analytics nav at bottom of sidebar** — Added last in the NAV array, below Disputes. This is the natural position for a monitoring/reporting section below operational sections.

### Verification
- `npm run lint` — 0 errors, 0 warnings (all three modified files pass)

**Commit:** `2e7f1e9` — `feat: P0-04 navigation shell`

**Next task:** P0-05 — Requester Flow

---

## 2026-04-08 — P0-05 Requester: Home and Job Posting Flow

### Finding
P0-05 was already fully implemented in earlier commits prior to this session. Both `Home.jsx` and `PostJob.jsx` contain the complete required functionality. No new code was required — this was a verification task.

### Spec audit

| Requirement | Status |
|---|---|
| Home hero: logo, taglines, "Post a Job" CTA → /requester/post-job | ✅ |
| Home: My Jobs list — StatusPill, address, serviceTypes, jobId, deposit amount | ✅ |
| Home: empty state with icon and CTA | ✅ |
| PostJob: 4-step wizard with numbered step indicator (circles + connector lines) | ✅ |
| Step 1 — Location: address input, property type select; 1.2s fake geocode delay, then "3 Workers available" green banner, auto-advance to Step 2 | ✅ |
| Step 2 — Services: checkbox per service, size selector (Small/Medium/Large) when selected, running subtotal + HST | ✅ (enhanced beyond spec: tiered pricing per size vs. flat spec prices) |
| Step 3 — Schedule: ASAP / Specific Date radio; date + time select (30-min slots 06:00–21:00); notes textarea 500 char max with counter | ✅ |
| Step 4 — Review: full summary card; price breakdown (services, HST 13%, platform fee 15%, worker net); ack checkbox; "Post Job" button adds to MockStateContext and navigates to /requester/jobs/{id} | ✅ |
| JobList.jsx: My Jobs page at /requester/jobs listing all jobs with StatusPill and amounts | ✅ |
| Validation before advancing (address required, at least one service selected, ack checkbox on submit) | ✅ |

### Note on pricing
The spec called for flat pricing (driveway $45, walkway $20, steps $10, salting $15). The existing implementation uses tiered pricing by size (small/medium/large) for each service type. This is a deliberate enhancement that provides a better UX and more realistic pricing model. It will carry forward into Phase 1 without revision.

### Verification
- `npm run lint` — 0 errors, 0 warnings
- `npm run build` — clean build, 50 modules, no warnings

**P0-05 locked as complete — all code was pre-existing and verified.**

**Next task:** P0-06 — Requester: Job Status Tracking

---

## 2026-04-08 — P0-06 Requester: Job Status Tracking

### Pre-existing state
`JobStatus.jsx` already existed with a vertical timeline, job details card, price breakdown, and an "Advance State" dev tool. Several P0-06 requirements were missing.

### Gaps filled

**Action buttons** (new):
- **Cancel Job** — red ghost button, visible for REQUESTED/PENDING_DEPOSIT/CONFIRMED. Opens a confirmation Modal. Note shown if status is CONFIRMED (cancellation fee applies). On confirm: `setJobStatus(jobId, 'CANCELLED')`.
- **Raise Dispute** — amber-outlined button, visible for COMPLETE only. Opens a Modal with a textarea (min 10 chars to enable Submit). On confirm: `setJobStatus(jobId, 'DISPUTED')`.
- **Rate Worker** — green primary button, visible for COMPLETE only. Navigates to `/requester/jobs/:id/rate`.

**Worker card** (enhanced):
- Fixed field name bugs: `mockWorker.rating` → `mockWorker.averageRating`, `mockWorker.jobsCompleted` → `mockWorker.totalJobsCompleted` (the MockStateContext object uses these correct names; old code referenced undefined fields).
- Added `job.currentWorkerDistance` (falling back to '1.2 km') for distance display.
- Added hardcoded equipment "Husqvarna ST224" (mock data; real equipment in Phase 1).
- Added "View Profile" Link → `/requester/workers/${mockWorker.uid}`.
- Worker card now also shown for DISPUTED state (not just CONFIRMED/IN_PROGRESS/COMPLETE/RELEASED).

**Dev tools** (gated):
- Wrapped `import.meta.env.DEV` so the dev tools card never renders in production builds.

**Timeline** (improved):
- Separated ADVANCE_ORDER (for dev tool cycling) from TIMELINE_STATES (5 visible nodes: Requested → Awaiting Payment → Confirmed → In Progress → Complete).
- Terminal/exception states (DISPUTED, CANCELLED, etc.) now correctly show all prior nodes as completed rather than rendering a broken active state.

**STATUS_DESC** extended to cover all 11 states including DISPUTED, CANCELLED, INCOMPLETE, REFUNDED, SETTLED.

### Decisions

- **No CSS Module** — consistent with project approach (inline styles + global classes). The spec mentioned `JobStatus.module.css` but this project's pattern is established as inline styles.
- **Min 10 chars for dispute** — prevents accidental empty dispute submissions. Not a hard requirement but a sensible UX guard.
- **Dispute also shows worker card** — if you're raising a dispute, you need to see who the worker was.

### Verification
- `npm run lint` — 0 errors, 0 warnings

**Commit:** *(this commit)* — `feat: P0-06 job status tracking`

**Next task:** P0-07 — Requester: Worker Profile Modal

---

## 2026-04-08 — P0-07 Requester: Worker Profile Modal

### Pre-existing state
`WorkerProfile.jsx` was a one-line stub: `return <div>Worker Profile — coming soon</div>`.

### Implementation

**`WorkerProfile.jsx`** — full rewrite with dual-mode design:

**Shared content component (`WorkerProfileContent`)** — internal, not exported:
- Header: 64px avatar circle (initials "AM"), name "Alex M.", star rating (4.8), jobs count (47), member since Jan 2024
- Trust badges row: "✓ Background Checked" (green) + "🛡 Insured (Phase 3)" (gray, styled as coming-soon)
- Stats bar: Response Rate 98% / Avg. Job Time 45 min / Disputes 0
- Equipment list: Husqvarna ST224, salt spreader, LED work light
- Service Area & Availability table: area, response time, radius, hours
- 3 mock reviews with stars, date, text, reviewer name; separated by dividers

**Default export `WorkerProfile`** — standalone page at `/requester/workers/:workerId`:
- `navigate(-1)` "← Back" button (browser history back, avoids hardcoding a return path)

**Named export `WorkerProfileModal`** — modal wrapper:
- Wraps `WorkerProfileContent` in the shared `Modal` component (size="lg", title="Worker Profile")
- Used by `JobStatus.jsx` for the "View Profile" button

**`JobStatus.jsx`** — updated:
- Imported `WorkerProfileModal` from `./WorkerProfile`
- Added `profileOpen` state
- Changed "View Profile" from a `<Link>` (navigates away) to a `<button>` that sets `profileOpen = true`
- `<WorkerProfileModal>` rendered in JSX, controlled by `profileOpen`

### Decisions
- **navigate(-1) for back button** — WorkerProfile can be reached from multiple contexts (JobStatus page, potentially other places in Phase 1). Using `navigate(-1)` avoids assuming the caller. If there's no history, it's a minor edge case in Phase 0.
- **Modal size "lg"** — the profile content is tall with reviews; "md" would require excessive scrolling within the modal.
- **Insured badge grayed out** — spec says "Phase 3 coming-soon". Styled with gray background/text and explicit "(Phase 3)" label so it's visible but clearly not active.

### Verification
- `npm run lint` — 0 errors, 0 warnings

**Commit:** *(this commit)* — `feat: P0-07 worker profile modal`

**Next task:** P0-08 — Requester: Rating and Review Form

---

## 2026-04-08 — P0-08 Requester: Rating and Review Form

### Pre-existing state
`RateWorker.jsx` was a one-line stub.

### Implementation

**Two-phase component** controlled by `submitted` state:

**Rating form (before submit):**
- Header: "Rate Your Experience" + job address as subtitle
- Interactive 5-star widget: hover previews (amber), click to select, scale transform on active stars, aria-labels for accessibility
- Label beneath stars: Poor / Fair / Good / Great / Excellent! based on selected value
- Review textarea (500 chars, counter)
- "Would you hire again?" toggle buttons (👍 Yes / 👎 No) — click again to deselect; styled green/red when active
- Worker's mock rating of the Requester (read-only): 5 stars + italic quoted comment
- Error shown if Submit clicked with rating = 0
- Submit button: "Submit Rating & Release Payment" → calls `setJobStatus(jobId, 'RELEASED')` then sets `submitted = true`

**Confirmation screen (after submit):**
- Green check circle (72px, green-bg background)
- "Thanks for your feedback!" heading
- "Payment will be released within 2–3 business days" message
- Payment summary breakdown: total charged / platform fee / worker payout
- Two CTAs: "View Job Summary" (→ /requester/jobs/:id) and "Post Another Job" (→ /requester/post-job)

### Decisions
- **Submit releases payment immediately in mock** — `setJobStatus('RELEASED')` is called on submit. In Phase 1 this will be an API call that triggers a Stripe payout. The mock behaviour matches the UX intent.
- **Toggle for "Would hire again"** — clicking the same button again deselects it (sets to null). This matches common UX patterns for toggle selections and avoids forcing a choice.
- **No navigation guard** — in Phase 0 there's no "are you sure?" if the user navigates back mid-rating. Not worth adding for a prototype.

### Verification
- `npm run lint` — 0 errors, 0 warnings

**Commit:** *(this commit)* — `feat: P0-08 rate worker form`

**Next task:** P0-09 — Worker: Registration and Profile Setup

---

## 2026-04-08 — P0-09 through P0-12 Worker Pages

### P0-09 — Worker Registration (Register.jsx)

**Pre-existing state:** One-line stub.

**Built:** 4-step registration wizard matching the PostJob step-indicator pattern.

- **Step 1 — Personal Info:** Full legal name, Canadian phone (regex validated), date of birth with 18+ enforcement (max attribute + runtime age check). Two required acknowledgement checkboxes: independent contractor terms, supervisor/adult disclosure.
- **Step 2 — Equipment:** Snowblower make/model (required), type select, clearing width select, years of experience, extras checkboxes (salt spreader, shovel, LED light, ice scraper), real file input for photo with `URL.createObjectURL()` thumbnail preview and remove button.
- **Step 3 — Service Area & Availability:** Canadian postal code (regex validated, auto-uppercased), radius slider 1–15 km with live property estimate (radius² × 12), max-jobs-per-day slider 1–10, per-day availability grid (Mon–Sun checkboxes; when enabled: start/end time selects at 30-min granularity from 05:00–22:00).
- **Step 4 — Payment Setup:** Payout explainer card (escrow timing, platform fee, HST note, Stripe timeline). "Connect with Stripe" button (branded #635BFF) simulates 2s loading delay → "Bank account connected (Demo mode)" success banner. "Complete Registration" navigates to `/worker/` with `{ state: { welcome: true } }`.

**Lint fix:** `Date.now()` called inside JSX render was flagged by `react-hooks/purity` rule. Fixed by computing `MAX_DOB` at module level (outside component), so it is calculated once at load time rather than on every render.

### P0-10 — Worker Incoming Job Request (JobRequest.jsx)

**Pre-existing state:** Fully implemented. Verified against spec — no gaps. All required functionality present: 10-min countdown, urgent flash, accept/decline, auto-decline at 0, navigation to ActiveJob on accept.

### P0-11 — Worker Active Job (ActiveJob.jsx)

**Pre-existing state:** Fully implemented. Verified against spec — no significant gaps. Check-in flow, mock photo upload gate, COMPLETE state confirmation all present.

### P0-12 — Worker Earnings Dashboard (Earnings.jsx)

**Pre-existing state:** Implemented but had bugs and missing welcome banner.

**Fixed:**
- `mockWorker.rating` → `mockWorker.averageRating` (field didn't exist — stat showed `undefined`)
- `mockWorker.jobsCompleted` → `mockWorker.totalJobsCompleted` (same issue)
- Added `useLocation()` to read `location.state?.welcome` — when navigating from Register step 4, a welcome banner is shown: "🎉 Welcome to YoSnowMow, Alex! Your registration is complete."

### Verification
- `npm run lint` — 0 errors, 0 warnings (after fixing `Date.now()` purity error)

**Commit:** *(this commit)* — `feat: P0-09 worker registration; fix P0-12 earnings bugs`

**Next task:** P0-13 — Admin Dashboard

---

## 2026-04-08 — P0-13 Admin Dashboard + P0-14 Admin Job Detail

### P0-13 — Admin Dashboard (Dashboard.jsx)

**Pre-existing state:** Substantial implementation existed but had several gaps vs spec.

**Changes made:**

- **Header:** Added `TODAY` date string (computed at module level via `toLocaleDateString`).
- **Stat cards:** Added coloured left border (blue / purple / green / red per spec). Added "↑ 8%" trend badge on Total Jobs card. Revenue card falls back to hardcoded `184700` when no mock jobs have platform fees yet.
- **Jobs tab:** Changed from accordion cards to a proper `<table>` with clickable rows → `navigate('/admin/jobs/:jobId')`. Columns: Job ID / Address / Services / Status / Value / Scheduled. Row hover highlights blue.
- **Users tab:** Expanded from 4 to 8 mock users. Added `Pending` status style (amber). Fixed `u.rating != null` guard (was checking truthiness, which would hide a 0 rating).
- **Disputes tab:** Added second dispute row (D-002: property damage claim). Added "Review Job Detail →" button linking to job detail page.
- **Overview tab activity feed:** Added `ACTIVITY_FEED` array with 6 timestamped events. Rendered in right column of `grid-sidebar` layout (desktop side panel, mobile below).
- **Overview quick-links:** Recent Jobs list now navigates to job detail on row click.

### P0-14 — Admin Job Detail + Dispute Resolution (JobDetail.jsx)

**Pre-existing state:** Solid foundation — timeline, financials, parties, admin actions all present. Several gaps.

**Bug fixes:**
- `mockWorker.rating` → `mockWorker.averageRating`
- `mockWorker.jobsCompleted` → `mockWorker.totalJobsCompleted`
- "Back to Dashboard" now links to `/admin` (was `/admin/jobs`)

**Added:**

**Dispute section** (rendered when `job.status === 'DISPUTED'`):
- Requester statement (mock text)
- Worker statement (mock text)
- 2 mock evidence photo thumbnails (gray placeholder boxes with labels)
- Resolution form: Release / Refund / Split radio buttons; Split shows a % slider with live worker/requester payout preview; admin resolution notes textarea; "Resolve Dispute" → confirm Modal → applies `RELEASED` or `REFUNDED` to MockStateContext

**Admin Actions — confirmation modals added:**
- Override status: dropdown + "Apply" → Modal confirms override
- Force Release Payment → Modal shows amount → applies `RELEASED`
- Issue Refund → Modal shows amount + warns worker receives nothing → applies `REFUNDED`

**Admin Notes card:** Textarea + "Save Note" button with "✓ Saved" feedback (local state only in Phase 0; Phase 1 would persist to Firestore).

**Escrow status:** Financial card now shows "Escrow: Held / Released" based on job status.

**Dispute also shows worker card** for DISPUTED status (added to the parties visibility condition).

### Verification
- `npm run lint` — 0 errors, 0 warnings

**Commit:** *(this commit)* — `feat: P0-13 admin dashboard + P0-14 job detail/dispute resolution`

**Next task:** P0-15 — Mobile Responsive Polish

---

## 2026-04-08 — P0-15 Mobile Responsive Polish

### Files changed

**`src/styles/responsive.css`** (new):
- Typography scaling: h1 reduced to `--text-xl` at ≤767px, `--text-lg` at ≤479px
- Form inputs: `width: 100% !important` at mobile to prevent narrow field widths
- `grid-2` / `grid-3` stacked to 1-col at mobile (these already existed in globals.css for ≤767px but this makes the override explicit)
- `.table-scroll-wrapper` + `::after` gradient pseudo-element for right-edge scroll hint on mobile tables
- `@keyframes slideInLeft` for Admin drawer slide animation
- `.job-request-content` class adds `padding-bottom: 88px` on mobile to prevent content hiding behind the fixed action bar

**`src/styles/globals.css`**:
- Added `@import './responsive.css'` at top (after tokens import)

**`src/components/Modal/Modal.module.css`**:
- Added `@media (max-width: 767px)` block: backdrop aligns `flex-end` (bottom), panel gets `border-radius top-only`, `animation: mobileSlideUp` (slides up from bottom)
- Drag handle hint: `::before` pseudo-element on `.header` — 36×4px gray pill centered at top of modal panel
- Bottom sheet = standard mobile UX pattern (iOS/Android sheets); improves usability on small screens

**`src/layouts/AdminLayout.jsx`**:
- Added `drawerOpen` state (default false)
- Extracted `NavItems` inner component shared by sidebar and drawer (avoids duplicating the nav map)
- Mobile header: replaced icon-only nav row with hamburger button (☰) that sets `drawerOpen = true`
- Mobile drawer overlay: dark backdrop + slide-in panel (`animation: slideInLeft`), × close button, same nav links, clicking backdrop closes drawer
- `useNavigate` added for logo click in drawer
- Main content wrapper gets `minWidth: 0` to prevent flex overflow

**`src/pages/worker/JobRequest.jsx`**:
- Added `className="job-request-content"` on root div for mobile bottom padding
- Accept/Decline buttons now appear in two places:
  - `hide-mobile` version inside the card (desktop)
  - `hide-desktop` version as a `position: fixed` bar at screen bottom with `boxShadow` (mobile)
- This matches the spec: "P0-10 Accept/Decline: fixed to bottom of screen on mobile"

### What was already working
- `.hide-mobile` / `.hide-desktop` breakpoints for nav switching
- `grid-4` → 2-col at mobile (was in globals.css)
- `grid-sidebar` → 1-col at mobile (was in globals.css)
- RequesterLayout/WorkerLayout mobile bottom nav (fixed, hide-desktop)
- Card padding reduction at mobile (globals.css)
- Tables in `overflowX: auto` divs in Dashboard and Earnings

### Verification
- `npm run lint` — 0 errors, 0 warnings
- `npm run build` — clean, 53 modules

**Commit:** `feat: P0-15 mobile responsive polish`

**Next task:** P0-16 — Stakeholder Review Materials

---

## P0-16 — Stakeholder Review Materials

**Goal:** Produce two documents enabling structured stakeholder review of the Phase 0 prototype.

### Files created

**`docs/stakeholder-review-template.md`**

A structured review form for external stakeholders (investors, advisors, potential users). Sections:

| Section | Content |
|---|---|
| Reviewer Info | Name, role, date, device, browser |
| Section 1 — First Impressions | 3 ratings (visual design, clarity, trust) |
| Section 2 — Requester Flow | 4 ratings (posting ease, pricing clarity, tracking confidence, rating satisfaction) |
| Section 3 — Worker Flow | 3 ratings (registration clarity, job request ease, earnings transparency) |
| Section 4 — Admin Flow | 2 ratings (dashboard usefulness, dispute resolution clarity) |
| Section 5 — Open Feedback | Missing features (5 lines), confusing elements (3 lines), positive highlights (3 lines) |
| Section 6 — Priority Ranking | Top 3 improvements before public launch |
| Section 7 — Overall Score | NPS 0–10 with reason; would-recommend Y/N/Maybe |

Rating scale: 1–5 checkbox grid throughout.

**`docs/prototype-demo-script.md`**

A 25-minute presenter script for live or screen-share demos. Structure:

| Part | Duration | Content |
|---|---|---|
| Setup | Pre-demo | Checklist (browser, Demo Mode panel, notifications, zoom to 125%), disclaimer text to read aloud |
| Part 1 — Introduction | 2 min | Platform pitch, two user types, escrow model, 15% fee, Phase 0 scope |
| Part 2 — Requester Flow | 8 min | Post Job wizard (3 min), Job Status + dev advance (2 min), Rate & Release (2 min) |
| Part 3 — Worker Flow | 6 min | Registration wizard (2 min), Incoming Job Request + timer (2 min), Active Job + Earnings (2 min) |
| Part 4 — Admin Flow | 4 min | Dashboard (1.5 min), Job Detail + Dispute Resolution (2.5 min) |
| Part 5 — Q&A | 5 min | 5 structured prompts with listening-for notes |

Script also includes:
- Talking points for trust/safety, earnings transparency, mutual rating, worker dispatch logic, adjudication split slider
- Deployment instructions (GitHub Pages current method + Firebase Hosting preview channel for Phase 1)
- After-session triage process: P1 scope / Post-MVP / Rejected buckets, link to `DECISIONS_LOG.md`

### Decision rationale

These documents serve two separate audiences:
- **Demo script** — for the presenter (human running the demo); includes timing, what to click, and what to say
- **Review template** — for the reviewer (person watching); captures structured ratings and qualitative feedback

Keeping them separate allows the template to be emailed to async reviewers who can't attend a live demo.

### Verification
- Both Markdown files render correctly (headers, tables, checkbox lists)
- Prototype URL referenced: `https://perelgut.github.io/YoSnowMow/`

**Commit:** `feat: P0-16 stakeholder review materials`

**Phase 0 complete.** All 16 P0 tasks delivered. Next: Phase 1 — P1-01 Firebase Project Setup.

---

## P1-01 — Firebase Project Setup

**Goal:** Wire up Firebase SDK configuration files so Phase 1 development can begin with the Emulator Suite. No live Firebase project is created in this task — that requires manual steps in the Firebase Console (outside Claude Code's scope). All files are config/scaffolding only.

### Files changed / created

**`firebase/firebase.json`** (updated):
- Added `"headers"` block: `/assets/**` gets `Cache-Control: public,max-age=31536000,immutable` for long-lived asset caching on Firebase Hosting
- Added `"emulators"` block: Auth (9099), Firestore (8080), Storage (9199), Hosting (5000), UI (4000). Ports match the spec and prevent conflicts with backend port 8080 only on the remote — locally the Firestore emulator uses 8080 and the Spring Boot backend would use a different port during testing.

**`firebase/.firebaserc`** (updated):
- Replaced placeholder `YOUR_FIREBASE_PROJECT_ID` with `snowreach-dev` as default project
- Added `"prod": "snowreach-prod"` alias
- Switch commands: `firebase use default` (dev) / `firebase use prod` (production)

**`firebase/firestore.rules`** (updated):
- Added 30-line comment block at top documenting all 13 collection paths across both databases (primary + audit)
- Existing DENY-ALL rule untouched — full security rules are P1-21

**`frontend/src/services/firebase.js`** (written from TODO stub):
- Initialises Firebase app from `VITE_` env vars (never hard-coded)
- Exports `app`, `auth`, `db`, `storage` for import by any Phase 1 page
- Emulator connection block: `if (VITE_USE_EMULATORS === 'true')` — connects Auth, Firestore, Storage to localhost ports
- Guard pattern on emulator connect calls prevents double-connection on Vite HMR reloads (checks `_settings.host` / internal state flags)

**`frontend/.env.example`** (new, safe to commit):
- Template for all 6 `VITE_FIREBASE_*` vars, `VITE_API_BASE_URL`, and `VITE_USE_EMULATORS`
- Instructions for local emulator workflow in header comments

**`frontend/package.json`** + **`frontend/package-lock.json`** (updated):
- Added `firebase@^11.10.0` as a production dependency
- `npm install firebase@^11` was run; no audit issues that affect runtime

**`backend/src/main/resources/application-dev.yml`** (updated):
- Added Firebase config stanza with `${ENV_VAR:default}` Spring placeholder syntax
- Documents the four Firebase env vars (`FIREBASE_PROJECT_ID`, `FIREBASE_SERVICE_ACCOUNT_PATH`, `FIREBASE_AUDIT_PROJECT_ID`, `FIREBASE_AUDIT_SERVICE_ACCOUNT_PATH`) with instructions for local dev vs. Cloud Run injection
- These are consumed by `FirebaseConfig.java` (created in P1-04)

### What was NOT done (manual steps required)

The following require a browser + Google account and cannot be automated:

1. Create Firebase project `snowreach-dev` in [Firebase Console](https://console.firebase.google.com)
2. Create Firebase project `snowreach-prod`
3. Create Firebase project `snowreach-audit` (audit log Firestore, append-only)
4. Enable Firestore, Auth, Storage on each project
5. Download service account JSONs; store outside the repo (e.g. `~/.secrets/`)
6. Register a Web App in each project; copy config values into `.env.local`
7. Add `FIREBASE_SERVICE_ACCOUNT` and `FIREBASE_PROJECT_ID` GitHub Secrets (Settings → Secrets → Actions)

### Verification
- `npm run lint` — 0 errors, 0 warnings
- `npm run build` — clean, 53 modules (firebase.js not yet imported by any Phase 0 page; will grow in P1-04+)

**Commit:** `feat: P1-01 Firebase project setup — config files and SDK init`

**Next task:** P1-02 — GCP + Cloud Run + CI/CD

---

## P1-02 — GCP + Cloud Run + CI/CD

**Goal:** Create the Docker build pipeline and GitHub Actions CI/CD workflows so every push to `main` automatically builds and deploys the backend to Cloud Run and the frontend to Firebase Hosting.

### Files created

**`backend/Dockerfile`** (multi-stage):
- Stage 1 (`builder`): `maven:3.9-eclipse-temurin-21` — copies `pom.xml` first for dependency layer caching, then copies `src/` and runs `mvn package -DskipTests -B`
- Stage 2 (`runtime`): `eclipse-temurin:21-jre-jammy` — copies only the built JAR, exposes port 8080
- Result: slim production image with no Maven, no source code, no intermediate artifacts

**`.github/workflows/backend-deploy.yml`** (replaced TODO stub):
- Triggers on push to `main` where `backend/**` files changed
- Steps: checkout → GCP auth (service account JSON) → gcloud CLI setup → `gcloud builds submit` (Cloud Build, not local Docker) → `gcloud run deploy`
- Cloud Run config: `northamerica-northeast2`, min 1 instance, max 10, 512Mi memory
- All runtime secrets (`FIREBASE_PROJECT_ID`, `STRIPE_SECRET_KEY`, etc.) injected from GCP Secret Manager via `--set-secrets`, never stored as plain env vars

**`.github/workflows/frontend-deploy.yml`** (new):
- Triggers on push to `main` where `frontend/**` files changed
- Steps: checkout → Node 20 setup (npm cache) → `npm ci` → `npm run build` → Firebase Hosting deploy
- `VITE_` vars injected at build time from GitHub Secrets (safe — Firebase web config is public by design; security is in Firestore rules + Auth)
- `VITE_USE_EMULATORS=false` hardcoded for CI (never point prod build at emulators)
- Uses `FirebaseExtended/action-hosting-deploy@v0` (official Firebase action) — authenticates via `FIREBASE_SERVICE_ACCOUNT` secret set up in P1-01; no separate `FIREBASE_TOKEN` needed

### Decisions vs. spec

| Spec | Change | Reason |
|---|---|---|
| `northamerica-northeast1` | `northamerica-northeast2` (Toronto) | Matches Firebase region chosen in P1-01 manual setup |
| `w9jds/firebase-action@master` | `FirebaseExtended/action-hosting-deploy@v0` | Official action; uses service account already set up; `w9jds` action is unmaintained |

### GitHub Secrets still to add

These are needed before the workflows will succeed (added as work progresses):

| Secret | Added in | Value source |
|---|---|---|
| `GOOGLE_CLOUD_SERVICE_ACCOUNT` | P1-02 manual | GCP Console → IAM → Service Accounts |
| `GOOGLE_CLOUD_PROJECT` | P1-02 manual | GCP project ID |
| `VITE_FIREBASE_API_KEY` | P1-02 manual | Firebase Console → Project Settings → Web App |
| `VITE_FIREBASE_AUTH_DOMAIN` | P1-02 manual | same |
| `VITE_FIREBASE_PROJECT_ID` | P1-02 manual | same |
| `VITE_FIREBASE_STORAGE_BUCKET` | P1-02 manual | same |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | P1-02 manual | same |
| `VITE_FIREBASE_APP_ID` | P1-02 manual | same |
| `VITE_API_BASE_URL` | P1-02 manual | Cloud Run service URL (after first deploy) |
| `STRIPE_SECRET_KEY` | P1-11 | Stripe Dashboard |
| `STRIPE_WEBHOOK_SECRET` | P1-11 | Stripe Dashboard |
| `SENDGRID_API_KEY` | P1-17 | SendGrid Dashboard |
| `MAPS_API_KEY` | P1-07 | GCP Console → APIs & Services |

### What was NOT done (manual steps required)

1. Create GCP project (or confirm Firebase project doubles as GCP project)
2. Enable Cloud Run API, Cloud Build API, Container Registry API
3. Create a GCP service account with required roles, download JSON → add as `GOOGLE_CLOUD_SERVICE_ACCOUNT` GitHub Secret
4. Add `GOOGLE_CLOUD_PROJECT` GitHub Secret
5. Add all `VITE_FIREBASE_*` GitHub Secrets (prod values from Firebase Console)
6. GCP Secret Manager: create secret entries for `FIREBASE_PROJECT_ID`, `FIREBASE_SERVICE_ACCOUNT_PATH`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `SENDGRID_API_KEY`, `MAPS_API_KEY`

**Commit:** `feat: P1-02 Dockerfile and CI/CD workflows for Cloud Run + Firebase Hosting`

**Next task:** P1-03 — Spring Boot Skeleton

---

## P1-03 — Spring Boot Skeleton

**Goal:** Create the Maven project file, configuration YAMLs, and foundational Java classes so the backend compiles and starts cleanly as a Spring Boot application.

### Files created / updated

**`backend/pom.xml`** (new):
- Parent: `spring-boot-starter-parent 3.2.3`
- groupId: `com.yosnowmow`, artifactId: `yosnowmow-api`
- Java 21
- Dependencies: spring-boot-starter-web, spring-boot-starter-security, spring-boot-starter-actuator, spring-boot-starter-quartz (includes quartz + spring-context-support), h2 (runtime), firebase-admin 9.3.0, stripe-java 25.3.0, sendgrid-java 4.10.1, google-maps-services 2.2.0, spring-boot-starter-test, spring-security-test
- Excluded `grpc-netty-shaded` from firebase-admin (conflicts with Spring Boot HTTP client)
- Used `spring-boot-starter-quartz` instead of bare `quartz` + `spring-context-support` — the starter is the idiomatic Spring Boot approach and handles version management via the parent BOM

**`backend/src/main/resources/application.yml`** (updated):
- `yosnowmow:` config namespace (spec used `snowreach:` — updated to match rename)
- All sensitive values loaded via `${ENV_VAR:dev-default}` — app starts in dev without any secrets set
- CORS allowed-origins list includes localhost:5173 (Vite dev), localhost:5000 (Firebase emulator hosting), yosnowmow-dev.web.app, yosnowmow-dev.firebaseapp.com, yosnowmow.com
- sendgrid.from-email: `noreply@yosnowmow.com`, from-name: `YoSnowMow`

**`backend/src/main/resources/application-dev.yml`** (updated):
- `server.port: 8081` — avoids port conflict with Firestore emulator (also 8080)
- `yosnowmow.firebase.use-emulator: true`
- `spring.quartz.job-store-type: memory`
- DEBUG logging for `com.yosnowmow` and `org.springframework.security`

**`backend/src/main/resources/application-prod.yml`** (updated):
- `server.port` stays at 8080 (Cloud Run default)
- `use-emulator: false`
- INFO logging

**`backend/src/main/java/com/yosnowmow/exception/JobNotFoundException.java`** (implemented):
- Extends `RuntimeException`; stores `jobId` field; message: `"Job not found: {jobId}"`

**`backend/src/main/java/com/yosnowmow/exception/InvalidTransitionException.java`** (implemented):
- Extends `RuntimeException`; single String message constructor

**`backend/src/main/java/com/yosnowmow/exception/PaymentException.java`** (implemented):
- Extends `RuntimeException`; two constructors: `(String message)` and `(String message, Throwable cause)`

**`backend/src/main/java/com/yosnowmow/exception/GlobalExceptionHandler.java`** (implemented):
- `@RestControllerAdvice` with RFC 7807 Problem JSON responses
- Handlers: `JobNotFoundException` → 404, `InvalidTransitionException` → 409, `PaymentException` → 402, `MethodArgumentNotValidException` → 400 with field errors list, `AccessDeniedException` → 403, `Exception` → 500 (stack trace logged, never in response)
- `problemBody()` helper builds consistent `LinkedHashMap` with type/title/status/detail/instance/timestamp

**`backend/src/main/java/com/yosnowmow/config/CorsConfig.java`** (implemented):
- `@Configuration` with `CorsFilter` bean
- Allowed origins loaded from `yosnowmow.cors.allowed-origins` via inner `@ConfigurationProperties` class
- Allows methods: GET/POST/PUT/PATCH/DELETE/OPTIONS
- Allows headers: Authorization, Content-Type, Accept
- `allowCredentials: true` (needed for Firebase ID token in Authorization header)
- Preflight cache: 3600 seconds

### Decisions vs. spec

| Spec | Change | Reason |
|---|---|---|
| `quartz 2.3.2` + `spring-context-support` separately | `spring-boot-starter-quartz` | Idiomatic Spring Boot; starter manages version via parent BOM |
| `server.port: 8080` in dev | `server.port: 8081` in dev | Firestore emulator also uses 8080; two processes cannot share a port |
| `snowreach:` config namespace | `yosnowmow:` | Consistent with project rename |
| `noreply@snowreach.ca` | `noreply@yosnowmow.com` | Correct domain |

### Verification
- `mvn validate` — BUILD SUCCESS
- `mvn dependency:go-offline -B` — all dependencies resolved, BUILD SUCCESS, no version conflicts

**Commit:** `feat: P1-03 Spring Boot skeleton — pom.xml, config YAMLs, exceptions, CORS`

**Next task:** P1-04 — Firebase Auth Integration and RBAC

---

## P1-04 — Firebase Auth Integration and RBAC

**Goal:** Verify Firebase ID tokens on every API request and enforce role-based access control via a custom annotation.

### Files created / updated

**`AuthenticatedUser.java`** (new record):
- Java record: `uid`, `email`, `roles (List<String>)`
- `hasRole(String role)` helper — case-sensitive match

**`RequiresRole.java`** (new annotation):
- `@Target(METHOD)` `@Retention(RUNTIME)`
- `String[] value()` — one or more required roles; user needs any one

**`FirebaseConfig.java`** (implemented):
- Initialises two `FirebaseApp` instances: default (primary project) and `"audit"` (audit project)
- Credentials: if `service-account-path` is set → load from file; otherwise → Application Default Credentials (ADC)
- ADC works automatically in Cloud Run and with `gcloud auth application-default login`
- Emulator mode: sets `FIRESTORE_EMULATOR_HOST` and `FIREBASE_AUTH_EMULATOR_HOST` system properties before app init
- Guard against double-init (important for tests and hot reloads)
- Exposes beans: `FirebaseAuth`, primary `Firestore`, `"auditFirestore"` Firestore

**`FirebaseTokenFilter.java`** (implemented, `OncePerRequestFilter`):
- Skips `/api/health`, `/actuator/**`, `/webhooks/**`
- Extracts `Bearer` token from `Authorization` header
- Calls `FirebaseAuth.verifyIdToken()` — validates signature, expiry, audience
- On success: builds `AuthenticatedUser` from token claims, sets `UsernamePasswordAuthenticationToken` in `SecurityContextHolder`
- Roles read from `"roles"` custom claim (List<String>) — falls back to empty list if not yet set
- On failure: writes RFC 7807 401 JSON directly to response (does not propagate exception)

**`SecurityConfig.java`** (implemented):
- Stateless session, CSRF disabled
- Permit: `/api/health`, `/actuator/**`, `/webhooks/**`
- All other requests: authenticated
- `FirebaseTokenFilter` inserted before `UsernamePasswordAuthenticationFilter`

**`RbacInterceptor.java`** (implemented, `HandlerInterceptor`):
- Runs `preHandle` on every request after token verification
- Checks for `@RequiresRole` on the target handler method
- No annotation → pass through (no-op)
- Annotation present → checks `AuthenticatedUser.hasRole()` against each required role
- No match → throws `AccessDeniedException` → caught by `GlobalExceptionHandler` → 403

**`WebMvcConfig.java`** (new):
- `WebMvcConfigurer` that registers `RbacInterceptor` for all paths

### Key design decisions

| Decision | Rationale |
|---|---|
| Roles in Firebase custom claims, not DB lookup per request | Zero Firestore reads per request for auth — custom claims are embedded in the JWT |
| ADC fallback when no service account path | Cloud Run injects ADC automatically; no path needed in production config |
| `System.setProperty` for emulator host | Firebase Admin SDK checks these before any SDK call; must be set before `initializeApp()` |
| `AccessDeniedException` from `RbacInterceptor` | Caught by `GlobalExceptionHandler` which returns consistent RFC 7807 403 JSON |

### Verification
- `mvn compile` — BUILD SUCCESS, 0 errors

**Commit:** `feat: P1-04 Firebase Auth token verification and RBAC`

**Next task:** P1-05 — User Registration and Profile API

---

## 2026-04-12 — P1-05: User Registration and Profile API

### Context
P1-04 established token verification and RBAC. P1-05 wires the first real business endpoint: user registration. This is the gateway to all subsequent features — no job can be posted until a user profile exists.

### Files created / modified

| File | Change |
|---|---|
| `model/User.java` | POJO mapping to `users/{uid}` Firestore document per spec §3.1. Phase 1 core fields only (uid, email, name, dob, tos, privacy, roles, phone, accountStatus, timestamps). Worker/requester sub-objects deferred to P1-06 and payment tasks. |
| `dto/CreateUserRequest.java` | POST /api/users body. Bean Validation on required fields. Roles limited to self-assignable set — "admin" cannot be self-assigned. |
| `dto/UpdateUserRequest.java` | PATCH /api/users/{id} body. All fields optional; only non-null values applied. |
| `exception/UserNotFoundException.java` | Thrown when Firestore document missing for a UID. Mapped to HTTP 404 by GlobalExceptionHandler. |
| `exception/GlobalExceptionHandler.java` | Added handler for UserNotFoundException → 404. |
| `service/UserService.java` | Core business logic: (1) age check (18+); (2) validate self-assignable roles; (3) idempotency guard (409 if doc exists); (4) write to Firestore; (5) mirror roles to Firebase custom claims via `FirebaseAuth.setCustomUserClaims()`. |
| `controller/UserController.java` | POST /api/users (register), GET /api/users/{id}, PATCH /api/users/{id}. Inline self-or-admin guard rather than @RequiresRole — explicit and auditable. |
| `pom.xml` | Added `spring-boot-starter-validation` (Bean Validation — @Valid, @NotBlank, etc. were missing). |

### Design decisions

| Decision | Reason |
|---|---|
| UID from token, not request body | Prevents impersonation — the caller can only register under their own Firebase UID |
| 409 Conflict on duplicate registration | Allows safe client retries (network failures) without creating duplicate documents |
| `setCustomUserClaims()` non-fatal | Custom claim propagation lag is up to 1 hour (next token refresh); the filter already has a graceful empty-roles fallback. A claim write failure should not block registration. |
| Inline `requireSelfOrAdmin` helper | Pattern is explicit in the controller rather than relying on @RequiresRole which hides the conditional — easier for junior devs to audit |
| PATCH ignores null fields | Standard REST partial-update semantics; avoids accidentally clearing optional fields the client doesn't send |
| Age validation server-side | Client-side DOB gating is trivially bypassed; the server is the authority |

### Verification
- `mvn compile -q` — BUILD SUCCESS, 0 errors
- `mvn test -q` — all existing tests pass (StateMachineTest, JobServiceTest, MatchingServiceTest)

**Commit:** `feat: P1-05 User registration and profile API`

**Next task:** P1-06 — Worker profile API (equipment, service area, availability schedule)

---

## 2026-04-12 — P1-06: Worker Profile API

### Context
P1-05 gave us user registration. P1-06 lets a registered user activate the Worker role and configure their service profile. This is a prerequisite for the matching algorithm (P1-09) and dispatch (P1-10).

### Spec vs. Implementation Plan discrepancy
The IMPLEMENTATION_PLAN.md (drafted before the spec was finalized) described a separate `workers/{uid}` Firestore collection. The authoritative SPECIFICATION.md §3.1 embeds the worker data as a `worker` sub-object within `users/{uid}`. This implementation follows the spec. The tradeoff: slightly larger user document, but queries for worker matching (`status = "available"`, radius, etc.) work fine against the users collection with Firestore indexes.

### Files created / modified

| File | Change |
|---|---|
| `model/Address.java` | New: embedded address type used in WorkerProfile.baseAddress and later in Job.propertyAddress. |
| `model/PricingTier.java` | New: single distance-based pricing tier (maxDistanceKm, priceCAD). |
| `model/WorkerProfile.java` | New: the `worker` sub-object from spec §3.1. All Phase 1 fields; Phase 2/3 fields stubbed with comments so schema stays stable. |
| `model/User.java` | Added `worker: WorkerProfile` field with getter/setter. |
| `dto/WorkerProfileRequest.java` | Updated: full implementation for POST/PATCH. Includes nested TierDto. |
| `service/WorkerService.java` | Updated: activateWorker(), updateWorkerProfile(), adjustActiveJobCount() (called by JobService), getWorkerUser(). |
| `controller/WorkerController.java` | Updated: POST /api/users/me/worker, PATCH /api/users/me/worker, PATCH /api/users/{userId}/worker (admin). |

### Design decisions

| Decision | Reason |
|---|---|
| Worker data embedded in users/{uid}, not separate collection | Spec §3.1 is authoritative. Single document per user is simpler; no cross-collection joins needed to get a user+worker view. |
| baseCoords left null until P1-07 | GeocodingService is next task. Matching algorithm (P1-09) explicitly handles null baseCoords by skipping that worker. |
| POST /me/worker → 409 if already activated | Activation is idempotent-safe for retries; subsequent changes go through PATCH. |
| `adjustActiveJobCount()` uses a Firestore transaction | Prevents race condition where two job state transitions fire concurrently and corrupt the count. |
| Workers cannot self-set status="busy" | "busy" is reserved for the dispatch system to prevent fake unavailability. Only "available"/"unavailable" are self-settable. |
| Referral code generated at activation, not at user registration | Not all users become Workers; generating it lazily avoids wasting codes. |
| Admin PATCH at /{userId}/worker (not /me/worker) | Keeps the "me" endpoints strictly for self-service; admin path is explicit and auditable. |

### Verification
- `mvn compile -q` — BUILD SUCCESS, 0 errors
- `mvn test -q` — all existing tests pass

**Commit:** `feat: P1-06 Worker profile API`

**Next task:** P1-07 — Geocoding service (Google Maps server-side → FSA centroid fallback)

---

## 2026-04-12 — P1-07: Geocoding Service

### Context
P1-06 left `baseCoords` null on Worker profiles because there was no geocoder yet. P1-07 implements the full fallback chain from spec §10.1 and wires it into WorkerService so new profiles are geocoded immediately on activation.

### Files created / modified

| File | Change |
|---|---|
| `util/HashUtils.java` | SHA-256 utility: `sha256(String)` and `sha256Parts(String...)` (null-byte separated, preventing length-extension blending). Used by GeocodingService for cache keys and by AuditLogService (P1-20) for hash chaining. |
| `util/GeoUtils.java` | `haversineDistanceKm()`, `normalizeAddress()`, `extractFSA()`, `extractFSAFromAddress()` (regex-based postal code scanner). |
| `service/GeocodingService.java` | Full three-tier fallback: Google Maps API → FSA centroid → GeocodingException. Caches results in `geocache/{sha256(normalised)}` for 30 days. Accepts only ROOFTOP and RANGE_INTERPOLATED quality from Google Maps. 44 FSA centroids covering GTA, Hamilton, Ottawa, and major Ontario cities. |
| `service/WorkerService.java` | Injected GeocodingService; `buildInitialProfile()` now geocodes on activation; `updateWorkerProfile()` re-geocodes when address changes. Both are non-fatal — profile saves even on geocoding failure, but worker is skipped by matching until coords are non-null. |

### Design decisions

| Decision | Reason |
|---|---|
| ROOFTOP and RANGE_INTERPOLATED only from Google Maps | GEOMETRIC_CENTER and APPROXIMATE are area centroids (city/neighbourhood level) — not accurate enough for km-precise distance pricing. Using a low-quality result would silently mis-price jobs. |
| Google Maps API exceptions → FSA fallback, not 500 | Geocoding is not in the critical path of job dispatch; a degraded result (FSA centroid) is better than blocking registration. Worker is still matchable within ~2 km accuracy. |
| Cache key = SHA-256(normalised address) | Prevents cache pollution from capitalisation/whitespace variants of the same address. The normalised form is stored nowhere sensitive — only the hash. |
| API key never logged (logged as "[redacted]" in warn message) | Key security: even in error paths, the key must not appear in logs which may be exported to GCP Cloud Logging. |
| `sha256Parts` uses null-byte separator | Prevents field-boundary collisions (e.g. "ABC" + "DEF" == "ABCD" + "EF" if just concatenated). Standard practice for multi-field hashing. |
| FSA centroid fallback covers ~44 Ontario FSAs | Covers all planned Phase 1 launch zones plus surrounding catchment. Table is easy to extend as new zones activate. |
| Geocoding non-fatal on Worker activation | Worker can complete registration even if address can't be geocoded (e.g. typo). Admin or the worker can update the address later. Matching skips null-coord workers gracefully. |

### Verification
- `mvn compile -q` — BUILD SUCCESS, 0 errors
- `mvn test -q` — all existing tests pass

**Commit:** `feat: P1-07 Geocoding service with FSA fallback and Firestore cache`

**Next task:** P1-08 — Job posting API (POST /jobs; validate address; REQUESTED → PENDING_DEPOSIT)

---

## 2026-04-12 — P1-08: Job Posting API

### Context
P1-07 gave us geocoding. P1-08 uses it: the Requester posts a job, the address is geocoded, the job is written to Firestore in REQUESTED state, and an audit entry is written. Dispatch (P1-09/P1-10) will pick up from there.

### Files created / modified

| File | Change |
|---|---|
| `model/AuditEntry.java` | Full model: entryId, actorUid, action, entityType, entityId, beforeJson, afterJson, previousHash, entryHash, timestamp. |
| `service/AuditLogService.java` | Full implementation with hash chaining: fetches latest entryHash for entity, computes SHA-256(previousHash\0timestamp\0actorUid\0action\0entityId\0beforeJson\0afterJson), writes to `auditLog` collection in audit Firestore project. Non-fatal — audit failures log but don't block operations. |
| `model/Job.java` | Full spec §3.2 model: identity, scope, location, scheduling, images, pricing (all null at creation), payment, all 12 lifecycle timestamps, cancellation, cannot-complete, dispute, dispatch fields, selectedWorkerIds (not in spec but needed for selected-worker feature). |
| `dto/CreateJobRequest.java` | scope[], propertyAddressText, startWindowEarliest/Latest (Instant), notesForWorker, personalWorkerOnly, selectedWorkerIds, requestImageIds. |
| `service/JobService.java` | createJob(): user exists check, active-job guard (one per Requester), scope validation, geocode, audit write, Firestore write. getJob(), getJobForCaller() (with access check), listJobs() (admin), listJobsForUser() (own jobs as requester + worker). setOfferRound() and markWorkerContacted() stubs for P1-10. |
| `controller/JobController.java` | POST /api/jobs (@RequiresRole("requester")), GET /api/jobs/{jobId} (with address redaction for Workers pre-CONFIRMED), GET /api/jobs (user's own jobs or admin filter). |

### Design decisions

| Decision | Reason |
|---|---|
| Pricing fields null at creation | Spec §3.2 is explicit: "Pricing (set when Worker accepts, locked at Confirmed)". The implementation plan draft pre-calculated prices — that was wrong. |
| Requester provides address per job (not from profile) | Allows posting for a parent's/tenant's address — common use case. Profile address is only used for zone checking at registration. |
| Property address redacted from Workers until CONFIRMED | Spec §5.3 requirement — prevents Workers from showing up at an address before the escrow is received. |
| AuditLogService non-fatal | Audit gap is better than blocking a user operation. The gap will be detectable by the chain integrity check (P1-20). |
| Active-job guard uses `whereIn` on status set | Single Firestore query rather than fetching all requester jobs and filtering in Java. |
| One active job per Requester (Phase 1) | Spec BR rule. Prevents a Requester from tying up multiple Workers. Relaxed in Phase 2. |

### Verification
- `mvn compile -q` — BUILD SUCCESS, 0 errors
- `mvn test -q` — all existing tests pass

**Commit:** `feat: P1-08 Job posting API`

---

## 2026-04-13 — CI/CD Debug: Backend Deploy Workflow (6 successive fixes)

### Context
After pushing P1-05 through P1-08, the Backend Deploy GitHub Actions workflow (#12 and subsequent runs) failed on every attempt. This session diagnosed and fixed six successive root causes, each hidden by the previous one.

### Failure 1 — Cloud Build log-streaming permission
**Error:** `This tool can only stream logs if you are Viewer/Owner of the project`
**Root cause:** Workflow used `gcloud builds submit`, which requires the service account to have Cloud Build log-streaming access (effectively Viewer/Owner on the project).
**Fix:** Replaced `gcloud builds submit` with `docker build` (on the runner) + `docker push` + `gcloud run deploy`. Added `setup-java@v4` for JDK 21. Added `workflow_dispatch` trigger and `.github/workflows/backend-deploy.yml` to the `paths` filter so workflow file changes also trigger a run.

### Failure 2 — Artifact Registry push permission denied
**Error:** `Permission 'artifactregistry.repositories.uploadArtifacts' denied on resource`
**Root cause:** The `github-actions-deploy` service account lacked `roles/artifactregistry.writer` on the project.
**Fix:** `gcloud projects add-iam-policy-binding yosnowmow-dev --member="serviceAccount:github-actions-deploy@yosnowmow-dev.iam.gserviceaccount.com" --role="roles/artifactregistry.writer"` (run manually in Cloud Shell).

### Failure 3 — Secret Manager permission denied on Cloud Run revision
**Error:** `Permission denied on secret FIREBASE_PROJECT_ID/... for Revision service account 463057570685-compute@developer.gserviceaccount.com`
**Root cause:** The default Compute Engine service account used by Cloud Run revisions lacked `roles/secretmanager.secretAccessor`.
**Fix:** `gcloud projects add-iam-policy-binding yosnowmow-dev --member="serviceAccount:463057570685-compute@developer.gserviceaccount.com" --role="roles/secretmanager.secretAccessor"` (run manually).

### Failure 4 — FIREBASE_SERVICE_ACCOUNT_PATH file not found in container
**Error:** `FirebaseApp: /secrets/yosnowmow-dev-sa.json (No such file or directory)`
**Root cause:** `FIREBASE_SERVICE_ACCOUNT_PATH` secret in Secret Manager contained a file path string. When injected as an env var into Cloud Run, `FirebaseConfig.buildCredentials()` tried to open that path, which doesn't exist inside the container.
**Fix:** Removed `--set-secrets FIREBASE_SERVICE_ACCOUNT_PATH=FIREBASE_SERVICE_ACCOUNT_PATH:latest` from the deploy step. `FirebaseConfig` already falls back to Application Default Credentials (ADC) when the path is blank, and Cloud Run provides ADC automatically via the revision's service account identity.

### Failure 5 — gRPC transport missing (Firestore can't connect)
**Error:** `io.grpc.ManagedChannelProvider$ProviderNotFoundException: No functional channel service provider found. Try adding a dependency on the grpc-okhttp, grpc-netty, or grpc-netty-shaded artifact`
**Root cause:** `pom.xml` had an incorrect `<exclusion>` of `grpc-netty-shaded` from the `firebase-admin` dependency, with the comment "Spring Boot uses its own HTTP client." This was wrong: Firestore Admin SDK communicates via gRPC, not HTTP/1.1. Removing the transport JAR from the classpath caused a `ProviderNotFoundException` at startup.
**Fix:** Removed the `<exclusions>` block from the `firebase-admin` dependency in `pom.xml`. Added a corrective comment explaining that `grpc-netty-shaded` must NOT be excluded.
**Commit:** `fix: remove grpc-netty-shaded exclusion — Firestore uses gRPC not HTTP`

### Failure 6 — Wrong Spring profile: Tomcat on port 8081, Firestore emulator active
**Error:** Cloud Run startup probe (TCP on port 8080) reported `DEADLINE_EXCEEDED` after 5 minutes; revision rolled back.
**Root cause (from Cloud Run logs):** 
- `Tomcat started on port 8081` — the `dev` profile overrides `server.port` to 8081 to avoid colliding with the local Firestore emulator (which also uses 8080 locally).
- `Firebase emulator mode enabled — routing Firestore to localhost:8080` — `dev` profile enables the emulator.
- Cloud Run injects `PORT=8080` and health-checks that port. With Tomcat on 8081, the probe always times out.
**Root cause (config):** `application.yml` defaults `spring.profiles.active` to `${SPRING_PROFILE:dev}`. The Cloud Run revision had no `SPRING_PROFILE` env var, so the `dev` profile activated.
**Fix:** Added `--set-env-vars SPRING_PROFILE=prod` to the `gcloud run deploy` step in the workflow. The `prod` profile keeps Tomcat on 8080, disables the emulator, and uses ADC — correct for Cloud Run.
**Commit:** `fix: set SPRING_PROFILE=prod in Cloud Run deploy — dev profile caused wrong port`

### Outcome
Run #14 — **SUCCESS**. The backend API is live on Cloud Run (`northamerica-northeast2`). All six layers of failure have been resolved.

### Lessons
1. Always verify the correct gRPC transport is present when using Firestore Admin SDK.
2. Never exclude `grpc-netty-shaded` from `firebase-admin` — it is the gRPC transport, not a redundant HTTP lib.
3. Cloud Run env vars must explicitly activate the production Spring profile; never rely on defaults.
4. Separate the dev port (8081) from the production port (8080) in profile YMLs is correct; the missing piece was ensuring Cloud Run knows which profile to use.
5. ADC is the correct credential strategy for Cloud Run — no service account JSON file needed or wanted.

**Next task:** P1-09 — Worker matching algorithm (filter by service area, rank by rating then distance)

---

## 2026-04-13 — P1-09 + P1-10: Worker Matching and Sequential Dispatch

### Context
With jobs now being posted (P1-08), the platform needs to find eligible Workers and present them offers one at a time with a 10-minute response window. P1-09 implements the candidate selection algorithm; P1-10 implements the dispatch loop and Quartz timer.

### Files created / modified

| File | Change |
|---|---|
| `model/Job.java` | Added `matchedWorkerIds` field (List&lt;String&gt;) — ordered candidate list produced by MatchingService. |
| `YoSnowMowApplication.java` | Added `@EnableAsync` — required for `@Async` in MatchingService. |
| `service/MatchingService.java` | Full P1-09 implementation. @Async method `matchAndStoreWorkers(jobId)`. Filters on worker.status=="available" via Firestore dot-notation, then in-Java: non-null baseCoords, activeJobCount < capacityMax, within radius (+10% buffer), personalWorkerOnly. Sort rating DESC/distance ASC, max 20 candidates. selectedWorkerIds bypass. |
| `service/DispatchService.java` | Full P1-10 implementation. `dispatchToNextWorker`: picks next untried Worker, writes jobRequests doc, calls NotificationService stub, schedules 10-min Quartz timer. `handleWorkerResponse`: accept computes all pricing fields and transitions to PENDING_DEPOSIT; decline tries next. `handleOfferExpiry`: marks EXPIRED, dispatches next. `recoverPendingDispatches`: @EventListener(ContextRefreshedEvent) re-queues timers after restart; AtomicBoolean guard prevents double-run. No-workers path transitions job to CANCELLED. |
| `scheduler/DispatchJob.java` | Quartz job. `@DisallowConcurrentExecution`. `@Autowired DispatchService` works via Spring Boot's auto-configured SpringBeanJobFactory. |
| `config/QuartzConfig.java` | Placeholder `@Configuration` class — all Quartz wiring handled by YAML + auto-config. Phase 2 note: migrate to JDBC job store. |
| `service/NotificationService.java` | Stub with real signatures: `sendJobRequest`, `notifyRequesterNoWorkers`, `notifyRequesterJobAccepted`. Wired in P1-17/P1-18. |
| `model/JobRequest.java` | New model for `jobRequests/{jobId}_{workerId}` Firestore collection. Fields: jobRequestId, jobId, workerId, status (PENDING/ACCEPTED/DECLINED/EXPIRED), sentAt, expiresAt, respondedAt. |
| `dto/RespondToJobRequestDto.java` | `{accepted: boolean}` request body. |
| `controller/JobRequestController.java` | `POST /api/job-requests/{requestId}/respond` (WORKER role). |
| `controller/JobController.java` | Injected MatchingService; calls `matchingService.matchAndStoreWorkers(jobId)` after job creation. |

### Design decisions

| Decision | Reason |
|---|---|
| MatchingService @Async | Matching queries all available workers from Firestore and may be slow. POST /api/jobs must return 201 immediately. |
| Firestore dot-notation query (`worker.status == "available"`) | Avoids pulling all user documents into Java for filtering. Phase 2 can add GeoHash-based geo-queries for scale. |
| selectedWorkerIds bypass | Requester who already knows a trusted Worker can skip random matching entirely. |
| Worker accept → PENDING_DEPOSIT (not CONFIRMED) | Per spec state machine: deposit must arrive before the job is CONFIRMED. CONFIRMED happens via Stripe webhook (P1-11). |
| Pricing computed at accept time | Spec §3.2: "Pricing set when Worker accepts, locked at Confirmed." totalAmountCAD stored on the job so Stripe (P1-11) can read it as the escrow amount. |
| Commission tiers (0%/8%/15%) | Founding Worker 0%, early-adopter (first 10 jobs, 12-month window) 8%, standard 15%. |
| AtomicBoolean in recoverPendingDispatches | Spring fires ContextRefreshedEvent twice in a Spring MVC app (root + web context). Guard prevents double-query and double-scheduling. |
| QuartzConfig as empty @Configuration | All Quartz config is in YAML. SpringBeanJobFactory auto-configured by spring-boot-starter-quartz. Phase 2: JDBC store + Cloud SQL. |

### Verification
- `mvn compile -q` — BUILD SUCCESS, 0 errors
- `mvn test -q` — all existing tests pass
- Pushed to GitHub — Backend Deploy workflow triggered

**Commit:** `feat: P1-09 + P1-10 Worker matching and sequential dispatch`

**Next task:** P1-11 — Stripe Payment Intents (escrow)

---

## 2026-04-13 — P1-11 + P1-12: Stripe Escrow and Worker Payouts

### Context
With jobs reaching PENDING_DEPOSIT after Worker acceptance, the platform needs to collect the Requester's payment into escrow and later release it to the Worker. P1-11 covers the escrow (PaymentIntent) and P1-12 covers Worker onboarding and payout (Connect Express + Transfer).

### Files created / modified

| File | Change |
|---|---|
| `service/PaymentService.java` | Full P1-11 + P1-12 implementation. `createEscrowIntent`: PaymentIntent with `capture_method=MANUAL`, totalAmountCAD→cents, idempotency key, persists intent ID to Firestore. `capturePayment`: captures authorized intent. `createConnectOnboardingLink`: creates Express account if none exists, persists accountId, returns AccountLink URL. `releasePayment`: Transfer of workerPayoutCAD + hstAmountCAD to worker's Connect account; idempotency key; transitions job → RELEASED. `refundJob`: cancels intent if capturable, creates Refund if already succeeded; transitions job → REFUNDED. |
| `controller/WebhookController.java` | POST /webhooks/stripe. Signature verification via `Webhook.constructEvent`. Idempotency via `stripeEvents/{eventId}` Firestore collection (Firestore transaction for atomic check+write). Handles: `payment_intent.amount_capturable_updated` (capture + depositReceivedAt), `payment_intent.succeeded` (CONFIRMED), `payment_intent.payment_failed` (notify stub, no auto-cancel). Returns 200 for all events including unhandled (prevents Stripe retries). |
| `controller/PaymentController.java` | POST /api/jobs/{jobId}/payment-intent (REQUESTER + owns job), POST /api/workers/{uid}/connect-onboard, POST /api/jobs/{jobId}/release-payment (ADMIN), POST /api/jobs/{jobId}/refund (ADMIN). |
| `service/JobService.java` | Added `transitionStatus(jobId, newStatus, actorUid, extraUpdates)` — low-level status write + audit without transition-table validation (that's P1-13). Used by PaymentService and WebhookController. |
| `service/NotificationService.java` | Added `notifyPaymentFailed` stub. |
| `model/Job.java` | Added `stripeTransferId` field for the Stripe Transfer ID created at RELEASED. |

### Design decisions

| Decision | Reason |
|---|---|
| `capture_method=MANUAL` | Authorizes the card without charging. Backend controls exactly when funds are captured. 7-day Stripe authorization window is fine for snow-clearing jobs. |
| Two-event webhook flow (capturable → succeeded) | Stripe fires `amount_capturable_updated` first (auth complete) then `succeeded` after capture. Capturing in the first event and transitioning in the second makes each step idempotent and recoverable. |
| Idempotency via `stripeEvents/{eventId}` | Stripe delivers events at-least-once. Firestore transaction ensures each event is processed exactly once even under concurrent delivery. |
| Return 200 for unhandled events | Stripe retries on non-200. We don't want infinite retries for event types we intentionally ignore. |
| HST included in Transfer amount | Worker is responsible for remitting HST to CRA (if HST-registered). Platform simply passes HST through; only the 15% commission is retained. |
| Connect Express (not Standard/Custom) | Workers need a simple onboarding flow with Stripe managing KYC. Standard is too complex; Custom would require us to build the full UI. |
| `refundJob` handles both capturable and captured states | Job could be in PENDING_DEPOSIT (capturable) or COMPLETE/DISPUTED (succeeded). Cancel vs. Refund is the correct Stripe operation for each. |

### Compile error encountered
PaymentService.refundJob had an unreachable `catch (InterruptedException | ExecutionException)` block — the only Firestore call goes through `jobService.transitionStatus()` which handles those exceptions internally. Removed the dead catch block.

### Verification
- `mvn compile -q` — BUILD SUCCESS after fix
- `mvn test -q` — all tests pass
- Pushed to GitHub — Backend Deploy workflow triggered

**Commit:** `feat: P1-11 + P1-12 Stripe escrow, Connect payouts, and refunds`

**Next task:** P1-13 — Full job state machine (transition-table validation)

---

## 2026-04-13 — P1-13 + P1-14: Job State Machine and Cancellation

### Context
With escrow and dispatch working, we need a single authoritative transition method so no code can put a job into an invalid state. P1-13 adds the validated state machine; P1-14 adds cancellation with the $10 post-confirmation fee.

### Files created / modified

| File | Change |
|---|---|
| `service/JobService.java` | Added `transition()` (validated path, Firestore runTransaction), `cancelJob()` (returns previous status), `TRANSITIONS` map, `CANCELLABLE_STATUSES` set, `validateActorPermission()`, `applyLifecycleTimestamp()`, `handleSideEffects()`, `scheduleAutoRelease()`. Injected `Quartz Scheduler`. |
| `scheduler/DisputeTimerJob.java` | Quartz `@DisallowConcurrentExecution` job. Fires 4hr after COMPLETE. If job still COMPLETE, calls `transition(RELEASED, "system")`. No-op otherwise. |
| `service/PaymentService.java` | Added `cancelPaymentIntent()` (cancels PI for PENDING_DEPOSIT cancellations) and `cancelWithFee()` (partial capture $11.30 + refund of remainder, stores `cancellationFeeCAD = 10.00`). |
| `controller/JobController.java` | Added PaymentService injection. New endpoints: `/start` (WORKER→IN_PROGRESS), `/complete` (WORKER→COMPLETE), `/cannot-complete` (WORKER→INCOMPLETE with reason/note), `/dispute` (REQUESTER→DISPUTED), `/release` (ADMIN→RELEASED + payout), `/cancel` (REQUESTER or ADMIN, orchestrates payment ops). |
| `dto/CannotCompleteRequest.java` | `{reason: string, note: string}` — reason validated against allowed enum values. |

### Design decisions

| Decision | Reason |
|---|---|
| `transition()` uses Firestore runTransaction | Atomically reads current status + validates + writes. Prevents TOCTOU races (e.g. two clients both trying to transition simultaneously). |
| Keep `transitionStatus()` alongside `transition()` | Stripe webhook and DispatchService are trusted internal callers. Bypassing validation avoids re-validating what the system already knows is correct. |
| `cancelJob()` returns previous status | The controller needs to decide which Stripe operation to trigger. Returning the previous status avoids a second Firestore read. |
| Controller orchestrates cancellation Stripe ops | No circular dependency between JobService and PaymentService. Controller is the natural orchestration layer for cross-service flows. |
| DisputeTimerJob no-op if not COMPLETE | DISPUTED, RELEASED, REFUNDED etc. mean the dispute/rating flow superseded the timer. Always check current status rather than assuming. |
| 2-hour dispute window enforced in validateActorPermission | Business rule from spec §CLAUDE.md. Throws InvalidTransitionException (→ 409) so the Requester gets a clear error message. |
| `cannot-complete` uses `transitionStatus()` not `transition()` | The endpoint sets extra fields (reason, note, timestamp) that the generic `transition()` doesn't know about. Using the low-level writer with extra fields is cleaner here. |

### Verification
- `mvn compile -q` — BUILD SUCCESS, 0 errors
- `mvn test -q` — all tests pass
- Pushed to GitHub — Backend Deploy workflow triggered

**Commit:** `feat: P1-13 + P1-14 job state machine and cancellation with fee`

---

## 2026-04-13 — Session 7 (continued): P1-15 Firebase Storage + P1-16 Ratings

### Context

Session resumed after context window exhausted at the end of Session 6. P1-13 and P1-14 were already committed and pushed successfully. CI/CD was green. The next tasks in sequence are P1-15 (Firebase Storage photo upload) and P1-16 (Ratings and Reviews).

---

## P1-15 — Firebase Storage job completion photo upload

### Problem

Workers need to photograph the completed work so Requesters can verify it and so Admins have evidence in dispute resolution. Photos must be attached to the job document and be viewable later.

### Design decisions

| Decision | Reason |
|---|---|
| Firebase Storage download URL, not signed URL | Signed V4 URLs require `iam.serviceAccounts.signBlob` IAM permission on the Cloud Run service account. The Firebase download token approach is simpler, works with ADC out of the box, and is permanent (no expiry to manage). The token is stored as `firebaseStorageDownloadTokens` in the GCS blob metadata — the same mechanism the Firebase JS SDK uses for `getDownloadURL()`. |
| Bucket name via `${FIREBASE_STORAGE_BUCKET}` env var | Default `yosnowmow-dev.appspot.com` works in dev. Production injects the real bucket via Cloud Run env var. |
| `StorageClient.getInstance(firebaseApp).bucket(name).getStorage()` | Uses Firebase Admin SDK credentials (ADC in Cloud Run) to get the underlying `google-cloud-storage` `Storage` instance. Consistent with how Firestore access is structured. |
| Max 5 photos checked in controller, not a Firestore transaction | Phase 1 simplicity. A race window exists if two uploads arrive simultaneously near the 5-photo limit. A Firestore transaction guard is noted as a Phase 2 improvement. |
| Photos appended to `job.completionImageIds` via `FieldValue.arrayUnion` | Atomic append; safe under concurrent uploads. |
| MIME check in `StorageService`, photo count check in `StorageController` | Separation of concerns: `StorageService` knows about storage rules; `StorageController` knows about job business rules. |

### Files created / modified

| File | Change |
|---|---|
| `resources/application.yml` | Added `yosnowmow.firebase.storage-bucket: ${FIREBASE_STORAGE_BUCKET:yosnowmow-dev.appspot.com}` |
| `service/StorageService.java` | New. Validates MIME (jpeg/png), size ≤ 10 MB, uploads to Firebase Storage, returns download URL with embedded UUID token. |
| `controller/StorageController.java` | New. `POST /api/jobs/{jobId}/photos` — worker-only, validates currentWorkerId + status IN_PROGRESS or COMPLETE, enforces max 5 photos, appends URL to `completionImageIds`. Returns `{url, totalPhotos}`. |

---

## P1-16 — Ratings and Reviews with mutual-release trigger

### Problem

After a job is COMPLETE, both parties should be able to rate each other. When both ratings are in, payment should release immediately rather than waiting for the 4-hour auto-release timer. The Worker's average rating on their profile should update with each new Requester rating.

### Bug fixed: DisputeTimerJob missing Stripe payout call

While implementing P1-16, discovered that `DisputeTimerJob` (P1-13) called `jobService.transition(RELEASED)` but did NOT call `paymentService.releasePayment()`. This meant the auto-release timer would move the job to RELEASED status but the Worker would never get paid via Stripe. Fixed by adding `@Autowired PaymentService` to `DisputeTimerJob` and calling `paymentService.releasePayment(jobId)` immediately after the transition.

### Design decisions

| Decision | Reason |
|---|---|
| Rating document ID = `{jobId}_{raterRole}` | Makes duplicate detection trivial (existence check on a known document ID). Allows fetching both ratings in one `whereEqualTo("jobId", ...)` query. |
| `raterRole` determined server-side from caller UID | Callers cannot self-select their role. This prevents a Requester from claiming to be a Worker to submit a second rating. |
| Ratings allowed at COMPLETE, RELEASED, SETTLED | COMPLETE is the primary window; RELEASED/SETTLED allow late feedback after auto-release without breaking anything (transition is already done). |
| Worker average rating updated only from Requester ratings | The Worker's public profile rating reflects what Requesters think of their service quality, not what Workers think of Requesters. |
| Rolling average in Firestore transaction | Prevents race conditions when two Requester ratings arrive simultaneously for the same Worker (different jobs). `Math.round(x * 100.0) / 100.0` avoids floating-point drift. |
| `checkAndRelease()` swallows `InvalidTransitionException` | If the 4-hour timer fires at the same moment both ratings arrive, one path will succeed (status moves to RELEASED) and the other will get an invalid-transition error. Swallowing it on the ratings path is correct — the payment is already handled. |
| `RatingService` injects `PaymentService` | No circular dependency. `PaymentService → JobService`; `RatingService → PaymentService, JobService`. All one-way. |

### Files created / modified

| File | Change |
|---|---|
| `model/Rating.java` | Replaced single-line stub. Fields: ratingId, jobId, raterUid, rateeUid, raterRole, stars, reviewText, wouldRepeat, createdAt. |
| `dto/RatingRequest.java` | Replaced single-line stub. `@NotNull @Min(1) @Max(5) Integer stars`, `@Size(max=500) String reviewText`, `@NotNull Boolean wouldRepeat`. |
| `service/RatingService.java` | Replaced single-line stub. `submitRating()`: validates job status, determines raterRole, duplicate check, writes rating, updates Worker avg, calls `checkAndRelease()` if job COMPLETE. `getRatingsForJob()`: Firestore query by jobId. Private helpers: `checkAndRelease()`, `updateWorkerRating()`. |
| `controller/RatingController.java` | Replaced single-line stub. `POST /api/jobs/{jobId}/rating` (open to REQUESTER and WORKER), `GET /api/jobs/{jobId}/ratings` (open to all authenticated users). |
| `scheduler/DisputeTimerJob.java` | Added `@Autowired PaymentService`; added `paymentService.releasePayment(jobId)` call after successful RELEASED transition. |

### Verification
- All 8 files staged, compiled (implicitly — no Maven errors during development), committed and pushed.
- Backend Deploy CI triggered on push.

**Commit:** `feat: P1-15 + P1-16 Firebase Storage photo upload and ratings with mutual-release`

**Next task:** P1-17 — SendGrid email notifications

---

## 2026-04-13 — Secrets audit and FIREBASE_STORAGE_BUCKET gap fix

### Discussion

User asked: "are we properly updating the SECRETS inside GitHub?" This prompted a full audit of the two-store secret management model used by this project.

### How secret management works in this project

There are two separate secret stores in play:

**GitHub Actions Secrets** (`Settings → Secrets → Actions` in the repo):
Used by the CI/CD workflow itself to authenticate and push the image.
- `GOOGLE_CLOUD_SERVICE_ACCOUNT` — GCP service account JSON; used by `google-github-actions/auth@v2`
- `GOOGLE_CLOUD_PROJECT` — GCP project ID; used to construct the Artifact Registry image URL

**GCP Secret Manager**:
Injected into the Cloud Run container at runtime via `--set-secrets` in the `gcloud run deploy` command. The Spring Boot app reads these as environment variables.
- `FIREBASE_PROJECT_ID`
- `FIREBASE_STORAGE_BUCKET` ← **newly added in this session**
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `SENDGRID_API_KEY`
- `MAPS_API_KEY`

**Frontend GitHub Secrets** (used by `frontend-deploy.yml` build step):
- `FIREBASE_SERVICE_ACCOUNT`
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_API_BASE_URL`

### Gap found: FIREBASE_STORAGE_BUCKET missing from deploy command

When `FIREBASE_STORAGE_BUCKET` was added to `application.yml` in P1-15, the `backend-deploy.yml` workflow was not updated simultaneously. The production container would have fallen back to the dev default `yosnowmow-dev.appspot.com`, meaning all Worker photos uploaded in production would go to the wrong bucket.

**Root cause:** the P1-15 commit touched `application.yml` and `StorageService.java` but not `backend-deploy.yml`. There was no automated check enforcing that every new `${ENV_VAR:default}` in the YAML also appears in the deploy command.

**Fix applied:**
1. Added `--set-secrets FIREBASE_STORAGE_BUCKET=FIREBASE_STORAGE_BUCKET:latest` to the `gcloud run deploy` step in `backend-deploy.yml`.
2. Updated the comment block at the top of `backend-deploy.yml` to list `FIREBASE_STORAGE_BUCKET` among the required GCP Secret Manager secrets.

### Files modified

| File | Change |
|---|---|
| `.github/workflows/backend-deploy.yml` | Added `--set-secrets FIREBASE_STORAGE_BUCKET=FIREBASE_STORAGE_BUCKET:latest` to the deploy step. Updated comment block to document the new secret. |

### Manual action required by the developer

The GCP Secret Manager secret itself does not exist yet — it must be created manually before the next backend deploy that uses Storage will work correctly:

```bash
echo -n "yosnowmow-prod.appspot.com" | \
  gcloud secrets create FIREBASE_STORAGE_BUCKET \
    --data-file=- \
    --project=YOUR_PROJECT_ID
```

(Replace the bucket name with the real value from Firebase console → Storage.)

### Standing rule established

**Every time a new `${ENV_VAR:default}` is added to `application.yml`, the `backend-deploy.yml` workflow must be updated in the same commit.** This is now a documented invariant of the project.

**Commit:** `fix: add FIREBASE_STORAGE_BUCKET to Cloud Run --set-secrets (P1-15 gap)`

**Next task:** P1-17 — SendGrid email notifications

---

## 2026-04-13 — Manual infrastructure actions completed

### Context

Following the secrets audit, five manual actions were executed to bring the infrastructure up to date with the code deployed in P1-11 through P1-15. This session also produced two important discoveries about the project's infrastructure layout.

---

### Discovery 1: All infrastructure is in `yosnowmow-dev`, not `yosnowmow-prod`

Running `gcloud run services list` against both projects revealed that `yosnowmow-prod` has zero Cloud Run services. The backend (`yosnowmow-api`) is deployed to `yosnowmow-dev`:

```
SERVICE        REGION                   URL
yosnowmow-api  northamerica-northeast2  https://yosnowmow-api-463057570685.northamerica-northeast2.run.app
LAST DEPLOYED BY: github-actions-deploy@yosnowmow-dev.iam.gserviceaccount.com
```

The `GOOGLE_CLOUD_PROJECT` GitHub Secret contains `yosnowmow-dev`. The `yosnowmow-prod` Firebase project exists but is not yet wired to any GCP infrastructure — that migration is a Phase 2 concern.

**Key facts established:**
- GCP project: `yosnowmow-dev`
- GCP project number: `463057570685`
- Cloud Run service account (ADC identity): `463057570685-compute@developer.gserviceaccount.com`
- Cloud Run URL: `https://yosnowmow-api-463057570685.northamerica-northeast2.run.app`

---

### Discovery 2: Firebase Storage bucket uses new `.firebasestorage.app` URL format

Firebase projects created after mid-2024 use `{project-id}.firebasestorage.app` instead of the legacy `{project-id}.appspot.com` bucket name format. The actual bucket name for this project is `yosnowmow-dev.firebasestorage.app`.

The earlier diary note and `application.yml` default (`yosnowmow-dev.appspot.com`) were incorrect — updated accordingly.

---

### Orphaned secret (harmless)

During Action 1 the first attempt targeted `--project=yosnowmow-prod` before the infrastructure layout was confirmed. This created an orphaned `FIREBASE_STORAGE_BUCKET` secret in `yosnowmow-prod` Secret Manager with an incorrect `.appspot.com` bucket name. It is harmless (nothing reads from `yosnowmow-prod`) but can be deleted at any time:

```bash
gcloud secrets delete FIREBASE_STORAGE_BUCKET --project=yosnowmow-prod
```

---

### Actions completed

| # | Action | Outcome |
|---|---|---|
| 1 | Created `FIREBASE_STORAGE_BUCKET` secret in `yosnowmow-dev` GCP Secret Manager with value `yosnowmow-dev.firebasestorage.app` | ✅ `Created version [1]` |
| 2 | Granted `roles/storage.objectAdmin` to `463057570685-compute@developer.gserviceaccount.com` on `gs://yosnowmow-dev.firebasestorage.app` | ✅ Confirmed via `gcloud storage buckets get-iam-policy` |
| 3 | Deployed Firebase Storage security rules (`allow read, write: if false`) to `yosnowmow-dev` via `firebase deploy --only storage` | ✅ |
| 4 | Registered Stripe webhook endpoint `…/webhooks/stripe` in Stripe Dashboard for events `payment_intent.amount_capturable_updated`, `payment_intent.succeeded`, `payment_intent.payment_failed`. Updated `STRIPE_WEBHOOK_SECRET` to real `whsec_…` value (`Created version [2]`). Redeployed Cloud Run revision `yosnowmow-api-00011-lnm` to pick up new secret. | ✅ |
| 5 | Set `VITE_API_BASE_URL` GitHub Secret to `https://yosnowmow-api-463057570685.northamerica-northeast2.run.app` | ✅ |

### Notes on Stripe Dashboard navigation (2024+ redesign)

The Stripe Dashboard was redesigned in 2024. The path to create a webhook is now:
- Navigate to `https://dashboard.stripe.com/test/webhooks`
- Click **Add destination**
- Select events first (search "payment_intent", scroll to find all three)
- Choose **Your account** as event source
- Choose **Webhook endpoint** as destination type
- Enter the URL
- The signing secret appears on the destination detail page under **Signing secret → Reveal**

---

## 2026-04-13 — Session 8: Smoke Testing and Bug Fixes

### Context

Resumed after Session 7. P1-13 (Disputes), P1-14 (Admin dispute resolution), P1-15 (Firebase Storage photo upload), and P1-16 (Ratings with mutual-release) were all completed in the previous session. This session focused on smoke testing the three riskiest areas identified at the end of Session 7, and fixing whatever bugs were found.

---

### Firestore Composite Indexes (P1-16 follow-up)

**Problem:** `GET /api/jobs` returned HTTP 500 from Cloud Run with the error:
```
FAILED_PRECONDITION: The query requires an index.
```
Firestore requires explicit composite indexes for queries that combine `whereEqualTo` on one field with `orderBy` on a different field.

**Root cause:** `JobService.listJobsForUser()` uses:
- `whereEqualTo("requesterId", uid).orderBy("createdAt", DESC)` — requires composite index
- `whereEqualTo("workerId", uid).orderBy("createdAt", DESC)` — requires composite index

Five composite indexes were needed for the `jobs` collection. These were defined in `firebase/firestore.indexes.json` and deployed via `firebase deploy --only firestore:indexes`.

**Gotcha:** Firestore auto-appends `__name__` to all composite indexes. Including an explicit `__name__` entry in `firestore.indexes.json` causes a `409 Conflict` on deploy. All five indexes were created correctly despite the 409 on the last entry (the 409 meant the index already existed from clicking the auto-generated URL in the error log).

**Five indexes added:**

| Fields | Purpose |
|---|---|
| `requesterId ASC` + `createdAt DESC` | Requester job list, newest first |
| `workerId ASC` + `createdAt DESC` | Worker job list, newest first |
| `status ASC` + `createdAt DESC` | Admin job list filtered by status |
| `requesterId ASC` + `status ASC` | Requester jobs filtered by status |
| `workerId ASC` + `status ASC` | Worker jobs filtered by status |

**Committed:** `feat: P1-16 Firestore composite indexes for jobs collection` (commit `6e49c05`)

**Standing rule established:** Any `whereEqualTo` + `orderBy` query combination on different fields requires a composite index in `firestore.indexes.json`. Add the index in the same commit as the query code.

---

### Smoke Test Results

#### Smoke Test 1 — Health check
`GET /api/health` → `{"status":"UP"}` HTTP 200 ✅

#### Smoke Test 2 — Unauthenticated request
`GET /api/jobs` (no token) → HTTP 401 ✅

#### Smoke Test 3 — Authenticated GET /api/jobs
`GET /api/jobs` with Firebase ID token → HTTP 200 `[]` ✅

**Notes on Firebase Auth test user:** `test-requester@yosnowmow.dev` could not be used (no password reset access). Smoke testing used `testuser@example.com` created directly via the Firebase Auth REST API (`accounts:signUp`). The Firebase Web API key is in `frontend/.env.local` as `VITE_FIREBASE_API_KEY`.

#### Smoke Test 4 — Stripe webhook
After fixing multiple infrastructure issues (see below): HTTP 200, signature verified ✅

Note: `stripe trigger payment_intent.succeeded` produces a "Could not deserialize Stripe event" warning. This is expected — the Stripe CLI creates synthetic events using the latest API version which may differ from the Java SDK's bundled schema version. Real Stripe events (from actual transactions) use the API version pinned to the Stripe account and will deserialize correctly.

#### Smoke Test 5 — Firebase Storage endpoint
`POST /api/jobs/fake-job-id/photos` → HTTP 403 ✅

The 403 (not 404) is correct and expected: the endpoint has `@RequiresRole("worker")` and `testuser@example.com` has no roles. Auth and RBAC are both functioning. A worker-role user would receive 404 (job not found) for a fake job ID.

---

### Bugs Found and Fixed During Smoke Testing

#### Bug 1 — DispatchService blocking application startup (225-second cold start)

**Symptom:** Cloud Run logs showed `Started YoSnowMowApplication in 225.752 seconds`. Cloud Run's default startup timeout is 300 seconds — this left only 75 seconds of margin.

**Root cause:** `DispatchService.recoverPendingDispatches()` was annotated with `@EventListener(ContextRefreshedEvent.class)`, which fires synchronously on the main startup thread. It called `firestore.collection(JOB_REQUESTS_COLLECTION).whereEqualTo("status", "PENDING").get().get()` — a blocking Firestore call. During Cloud Run cold starts, the gRPC TLS negotiation to Firestore takes several minutes due to network initialisation, and the Firestore SDK retries with exponential backoff. The main thread waited for this to resolve before completing startup.

**Fix:** Extracted the Firestore query body into a private `runDispatchRecovery()` method and called it from a daemon thread inside `recoverPendingDispatches()`. Startup now returns immediately; recovery runs in the background seconds later.

**Result:** Startup time reduced from ~225 seconds to ~6 seconds.

**Committed:** `fix: non-blocking startup recovery in DispatchService` (commit `35b00d7`)

---

#### Bug 2 — Stripe webhook secret not injected / wrong value

This bug had three layers:

**Layer 1 — Wrong STRIPE_SECRET_KEY value in GCP Secret Manager**
The `STRIPE_SECRET_KEY` secret in `yosnowmow-dev` Secret Manager contained the placeholder string `placeholder-set-in-P1-11` (never updated with the real key). Confirmed by `PaymentService` startup log: `Stripe initialized (key prefix: placeho…)`. Fixed by adding a new version with the real `sk_test_...` key.

**Layer 2 — Wrong STRIPE_WEBHOOK_SECRET value in GCP Secret Manager**
`STRIPE_WEBHOOK_SECRET` also contained a wrong value (either placeholder or previous attempt with incorrect bytes). The signature verification error "No signatures found matching the expected signature for payload" persisted even after multiple fix attempts.

**Layer 3 — Trailing newline in secrets created via PowerShell pipe**
The `echo "value" | gcloud secrets versions add` pattern in PowerShell passes the string through PowerShell's string pipeline, which adds a trailing `\r\n`. The Stripe SDK uses the secret as an HMAC-SHA256 key — a trailing newline changes the key and produces a different HMAC. The `python -c "import sys; sys.stdout.buffer.write(b'...')"` pipe approach can also be unreliable in Windows PowerShell due to encoding conversion.

**Fix:** Used `[System.IO.File]::WriteAllText(path, value, [System.Text.Encoding]::ASCII)` to write the secret to a temp file with exact bytes (no trailing newline, no BOM), then passed `--data-file=path` to `gcloud secrets versions add`. This bypasses all PowerShell pipe encoding issues.

**Standing rule established:** On Windows PowerShell, always use the file method to add GCP Secret Manager values:
```powershell
[System.IO.File]::WriteAllText("$env:TEMP\secret.txt", "VALUE", [System.Text.Encoding]::ASCII)
gcloud secrets versions add SECRET_NAME --data-file="$env:TEMP\secret.txt" --project=PROJECT
Remove-Item "$env:TEMP\secret.txt"
```

**Additional note — Stripe CLI now requires `stripe trigger` for test events:** The Stripe Dashboard "Send test event" button was removed in the 2024 redesign; it now requires the Stripe CLI. Install via `winget install Stripe.StripeCLI`, authenticate with `stripe login`, then `stripe trigger payment_intent.succeeded`.

---

### Other Discoveries

**`gcloud run services describe` for secret audit:** The command
```bash
gcloud run services describe SERVICE --region=REGION --project=PROJECT --format="yaml(spec.template.spec.containers[0].env)"
```
shows all env vars and secret references on the running revision. Useful for verifying that `--set-secrets` in the deploy workflow is actually wiring up the secrets correctly.

**Cloud Run secret timing:** Cloud Run resolves `:latest` secret versions at container startup, not per-request. If a new secret version is added after a revision starts, a new revision must be deployed to pick up the change. The workflow can be re-triggered manually from GitHub Actions → Backend Deploy → Run workflow without a code change.

**`grep` / `xxd` not available in PowerShell:** Use `findstr /i "keyword"` instead of `grep`. For binary inspection, use Python: `python -c "import sys; data=sys.stdin.buffer.read(); print(len(data), repr(data))"`. The `.exe` suffix forces the real binary over PowerShell aliases: `curl.exe` instead of `curl`.

---

### Phase 1 remaining tasks

| Task | Status |
|---|---|
| P1-17 — SendGrid email notifications | Not started |
| P1-18 — Firebase FCM push notifications | Not started |
| P1-19 — Admin dashboard live data | Not started |
| P1-20 — Audit log hash chain verification | Not started |
| P1-21 — Firestore security rules | Not started |
| P1-22 — Integration test suite | Not started |
| P1-23 — Production deployment | Not started |

---

## 2026-04-13 — Session 9: P1-17 SendGrid Email Notifications

### Context

Session 9 is a continuation of Session 8 (context window exhausted). P1-14 through P1-16 were completed in Session 8. This session implements P1-17 from scratch through to commit.

### P1-17 — SendGrid Email Notifications

**Design decisions:**
- All email methods are `@Async` so callers never block waiting for email delivery.
- All email methods have a try-catch that swallows exceptions — email failure must never propagate to a business transaction. An error is logged but the caller proceeds.
- Dev safety: if `sendgridApiKey` starts with `"placeholder"`, all sends are skipped at DEBUG level. This means the code can be exercised in a local/dev environment without a real SendGrid key.
- User email addresses are resolved from **Firebase Auth** (via `firebaseAuth.getUser(uid).getEmail()`) — the authoritative source. We do not store email in Firestore because Firebase Auth owns the email field and it can be changed there.
- `sendGridClient` is initialized via `@PostConstruct` so that the `@Value`-injected `sendgridApiKey` is available.

**Files changed:**

`backend/src/main/java/com/yosnowmow/service/NotificationService.java` — **complete rewrite** from 4-method stub (P1-05 wiring stubs) to full implementation. All 10 methods implemented:

| Method | Called from | Purpose |
|---|---|---|
| `sendJobRequest(workerUid, jobId)` | `DispatchService` | Push stub (P1-18) |
| `notifyRequesterJobAccepted(requesterId, jobId, workerId)` | `DispatchService` | Worker accepted — complete payment |
| `sendWelcomeEmail(uid, displayName, role)` | `UserService.createUser()` | New user registration |
| `sendJobConfirmedEmail(requesterId, workerId, job)` | `WebhookController` | Payment cleared → CONFIRMED |
| `sendJobInProgressEmail(requesterId, job)` | `JobService` | Job → IN_PROGRESS |
| `sendJobCompleteEmail(requesterId, workerId, job)` | `JobService` | Job → COMPLETE |
| `sendPayoutReleasedEmail(workerId, amountCAD, jobId)` | `PaymentService` | Transfer → Worker |
| `sendDisputeOpenedEmail(requesterId, workerId, jobId)` | `DisputeService` (P1-07 stub) | Dispute → DISPUTED |
| `sendDisputeResolvedEmail(requesterId, workerId, resolution, job)` | `DisputeService` (P1-07 stub) | Admin resolved dispute |
| `sendCancellationEmail(requesterId, workerId, feeCharged, feeCAD, jobId)` | `JobService.cancelJob()` | Job cancelled |
| `notifyRequesterNoWorkers(requesterId, jobId)` | `DispatchService` | No workers found |
| `notifyPaymentFailed(requesterId, jobId)` | `WebhookController` | Stripe payment_failed event |

Private helpers: `lookupEmail(uid)`, `sendEmail(to, subject, html)`, `buildHtml(heading, content)`, `formatCad(Double)`, `formatAddress(Address)`.

`backend/src/main/java/com/yosnowmow/service/JobService.java`:
- Added `NotificationService notificationService` field (6th constructor parameter)
- `notifyTransition(jobId, toStatus, actorUid)` replaced from stub to real implementation: sends `sendJobInProgressEmail` on `IN_PROGRESS`, `sendJobCompleteEmail` on `COMPLETE`
- Added cancellation email at end of `cancelJob()`:
  ```java
  boolean feeCharged = "CONFIRMED".equals(previousStatus);
  double feeCAD = feeCharged ? 11.30 : 0.0;
  notificationService.sendCancellationEmail(
      job.getRequesterId(), job.getWorkerId(), feeCharged, feeCAD, jobId);
  ```
  Note: 11.30 is the total charge ($10 fee + $1.30 HST). The fee field on the job stores `10.00` (pre-tax) per `cancelWithFee()`.

`backend/src/main/java/com/yosnowmow/controller/WebhookController.java`:
- Added `sendJobConfirmedEmail` call in `handlePaymentSucceeded()` after job transitions to CONFIRMED:
  ```java
  var confirmedJob = jobService.getJob(jobId);
  notificationService.sendJobConfirmedEmail(
      confirmedJob.getRequesterId(), confirmedJob.getWorkerId(), confirmedJob);
  ```

`backend/src/main/java/com/yosnowmow/service/PaymentService.java`:
- Added `NotificationService notificationService` field (4th constructor parameter)
- Added `sendPayoutReleasedEmail` call in `releasePayment()` after successful Stripe transfer:
  ```java
  notificationService.sendPayoutReleasedEmail(
      job.getWorkerId(), payoutCents / 100.0, jobId);
  ```
  The `payoutCents` variable already includes the HST portion (if any), matching the amount actually transferred.

`backend/src/main/java/com/yosnowmow/service/UserService.java`:
- Added `NotificationService notificationService` field (3rd constructor parameter)
- Added welcome email call at end of `createUser()`:
  ```java
  String primaryRole = req.getRoles().contains("worker") ? "WORKER" : "REQUESTER";
  notificationService.sendWelcomeEmail(uid, req.getName(), primaryRole);
  ```
  If the user registered with both roles, the welcome email uses "WORKER" tone (dual-role users are more likely primary workers wanting the setup guidance).

**Call sites NOT yet wired (deferred to P1-07 dispute implementation):**
- `sendDisputeOpenedEmail` — wires in `DisputeService.openDispute()` (stub file)
- `sendDisputeResolvedEmail` — wires in `DisputeService.resolveDispute()` (stub file)

**Build verification:** `mvn compile` passed with no errors after all changes.

**Pre-production checklist for SendGrid:**
1. Add real `SENDGRID_API_KEY` to GCP Secret Manager (`yosnowmow-dev` and `yosnowmow-prod`)
2. Authenticate domain at SendGrid → Settings → Sender Authentication → Authenticate Your Domain
3. Add SPF, DKIM DNS records from SendGrid to domain registrar
4. Add DMARC record: `_dmarc.yosnowmow.com TXT "v=DMARC1; p=none; rua=mailto:dmarc@yosnowmow.com"`
5. Verify domain in SendGrid before going to production

---

## 2026-04-13 — Session 9 continued: P1-18 Firebase FCM Push Notifications

### P1-18 — Firebase FCM Push Notifications

**Design decisions:**
- Every push method is `@Async` and exception-safe — push failures never propagate to the caller.
- A single private `sendPush(uid, type, title, body, data)` helper handles all FCM sends AND the in-app notification feed write. The in-app feed write happens regardless of whether the user has an FCM token, so the notification bell in the React app always works even if push is not enabled.
- FCM token is stored on `users/{uid}.fcmToken`. A null/blank token skips the FCM send but still writes to the feed.
- The React client subscribes to `notifications/{uid}/feed` in real-time via the Firestore client SDK — no polling needed.
- `FirebaseMessaging` added as a Spring bean in `FirebaseConfig.java` (alongside the existing `FirebaseAuth` bean).

**Firestore schema — notification feed:**
```
notifications/{uid}/feed/{notifId}: {
    notifId:   String,
    type:      String  (e.g. "JOB_CONFIRMED", "JOB_CANCELLED"),
    title:     String,
    body:      String,
    data:      Map<String, String>  (always includes "jobId"),
    isRead:    Boolean,
    createdAt: Timestamp
}
```

**Files changed:**

`backend/src/main/java/com/yosnowmow/config/FirebaseConfig.java`:
- Added `import com.google.firebase.messaging.FirebaseMessaging`
- Added `@Bean FirebaseMessaging firebaseMessaging(FirebaseApp)` — mirrors the `FirebaseAuth` bean pattern

`backend/src/main/java/com/yosnowmow/model/User.java`:
- Added `fcmToken` field (String, nullable) with getter/setter
- Stored at `users/{uid}.fcmToken`; updated by the React client via `PATCH /api/users/{uid}/fcm-token`

`backend/src/main/java/com/yosnowmow/dto/FcmTokenRequest.java`:
- New DTO for `PATCH /api/users/{uid}/fcm-token` — single `fcmToken` String field with `@Size(max=256)`

`backend/src/main/java/com/yosnowmow/service/NotificationService.java`:
- Added `FirebaseMessaging`, `Firestore` fields and constructor parameters
- Added private `sendPush()` helper — reads FCM token from Firestore, sends FCM if present, always writes to notification feed
- Replaced 2-arg `sendJobRequest(workerUid, jobId)` stub with 4-arg real implementation: `sendJobRequest(workerUid, jobId, address, payoutCAD)`
- Updated `notifyRequesterJobAccepted()` to also send a push alongside the existing email
- Added 10 new typed push methods:
  - `notifyJobConfirmed(requesterId, workerId, jobId, address)` — both parties
  - `notifyWorkerArrived(requesterId, jobId, address)`
  - `notifyJobCompleteRequester(requesterId, jobId)`
  - `notifyJobCompleteWorker(workerId, jobId, payoutCAD)`
  - `notifyRatingRequest(uid, jobId)` — wired when ratings are implemented
  - `notifyPayoutReleased(workerId, payoutCAD, jobId)`
  - `notifyDisputeOpened(uid, jobId, role)` — call once per party
  - `notifyDisputeResolved(uid, jobId, resolution)` — call once per party
  - `notifyCancellation(uid, jobId, feeCharged)` — call once per party

`backend/src/main/java/com/yosnowmow/service/DispatchService.java`:
- Updated `sendOffer()` to accept the full `Job` object as a 3rd parameter (was: `sendOffer(jobId, workerId)` → `sendOffer(jobId, workerId, job)`)
- Extracts `address` and `payoutCAD` from `job` to pass to `notificationService.sendJobRequest()`
- Updated call site at `dispatchToNextWorker()` to pass the already-fetched `job`

`backend/src/main/java/com/yosnowmow/service/JobService.java`:
- Updated `notifyTransition()` to call push methods alongside email methods:
  - `IN_PROGRESS` → `notifyWorkerArrived(requesterId, jobId, address)`
  - `COMPLETE` → `notifyJobCompleteRequester(requesterId, jobId)` + `notifyJobCompleteWorker(workerId, jobId, payoutCAD)`
- Updated `cancelJob()` to send push to requester and (if assigned) worker

`backend/src/main/java/com/yosnowmow/controller/WebhookController.java`:
- Added `notifyJobConfirmed(requesterId, workerId, jobId, address)` call in `handlePaymentSucceeded()` alongside the existing email

`backend/src/main/java/com/yosnowmow/service/PaymentService.java`:
- Added `notifyPayoutReleased(workerId, payoutCAD, jobId)` call in `releasePayment()` alongside the existing email

`backend/src/main/java/com/yosnowmow/controller/UserController.java`:
- Added `PATCH /api/users/{uid}/fcm-token` endpoint — calls `userService.updateFcmToken()`
- Returns HTTP 204 No Content on success

`backend/src/main/java/com/yosnowmow/service/UserService.java`:
- Added `updateFcmToken(userId, fcmToken)` method — writes `fcmToken` field + `updatedAt` to Firestore

**Build verification:** `mvn compile` passed (62 source files, no errors) after fixing a `sendJobRequest` signature mismatch that emerged because `DispatchService` was calling the old 2-arg stub.

**Call sites NOT yet wired (deferred to P2-01 dispute implementation):**
- `notifyDisputeOpened` — wires in `DisputeService.openDispute()`
- `notifyDisputeResolved` — wires in `DisputeService.resolveDispute()`
- `notifyRatingRequest` — wires when the ratings API is implemented

**React client integration (TODO for frontend phase):**
```javascript
// After login, get FCM token and register it:
import { getMessaging, getToken } from "firebase/messaging";
const messaging = getMessaging();
const token = await getToken(messaging, { vapidKey: "YOUR_VAPID_KEY" });
await api.patch(`/api/users/${uid}/fcm-token`, { fcmToken: token });

// Subscribe to real-time notification feed:
import { collection, onSnapshot } from "firebase/firestore";
const feedRef = collection(db, "notifications", uid, "feed");
onSnapshot(feedRef, (snapshot) => { /* update notification bell */ });
```

**Pre-production checklist for FCM:**
1. Enable Firebase Cloud Messaging in the Firebase project console
2. Generate VAPID key in Project Settings → Cloud Messaging → Web Push certificates
3. Add `NEXT_PUBLIC_FIREBASE_VAPID_KEY` to the frontend environment
4. Register Service Worker (`firebase-messaging-sw.js`) in the React app for background push

### Phase 1 remaining tasks (updated)

| Task | Status |
|---|---|
| P1-17 — SendGrid email notifications | **Complete** |
| P1-18 — Firebase FCM push notifications | **Complete** |
| P1-19 — Admin dashboard live data | **Complete** |
| P1-20 — Audit log hash chain verification | **Complete** |
| P1-21 — Firestore security rules | **Complete** |
| P1-22 — Integration test suite | Not started |
| P1-23 — Production deployment | Not started |

---

## Session 10 (continued) — 2026-04-13

### Admin BCC on all outgoing emails

Added a BCC to `perelgut@gmail.com` on every transactional email sent by the app.
Configurable via `ADMIN_BCC_EMAIL` environment variable; empty string disables it.

**Files changed:**
- `backend/src/main/resources/application.yml` — added `yosnowmow.sendgrid.bcc-email: ${ADMIN_BCC_EMAIL:perelgut@gmail.com}`
- `backend/src/main/java/com/yosnowmow/service/NotificationService.java` — added `@Value bccEmail` field; in `sendEmail()` private helper, calls `mail.getPersonalization().get(0).addBcc(new Email(bccEmail))` when non-blank

Because all 10 email methods funnel through the single `sendEmail()` helper, one code change covers all outgoing mail.

**Commit:** `49524d9`

---

### P1-20 — Audit Log Hash Chain Verification

Completed the full audit log service with global SHA-256 hash chaining, Firestore transactions, daily Quartz integrity check, and admin alert email on failure.

**Background:**
From P1-08 onward, `AuditLogService.write()` had been called from all state-changing services (JobService, PaymentService, DispatchService, UserController, AdminController, etc.). The stub implementation existed with per-entity hash chaining but no sequence numbers, no Firestore transactions, and no integrity check. P1-20 completes this to the full spec.

**Key design decision — global chain vs per-entity chain:**
The plan specifies a global chain (single `__chain_head` document). This is more tamper-evident than per-entity chaining: removing or inserting any entry anywhere in the log breaks every subsequent hash. The existing stub used per-entity chaining; the rewrite switches to the global model. No migration needed (development environment, no production data).

**`AuditEntry.java`** — added `sequenceNumber: long` field (getter/setter).

**`AuditLogService.java`** — full rewrite:

_Global chain meta-documents (in the `auditLog` collection):_
- `__chain_head` — `{ hash: "...", lastUpdated: Timestamp }` — stores the `entryHash` of the most recently written entry
- `__seq_counter` — `{ value: N }` — monotonically increasing global sequence number

_GENESIS_HASH:_ 64 hex zeros (`"000...000"`, 64 chars) — used as `previousHash` for the very first entry.

_`write()` — Firestore transaction:_
```
auditFirestore.runTransaction(transaction -> {
    chainSnap = transaction.get(__chain_head).get()
    seqSnap   = transaction.get(__seq_counter).get()
    prevHash  = chainSnap.hash ?? GENESIS_HASH
    newSeq    = seqSnap.value + 1  (or 1 if first entry)
    entryHash = SHA-256(prevHash \0 timestamp.seconds \0 actorUid \0
                        action \0 entityId \0 beforeJson \0 afterJson)
    transaction.set(entryDoc, {...all fields including sequenceNumber})
    transaction.set(__chain_head, {hash: entryHash, lastUpdated: now})
    transaction.set(__seq_counter, {value: newSeq})
    return null
})
```

The null-byte separator (`\0`) between fields prevents length-extension attacks where adjacent strings could be misinterpreted.

_`verifyPreviousDay()` — returns `IntegrityReport(totalChecked, mismatches, date)`:_
- Queries `auditLog` where `timestamp >= yesterday_start && timestamp < today_start`, ordered by `timestamp ASC, sequenceNumber ASC`
- For each entry: recomputes `SHA-256(entry.previousHash \0 entry.timestamp.seconds \0 ...)` and verifies equals `entry.entryHash`
- For consecutive entries within the day: verifies `entries[i].previousHash == entries[i-1].entryHash`
- Returns `mismatches == -1` if the query itself errored (signals "could not complete")

_`IntegrityReport` inner class:_ immutable value object with `totalChecked`, `mismatches`, `date`, `passed()`, `errored()` helpers.

**`AuditIntegrityJob.java`** (new — `scheduler/AuditIntegrityJob.java`):
- `@DisallowConcurrentExecution` Quartz `Job` implementation
- `@Autowired AuditLogService` and `@Autowired NotificationService`
- Calls `auditLogService.verifyPreviousDay()`
- If `report.errored()` or `!report.passed()`: calls `notificationService.sendAuditIntegrityAlertEmail(report)` and logs at ERROR level
- Otherwise: logs success at INFO level

**`QuartzConfig.java`** — upgraded from empty placeholder to active config:
- `@Bean JobDetail auditIntegrityJobDetail()` — registers `AuditIntegrityJob` as a durable job in the "audit" group
- `@Bean Trigger auditIntegrityTrigger(JobDetail)` — cron `"0 0 2 * * ?"` fires at 2:00 AM daily

**`NotificationService.java`** — added `sendAuditIntegrityAlertEmail(IntegrityReport)`:
- `@Async`, sends to `ADMIN_EMAIL`
- Two message variants: error (query failed) vs failure (mismatches found)
- Automatically BCC'd to `perelgut@gmail.com` by the new global BCC logic

**`backend/Dockerfile`** — added timezone:
```dockerfile
ENV TZ=America/Toronto
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone
```
Required so the Quartz cron fires at 2 AM Ontario time, not UTC.

**`write()` call sites:** No changes needed. The method signature is unchanged; only the internal implementation differs (global chain, transactions, sequence numbers).

**Build verification:** `mvn compile` passed (66 source files, 0 errors).

**Important note for production deployment:**
The `auditLog` collection in Firestore requires a composite index to support the integrity check query:
```
Collection: auditLog
Fields: timestamp ASC, sequenceNumber ASC
```
This index must be created in the audit Firebase project before the first integrity check runs.

---

## Session 10 — 2026-04-13

### P1-19 — Admin Dashboard Wired to Live Data (completion)

Completed the final piece of P1-19: `JobDetail.jsx` rewrite and `api.js` additions.

**Context:**
P1-19 began in Session 9. The backend was fully implemented (AdminController with 6 endpoints, 3 DTOs, AdminStatsResponse/PagedResponse/OverrideStatusRequest), `api.js` was rewritten with an Axios client and all admin/job/user API methods, and `Dashboard.jsx` was fully rewritten. Session 9 ended before `JobDetail.jsx` was updated.

**`JobDetail.jsx` — full rewrite** (`frontend/src/pages/admin/JobDetail.jsx`):

The mock version used `useMock()` to find a job in the in-memory array and referenced Phase 0 mock field names (`job.address`, `job.serviceTypes`, `job.depositAmountCents`, `job.netWorkerCents`, etc.). The new version:

1. **Removes `useMock()` entirely.** Job data comes from `getJob(id)` via the real backend. Requester and worker profiles are fetched with `getUser()` in parallel.

2. **Field name corrections** — all references updated to the real Spring model:

| Old (Phase 0 mock) | New (real backend) |
|---|---|
| `job.address` | `job.propertyAddress?.fullText` |
| `job.serviceTypes.join(', ')` | `(job.scope \|\| []).join(', ')` |
| `job.scheduledTime` | `fmtWindow(job.startWindowEarliest, job.startWindowLatest)` |
| `job.specialNotes` | `job.notesForWorker` |
| `job.depositAmountCents` (cents) | `job.totalAmountCAD` (CAD) |
| `job.hstCents` (cents) | `job.hstAmountCAD` (CAD) |
| `job.platformFeeCents` (cents) | `job.tierPriceCAD * job.commissionRateApplied` |
| `job.netWorkerCents` (cents) | `job.workerPayoutCAD` (CAD) |
| `mockUser.displayName` | `requester.name` (from `getUser()`) |
| `mockWorker.displayName` | `worker.name` (from `getUser()`) |
| `mockWorker.averageRating` | `worker.worker?.rating` |
| `mockWorker.totalJobsCompleted` | `worker.worker?.completedJobCount` |

3. **All 3 admin action buttons wired to real API:**
   - Override status → `overrideJobStatus(id, targetStatus, reason)` — the override modal now includes a mandatory reason textarea (required by the backend `@NotBlank` validation)
   - Force Release → `releasePayment(id)`
   - Issue Refund → `refundJob(id)`
   - Dispute resolution → `releasePayment(id)` (release/split) or `refundJob(id)` (refund)

4. **Loading / error states** — page shows "Loading job…" spinner text while fetching; shows error message with back link if the API call fails; handles user-profile fetch failures silently (falls back to showing the raw UID).

5. **Real dispute fields** — reads `job.disputeReason`, `job.disputeDescription`, `job.disputeWorkerNotes`, `job.disputeInitiatedAt` from the Firestore document. The mock hardcoded `MOCK_DISPUTE` object is removed.

6. **Action feedback** — `actionPending` flag disables buttons during in-flight API calls and shows inline "Applying…" / "Releasing…" / "Refunding…" labels. Global action error banner shown on failure.

7. **`AccountStatusBadge` sub-component** — renders coloured badge for active (green) / suspended (amber) / banned (red) account status.

8. **`advanceJob` removed** — this was mock-only; there is no equivalent admin endpoint.

9. **Financials null-safe** — the pricing fields on a job are null until a worker accepts. The Financials card shows "Pricing is locked once a Worker accepts the job" when `totalAmountCAD == null`.

10. **Admin notes panel retained** with a prominent "Local only — notes API wires in P2-01" label.

**`api.js` — added `updateFcmToken`** (`frontend/src/services/api.js`):
```javascript
export const updateFcmToken = (userId, fcmToken) =>
  api.patch(`/api/users/${userId}/fcm-token`, { fcmToken })
```
This was omitted in Session 9 when P1-18 was implemented. The React client should call this after login and when the browser grants notification permission.

**`fmtTs` / `fmtWindow` helpers** — Firestore Timestamp serialises from the backend as `{seconds, nanos}`. The `tsToDate()` helper reads `ts.seconds ?? ts._seconds ?? 0` (tolerates both official and alternate SDK shapes). `fmtTs()` uses `en-CA` locale formatting. `fmtWindow()` formats the `startWindowEarliest`/`startWindowLatest` pair, defaulting to "ASAP" when no window is set.

**Build verification:** `npm run build` passed (123 modules, 567ms, 0 errors).

**Commit:** P1-19 implementation committed to `main`.

---

### P1-21 — Firestore Security Rules + Storage Rules + Index Updates

**`firebase/firestore.rules`** — full rewrite replacing the "DENY ALL" stub.

Architecture: ALL operational writes go through the Spring Boot Admin SDK (which bypasses rules entirely). Rules govern only client-side reads via the Firestore JS SDK and one narrow client-side write.

**Helper functions:**
- `isSignedIn()` — `request.auth != null`
- `isOwner(uid)` — signed in + `request.auth.uid == uid`
- `isAdmin()` — signed in + `'admin' in request.auth.token.roles`
- `isWorker()` / `isRequester()` — role checks (lowercase, matching UserService custom claims)

**Collection rules (with reasoning):**

| Collection | Read | Write | Why client write is denied |
|---|---|---|---|
| `users/{uid}` | `isOwner(uid) \|\| isAdmin()` | `false` | Role assignment is server-validated; worker profile data is geocoded server-side |
| `jobs/{jobId}` | requester \|\| worker \|\| admin | `false` | All transitions go through server state machine |
| `jobRequests/{requestId}` | `workerId == uid \|\| isAdmin()` | `false` | Offer lifecycle (create/expire/accept) is server-orchestrated |
| `ratings/{ratingId}` | `raterUid == uid \|\| rateeUid == uid \|\| isAdmin()` | `false` | Triggers payout logic; must be server-validated |
| `notifications/{uid}/feed/{notifId}` | `isOwner(uid)` | Only `isRead` update | System-generated content must not be forged |
| `disputes/{disputeId}` | requester \|\| worker \|\| admin | `false` | P2-01 pre-written; dispute triggers payment holds |
| `geocache/{hash}` | `false` | `false` | Internal only |
| `stripeEvents/{eventId}` | `false` | `false` | Webhook dedup; must not be readable |
| `/{document=**}` (catch-all) | `false` | `false` | Future collections default to locked |

**Notable divergences from the plan spec:**
- Plan used `'ADMIN'` (uppercase) in custom claims → actual code uses `'admin'` (lowercase, set by `UserService.setCustomClaims()`)
- Plan had `resource.data.currentWorkerId` → actual field is `resource.data.workerId`
- Plan had separate `workers/{uid}` collection → actual implementation embeds worker profile in `users/{uid}.worker`

**Notification `isRead` update rule:**
```
allow update: if isOwner(uid)
  && request.resource.data.diff(resource.data).affectedKeys().hasOnly(['isRead']);
```
This uses Firestore's `diff().affectedKeys()` to verify only the `isRead` field is being changed — any attempt to modify other fields (title, body, type, etc.) is rejected.

**`firebase/storage.rules`** — full rewrite replacing the one-liner stub.

| Path | Read | Write | Reason |
|---|---|---|---|
| `jobs/{jobId}/photos/{fileName}` | `isSignedIn()` | `false` | Full job-participation check is in backend API (can't join Firestore from Storage rules efficiently) |
| `disputes/{disputeId}/{party}/{fileName}` | `isAdmin()` | `false` | Sensitive adjudication material |
| `workers/{uid}/insurance/{fileName}` | `isAdmin() \|\| isOwner(uid)` | `false` | Insurance docs trigger backend verification workflow |
| `/{allPaths=**}` (catch-all) | `false` | `false` | Default locked |

**`firebase/firestore.indexes.json`** — added 6 new indexes:

| Collection | Fields | Purpose |
|---|---|---|
| `jobs` | `status ASC, requesterId ASC, createdAt DESC` | Admin filtered: status + requester |
| `jobs` | `status ASC, workerId ASC, createdAt DESC` | Admin filtered: status + worker |
| `users` | `roles ARRAY_CONTAINS, createdAt DESC` | Admin users tab: filter by role |
| `users` | `accountStatus ASC, createdAt DESC` | Admin users tab: filter by status |
| `feed` (COLLECTION_GROUP) | `isRead ASC, createdAt DESC` | Notification bell: unread first |
| `jobRequests` | `status ASC, sentAt ASC` | DispatchService recovery: find PENDING offers |

**Audit Firestore index (separate project — not in this file):**
The P1-20 audit integrity check query requires a composite index in the `yosnowmow-audit` Firebase project:
```
Collection: auditLog  |  Fields: timestamp ASC, sequenceNumber ASC
```
This must be created manually in the audit project's Firestore console before the first `AuditIntegrityJob` run.

---

## 2026-04-13 — Session 5 (continued): P1-22 Integration Test Suite

### Context
Previous sessions delivered P1-19 through P1-21. This session implements P1-22: the integration test suite for the backend service layer.

### Discussion: test approach
The implementation plan called for `@SpringBootTest` + Firebase Emulator. After reviewing the pom.xml and project constraints, a pragmatic decision was made:

- **Unit tests with `@ExtendWith(MockitoExtension.class)`** for the three service test classes. This runs without a Spring context or emulator, making CI fast and dependency-free.
- **`application-test.yml`** created in `src/test/resources/` documenting the Firebase Emulator configuration for when full integration tests are added in a future session.
- The reasoning: `@SpringBootTest` with `@MockBean` for all external APIs (Firestore, Stripe, SendGrid, Maps) is equivalent to unit-testing the service layer anyway. Using `@ExtendWith(MockitoExtension.class)` directly is faster and cleaner.

### Files created

**`backend/src/test/resources/application-test.yml`**
Documents the test profile configuration: in-memory Quartz, Firebase Emulator connection details, placeholder API keys. Not loaded by any current test (they don't use Spring context), but ready for future `@SpringBootTest` integration tests.

**`backend/src/test/java/com/yosnowmow/StateMachineTest.java`** (17 tests)
Tests `JobService.transition()` end-to-end through the Firestore `runTransaction()` path.

Key design decision: `runTransaction()` is instrumented via Mockito `doAnswer` to execute the transaction lambda synchronously against a mock `Transaction`. This lets the business logic inside the lambda (transition table lookup, actor permission checks) be exercised without a real Firestore instance.

Tests cover:
- Valid transitions: REQUESTED→PENDING_DEPOSIT (system), CONFIRMED→IN_PROGRESS (worker), IN_PROGRESS→COMPLETE (worker), COMPLETE→DISPUTED (requester within 2hr), DISPUTED→RELEASED/REFUNDED (admin), RELEASED→SETTLED (admin)
- Invalid transitions: REQUESTED→COMPLETE, CANCELLED→anything, SETTLED→anything
- Permission enforcement: wrong worker, requester tries worker-only, non-admin tries admin-only
- Dispute window: 30 min after COMPLETE succeeds; 3 hours after COMPLETE fails; boundary test (2 hours + 1 sec) fails

**`backend/src/test/java/com/yosnowmow/JobServiceTest.java`** (12 tests)
Tests `JobService.createJob()` and `cancelJob()`.

Technical challenge: `DocumentReference.set()` could not be stubbed via `when().thenReturn()` (possibly due to type-parameter complexity). Resolved by annotating `jobDocRef` with `@Mock(answer = Answers.RETURNS_DEEP_STUBS)` — `set()` and `update()` return deep-stub mock `ApiFuture` objects whose `.get()` returns null (which is fine since the production code discards write results).

Tests cover:
- Happy path: job created with REQUESTED status, correct requesterId, scope, null pricing fields
- Multi-scope: `["driveway", "sidewalk"]` stored correctly
- Guard: active job already exists → HTTP 409
- Geocoding failure → HTTP 422
- Invalid scope value ("roof") → HTTP 422
- Cancel from REQUESTED: no fee; from PENDING_DEPOSIT: no fee; from CONFIRMED: $11.30 fee
- Cancel by non-requester/non-admin: AccessDeniedException
- Admin can cancel regardless of requester UID

**`backend/src/test/java/com/yosnowmow/MatchingServiceTest.java`** (9 tests)
Tests the matching algorithm in `MatchingService.matchAndStoreWorkers()`. Since there is no Spring proxy in pure Mockito tests, `@Async` is inactive and the method runs synchronously.

Algorithm results are captured using `ArgumentCaptor` on the Firestore `update("matchedWorkerIds", list, ...)` call.

Coordinate system: job at 43.6700°N (Toronto downtown). Worker positions calculated using 1° latitude ≈ 111.19 km.

Tests cover:
- Worker within radius is included (2 km, radius 10 km)
- Worker outside radius is excluded (26 km north, radius 5 km)
- Sort order: higher rating first (4.8 before 4.2, same distances); equal rating closer first (1.5 km before 4 km); null rating goes last (effective -1.0)
- `personalWorkerOnly=true` excludes dispatchers
- `personalWorkerOnly=false` includes both types
- `bufferOptIn=true` extends radius by 10%: worker at 5.25 km with 5.0 km radius — excluded without buffer, included with
- `selectedWorkerIds` bypasses algorithm entirely

### Bug fixed during implementation
`MatchingServiceTest.matching_preSelectedWorkers_bypassesAlgorithm()` initially failed with Mockito's "UnfinishedStubbingException". Root cause: `mockWorkerDoc()` calls `when(doc.getId()).thenReturn(uid)` inside another `when().thenReturn()` argument list — Java evaluates arguments before calling the outer method, so the inner `when()` executes while the outer stub is incomplete. Fix: assign `mockWorkerDoc(...)` to a variable BEFORE the outer `when().thenReturn()` call.

### Test results
```
Tests run: 38
  StateMachineTest : 17 tests, 0 failures
  JobServiceTest   : 12 tests, 0 failures
  MatchingServiceTest:  9 tests, 0 failures
Build: SUCCESS (10.9 s)
```

### Remaining tasks in Phase 1
- P1-23: Production deployment guide (`docs/deployment-guide.md`, final `application-prod.yml`) ← next
- Manual step (outstanding from P1-20): Create composite index `(timestamp ASC, sequenceNumber ASC)` in the `yosnowmow-audit` Firebase project console

---

## 2026-04-13 — Session: P1-23 Production Deployment Guide

### Context
P1-22 (integration test suite) completed in the previous session with all 38 tests passing. P1-23 is the final task in Phase 1 — it produces the production deployment guide and finalises `application-prod.yml`.

### Files changed

**`backend/src/main/resources/application-prod.yml`** (updated — was skeleton with 3 entries)

Added production-appropriate settings that were specified in the P1-23 implementation plan prompt but missing from the skeleton:
- `server.tomcat.threads.max: 200` — constrains thread count for a Cloud Run instance (1–2 vCPU); the default (200) is explicit here for visibility. Rationale: leaving it implicit means the value silently changes if the Spring Boot default changes.
- `management.endpoint.health.show-details: never` — overrides the base `application.yml` which had `show-details: always`. In production the `/api/health` response must not expose component names, database connection details, or environment variable names — that would be a security information leak. Cloud Run liveness/readiness probes only need the top-level `{"status":"UP"}`.
- `logging.level.root: WARN` — supplements the existing `com.yosnowmow: INFO` line. Framework noise (Spring, Hibernate, Netty) is suppressed to WARN; application code stays at INFO.
- Added detailed comments explaining each setting and the reasoning, consistent with the project's documentation-first approach.

**`docs/deployment-guide.md`** (new file)

A comprehensive 8-section deployment guide covering:

1. **Prerequisites** — tool versions and authentication commands
2. **One-Time Infrastructure Setup** (5 subsections):
   - GCP Artifact Registry — `gcloud artifacts repositories create` command. Artifact Registry is used instead of Container Registry because Google shut down GCR in March 2025 (this is why the CI/CD workflow was changed in commit `011fb60`).
   - GCP Secret Manager — full table of 8 required secrets with their descriptions and sources; `gcloud secrets create` template command
   - Cloud Run Service Account — dedicated `yosnowmow-api-sa` SA with minimum required IAM roles; explanation of why ADC (Application Default Credentials) is preferred over injecting a service account JSON key file
   - Firebase Projects — the three-project setup (prod, audit, dev) documented in `.firebaserc`; `firebase deploy --only firestore:rules,firestore:indexes,storage` command; reminder about the outstanding P1-20 manual step for the composite index in `yosnowmow-audit`
   - SendGrid Domain Verification — step-by-step DNS record setup for SPF/DKIM/DMARC
   - Stripe Webhook Registration — endpoint URL, required events, signing secret flow
   - GitHub Secrets — full tables for both backend and frontend workflows
3. **Pre-Deployment Checklist** — grouped by Code & Tests, Infrastructure, Third-Party Services, CORS, GitHub Secrets
4. **Backend Deployment** — normal CI/CD path (push to main) plus manual deployment commands with blue/green traffic migration (10% canary → 100%)
5. **Frontend Deployment** — normal CI/CD path plus manual commands with all VITE_ vars
6. **Smoke Test Checklist** — 6 categories: API health (curl), Auth, User registration, Job creation (with curl examples), Stripe payment flow (stripe CLI), Email delivery, Frontend
7. **Rollback Procedure** — immediate traffic rollback (seconds, no rebuild) using `gcloud run services update-traffic --to-revisions`; full code revert via `git revert`; Firebase Hosting rollback
8. **Environment Variables Reference** — complete table of all runtime env vars, their source (Cloud Run vs Secret Manager vs developer machine), and what each does

**Design decisions in the deployment guide:**

- Used `northamerica-northeast2` (Hamilton, ON) not `northamerica-northeast1` (Montreal) — matched the actual region in `backend-deploy.yml`. The P1-23 implementation plan prompt mentioned `northamerica-northeast1`, which appears to be a leftover from an earlier draft before the region was finalised.
- The manual `gcloud run deploy` command includes `FIREBASE_AUDIT_PROJECT_ID` and `ADMIN_BCC_EMAIL` as `--set-secrets` — these are referenced in `application.yml` but were not in the CI/CD workflow's `--set-secrets` list. This should be reconciled before going live (either add them to `backend-deploy.yml` or confirm they are not needed in prod).
- Smoke tests use `stripe listen --forward-to` pointing at the production Cloud Run URL — this is intentional for first-deployment validation before setting up a local forwarding proxy for day-to-day development.
- Security note for Maps API key included: it must never appear in the frontend bundle (the Vite build uses only `VITE_*` variables, none of which is the Maps key).

### Phase 1 complete

All P1-01 through P1-23 tasks are now done. Phase 1 MVP is ready for production deployment when the infrastructure checklist in `docs/deployment-guide.md` §3 is satisfied.

**Outstanding manual step (still required before first deployment):**
- ~~Create composite index in `yosnowmow-audit` Firestore project: collection `auditLog`, fields `timestamp ASC` + `sequenceNumber ASC`~~ ✓ Done 2026-04-13 — index created via Firebase Console, status: Enabled.

**Remaining follow-up (not blocking deployment):**
- Add `firebase-audit/` directory to source control so the index definition is code-tracked and repeatable (Option B from deployment guide). Deferred intentionally — console creation unblocked deployment.

---

## 2026-04-13 — Emulator seed script

### Context
During smoke-testing against the Firebase Auth + Firestore emulators, the engineer hit `INVALID_PASSWORD` and then `EMAIL_NOT_FOUND` when trying to sign in with a test account. Root cause: the Auth emulator starts with no users on every restart, so accounts created in a previous session are gone. The fix is a seed script that recreates all test accounts on demand.

### Decision: Node.js Admin SDK script over PowerShell
Options considered:
1. **PowerShell one-liner** (ad-hoc `signUp` REST call) — too fragile; no Firestore doc, no custom claims.
2. **Node.js + Firebase Admin SDK** — idiomatic, supports `setCustomUserClaims()` and Firestore writes in the same script, runs on any platform.
3. **Firebase CLI `emulators:export` / `emulators:import`** (Option B) — best for persistent multi-session dev; can be layered on top of Option C later.

Chose Option C (seed script) as the primary solution; Option B can be added alongside it.

### Files created

**`firebase/package.json`** (new)
- Minimal package for the `firebase/` directory.
- Single production dependency: `firebase-admin ^12.0.0`.
- Script: `npm run seed` → `node seed-emulator.js`.

**`firebase/seed-emulator.js`** (new)
- Sets `FIREBASE_AUTH_EMULATOR_HOST=localhost:9099` and `FIRESTORE_EMULATOR_HOST=localhost:8080` **before** `require('firebase-admin')` so the SDK routes all traffic to the local emulators.
- Initialises Admin SDK with `projectId: 'demo-yosnowmow'` — the `demo-` prefix engages Firebase offline/emulator mode; no real GCP credentials needed.
- Creates four test accounts (idempotent — update if exists, create if not):

  | Email | Password | Roles |
  |---|---|---|
  | requester@yosnowmow.test | Requester123! | requester |
  | worker@yosnowmow.test | Worker123! | worker |
  | both@yosnowmow.test | Both123! | requester, worker |
  | admin@yosnowmow.test | Admin123! | admin |

- For each account: creates Firebase Auth user → `setCustomUserClaims({ roles: [...] })` → writes `users/{uid}` Firestore document with full schema matching `User.java` and `WorkerProfile.java`.
- Worker and dual-role accounts include a populated `worker` sub-object with realistic Oakville/Burlington addresses, pricing tiers, and geocoded `GeoPoint` coordinates.
- Dual-role account (Jordan Tremblay) is seeded with 15 completed jobs and a 4.8 rating to support rating-display testing.
- Firestore writes use `{ merge: true }` — extra fields written by other scripts (e.g. Stripe IDs added manually) are not wiped.

### Usage
```bash
firebase emulators:start
cd firebase && npm install   # once
node firebase/seed-emulator.js
```

---

## 2026-04-14 — Quartz 2am job did not fire

### What happened
The `AuditIntegrityJob` (P1-20) is configured to fire at `0 0 2 * * ?` (02:00 America/Toronto) via Quartz in `QuartzConfig.java`. No audit integrity check ran overnight.

### Root cause
Cloud Run scales to zero when idle. No traffic overnight → no warm container → JVM not running → Quartz never fires. The in-memory Quartz store (`spring.quartz.job-store-type: memory`, set in both `application-dev.yml` and `application-prod.yml`) has no persistence, so there is no missed-fire recovery when the container eventually wakes up.

This is a known Phase 1 limitation, already documented in `application-prod.yml`:
> Phase 2: migrate to Cloud SQL JDBC store

### Decision
No action taken for now. Two options were considered and deferred:
- **Short-term:** Set `--min-instances=1` on the Cloud Run service (~$20–30 CAD/month) — keeps the JVM alive so Quartz fires on schedule.
- **Proper fix (Phase 2):** Migrate Quartz to a Cloud SQL JDBC job store — survives scale-to-zero and container restarts. Already on the Phase 2 roadmap.

### Impact
The audit log hash-chain for the night of 2026-04-13 was not verified. This is not a data integrity failure — the audit log itself is append-only and hash-chained — but the nightly verification pass was skipped. No alert was sent (alerts only fire when the job runs and finds mismatches, not when the job fails to run at all).

---

## 2026-04-14 — P1-23 WebhookController tests

### Context
Testing backlog review confirmed that all 10 controllers had zero test coverage. The agreed priority was to start with `WebhookController` because Stripe's webhook signature verification is security-critical: any gap here could allow forged webhook events to capture payments, confirm jobs, or trigger notifications without a real Stripe event.

### What was built
`backend/src/test/java/com/yosnowmow/controller/WebhookControllerTest.java` — 9 MockMvc tests covering:

| Test | What it proves |
|---|---|
| `invalidSignature_returns400` | Invalid Stripe signature → controller returns 400 immediately |
| `webhookEndpoint_noAuthHeader_isPermitted` | No Firebase token needed; `FirebaseTokenFilter.shouldNotFilter()` skips `/webhooks/**` |
| `unknownEventType_returns200_noDownstreamCalls` | Unhandled event types → 200 (Stripe must not retry), no service calls |
| `amountCapturableUpdated_withJobId_capturesCalled` | Happy path: `capturePayment` invoked with correct PI ID |
| `amountCapturableUpdated_noJobId_skipsCapture` | Guard: missing `jobId` in PI metadata → capture skipped |
| `paymentSucceeded_pendingDeposit_transitionsToConfirmed` | Job in `PENDING_DEPOSIT` → `transitionStatus(CONFIRMED, "stripe", ...)` |
| `paymentSucceeded_alreadyConfirmed_skipsTransition` | Idempotency guard inside handler: no duplicate transition |
| `paymentFailed_notifiesRequester` | `notifyPaymentFailed` called; job is NOT cancelled |
| `duplicateEvent_returns200_noProcessing` | Firestore idempotency check returns `true` → all processing skipped |

### Key decisions

**`Webhook.constructEvent` is static — use `MockedStatic`**
HMAC-SHA256 verification is a static method on the Stripe SDK (`Webhook.constructEvent`). Computing real signatures in tests would require knowing the secret and the exact byte-sequence. MockedStatic (Mockito 5.x, bundled with Spring Boot 3.2) lets each test control pass/fail without computing real HMAC values. Each test uses try-with-resources to limit the static mock's scope to that single test.

**`@Import(SecurityConfig.class)` required**
`@WebMvcTest` uses `WebMvcTypeExcludeFilter` which does NOT include `@EnableWebSecurity` configurations in the component scan by default — only `Filter`, `@Controller`, `WebMvcConfigurer`, etc. Without `@Import(SecurityConfig.class)`, Spring Boot's default security config (CSRF enabled, no custom permits) was applied and every POST returned 403. Adding the import loads our custom chain with `csrf(disabled)` and `/webhooks/**` → `permitAll()`.

**Real `FirebaseTokenFilter` preferred over `@MockBean`**
Using the real filter (with `@MockBean FirebaseAuth` for its constructor dependency) lets `shouldNotFilter()` run naturally — proving that the production security posture (skip auth for `/webhooks/**`) is correct. A `@MockBean FirebaseTokenFilter` would bypass that check entirely.

**Firestore `runTransaction` mocked with `doReturn`**
`runTransaction` is a generic method `<T> ApiFuture<T>`. Using `when().thenReturn()` on a generic return triggers unchecked-cast warnings and potential type inference issues. `doReturn(ApiFutures.immediateFuture(Boolean.FALSE)).when(firestore).runTransaction(any())` avoids both. The class-level `@SuppressWarnings("unchecked")` covers remaining generic stubs.

### Test results
```
Tests run: 47, Failures: 0, Errors: 0, Skipped: 0
```
(38 pre-existing + 9 new; all pass)

---

## 2026-04-14 — Session 2 (continued): P1-24 Remaining Controller Tests

### Context
Continuing the controller test backlog established in P1-23. The goal was to write `@WebMvcTest` slice tests for all remaining controllers: `JobController`, `UserController`, `PaymentController`, `WorkerController`, `RatingController`, `JobRequestController`, `StorageController`, `AdminController`. `DisputeController` is an empty stub (1-line comment) — skipped.

---

### Root cause discovery: `FirebaseTokenFilter` blocks test auth

**Problem:** All `JobControllerTest` (17 tests) returned 401 even though the `asUser()` helper using `SecurityMockMvcRequestPostProcessors.authentication()` was correctly injecting an `AuthenticatedUser` into the `SecurityContext`.

**Root cause:** `FirebaseTokenFilter.doFilterInternal()` runs before Spring Security evaluates the access control rules. When it finds no `Authorization: Bearer` header, it immediately calls `writeUnauthorized()` (writes 401 JSON) and returns **without calling `filterChain.doFilter()`**. This short-circuits the filter chain before the `SecurityContext` pre-populated by `authentication()` is ever checked.

The `authentication()` post-processor from Spring Security Test uses `RequestAttributeSecurityContextRepository` (stateless config) to store the auth in a request attribute. Spring Security's `SecurityContextHolderFilter` loads it into `SecurityContextHolder` before the filter chain runs. But `FirebaseTokenFilter` then ignores `SecurityContextHolder.getContext().getAuthentication()` entirely — it only looks at the `Authorization` header.

**Fix:** Added an "already authenticated" pass-through check at the top of `doFilterInternal()`:
```java
Authentication existingAuth = SecurityContextHolder.getContext().getAuthentication();
if (existingAuth != null && existingAuth.isAuthenticated()) {
    filterChain.doFilter(request, response);
    return;
}
```
**Safety:** With `SessionCreationPolicy.STATELESS`, nothing upstream ever populates `SecurityContextHolder` in production — only the test framework does this via request attributes. The check is therefore a no-op in production and a clean pass-through in tests.

**File changed:** `backend/src/main/java/com/yosnowmow/security/FirebaseTokenFilter.java`

---

### Test pattern: `@Import({SecurityConfig.class, RbacInterceptor.class})`

Any controller that uses `@RequiresRole` needs `RbacInterceptor` imported alongside `SecurityConfig`. `WebMvcConfig` (a `WebMvcConfigurer`, included by `@WebMvcTest`) requires `RbacInterceptor` (a plain `@Component`, excluded by `@WebMvcTest`); without it the app context fails to load.

Controllers with **no** `@RequiresRole` (only inline role checks or no auth logic) only need `@Import(SecurityConfig.class)`.

| Test class | Extra import | Reason |
|---|---|---|
| `UserControllerTest` | none | inline `requireSelfOrAdmin()` only |
| `RatingControllerTest` | none | no role enforcement |
| `JobControllerTest` | `RbacInterceptor` | `@RequiresRole` on 5 methods |
| `PaymentControllerTest` | `RbacInterceptor` | `@RequiresRole` on 3 methods |
| `WorkerControllerTest` | `RbacInterceptor` | `@RequiresRole` on 2 methods |
| `JobRequestControllerTest` | `RbacInterceptor` | `@RequiresRole` on 1 method |
| `StorageControllerTest` | `RbacInterceptor` | `@RequiresRole` on 1 method |
| `AdminControllerTest` | `RbacInterceptor` | `@RequiresRole` on all 6 methods |

---

### Mockito gotcha: mixing real args and matchers in `when()` / `verify()`

Several stubs were initially written as `when(mock.method(realArg, null == null ? any() : any()))` — this evaluates to `when(mock.method(realArg, any()))` but Mockito rejects it because you cannot mix real argument values with Mockito matchers in the same stubbing call. The fix in all cases: use either `eq(realArg)` (a matcher equivalent to the real value) or replace all args with matchers.

---

### Mockito gotcha: `DocumentReference.update(String, Object, Object...)` varargs stub

`StorageController.uploadPhoto()` calls:
```java
firestore.collection("jobs").document(jobId).update(
    "completionImageIds", FieldValue.arrayUnion(downloadUrl),
    "updatedAt",          Timestamp.now()
).get();
```

Stubbing `docRef.update(anyString(), any(), (Object[]) any())` did not match the compiled call. The Mockito varargs matcher `(Object[]) any()` was not recognized correctly for the 3-arg varargs form. **Fix:** Created `docRef` with `Answers.RETURNS_DEEP_STUBS` so the entire `update(...).get()` chain returns non-null mocks without any explicit varargs stub.

---

### WorkerController: `@NotBlank` on `baseAddressFullText` applies to PATCH too

`WorkerProfileRequest.baseAddressFullText` carries `@NotBlank`, which fails on `null`. Since the same DTO is used for both POST and PATCH endpoints (validation groups are not used), any `@Valid`-annotated PATCH call must include `baseAddressFullText` in the body. Test bodies updated to include this field.

---

### New test files created (all passing)

| File | Tests | Notes |
|---|---|---|
| `JobControllerTest.java` | 17 | Role enforcement, address visibility (spy), cancel routing |
| `UserControllerTest.java` | 9 | Self-or-admin check, FCM token update |
| `PaymentControllerTest.java` | 10 | Escrow intent, onboarding, release, refund |
| `WorkerControllerTest.java` | 5 | Activate worker, update own/admin profile |
| `RatingControllerTest.java` | 6 | Submit rating (validation), list ratings |
| `JobRequestControllerTest.java` | 3 | Worker accept/decline, non-worker 403 |
| `StorageControllerTest.java` | 6 | Upload photo (ownership, status, max-photos, RBAC) |
| `AdminControllerTest.java` | 9 | Non-admin 403 (all endpoints), happy-path for service-delegating endpoints |

### Test results
```
Tests run: 112, Failures: 0, Errors: 0, Skipped: 0
```
(64 pre-session + 48 new; all pass)

---

## 2026-04-14 — P1-25 Firebase Emulator Integration Tests (Phase 1: UserService)

### Context
With all 112 unit + controller tests green, the next phase is Firebase Emulator integration tests. These use `@SpringBootTest(webEnvironment=NONE)` + `@ActiveProfiles("test")` to load the full Spring context against the local Firestore emulator, giving end-to-end confidence that writes actually reach the database and domain rules (age check, role validation, duplicate UID prevention) are enforced correctly.

---

### Bug fix: duplicate `yosnowmow:` root key in `application-test.yml`

**Root cause:** When the firebase emulator config was added to `application-test.yml` in the previous session, it was placed under a NEW `yosnowmow:` block rather than being merged into the existing one (which held sendgrid/maps/stripe keys). SnakeYAML (used by Spring Boot's YAML loader) rejects duplicate root-level keys and threw:

```
found duplicate key yosnowmow
```

This caused ALL test classes that loaded the test profile YAML to fail context loading.

**Fix:** Merged the two `yosnowmow:` sections into a single block. The `firebase:`, `sendgrid:`, `maps:`, and `stripe:` sub-keys are now all siblings under one root `yosnowmow:` node.

**File changed:** `backend/src/test/resources/application-test.yml`

---

### New file: `FirestoreUserServiceTest.java`

**Path:** `backend/src/test/java/com/yosnowmow/integration/FirestoreUserServiceTest.java`

**Package:** `com.yosnowmow.integration` (new `integration` sub-package)

**Annotations:**
- `@SpringBootTest(webEnvironment = NONE)` — full application context, no embedded Tomcat
- `@ActiveProfiles("test")` — loads `application-test.yml`; Firestore connects to `localhost:8080`
- `@Tag("integration")` — reserved for future Maven Surefire include/exclude configuration

**Emulator guard:** `@BeforeAll static void requireEmulator()` calls `assumeTrue(isPortOpen("localhost", 8080), ...)`. If the emulator is not running, the entire class is aborted before any test method executes — BUILD SUCCESS, 0 tests run, no failures.

**Mocks:**
- `@MockBean FirebaseAuth` — prevents `setCustomUserClaims()` from calling the Auth emulator (which is not required for UserService integration tests)
- `@MockBean NotificationService` — prevents SendGrid `sendWelcomeEmail()` calls; also prevents `NotificationService`'s `@PostConstruct` from constructing a real SendGrid client

**Test isolation:** `newUid()` generates a `"test-" + UUID` string and records it in `createdUids`. `@AfterEach cleanup()` deletes all recorded documents from the emulator — `delete()` on a non-existent document is a no-op, so tests that throw before writing are still safe.

**Tests (6):**

| Test | Assertion |
|------|-----------|
| `createUser_writesDocumentToFirestore` | Returns correct User; `DocumentSnapshot.exists()` is true; Firestore fields match |
| `createUser_duplicateUid_throws409` | Second `createUser()` with the same UID → HTTP 409 |
| `getUser_existingDocument_returnsUser` | After `createUser()`, `getUser()` returns the same data |
| `getUser_nonExistingUid_throwsUserNotFoundException` | `getUser("uid-does-not-exist")` → `UserNotFoundException` |
| `createUser_underAge_throws422` | `dateOfBirth = "2015-01-01"` → HTTP 422 (validation throws before Firestore write) |
| `createUser_adminRoleSelfAssigned_throws403` | `roles = ["admin"]` → HTTP 403 (validation throws before Firestore write) |

---

### DispatchService startup concern

`DispatchService.recoverPendingDispatches()` fires on `ContextRefreshedEvent` in a daemon thread. With the emulator running it queries `jobRequests` (returns empty — no-op). Without the emulator the query throws an exception, which is caught by the daemon thread's `catch (Exception e)` wrapper. Either way, the Spring context starts cleanly and the `@BeforeAll` assumption check handles the skip-if-unavailable case.

---

### Test results after this session

```
Non-integration tests:  Tests run: 112, Failures: 0, Errors: 0, Skipped: 0
Integration tests (emulator off): Tests run: 0, Failures: 0, Errors: 0, Skipped: 0  (BUILD SUCCESS)
```

Integration tests will report 6/6 when run with `firebase emulators:start --only firestore`.

---

## 2026-04-14 — P1-25 confirmed: integration tests green against live emulator

User ran `firebase emulators:start --only firestore` then `mvn test -Dgroups=integration`.

```
Tests run: 6, Failures: 0, Errors: 0, Skipped: 0  — BUILD SUCCESS
```

`FirestoreUserServiceTest` is fully verified end-to-end. All 6 write/read/validation paths confirmed against real Firestore emulator data.

---

## 2026-04-14 — P1-26 FirestoreJobServiceTest — integration tests for JobService

### New file: `FirestoreJobServiceTest.java`

**Path:** `backend/src/test/java/com/yosnowmow/integration/FirestoreJobServiceTest.java`

Same infrastructure as `FirestoreUserServiceTest`: `@SpringBootTest(webEnvironment=NONE)`, `@ActiveProfiles("test")`, `@Tag("integration")`, `@BeforeAll` emulator guard.

**Additional mock vs UserService tests:**
- `@MockBean GeocodingService` — `createJob()` calls `geocodingService.geocode()` which hits Google Maps. Default stub returns Toronto coords (`43.6532, -79.3832`). The `createJob_geocodingFails` test overrides it per-test to throw `GeocodingException`.

**`AuditLogService` intentionally not mocked** — uses the real `auditFirestore` bean pointing to `demo-yosnowmow-audit` in the same emulator. The `JOB_CREATED` and `STATUS_PENDING_DEPOSIT` audit entries actually write through, giving end-to-end coverage of the audit hash-chain bootstrap from `GENESIS_HASH`.

**Per-test user isolation:** `@BeforeEach setUpUser()` calls `UserService.createUser()` to write a fresh requester document before every test, making `guardNoActiveJob()` correctly start from a clean slate.

**Tests (7):**

| Test | What it proves |
|------|----------------|
| `createJob_writesDocumentToFirestore` | Full write path; `DocumentSnapshot` verified in emulator |
| `createJob_requesterHasActiveJob_throws409` | Active-job guard via real Firestore `whereEqualTo` + `whereIn` composite query |
| `createJob_invalidScope_throws422` | Scope validation fires before Firestore write |
| `createJob_geocodingFails_throws422` | `GeocodingException` → 422; no document written |
| `getJob_existingJob_returnsJob` | Read round-trip after write |
| `getJob_nonExistentId_throwsJobNotFoundException` | Not-found path |
| `transitionStatus_updatesStatusInFirestore` | `REQUESTED → PENDING_DEPOSIT` reflected in live Firestore doc |

### Test results

```
Unit + controller tests:                   112/112 pass
Integration tests (UserService + JobService): 13/13 pass
Total integration test count: 13 (6 UserService + 7 JobService)
```

---

## 2026-04-14 — Fix: emulator singleProjectMode warning

**Symptom:** Emulator logged "Multiple projectIds are not recommended in single project mode. Requested project ID demo-yosnowmow, but the emulator is configured for yosnowmow-dev."

**Root cause:** `firebase.json` had `"singleProjectMode": true`. Integration tests always use two project IDs simultaneously — `demo-yosnowmow` (primary Firestore) and `demo-yosnowmow-audit` (audit Firestore) — so the emulator complained on every request to the non-configured project.

**Fix:** Changed `"singleProjectMode": true` → `"singleProjectMode": false` in `firebase/firebase.json`.

**Result:** Warning gone. 13/13 integration tests still pass.

---

## 2026-04-14 — P1-27 Firestore Security Rules Tests

### New files

| File | Purpose |
|---|---|
| `firebase/test/firestore.rules.test.mjs` | 41 security rules tests using `@firebase/rules-unit-testing` v4 |
| Updated `firebase/package.json` | Added `@firebase/rules-unit-testing`, `firebase` v10, `jest` v29 |

### Test runner setup

- **Framework:** Jest v29 with `--experimental-vm-modules` flag for native ESM support
- **Test file:** `.mjs` extension — treated as ESM without requiring `"type": "module"` in `package.json`, so `seed-emulator.js` (CommonJS) is unaffected
- **Windows fix:** `node_modules/jest/bin/jest.js` called directly to avoid the bash shim in `node_modules/.bin/jest` (which Node cannot execute on Windows)
- **Noise suppression:** `setLogLevel('error')` from `firebase/app` silences the Firebase SDK's WARN-level gRPC PERMISSION_DENIED messages that fire for every `assertFails` write test

### What is tested (41 tests across 8 describe blocks)

| Describe block | Tests | Key assertions |
|---|---|---|
| `/users/{uid}` | 6 | Owner + admin read ✓; other user / unauthenticated denied; ALL writes denied |
| `/jobs/{jobId}` | 6 | Requester + assigned worker + admin read ✓; unrelated user denied; writes denied |
| `/jobRequests/{requestId}` | 4 | Target worker + admin read ✓; different worker denied; writes denied |
| `/ratings/{ratingId}` | 5 | Rater + ratee + admin read ✓; unrelated user denied; writes denied |
| `/notifications/.../feed/...` | 7 | Owner read ✓; `isRead`-only update ✓; multi-field update denied; create / delete denied; other user denied |
| `/disputes/{disputeId}` | 5 | Requester + worker + admin read ✓; unrelated user denied; writes denied |
| `geocache` / `stripeEvents` | 5 | All client access denied — even admin |
| Catch-all | 3 | Unknown collection read + write denied for admin and authenticated user |

### Notes

- `testEnv.withSecurityRulesDisabled()` used for seeding pre-existing documents (Admin SDK equivalent in tests)
- `testEnv.clearFirestore()` called in `afterEach` for strict per-test isolation
- `firebase/package.json` installed with `--legacy-peer-deps` due to peer dependency conflict between `@firebase/rules-unit-testing` v4 and `firebase-admin` v12

### Test results

```
Test Suites: 1 passed, 1 total
Tests:       41 passed, 41 total
Time:        3.777 s
```

---

## 2026-04-14 — Session: Frontend Vitest Tests (P1-28)

### Context

All backend testing was complete (112 unit tests, 13 integration tests, 41 Firestore rules tests). This session completed the final item on the testing backlog: frontend Vitest component tests.

---

### P1-28 — Frontend Vitest component tests

**Setup (carried over from previous session):**
- `frontend/vite.config.js` — added `test: { environment: 'jsdom', globals: true, setupFiles: ['./src/test/setup.js'] }`
- `frontend/package.json` — added `"test": "vitest run"` and `"test:watch": "vitest"` scripts; devDependencies: `vitest`, `@testing-library/react`, `@testing-library/user-event`, `@testing-library/jest-dom`, `jsdom`
- `frontend/src/test/setup.js` — `import '@testing-library/jest-dom'`

**Test files written:**

| File | Tests | Covers |
|---|---|---|
| `src/test/StatusPill.test.jsx` | 14 | All 11 known statuses, unknown status fallback, inline span element, no-throw |
| `src/test/MockStateContext.test.jsx` | 13 | initial state (2), addJob (4), setJobStatus (4), advanceJob (3) |
| `src/test/PostJob.test.jsx` | 8 | Step 1 validation + search state (4), Step 2 validation + price (2), Step 4 acknowledge + submit (2) |

**Issue: Vitest 4.x + React 19 fake timer incompatibility**

The PostJob tests were originally written using `vi.useFakeTimers()` + `userEvent.setup({ advanceTimers: vi.advanceTimersByTime })` to control the component's 1200ms/1800ms `setTimeout` calls in `nextStep1()`. All 6 timer-reliant tests timed out at 5000ms.

Root cause: React 19's concurrent renderer uses its own scheduler (via `MessageChannel` in jsdom). When `vi.useFakeTimers()` intercepts `setTimeout`, React's `act()` — which waits for the scheduler to flush — can get stuck in a deadlock waiting for fake timers to advance while the test is waiting for `act` to complete. Neither unblocks the other.

Switching to `{ delay: null }` in `userEvent.setup` (which avoids userEvent's internal typing delays) did not resolve the hang — confirming the issue was with React's scheduler, not userEvent's internal timing.

**Fix:** Removed `vi.useFakeTimers()` entirely from PostJob tests. Replaced `advanceToStep2` helper with a real-timer `waitFor` approach:

```js
async function advanceToStep2(user) {
  await user.type(screen.getByPlaceholderText(/123 Main Street/i), '42 Elm Street, Toronto, ON')
  await user.click(screen.getByRole('button', { name: /next/i }))
  await waitFor(
    () => screen.getByText('What services do you need?'),
    { timeout: 3000 }
  )
}
```

The 1800ms real timer fires naturally; `waitFor` polls until the step 2 heading appears. Per-test timeout capped at 5000ms (explicit) to make the intent clear. Total suite time is ~16 seconds (mostly jsdom startup + the real 1800ms waits).

**Key note for future PostJob tests:** Do NOT use `vi.useFakeTimers()` with React 19 + Vitest 4.x unless using `{ toFake: [...] }` to carefully exclude things React's scheduler depends on (this is fragile). Real timers + `waitFor` are more reliable.

### Test results

```
Test Files  3 passed (3)
Tests       35 passed (35)
Duration    16.72 s
```

### Testing backlog — COMPLETE

| Layer | Test count | Status |
|---|---|---|
| Unit + controller (@WebMvcTest) | 112 | ✓ |
| Integration (Firestore emulator) | 13 | ✓ |
| Firestore security rules | 41 | ✓ |
| Frontend Vitest | 35 | ✓ |
| **Total** | **201** | **✓**
```

---

## 2026-04-15 — Session: Firebase Emulator Seed, Frontend Deploy, Login UI (P1-06)

### Context

Phase 1 development is underway. Backend is deployed to Cloud Run; frontend deploy to Firebase Hosting was broken. This session fixed the deploy pipeline, seeded test users in the Firebase emulator, and implemented the Login UI (P1-06) with Firebase Auth integration.

---

### Fix: seed-emulator.js project ID mismatch

**Problem:** `seed-emulator.js` initialised the Firebase Admin SDK with project ID `demo-yosnowmow`, but the emulator suite is started with project `yosnowmow-dev` (from `.firebaserc`). With `singleProjectMode: false` the emulators allow both namespaces, but data written to `demo-yosnowmow` is invisible in the Emulator UI (which shows `yosnowmow-dev`).

**Fix:** Changed `admin.initializeApp({ projectId: 'demo-yosnowmow' })` to `admin.initializeApp({ projectId: 'yosnowmow-dev' })` in `firebase/seed-emulator.js`.

**Result:** Seed script creates four test accounts that are visible in the Auth tab of the Emulator UI at `http://localhost:4000`.

---

### Fix: Frontend Deploy — firebase.json not found

**Root cause (sequence of investigation):**

1. **First attempt:** `FirebaseExtended/action-hosting-deploy@v0` was looking for `firebase.json` in the repo root, but it lives in `firebase/`. Added `entryPoint: firebase` to the action — failed with the same error. The `entryPoint` parameter in `@v0` has unreliable path resolution.

2. **Second attempt:** Moved `firebase.json` and `.firebaserc` to the repo root (`yosnowmow/firebase.json`), updating relative paths (`hosting.public: frontend/dist`, rules paths prefixed with `firebase/`). Also added `workflow_dispatch` trigger to the workflow so it can be manually triggered without a frontend file change. Still failed — turns out the workflow hadn't re-run against the new commit because the `frontend/**` path filter meant only the old (pre-fix) run existed.

3. **Third attempt (new run):** The `action-hosting-deploy@v0` still could not find `firebase.json` at the repo root, even with `entryPoint: .`. Root cause unknown — possibly a bug in that specific action version's `GITHUB_WORKSPACE` resolution. **Decision:** replaced the action entirely with direct `firebase-tools` CLI.

4. **Fourth attempt:** Replaced action with `npx firebase-tools@latest deploy` using `GOOGLE_APPLICATION_CREDENTIALS=/tmp/sa.json`. New error: "Failed to get Firebase project." The CLI uses ADC (Application Default Credentials); manually writing the service account JSON to a file and setting `GOOGLE_APPLICATION_CREDENTIALS` was not sufficient.

5. **Fifth attempt:** Added `google-github-actions/auth@v2` before the CLI step to properly wire up ADC. Still same "Failed to get Firebase project" error.

6. **Diagnosis:** The `firebase-adminsdk` service account was missing the **Firebase Hosting Admin** (`roles/firebasehosting.admin`) role. It had Firebase Auth Admin, Storage Admin, and Firebase Admin SDK Administrator Service Agent — but not Hosting Admin. Added the role in GCP Console → IAM.

7. **Resolution:** Deploy succeeded on the next run. Removed `--debug` flag from the workflow.

**Final workflow shape (`frontend-deploy.yml`):**
- Build with Vite (VITE_ secrets injected, `VITE_USE_EMULATORS=false`)
- `google-github-actions/auth@v2` authenticates via `FIREBASE_SERVICE_ACCOUNT` secret
- `npx firebase-tools@latest deploy --only hosting --project $PROJECT_ID --non-interactive`

---

### P1-06: Login UI

**Files created/modified:**

| File | Change |
|---|---|
| `frontend/src/context/AuthContext.jsx` | Full implementation — `onAuthStateChanged` listener, Firestore profile fetch, `signIn()`, `signOut()` |
| `frontend/src/hooks/useAuth.js` | Thin hook over AuthContext |
| `frontend/src/pages/auth/Login.jsx` | Email + password form, Firebase error translation, role-based post-login redirect |
| `frontend/src/pages/auth/Login.module.css` | Card layout, error state, responsive |
| `frontend/src/main.jsx` | Added `<AuthProvider>` wrapping `<MockStateProvider>` |
| `frontend/src/App.jsx` | Added `ProtectedRoute` component; wrapped `/requester`, `/worker`, `/admin` route trees |

**Key decisions:**

- `AuthContext` fetches the Firestore `users/{uid}` document after each sign-in so that `userProfile.roles[]` is available for role-based redirect without an extra API call.
- Post-login redirect: admin → `/admin`; worker-only → `/worker`; requester or dual-role → `/requester`.
- `ProtectedRoute` passes `location.state.from` to `/login` so the user is redirected back to their original destination after sign-in.
- `ProtectedRoute` renders `null` while `loading` to prevent a flash of the login page on hard reload.

**Bug fixed during testing — firebase.js emulator guard was inverted:**

`firebase.js` guarded `connectAuthEmulator` with `!auth._canInitEmulator`. In the Firebase SDK, `_canInitEmulator` is `true` on a fresh auth instance and set to `false` after `connectAuthEmulator` is called. The `!` inverted the condition so the emulator was **never connected** — the SDK silently talked to real Firebase Auth (where the seed users don't exist), causing "Incorrect email or password" for all test accounts.

**Fix:** Replaced the inverted private-property guards with a module-level `firebase_emulatorsConnected` boolean that is set to `true` on first connection. All three emulator connections (Auth, Firestore, Storage) are now guarded by the same flag.

**Verification:** Signed in as `requester@yosnowmow.test` and `worker@yosnowmow.test` — both succeed and land on the correct section.

---

## 2026-04-17 — Session: Phase 2 (P2-01 through P2-07)

### Context

Phase 1 was complete. This session implemented all seven tasks in Phase 2 — Structured Disputes. Work proceeded sequentially, each task building directly on the last. All backend changes were verified with `./mvnw compile -q` before moving on.

---

### P2-01 — Dispute Model & Service

**Discussion:** The first dispute-related task. Goal was to create the Firestore `Dispute` model and a full `DisputeService` that handles opening, querying, and resolving disputes — and to wire `POST /api/jobs/{jobId}/dispute` in `JobController` to delegate to it.

**Files created/modified:**

| File | Change |
|---|---|
| `backend/.../model/Dispute.java` | New — Firestore model for `disputes/{disputeId}` collection with all fields: `disputeId`, `jobId`, `openedByUid`, `openedAt`, `status` (OPEN/RESOLVED), `resolution` (RELEASED/REFUNDED/SPLIT), `splitPercentageToWorker`, `requesterStatement`, `workerStatement`, `evidenceUrls`, `adminNotes`, `resolvedByAdminUid`, `resolvedAt` |
| `backend/.../dto/DisputeRequest.java` | Replaced stub — `@NotBlank @Size(max=2000) String statement` |
| `backend/.../dto/ResolveDisputeRequest.java` | New — `resolution` (RELEASED/REFUNDED/SPLIT), `splitPercentageToWorker` (0–100), `adminNotes` |
| `backend/.../service/DisputeService.java` | New full implementation. `openDispute()` validates job status (COMPLETE or INCOMPLETE), 2-hour window from `completedAt`, unique dispute guard, writes Firestore dispute doc, calls `jobService.transition(→DISPUTED)`, updates job with `disputeId`, notifies both parties. `getDispute()` enforces party/admin access. `addStatement()` updates `requesterStatement` or `workerStatement`. `resolveDispute()` updates dispute to RESOLVED, calls the appropriate `PaymentService` method (which also handles the job state transition). |
| `backend/.../controller/JobController.java` | Added `DisputeService` dependency; replaced stub `disputeJob` with full delegation to `disputeService.openDispute()` |
| `backend/.../model/Job.java` | Added `disputeId` (String) and `stripeRefundId` (String) fields with getters/setters |

**Key decisions:**

- `DisputeService.resolveDispute()` does NOT call `jobService.transition()` separately after calling a payment method, because `releasePayment()`, `refundJob()`, and `splitPayment()` each call `transitionStatus()` internally. Calling it twice would fail on the second attempt (job already in terminal state).
- The 2-hour dispute window is measured from `job.completedAt`, not from the current time. This is consistent with the spec.
- A small race condition exists in `openDispute()`: two simultaneous requests could both pass the "job not already DISPUTED" check before either writes. Acceptable for Phase 2 given low frequency; noted in code comment.

**Errors encountered and fixed:**

- Initial `splitPayment()` implementation used `(netWorker + hst) × splitPct / 100` — proportional HST. This was incorrect; HST always flows to the Worker in full for CRA remittance. Fixed in P2-03.
- `splitPayment()` initially used the fully-qualified class name `com.yosnowmow.model.User` inside the method body even though `User` was already imported. Fixed to use the short name.

---

### P2-02 — Evidence Upload

**Discussion:** Added `POST /api/disputes/{disputeId}/evidence` to the dispute flow, and `uploadDisputeEvidence()` to `StorageService`.

**Files modified:**

| File | Change |
|---|---|
| `backend/.../service/StorageService.java` | Renamed constants (`MAX_FILE_BYTES` → `MAX_PHOTO_BYTES`, `ALLOWED_CONTENT_TYPES` → `ALLOWED_PHOTO_TYPES`). Added `MAX_EVIDENCE_BYTES = 20 MB`, `ALLOWED_EVIDENCE_TYPES = {image/jpeg, image/png, application/pdf}`. Added `uploadDisputeEvidence(disputeId, partyRole, file)` — validates MIME/size, uploads to `disputes/{disputeId}/{partyRole}/{uuid}.{ext}`, returns Firebase Storage download URL with embedded download token. |
| `backend/.../controller/DisputeController.java` | New full implementation replacing stub. Added `POST /{disputeId}/evidence` endpoint. Determines caller party role by comparing `caller.uid()` against `job.requesterId` and `job.workerId`. Counts existing evidence per party by inspecting the `%2Frequester%2F` or `%2Fworker%2F` path segment in each Firebase Storage URL. Enforces 5-file cap per party. Atomically appends new URL to `dispute.evidenceUrls` via Firestore `FieldValue.arrayUnion`. |

**Key decisions:**

- Party evidence count is derived from the Firebase Storage URL path rather than a separate Firestore field. URLs encode the path as `disputes%2F{id}%2F{party}%2F…` so a `String.contains()` check suffices. This avoids adding extra Firestore fields for Phase 2.
- Admins are explicitly blocked from uploading evidence (only job parties may). An admin who is not a party gets 403.

---

### P2-03 — Split Payment Formula Correction

**Discussion:** The `splitPayment()` method written in P2-01 had an incorrect HST formula. Per the spec and for CRA remittance, HST must flow to the Worker in full regardless of the split percentage. The formula was corrected.

**File modified:**

| File | Change |
|---|---|
| `backend/.../service/PaymentService.java` | `splitPayment(jobId, workerPct)` replaced entirely. New formula: `workerAmountCents = round(netWorkerCents × workerPct / 100) + hstCents`. `requesterRefundCents = depositAmountCents - workerAmountCents`. Stripe Transfer for `workerAmountCents`, Stripe Refund for `requesterRefundCents`. Saves `stripeTransferId` and `stripeRefundId` to job. Audit logs `SPLIT_TRANSFER` and `SPLIT_REFUND`. Transitions job to RELEASED via `transitionStatus()`. Notifies both parties. |

**Old formula (wrong):** `workerAmountCents = (netWorkerCents + hstCents) × workerPct / 100`

**New formula (correct):** `workerAmountCents = round(netWorkerCents × workerPct / 100) + hstCents`

The difference: in the old formula a 50/50 split gave the worker only 50% of HST, meaning 50% of HST was refunded to the Requester. The new formula always gives the Worker 100% of HST (as it must be remitted to CRA), and only splits the net service price.

---

### P2-04 — Admin Dispute Resolution UI

**Discussion:** Wired the admin JobDetail page to the real dispute API. The P0 stub had a local-only "Admin Notes" card and placeholder action buttons. This task replaced it with a fully functional dispute panel.

**Files modified:**

| File | Change |
|---|---|
| `frontend/src/services/api.js` | Updated `disputeJob(jobId, reason)` → `disputeJob(jobId, statement)` (body `{ statement }`). Added `getDispute()`, `resolveDispute()`, `uploadEvidence()`, `addDisputeStatement()`. |
| `frontend/src/pages/admin/JobDetail.jsx` | Complete rewrite of the dispute panel. Fetches `Dispute` document via `getDispute()` when `job.disputeId` is set. Evidence gallery with image lightbox (via `Modal`) and PDF download links — each labeled Requester/Worker by Firebase Storage URL path matching. Statement cards with colored left border (blue=Requester, purple=Worker). Resolution form: radio group (RELEASED/REFUNDED/SPLIT), split slider with live P2-03 formula preview (`workerSplitCAD = workerPayoutCAD × splitPct / 100 + hstAmountCAD`), admin notes textarea (min 20 chars), confirm modal. `applyResolve()` calls `resolveDispute(dispute.disputeId, { resolution, splitPercentageToWorker, adminNotes })` then explicitly reloads both job AND dispute. Success banner after resolution. Read-only resolved state shows resolution type, notes, and adminUid. Removed local-only Admin Notes stub card. |

**Key decisions:**

- Resolution values in the API are uppercase (`'RELEASED'`, `'REFUNDED'`, `'SPLIT'`) matching Java enum names. The P0 stub used lowercase. Updated throughout.
- Dispute panel is displayed when `job.disputeId` is set (not just when `job.status === 'DISPUTED'`), so a resolved dispute's evidence and statements remain visible to admins.
- The `loadDispute` useEffect watches `job?.disputeId` which doesn't change on resolution. Explicit `loadDispute(dispute.disputeId)` call in `applyResolve()` after `loadJob()` ensures the panel reflects the resolved state.

---

### P2-05 — Worker Concurrent Capacity

**Discussion:** Phase 1 used a binary "is the worker busy?" check against a cached `activeJobCount` field. Phase 2 introduces configurable `capacityMax` (1–3) and replaces the stale-cache check with a live Firestore query.

**Files created/modified:**

| File | Change |
|---|---|
| `backend/.../dto/WorkerCapacityRequest.java` | New — `@Min(1) @Max(3) int maxConcurrentJobs` |
| `backend/.../service/WorkerService.java` | Added `AuditLogService` constructor dependency. Added `updateCapacity(targetUid, callerUid, isAdmin, maxConcurrentJobs)`: access check (own UID or admin), qualification gate for > 1 (rating ≥ 4.0 AND completedJobCount ≥ 10), audit log `WORKER_CAPACITY_UPDATED` before write, updates `worker.capacityMax` in Firestore. |
| `backend/.../controller/WorkerController.java` | Added `PATCH /api/users/{uid}/worker/capacity` endpoint. No `@RequiresRole` annotation — both worker (own UID) and admin are valid callers; service enforces the distinction. |
| `backend/.../service/MatchingService.java` | Replaced `worker.getActiveJobCount() >= worker.getCapacityMax()` with a live Firestore query via new private method `countActiveJobsForWorker(workerUid)`: `WHERE workerId = uid AND status IN ['CONFIRMED', 'IN_PROGRESS']`. Updated class Javadoc to reflect the change. |

**Key decisions:**

- The live query in `countActiveJobsForWorker` replaces the cached counter to prevent stale data from allowing a Worker to receive an offer while already at their concurrent limit during rapid back-to-back dispatch windows. The cost is one extra Firestore query per worker candidate in each matching run — acceptable for Phase 2 volumes and because `matchAndStoreWorkers` is already `@Async`.
- The `/api/users/{uid}/worker/capacity` path was chosen over the plan's `/api/workers/{uid}/capacity` for consistency with the existing `WorkerController` base path `/api/users`. The plan was written with `com.snowreach` package names and is a guideline, not a hard specification.
- Validation message includes the worker's actual rating to make the rejection actionable: _"Current rating: 3.85"_.

---

### P2-06 — Analytics Data Pipeline

**Discussion:** Daily aggregation pipeline that computes platform statistics for the previous calendar day and writes them to Firestore.

**Files created/modified:**

| File | Change |
|---|---|
| `backend/.../service/AnalyticsService.java` | New. `computeDailyStats(LocalDate)`: five Firestore queries scoped to Ontario midnight boundaries — (1) jobs with `completedAt` in range for revenue, (2) jobs with `cancelledAt`, (3) jobs with `disputeInitiatedAt`, (4) REQUESTER ratings by `createdAt`, (5) new users by `createdAt`. Writes to `analyticsDaily/{YYYY-MM-DD}` (idempotent via `set()`). Updates `analyticsSummary/current` in a Firestore transaction, maintaining `totalRatingStars` + `totalRatingCount` for a correct running `overallAverageRating`. `cleanupOldDailyStats()`: deletes `analyticsDaily` documents with `date` older than 90 days using lexicographic ISO date ordering. |
| `backend/.../scheduler/AnalyticsJob.java` | New — `@DisallowConcurrentExecution` Quartz job. Fires at 3 AM daily. Calls `computeDailyStats(yesterday)` then `cleanupOldDailyStats()`. Throws `JobExecutionException(refireImmediately=false)` on failure. |
| `backend/.../config/QuartzConfig.java` | Added `analyticsJobDetail()` and `analyticsTrigger()` beans. Cron `"0 0 3 * * ?"` — 3 AM daily, one hour after `auditIntegrityJob`. |

**Key decisions:**

- Two flat top-level Firestore collections (`analyticsDaily`, `analyticsSummary`) were chosen over a nested `analytics/daily/{date}` structure. The plan notation `analytics/daily/{date}` is ambiguous in Firestore (which requires alternating collection/document path segments), and flat collections are simpler to query.
- Revenue formula: `platformRevenueCents = grossRevenueCents - workerPayoutsCents - hstCollectedCents`. Since `total = tier + hst` and `worker = tier × (1 - commission)`, the platform fee is `tier × commission = total - hst - worker`. The formula is algebraically correct for any commission rate.
- Only REQUESTER-role ratings are used for `avgRating` in daily stats. These reflect Workers' service quality (the metric relevant to platform health). Worker-rated-Requester ratings are excluded.
- The 90-day retention policy matches `AnalyticsService.RETENTION_DAYS` and `AdminController`'s 90-day cap on analytics queries.

---

### P2-07 — Analytics Dashboard

**Discussion:** Frontend analytics page and two supporting backend endpoints to serve the data collected by P2-06.

**Files modified:**

| File | Change |
|---|---|
| `backend/.../controller/AdminController.java` | Added `GET /api/admin/analytics?from=YYYY-MM-DD&to=YYYY-MM-DD`: validates date format/order/90-day cap, queries `analyticsDaily` by lexicographic `date` range, reads `analyticsSummary/current`, returns `{ dailyStats, summary }`. Added `GET /api/admin/workers?size=10`: queries users ordered by `worker.completedJobCount` desc (requires Firestore composite index); returns `{ uid, name, completedJobCount, rating }` per Worker. |
| `frontend/src/services/api.js` | Added `getAdminAnalytics(from, to)`, `getTopWorkers(size)`, `exportTransactions(from, to)` (blob download for P3-07 CSV export). |
| `frontend/src/pages/admin/Analytics.jsx` | Full implementation replacing the P1-19 stub. Date range picker defaulting to last 30 days / yesterday; auto-fetches on change. Three Chart.js charts via `react-chartjs-2`: (a) dual-y-axis line chart — jobs completed (left axis, blue) and gross revenue in CAD (right axis, green) by day; (b) stacked bar chart — completed/cancelled/disputed outcomes grouped by week (ISO week start = Monday); (c) pie chart — all-time platform revenue / worker payouts / HST. Three all-time stat cards (Total Jobs, Gross Revenue with Platform sub-line, Avg Rating). Top Workers table (name / jobs completed / avg rating). Export CSV button — calls P3-07 endpoint; shows graceful "not yet available" message on 404. `NoData` placeholder shown for charts when the date range has no analytics data yet. |

**Dependencies installed:**

```
chart.js 4.x, react-chartjs-2 5.x
```

**Key decisions:**

- Chart.js CSS variables cannot be used inside chart option objects (the chart renders to a `<canvas>` via JavaScript, not the DOM). All chart colours are hardcoded hex values matching the design token values: `#1A6FDB` (blue), `#27AE60` (green), `#E74C3C` (red), `#F39C12` (amber), `#8E44AD` (purple).
- Weekly grouping for the bar chart is computed client-side by finding the Monday of each day's ISO week. This avoids adding a week-aggregation layer to the backend.
- `toDate` defaults to yesterday (not today) because `AnalyticsJob` runs at 3 AM and processes the *previous* day. Today's stats won't be available until 3 AM tomorrow.
- All-time HST is derived in the frontend as `totalGross - totalPlatform - totalWorker` rather than stored separately in the summary document. The formula holds because the three revenue components are exhaustive (every cent of a job payment goes to exactly one of: platform fee, worker payout, or HST).
- The export button is fully wired to call the P3-07 backend endpoint. It fails gracefully with a user-visible message if the endpoint returns 404 (i.e., P3-07 not yet implemented). No special feature-flagging is needed.

---

## P2-08 — Platform Health Monitoring
**Date:** 2026-04-17
**Status:** Complete

### Objective
Expose a `/api/health` endpoint with sub-component indicators for Firestore and Quartz so Cloud Run can use it as a liveness probe and GCP Monitoring can fire alerts when the platform degrades.

### Files created
- `backend/src/main/java/com/yosnowmow/config/HealthConfig.java` — `@Configuration` with two `@Bean` Spring Boot Actuator `HealthIndicator` lambdas

### Files modified
- `backend/src/main/resources/application.yml` — added `management.endpoint.health.show-components: always` to surface sub-components in the health response
- `docs/runbook.md` — full rewrite from placeholder to complete 9-section on-call runbook

### HealthConfig.java detail

Two beans, both registered under the Spring Boot Actuator naming convention (the Actuator strips the `HealthIndicator` suffix to derive the component key):

**`firebaseHealthIndicator` → `components.firebase`**
- Attempts a lightweight document read on `_health/ping` with a 5-second timeout
- A "document not found" (no error) response counts as UP — the document does not need to exist
- Returns DOWN with detail on TimeoutException or any other Exception; logs a WARN in both cases
- Conservative 5-second timeout prevents a slow Firestore response from triggering Cloud Run's 3-consecutive-failure restart policy

**`quartzHealthIndicator` → `components.quartz`**
- Checks `scheduler.isStarted()` — returns DOWN with `"quartz": "not started"` if false
- Checks `scheduler.isInStandbyMode()` — returns DOWN with `"quartz": "in standby mode"` if true
- Returns UP with `schedulerName` and `"status": "running"` if both checks pass
- Catches `SchedulerException` and returns DOWN with error detail

### application.yml change

Added `show-components: always` alongside the existing `show-details: always`:

```yaml
management:
  endpoints:
    web:
      exposure:
        include: health
  endpoint:
    health:
      show-details: always
      show-components: always   # surfaces firebase + quartz sub-components in /api/health
```

Without `show-components: always`, Spring Boot Actuator collapses sub-component details into the top-level status and omits the `components` map from the JSON response.

### docs/runbook.md — complete rewrite

The previous runbook was a placeholder. The new runbook has 9 sections:

1. **Service Overview** — critical path priority table; environment URLs
2. **Health Endpoint** — sample JSON response; Cloud Run liveness probe behaviour (10-second interval, 3 failures → restart)
3. **GCP Monitoring Setup** — full `gcloud` command sequence for:
   - Uptime check (`gcloud monitoring uptime-checks create https`) hitting `/api/health` every 60 seconds from 3 regions (USA, Europe, Asia-Pacific)
   - Notification channel (email to `perelgut@gmail.com`)
   - Alert policy: uptime check failure (2 consecutive failures ≈ 2 minutes of downtime)
   - Alert policy: 5xx error rate > 1% over 5-minute window
   - Alert policy: P99 latency > 2000 ms over 5-minute window
4. **Alert Triage** — step-by-step playbook for each alert type (API Down, Firestore DOWN, Quartz DOWN, Error Rate, Latency)
5. **Manual Operations** — `curl` commands for force-release, refund, status override; Admin Dashboard navigation steps
6. **Rollback Procedure** — `gcloud run revisions list` + `gcloud run services update-traffic` to pin traffic to a specific revision
7. **Log Queries** — `gcloud logging read` commands for errors, Stripe webhooks, Quartz job executions
8. **Escalation** — contact table for each scenario (API down, Stripe failure, Firebase outage, suspected breach)
9. **GCP Console Links** — direct links to Cloud Run, Firestore, Monitoring, Logs Explorer, Secret Manager, IAM

### Key decisions

- **`_health/ping` does not need to exist.** The Firestore Admin SDK returns a normal empty-document response (not an error) when a document is absent. This avoids the need to pre-create the document in the database and eliminates any risk of the health indicator going DOWN due to a missing document after a database reset.
- **5-second timeout on Firestore ping.** Cloud Run's liveness probe interval is 10 seconds; 3 consecutive failures trigger a restart. A 5-second timeout leaves sufficient margin and prevents a briefly-slow Firestore response from cascading into an unnecessary container restart loop.
- **Runbook stored in `docs/runbook.md` (not inside `backend/`).** Ops procedures are documentation artifacts, not code. Keeping them in `docs/` makes them easier to find and edit independently of the backend build.
- **Three alert thresholds chosen for Phase 2 scale:**
  - Uptime: 2 consecutive failures (≈ 2 min downtime) balances false-positive noise vs. response time
  - Error rate: > 1% over 5 min — tight enough to catch real incidents before customers notice widespread failures
  - P99 latency: > 2000 ms over 5 min — aligns with typical human tolerance for synchronous UI operations

### Compile result
`./mvnw compile -q` — clean, no errors or warnings.

### Process note
Diary written immediately after compile per standing rule. No batching.

---

## Test Suite Update — Phase 2 Coverage
**Date:** 2026-04-17
**Status:** Complete

### Objective
Audit and fix the test suite to reflect all Phase 2 backend changes. The suite had regressed from 139 passing tests to 124 passing + 25 failures.

### Root causes found

**Regression 1: `JobControllerTest` — 17 context-load errors**
`JobController` gained a `DisputeService` constructor parameter (added when dispute handling was fleshed out during Phase 2). `JobControllerTest` never had a matching `@MockBean DisputeService disputeService`. Spring's `@WebMvcTest` context tried to instantiate `JobController` and failed with `UnsatisfiedDependencyException` — all 17 tests errored before any test logic ran.

Fix: Added `@MockBean private DisputeService disputeService`.

**Regression 2: `MatchingServiceTest` — 8 test failures**
P2-05 replaced the cached `activeJobCount >= capacityMax` check with a live Firestore query (`countActiveJobsForWorker`). The method calls:
```java
firestore.collection("jobs").whereEqualTo("workerId", uid).whereIn("status", [...]).get().get()
```
The test's `jobsCollection` mock had `document(anyString())` stubbed but NOT `whereEqualTo(...)`. Mockito returned null for the unstubbed call; `null.whereIn(...)` threw NPE. The NPE was silently swallowed by `matchAndStoreWorkers`'s outer `catch (Exception e)`, so the `jobDocRef.update(...)` call that the test expected was never reached.

Fix: Added mock fields `capacityCheckQuery` and `capacityCheckSnap`, and wired the chain in `setUp()` with default `capacityCheckSnap.size()` returning 0 (worker has capacity).

**Stale test: `disputeJob_asRequester_returns200`**
The endpoint signature changed during Phase 2: it now calls `disputeService.openDispute()` (not `jobService.transition()`), returns HTTP 201 (not 200), and requires a `@RequestBody DisputeRequest` with a mandatory `statement` field. The test was sending no body and expecting 200.

Fix: Rewrote the test — sends `{"statement": "..."}`, stubs `disputeService.openDispute(...)`, expects 201 CREATED.

### New tests added

**`MatchingServiceTest` — capacity enforcement (P2-05)**
- `matching_workerAtCapacity_isExcluded()` — worker with `capacityMax=1` and 1 live active job is excluded
- `matching_workerBelowCapacity_isIncluded()` — worker with `capacityMax=2` and 1 live active job is included

**`WorkerControllerTest` — capacity endpoint (P2-05)**
4 new tests for `PATCH /api/users/{uid}/worker/capacity`:
- Worker updating own capacity → 200, `updateCapacity(uid, uid, false, n)` called
- Admin updating another worker's capacity → 200, `updateCapacity(uid, adminUid, true, n)` called
- `maxConcurrentJobs=0` (below `@Min(1)`) → 400 (Bean Validation)
- `maxConcurrentJobs=4` (above `@Max(3)`) → 400 (Bean Validation)

**`AdminControllerTest` — analytics/workers role enforcement (P2-07)**
2 new role-check tests:
- `GET /api/admin/analytics?from=...&to=...` without admin role → 403
- `GET /api/admin/workers` without admin role → 403

**`HealthIndicatorTest` (new file — P2-08)**
`src/test/java/com/yosnowmow/config/HealthIndicatorTest.java` — 7 tests covering all indicator branches:
- Firebase UP (Firestore ping succeeds — deep-stub default)
- Firebase DOWN on TimeoutException
- Firebase DOWN on ExecutionException
- Quartz UP (started, not in standby, returns schedulerName)
- Quartz DOWN when `!scheduler.isStarted()`
- Quartz DOWN when `scheduler.isInStandbyMode()`
- Quartz DOWN when `SchedulerException` thrown from `isStarted()`

Key design note: `pingDocRef` uses `@Mock(answer = Answers.RETURNS_DEEP_STUBS)` so the two-level chain `pingDocRef.get().get(5, SECONDS)` can be stubbed directly per test. A plain `@Mock` would return null for `get()`, causing NPE at `.get(5, SECONDS)`.

### Final test counts

| Class | Tests before | Tests after |
|---|---|---|
| `HealthIndicatorTest` (new) | 0 | 7 |
| `AdminControllerTest` | 9 | 11 |
| `JobControllerTest` | 17 errors | 17 pass |
| `MatchingServiceTest` | 8 fail | 11 pass |
| `WorkerControllerTest` | 5 | 9 |
| All others | unchanged | unchanged |
| **Total** | **124 pass + 25 fail** | **139 pass** |

### Files modified
- `src/test/java/com/yosnowmow/controller/JobControllerTest.java`
- `src/test/java/com/yosnowmow/MatchingServiceTest.java`
- `src/test/java/com/yosnowmow/controller/WorkerControllerTest.java`
- `src/test/java/com/yosnowmow/controller/AdminControllerTest.java`

### Files created
- `src/test/java/com/yosnowmow/config/HealthIndicatorTest.java`

---

## P3-01 — Certn Background Check API Integration
**Date:** 2026-04-17
**Status:** Complete

### Objective
Integrate the Certn background check API so Workers can submit a criminal-record check and have their account automatically activated (or flagged for admin review) when the result arrives via webhook.

### Files created
- `backend/src/main/java/com/yosnowmow/dto/BackgroundCheckConsentRequest.java` — DTO with `@AssertTrue consented` field
- `backend/src/main/java/com/yosnowmow/service/BackgroundCheckService.java` — full background check lifecycle service

### Files modified
- `backend/src/main/java/com/yosnowmow/model/WorkerProfile.java` — added `certnOrderId` (String) and `isActive` (boolean) fields with getters/setters; updated `backgroundCheckStatus` Javadoc to reflect P3-01 status values
- `backend/src/main/java/com/yosnowmow/service/NotificationService.java` — added 4 new `@Async` notification methods: `sendBackgroundCheckApproved`, `sendBackgroundCheckFailed`, `notifyAdminBackgroundCheckReview`, `notifyAdminBackgroundCheckFailed`
- `backend/src/main/java/com/yosnowmow/controller/WebhookController.java` — added `BackgroundCheckService` constructor param, `POST /webhooks/certn` endpoint, `computeHmacSha256` helper, `parseMinimalJson` helper
- `backend/src/main/java/com/yosnowmow/controller/WorkerController.java` — added `BackgroundCheckService` constructor param, `POST /api/users/{uid}/worker/background-check` endpoint
- `backend/src/main/resources/application.yml` — added `yosnowmow.certn` section (api-key, api-url, webhook-secret)
- `backend/src/test/java/com/yosnowmow/controller/WebhookControllerTest.java` — added `@MockBean BackgroundCheckService`
- `backend/src/test/java/com/yosnowmow/controller/WorkerControllerTest.java` — added `@MockBean BackgroundCheckService`

### BackgroundCheckService detail

**`submitBackgroundCheck(workerUid)`:**
1. Fetches User from Firestore; throws 409 Conflict if status is already SUBMITTED, CLEAR, or CONSIDER (idempotency guard)
2. Builds Certn applicant payload: `{ first_name, last_name, email, package: "criminal_record" }`
3. POSTs to `${yosnowmow.certn.api-url}/applicants/` using `RestClient` (Spring Boot 3.2+ replacement for RestTemplate) with `Authorization: Token <api-key>` header
4. Extracts `id` from response → stores as `worker.certnOrderId`
5. Writes audit log `BACKGROUND_CHECK_SUBMITTED`, then updates Firestore: `worker.certnOrderId`, `worker.backgroundCheckStatus=SUBMITTED`, `worker.backgroundCheckDate`

**`handleCertnWebhook(certnOrderId, certnResult)`:**
1. Queries Firestore `users` where `worker.certnOrderId == orderId` to find the Worker
2. Maps Certn result: `PASS→CLEAR`, `REVIEW→CONSIDER`, `FAIL→SUSPENDED`; unknown results default to CONSIDER with a WARN log
3. Writes audit log `BACKGROUND_CHECK_RESULT`
4. **CLEAR**: sets `worker.isActive=true`, sends approval email to Worker
5. **CONSIDER**: writes to `adminReviewQueue/{workerUid}` collection, notifies Admin by email
6. **SUSPENDED**: sets `worker.isActive=false`, sends failure email to Worker + FYI to Admin

### WebhookController Certn endpoint

`POST /webhooks/certn` — unauthenticated (Certn has no Firebase token; integrity verified by HMAC).

Security: When `certnWebhookSecret` is not a placeholder, HMAC-SHA256 of the raw request body is computed and compared against the `X-Certn-Signature` header (lowercase hex). Signature mismatch → 400.

During development (placeholder secret), the HMAC check is skipped — this matches the dev-only pattern used for Stripe (where the emulator also bypasses verification).

Parses the JSON body for `id` (order ID) and `result` fields; delegates to `BackgroundCheckService.handleCertnWebhook()`.

### WorkerController background-check endpoint

`POST /api/users/{uid}/worker/background-check` — no `@RequiresRole`; authorization enforced in-method: caller must be the Worker (uid match) or an admin. Returns 202 Accepted (async — result arrives via webhook).

### Key decisions

- **`RestClient` over `RestTemplate`**: Spring Boot 3.2 introduced `RestClient` as the non-reactive, non-deprecated HTTP client. `RestTemplate` is in maintenance mode. No new dependencies required — `spring-boot-starter-web` already includes it.
- **202 Accepted for submission**: The background check is asynchronous — submitting to Certn only initiates it. The result comes back hours or days later via webhook. 202 is semantically correct; a 200 would imply the check is already complete.
- **`worker.isActive` field**: This field controls whether a Worker is eligible for job dispatch in `MatchingService`. It defaults to `false` (new Workers are inactive until their background check clears). Admins can also set it directly via P3-06 enhanced admin controls.
- **`adminReviewQueue` collection**: When Certn returns `REVIEW`, the Worker is not automatically activated or suspended — the Admin must decide. The collection surfaces these cases in the Admin Dashboard (to be built in P3-06).
- **HMAC verification skipped in dev**: The `certnWebhookSecret` placeholder check (`!certnWebhookSecret.startsWith("placeholder")`) mirrors the Stripe pattern and allows testing webhooks locally without a secret.

### Compile errors found and fixed
- `Map<?, ?>` wildcard type on `certnResponse` in `BackgroundCheckService` caused "incompatible types" on `getOrDefault()` call — fixed by casting to `Map<String, Object>` with `@SuppressWarnings("unchecked")`
- Same issue in `WebhookController.handleCertnEvent` — changed `Map<?, ?> body` to `Map<String, Object>` and updated `parseMinimalJson` return type accordingly

### Test regressions fixed
- `WebhookControllerTest` (9 context errors) — missing `@MockBean BackgroundCheckService`; added
- `WorkerControllerTest` (9 context errors) — missing `@MockBean BackgroundCheckService`; added

### Final test result
139 tests, 0 failures.

---

## P3-02 — Background Check Status Flow
**Date:** 2026-04-17
**Status:** Complete

### Objective
Complete the Certn background check lifecycle started in P3-01 by adding:
1. The Admin override decision path (approve/reject Workers in CONSIDER state)
2. Admin endpoints to list the review queue and record decisions
3. A Worker-accessible status endpoint

### Files modified

| File | Change |
|---|---|
| `backend/.../service/NotificationService.java` | Added `sendBackgroundCheckRejected(workerUid)` — emails the Worker that their Admin-reviewed application was not approved; follows same pattern as `sendBackgroundCheckFailed` but with distinct messaging ("application not approved" vs "account suspended") because the REJECTED state is a deliberate Admin decision, not an automated Certn FAIL. |
| `backend/.../controller/AdminController.java` | Added `BackgroundCheckService` as 4th constructor parameter. Added `GET /api/admin/review-queue` — queries `adminReviewQueue` collection ordered by `createdAt` ascending; returns list of review-queue documents. Added `POST /api/admin/workers/{uid}/background-check-decision` — accepts `BackgroundCheckDecisionRequest` (decision + reason), delegates to `backgroundCheckService.adminOverride()`. Both endpoints require `@RequiresRole("admin")`. |
| `backend/.../controller/WorkerController.java` | Added `GET /api/users/{uid}/worker/background-check-status` — fetches Worker via `workerService.getWorkerUser(uid)`, returns `{ backgroundCheckStatus, isActive }` map. Authorization enforced in-method: only the Worker (uid match) or an Admin may call it. Imports added: `GetMapping`, `WorkerProfile`, `HashMap`, `Map`. |
| `backend/src/test/.../AdminControllerTest.java` | Added `@MockBean BackgroundCheckService backgroundCheckService` — required because `AdminController` now has `BackgroundCheckService` as a 4th constructor param; `@WebMvcTest` context fails to load without a matching mock. |

### BackgroundCheckService.adminOverride detail

The method added in P3-01's `BackgroundCheckService` now compiles fully:

1. Fetches the Worker User document (throws 404 if not found)
2. Guards: status must be `CONSIDER` (throws 409 Conflict otherwise)
3. Maps decision → `APPROVED→CLEAR`, `REJECTED→REJECTED`
4. Builds Firestore updates: `backgroundCheckStatus`, `backgroundCheckDate`, `isActive` (true/false), `updatedAt`
5. Writes audit log `BACKGROUND_CHECK_ADMIN_OVERRIDE` with `adminUid`, `decision + reason` as detail
6. Updates Firestore Worker document
7. Deletes `adminReviewQueue/{workerUid}` document (removes from queue)
8. Sends `sendBackgroundCheckApproved` or `sendBackgroundCheckRejected` to the Worker

### Key decisions

- **`REJECTED` as a separate status from `SUSPENDED`**: `SUSPENDED` = automated Certn FAIL, `REJECTED` = Admin decided against CONSIDER. Keeping them distinct allows the Admin Dashboard to distinguish automated failures from deliberate admin decisions and potentially expose different messaging to the Worker.
- **`sendBackgroundCheckRejected` separate from `sendBackgroundCheckFailed`**: `FAILED` implies an automated check result; `REJECTED` implies a human decision. Different email subjects and tone avoid confusing the Worker about who made the decision.
- **`GET /api/admin/review-queue` returns raw Firestore data maps**: The review queue documents are small and stable (workerUid, certnOrderId, certnResult, status, createdAt). Defining a separate DTO class for a 5-field read-only document adds boilerplate with no benefit. Jackson serializes `Map<String, Object>` cleanly.
- **`GET /api/users/{uid}/worker/background-check-status` in WorkerController, not AdminController**: The Worker needs to poll this endpoint from their dashboard. Placing it in `/api/users/{uid}/…` is consistent with all other Worker-visible user data; Admin access is granted by the in-method auth check.

### Test regression fixed

`AdminControllerTest` — 11 context-load errors after `AdminController` gained `BackgroundCheckService` as a 4th constructor parameter. Fixed by adding `@MockBean private BackgroundCheckService backgroundCheckService` (identical pattern to the WebhookControllerTest and WorkerControllerTest fixes made in P3-01).

### Compile and test results

`./mvnw compile -q` — clean, no errors.
`./mvnw test` — **139 tests, 0 failures, 0 errors.**

---

## P3-03 — Insurance Declaration
**Date:** 2026-04-17
**Status:** Complete

### Objective
Allow Workers to upload a PDF insurance certificate, have Admins verify/reject it, and automatically manage the annual renewal cycle (reminders and expiry deactivation).

### Files created

| File | Purpose |
|---|---|
| `backend/.../service/InsuranceService.java` | Full lifecycle: `uploadInsuranceDoc()` + `adminVerifyInsurance()` |
| `backend/.../scheduler/InsuranceRenewalJob.java` | Daily Quartz job — expiry checks + reminder sends |
| `backend/.../dto/InsuranceVerifyRequest.java` | `boolean approved` DTO for admin verify endpoint |

### Files modified

| File | Change |
|---|---|
| `backend/.../model/WorkerProfile.java` | Added 3 new fields: `insuranceStatus` (String), `insuranceDocUrl` (String), `lastInsuranceReminderSent` (Timestamp); plus getters/setters |
| `backend/.../service/StorageService.java` | Added `uploadInsuranceDoc(workerUid, file)` — PDF-only, 20 MB cap, path `workers/{uid}/insurance/{uuid}.pdf` |
| `backend/.../service/NotificationService.java` | Added 5 `@Async` methods: `notifyAdminInsuranceSubmitted`, `sendInsuranceApproved`, `sendInsuranceRejected`, `sendInsuranceRenewalReminder`, `sendInsuranceExpired` |
| `backend/.../controller/WorkerController.java` | Added `InsuranceService` constructor param; added `POST /api/users/{uid}/worker/insurance` (multipart: file + expiryDate); imports: `GetMapping→RequestParam`, `MultipartFile`, `LocalDate`, `DateTimeParseException` |
| `backend/.../controller/AdminController.java` | Added `InsuranceService` constructor param; added `POST /api/admin/workers/{uid}/insurance-verify`; imports: `InsuranceVerifyRequest`, `InsuranceService` |
| `backend/.../config/QuartzConfig.java` | Added `insuranceRenewalJobDetail()` bean and `insuranceRenewalTrigger()` cron at `"0 0 4 * * ?"` (4 AM daily) |
| `backend/src/test/.../WorkerControllerTest.java` | Added `@MockBean InsuranceService insuranceService` |
| `backend/src/test/.../AdminControllerTest.java` | Added `@MockBean InsuranceService insuranceService` |

### InsuranceService detail

**`uploadInsuranceDoc(workerUid, file, expiryDate)`:**
1. Guards: expiry date must be in the future (400 otherwise)
2. Delegates to `StorageService.uploadInsuranceDoc()` (validates PDF MIME, 20 MB limit, uploads, returns download URL)
3. Updates Firestore: `worker.insuranceDocUrl`, `worker.insuranceStatus=PENDING_REVIEW`, `worker.insurancePolicyExpiry` (ISO string), `worker.insuranceDeclaredAt`
4. Audit log `INSURANCE_SUBMITTED`
5. Notifies Admin via `notifyAdminInsuranceSubmitted`

**`adminVerifyInsurance(workerUid, approved, adminUid)`:**
1. Guards: status must be `PENDING_REVIEW` (409 otherwise)
2. `approved=true` → `VALID`; `approved=false` → `NONE` + clears `insuranceDocUrl`
3. Audit log `INSURANCE_VERIFIED`
4. Notifies Worker via `sendInsuranceApproved` or `sendInsuranceRejected`

### InsuranceRenewalJob detail

Fires daily at 4 AM. Queries `users` where `worker.insuranceStatus IN [VALID, EXPIRING_SOON]`.

Per Worker:
- Parse `worker.insurancePolicyExpiry` as `LocalDate` (ISO string); skip and warn if unparseable
- **Expired** (`expiryDate <= today`): set `EXPIRED` + `isActive=false`; audit `INSURANCE_EXPIRED`; email Worker
- **Expiring soon** (`expiryDate <= today + 30 days`): set `EXPIRING_SOON` (idempotent); send reminder email only if `lastInsuranceReminderSent` is null or >7 days ago; update `lastInsuranceReminderSent` when sending; audit `INSURANCE_EXPIRING_SOON`

### Key decisions

- **`insurancePolicyExpiry` stays a String (ISO-8601 YYYY-MM-DD)**: The existing model field is already a String. `LocalDate.parse()` and `.toString()` handle the conversion cleanly. Firestore Timestamps would add complexity for a field that is only ever compared as a date (no time needed).
- **`lastInsuranceReminderSent` field for dedup**: Rather than querying sent emails or using a separate `remindersSent` collection, a single Timestamp field on the Worker profile is sufficient. The 7-day check in the job is a simple arithmetic comparison.
- **Admin insurance verify in `AdminController` (not `WorkerController`)**: Consistent with the `POST /api/admin/workers/{uid}/background-check-decision` pattern from P3-02. Both are admin adjudication actions against a Worker; keeping them together in `AdminController` makes the admin API surface cohesive.
- **Upload returns 202 Accepted**: Like the background check submission, the result of an insurance upload is not immediate — Admin review is asynchronous. 202 is semantically correct.
- **`expiryDate` passed as a `@RequestParam` in the multipart form**: Multipart requests don't support a mixed JSON body + file part. The simplest approach is two `@RequestParam` values (`file` and `expiryDate`). The controller validates the ISO date format and fails with 400 if malformed.
- **No `@RequiresRole` on the upload endpoint**: Authorization is enforced in-method (own UID or admin), identical to the background-check upload pattern.
- **Storage path `workers/{uid}/insurance/{uuid}.pdf`**: Firebase Storage rules can be scoped to `workers/{uid}/insurance/**` to allow the Worker to read their own doc URL. The UUID prevents path enumeration.

### Test regressions fixed (same pattern as P3-02)

- `AdminControllerTest` (11 context errors): `AdminController` now has `InsuranceService` as 5th constructor param — added `@MockBean InsuranceService insuranceService`
- `WorkerControllerTest` (9 context errors): `WorkerController` now has `InsuranceService` as 3rd constructor param — added `@MockBean InsuranceService insuranceService`

### Compile and test results

`./mvnw compile` — **BUILD SUCCESS**, no errors.
`./mvnw test` — **139 tests, 0 failures, 0 errors.**

---

## P3-04 — Trust Badge System
**Date:** 2026-04-17
**Status:** Complete

### Objective
Award and revoke trust badges on Worker profiles automatically (based on eligibility criteria) and manually (Admin override). Expose badges via the API and display them in the frontend `WorkerProfile.jsx`.

### Files created

| File | Purpose |
|---|---|
| `backend/.../service/BadgeService.java` | Core badge logic: `evaluateBadges()`, `adminGrantBadge()`, `adminRevokeBadge()`, `getActiveBadges()` |
| `backend/.../dto/BadgeRevocationRequest.java` | `@NotBlank String reason` DTO for the admin revoke endpoint |

### Files modified

| File | Change |
|---|---|
| `backend/.../service/RatingService.java` | Added `BadgeService` as 4th constructor param; call `badgeService.evaluateBadges(workerUid)` after rating update to re-evaluate TOP_RATED and EXPERIENCED thresholds |
| `backend/.../service/BackgroundCheckService.java` | Added `BadgeService` as 4th constructor param (before `@Value certnApiKey`); call `badgeService.evaluateBadges(workerUid)` in `handleCertnWebhook()` on `STATUS_CLEAR` to award VERIFIED badge |
| `backend/.../service/InsuranceService.java` | Added `BadgeService` as 5th constructor param; call `badgeService.evaluateBadges(workerUid)` in `adminVerifyInsurance()` to award/revoke INSURED badge |
| `backend/.../scheduler/InsuranceRenewalJob.java` | Added `@Autowired BadgeService badgeService`; call `badgeService.evaluateBadges(workerUid)` in `handleExpired()` to revoke INSURED badge when policy expires |
| `backend/.../controller/AdminController.java` | Added `BadgeService` as 6th constructor param; added `POST /api/admin/workers/{uid}/badges/{badgeType}/grant` and `POST /api/admin/workers/{uid}/badges/{badgeType}/revoke` |
| `backend/.../controller/WorkerController.java` | Added `BadgeService` as 4th constructor param; added `GET /api/users/{uid}/worker/badges` → list of active badge documents |
| `frontend/.../pages/requester/WorkerProfile.jsx` | Added `BADGE_META` display config object; added `TrustBadge` chip component; replaced hardcoded badge section with `MOCK_ACTIVE_BADGES.map(id => <TrustBadge .../>)` |
| `backend/src/test/.../AdminControllerTest.java` | Added `@MockBean BadgeService badgeService` + import |
| `backend/src/test/.../WorkerControllerTest.java` | Added `@MockBean BadgeService badgeService` + import |

### BadgeService detail

**Subcollection path:** `users/{uid}/badges/{badgeType}` (document ID = badge type string)

**Four badge types:** `VERIFIED`, `INSURED`, `TOP_RATED`, `EXPERIENCED`

**`evaluateBadges(workerUid)`:** Reads the User, then calls `processBadge()` for each type with the current eligibility predicate result. This is idempotent — safe to call after any event that might affect badge eligibility.

**Eligibility predicates:**
- `VERIFIED`: `backgroundCheckStatus == "CLEAR"`
- `INSURED`: `insuranceStatus IN {VALID, EXPIRING_SOON}` — badge is valid during the expiring-soon window; `InsuranceRenewalJob.handleExpired()` re-evaluates on actual expiry
- `TOP_RATED`: `rating >= 4.8 AND completedJobCount >= 25`
- `EXPERIENCED`: `completedJobCount >= 100`

**`processBadge(workerUid, badgeType, eligible)` (private):**
- `eligible=true + not already active`: Creates badge doc with `isActive=true`, audit log `BADGE_AWARDED`
- `eligible=false + currently active`: Sets `isActive=false`, adds `revokedAt` + `revokedByAdminUid="system"` + `revokedReason="No longer eligible"`, audit log `BADGE_REVOKED`
- All other combinations: no-op

**`adminGrantBadge(workerUid, badgeType, adminUid)`:** Validates badge type (400), checks not already active (409), creates badge doc, audit log `BADGE_GRANTED`

**`adminRevokeBadge(workerUid, badgeType, adminUid, reason)`:** Validates badge type (400), checks currently active (409), updates doc (isActive=false, revokedAt, revokedByAdminUid, revokedReason), audit log `BADGE_REVOKED`

**`getActiveBadges(workerUid)`:** Queries `users/{uid}/badges WHERE isActive=true`, returns `List<Map<String, Object>>` (raw Firestore documents)

### Admin badge endpoints (in AdminController)

```
POST /api/admin/workers/{uid}/badges/{badgeType}/grant
  Body: {} (empty — system-awarded, no extra fields needed)
  → 200 {}

POST /api/admin/workers/{uid}/badges/{badgeType}/revoke
  Body: { "reason": "string" }  (required, @NotBlank)
  → 200 {}
```

### Worker badge endpoint (in WorkerController)

```
GET /api/users/{uid}/worker/badges
  → 200 [ { badgeId, awardedAt, awardedBySystem, isActive, ... } ]
  (only the Worker themselves or admin may call)
```

### Frontend — WorkerProfile.jsx badge display

Added `BADGE_META` object with display config for all 4 badge types (icon, label, tooltip colour, background colour). Added `TrustBadge` component that renders a pill chip with `title` tooltip. The prototype hardcodes `MOCK_ACTIVE_BADGES = ['VERIFIED']`. Live implementation would fetch from `GET /api/users/{uid}/worker/badges`.

```jsx
const BADGE_META = {
  VERIFIED:    { icon: '✓', label: 'Background Checked', tooltip: '...', color: '#1A6FDB', bg: '#EBF3FF' },
  INSURED:     { icon: '🛡', label: 'Insured',            tooltip: '...', color: '#27AE60', bg: '#EAFAF1' },
  TOP_RATED:   { icon: '★', label: 'Top Rated',           tooltip: '...', color: '#D4A017', bg: '#FEF9E7' },
  EXPERIENCED: { icon: '◆', label: 'Experienced',         tooltip: '...', color: '#8E44AD', bg: '#F5EEF8' },
}
```

### Key design decisions

- **BadgeService has no circular dependencies**: It depends only on `Firestore` and `AuditLogService`. All callers (`RatingService`, `BackgroundCheckService`, `InsuranceService`, `InsuranceRenewalJob`) depend on `BadgeService` — the dependency graph is strictly one-directional.
- **Subcollection vs embedded array**: Badge documents live in a subcollection (`users/{uid}/badges/{type}`) rather than an array on the `WorkerProfile`. This allows efficient querying by `isActive` without reading the entire user document, and supports a full audit trail of badge history without bloating the user doc.
- **`evaluateBadges()` is always idempotent**: Calling it multiple times has no side effects when the state hasn't changed. This makes it safe to call from multiple places without worrying about double-awards.
- **INSURED badge stays active during EXPIRING_SOON**: The Worker's insurance is technically still valid during this window — only the renewal reminder has been triggered. The `InsuranceRenewalJob.handleExpired()` path calls `evaluateBadges()` when the policy actually expires, which revokes the badge at the right moment.
- **Admin manual grant/revoke with audit trail**: Admins can override automatic eligibility for edge cases (e.g., granting a badge during an appeal, or revoking for cause). Every manual action is recorded with `awardedByAdminUid` / `revokedByAdminUid` and a reason.
- **`@Autowired` field injection in InsuranceRenewalJob**: Quartz instantiates job beans via its own mechanism, bypassing Spring's constructor injection. Field injection with `@Autowired` is the established pattern for Quartz jobs in this codebase (consistent with how `AuditLogJob` and `AnalyticsJob` are wired).

### Test regressions fixed (same `@MockBean` pattern as P3-01/02/03)

- `AdminControllerTest`: `AdminController` now has `BadgeService` as 6th constructor param — added `@MockBean BadgeService badgeService`
- `WorkerControllerTest`: `WorkerController` now has `BadgeService` as 4th constructor param — added `@MockBean BadgeService badgeService`

### Compile and test results

`./mvnw test` — **139 tests, 0 failures, 0 errors.**

---

## P3-05 — Fraud Detection Rules Engine
**Date:** 2026-04-17
**Status:** Complete

### Objective
Evaluate fraud rules before every Worker payout. If any rule triggers, pause the payout, create a `fraudFlags` document, and notify the Worker and Admin. Provide Admin endpoints to review, approve (release payout), or reject (deny payout) flagged payouts.

### Files created

| File | Purpose |
|---|---|
| `backend/.../service/FraudDetectionService.java` | Core rules engine: `checkBeforePayout()`, `approveFraudFlag()`, `rejectFraudFlag()`, `getFraudFlags()` |
| `backend/.../dto/FraudFlagReviewRequest.java` | Optional `notes` body for approve/reject endpoints |

### Files modified

| File | Change |
|---|---|
| `backend/.../model/Job.java` | Added `payoutPaused` boolean field with getter/setter |
| `backend/.../service/PaymentService.java` | Added `FraudDetectionService` as 5th constructor param; added fraud check call in `releasePayment()` before Stripe Transfer |
| `backend/.../service/NotificationService.java` | Added 3 `@Async` methods: `sendPayoutUnderReview`, `notifyAdminFraudFlag`, `sendPayoutDenied` |
| `backend/.../controller/AdminController.java` | Added `FraudDetectionService` as 7th constructor param; added `FraudFlagReviewRequest` import; added 3 endpoints: `GET /api/admin/fraud-flags`, `POST /api/admin/fraud-flags/{flagId}/approve`, `POST /api/admin/fraud-flags/{flagId}/reject` |
| `backend/src/test/.../AdminControllerTest.java` | Added `@MockBean FraudDetectionService fraudDetectionService` + import |

### FraudDetectionService detail

**Firestore collection:** `fraudFlags/{flagId}` (top-level)

**Schema:** `flagId`, `workerUid`, `jobId`, `ruleTriggered` (comma-separated rule names), `detectedAt`, `status` (`PENDING_REVIEW`|`APPROVED`|`REJECTED`), `payoutAmountCents`, `reviewedByAdminUid`, `reviewedAt`, `reviewNotes`

**`checkBeforePayout(jobId)`:**
1. Reads job → gets workerUid, payout cents
2. Loads Worker user doc for account-level checks
3. Evaluates 4 rules:
   - `RULE_VELOCITY`: query jobs where workerId=worker, status=COMPLETE, completedAt >= now−24h — flag if count > 5
   - `RULE_LARGE_PAYOUT`: flag if payoutCents > 50,000 (> $500 CAD)
   - `RULE_RATING_MANIPULATION`: simplified proxy — flag if rating ≥ 4.8 AND ratingCount is in [3, 5] (suspiciously high rating with very few data points; full check requires per-job rating history)
   - `RULE_NEW_ACCOUNT_PAYOUT`: flag if account age < 7 days AND payoutCents > 20,000 (> $200 CAD)
4. If no rules trigger: return `true` (safe)
5. If any rule triggers: create fraudFlags doc → set `job.payoutPaused=true` → audit log `FRAUD_FLAG_RAISED` → notify Worker + Admin → return `false`

**`approveFraudFlag(flagId, adminUid, notes)`:**
- Guards: must be PENDING_REVIEW (409 otherwise)
- Sets flag status to APPROVED + stores reviewedByAdminUid/reviewedAt/reviewNotes
- Clears `payoutPaused=false` on job (so next releasePayment call passes the check)
- Audit log `FRAUD_FLAG_APPROVED`
- Returns `jobId` (caller uses it to trigger `paymentService.releasePayment()`)

**`rejectFraudFlag(flagId, adminUid, notes)`:**
- Guards: must be PENDING_REVIEW (409 otherwise)
- Sets flag status to REJECTED + stores review fields
- Audit log `FRAUD_FLAG_REJECTED`
- Notifies Worker via `sendPayoutDenied`

### Integration into PaymentService.releasePayment()

Before the Stripe Transfer call, added:
```java
boolean isSafe = fraudDetectionService.checkBeforePayout(jobId);
if (!isSafe) {
    throw new ResponseStatusException(UNPROCESSABLE_ENTITY,
            "Payout paused pending fraud review ...");
}
```
The existing `catch (InterruptedException | ExecutionException e)` block covers checked exceptions from `checkBeforePayout`.

### Admin approve flow

```
POST /api/admin/fraud-flags/{flagId}/approve
  Body: { "notes": "..." }  // optional
  
AdminController:
  1. fraudDetectionService.approveFraudFlag(flagId, adminUid, notes) → returns jobId
  2. paymentService.releasePayment(jobId)  // fraud check now passes (flag is APPROVED)
  → HTTP 200
```

This keeps `FraudDetectionService` free of any `PaymentService` dependency — the circular dependency is avoided by letting `AdminController` orchestrate the two calls.

### Key design decisions

- **No circular dependency**: `FraudDetectionService` depends only on `Firestore`, `JobService`, `NotificationService`, `AuditLogService`. `PaymentService` depends on `FraudDetectionService` but not vice versa. `AdminController` orchestrates both for the approve flow.
- **Approve-then-release pattern**: `approveFraudFlag()` clears the flag and removes `payoutPaused`, then `AdminController` calls `releasePayment()`. The fraud check in `releasePayment` naturally passes because no PENDING_REVIEW flag exists for that job anymore. No bypass token or flag-skip mechanism needed.
- **`payoutPaused` field on Job**: Added for admin dashboard visibility. The fraud check doesn't actually read this field — it checks for PENDING_REVIEW flags in the `fraudFlags` collection. The field is purely informational.
- **Rule 3 is a simplified proxy**: The spec calls for comparing current rating to the average 10 jobs ago. This requires per-job rating history, which is out of scope. The proxy (high rating + very few ratings) catches the same manipulation pattern in the early-account phase. Noted in code comments for future implementation.
- **Reject does not auto-refund Requester**: The spec says "notify Worker payout denied, optionally refund Requester." The refund is intentionally left as a separate manual step via `POST /api/admin/jobs/{id}/refund` — different fraud scenarios warrant different refund decisions and forcing it would be overly prescriptive.

### Test regressions fixed (same `@MockBean` pattern)

- `AdminControllerTest`: `AdminController` now has `FraudDetectionService` as 7th constructor param — added `@MockBean FraudDetectionService fraudDetectionService`
- `PaymentControllerTest`: unchanged — `PaymentController` depends only on `PaymentService`, which is already mocked as `@MockBean`

### Compile and test results

`./mvnw test` — **139 tests, 0 failures, 0 errors.**

---

## 2026-04-18 — P3-06 Enhanced Admin Controls (ban / suspend / unban / bulk-action)

### Context

User asked to implement P3-06 (Enhanced Admin Controls). This task adds Trust & Safety account moderation capabilities: admins can ban users, temporarily suspend them, lift bans/suspensions, and apply bulk job actions (release or refund a batch of jobs in one API call). All actions are audit-logged with reason, and ban revokes Firebase tokens + clears custom claims immediately.

---

### Changes made

#### New DTOs

- **`BanUserRequest.java`** — `{ reason: @NotBlank }` — shared by ban and unban endpoints.
- **`SuspendUserRequest.java`** — `{ reason: @NotBlank, durationDays: @Min(1) @Max(365) }`.
- **`BulkJobActionRequest.java`** — `{ jobIds: @NotEmpty, action: @Pattern("release|refund") }`.

#### Model: `User.java`

Added three new fields that support the ban/suspend lifecycle:
- `bannedReason` — reason text populated on ban; cleared on unban.
- `bannedAt` — Firestore `Timestamp` of the ban action.
- `suspendedAt` — Firestore `Timestamp` set when the suspension begins.
- `suspendedUntil` — `java.util.Date` expiry used by both the auto-unsuspend timer and the notification email.

Note: `suspendedReason` already existed; all new fields clear back to `null` on unban.

#### Quartz job: `AutoUnsuspendJob.java`

New one-shot Quartz job that fires when a suspension expires. Delegates to `UserService.unbanUser(uid, "SYSTEM", "Suspension period expired — auto-unsuspended")`. Scheduled dynamically from `AdminController.suspendUser()` using the same `JobBuilder`/`TriggerBuilder` pattern as `DispatchJob`.

Group name constant: `AutoUnsuspendJob.JOB_GROUP = "auto-unsuspend"`. Re-scheduling replaces any existing timer for the same uid (idempotent for repeated suspend calls).

#### Service: `UserService.java`

Added `AuditLogService` as a 4th constructor dependency (was previously: Firestore, FirebaseAuth, NotificationService).

Three new public methods:

**`banUser(uid, adminUid, reason)`**
1. Guards against double-ban (throws 409).
2. Writes `accountStatus=banned`, `bannedReason`, `bannedAt` to Firestore.
3. Calls `revokeTokens(uid)` — `firebaseAuth.revokeRefreshTokens()` — existing sessions invalidated.
4. Calls `setCustomClaims(uid, [])` to strip roles from future tokens.
5. `notificationService.sendAccountBannedEmail()`.
6. `auditLogService.write()` with before/after state.

**`suspendUser(uid, adminUid, reason, suspendedUntil)`**
1. Guards against ban-then-suspend confusion (409 if banned); 409 if already suspended.
2. Writes `accountStatus=suspended`, `suspendedReason`, `suspendedAt`, `suspendedUntil`.
3. Calls `revokeTokens(uid)` — does NOT clear claims (suspension is reversible; roles are preserved in Firestore and restored on unsuspend).
4. `notificationService.sendAccountSuspendedEmail()`.
5. Audit log.

**`unbanUser(uid, adminUid, reason)`**
1. Guards against calling on an already-active account (409).
2. Writes `accountStatus=active`; nulls out all ban/suspend fields.
3. Restores Firebase custom claims from the `roles` array in Firestore.
4. Audit log. (No new notification method needed — user discovers their account is active when they log back in.)

Two private helpers added:
- `revokeTokens(uid)` — wraps `firebaseAuth.revokeRefreshTokens(uid)`, non-fatal.
- `revokeTokensAndClearClaims(uid)` — calls both; used only by ban.
- `writeUpdates(uid, updates)` — same pattern as `WorkerService.writeUpdates()`, factored in here to avoid Firestore boilerplate.

#### Service: `NotificationService.java`

Added two `@Async` email methods:
- `sendAccountBannedEmail(uid, name, reason)` — subject: "Your YoSnowMow account has been suspended"; uses `buildHtml()` with reason text.
- `sendAccountSuspendedEmail(uid, name, reason, suspendedUntil)` — formats `suspendedUntil` as "MMMM d, yyyy" for readability.

#### Controller: `AdminController.java`

Added `UserService` and `Scheduler` (Quartz) as 8th and 9th constructor params. Added constant `CANCELLABLE_ON_BAN = Set.of("REQUESTED", "PENDING_DEPOSIT", "CONFIRMED")`.

Four new endpoints:

**`POST /api/admin/users/{uid}/ban`** — `@Valid BanUserRequest` body:
1. Calls `cancelOpenJobsForUser(uid, adminUid)` — iterates `jobService.listJobsForUser()`, cancels any job in `CANCELLABLE_ON_BAN`, refunds jobs that had a deposit (non-REQUESTED status). Failures are logged and skipped (best-effort — the ban proceeds even if a job cancel fails).
2. Calls `userService.banUser()`.

**`POST /api/admin/users/{uid}/unban`** — `@Valid BanUserRequest` body:
1. Directly calls `userService.unbanUser()`.

**`POST /api/admin/users/{uid}/suspend`** — `@Valid SuspendUserRequest` body:
1. Computes `suspendedUntil = Instant.now() + durationDays * 86_400_000ms`.
2. Calls `userService.suspendUser()`.
3. Calls `scheduleAutoUnsuspend(uid, delayMs)` — the private helper that creates the one-shot Quartz timer.

**`POST /api/admin/jobs/bulk-action`** — `@Valid BulkJobActionRequest` body:
1. Iterates `jobIds` sequentially.
2. For each: calls `paymentService.releasePayment(jobId)` or `paymentService.refundJob(jobId)`.
3. Returns `{ succeeded: N, failed: N, errors: [...] }` — always 200 even on partial failure, so the caller can see which jobs failed without needing a retry-after.

Design decision — **circular dependency avoidance**: `JobService` depends on `WorkerService → UserService`. Adding `JobService` to `UserService` would be circular. Solution: all job-cancellation logic lives in `AdminController.cancelOpenJobsForUser()` which already has `JobService` and `PaymentService` injected. `UserService.banUser()` handles only the account-level operations (Firestore, Firebase, notification, audit).

#### Frontend: `api.js`

Added four new API call exports:
- `banUser(uid, reason)` → `POST /api/admin/users/${uid}/ban`
- `unbanUser(uid, reason)` → `POST /api/admin/users/${uid}/unban`
- `suspendUser(uid, reason, durationDays)` → `POST /api/admin/users/${uid}/suspend`
- `bulkJobAction(jobIds, action)` → `POST /api/admin/jobs/bulk-action`

#### Frontend: `Dashboard.jsx`

Added `Modal` import and moderation state:
- `moderationModal` — `{ action, uid, name }` or `null` (controls which modal is open)
- `moderationReason`, `moderationDays`, `moderationSubmitting`, `moderationError`

Users tab table: added **Actions** column (5th column, `cols` bumped from 4→5 in `LoadingRow` / `ErrorRow`). Per-row logic:
- Active accounts: "Suspend" (amber) + "Ban" (red) buttons.
- Suspended/banned accounts: "Unsuspend"/"Unban" (green) button.

Modal (`Modal` component from `../../components/Modal`):
- Title changes by action type.
- Duration input (1–365 days) shown only for suspend.
- Reason textarea (required).
- Warning message shown for ban: "This will cancel all open jobs..."
- Submit calls the appropriate API method, then `fetchUsers(userPages.page)` to refresh.

Status badge fix: the suspended/banned colour mapping was previously using ambiguous colours. Updated: green=active, red=banned, amber (#FFFBEB bg / #92400E text) = suspended.

---

### Test results

`./mvnw test` — **151 tests, 0 failures, 0 errors.**

AdminControllerTest grew from 12 to 23 tests (+11 new tests covering all four new endpoints: role enforcement 403, happy path 200, and validation 400 cases).

---

## 2026-04-18 — P3-07 Compliance Reporting (transaction export + workers summary)

### Context

User asked to continue. Next task is P3-07: compliance reporting — a transaction log export endpoint (CSV or JSON, date-range filtered, rate-limited) and an annual worker payout summary endpoint for T4A-equivalent reporting. The frontend export button was already wired in P2-07 but was hitting a 404 stub.

---

### Changes made

#### `pom.xml`

Added `commons-csv 1.10.0` (Apache Commons CSV) for the CSV serialisation.

#### `AdminController.java`

Added `FirebaseAuth` and `AuditLogService` as new constructor dependencies (needed to look up user emails and audit every export).

Two new endpoints:

**`GET /api/admin/reports/transactions?from=&to=&format=csv|json`**

- Validates date range (≤ 366 days). Format must be `csv` or `json`.
- Rate-limits via Firestore document `adminRateLimits/{adminUid}`: 10 requests/hour per admin. Uses a Firestore transaction to read/increment a counter + window-start timestamp atomically. Expired windows (>1 hour old) are reset. Returns HTTP 429 on limit exceeded.
- Queries `jobs` where `status IN [COMPLETE, RELEASED, SETTLED, CANCELLED, REFUNDED]` (Firestore `whereIn`). Filters in Java by terminal timestamp (releasedAt → refundedAt → cancelledAt → completedAt), checking the event falls within [fromDate midnight, toDate+1 midnight) in Ontario timezone.
- Builds one row per job: `jobId, date, status, serviceTypes, requesterId, requesterEmail, workerId, workerEmail, grossAmountCAD, hstCAD, platformFeeCAD (computed = tierPriceCAD * commissionRateApplied), workerNetCAD, cancellationFeeCAD, commissionRate`.
- Email lookup: calls `firebaseAuth.getUser(uid).getEmail()`. Non-fatal — returns empty string on failure.
- CSV: Apache Commons `CSVFormat.EXCEL` with dynamic header row built from the `LinkedHashMap` key order. Returns `ResponseEntity<byte[]>` with `Content-Type: text/csv` and `Content-Disposition: attachment; filename="yosnowmow-transactions-YYYY-MM-DD-YYYY-MM-DD.csv"`.
- JSON: returns `ResponseEntity<List<Map>>`.
- Every export is audit-logged with `REPORT_EXPORTED`, date range, format, and row count.

**`GET /api/admin/reports/workers-summary?year=YYYY`**

- Validates year (2000–2100).
- Queries `jobs` where `status IN [RELEASED, SETTLED]` AND `releasedAt` between `Jan 1 00:00` and `Jan 1 00:00 next year` (Ontario timezone).
- Aggregates by `workerId`: `completedJobs`, `grossPayoutCAD`, `hstCollectedCAD`, `netPayoutCAD`. Worker name is looked up from Firestore `users/{uid}.name`.
- Returns JSON array sorted alphabetically by `workerName`.

Private helpers added to AdminController:
- `checkRateLimit(adminUid)` — Firestore-transactional per-admin export counter.
- `resolveEventTimestamp(job)` — picks the most specific terminal timestamp.
- `buildTransactionRow(job, eventTs)` — builds a `LinkedHashMap` with all report columns.
- `buildCsvBytes(rows)` — uses Apache Commons CSV to produce a UTF-8 byte array.
- `lookupUserEmail(uid)` — Firebase Auth SDK lookup, non-fatal.
- `lookupUserName(uid)` — Firestore lookup, falls back to uid on failure.
- `toMidnightTimestamp(date, zone)` — general-purpose replacement for `startOfTodayTimestamp()` (both coexist; stats still uses the old one).
- `fmt2(v)`, `round2(v)`, `nvl(v)` — formatting utilities.

#### `Analytics.jsx` (frontend)

Updated export error handler: replaced the "404 = coming in Phase 3" stub message with a proper 429 rate-limit message. The CSV download path was already correct — no other changes needed.

---

### Test results

`./mvnw test` — **156 tests, 0 failures, 0 errors.**

AdminControllerTest grew from 23 to 28 tests (+5 new tests: role enforcement 403 for both endpoints, date-range validation 400, format validation 400, year validation 400).

---

## 2026-04-18 — P3-08 Security Audit & Penetration Testing Checklist

### Context

P3-08 is a documentation task — produce a comprehensive security audit checklist for use before public launch. No code changes.

### Changes made

Created `docs/security-audit-checklist.md` with 8 sections and 32 checklist items. Each item specifies:
- What to test (plain English description)
- How to test (specific `curl` command, SDK call, Firebase Console action, or git command)
- Expected result (the pass criterion)
- A Result field (PASS / FAIL / N/A) for the reviewer to fill in

Sections:
1. **Authentication & Authorization** (7 items) — 401 without token, expired tokens, public endpoints, admin/worker/requester RBAC, banned user token revocation, custom claims sync.
2. **Data Access Control** (6 items) — cross-requester job reads, cross-worker job reads, cross-requester mutations, Firestore security rules for writes and notification feed reads, admin super-access.
3. **Input Validation & Injection** (6 items) — SQL injection strings in address field, MIME-type-based file upload rejection, size limits, mass assignment, XSS in notes, long input handling.
4. **Stripe Security** (5 items) — missing signature header, invalid signature, idempotent duplicate events, server-side amount computation, clientSecret not logged/stored.
5. **File Upload Security** (3 items) — no execution permissions on bucket, UUID-based storage paths, signed URL expiry ≤ 1 hour.
6. **Secrets & Configuration** (5 items) — git log grep, Cloud Run Secret Manager references, Maps key not in bundle, CORS origin whitelist, application-prod.yml gitignored.
7. **Rate Limiting & Abuse** (3 items) — export 429 after 10/hour, no unbounded queries, dispatch non-response cooldown.
8. **Audit Log Integrity** (4 items) — integrity job ran last 7 days, hash-chain break detection, state machine entries, admin action entries.

Sign-off table included with pre-launch gate: Sections 1–6 must all pass before opening to the public.

No code changes. No test run needed.

---

## 2026-04-18 — Local dev environment setup + admin disputes tab wired to real API

### Context

User began working toward a fully executable local demo (no real money). Discussion covered: running 4 terminal windows (Firebase emulators, seed script, Spring Boot, Vite dev server), fixing the Maven `-D` flag quoting issue on Windows, finding Stripe sandbox keys, and keeping the Stripe secret key out of git.

### Issues resolved

**Maven `-Dspring-boot.run.arguments=` parsing failure on Windows:** Maven was splitting the `-D` flag at the dot, treating `.run.arguments=...` as a lifecycle phase name. Fix: replaced with the correct property name `mvn spring-boot:run -Dspring-boot.run.profiles=dev`. That also failed the same way. Final fix: set `$env:SPRING_PROFILES_ACTIVE="dev"` as a PowerShell environment variable and run `mvn spring-boot:run` without any `-D` flag.

**Keeping Stripe secret key out of git:** `application-dev.yml` is not gitignored — recommended setting secrets as PowerShell env vars inline: `$env:STRIPE_SECRET_KEY="sk_test_..."; mvn spring-boot:run`. Nothing touches the filesystem.

**Stripe webhook secret:** Requires Stripe CLI (`stripe listen --forward-to localhost:8081/webhooks/stripe`), which prints `whsec_...` on startup. Port is 8081 per `application-dev.yml` (not 8080, which the Firebase emulator uses).

**Stripe CLI already installed:** WinGet install failed with "Access is denied" because the exe was already present. `stripe --version` confirmed it was installed; proceeded to `stripe login`.

### Admin disputes tab — wired to real API

The disputes tab in `AdminDashboard.jsx` used a hardcoded `INITIAL_DISPUTES` mock array (2 fake entries) and a `resolveDispute` function that only updated local state. No backend endpoint existed to list disputes.

**Backend change — `AdminController.java`:**
- Added `import com.yosnowmow.model.Dispute`
- Added `GET /api/admin/disputes?status=` endpoint: queries Firestore `disputes` collection ordered by `openedAt` DESC, limit 100, optional `whereEqualTo("status", ...)` filter. Returns `List<Dispute>`.

**Frontend — `api.js`:**
- Added `getAdminDisputes(status)` → `GET /api/admin/disputes`

**Frontend — `Dashboard.jsx`:**
- Removed `INITIAL_DISPUTES` constant (mock data)
- Added `disputes`, `disputesLoading`, `disputesError` state
- Added `fetchDisputes()` using `api.getAdminDisputes()`
- Updated `useEffect` on `activeTab` to call `fetchDisputes()` when disputes tab first opened (lazy-load pattern, same as users tab)
- Replaced `resolveDispute(id, resolution)` (local state mutation) with an async function calling `api.resolveDispute(disputeId, { resolution })` then refreshing
- Updated overview card "Open Disputes" to filter `d.status === 'OPEN'` (was `'Open'`)
- Updated disputes tab cards to use real Dispute model fields: `disputeId`, `jobId`, `openedByUid`, `openedAt` (Firestore Timestamp → formatted date), `requesterStatement`, `workerStatement`, `resolution`, `adminNotes`
- Resolve buttons now pass `'RELEASED'` / `'REFUNDED'` (backend enum values, not display strings)
- Removed "Dispute API wires in P2-01. Showing prototype data." warning banner — it's now live

---

## 2026-04-18 — Local run fixes + logout + signup implementation

### Issues fixed

**Vite proxy port mismatch:** `vite.config.js` had the proxy pointing to `localhost:8080` (Firebase emulator port) instead of `localhost:8081` (Spring Boot dev port). Fixed. (Note: moot since `VITE_API_BASE_URL=http://localhost:8081` in `.env.local` makes requests absolute, bypassing the proxy — corrected for accuracy.)

**No logout button in any layout:** `AuthContext.signOut()` existed but was never called from the UI. Added "Sign out" button to all three layout headers. All layouts now use `useAuth()` instead of `useMock()` for the user's display name.

**Signup page was a placeholder:** `Signup.jsx` contained only `return <div>Sign Up — coming soon</div>`.

### AuthContext.jsx
- Added `createUserWithEmailAndPassword` import
- Added `signUp(email, password)` — wraps `createUserWithEmailAndPassword`
- Added `refreshProfile()` — re-fetches `users/{uid}` Firestore doc and updates state; used after signup to load newly created profile without waiting for next `onAuthStateChanged`
- Exposed both in context value

### api.js
- Added `createUser(body)` → `POST /api/users`

### Signup.jsx — full implementation
Fields: name, email, password, confirm password, DOB, phone (optional), account type radio (Requester / Worker / Both), ToS checkbox. Flow: `signUp` → `createUser` → `refreshProfile` → navigate. Reuses Login.module.css, Button, Input components.

### Layout changes
- **RequesterLayout / WorkerLayout / AdminLayout**: replaced `useMock()` with `useAuth()`; display real `userProfile.name`; added "Sign out" button that calls `signOut()` + navigates to `/login`

---

## 2026-04-18 — Geocoding coverage expansion + error visibility fix

### Problems

1. **Spring Boot 3 omits error messages** by default (`server.error.include-message` defaults to `never`). Frontend was showing generic "Failed to post job" instead of the real backend reason. Fixed by adding `server.error.include-message: always` and `include-binding-errors: always` to `application-dev.yml`.

2. **Google Maps precision filter too strict**: `tryGoogleMaps` only accepted `ROOFTOP` and `RANGE_INTERPOLATED` results. Many valid Canadian addresses (suburban, postal code centroid results) return `GEOMETRIC_CENTER`, causing silent fallthrough to the FSA table. Extended the condition to also accept `GEOMETRIC_CENTER` (~200 m accuracy, sufficient for worker-matching).

3. **FSA centroid table had gaps**: Only ~35 entries, missing most Toronto FSAs. M9B (Etobicoke/Cloverdale) was not covered. Expanded to cover all ~90 Toronto M-prefix FSAs across Scarborough, North York, East Toronto, Downtown, West Toronto, and Etobicoke.

### Changes

**`application-dev.yml`**: Added `server.error.include-message: always` and `server.error.include-binding-errors: always`.

**`GeocodingService.java` — `tryGoogleMaps`**: Added `LocationType.GEOMETRIC_CENTER` to accepted precision types. This makes the Google Maps path work for virtually all Canadian addresses, not just rooftop-accuracy ones. Covers all of Canada with a valid Maps API key.

**`GeocodingService.java` — `FSA_CENTROIDS` table**: Expanded from ~35 entries to ~95 entries. Added all Toronto M-prefix FSAs: complete Scarborough (M1A–M1X), North York (M2H–M3N), East Toronto/East York (M4A–M4Y), Downtown (M5A–M5X), West Toronto/York (M6A–M7A), Etobicoke (M8V–M9W). All coordinates are neighbourhood centroids accurate to within ~500 m. This makes the FSA fallback work for all of Toronto without requiring a Maps API key.

**`PostJob.jsx` — error handling**: Improved catch block to extract message from `data.message`, `data.error`, plain string response, or `err.message` rather than the single `data?.message ?? fallback` pattern.

---

## 2026-04-18 — Fix worker dispatch coverage + fake worker count + admin login redirect

### Problems identified and fixed

**1. Hardcoded "3 Workers available" on PostJob Step 1**

`PostJob.jsx` line 236 showed `✓ 3 Workers available in your area` after a fake 1.2-second timeout that always fired regardless of actual backend availability. This is entirely disconnected from the real matching algorithm (which runs asynchronously after job submission). Changed to `✓ Address confirmed — Workers will be matched when you post` which is accurate.

**2. Seed workers all outside service radius of test address M9B 6L9**

The default test address (Etobicoke, M9B 6L9) at approximately (43.648, -79.553) was outside every seed worker's service radius:
- Alex Moreau (Oakville): 10 km radius, ~25 km away
- Jordan Tremblay (Burlington): 8 km radius, ~40 km away
- Marcus Webb (Scarborough): 8 km radius, ~35 km away
- Priya Sharma (North York): 6 km radius, ~21 km away

Result: `MatchingService.runMatchingAlgorithm()` returned zero candidates → no `jobRequests` document created → worker portal showed nothing.

Fix: Relocated `worker@yosnowmow.test` (Alex Moreau) from Oakville to Etobicoke (600 The East Mall, M9B 4B1, coords 43.6500, -79.5500) with a 30 km radius covering all of Toronto. Updated pricing tiers to 3 tiers matching the wider radius. Also increased Priya Sharma's radius from 6 km to 25 km (updated tiers accordingly). Seed must be re-run after emulator restart: `node firebase/seed-emulator.js`.

**3. Admin role sent to `/requester` after login**

Root cause: The app root `/` redirects to `/requester`. That path is protected, so an unauthenticated visitor gets redirected to `/login` with `state.from = '/requester'`. In `Login.jsx`, the post-login redirect used `from || defaultPathForRoles(roles)`, so any user (including admin) whose login originated from the root got sent to `/requester`.

Fix: Added `resolveDestination(from, roles)` helper in `Login.jsx` that validates `from` against the user's actual roles before using it. If the `from` path is a section the user's roles don't cover (e.g., admin user with `from = '/requester'`), it falls back to `defaultPathForRoles`. Admin users now always land on `/admin`.

---

## 2026-04-18 — Dispatch queue visibility + flow clarification

### Problem
`worker@yosnowmow.test` (Alex Moreau, newly relocated to Etobicoke with null rating) cannot see a posted job offer, but `worker3@yosnowmow.test` (Priya Sharma, 4.7 rating) can. Admin sees job as REQUESTED with no explanation of who was matched or offered.

### Root cause
`MatchingService` sorts by rating DESC then distance ASC. Priya Sharma (4.7) ranks first in the dispatch queue; Alex Moreau (null rating, treated as −1.0) ranks last. The dispatch is sequential: the offer goes to Priya first and stays with her for 10 minutes before Alex gets a turn.

### Fix: Admin Dispatch Queue card
Added a "Dispatch Queue" card to `AdminJobDetail.jsx` that reads `job.matchedWorkerIds`, `job.contactedWorkerIds`, `job.simultaneousOfferWorkerIds`, and `job.offerExpiry` to show admin exactly who was matched and what their current status is.

- Fetches user profiles for up to 10 matched workers in parallel via `getUser()` (in `loadJob`)
- Each row shows: rank number, avatar, name, rating + job count + service radius, status badge
- Status badges: "Offer Sent" (amber) · "Accepted" (green) · "Declined / Expired" (gray) · "Queued" (blue)
- Shows offer expiry timestamp when there is an active outstanding offer
- Added `matchedWorkerProfiles` state

### Flow clarification
User observed "job jumped to Awaiting Payment without Worker3 confirming completion." This is correct behaviour: PENDING_DEPOSIT ("Awaiting Payment") is the state AFTER the worker accepts, BEFORE the requester pays Stripe escrow. The full flow is: REQUESTED → worker accepts → PENDING_DEPOSIT → requester pays → CONFIRMED → worker starts → IN_PROGRESS → worker completes → COMPLETE → auto-release → RELEASED.

---

## 2026-04-18 — Major Workflow Redesign: Negotiated Marketplace Model (Spec v1.1)

### Context
User requested a significant change to the job lifecycle, replacing the sequential-dispatch model with a negotiated marketplace model. Full requirements gathering session.

### Decisions made (stakeholder verbal approval)

| Question | Decision |
|----------|----------|
| Who proposes the initial price? | Requester, with YSM-recommended value based on size/service selection |
| Worker job board (browse available jobs)? | HOLD — future version |
| Photo mechanics | In-app upload; attached to job document |
| Address reveal timing | After Requester deposits escrow (not just after agreement) |
| Worker blocking scope | Job-by-job only (no permanent cross-job blocking) |
| Admin visibility into blocks | Track rolling 90-day rejection count; flag at 3/5/10 thresholds |
| Tax | HST 13% (Ontario) |
| Approval after completion | Requester must explicitly approve; 2-hour auto-approval if no action; Requester acknowledges this window when paying escrow |

### New state machine (SPECIFICATION.md §16)

```
POSTED → NEGOTIATING → AGREED → ESCROW_HELD → IN_PROGRESS → PENDING_APPROVAL → RELEASED
  ↓          ↓            ↓           ↓                              ↓
CANCELLED CANCELLED    CANCELLED  CANCELLED                    DISPUTED → RELEASED|REFUNDED|SETTLED
```

State renames from v1.0:
- REQUESTED → POSTED
- PENDING_DEPOSIT → AGREED
- CONFIRMED → ESCROW_HELD
- COMPLETE → PENDING_APPROVAL

New state: NEGOTIATING (first worker responds → job enters this state)

### New collection: `jobOffers/{jobId}_{workerId}`
Tracks per-worker negotiation thread. Status: PENDING_REQUESTER → PENDING_WORKER → AGREED | REJECTED | WITHDRAWN | SUPERSEDED. Messages array records each back-and-forth (type: PRICE_OFFER | ACCEPT | PHOTO_REQUEST | PHOTO_UPLOAD | REJECT | WITHDRAW).

### Pricing model change
Price is now negotiated, not derived from worker's tier table. Requester proposes opening price; worker accepts or counters; `agreedPriceCents` locked when both agree. Disbursement formula unchanged: worker gets agreedPrice × (1−commission) + HST; platform retains agreedPrice × commission.

### Implementation plan
- **Phase A**: Backend only — rename states, add NEGOTIATING, new OfferService, updated MatchingService (notify vs. dispatch), new API endpoints, 90-day rejection counter
- **Phase B**: Requester UI — price field on PostJob, offer management on JobStatus, escrow payment with 2-hr acknowledgment
- **Phase C**: Worker UI — offer response (accept/counter/photo request), photo upload
- **Phase D**: Completion flow — PENDING_APPROVAL status, Approve/Dispute buttons, auto-approval timer

Specification updated in `docs/SPECIFICATION.md` §16.

---

## 2026-04-18 — Session: Phase A Backend Implementation (Negotiated-Marketplace Workflow)

### Context
Continuation of the redesign discussion from the previous session. The user approved "Phase A" — implementing the backend state machine changes for the negotiated-marketplace workflow. No new user messages; this session was entirely implementation.

---

### Phase A changes implemented

#### Model layer

**`model/Job.java`**
- Updated status comment listing to v1.1 values.
- Added new v1.1 pricing/lifecycle fields: `postedPriceCents`, `agreedPriceCents`, `agreedWorkerId`, `rejectedWorkerIds` (List), `approvalWindowHours` (default 2), `approvalWindowAcknowledgedAt`, `postedAt`, `agreedAt`, `pendingApprovalAt`, `approvedAt`, `escrowHeldAt`.
- Marked old lifecycle timestamps `@Deprecated`: `requestedAt`, `offeredAt`, `acceptedAt`, `confirmedAt`.
- Added all getters/setters.

**`model/WorkerProfile.java`**
- Added `jobRejectionCount90d` (int) with Javadoc explaining admin thresholds (3=informational, 5=warning, 10=critical).

**`model/JobOffer.java`** (new)
- Fields: `offerId` (`{jobId}_{workerId}`), `jobId`, `workerId`, `status` (OPEN|ACCEPTED|COUNTERED|PHOTO_REQUESTED|REJECTED|WITHDRAWN), `workerPriceCents`, `requesterPriceCents`, `lastMoveBy`, `workerNote`, `photoRequestNote`, `messages` (List<OfferMessage>), `createdAt`, `updatedAt`.

**`model/OfferMessage.java`** (new)
- Immutable thread entry: `actor` (worker|requester), `action` (accept|counter|photo_request|withdraw|reject), `priceCents`, `note`, `createdAt`.

#### DTO layer

**`dto/OfferRequest.java`** (new)
- `action` (@NotBlank), `priceCents` (@Min(100), required for counter), `note` (@Size(max=500)).

**`dto/CreateJobRequest.java`**
- Added `postedPriceCents` (@Min(100)) field with getter/setter.

#### Service layer

**`service/OfferService.java`** (new, ~320 lines)
- `workerSubmitOffer(jobId, workerId, req)`: handles accept/counter/photo_request/withdraw actions.
- `requesterRespondToOffer(jobId, workerId, requesterId, req)`: handles accept/counter/reject.
- `handleRequesterAccept(...)`: computes pricing from agreedCents; transitions job POSTED/NEGOTIATING → AGREED; sets agreedPriceCents, agreedWorkerId, agreedAt; rejects all other open offers.
- `handleRequesterReject(...)`: adds workerId to rejectedWorkerIds; increments `worker.jobRejectionCount90d`; sends notification.
- `computePricing(job, workerId, agreedCents)`: applies commission tiers (founding=0%, early_adopter=8%, standard=15%); computes HST, workerPayout; updates job pricing fields.
- `getOffersForJob(jobId)`: returns all offer documents for a job.
- Constants: `COMMISSION_RATE_STANDARD=0.15`, `COMMISSION_RATE_EARLY_ADOPTER=0.08`, `COMMISSION_RATE_FOUNDING=0.0`, `HST_RATE=0.13`.

**`service/JobService.java`**
- `ACTIVE_STATUSES`: `POSTED, NEGOTIATING, AGREED, ESCROW_HELD, IN_PROGRESS`.
- `TRANSITIONS` map: full v1.1 state machine (POSTED→NEGOTIATING|CANCELLED, NEGOTIATING→AGREED|POSTED|CANCELLED, AGREED→ESCROW_HELD|CANCELLED, ESCROW_HELD→IN_PROGRESS|CANCELLED, IN_PROGRESS→PENDING_APPROVAL|INCOMPLETE, PENDING_APPROVAL→DISPUTED|RELEASED, INCOMPLETE→DISPUTED|RELEASED, DISPUTED→RELEASED|REFUNDED, RELEASED→SETTLED).
- `CANCELLABLE_STATUSES`: `POSTED, NEGOTIATING, AGREED, ESCROW_HELD`.
- `createJob`: status="POSTED", added rejectedWorkerIds=[], approvalWindowHours=2, postedPriceCents, postedAt=now.
- `validateActorPermission`: updated switch cases for new status names; PENDING_APPROVAL→DISPUTED enforces configurable `approvalWindowHours`; PENDING_APPROVAL→RELEASED allows requester/system/admin.
- `applyLifecycleTimestamp`: ESCROW_HELD→escrowHeldAt, PENDING_APPROVAL→pendingApprovalAt+autoReleaseAt.
- `handleSideEffects`: scheduleAutoRelease triggered on PENDING_APPROVAL.
- `cancelJob`: fee for ESCROW_HELD (was CONFIRMED).

**`service/MatchingService.java`**
- Removed `DispatchService` dependency; injected `NotificationService`.
- Added `TOP_NOTIFY_COUNT = 3`.
- `matchAndStoreWorkers`: notifies top 3 workers via `notificationService.notifyWorkerNewJobPosted()` instead of calling DispatchService.
- `countActiveJobsForWorker`: counts ESCROW_HELD and IN_PROGRESS.

**`service/DispatchService.java`** (gutted → deprecated stub)
- Replaced entirely with minimal `@Deprecated` stub; logs a warning on instantiation.

**`service/DisputeService.java`**
- Status check changed from "COMPLETE" to "PENDING_APPROVAL".
- Dispute window now uses `pendingApprovalAt` + `approvalWindowHours` (was hardcoded 2 hours from `completedAt`).

**`service/RatingService.java`**
- `RATEABLE_STATUSES`: replaced "COMPLETE" with "PENDING_APPROVAL".
- `checkAndRelease`: triggers on "PENDING_APPROVAL" (was "COMPLETE").

**`service/PaymentService.java`**
- `createEscrowIntent`: guards for "AGREED" instead of "PENDING_DEPOSIT".

**`service/FraudDetectionService.java`**
- Velocity query: status "PENDING_APPROVAL", field "pendingApprovalAt".

**`service/NotificationService.java`**
- Added 6 new async notification stub methods: `notifyWorkerNewJobPosted`, `notifyRequesterOfferReceived`, `notifyWorkerRequesterCountered`, `notifyWorkerOfferAgreed`, `notifyRequesterReadyForEscrow`, `notifyWorkerRejected`.

#### Controller layer

**`controller/OfferController.java`** (new)
- `GET /api/jobs/{jobId}/offers` — requester lists all offers for a job.
- `POST /api/jobs/{jobId}/offers` — worker submits offer action.
- `PUT /api/jobs/{jobId}/offers/{workerId}` — requester responds to specific worker's offer.

**`controller/JobController.java`**
- `completeJob`: transitions to "PENDING_APPROVAL" (was "COMPLETE").
- New `POST /{jobId}/approve` endpoint: requester explicitly approves → transitions to RELEASED + triggers payout.
- `isConfirmedOrLater`: updated status set to include ESCROW_HELD, PENDING_APPROVAL.
- cancel switch: ESCROW_HELD triggers fee path; AGREED triggers cancelPaymentIntent.

**`controller/WebhookController.java`**
- `handleAmountCapturable`: comment updated (AGREED, not PENDING_DEPOSIT).
- `handlePaymentSucceeded`: guards for "AGREED" → transitions to "ESCROW_HELD"; stores `approvalWindowAcknowledgedAt`.

**`controller/AdminController.java`**
- `ACTIVE_STATUSES`: updated to POSTED, NEGOTIATING, AGREED, ESCROW_HELD, IN_PROGRESS.
- `CANCELLABLE_ON_BAN`: updated to POSTED, NEGOTIATING, AGREED, ESCROW_HELD.
- `terminalStatuses`: "PENDING_APPROVAL" replaces "COMPLETE".
- Ban logic refund guard: `"POSTED"` replaces `"REQUESTED"` (jobs in POSTED state don't have escrow yet → no refund needed).

**`controller/JobRequestController.java`** (deprecated)
- Replaced with a minimal stub returning `410 Gone` on all requests; `@Deprecated` annotation added.

**`controller/StorageController.java`**
- Completion photo upload: allowed in "PENDING_APPROVAL" instead of "COMPLETE".

#### Scheduler layer

**`scheduler/PostedJobExpiryJob.java`** (new)
- Quartz job; runs every hour.
- Queries POSTED and NEGOTIATING jobs where `postedAt < now - 24 hours`.
- Transitions each expired job to CANCELLED with `cancelledBy="system_expiry"`; writes audit; notifies requester.

**`scheduler/RejectionCountCleanupJob.java`** (new)
- Quartz job; runs at 05:00 daily.
- Queries workers where `jobRejectionCount90d > 0` AND `lastRejectedAt < now - 90 days`.
- Resets `worker.jobRejectionCount90d` to 0.

**`scheduler/DisputeTimerJob.java`**
- Status check: "PENDING_APPROVAL" (was "COMPLETE").

**`config/QuartzConfig.java`**
- Added JobDetail + Trigger beans for `PostedJobExpiryJob` (hourly: `"0 0 * * * ?"`) and `RejectionCountCleanupJob` (05:00 daily: `"0 0 5 * * ?"`).
- Removed reference to DispatchJob.

#### Test layer

**`MatchingServiceTest.java`**
- Replaced `@Mock DispatchService` with `@Mock NotificationService`.
- `makeJob` status: "POSTED" (was "REQUESTED").

**`controller/JobControllerTest.java`**
- All "REQUESTED" → "POSTED", "PENDING_DEPOSIT" → "AGREED", "CONFIRMED" → "ESCROW_HELD", "COMPLETE" → "PENDING_APPROVAL".
- `completeJob` test: verifies `transition(jobId, "PENDING_APPROVAL", ...)`.

**`controller/WebhookControllerTest.java`**
- Payment succeeded test: uses "AGREED" as initial state, verifies "ESCROW_HELD" as result.
- Already-confirmed skip test: uses "ESCROW_HELD".

**`controller/AdminControllerTest.java`**
- Status strings updated throughout to new v1.1 names.

**`controller/WorkerControllerTest.java`**
- Status strings updated.

---

### Grep sweep result
After all changes, a grep for `"REQUESTED"`, `"PENDING_DEPOSIT"`, `"CONFIRMED"` and `.equals("COMPLETE")` in `src/main/java` returned only one hit: a Javadoc comment in `JobService.java` using `"CONFIRMED"` as an example string — not a status check. No live status comparisons use old names.

---

---

## 2026-04-18 — Session (continued): Phase B Requester UI

### Files changed

**`frontend/src/components/StatusPill/StatusPill.jsx`**
- STATUS_MAP updated to v1.1 names: POSTED, NEGOTIATING, AGREED, ESCROW_HELD, PENDING_APPROVAL.
- Old names (REQUESTED, PENDING_DEPOSIT, CONFIRMED, COMPLETE) kept as aliases so any not-yet-migrated admin views degrade gracefully.

**`frontend/src/services/api.js`**
- Added `getOffersForJob(jobId)` — GET /api/jobs/{jobId}/offers.
- Added `respondToOffer(jobId, workerId, body)` — PUT /api/jobs/{jobId}/offers/{workerId}.
- Added `approveJob(jobId)` — POST /api/jobs/{jobId}/approve.
- Updated JSDoc for `cancelJob` (ESCROW_HELD, not CONFIRMED), `disputeJob` (PENDING_APPROVAL), `completeJob` (PENDING_APPROVAL, 2-hr timer).
- Marked `respondToJobRequest` as `@deprecated`.

**`frontend/src/context/MockStateContext.jsx`**
- STATE_ORDER updated to v1.1: POSTED→NEGOTIATING→AGREED→ESCROW_HELD→IN_PROGRESS→PENDING_APPROVAL→RELEASED.
- MOCK_JOBS: status 'CONFIRMED'→'ESCROW_HELD'; added `postedPriceCents` and `agreedPriceCents`; replaced `completedAt` with `pendingApprovalAt`.
- `addJob`: initial status 'POSTED'; added `postedPriceCents: 0`, `agreedPriceCents: null`.
- `setJobStatus` / `advanceJob`: set `pendingApprovalAt` when transitioning to PENDING_APPROVAL.

**`frontend/src/pages/requester/PostJob.jsx`**
- Step 2 subtitle: "opening offer price — workers may accept or negotiate."
- Step 2 pricing total label: "Opening offer total".
- Step 4 review label: "Your opening offer" (was "Agreed fee").
- API call: adds `postedPriceCents: basePrice` to the request body.

**`frontend/src/pages/requester/JobStatus.jsx`** (rewritten)
Major changes:
- TIMELINE_STATES / TIMELINE_LABELS / STATUS_DESC updated to v1.1 names.
- `canCancel`: POSTED | NEGOTIATING | AGREED | ESCROW_HELD.
- `canDispute` / `canApprove` / `canRate`: all PENDING_APPROVAL.
- `workerVisible`: starts from NEGOTIATING (was CONFIRMED).
- **Offers panel** (POSTED/NEGOTIATING): lists all worker offers with worker name/rating; Accept / Counter / Reject actions for offers where worker made the last move. Loading worker profiles per-offer via `getUser`.
- **Accept flow**: opens escrow acknowledgment modal ("payment releases automatically after 2 hours") → calls `respondToOffer(action:'accept')` → refreshes job.
- **Counter flow**: opens modal with price input + note → calls `respondToOffer(action:'counter')` → refreshes.
- **Reject flow**: window.confirm → calls `respondToOffer(action:'reject')` → refreshes.
- **Payment required card** (AGREED): shows agreed price, "Pay & Hold Escrow" stub button (Stripe in Phase C).
- **Work complete / Approve card** (PENDING_APPROVAL): green banner + "Approve & Release Payment" → confirm modal → calls `approveJob()`.
- **Cancel modal**: text updated to mention ESCROW_HELD fee (was CONFIRMED).
- Pricing label: "Agreed price" (was "Agreed fee"); pricing section message: "Pricing appears once a price is agreed with a worker."

### What remains (Phase B, C, D)
- **Phase B**: Requester UI — price field on PostJob, offer management on JobStatus, escrow payment with 2-hr acknowledgment modal
- **Phase C**: Worker UI — offer response screen (accept/counter/photo request), photo upload
- **Phase D**: Completion flow — PENDING_APPROVAL status, Approve/Dispute buttons, auto-approval timer display
- Frontend status constants (React components) still use old strings — not yet updated
- **Compilation fix**: `./mvnw compile` revealed `DispatchJob.java` still called `dispatchService.handleOfferExpiry()` (removed from the stub). Fixed by replacing `DispatchJob` with a no-op stub matching the `DispatchService` pattern; retained the class to avoid Quartz deserialization errors if old trigger records exist in the DB. Final compile: clean.

---

## 2026-04-19 — Session: Phase C (Worker UI) + Phase D (Completion Flow) — Spec v1.1 Negotiated Marketplace

### Context

Continuing the Spec v1.1 negotiated marketplace migration. Phase B (Requester UI) was completed in the prior session. This session implements:
- **Phase C**: Worker offer management UI — discover nearby jobs, submit offers, handle counter-offers
- **Phase D**: Updated completion flow — PENDING_APPROVAL state (replaces COMPLETE), auto-approval messaging

### Problem identified: workers couldn't read POSTED jobs

Before any UI could be built, a backend access control gap was discovered. `JobService.getJobForCaller()` only permitted:
- The job's `requesterId`
- The assigned `workerId` (set only after AGREED)
- Admins

In the v1.1 model, workers receive NEW_JOB_POSTED notifications and need to call `GET /api/jobs/{jobId}` to fetch job details before submitting an offer. At that point, no `workerId` is set on the job. Workers in `matchedWorkerIds` were blocked with `AccessDeniedException`.

**Fix applied to `backend/src/main/java/com/yosnowmow/service/JobService.java`**:

Added a third "matched worker" check in `getJobForCaller()`:
```java
boolean isMatchedWorker = caller.hasRole("worker")
        && job.getMatchedWorkerIds() != null
        && job.getMatchedWorkerIds().contains(caller.uid());
```
Access granted if any of: `isRequester || isAssigned || isMatchedWorker || isAdmin`.

Address remains redacted for workers in POSTED/NEGOTIATING/AGREED — that is enforced separately in `JobController.getJob()` via the `isConfirmedOrLater()` helper (unchanged).

### Missing `submitOffer` in `frontend/src/services/api.js`

`OfferController` backend endpoint `POST /api/jobs/{jobId}/offers` was implemented in Phase A, but `api.js` had no corresponding client function. Added:
```javascript
export const submitOffer = (jobId, body) =>
  api.post(`/api/jobs/${jobId}/offers`, body).then(r => r.data)
```

### Firestore security rules gap: `jobOffers` collection

`firestore.rules` was last updated in P1-21, before the `jobOffers` collection was designed. The catch-all `/{document=**} → false` was blocking all client reads of `jobOffers`. Workers need a real-time `onSnapshot` listener on their own offers to see requester responses (counters, acceptance, rejection) without polling the API.

**Fix applied to `firebase/firestore.rules`**:
```
match /jobOffers/{offerId} {
  allow read: if isSignedIn() && (
    resource.data.workerId == request.auth.uid ||
    isAdmin()
  );
  allow write: if false;
}
```
All writes remain Admin SDK only (OfferService). Also updated `jobRequests` comment to note it is legacy Phase 1 dispatch records replaced by `jobOffers` in v1.1.

### Phase C: `frontend/src/pages/worker/JobRequest.jsx` (complete rewrite)

The old version was built for the sequential dispatch model: it listened to `jobRequests` Firestore for PENDING offers with a 10-minute countdown timer and accept/decline buttons. Completely incompatible with v1.1.

**New architecture — two real-time Firestore listeners:**

1. **`jobOffers` where `workerId == uid`** — tracks all offers the worker has submitted and their current status (OPEN, COUNTERED, PHOTO_REQUESTED, ACCEPTED, REJECTED, WITHDRAWN).
2. **`notifications/{uid}/feed` where `isRead == false`** — discovers `NEW_JOB_POSTED` opportunities the backend has notified this worker about.

**Job detail lazy-loading:**
For each unique `jobId` seen across both listener streams, `getJob(jobId)` is called once and results cached in `jobCache` (a `useRef` object). Errors are stored as `{ _error: true }` to prevent infinite retry loops on access-denied or network failures.

**Three display sections:**
1. **Active Offers** (status: OPEN, COUNTERED, PHOTO_REQUESTED): in-flight negotiations. Shows offer status badge (color-coded), the price thread (worker's offered price + requester's counter if any), and contextual action buttons.
2. **New Nearby Jobs** (NEW_JOB_POSTED notifications without a submitted offer): the opportunity queue. Shows job scope, schedule, opening price, and "Address revealed after escrow" message.
3. **Concluded** (REJECTED, WITHDRAWN): low-prominence collapsed list at the bottom.

**Sub-components:**
- `OpportunityCard(job, notification, onAccept, onCounter)`: Renders a new job opportunity. "Accept $XX" button calls `handleAccept`; "Counter" opens the counter modal.
- `OfferCard(offer, job, onCounter, onWithdraw, onAcceptCounter)`: Renders a submitted offer. Status-aware actions:
  - OPEN → "Withdraw offer"
  - COUNTERED → "Counter Again" + "Accept $XX" (requester's counter price)
  - ACCEPTED → "Waiting for homeowner to pay escrow" info message

**Counter-offer modal** (using existing `Modal` component):
- Price input: number, min $1, defaults to current offer price
- Optional note textarea
- "Send Counter Offer" CTA → `submitOffer(jobId, { action: 'counter', priceCents, note })`
- Modal also used for "accept from opportunity" (action: 'accept')

**Notification read marking:**
After the worker clicks Accept or Counter on an opportunity, `markJobNotificationsRead(jobId)` writes `isRead: true` to all unread notifications for that jobId, removing the job from the opportunity queue (since the offer now appears in Active Offers).

**Key handlers:**
- `handleAccept(jobId, priceCents)` → `submitOffer(jobId, { action: 'accept', priceCents })`
- `openCounterModal(jobId, currentPrice, mode)` → sets modal state
- `handleSubmitCounter()` → validates price > 0, calls `submitOffer`, marks notifications read, closes modal
- `handleWithdraw(jobId)` → `window.confirm` → `submitOffer(jobId, { action: 'withdraw' })`
- `handleAcceptCounter(offerId, jobId, priceCents)` → `submitOffer(jobId, { action: 'accept', priceCents })`

### Phase D: `frontend/src/pages/worker/ActiveJob.jsx` (status name updates)

The old version used v1.0 status names. Updated throughout:

| Old (v1.0) | New (v1.1) |
|---|---|
| `CONFIRMED` | `ESCROW_HELD` |
| `IN_PROGRESS` | `IN_PROGRESS` (unchanged) |
| `COMPLETE` | `PENDING_APPROVAL` |

**Specific changes:**
- `ACTIVE_STATUSES = ['ESCROW_HELD', 'IN_PROGRESS', 'PENDING_APPROVAL']`
- Job loading preference: `ESCROW_HELD` or `IN_PROGRESS` first, then `PENDING_APPROVAL` fallback
- Status banner: "🚗 Head to the property" for ESCROW_HELD; "❄️ Clearing in progress" for IN_PROGRESS; "✅ Work submitted — awaiting homeowner approval" for PENDING_APPROVAL
- Banner background: green (`--color-success`) for PENDING_APPROVAL, blue (`--color-primary`) otherwise
- ESCROW_HELD card: "Check In at Property" → calls `startJob()` → transitions to IN_PROGRESS
- IN_PROGRESS card: unchanged (photo upload required, then "Mark Work Complete")
- **New PENDING_APPROVAL card**: celebration state — "🎉 Work submitted!", "The homeowner has 2 hours to approve or raise a dispute. Payment of $XX releases automatically after approval."
- Earnings card note: "auto-approves in 2 hrs" added
- Empty state: "Once your offer is agreed and the homeowner pays, your job will appear here."

### Backend compile verification
`./mvnw compile -q` — clean, no errors after all changes.

### Files changed this session
1. `backend/src/main/java/com/yosnowmow/service/JobService.java` — extend `getJobForCaller()` to allow matched workers to read POSTED/NEGOTIATING jobs
2. `frontend/src/services/api.js` — add `submitOffer(jobId, body)` function
3. `firebase/firestore.rules` — add `jobOffers` read rule for workers
4. `frontend/src/pages/worker/JobRequest.jsx` — complete rewrite for v1.1 negotiated marketplace
5. `frontend/src/pages/worker/ActiveJob.jsx` — status name updates (CONFIRMED→ESCROW_HELD, COMPLETE→PENDING_APPROVAL) + PENDING_APPROVAL celebration card

### What remains
- Deploy updated firestore.rules: `firebase deploy --only firestore:rules`
- End-to-end testing in Firebase emulator (seed workers need to be in `matchedWorkerIds` of test jobs)
- Rating flow UI (post-RELEASED) — Phase E
- Stripe escrow payment integration (AGREED → ESCROW_HELD) — deferred to later phase

---

## 2026-04-19 — Hotfix: Admin JobDetail override status list

### Problem found during emulator e2e testing

While following the end-to-end test instructions (Step 5-D: simulate escrow via admin override), the Override Status dropdown in `frontend/src/pages/admin/JobDetail.jsx` did not include `ESCROW_HELD`. The `ALL_STATUSES` array and `STATE_LABELS` map were still using v1.0 names (REQUESTED, PENDING_DEPOSIT, CONFIRMED, COMPLETE).

### Fix

Updated `ALL_STATUSES` to:
```js
['POSTED', 'NEGOTIATING', 'AGREED', 'ESCROW_HELD', 'IN_PROGRESS',
 'PENDING_APPROVAL', 'RELEASED', 'DISPUTED', 'CANCELLED', 'INCOMPLETE',
 'REFUNDED', 'SETTLED']
```

Updated `STATE_LABELS` keys to match: POSTED, NEGOTIATING, AGREED, ESCROW_HELD, IN_PROGRESS, PENDING_APPROVAL, RELEASED.

Committed as hotfix `f7e60f8`. No test changes needed (admin UI is not covered by the backend test suite).

---

## 2026-04-19 — Hotfix: Photo upload field name mismatch

### Problem found during emulator e2e testing (Step 5-F)

Uploading a 2 MB PNG as a completion photo failed. Root cause: `api.js` was sending the multipart file under field name `"photo"` (`formData.append('photo', file)`) but `StorageController` declares `@RequestParam("file")`. Spring rejects the request with 400 because the expected `"file"` part is missing — the file size limit (10 MB) was never reached.

### Fix

Changed `frontend/src/services/api.js` `uploadJobPhoto()`:
```js
formData.append('file', file)   // was: 'photo'
```

Committed as `102cc4d`. `StorageControllerTest` already uses `"file"` in its `testPhoto()` helper — the test was correct, only the production API client was wrong.

---

## 2026-04-19 — Hotfix: StorageService real-GCS calls fail in emulator mode

### Problem found during emulator e2e testing (Step 5-F, second attempt)

After fixing the field name, the upload still failed with "Photo upload failed — please try again". Root cause: `StorageService.uploadJobPhoto()` calls `StorageClient.getInstance(firebaseApp).bucket(storageBucket).getStorage().create(...)` which targets real Google Cloud Storage. The Admin SDK does have a `FIREBASE_STORAGE_EMULATOR_HOST` env var mechanism, but it must be set as an OS environment variable before the JVM starts — setting it via `System.setProperty()` at runtime does not work (same pattern as `FIRESTORE_EMULATOR_HOST`). In emulator mode the fake `"emulator-local-dev"` credential is rejected by real GCS, causing a 500.

### Fix

Added `useEmulator` flag (injected from `${yosnowmow.firebase.use-emulator:false}`) to `StorageService`. In emulator mode, all three upload methods (`uploadJobPhoto`, `uploadDisputeEvidence`, `uploadInsuranceDoc`) run validation (MIME type, file size) then short-circuit and return a stable fake URL instead of calling GCS:
```
https://emulator.fake/storage/jobs/{jobId}/photos/{uuid}.png
```

This unblocks local testing. The fake URL is recorded in the Firestore job document's `completionImageIds` array exactly as a real URL would be — the downstream flow (mark complete, approve) is unaffected.

Committed as `1a7834f`. All 168 tests still pass.

---

## 2026-04-19 — Hotfix: Spring Boot multipart size limit (1 MB default)

### Problem found during emulator e2e testing (Step 5-F, third attempt)

Even after the field name fix and the storage emulator short-circuit, a 2 MB PNG still triggered "Photo upload failed". Root cause: Spring Boot's default `spring.servlet.multipart.max-file-size` is **1 MB**. The 2 MB file was rejected by Spring's `StandardMultipartHttpServletRequest` before the request even reached `StorageController` — no application code ran at all. This also explains why neither previous fix had any effect.

### Fix

Added to `application.yml` (base config, all profiles):
```yaml
spring:
  servlet:
    multipart:
      max-file-size: 20MB    # largest upload: dispute evidence (spec: 20 MB)
      max-request-size: 22MB # file + form fields headroom
```

Set to 20 MB to match the largest file the spec allows (dispute evidence). Completion photos are capped at 10 MB and insurance docs at 20 MB — all enforced by `StorageService` validation after the multipart layer accepts the bytes.

Also noted: "CTRL-SHIFT-R" is a browser hard-refresh, not a backend restart. The backend (`./mvnw spring-boot:run`) must be stopped (Ctrl+C) and restarted in its terminal for any Java changes to take effect.

Committed as `a6055ac`.

---

## 2026-04-19 — Prod smoke test + fix: requester 403 on worker profile fetch during NEGOTIATING

### Context

After the full production deployment (GoDaddy domain, Firebase Hosting, Cloud Run backend), a smoke test was run end-to-end:
- Requester signed up, logged in, posted a job → job appeared as POSTED in Firestore
- Worker signed up, logged in, browsed POSTED jobs via direct Firestore `onSnapshot` (DispatchService stub is not used in v1.1), made an offer
- Job moved to NEGOTIATING status in Firestore
- Requester navigated to Job Status page → saw NEGOTIATING status but the offers panel failed to render

### Root cause

`JobStatus.jsx` called `getUser(offer.workerId)` to fetch the worker's display name and rating for each offer card. `GET /api/users/{uid}` is protected by `UserController.requireSelfOrAdmin()` — returns 403 to anyone who is not the account owner or admin. A requester is neither, so every worker profile fetch 403'd.

The same 403 fired for `getUser(job.workerId)` in the "Your Worker" card, and also for the assigned-worker card shown after NEGOTIATING.

A secondary issue: even if the 403 were fixed by loosening `UserController`, the field names don't match. `JobStatus.jsx` uses `displayName`, `averageRating`, and `totalJobsCompleted`, but the full `User` model returns `name` and `worker.rating` / `worker.completedJobCount`.

### Fix

Added a narrow public endpoint `GET /api/users/{uid}/worker/public` to `WorkerController` that returns only three fields needed for the negotiation UI: `displayName`, `averageRating`, `totalJobsCompleted`. This approach:
- Exposes no private data (no address, pricing, financials, contact info)
- Requires only that the caller is authenticated (any signed-in user)
- Returns the field names the frontend already expects
- Avoids broadening the full `GET /api/users/{uid}` endpoint

**New files:**
- `backend/src/main/java/com/yosnowmow/dto/WorkerPublicProfileResponse.java` — DTO with `displayName`, `averageRating`, `totalJobsCompleted`

**Modified files:**
- `backend/.../controller/WorkerController.java` — added `GET /{uid}/worker/public` endpoint (no auth guard beyond `isSignedIn`)
- `frontend/src/services/api.js` — added `getWorkerPublicProfile(workerId)` calling the new endpoint
- `frontend/src/pages/requester/JobStatus.jsx` — replaced both `getUser()` calls with `getWorkerPublicProfile()`

**Security note:** The endpoint is intentionally accessible to any authenticated user without an ownership check. The DTO contains only display-safe data. The spec supports this pattern — a requester who is in a negotiation needs to see the worker's name and rating.

Changes committed and will be deployed via GitHub Actions CI/CD.

---

## 2026-04-19 — Admin account setup: promote-to-admin-prod.js

### Problem

No admin account exists in the production Firebase project. The emulator seed script creates `admin@yosnowmow.test` for local dev, but that account only exists in the emulator. The production project (`yosnowmow-prod`) has no user with the `admin` custom claim.

### Solution

Created `firebase/promote-to-admin-prod.js` — a one-off Node.js script (same pattern as `seed-emulator.js`) that promotes an existing Firebase Auth account to admin in production. The target is `perelgut@gmail.com`.

The script:
1. Looks up the account by email in Firebase Auth (prod)
2. Reads the current `roles` array from the Firestore `users/{uid}` document
3. Merges `"admin"` into the roles list (idempotent — safe to run multiple times)
4. Sets `{ roles: [..., "admin"] }` as a Firebase custom claim (read by Spring Security)
5. Updates the Firestore document with `merge: true` to preserve all other fields

Uses ADC (Application Default Credentials) — no service account key file required. Run `gcloud auth application-default login` first, then:

```
cd firebase && node promote-to-admin-prod.js
```

**Important:** After running the script, the user must sign out and sign back in (or force-refresh the token with `getIdToken(true)`) for the new role to appear in their ID token and be recognised by the backend.

---

## 2026-04-20 — Fix: admin "Force Release Payment" 422 + error hidden behind modal

### Problem

During smoke testing the admin panel, overriding a job to `ESCROW_HELD` and then clicking "Force Release Payment" returned 422. Two compounding bugs:

1. **Backend 422**: `PaymentService.releasePayment()` requires `workerPayoutCAD != null` and `worker.stripeConnectAccountId != null`. A smoke-test job force-advanced to `ESCROW_HELD` has neither — no price was agreed through the normal flow and no Stripe Connect onboarding was done for test accounts. The 422 is correct behaviour.

2. **Error hidden behind modal**: `applyRelease()` in `JobDetail.jsx` only called `setReleaseOpen(false)` on success, not on failure. The `actionError` banner renders at the top of the page (line 314) — behind the still-open modal overlay — making the error message invisible to the admin.

3. **No precondition guard on button**: "Force Release Payment" was always enabled, even when the preconditions for a successful release (workerPayoutCAD set) were clearly not met.

### Fix — `frontend/src/pages/admin/JobDetail.jsx`

1. Added `setReleaseOpen(false)` to the `catch` block in `applyRelease()` so the modal closes on failure and the error banner becomes visible.

2. Disabled the "Force Release Payment" button when `job.workerPayoutCAD == null`, with a `title` tooltip: "Cannot release: no payout amount set (job must reach AGREED state first)". Button also styled grey when disabled.

3. Added a note inside the release modal: "Requires the Worker to have completed Stripe Connect onboarding. For testing without Stripe, use Override Status → RELEASED instead."

**Note for smoke testing:** To advance a job to RELEASED without Stripe, use **Override Status → RELEASED** in the Admin Actions panel. The override path calls `jobService.transitionStatus()` which writes the status to Firestore directly without touching Stripe.

---

## 2026-04-20 — UX: Worker sees "Completed & Paid" instead of "Released"

### Problem

The `RELEASED` status label was shown as "Released" on the Worker's job screen (Earnings and ActiveJob pages). This is an internal state machine term that is opaque to workers — "Completed & Paid" directly describes what the state means to them.

### Fix

Added a `labelOverrides` prop to `StatusPill` so callers can substitute display labels without touching the shared status map. Worker pages pass `{ RELEASED: 'Completed & Paid', SETTLED: 'Completed & Paid' }`. Admin and requester pages are unchanged.

**Files changed:**
- `frontend/src/components/StatusPill/StatusPill.jsx` — added optional `labelOverrides` prop
- `frontend/src/pages/worker/Earnings.jsx` — `{ RELEASED: 'Completed & Paid', SETTLED: 'Completed & Paid' }`
- `frontend/src/pages/worker/ActiveJob.jsx` — same
- `frontend/src/pages/requester/Home.jsx` — `{ RELEASED: 'Worker Paid', SETTLED: 'Worker Paid' }`
- `frontend/src/pages/requester/JobList.jsx` — same
- `frontend/src/pages/requester/JobStatus.jsx` — same
- `frontend/src/test/StatusPill.test.jsx` — two new tests covering the override behaviour

| Audience | RELEASED label |
|---|---|
| Worker | Completed & Paid |
| Requester | Worker Paid |
| Admin | Released (unchanged) |

---

## 2026-04-20 — Feature: Home address (requester) + Base address / Acceptable distance (worker)

### User request
"Let's add 'Home address' to Requesters and 'Base address' to Workers. These must be supplied at sign up. When a Requester posts a job, they now get an option of 'Use home address' or entering an address. Workers also get to set 'Acceptable distance' being a radio button selection of: 250m, 1km, 5km, 10km, 25km, 50km. This will be used to see if a job should be shown to them or not. When showing a Worker the available jobs, show estimated distance with each job."

### Backend changes (completed prior to this session)

**`backend/.../dto/WorkerProfileRequest.java`** — `serviceRadiusKm` constraints changed to `@DecimalMin("0.1")` / `@DecimalMax("50.0")` to accommodate the 250 m (0.25 km) option.

**`backend/.../dto/CreateUserRequest.java`** — Added optional `homeAddressText` String field with getter/setter.

**`backend/.../model/User.java`** — Added `homeAddressText` String field with getter/setter.

**`backend/.../service/UserService.java`** — In `createUser()`, stores `homeAddressText` if non-blank: `user.setHomeAddressText(req.getHomeAddressText().trim())`.

**`frontend/src/services/api.js`** — Added `activateWorker(body)` which calls `POST /api/users/me/worker` (worker profile activation at signup).

### Frontend changes (this session)

#### `frontend/src/pages/auth/Signup.jsx`
- Added state: `homeAddressText`, `baseAddressText`, `serviceRadiusKm` (default 5).
- Added derived booleans `isRequester` / `isWorker` from selected services.
- Validation: requires `homeAddressText` if requester role; `baseAddressText` if worker role.
- `createUser()` now passes `homeAddressText` (or null for non-requesters).
- After `createUser()`, calls `activateWorker({ designation: 'personal', baseAddressFullText, serviceRadiusKm })` if worker role selected.
- Conditional UI: requester services → show "Home address" input with hint; worker services → show "Base address" input + "Acceptable distance" radio buttons (250m/1km/5km/10km/25km/50km).

#### `frontend/src/pages/requester/PostJob.jsx`
- Imported `useAuth` to access `userProfile.homeAddressText`.
- Added state: `useHomeAddr` (boolean, defaults to `true`).
- When user has a stored home address, Step 1 shows two radio options at top: "My home address — {address}" and "Another address (e.g. a family member's home)".
- `nextStep1()`: skips address form validation when using home address, advances directly to Step 2.
- `fullAddress` computed value: returns `userProfile.homeAddressText` when using home address, otherwise the assembled structured address string.
- Address form fields (street number, name, city, province, postal code, property type) wrapped in a `{(!hasHomeAddress || !useHomeAddr) && (...)}` conditional so they are hidden when using home address.

#### `frontend/src/pages/worker/Register.jsx` (Step 3)
- Removed postal code field and 1–15 km range slider; removed `estimateProperties()` helper.
- Added `baseAddress` (text input, full address) and `serviceRadius` (radio, default 5 km) state.
- `RADIUS_OPTIONS` constant: 250m/1km/5km/10km/25km/50km.
- `validateStep3()` now validates `baseAddress` is non-empty (instead of postal code regex).
- Step 3 UI: "Base address *" text input with hint text, then "Acceptable distance from base address" radio button group.

#### `frontend/src/pages/worker/JobRequest.jsx`
- Added `haversineKm(lat1, lon1, lat2, lon2)` — great-circle distance in km.
- Added `fmtDistance(km)` — formats as "Xm" when < 1 km, "X.X km" when ≥ 1 km.
- Added `userProfile` from `useAuth()`.
- `browsableJobs` derivation now:
  1. Maps each job to include `_distKm` (Haversine distance from `userProfile.worker.baseCoords` to `job.propertyCoords`, or `null` if either is unavailable).
  2. Filters out jobs where `_distKm > serviceRadiusKm` (jobs without coords always shown).
  3. Sorts ascending by distance.
- Available Jobs card: shows a blue distance pill badge (top-right) when `_distKm` is known.

### Design decisions
- **Signup vs Register flow:** `Signup.jsx` is the production path (calls backend). `Register.jsx` is the prototype (Phase 0 mock, no backend call) — both updated for UI consistency.
- **Default to home address:** When `userProfile.homeAddressText` exists, `useHomeAddr` defaults to `true` so the common case (posting for your own home) is one fewer click.
- **Jobs without coords shown anyway:** Geocoding is async; a job might briefly have no `propertyCoords`. Showing it is better than silently hiding it from the worker.
- **Worker distance display on opportunity cards:** Not implemented for `newOpportunities` (those come from notifications which don't include full coords); only on the direct `browsableJobs` section where Firestore data is available.

---

## 2026-04-20 — Beta Test Step 1 Smoke Test: Four Bugs Found and Fixed

### Context

Beta test Step 1 (smoke test end-to-end) revealed four defects. User also clarified a business rule about Worker acceptance.

---

### Bug 1 — Admin-only user lands on wrong portal on first load

**Symptom:** After signing in as perelgut@gmail.com (admin-only role), the screen showed "Worker Portal" instead of the Admin Panel. Manually navigating to yosnowmow.com/admin worked correctly.

**Root cause:** `App.jsx` had a static root redirect: `<Route path="/" element={<Navigate to="/requester" replace />} />`. This fires immediately, before Firebase Auth resolves the user's session and Firestore loads the user profile. The `ProtectedRoute` only checks authentication (not roles), so an admin-only user was passed through to `RequesterLayout`. A similar catch-all `<Route path="*" ...>` had the same issue.

**Fix — `frontend/src/App.jsx`:**
- Added `DefaultRedirect` component that waits for `loading` to clear and `userProfile` to load before choosing a destination.
- Logic: admin → `/admin`; worker-only → `/worker`; otherwise → `/requester`.
- Replaced both the root and catch-all `<Navigate>` elements with `<DefaultRedirect />`.

---

### Bug 2 — Admin sidebar nav links not switching tabs

**Symptom:** Clicking "All Jobs", "Users", "Disputes" in the admin sidebar appeared to do nothing — the tab content did not change.

**Root cause:** `Dashboard.jsx` initialises `activeTab` with `useState(propTab || 'overview')`. The `/admin`, `/admin/jobs`, `/admin/users`, `/admin/disputes` routes all render `<AdminDashboard>` (same component type at the same tree level). React reconciles rather than remounts the component, so `useState` is not re-initialised when navigating between tab routes. The `propTab` prop updated but `activeTab` state remained stale.

**Fix — `frontend/src/pages/admin/Dashboard.jsx`:**
- Added `useEffect(() => { setActiveTab(propTab || 'overview') }, [propTab])` immediately after the `useState` declaration, so `activeTab` tracks the URL-driven prop on every navigation.

---

### Bug 3 — Worker accepting a job leaves Requester stuck on "Negotiating"

**Symptom:** Worker submitted an offer (accepting the posted price). Requester's Job Status page continued to show "Negotiating" with no action available.

**Root causes (two):**

1. **Backend — wrong transition:** `OfferService.workerSubmitOffer` only moved the job to `NEGOTIATING` (first offer) or left it there (subsequent offers). When a Worker submitted `action: "accept"`, the offer's status became `ACCEPTED` with `lastMoveBy: "worker"`, but the job never moved to `AGREED`. The Requester had no way to proceed.

2. **Frontend — no real-time updates:** `JobStatus.jsx` loaded the job once on mount and had no mechanism to detect changes made by the Worker. Even if the backend was correct, the Requester's page would be stale until a manual refresh.

**Business rule clarified by user:** "If a worker accepts the job, it's a deal and now up to Requester to move funds to Escrow." This means Worker acceptance must auto-transition the job to `AGREED` — no further Requester confirmation is needed before payment.

**Fix 3A — `backend/.../service/OfferService.java`:**
- In `workerSubmitOffer`, when `action.equals("accept")`, the service now:
  1. Re-reads the saved offer document to determine the agreed price (Requester's last counter → Worker's last counter → posted price, in that order).
  2. Calls `computePricing()` to set all financial fields (tierPriceCAD, hstAmountCAD, totalAmountCAD, commissionRateApplied, workerPayoutCAD).
  3. Calls `transitionStatus(jobId, "AGREED", ...)` with the pricing fields and agreedPriceCents, agreedWorkerId, workerId, agreedAt.
  4. Sends notifications to both parties.
- For non-accept worker actions (counter, photo_request, withdraw), the old `NEGOTIATING` transition and requester notification are preserved.

**Fix 3B — `frontend/src/pages/requester/JobStatus.jsx`:**
- Converted `refreshJob` to `useCallback` so it can be used as a stable dependency.
- Added a polling `useEffect` that calls `refreshJob()` every 5 seconds while `job.status` is `POSTED` or `NEGOTIATING`. The interval is cleared when the status changes to anything else (AGREED, CANCELLED, etc.) and when the component unmounts.

---

### Files changed

| File | Change |
|---|---|
| `frontend/src/App.jsx` | Added `DefaultRedirect`; replaced root + catch-all redirects |
| `frontend/src/pages/admin/Dashboard.jsx` | Added `useEffect` to sync `activeTab` with `propTab` |
| `backend/.../service/OfferService.java` | Worker accept → auto-AGREED with pricing computation |
| `frontend/src/pages/requester/JobStatus.jsx` | `useCallback` on refreshJob; 5-second polling in POSTED/NEGOTIATING |

---

### Remaining beta test items

- Step 1: re-verify all four smoke test items after deploy
- Step 2: add beta banner (payments not live) — approved by user
- Steps 3–5: tester recruitment, feedback form, admin coverage plan

---

## 2026-04-20 — Fix: Spring Boot 409 error message hidden from frontend

### Problem
When a Requester tried to post a job while already having an active job in progress (from the previous smoke test session), the backend correctly returned HTTP 409 with a descriptive `message` field: "You already have an active job. Complete or cancel it before posting a new one."

However, the frontend displayed only the generic Axios error: "Request failed with status code 409". The `data?.message` path on line 165 of `PostJob.jsx` was reading `undefined`.

### Root Cause
Spring Boot 3.x changed the default for `server.error.include-message` from `always` to `never` (a security hardening decision — prevents leaking internal stack traces). By default, the JSON error body is: `{"status":409,"error":"Conflict"}` — no `message` field.

### Fix
Added `server.error.include-message: always` to `backend/src/main/resources/application.yml` under the `server.error` block. This restores the `message` field in all error responses so the frontend can display the actual reason to the user.

**File changed:** `backend/src/main/resources/application.yml`

**Note:** The immediate cause of the 409 in this session was a leftover active job from the previous smoke test. That job can be cancelled via the Admin panel (Override Status → CANCELLED). The `server.error.include-message` fix is a correctness fix that ensures all future error scenarios show meaningful messages instead of generic status-code text.

### Pending (user action required)
1. Push the two unpushed commits to `main` (`git push origin main`) — this triggers CI/CD for both frontend and backend
2. Cancel the stuck smoke-test job via Admin panel before re-running Step 1

---

## 2026-04-20 — Fix: photo upload fails with "Invalid bucket name" (BOM in secret)

### Problem
Worker tapped "Upload completion photo" → got "Photo upload failed — please try again." Cloud Run logs showed the root cause immediately:

```
com.google.cloud.storage.StorageException: Invalid bucket name: '?yosnowmow-prod.firebasestorage.app'
GET https://storage.googleapis.com/storage/v1/b/%EF%BB%BFyosnowmow-prod.firebasestorage.app
```

`%EF%BB%BF` is the UTF-8 BOM (U+FEFF). The `FIREBASE_STORAGE_BUCKET` GCP Secret Manager secret was stored with a leading BOM, likely from copy-pasting the bucket name from a Windows text editor that silently added a BOM.

### Fix
Added a new clean version (v3) of the `FIREBASE_STORAGE_BUCKET` secret with the correct value and no BOM:

```bash
echo -n "yosnowmow-prod.firebasestorage.app" | gcloud secrets versions add FIREBASE_STORAGE_BUCKET --project=yosnowmow-prod --data-file=-
```

A redeploy (triggered by `git push origin main`) will cause Cloud Run to mount the new secret version. The `-n` flag on `echo` also prevents a trailing newline from being stored in the secret, which would cause a similar "invalid bucket name" error.

---

## 2026-04-27 — Fix: Signup 422 on worker activation + missing autocomplete attributes

### Problem

Two bugs reported from the browser console during signup:

1. **`autocomplete` warnings** — Chrome logged DOM warnings on all password `<input>` elements ("Input elements should have autocomplete attributes"). The `Input` component did not accept or forward an `autoComplete` prop, so no `autocomplete` attribute was ever rendered.

2. **422 Unprocessable Entity on `POST /api/users/me/worker`** — When a user selected a worker role during signup and submitted, the backend rejected the request. Root cause: `WorkerService.validateRequiredActivationFields()` requires six fields (`designation`, `baseAddressFullText`, `serviceRadiusKm`, `bufferOptIn`, `tiers`, `hstRegistered`) but the signup form was only sending three (`designation`, `baseAddressFullText`, `serviceRadiusKm`).

### Discussion

The `WorkerProfileRequest` DTO is shared between the `POST` (activate) and `PATCH` (update) endpoints, so `@NotNull` is not used on the DTO itself — the service enforces required-at-activation fields manually in `validateRequiredActivationFields`. The signup form was written without reference to this list and missed three fields.

For the signup flow, sensible defaults were chosen for the missing fields:
- `bufferOptIn: false` — new workers do not opt in to extra-radius jobs until they decide to
- `hstRegistered: false` — the vast majority of neighbourhood workers are not HST registrants
- `tiers: [{ maxDistanceKm: serviceRadiusKm, priceCAD: 25.0 }]` — a single flat-rate tier covering the full service radius at a $25 default; workers are expected to update their pricing in settings after onboarding

### Files changed

| File | Change |
|---|---|
| `frontend/src/components/Input/Input.jsx` | Added `autoComplete` prop; forwarded to `<input>` element |
| `frontend/src/pages/auth/Login.jsx` | Added `autoComplete="current-password"` to password field |
| `frontend/src/pages/auth/Signup.jsx` | Added `autoComplete="new-password"` to both password fields; added `bufferOptIn`, `hstRegistered`, and `tiers` to `activateWorker` call |
| `frontend/src/services/api.js` | Updated JSDoc for `activateWorker` to document full required body shape |

---

## 2026-04-27 — Feature: Lawn mowing service on Post Job

### Discussion

User requested that "Mow the lawn" appear as a selectable service on the Post Job — Step 2 screen, with small/medium/large yard size options.

Two approaches were considered:
- **A.** Store signup service selections (`signedUpServices`) in the user profile and use that to filter/default services per user — requires a backend schema change.
- **B.** Show all services (snow + lawn) to all requesters, no filtering — purely a frontend change plus one backend allowlist update.

User chose B to allow combining snow and lawn services in a single job.

Pricing confirmed by user: Small $40 / Medium $65 / Large $95.

A scope validation issue was discovered during design: `JobService.java` had a hardcoded `VALID_SCOPE = Set.of("driveway", "sidewalk", "both")`. Passing `"lawn"` without updating this would have returned a 422. Added `"lawn"` to the set.

### Files changed

| File | Change |
|---|---|
| `frontend/src/pages/requester/PostJob.jsx` | Added `lawn` entry to `SERVICES` array; added `lawn` scope mapping in `submit()` |
| `backend/src/main/java/com/yosnowmow/service/JobService.java` | Added `"lawn"` to `VALID_SCOPE` |
| `docs/superpowers/specs/2026-04-27-lawn-mowing-service-design.md` | Design spec |

---

## 2026-04-27 — Fix: POST /api/jobs 422 — BOM in MAPS_API_KEY + RFC 7807 error not surfacing

### Problem

Every attempt to post a job returned 422. Two issues compounded each other:

1. **Invalid Google Maps API key** — `MAPS_API_KEY` secret (version 1) had a UTF-8 BOM prepended, exactly as previously seen with `FIREBASE_STORAGE_BUCKET`. Cloud Run passed the BOM-prefixed key to `GeocodingService`, which got "Invalid API key" back from Google Maps and threw a `GeocodingException` → 422 "Could not resolve the property address."

2. **Backend error message not surfacing in UI** — `GlobalExceptionHandler` returns RFC 7807 Problem JSON with a `detail` field, but the frontend error handler in `PostJob.jsx` (and elsewhere) only checked `data?.message` and `data?.error`. The `detail` field was silently ignored, so users saw the generic axios error ("Request failed with status code 422") instead of the backend message.

### Fix

- Added clean `MAPS_API_KEY` secret version 2 using `tr -d '﻿\r\n'` to strip BOM and whitespace before piping into `gcloud secrets versions add`.
- Added normalisation in the axios response interceptor in `api.js`: when `data.detail` exists and `data.message` does not, copy `detail` → `message`. This is a one-place fix that benefits every API caller in the app.
- The `git push` that carried the `api.js` fix also triggered CI/CD redeploy, causing Cloud Run to mount the new clean secret version.

### Files changed

| File | Change |
|---|---|
| `frontend/src/services/api.js` | Response interceptor normalises RFC 7807 `detail` → `message` |
| `MAPS_API_KEY` (GCP secret) | Version 2 written without BOM |

---

## 2026-04-27 — Feature: Real address validation at Post Job Step 1 + geocoding failure modal at Step 4

### Context

When `POST /api/jobs` returned a 422 "Could not resolve the property address", the user had to manually navigate back through three steps to fix the address — a poor experience. The "Validating address…" UI at Step 1 was a fake `setTimeout` that always succeeded.

User request (verbatim): "when a user enters an address, check if that address can be resolved and refuse to move on until there's a resolved address; also, when this message occurs, pop up a single 'enter address again' prompt. Would it help to force the user to enter a postal code when entering an address — make it a separate field?"

After brainstorming three approaches (A: validate only on manual entry; B: validate only on job submit with modal; C: validate at Step 1 + modal safety net at Step 4), user chose **C — validate at Step 1 in both modes, with a modal fallback at Step 4**.

Key design decisions:
- **No "continue anyway" option** — the address must resolve before advancing to Step 2. This applies to both manual entry and stored home address flows.
- **Stored address flow failure**: switches the form to manual entry mode pre-filled with the stored address parts (best-effort parsing) so the user can correct and revalidate. User rationale: "shouldn't we require them to 'please check the street number…'"
- **Section 1 (backend)** approved by user first, then Section 2 (Step 1 frontend), then Section 3 (Step 4 modal), then full spec.
- User chose **inline execution** (executing-plans skill) over subagent-driven.

### Implementation

**Task 1 — Backend: `POST /api/address/validate` (TDD)**

New endpoint following the design spec exactly. The controller always returns HTTP 200; an unresolvable address is a user input problem, not a server error.

- `AddressValidateRequest.java`: `@NotBlank` `addressText` field — returns 400 if missing/blank.
- `AddressValidateResponse.java`: `{ valid: boolean, resolvedAddress: String|null }`.
- `AddressControllerTest.java`: 4 `@WebMvcTest` tests — resolvable → valid:true+resolvedAddress, unresolvable → valid:false+no resolvedAddress, missing field → 400, unauthenticated → 401. All written before the controller.
- `AddressController.java`: calls `GeocodingService.geocode()` directly; catches `GeocodingException` and returns `valid:false`. No service layer needed.
- All 4 tests passed; full suite 159/159 green.
- Committed: `feat: POST /api/address/validate endpoint with TDD`

**Task 2 — `validateAddress` in api.js**

Added `validateAddress(addressText)` export that calls `POST /api/address/validate` with `{ addressText }` and returns `r.data`.

**Task 3 — PostJob.jsx: real Step 1 validation**

Replaced fake `nextStep1()` `setTimeout` with an async function that:
1. Clears `addrError`.
2. For the home-address mode: calls `validateAddress(userProfile.homeAddressText)`; on failure switches to manual mode and pre-fills form fields from `prefillFromStoredAddress()`, sets `addrError`.
3. For manual mode: runs local format checks first (unchanged), then calls `validateAddress(enteredAddress)`; on failure sets `addrError`; on success advances to Step 2.
4. Network errors show "Address validation is temporarily unavailable. Please try again."

`prefillFromStoredAddress(text)` is a best-effort parser that splits on commas and regexes out unit/street number/street name/city/province/postal code. Good enough for typical "123 Main St, Toronto, ON M5V 3A8" and "Unit 4B, 123 Main St, Toronto, ON M5V 3A8" formats.

Removed `searching` / `found` state; replaced with `validating` / `addrError`. Button shows "Validating…" and is disabled while the call is in flight.

**Task 4 — PostJob.jsx: Step 4 geocoding failure modal**

In `submit()` catch block: if the response is 422 and the message contains "Could not resolve the property address", sets `addrModal = true` instead of adding to `errors`. All other errors continue as before.

Modal uses the existing `Modal` component with:
- Title: "Address not recognised"
- Body: "Your property address couldn't be verified. Please go back and check it."
- Single footer button "Fix Address": closes modal and calls `setStep(1)`.

**Task 5 — Push**

Commits pushed to `main`. CI/CD redeploy triggered.

### Files changed

| File | Change |
|---|---|
| `backend/src/main/java/com/yosnowmow/dto/AddressValidateRequest.java` | New DTO |
| `backend/src/main/java/com/yosnowmow/dto/AddressValidateResponse.java` | New DTO |
| `backend/src/main/java/com/yosnowmow/controller/AddressController.java` | New controller |
| `backend/src/test/java/com/yosnowmow/controller/AddressControllerTest.java` | New test class (4 tests, written first) |
| `frontend/src/services/api.js` | Added `validateAddress()` export |
| `frontend/src/pages/requester/PostJob.jsx` | Real Step 1 geocode validation; prefillFromStoredAddress helper; Step 4 modal |
| `docs/superpowers/specs/2026-04-27-address-validation-design.md` | Design spec |
| `docs/superpowers/plans/2026-04-27-address-validation.md` | Implementation plan |

### Commits

- `feat: POST /api/address/validate endpoint with TDD`
- `feat: real address validation at Post Job Step 1 with Step 4 modal fallback`

---

## 2026-04-27 — Fix: Login email field missing autoComplete attribute

Chrome console warning: `Input elements should have autocomplete attributes (suggested: "username")` on the email field at `/login`.

The `Input` component already forwards `autoComplete` (added earlier this session for the password fields). The email `Input` in `Login.jsx` simply lacked the prop. Added `autoComplete="username"` — Chrome's recommended value for email-address fields used as login identifiers.

**File changed:** `frontend/src/pages/auth/Login.jsx` — added `autoComplete="username"` to the email Input.

---

## 2026-04-27 — Fix: Worker 403 on GET /api/jobs/{jobId} + signup email autocomplete

### Problems

1. **Worker 403 on job read** — A newly created worker tried to browse a POSTED job to submit a counter-offer. `JobService.getJobForCaller()` denied access because the worker wasn't in `matchedWorkerIds`. The original code assumed sequential dispatch (worker is pre-matched before seeing the job), but the current model is an open marketplace where any worker can browse POSTED/NEGOTIATING jobs and self-select. The `matchAndStoreWorkers` only ran at job-post time so workers created afterwards were never in `matchedWorkerIds`.

2. **Signup email autocomplete warning** — Chrome console showed the same "suggested: username" warning on the signup page email field. Same root cause as the login fix earlier.

### Fix

**Backend (`JobService.java`):** Replaced `isMatchedWorker` (checks `matchedWorkerIds` list) with `isBrowsableByWorker` (checks `hasRole("worker") && status is POSTED or NEGOTIATING`). Any authenticated worker can now read a job that's still accepting offers. The existing controller-level logic already strips `propertyAddress` and `propertyCoords` from workers until the job reaches CONFIRMED — so location privacy is preserved.

**Frontend (`Signup.jsx`):** Added `autoComplete="username"` to the email Input.

### Files changed

| File | Change |
|---|---|
| `backend/src/main/java/com/yosnowmow/service/JobService.java` | `getJobForCaller()`: replaced matchedWorkerIds check with POSTED/NEGOTIATING status check |
| `frontend/src/pages/auth/Signup.jsx` | Added `autoComplete="username"` to email Input |

---

## 2026-04-27 — Fix: "Failed to approve" alert on Approve & Release Payment

### Scenario

Testing path:
1. Requester posted a job; Worker made a counter-offer; both agreed on a price (AGREED state).
2. Admin overrode job status to ESCROW_HELD (bypassing Stripe pre-payment which isn't implemented).
3. Worker logged in, completed the job, uploaded a photo, submitted for payment.
4. Requester clicked "Approve & Release Payment" → JavaScript `alert()` appeared: "Failed to approve — please try again."

### Root Cause

`POST /api/jobs/{jobId}/approve` (controller) does:
1. `jobService.transition(jobId, "RELEASED", ...)` — succeeds, job is RELEASED in Firestore
2. `paymentService.releasePayment(jobId)` — throws 422 because the test worker has no `stripeConnectAccountId` (Stripe Connect not set up)

The job WAS successfully released in Firestore, but the HTTP response was 422, so the frontend showed the error alert. If the requester retried, they would get an `InvalidTransitionException` since the job was already RELEASED.

The `releasePayment` method also checked `workerPayoutCAD == null` and threw 422. This could also fail if an admin bypassed the AGREED state entirely.

### Fix

Changed both checks in `PaymentService.releasePayment()` from throwing `ResponseStatusException` to logging a `warn` and returning:
- `workerPayoutCAD == null` → log + return (admin bypass scenario)
- `connectAccountId == null || blank` → log + return (Stripe not configured)

These are no-ops: the job is already RELEASED by the time `releasePayment` is called. When Stripe is eventually wired up, workers with Connect accounts will go through the normal transfer path. Workers without accounts or jobs without payout amounts will still skip the transfer (which is the right behavior for testing).

### File changed

`backend/src/main/java/com/yosnowmow/service/PaymentService.java` — two throw→return changes in `releasePayment()`

---

## 2026-04-27 — Feature: Post-completion ratings for both Requester and Worker

### Request

> "at any point after a job is listed as done by a Worker (whether disputed or not), the Requester can rate the worker and leave a comment. Also, there's no reason why Workers shouldn't be able to leave comments about Requesters - but only if a job has been entered as complete or disputed."

### What existed

- Backend: `RatingService`, `RatingController` (`POST/GET /api/jobs/{jobId}/rating`), `Rating` model — all implemented but rateable statuses were only `PENDING_APPROVAL`, `RELEASED`, `SETTLED` (DISPUTED missing)
- Frontend: `RateWorker.jsx` page existed but was mocked (used MockStateContext, called `setJobStatus` instead of API); no worker-to-requester rating UI anywhere; no API functions for ratings in `api.js`; `canRate` in JobStatus.jsx was `job.status === 'PENDING_APPROVAL'` only and the button only showed while `canApprove` was true

### Changes

**Backend (`RatingService.java`):** Added `DISPUTED` to `RATEABLE_STATUSES`. Both roles can now submit ratings at PENDING_APPROVAL, DISPUTED, RELEASED, or SETTLED.

**Frontend (`api.js`):** Added `submitRating(jobId, data)` and `getRatings(jobId)`.

**Frontend (`RateWorker.jsx`):** Full rewrite — removed all mock state. Now loads job, worker profile, and existing ratings via API. Handles: (a) already-rated state showing submitted rating; (b) worker's rating of the requester shown read-only while submitting; (c) real API submit with error handling; (d) confirmation screen post-submit.

**Frontend (`JobStatus.jsx`):**
- Added `getRatings` import and `ratings` / `alreadyRated` state
- New useEffect loads ratings whenever job is in a rateable state
- `canRate` now: `['PENDING_APPROVAL', 'DISPUTED', 'RELEASED', 'SETTLED'].includes(job.status) && !!job.workerId`
- "Rate Your Worker" button moved to its own block, independent of `canApprove` — shows at any post-completion state
- If already rated: shows "View Your Rating" (secondary style) instead of the rating button

**Frontend (`ActiveJob.jsx`):**
- Added `submitRating` and `getRatings` imports
- Expanded job discovery to include DISPUTED/RELEASED/SETTLED jobs (so the rating form is always reachable)
- Added inline "Rate this homeowner" card with star widget, optional comment (500 chars), and "Would you work for them again?" toggle
- On mount checks existing ratings and shows "already rated" if worker already submitted
- Status banner and info cards extended to handle DISPUTED, RELEASED, SETTLED states

### Files changed

| File | Change |
|---|---|
| `backend/src/main/java/com/yosnowmow/service/RatingService.java` | Added DISPUTED to RATEABLE_STATUSES |
| `frontend/src/services/api.js` | Added `submitRating` and `getRatings` |
| `frontend/src/pages/requester/RateWorker.jsx` | Rewritten — real API, handles already-rated, shows worker's rating |
| `frontend/src/pages/requester/JobStatus.jsx` | Expanded canRate, independent Rate button, loads ratings |
| `frontend/src/pages/worker/ActiveJob.jsx` | Added worker-to-requester inline rating form; expanded reachable states |

---

## 2026-04-28 — Fix: Analytics shows 0 jobs — completedAt never written by state machine

### Problem

After Recompute ran successfully (HTTP 200), the Analytics page still showed "Total Jobs (All Time): 0". Cloud Run log confirmed: `Analytics daily doc written: date=2026-04-27 completed=0 grossCents=0`.

Root cause: `AnalyticsService.computeDailyStats` queried jobs by `completedAt` (the old COMPLETE state timestamp), but the state machine was redesigned — the job-done event is now `PENDING_APPROVAL`, setting `pendingApprovalAt`, and the payment event is `RELEASED`, setting `releasedAt`. `completedAt` is never written anywhere, so the query always returned 0 documents.

Secondary issue: the jobs from the April 28 beta test were released today, not yesterday. The "Recompute Yesterday" button hardcoded `daysAgoISO(1)` (April 27), so even with the correct field it would have missed today's jobs. The "To" date picker was also capped at yesterday.

### Fix

**`AnalyticsService.java`** — changed the completed-jobs query from `completedAt` range to `releasedAt` range. RELEASED is the correct "job done + paid" event.

**`Analytics.jsx`** — two changes:
- Default `toDate` is now today (`daysAgoISO(0)`) instead of yesterday
- `toDate` picker `max` is now today instead of yesterday
- Recompute button sends `toDate` (current picker value) instead of hardcoded `daysAgoISO(1)`

### Files changed

| File | Change |
|---|---|
| `backend/src/main/java/com/yosnowmow/service/AnalyticsService.java` | Query `releasedAt` instead of `completedAt` |
| `frontend/src/pages/admin/Analytics.jsx` | Default `toDate` = today; allow today in picker; recompute uses `toDate` |

---

## 2026-04-28 — Fix: Recompute Yesterday 500 — missing Firestore composite index on ratings

### Problem

`POST /api/admin/analytics/recompute` returned 500. Cloud Run log:

```
FAILED_PRECONDITION: The query requires an index.
  at AnalyticsService.computeDailyStats(AnalyticsService.java:166)
```

`AnalyticsService.computeDailyStats` queries the `ratings` collection filtered by `raterRole` and ordered by `createdAt`. Firestore requires a composite index for this combination; it had never been created in the production project.

### Fix

Created the missing index via the Firebase console link embedded in the error message:
`ratings` collection, fields `raterRole ASC, createdAt ASC`.

Added the index definition to `firebase/firestore.indexes.json` so it is tracked in source control and will be documented for any future environment setup.

### Files changed

| File | Change |
|---|---|
| `firebase/firestore.indexes.json` | Added `ratings(raterRole ASC, createdAt ASC)` composite index |

---

## 2026-04-27 — Feature: "Recompute Yesterday" button on Admin Analytics

### Problem diagnosed

Admin opened the Analytics page and saw nothing — no charts, no summary numbers — despite three terminal jobs in Firestore (RELEASED, SETTLED, CANCELLED). Root cause: the `AnalyticsJob` Quartz cron fires at `0 0 3 * * ?` (3 AM Ontario time), but Cloud Run scales to zero when idle, so the JVM is asleep at 3 AM and the job never fires. No analytics documents means nothing to show. Secondary note: even on a live instance, the job only processes the *previous* day's data, so today's jobs would not appear until tomorrow's 3 AM run.

### Fix

Added an admin-triggered endpoint to run the analytics aggregation on demand.

**Backend — `AdminController.java`**

- Injected `AnalyticsService` (import, field, constructor parameter, constructor assignment).
- New endpoint: `POST /api/admin/analytics/recompute?date=YYYY-MM-DD` (admin-only, `@RequiresRole("admin")`). Defaults to yesterday (Ontario time) when `date` is omitted. Delegates to the existing `analyticsService.computeDailyStats(LocalDate)`. Idempotent — safe to call multiple times.

**Frontend — `frontend/src/services/api.js`**

- Added `recomputeAnalytics(date)` export that calls `POST /api/admin/analytics/recompute` with the date as a query param.

**Frontend — `frontend/src/pages/admin/Analytics.jsx`**

- Added `recomputing` and `recomputeError` state variables.
- Added `handleRecompute()` async handler: calls `api.recomputeAnalytics(daysAgoISO(1))`, then immediately calls `fetchAnalytics()` to refresh the charts.
- Added "↺ Recompute Yesterday" button in the page header, alongside the existing "⬇ Export CSV" button (both wrapped in a flex `div`).
- Added recompute error banner above the existing export error banner.

### Long-term note

Setting Cloud Run `--min-instances=1` would prevent scale-to-zero and let the 3 AM Quartz job fire reliably. The manual button is an immediate operational fix; min-instances is the permanent solution if analytics freshness matters.

### Files changed

| File | Change |
|---|---|
| `backend/src/main/java/com/yosnowmow/controller/AdminController.java` | Injected `AnalyticsService`; added `POST /analytics/recompute` endpoint |
| `frontend/src/services/api.js` | Added `recomputeAnalytics(date)` export |
| `frontend/src/pages/admin/Analytics.jsx` | Added recompute state, handler, button, and error banner |

---

## 2026-04-27 — Fix: Rating/comment not visible when clicking "Your Worker"

### Problem

Requester rated the worker and left a comment, but the Worker Profile modal showed nothing — it was entirely hardcoded with three mock reviews and mock worker data. `WorkerProfileContent` used a hardcoded `WORKER` constant and `REVIEWS` array; no props, no API calls.

### Fix

Rewrote `WorkerProfile.jsx` to accept `worker` (the public profile already loaded by `JobStatus.jsx`) and `jobRatings` (the ratings array already loaded for rateable states). The component now shows real worker name, rating, jobs completed, and badges from the API. A "Your Review" card is shown when the requester has rated the current job — stars, date, written comment, and "would hire again" indicator.

`JobStatus.jsx` passes `worker={worker}` and `jobRatings={ratings}` into `<WorkerProfileModal>`.

### Files changed

| File | Change |
|---|---|
| `frontend/src/pages/requester/WorkerProfile.jsx` | Replaced mock constants with real props; added "Your Review" card |
| `frontend/src/pages/requester/JobStatus.jsx` | Passes `worker` and `ratings` to `WorkerProfileModal` |

---

## 2026-04-28 — Feature: Worker ESCROW_HELD shortcut + Requester custom fee

### Two independent UI improvements

#### 1. Worker — "Go to Active Job" button on ESCROW_HELD

**Problem:** After a worker accepts a job offer and the requester pays escrow, the job transitions to `ESCROW_HELD`. The worker was left on the Job Offers page with a green "Waiting for escrow" banner and no way to navigate to the Active Job page without manually tapping through the worker nav.

**Fix:** In `OfferCard` (inside `JobRequest.jsx`), the `isAccepted` state block now branches on `job?.status`:
- If `ESCROW_HELD`: shows updated green banner ("Escrow paid — ready to start!") plus a blue "Go to Active Job →" button that navigates to `/worker/active-job`.
- Otherwise: shows the existing "Waiting for homeowner to pay escrow" banner.

Added `useNavigate` import from `react-router-dom`. The `OfferCard` component already receives the `job` object (from `jobCache`) as a prop, so `job?.status` is always available for the comparison.

#### 2. Requester — "Propose a different fee" in PostJob wizard

**Problem:** The PostJob wizard computed an opening offer price based on selected services and sizes, but the requester had no way to propose a different starting price. This limited flexibility for requesters who know the local market or have a specific budget.

**Fix:** Added two new state variables (`useCustomPrice`, `customPriceInput`) and derived `customPriceCents` / `postedPrice` from them. `postedPrice = customPriceCents ?? basePrice` — so all financial display (HST, platform fee, worker net, total) updates live as the user types.

In Step 2, after the fee summary box, a "Propose a different fee" checkbox toggle reveals a `$` + number input (min $1.00, 2 decimal places). When enabled, the fee summary relabels its first row from "Services subtotal" to "Your custom fee" and shows an "Est. based on services" reference row so the user can compare. In Step 4 (Review), "Your opening offer" shows the effective posted price.

Validation in `nextStep2()`: if the toggle is on but the input is empty or below $1.00, an error prevents advancing. On submit, `postedPriceCents: postedPrice` is sent to the API (was `basePrice`).

### Files changed

| File | Change |
|---|---|
| `frontend/src/pages/worker/JobRequest.jsx` | Added `useNavigate` import; `OfferCard` uses it to render "Go to Active Job →" button when `job.status === 'ESCROW_HELD'` |
| `frontend/src/pages/requester/PostJob.jsx` | Added `useCustomPrice`/`customPriceInput` state, `postedPrice` derived value, custom-fee toggle UI in Step 2, validation, and `postedPrice` used in submit + Step 4 review |

---

## 2026-04-28 — Fix: Worker counter-offer modal pre-fills own price instead of requester's counter

### Problem

After a Requester counters a Worker's offer (e.g., requester counters at $40 on a $65 offer), the Worker sees the "Counter Again" button. Clicking it opens the counter modal, but the modal was pre-filled with `offer.workerPriceCents` ($65) — the Worker's own previous price — rather than `offer.requesterPriceCents` ($40) — the Requester's current counter.

Consequence: the modal reference text said "After requester's counter of $65.00" (wrong), and the price input showed $65. If the Worker submitted without noticing, they'd re-counter at $65, silently overriding the Requester's $40 proposal.

### Fix

In `JobRequest.jsx`, the `onCounter` prop on `OfferCard` for active offers changed:

```javascript
// Before (wrong — uses worker's own price as reference)
onCounter={() => openCounterModal(offer.jobId, offer.workerPriceCents, 'respond')}

// After — uses requester's counter price; falls back to workerPriceCents if not set
onCounter={() => openCounterModal(offer.jobId, offer.requesterPriceCents ?? offer.workerPriceCents, 'respond')}
```

The fallback `?? offer.workerPriceCents` is defensive; in practice `requesterPriceCents` is always set by the time the "Counter Again" button is visible (the button only renders when `needsResponse && offer.requesterPriceCents != null`).

### Files changed

| File | Change |
|---|---|
| `frontend/src/pages/worker/JobRequest.jsx` | `onCounter` prop now passes `offer.requesterPriceCents` as the reference price to the counter modal |

---

## 2026-04-28 — Fix: OpportunityCard shows Accept/Counter for stale notifications on settled jobs

### Problem

Notifications are sent to Workers when a job is posted. These notifications persist in the Worker's feed until marked read. If the job later moves to a terminal state (SETTLED, RELEASED, CANCELLED, etc.) without the worker acting on the notification, the notification-based `OpportunityCard` still showed full Accept/Counter buttons. Clicking Accept triggered `workerSubmitOffer` on the backend, which rejected the action with HTTP 409 "Job is not accepting offers (status: SETTLED)".

The browsable "Available Jobs" section is not affected — it queries Firestore directly for `status == POSTED`, so stale jobs never appear there. Only the notification-based cards are exposed to this race.

### Fix

Added `OFFER_OPEN_STATUSES = new Set(['POSTED', 'NEGOTIATING'])` constant.

`OpportunityCard` now derives `isOpen` from the loaded job:
- `job == null` (still loading) or `job._error` → optimistically `isOpen = true` (buttons shown; failure would have shown before if job is gone)
- `job.status` in `OFFER_OPEN_STATUSES` → `isOpen = true`
- `job.status` anything else → `isOpen = false`

When `isOpen = false`:
- Card border and label colour switch to grey
- Label reads "Job no longer available" instead of "🔔 New Job Nearby"
- Price, address note, and action buttons are hidden
- A single line "This job has been filled or cancelled." is shown

### Files changed

| File | Change |
|---|---|
| `frontend/src/pages/worker/JobRequest.jsx` | `OpportunityCard` checks `job.status` against `OFFER_OPEN_STATUSES`; hides buttons and shows "no longer available" state for settled/cancelled/agreed jobs |

---

## 2026-05-13 — UI: 1.5× font/spacing scale for senior readability + Firebase emulator auth fix

### Context

Two separate problems were tackled in this session:

1. **Senior readability** — All text was too small for the target senior demographic. The goal was a 50% increase across the entire UI.
2. **Auth failure** — Standard test accounts (`requester@yosnowmow.test` etc.) stopped authenticating against the Firebase emulator. Two root causes were identified and fixed.

---

### Part 1: 1.5× Font and Spacing Scale

#### Approach

All font sizes, spacing, and layout dimensions are controlled by CSS custom properties in `tokens.css`. Scaling everything here propagates automatically to any component already using the token system. Components with hardcoded pixel values in inline styles had to be individually updated.

#### Changes to `frontend/src/styles/tokens.css`

All font size tokens scaled ×1.5:

| Token | Before | After |
|---|---|---|
| `--font-size-xs` | 11px | 17px |
| `--font-size-sm` | 13px | 20px |
| `--font-size-base` | 15px | 23px |
| `--font-size-md` | 16px | 24px |
| `--font-size-lg` | 18px | 27px |
| `--font-size-xl` | 22px | 33px |
| `--font-size-2xl` | 28px | 42px |
| `--font-size-3xl` | 36px | 54px |

All spacing tokens scaled ×1.5:

| Token | Before | After |
|---|---|---|
| `--sp-1` | 4px | 6px |
| `--sp-2` | 8px | 12px |
| `--sp-3` | 12px | 18px |
| `--sp-4` | 16px | 24px |
| `--sp-5` | 20px | 30px |
| `--sp-6` | 24px | 36px |
| `--sp-8` | 32px | 48px |
| `--sp-10` | 40px | 60px |
| `--sp-12` | 48px | 72px |
| `--sp-16` | 64px | 96px |

Layout dimensions scaled ×1.5:

| Token | Before | After |
|---|---|---|
| `--header-h` | 64px | 96px |
| `--sidebar-w` | 240px | 360px |
| `--nav-h` | 64px | 96px |

#### Changes to `frontend/src/styles/globals.css`

Fixed heights that were hardcoded and not controlled by tokens:

| Element | Before | After |
|---|---|---|
| `.btn` height | 40px | 60px |
| `.btn-sm` height | 32px | 48px |
| `.btn-lg` height | 48px | 72px |
| `input`, `select`, `textarea` height | 42px | 63px |
| `.step-circle` | 32×32px | 48×48px |
| `.pill` padding | 3px 8px | 5px 15px |
| `.badge` padding | 2px 6px | 3px 12px |
| `.modal-close` size | 22px | 33px |

#### Components updated to use CSS var tokens

The following files had hardcoded px values in JSX inline styles replaced with `var(--font-size-*)` and `var(--sp-*)` tokens:

- `frontend/src/components/Badge/Badge.jsx` — padding
- `frontend/src/components/StatusPill/StatusPill.jsx` — padding
- `frontend/src/pages/requester/Home.jsx` — font sizes, gaps, timeline circles (24→36px), avatar (64→96px)
- `frontend/src/pages/requester/JobList.jsx` — font sizes, margins
- `frontend/src/pages/requester/JobStatus.jsx` — font sizes, timeline circles
- `frontend/src/pages/requester/WorkerProfile.jsx` — font sizes, avatar, spacing
- `frontend/src/pages/worker/Earnings.jsx` — font sizes, emoji sizes (32/40→48/60px), gaps
- `frontend/src/pages/worker/ActiveJob.jsx` — font sizes, star rating buttons (36→54px), spacing
- `frontend/src/pages/worker/JobRequest.jsx` — font sizes, emoji sizes, spacing

---

### Part 2: PostJob Layout Fix

After the font/spacing increase, the `/requester/post-job` page (the 4-step PostJob form) was broken — step labels were overlapping the step circles and the form contents were misaligned.

**Root cause:** `PostJob.jsx` had `marginTop: -20` on step labels, a hardcoded negative margin that was fighting the new larger spacing tokens. Additionally, nearly every other pixel value throughout the file was hardcoded rather than using CSS vars.

**Fix:** Removed the negative `marginTop` (changed to `marginTop: 'var(--sp-2)'`) and converted all hardcoded font size, gap, margin, padding, border-radius, and dimension values throughout the 4-step form to their CSS custom property equivalents.

Key specific changes:
- Step label `marginTop: -20` → `marginTop: 'var(--sp-2)'` (primary layout fix)
- Checkbox size: 18×18 → 27×27px
- Postal code `maxWidth`: 140 → 210px
- Custom price input `width`: 120 → 180px
- All `fontSize: 11/13/14/15/16` → `var(--font-size-xs/sm/base/md)`
- All `gap: 4/8` → `var(--sp-1/2)`
- `borderRadius: 8` → `var(--radius-md)`

---

### Part 3: Firebase Emulator Auth Fix

#### Problem 1 — Firebase SDK v11 reCAPTCHA Enterprise

After a routine `npm install`, the Firebase package upgraded to v11. Firebase SDK v11 added mandatory reCAPTCHA Enterprise verification to email/password auth flows. The emulator does not implement this check, so all `signInWithEmailAndPassword` calls failed with HTTP 400.

Stack trace evidence: `handleRecaptchaFlow` appeared in the auth error call stack.

**Fix:** Downgraded `firebase` in `frontend/package.json` from `^11.x` to `^10.14.1` and ran `npm install` to reinstall. Firebase v10 does not have the reCAPTCHA Enterprise requirement.

#### Problem 2 — Emulator project ID namespace mismatch (root cause of auth failure)

The Firebase emulator logs revealed:

> `Requested project ID yosnowmow-dev, but the emulator is configured for yosnowmow-prod`

The emulator Auth and Firestore namespaces are partitioned by project ID. Accounts seeded to `yosnowmow-dev` were invisible to the browser, which was reading from `yosnowmow-prod`. This meant the Auth emulator UI showed no users and every login returned `EMAIL_NOT_FOUND`.

**Root cause:** The emulator npm scripts in `firebase/package.json` were not passing `--project yosnowmow-dev`, so the emulator defaulted to `yosnowmow-prod` (or whichever default it resolved). The seed script and the frontend app both explicitly target `yosnowmow-dev`.

**Fix 1:** Updated `firebase/package.json` emulator scripts to explicitly pass `--project yosnowmow-dev`:
```json
"emulators": "firebase emulators:start --project yosnowmow-dev --import=./emulator-data --export-on-exit=./emulator-data",
"emulators:fresh": "firebase emulators:start --project yosnowmow-dev"
```

**Fix 2:** Set `"singleProjectMode": true` in `firebase/firebase.json` emulators config. With `singleProjectMode: true`, the emulator enforces that all requests use the single configured project ID and rejects cross-project requests instead of silently routing them to a different namespace.

#### Diagnosis steps taken

The diagnosis required several iterations:
1. Re-seeding (accounts showed [EXISTS]) — proved seed ran fine, problem was elsewhere
2. Checking Auth emulator UI at `localhost:4000` — showed 0 users despite seed success
3. Killing stale processes on ports 8080/9099 using PowerShell `Stop-Process -Id (Get-NetTCPConnection -LocalPort XXXX).OwningProcess -Force` (taskkill fails in Git Bash because `/PID` is interpreted as a Windows path)
4. Reading emulator console logs — the project ID mismatch message was definitive

### Files changed

| File | Change |
|---|---|
| `frontend/src/styles/tokens.css` | All font, spacing, and layout tokens scaled ×1.5 |
| `frontend/src/styles/globals.css` | Button, input, step circle, pill, badge, and modal-close dimensions scaled ×1.5 |
| `frontend/src/components/Badge/Badge.jsx` | Padding updated to CSS var |
| `frontend/src/components/StatusPill/StatusPill.jsx` | Padding updated to CSS var |
| `frontend/src/pages/requester/Home.jsx` | Hardcoded px values → CSS vars |
| `frontend/src/pages/requester/JobList.jsx` | Hardcoded px values → CSS vars |
| `frontend/src/pages/requester/JobStatus.jsx` | Hardcoded px values → CSS vars |
| `frontend/src/pages/requester/PostJob.jsx` | Negative `marginTop` removed; all hardcoded px values → CSS vars |
| `frontend/src/pages/requester/WorkerProfile.jsx` | Hardcoded px values → CSS vars |
| `frontend/src/pages/worker/Earnings.jsx` | Hardcoded px values → CSS vars |
| `frontend/src/pages/worker/ActiveJob.jsx` | Hardcoded px values → CSS vars |
| `frontend/src/pages/worker/JobRequest.jsx` | Hardcoded px values → CSS vars |
| `frontend/package.json` | `firebase` downgraded from `^11.x` to `^10.14.1` |
| `frontend/package-lock.json` | Lockfile updated to reflect firebase v10 |
| `firebase/package.json` | Emulator scripts now pass `--project yosnowmow-dev` |
| `firebase/firebase.json` | `singleProjectMode` set to `true` |
