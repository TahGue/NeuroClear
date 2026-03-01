# AssessMind Platform

AssessMind is a modern web application designed for psychological and educational professionals to manage patients, assign evaluations, enter scores, and generate reports.

## Features

### Core Functionality

- **Patient Management**
  Track demographics, referral sources, and evaluation history.
- **Assessment Library**
  Browse supported assessments (e.g., WISC-V, WAIS-IV, PHQ-9, GAD-7, AUDIT, PCL-5) organized by domain and platform.
- **Evaluation Workflow**
  Start evaluations directly or **assign an evaluation to a patient** from the Assessment Library.
- **Score Entry**
  Enter raw/scaled scores for subtests and review a summary before saving.
- **Reports**
  Generate structured reports from completed evaluations. Includes a Narrative Builder and PDF Export capabilities.
- **Age-Gated Patient Portal**
  Patients can securely log in to complete assigned assessments tailored to their specific age range.

### Scoring & Interpretation

- **Per-Instrument Scoring Engine**
  Automated scoring algorithms for all supported instruments (PHQ-9, GAD-7, AUDIT, PCL-5, SDQ, GDS-15, etc.)
- **Interpretation Bands**
  Clinical interpretation ranges (minimal, mild, moderate, severe) with automatic categorization
- **Result Visualization**
  Interactive charts showing score trends and domain breakdowns for patients

### Data Visualization

- **Staff Dashboard**
  Real-time metrics for evaluations, reports, patients, and assignments
  - Completion status charts
  - Age distribution visualization
  - Assignment status tracking
  - Platform and domain distribution
- **Patient Portal Results**
  Visual representation of test scores and progress over time

### Accessibility

- **Large Text Mode** - Increased font sizes throughout the application
- **Reduced Motion** - Minimizes animations for users with motion sensitivity
- **High Contrast Mode** - Enhanced color contrast for better visibility
- **Keyboard Navigation** - Full keyboard accessibility with visible focus indicators
- **Skip to Content** - Quick navigation for screen reader users
- **Screen Reader Support** - ARIA labels and live regions for dynamic content

### Internationalization

- Multi-language support (English, French, Arabic, Spanish)
- RTL (Right-to-Left) layout support for Arabic
- Localized instrument content

### Security & Compliance

- **Audit Logging** - Tracks assignment and scoring activities for compliance
- **RBAC (Role-Based Access Control)** - Enforced at middleware and server level
- **Session Management** - Secure authentication with NextAuth.js

## Tech Stack

- **Frontend**
  Next.js 16 (App Router), React 19, TypeScript
- **Styling / UI**
  Tailwind CSS, shadcn/ui, Radix UI primitives, Lucide icons
- **Backend**
  Next.js Server Actions, Prisma ORM
- **Database**
  PostgreSQL
- **Authentication**
  NextAuth.js
- **Testing**
  Vitest (unit tests), Playwright (E2E tests)
- **Visualization**
  Recharts

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL (or Docker)
- npm or pnpm

### Installation

1. Clone:
  ```bash
  git clone https://github.com/TahGue/AssessMind.git
  cd assessmind-platform
  ```

2. Install dependencies:
  ```bash
  npm install
  ```

3. Configure env:
  Create `.env.local` and set:
  ```env
  # Database (Docker exposes on 5434)
  DATABASE_URL="postgresql://postgres:password@localhost:5434/assessmind?schema=public"

  # NextAuth
  NEXTAUTH_SECRET="<generate-a-random-secret>"
  NEXTAUTH_URL="http://localhost:3000"
  ```

### Database (Docker)

```bash
docker compose up -d
```

4. Migrate:
  ```bash
  npx prisma migrate dev
  ```

5. Seed sample data:
  ```bash
  npx tsx prisma/seed.ts
  ```

This creates:
- **Admin user**: `admin@assessmind.app` / `password123`
- **Patient user**: `emma.patient@assessmind.app` / `password123`

6. Run dev server:
  ```bash
  npm run dev
  ```

Open `http://localhost:3000`.

## Testing

### Unit Tests (Vitest)

```bash
npm run test
```

### E2E Tests (Playwright)

```bash
npx playwright test
```

## Access Control (Roles)

- **ADMIN/CLINICIAN/STAFF**: Full access to dashboard, patients, evaluations, reports, and test library.
- **PATIENT**: Restricted to `/portal` for completing assigned assessments and viewing results.

Access control is enforced via:
- `middleware.ts` (route-level redirects)
- Server-side RBAC checks in `lib/rbac.ts`
- API route protection

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (staff)/            # Staff-only routes
│   ├── portal/             # Patient portal
│   └── api/                # API routes
├── components/
│   ├── ui/                 # shadcn/ui components
│   ├── dashboard/          # Dashboard charts
│   ├── assessments/        # Assessment components
│   └── accessibility/      # Accessibility components
├── lib/
│   ├── instrument-scoring.ts  # Scoring engine
│   ├── rbac.ts             # Role-based access control
│   └── i18n*.ts            # Internationalization
├── types/                  # TypeScript types
└── messages/               # i18n translations
tests/
├── e2e/                    # Playwright E2E tests
└── lib/                    # Vitest unit tests
```

## Supported Instruments

| Instrument | Type | Audience | Scoring |
|------------|------|----------|---------|
| PHQ-9 | Depression | Adult | 0-27 with severity bands |
| GAD-7 | Anxiety | Adult | 0-21 with severity bands |
| AUDIT | Alcohol Use | Adult | 0-40 with risk levels |
| PCL-5 | PTSD | Adult | 0-80 with severity |
| SDQ | Strengths/Difficulties | Child/Adolescent | Impact scoring |
| GDS-15 | Geriatric Depression | Senior | 0-15 with cutoffs |
| WISC-V | Cognitive | Child | Index scores |
| WAIS-IV | Cognitive | Adult | Index scores |

## License

MIT
