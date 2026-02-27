import { chromium, type FullConfig } from "@playwright/test"
import { execSync } from "node:child_process"

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
  await page.locator('input[type="email"]').fill(params.email)
  await page.locator('input[type="password"]').fill(params.password)
  await page.getByRole("button", { name: "Sign in" }).click()

  await page.waitForURL((url) => url.pathname === params.callbackPath)

  await page.context().storageState({ path: params.storageStatePath })
  await browser.close()
}

export default async function globalSetup(config: FullConfig) {
  const baseURL = config.projects[0]?.use?.baseURL
  if (!baseURL || typeof baseURL !== "string") {
    throw new Error("Playwright baseURL is not configured")
  }

  execSync("npx tsx prisma/seed.ts", { stdio: "inherit" })

  await waitForServer(baseURL)

  await loginAndSaveStorageState({
    baseURL,
    email: "admin@neuroclear.app",
    password: "password123",
    callbackPath: "/",
    storageStatePath: "playwright/.auth/staff.json",
  })

  await loginAndSaveStorageState({
    baseURL,
    email: "emma.patient@neuroclear.app",
    password: "password123",
    callbackPath: "/portal",
    storageStatePath: "playwright/.auth/patient.json",
  })
}
