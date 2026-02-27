import { test, expect } from "@playwright/test"
import path from "node:path"

const patientState = path.join(process.cwd(), "playwright/.auth/patient.json")

test.describe("Patient portal tests", () => {
  test.use({ storageState: patientState })

  test("shows assigned tests filtered for patient", async ({ page }) => {
    await page.goto("/portal/tests")

    await expect(page.getByRole("heading", { name: "Tests", exact: true })).toBeVisible()
    await expect(page.getByText("Assigned Tests")).toBeVisible()

    // Seed assigns SDQ to Emma (child)
    await expect(page.getByText("SDQ").first()).toBeVisible()
  })
})
