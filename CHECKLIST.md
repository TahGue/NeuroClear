# NeuroClear Platform — Checklist & Roadmap

## Work Completed (This Iteration)

### Security / Access Control

- [x] Enforced role-based routing via `middleware.ts`
- [x] Ensured **PATIENT** users are restricted to:
  - `/portal`
  - `/portal/tests`
  - `/portal/tests/[slug]`
- [x] Ensured non-patient users are redirected away from `/portal` to `/`
- [x] Hardened JWT decoding in middleware by using `NEXTAUTH_SECRET`

### Server-Side Authorization (Defense in Depth)

- [x] Protected staff-only Server Actions in `src/app/actions.ts` (patients cannot create/assign evaluations or generate reports)
- [x] Added Zod validation for Server Action inputs in `src/app/actions.ts`
- [x] Protected patient portal Server Actions in `src/app/portal/tests/actions.ts`:
  - [x] Requires authenticated **PATIENT** session
  - [x] Verifies the current patient owns the `InstrumentSession` before writes
  - [x] Prevents writes after session submission (server-side)
  - [x] Syncs `InstrumentAssignment` status with portal progress (ASSIGNED → IN_PROGRESS → SUBMITTED)

### Instruments / Portal Tests

- [x] Added age-bounded patient instruments (`minAgeYears`, `maxAgeYears`) and `audience`
- [x] Added `InstrumentAssignment` model to track staff-assigned portal tests
- [x] Patient portal `/portal/tests` shows:
  - [x] Assigned tests
  - [x] Available tests filtered by patient age
- [x] Staff can assign portal tests from patient detail page
- [x] Staff assignment API creates an initial `InstrumentSession` if none exists

### Automated Testing

- [x] Playwright global setup seeds DB + generates staff/patient auth states
- [x] Playwright e2e coverage:
  - [x] RBAC redirects (patient vs staff)
  - [x] Portal tests page shows assigned tests

### Quality Gates

- [x] ESLint clean (`npm run lint`)
- [x] Production build clean (`npm run build`)

### Documentation

- [x] Updated `README.md`:
  - Docker Postgres dev instructions (port `5434`)
  - Required env vars (`DATABASE_URL`, `NEXTAUTH_SECRET`)
  - Optional seeding (`npx tsx prisma/seed.ts`) with sample credentials
  - Role access summary

---

## Product / Feature Roadmap (Suggested)

### Priority 0 — Core Stability & UX Baseline

#### Global UX

- [ ] **Unified layouts**
  - [ ] Staff layout (dashboard sidebar/header)
  - [ ] Patient layout (portal navigation)
- [ ] **Loading / empty / error states**
  - [ ] Consistent skeletons for tables and cards
  - [ ] Standard empty states for no patients / no reports / no sessions
- [ ] **Toast notifications** instead of `alert()` (save success/failure, validation, etc.)
- [ ] **Form validation**
  - [ ] Zod + inline errors on client forms (login, score entry, etc.)

#### Navigation

- [ ] Patient portal “home” that clearly shows:
  - [ ] assigned tests
  - [ ] completed tests + results
  - [ ] evaluation/report availability

---

### Priority 1 — Test Library by Age Group (Patient-Facing)

#### Age Groups (recommended)

- **Child (6–12)**
- **Adolescent (13–17)**
- **Adult (18–64)**
- **Older Adult (65+)**

#### Core Screeners (examples per group)

##### Child (6–12)

- [x] **SDQ (Parent/Teacher forms)** (sample short form)
- [x] **SCARED (child/parent)**
- [x] **Vanderbilt ADHD scales**
- [x] **CBCL/YSR** (if licensing/availability allows)

##### Adolescent (13–17)

- [x] **PHQ-A** (adolescent depression) (sample short form)
- [x] **GAD-7** (already present)
- [x] **SCARED**
- [x] **CRAFFT** (substance use)

##### Adult (18–64)

- [x] **PHQ-9** (already present)
- [x] **GAD-7** (already present)
- [x] **AUDIT** (already present)
- [x] **ASRS v1.1** (adult ADHD) (sample short form)
- [x] **PCL-5** (PTSD)

##### Older Adult (65+)

- [x] **GDS-15 / GDS-30** (geriatric depression) (sample short form)
- [x] **MoCA / MMSE** (screening; requires careful handling + licensing considerations)
- [x] **GAD-7**

#### Test UX requirements

- [x] **Adaptive presentation** by age group:
  - [x] only show applicable tests
  - [ ] language level adjustments for pediatric vs adult
- [ ] **Accessibility**
  - [ ] large text option
  - [ ] keyboard navigation
  - [ ] clear progress indication
- [ ] **Session behavior**
  - [x] autosave per answer (already partly implemented)
  - [x] resume where left off
  - [x] prevent editing after submission (server enforced)

---

### Priority 2 — Staff Workflows

#### Assignment & Scheduling

- [x] Assign patient portal tests to a patient (instrument sessions created ahead of time)
- [x] Due dates + reminders (due date supported on assignment)
- [x] Staff view of patient completion status

#### Scoring & Interpretation

- [ ] Improve scoring rules engine:
  - [ ] per-instrument scoring algorithm
  - [ ] norm references (if available)
  - [ ] interpretation bands

#### Reporting

- [ ] Report builder improvements:
  - [ ] editable narrative sections
  - [ ] clinician signature + timestamp
  - [ ] export to PDF

---

## Technical Enhancements

### Authorization Hardening

- [ ] Add a reusable RBAC helper (e.g., `lib/rbac.ts`) for:
  - [ ] staff-only checks
  - [ ] patient-only checks
  - [ ] resource ownership checks

### Data Model

- [x] Model “Assigned Instruments” explicitly:
  - [x] `InstrumentAssignment` (patientId, instrumentId, assignedBy, dueDate, status)

### Testing

- [ ] Unit tests for scoring (Vitest)
- [ ] Integration tests for RBAC (Playwright):
  - [x] PATIENT cannot load `/`
  - [ ] PATIENT cannot invoke staff actions
  - [x] Staff cannot access `/portal`

---

## UI / Design Wishlist

- [ ] Patient portal visual polish:
  - [ ] “My tests” dashboard
  - [ ] clear cards for Active vs Completed
  - [ ] result visualization (simple charts)
- [ ] Staff dashboard:
  - [ ] filters + quick actions
  - [ ] better data viz for platform/domain distributions
- [ ] Consistent component patterns:
  - [ ] table toolbar components (search, filter, sort)
  - [ ] modal patterns (shadcn/ui)
