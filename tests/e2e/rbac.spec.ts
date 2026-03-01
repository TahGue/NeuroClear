import { test, expect } from "@playwright/test"
import path from "node:path"

const patientState = path.join(process.cwd(), "playwright/.auth/patient.json")
const staffState = path.join(process.cwd(), "playwright/.auth/staff.json")

test.describe("RBAC redirects (patient)", () => {
  test.use({ storageState: patientState })

  test("patient visiting '/' is redirected to /portal", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" })

    await expect(page).toHaveURL(/\/portal(\?.*)?$/)
    await expect(page.getByRole("heading", { name: /Welcome/i })).toBeVisible()
  })
})

test.describe("RBAC redirects (staff)", () => {
  test.use({ storageState: staffState })

  test("staff visiting '/portal' is redirected to /dashboard", async ({ page }) => {
    await page.goto("/portal", { waitUntil: "domcontentloaded" })

    await expect(page).toHaveURL(/\/dashboard/)
    await expect(page.getByRole("heading", { name: /Dashboard/i })).toBeVisible()
  })
})
