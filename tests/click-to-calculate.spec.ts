import { test, expect } from '@playwright/test';

async function gaugeText(page) {
  const scope = page.getByText('Success Rate', { exact: true }).locator('xpath=..');
  return (await scope.getByText(/%$/).textContent())?.trim();
}

async function runwayText(page) {
  const scope = page.getByText('Pity Runway', { exact: true }).locator('xpath=ancestor::div[3]');
  return ((await scope.textContent()) ?? '').replace(/\s+/g, ' ').trim();
}

test('typing inputs does not recalculate until Calculate is clicked', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/tracker');
  await expect(page.getByText('Pity Runway', { exact: true })).toBeVisible();
  const gaugeBefore = await gaugeText(page);
  const runwayBefore = await runwayText(page);

  await page.locator('#pityOffset').fill('60');
  await page.locator('#budget').fill('5000');
  await page.waitForTimeout(600);

  await expect(await gaugeText(page)).toEqual(gaugeBefore);
  await expect(await runwayText(page)).toEqual(runwayBefore);
});

test('Calculate applies pity and budget to gauge and runway together', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/tracker');
  await expect(page.getByText('Pity Runway', { exact: true })).toBeVisible();
  const gaugeBefore = await gaugeText(page);
  const runwayBefore = await runwayText(page);

  await page.locator('#pityOffset').fill('60');
  await page.locator('#budget').fill('5000');
  await page.getByRole('button', { name: 'Calculate Results' }).click();
  await page.keyboard.press('Escape');

  await expect(await gaugeText(page)).not.toEqual(gaugeBefore);
  await expect(await runwayText(page)).not.toEqual(runwayBefore);
});
