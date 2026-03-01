# AssessMind Platform — Future Implementation Plan

This document describes suggested next implementation phases for AssessMind, with concrete feature ideas and technical improvements.

## Guiding Principles

- **Security first**: always enforce RBAC/ownership server-side (middleware + API routes + server actions).
- **Schema-first**: evolve the Prisma schema before implementing backend logic.
- **Type-safe everywhere**: Prisma types + Zod validation for all inputs.
- **Simple, consistent UI**: reuse shadcn/ui patterns and keep patient UX low-friction.

---

## Phase 2 — Test Library by Age (Patient-Facing, High Priority)

### 2.0 Definition of Done (library “complete”)

- Each age group has a curated set of instruments with:
  - `status=ACTIVE`
  - `minAgeYears`/`maxAgeYears` set
  - items present and runnable in `/portal/tests/[slug]`
  - a basic scoring rule (even if provisional) + a result summary
- Patient UX:
  - patient sees only instruments in-range
  - patient is blocked from out-of-range slugs (already enforced)
- Staff UX:
  - staff can assign any instrument
  - staff can see results in patient detail + reports

### 2.0.1 Non-negotiables (quality bar)

- Items are:
  - mobile-friendly
  - keyboard navigable
  - readable at large font sizes
- Wording is:
  - plain language
  - culturally neutral (no culture-specific trivia required)
  - translatable (short strings, minimal idioms)
- Results are:
  - safe to present (no alarming phrasing)
  - explicit that results are screening/decision-support, not a diagnosis

### 2.1 Priority order (build sequence)

1. **Child (6–12)**
2. **Adolescent (13–17)**
3. **Adult (18–64)**
4. **Older Adult (65+)**

Rationale: child/adolescent need the most tailored content (format + difficulty), and will validate the “age gating + adaptive content” pipeline early.

### 2.2 Library structure (recommended)

For each age group, ship 4 categories:

- **Core screeners** (short, high-completion)
- **Cognition** (attention/memory/executive)
- **Social & emotion** (recognition/regulation/pragmatics)
- **Functioning & strengths** (daily functioning, values/meaning where appropriate)

### 2.2.1 Standard instrument templates (so we ship fast and consistently)

Each new instrument should fit into one of these templates:

- **Template A — Likert Scale Questionnaire**
  - Item type: single-select 0–3 / 0–4
  - Typical length: 8–20 items
  - UX:
    - one question per screen (preferred for patients)
    - autosave on selection
  - Scoring:
    - sum (and optional subscales)

- **Template B — Multiple Choice (Single Best Answer)**
  - Item type: 3–6 options
  - Typical length: 6–12 items
  - UX:
    - scenario text + options
  - Scoring:
    - rule-based mapping per option

- **Template C — Ordering / Sequencing**
  - Item type: reorder 4–8 cards
  - Typical length: 3–8 prompts
  - UX:
    - drag-and-drop with keyboard fallback controls
  - Scoring:
    - distance-from-correct (partial credit)

- **Template D — Timed Attention / Speed (Gentle)**
  - Item type: go/no-go or matching
  - Typical length: 60–180 seconds
  - UX:
    - strong accessibility (pause/stop)
  - Scoring:
    - accuracy, reaction time distribution, false positives

Template choice determines:

- required item `options` shape
- scoring function signature
- result summary format

### 2.3 Initial instrument set (MVP per age group)

#### Child (6–12)

- **Pattern Weaving** (visual reasoning / rule induction)
- **Story Seeds** (sequencing memory + comprehension)
- **Breath & Bell** (attention + recovery; within-person change)
- **Emotion Masks** (emotion recognition + simple ToM)

#### Adolescent (13–17)

- **Uncertainty Compass** (decision-making under uncertainty)
- **Social Harmony vs Honesty** (pragmatic language + context judgement)
- **Rhythm & Meter** (working memory + cognitive flexibility)
- **Ethics in Motion** (dilemma reasoning; non-graded)

#### Adult (18–64)

- **Debate & Evidence** (argument evaluation / bias resistance)
- **Cognitive Load Marketplace** (planning under constraints)
- **Temperament Balance** (regulation strategies + reappraisal)
- **Values Compass** (value clarity; actionable plan)

#### Older Adult (65+)

- **Processing Speed — Kind Mode** (accessible speed)
- **Wisdom Under Ambiguity** (practical judgement)
- **Life Chapters** (autobiographical structure)
- **Gentle Attention** (low-stress sustained attention)

### 2.4 Implementation steps (repeat per instrument)

1. **Schema-first**
   - Confirm fields needed for:
     - scoring metadata
     - result summary text
     - optional interpretation bands
2. **Seed content**
   - Add instrument row + items in `prisma/seed.ts`.
   - Ensure `slug` naming convention is stable.
3. **Runner support**
   - Ensure item `options` schema covers the instrument’s interaction type.
4. **Scoring (provisional → hardened)**
   - Start with a basic scoring function:
     - totals
     - missing-item policy
   - Store result in `InstrumentResult`.
   - Add an interpretation tier (minimum):
     - `LOW` / `MODERATE` / `HIGH`
     - a short, non-alarming summary sentence
5. **Portal UX**
   - Show progress + last saved/submitted.
   - Show basic results summary when submitted (patient-visible where applicable).
6. **QA**
   - Add Playwright:
     - assignment required
     - age gating
     - complete instrument end-to-end

### 2.4.1 Scoring & interpretation rubric (ship early, refine later)

- **Provisional scoring (MVP)**
  - raw totals (and subscales if obvious)
  - missing item handling:
    - if missing > 20%: mark `INCOMPLETE`
    - else prorate or treat missing as 0 (choose per instrument and document)
- **Interpretation (MVP)**
  - use conservative bands:
    - `LOW`: within expected range
    - `MODERATE`: monitor / consider follow-up
    - `HIGH`: recommend clinician review
- **Result object standard fields**
  - `rawScore`
  - `band`
  - `summary`
  - `subscales` (optional)

### 2.4.2 Accessibility + localization requirements

- Accessibility:
  - minimum 44px tap targets
  - visible focus ring everywhere
  - supports reduced motion
  - high contrast friendly
- Localization:
  - all user-visible strings must be dictionary-driven
  - avoid concatenating translated strings
  - results summaries are also translated

### 2.4.3 Analytics (so you learn what works)

Track (server-side) for each session:

- `startedAt`, `firstResponseAt`, `submittedAt`
- completion rate by instrument and age group
- median time per item
- drop-off item index

This data drives:

- item rewriting
- length tuning
- UX improvements

### 2.5 Milestones (how we execute Phase 2)

- **Milestone A (Foundation)**
  - Create “instrument templates” for:
    - multiple choice (single)
    - likert scale
    - scenario choice
  - Add a minimal scoring engine interface in `src/lib`.
  - QA gate:
    - one instrument completes end-to-end
    - result persists and renders

- **Milestone B (Child library)**
  - Implement the 4 child MVP instruments above.
  - QA gate:
    - child patient sees only in-range
    - at least 1 child instrument has sequencing/ordering interaction

- **Milestone C (Adolescent library)**
  - Implement the 4 adolescent MVP instruments above.
  - QA gate:
    - at least 1 adolescent instrument is scenario-based

- **Milestone D (Adult library)**
  - Implement the 4 adult MVP instruments above.
  - QA gate:
    - at least 1 adult instrument produces subscales

- **Milestone E (Older adult library)**
  - Implement the 4 older adult MVP instruments above.
  - QA gate:
    - older adult instruments pass large-font and keyboard-only smoke tests

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
