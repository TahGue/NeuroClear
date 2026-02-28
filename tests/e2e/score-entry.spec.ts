import { test, expect } from '@playwright/test';
import path from 'node:path';

const staffState = path.join(process.cwd(), 'playwright/.auth/staff.json');

test.describe('Score Entry Flow', () => {
  test.use({ storageState: staffState })

  test('can navigate to score entry and view form', async ({ page }) => {
    // Start from dashboard
    await page.goto('/');

    // Navigate to Score Entry
    await page.getByRole('link', { name: 'Score Entry' }).click();
    
    // Check header
    await expect(page.getByRole('heading', { name: 'Score Entry' })).toBeVisible();

    // The Select elements exist (Shadcn Select uses button with combobox role)
    await expect(page.getByRole('combobox').filter({ hasText: 'Select patient' })).toBeVisible();
    await expect(page.getByRole('combobox').filter({ hasText: 'Select assessment' })).toBeVisible();
  });

  test('can fill out evaluation details', async ({ page }) => {
    await page.goto('/score-entry');

    // Wait for Prisma to load the data
    await page.waitForLoadState('networkidle');

    // Select a patient (seed includes Emma Thompson)
    const patientCombobox = page.getByRole('combobox').nth(0)
    await patientCombobox.click()
    await page.getByRole('option', { name: /Emma Thompson/i }).click()

    await expect(patientCombobox).toHaveText(/Emma Thompson/i)

    // Click the Assessment dropdown and select WISC-V
    const assessmentCombobox = page.getByRole('combobox').nth(1)
    await assessmentCombobox.click();
    await page.getByRole('option', { name: 'WISC-V', exact: true }).click();

    await expect(assessmentCombobox).toHaveText(/WISC-V/)

    // Verify subtest table appears with the WISC-V tabs
    await expect(page.getByRole('tab', { name: 'Subtest Scores' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Summary' })).toBeVisible();

    await page.getByRole('tab', { name: 'Subtest Scores' }).click();
    await expect(page.getByRole('heading', { name: /Subtest Scores - WISC-V/i })).toBeVisible();

    // Check that subtest rows are rendered
    const rows = page.locator('table tbody tr');
    await expect
      .poll(async () => rows.count(), { timeout: 15000 })
      .toBeGreaterThan(0);
    await expect(rows.first()).toBeVisible();
  });
});
