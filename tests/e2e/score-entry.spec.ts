import { test, expect } from '@playwright/test';

test.describe('Score Entry Flow', () => {
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

    // Click the Assessment dropdown and select WISC-V
    await page.getByRole('combobox').filter({ hasText: 'Select assessment' }).click();
    await page.getByRole('option', { name: /WISC-V/ }).click();

    // Verify subtest table appears with the WISC-V tabs
    await expect(page.getByRole('tab', { name: 'Subtest Scores' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Summary' })).toBeVisible();

    // Check that we see WISC-V specific subtests
    await expect(page.getByText('Similarities').first()).toBeVisible();
    await expect(page.getByText('Vocabulary').first()).toBeVisible();
  });
});
