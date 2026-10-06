import { test, expect } from '@playwright/test';

// Temporary explicit verification for the no-scroll-to-calculate goal.
// Desktop: Calculate button fully in viewport at first paint (Advanced collapsed default).
// Mobile/tablet: record position, assert no horizontal overflow and tabs function.
const DESKTOP = [
  { w: 1440, h: 900, name: '1440x900' },
  { w: 1280, h: 800, name: '1280x800' },
];

test('desktop: Calculate visible without scrolling', async ({ page }) => {
  for (const v of DESKTOP) {
    await page.setViewportSize({ width: v.w, height: v.h });
    await page.goto('/tracker');
    const btn = page.getByRole('button', { name: 'Calculate Results' });
    await expect(btn).toBeVisible();
    const box = await btn.boundingBox();
    console.log(`${v.name} calculate rect: ${JSON.stringify(box)}`);
    expect(box, `${v.name}: button has a bounding box`).not.toBeNull();
    if (box) {
      expect(box.y, `${v.name}: button top in viewport`).toBeGreaterThanOrEqual(0);
      expect(box.y + box.height, `${v.name}: button bottom within viewport height ${v.h}`).toBeLessThanOrEqual(v.h);
    }
    // Core inputs also visible
    await expect(page.getByText('Available Pulls')).toBeVisible();
    await expect(page.getByText('Current Pity')).toBeVisible();
  }
});

test('two-chip preset still fits without scrolling', async ({ page }) => {
  for (const v of [{ width: 1440, height: 900 }, { width: 1280, height: 800 }]) {
    await page.setViewportSize({ width: v.width, height: v.height });
    await page.goto('/tracker');
    const box = page.getByRole('combobox', { name: 'Game Preset' });
    await box.click();
    await box.fill('weapon');
    await box.press('Enter');
    await expect(box).toHaveValue('Genshin Impact Weapon');
    const btn = page.getByRole('button', { name: 'Calculate Results' });
    await expect(btn).toBeVisible();
    const rect = await btn.boundingBox();
    console.log(`${v.width}x${v.height} weapon rect: ${JSON.stringify(rect)}`);
    expect(rect!.y + rect!.height).toBeLessThanOrEqual(v.height);
  }
});

test('breakpoints: no horizontal overflow, tabs work on mobile', async ({ page }) => {
  const sizes = [
    { w: 768, h: 1024, name: 'tablet 768x1024' },
    { w: 390, h: 844, name: 'mobile 390x844' },
    { w: 390, h: 740, name: 'mobile 390x740' },
  ];
  for (const v of sizes) {
    await page.setViewportSize({ width: v.w, height: v.h });
    await page.goto('/tracker');
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    console.log(`${v.name} horizontal overflow px: ${overflow}`);
    expect(overflow, `${v.name}: no horizontal overflow`).toBeLessThanOrEqual(1);
    const btn = page.getByRole('button', { name: 'Calculate Results' });
    await expect(btn).toBeVisible();
    const box = await btn.boundingBox();
    console.log(`${v.name} calculate rect: ${JSON.stringify(box)}`);
    if (v.w <= 390) {
      // Mobile uses tabs: calculator tab visible by default, dashboard one tap away
      await page.getByRole('tab', { name: 'Dashboard' }).click();
      await expect(page.getByText('Pity Runway')).toBeVisible();
      await page.getByRole('tab', { name: 'Calculator' }).click();
      await expect(btn).toBeVisible();
    }
  }
});

test('header: transparent at top, veiled on scroll', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/tracker');
  const nav = page.locator('nav').first();
  const topBg = await nav.evaluate((el) => getComputedStyle(el).backgroundColor);
  expect(topBg, 'header transparent at top').toEqual('rgba(0, 0, 0, 0)');
  await page.evaluate(() => window.scrollTo(0, 500));
  await page.waitForTimeout(800);
  const scrolledBg = await nav.evaluate((el) => getComputedStyle(el).backgroundColor);
  console.log(`header scrolled bg: ${scrolledBg}`);
  expect(scrolledBg, 'header veiled after scroll').not.toEqual('rgba(0, 0, 0, 0)');
  // Keyboard focus survives both states
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.getByRole('link', { name: 'Tracker', exact: true }).focus();
  await expect(page.getByRole('link', { name: 'Tracker', exact: true })).toBeFocused();
});

test('how-it-works diagram renders across breakpoints', async ({ page }) => {
  for (const v of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
    await page.setViewportSize(v);
    await page.goto('/how-it-works');
    await expect(page.getByText('What 90 pulls looks like')).toBeVisible();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow, `how-it-works ${v.width}x${v.height}: no overflow`).toBeLessThanOrEqual(1);
  }
});
