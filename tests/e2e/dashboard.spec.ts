import { test, expect } from '@playwright/test';
import path from 'node:path';

const staffState = path.join(process.cwd(), 'playwright/.auth/staff.json');

test.describe('Dashboard and Navigation', () => {
  test.use({ storageState: staffState })

  test('has title and sidebar navigation', async ({ page }) => {
    await page.goto('/');

    // Check title
    await expect(page).toHaveTitle(/AssessMind/);

    // Check sidebar links
    const sidebar = page.locator('nav');
    await expect(sidebar.getByRole('link', { name: 'Dashboard' })).toBeVisible();
    await expect(sidebar.getByRole('link', { name: 'Patients' })).toBeVisible();
    await expect(sidebar.getByRole('link', { name: 'Score Entry' })).toBeVisible();
    await expect(sidebar.getByRole('link', { name: 'Reports' })).toBeVisible();
    await expect(sidebar.getByRole('link', { name: 'Assessment Library' })).toBeVisible();
  });

  test('dashboard displays key metrics', async ({ page }) => {
    await page.goto('/');

    // Wait for the stats to load (ensure Prisma query has resolved)
    await expect(page.getByText('Active Evaluations')).toBeVisible();
    await expect(page.getByText('Completed Reports')).toBeVisible();
    await expect(page.getByText('Total Patients')).toBeVisible();
    
    // Check if the charts rendered (recharts svg)
    const svgs = page.locator('svg.recharts-surface');
    await expect(svgs.first()).toBeVisible();
  });
});
