import { test, expect } from "@playwright/test"
import path from "node:path"

const patientState = path.join(process.cwd(), "playwright/.auth/patient.json")
const staffState = path.join(process.cwd(), "playwright/.auth/staff.json")

// Staff-only routes that patients should not access
const staffOnlyRoutes = [
  { path: "/patients", name: "Patients" },
  { path: "/reports", name: "Reports" },
  { path: "/score-entry", name: "Score Entry" },
  { path: "/assessments", name: "Assessments" },
  { path: "/tests", name: "Tests Library" },
  { path: "/profile", name: "Profile" },
]

test.describe("Patient RBAC - Cannot access staff routes", () => {
  test.use({ storageState: patientState })

  for (const route of staffOnlyRoutes) {
    test(`patient cannot access ${route.name} (${route.path})`, async ({ page }) => {
      await page.goto(route.path, { waitUntil: "domcontentloaded" })

      // Should be redirected to /portal
      await expect(page).toHaveURL(/\/portal(\?.*)?$/)
      await expect(page.getByRole("heading", { name: /Welcome/i })).toBeVisible()
    })
  }

  test("patient cannot access patient detail page", async ({ page }) => {
    await page.goto("/patients/some-id", { waitUntil: "domcontentloaded" })

    // Should be redirected to /portal
    await expect(page).toHaveURL(/\/portal(\?.*)?$/)
  })

  test("patient cannot access report detail page", async ({ page }) => {
    await page.goto("/reports/some-id", { waitUntil: "domcontentloaded" })

    // Should be redirected to /portal
    await expect(page).toHaveURL(/\/portal(\?.*)?$/)
  })

  test("patient cannot access test assignment page", async ({ page }) => {
    await page.goto("/tests/phq9/assign", { waitUntil: "domcontentloaded" })

    // Should be redirected to /portal
    await expect(page).toHaveURL(/\/portal(\?.*)?$/)
  })
})

test.describe("Staff RBAC - Cannot access patient routes", () => {
  test.use({ storageState: staffState })

  test("staff cannot access /portal", async ({ page }) => {
    await page.goto("/portal", { waitUntil: "domcontentloaded" })

    // Should be redirected to /dashboard
    await expect(page).toHaveURL(/\/dashboard/)
    await expect(page.getByRole("heading", { name: /Dashboard/i })).toBeVisible()
  })

  test("staff cannot access /portal/tests", async ({ page }) => {
    await page.goto("/portal/tests", { waitUntil: "domcontentloaded" })

    // Should be redirected to /dashboard
    await expect(page).toHaveURL(/\/dashboard/)
  })

  test("staff cannot access specific portal test", async ({ page }) => {
    await page.goto("/portal/tests/phq9", { waitUntil: "domcontentloaded" })

    // Should be redirected to /dashboard
    await expect(page).toHaveURL(/\/dashboard/)
  })
})

test.describe("Unauthenticated user redirects", () => {
  test("unauthenticated user visiting protected route redirects to login", async ({ page }) => {
    // Clear any existing auth state
    await page.context().clearCookies()

    await page.goto("/dashboard", { waitUntil: "domcontentloaded" })

    // Should be redirected to /login
    await expect(page).toHaveURL(/\/login/)
  })

  test("unauthenticated user visiting portal redirects to login", async ({ page }) => {
    await page.context().clearCookies()

    await page.goto("/portal", { waitUntil: "domcontentloaded" })

    // Should be redirected to /login
    await expect(page).toHaveURL(/\/login/)
  })

  test("unauthenticated user visiting patients page redirects to login", async ({ page }) => {
    await page.context().clearCookies()

    await page.goto("/patients", { waitUntil: "domcontentloaded" })

    // Should be redirected to /login
    await expect(page).toHaveURL(/\/login/)
  })
})

test.describe("API RBAC - Extended", () => {
  test.use({ storageState: patientState })

  test("patient cannot create evaluation via server action", async ({ page }) => {
    await page.goto("/portal")

    // Try to call a staff-only server action via fetch
    const result = await page.evaluate(async () => {
      const res = await fetch("/api/instrument-assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId: "test-id",
          instrumentId: "test-id",
          dueDate: null,
        }),
      })
      return res.status
    })

    expect(result).toBe(401)
  })

  test("patient cannot delete patients", async ({ page }) => {
    await page.goto("/portal")

    const res = await page.request.delete("/api/patients/some-id")

    // Should be an error status (unauthorized, not found, method not allowed, bad request, or server error)
    expect([400, 401, 404, 405, 500]).toContain(res.status())
  })
})

test.describe("Staff API access", () => {
  test.use({ storageState: staffState })

  test("staff can access patients API", async ({ page }) => {
    await page.goto("/dashboard")

    const res = await page.request.get("/api/patients")

    // Should work for staff
    expect([200, 404]).toContain(res.status())
  })
})

test.describe("Session persistence", () => {
  test.use({ storageState: staffState })

  test("staff session persists across page navigations", async ({ page }) => {
    await page.goto("/dashboard")
    await expect(page.getByRole("heading", { name: /Dashboard/i })).toBeVisible()

    // Navigate to patients
    await page.getByRole("link", { name: "Patients" }).click()
    await expect(page).toHaveURL(/\/patients/)

    // Navigate back to dashboard
    await page.getByRole("link", { name: "Dashboard" }).click()
    await expect(page).toHaveURL(/\/dashboard/)
    await expect(page.getByRole("heading", { name: /Dashboard/i })).toBeVisible()
  })
})

test.describe("Patient session persistence", () => {
  test.use({ storageState: patientState })

  test("patient session persists across portal pages", async ({ page }) => {
    await page.goto("/portal")
    await expect(page.getByRole("heading", { name: /Welcome/i })).toBeVisible()

    // Navigate to portal tests - use more specific selector
    await page.getByRole("link", { name: "My Tests" }).click()
    await expect(page).toHaveURL(/\/portal\/tests/)
    await expect(page.getByRole("heading", { name: "Tests", exact: true })).toBeVisible()
  })
})
