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
  Generate structured reports from completed evaluations.
 
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
- PostgreSQL
 
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
  DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/neuroclear?schema=public"
  ```
 
4. Migrate:
  ```bash
  npx prisma migrate dev
  ```
 
5. Run dev server:
  ```bash
  npm run dev
  ```
 
Open `http://localhost:3000`.
