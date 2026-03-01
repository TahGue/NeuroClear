import { chromium, type FullConfig } from "@playwright/test"
import { execSync, spawn } from "node:child_process"
import fs from "node:fs"
import path from "node:path"

async function waitForServer(baseURL: string) {
  const deadline = Date.now() + 60_000

  while (Date.now() < deadline) {
    try {
      const res = await fetch(baseURL, { redirect: "manual" })
      if (res.ok || (res.status >= 300 && res.status < 500)) return
    } catch {
      // ignore
    }
    await new Promise((r) => setTimeout(r, 500))
  }

  throw new Error(`Dev server not reachable at ${baseURL}`)
}

async function ensureServerRunning(baseURL: string) {
  try {
    await waitForServer(baseURL)
    return
  } catch {
    // continue
  }

  const pidPath = path.join(process.cwd(), "playwright/.auth/server.pid")

  const child = spawn(
    "npm",
    ["run", "start", "--", "-p", "3001"],
    {
      stdio: "inherit",
      detached: true,
      env: {
        ...process.env,
        NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ?? "playwright-secret",
        NEXTAUTH_URL: baseURL,
        PORT: "3001",
      },
    }
  )

  child.unref()
  fs.mkdirSync(path.dirname(pidPath), { recursive: true })
  fs.writeFileSync(pidPath, String(child.pid))

  await waitForServer(baseURL)
}

async function loginAndSaveStorageState(params: {
  baseURL: string
  email: string
  password: string
  callbackPath: string
  storageStatePath: string
}) {
  const browser = await chromium.launch()
  const page = await browser.newPage()

  await page.goto(`${params.baseURL}/login?callbackUrl=${encodeURIComponent(params.callbackPath)}`)
  
  // Wait for the form to be visible (inside Suspense boundary)
  await page.getByRole("heading").first().waitFor({ state: "visible", timeout: 10000 })
  
  // Use placeholder-based selectors which are more reliable
  await page.getByPlaceholder(/email/i).fill(params.email)
  await page.locator('input[type="password"]').fill(params.password)
  
  // Click the submit button (type="submit" inside a form)
  await page.locator('form button[type="submit"]').click()

  // Wait for navigation to complete - check that we're no longer on /login
  await page.waitForURL(/\/(dashboard|portal)/, { timeout: 20000 })
  await page.waitForLoadState("networkidle")

  await page.context().storageState({ path: params.storageStatePath })
  await browser.close()
}

export default async function globalSetup(config: FullConfig) {
  const baseURL = config.projects[0]?.use?.baseURL
  if (!baseURL || typeof baseURL !== "string") {
    throw new Error("Playwright baseURL is not configured")
  }

  execSync("npx tsx prisma/seed.ts", { stdio: "inherit" })

  await ensureServerRunning(baseURL)

  // Staff login - callbackPath should be /dashboard (LoginForm redirects "/" to "/dashboard")
  await loginAndSaveStorageState({
    baseURL,
    email: "admin@neuroclear.app",
    password: "password123",
    callbackPath: "/dashboard",
    storageStatePath: "playwright/.auth/staff.json",
  })

  // Patient login - callbackPath is /portal
  await loginAndSaveStorageState({
    baseURL,
    email: "emma.patient@neuroclear.app",
    password: "password123",
    callbackPath: "/portal",
    storageStatePath: "playwright/.auth/patient.json",
  })
}
