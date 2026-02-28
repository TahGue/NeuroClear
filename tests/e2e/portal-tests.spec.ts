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

  test("age-gates instruments by slug", async ({ page }) => {
    // Emma is a child; ASRS is minAgeYears 18
    await page.goto("/portal/tests/asrs")

    await expect(page).toHaveURL(/\/portal\/tests(\?.*)?$/)
    await expect(page.getByRole("heading", { name: "Tests", exact: true })).toBeVisible()
  })

  test("can complete an age-appropriate assigned test end-to-end", async ({ page }) => {
    await page.goto("/portal/tests")

    // Let's just pick the first unsubmitted assigned test by looking for the "Start / Continue" button
    // because the exact assignment ordering might change or tests might be submitted in prior test runs.
    const startButton = page.getByRole("link", { name: "Start / Continue" }).first()
    await expect(startButton).toBeVisible()
    await startButton.click()

    // First question
    await expect(page.getByText("Question 1 of")).toBeVisible()
    // Just click the first option for whatever instrument this is
    await page.locator('button[type="button"]').first().click()
    await page.getByRole("button", { name: "Next" }).click()

    // Answer remaining questions (up to 10 max)
    for (let i = 2; i <= 10; i++) {
      const isNextVisible = await page.getByRole("button", { name: "Next" }).isVisible()
      if (!isNextVisible) break // Reached the end (Submit button is showing)
      
      await expect(page.getByText(`Question ${i} of`)).toBeVisible()
      await page.locator('button[type="button"]').first().click()
      await page.getByRole("button", { name: "Next" }).click()
    }

    // We should now be on the last question, where "Submit" is visible instead of "Next"
    await page.locator('button[type="button"]').first().click()
    
    // Submit
    await page.getByRole("button", { name: "Submit" }).click()

    // Should redirect back to portal/tests and show result
    await expect(page).toHaveURL(/\/portal\/tests(\?.*)?$/)
    await expect(page.getByText("Score: ").first()).toBeVisible()
  })
})
