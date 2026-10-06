import { test, expect } from '@playwright/test';

test('home page renders hero and CTA navigates to tracker', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { level: 1 })).toContainText('Know your odds');
  await page.getByRole('link', { name: 'Start Tracking' }).click();

  await expect(page).toHaveURL(/\/tracker/);
  await expect(page.getByRole('button', { name: 'Calculate Results' })).toBeVisible();
});

test('home page renders calculator and produces a result', async ({ page }) => {
  await page.goto('/tracker');

  await expect(page.getByRole('heading', { level: 1 })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Calculate Results' })).toBeVisible();

  await page.getByRole('button', { name: 'Calculate Results' }).click();

  await expect(page.getByText('% chance')).toBeVisible();
});
