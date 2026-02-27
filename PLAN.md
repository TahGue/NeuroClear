# NeuroClear Platform — Future Implementation Plan

This document describes suggested next implementation phases for NeuroClear, with concrete feature ideas and technical improvements.

## Guiding Principles

- **Security first**: always enforce RBAC/ownership server-side (middleware + API routes + server actions).
- **Schema-first**: evolve the Prisma schema before implementing backend logic.
- **Type-safe everywhere**: Prisma types + Zod validation for all inputs.
- **Simple, consistent UI**: reuse shadcn/ui patterns and keep patient UX low-friction.

---

## Phase 3 — Patient Portal UX (High Impact)

### 3.1 “My Tests” home dashboard

- **Goal**: make `/portal` the single place where patients understand what to do next.
- **UI**:
  - Active/Assigned tests (due date, progress, CTA).
  - Completed tests (score summary, completion date).
  - “Need help?” support link and brief privacy note.

### 3.2 Better progress + resume experience

- Show:
  - question count and progress percentage.
  - last saved time.
- Add:
  - “Resume” button if `IN_PROGRESS`.
  - “View results” (if patient-visible) if `SUBMITTED`.

### 3.3 Accessibility baseline

- Keyboard navigation for selects/radios.
- Improved focus states.
- Optional large-font mode.

---

## Phase 4 — Staff Assignment Workflow (Clinic-Ready)

### 4.1 Assignments list + filtering

- Patient detail page:
  - Filter by `ASSIGNED/IN_PROGRESS/SUBMITTED/EXPIRED`.
  - Sort by due date.
  - “Reassign” (creates new session and marks old as archived).

### 4.2 Reminders + due date automation

- Model:
  - `reminderSentAt`, `reminderCount`.
- Worker/cron:
  - send reminders X days before due date, and overdue reminders.

### 4.3 Multi-audience instrument delivery

- If instrument `audience` is `PARENT` or `TEACHER`:
  - invite flow via email link.
  - separate respondent identity record.
  - per-respondent sessions.

---

## Phase 5 — Scoring Engine + Interpretation (Clinical Value)

### 5.1 Scoring rules per instrument

- Create a scoring module per instrument:
  - raw score totals
  - subscales
  - missing item handling
  - cutoffs and interpretation bands

### 5.2 Norms and references

- Store norm metadata in DB (if available/licensing allows).
- Tie interpretation to:
  - age
  - gender (optional)
  - locale

### 5.3 Results visualization

- Simple charts in staff UI:
  - severity band badge
  - trend over time if repeated

---

## Phase 6 — Reporting Improvements

### 6.1 Report builder

- Editable narrative sections with structured templates.
- Auto-insert test results.
- Clinician signature + timestamp.

### 6.2 PDF export

- Generate deterministic PDFs.
- Include:
  - patient demographics
  - instrument results
  - clinician summary

---

## Phase 7 — Testing & Quality

### 7.1 Expand Playwright coverage

- API RBAC:
  - patient cannot call staff APIs
  - staff cannot call patient-only actions
- Portal:
  - complete an assigned test end-to-end
  - verify assignment status transitions

### 7.2 Unit tests for scoring (Vitest)

- Unit test each instrument scoring + interpretation banding.
- Snapshot tests for report templates.

---

## Phase 8 — Compliance, Auditability, and Operations

### 8.1 Audit log

- Record staff actions:
  - assigned tests
  - viewed reports
  - generated reports
- Store immutable audit events.

### 8.2 Data retention and deletion

- Configurable retention windows.
- Patient export/delete flows.

### 8.3 Security hardening

- Centralize RBAC helpers (already started).
- Rate limit sensitive endpoints.
- Add CSRF considerations for custom endpoints.

---

## Good Ideas / Nice-to-Haves

- **Clinician workspace**: templates per clinic, custom instrument sets.
- **Outcome tracking**: repeated measures with longitudinal graphs.
- **Smart assignment suggestions**: recommended instruments based on age + presenting problem.
- **Localization**: multilingual instruments and UI strings.
- **Feature flags**: gradually roll out new instruments and workflows.
