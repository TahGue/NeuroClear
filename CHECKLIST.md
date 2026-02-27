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

- [ ] **SDQ (Parent/Teacher forms)**
- [ ] **SCARED (child/parent)**
- [ ] **Vanderbilt ADHD scales**
- [ ] **CBCL/YSR** (if licensing/availability allows)

##### Adolescent (13–17)

- [ ] **PHQ-A** (adolescent depression)
- [ ] **GAD-7** (already present)
- [ ] **SCARED**
- [ ] **CRAFFT** (substance use)

##### Adult (18–64)

- [ ] **PHQ-9** (already present)
- [ ] **GAD-7** (already present)
- [ ] **AUDIT** (already present)
- [ ] **ASRS v1.1** (adult ADHD)
- [ ] **PCL-5** (PTSD)

##### Older Adult (65+)

- [ ] **GDS-15 / GDS-30** (geriatric depression)
- [ ] **MoCA / MMSE** (screening; requires careful handling + licensing considerations)
- [ ] **GAD-7**

#### Test UX requirements

- [ ] **Adaptive presentation** by age group:
  - [ ] only show applicable tests
  - [ ] language level adjustments for pediatric vs adult
- [ ] **Accessibility**
  - [ ] large text option
  - [ ] keyboard navigation
  - [ ] clear progress indication
- [ ] **Session behavior**
  - [ ] autosave per answer (already partly implemented)
  - [ ] resume where left off
  - [ ] prevent editing after submission (server enforced)

---

### Priority 2 — Staff Workflows

#### Assignment & Scheduling

- [ ] Assign patient portal tests to a patient (instrument sessions created ahead of time)
- [ ] Due dates + reminders
- [ ] Staff view of patient completion status

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

- [ ] Model “Assigned Instruments” explicitly:
  - [ ] `InstrumentAssignment` (patientId, instrumentId, assignedBy, dueDate, status)

### Testing

- [ ] Unit tests for scoring (Vitest)
- [ ] Integration tests for RBAC (Playwright):
  - [ ] PATIENT cannot load `/`
  - [ ] PATIENT cannot invoke staff actions
  - [ ] Staff cannot access `/portal`

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
