import { test, expect } from "@playwright/test"
import path from "node:path"

const patientState = path.join(process.cwd(), "playwright/.auth/patient.json")

test.describe("API RBAC", () => {
  test.use({ storageState: patientState })

  test("patient cannot call staff-only instrument assignment API", async ({ page }) => {
    await page.goto("/portal")

    const res = await page.request.post("/api/instrument-assignments", {
      data: {
        patientId: "fake",
        instrumentId: "fake",
        dueDate: null,
      },
    })

    expect(res.status()).toBe(401)
  })
})
