# NeuroClear Platform
 
NeuroClear is a modern web application designed for psychological and educational professionals to manage patients, assign evaluations, enter scores, and generate reports.
 
## Features
 
- **Patient Management**
  Track demographics, referral sources, and evaluation history.
- **Assessment Library**
  Browse supported assessments (e.g., WISC-V, WAIS-IV) organized by domain and platform.
- **Evaluation Workflow**
  Start evaluations directly or **assign an evaluation to a patient** from the Assessment Library.
- **Score Entry**
  Enter raw/scaled scores for subtests and review a summary before saving.
- **Reports**
  Generate structured reports from completed evaluations. Includes a Narrative Builder and PDF Export capabilities.
- **Age-Gated Patient Portal**
  Patients can securely log in to complete assigned assessments (like PHQ-9, GAD-7, and custom cognitive screeners) tailored to their specific age range.
- **Audit Logging**
  Securely tracks assignment and scoring activities for compliance.
 
## Tech Stack
 
- **Frontend**
  Next.js (App Router), React, TypeScript
- **Styling / UI**
  Tailwind CSS, shadcn/ui, Radix UI primitives, Lucide icons
- **Backend**
  Next.js Server Actions
- **Database**
  PostgreSQL
- **ORM**
  Prisma
 
## Getting Started
 
### Prerequisites
 
- Node.js
- PostgreSQL (or Docker)
 
### Install
 
1. Clone:
  ```bash
  git clone https://github.com/TahGue/NeuroClear.git
  cd neuroclear-platform
  ```
 
2. Install dependencies:
  ```bash
  npm install
  ```
 
3. Configure env:
  Create `.env` (or `.env.local`) and set:
  ```env
  # If you use docker-compose.yml (recommended for local dev), Postgres is exposed on 5434
  DATABASE_URL="postgresql://postgres:password@localhost:5434/neuroclear?schema=public"

  # Required by NextAuth / middleware token decoding
  NEXTAUTH_SECRET="<generate-a-random-secret>"
  ```

### Database (Docker)

If you don't have Postgres running locally, you can start it with Docker:

```bash
docker compose up -d
```
 
4. Migrate:
  ```bash
  npx prisma migrate dev
  ```

5. (Optional) Seed sample data:

```bash
npx tsx prisma/seed.ts
```

This seed creates:

- **Admin user**: `admin@neuroclear.app` / `password123`
- **Patient user**: `emma.patient@neuroclear.app` / `password123`
 
6. Run dev server:
  ```bash
  npm run dev
  ```
 
Open `http://localhost:3000`.

## Access Control (Roles)

- **ADMIN/CLINICIAN/STAFF**: can access the main dashboard and clinical workflows.
- **PATIENT**: restricted to `/portal` and `/portal/tests`.

Access control is enforced via `middleware.ts` (route-level redirects) and server-side checks in Server Actions.
