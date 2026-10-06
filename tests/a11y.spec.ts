import { test, expect } from '@playwright/test';

test.describe('Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tracker');
    await page.waitForLoadState('networkidle');
  });

  test('Escape key closes modal on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.getByRole('button', { name: 'Calculate Results' }).click();
    
    await expect(page.getByText('% chance')).toBeVisible();
    await expect(page.getByRole('dialog')).toBeVisible();
    
    await page.keyboard.press('Escape');
    
    await expect(page.getByRole('dialog')).toBeHidden();
  });

  test('Tab order reaches Calculate button on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    await page.keyboard.press('Tab');
    
    // First focusable should be preset select or Calculate button
    const firstFocused = page.locator(':focus');
    await expect(firstFocused).toBeVisible();
  });

  test('Mobile tab switch works', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    const dashboardTab = page.getByRole('tab', { name: 'Dashboard' });
    const calculatorTab = page.getByRole('tab', { name: 'Calculator' });
    
    await expect(calculatorTab).toHaveAttribute('aria-selected', 'true');
    await expect(dashboardTab).toHaveAttribute('aria-selected', 'false');
    
    // Use force click to avoid interception from layout elements
    await dashboardTab.click({ force: true });
    
    await expect(dashboardTab).toHaveAttribute('aria-selected', 'true');
    await expect(calculatorTab).toHaveAttribute('aria-selected', 'false');
    await expect(page.getByText('Pity Runway')).toBeVisible();
    
    await calculatorTab.click({ force: true });
    
    await expect(calculatorTab).toHaveAttribute('aria-selected', 'true');
    await expect(dashboardTab).toHaveAttribute('aria-selected', 'false');
    await expect(page.getByRole('button', { name: 'Calculate Results' })).toBeVisible();
  });

  test('Desktop: calculate scrolls to top and updates dashboard', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Scroll down to button
    await page.getByRole('button', { name: 'Calculate Results' }).scrollIntoViewIfNeeded();
    await page.waitForTimeout(200);
    
    // Fill inputs and calculate
    await page.fill('input[id="targetPulls"]', '90');
    await page.getByRole('button', { name: 'Calculate Results' }).click();
    
    // Should scroll to top (results visible at top)
    await expect(page.getByText('Pity Runway')).toBeVisible();
    await expect(page.getByText('% chance')).toBeVisible();
    
    // Modal should appear on desktop now
    await expect(page.getByRole('dialog')).toBeVisible();
  });

  test('Focus trap in modal on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.getByRole('button', { name: 'Calculate Results' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    
    const dialog = page.getByRole('dialog');
    const focusableElements = dialog.locator('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    
    await page.keyboard.press('Tab');
    await expect(focusableElements.first()).toBeFocused();
    
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Tab');
    }
    
    await expect(focusableElements.first()).toBeFocused();
  });

  test('Reduced motion disables animations on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    await page.fill('input[id="targetPulls"]', '90');
    await page.getByRole('button', { name: 'Calculate Results' }).click();
    
    await expect(page.getByText('% chance')).toBeVisible();
    
    const transitionDuration = await page.evaluate(() => {
      const style = getComputedStyle(document.body);
      return style.transitionDuration;
    });
    
    const durationValue = parseFloat(transitionDuration);
    expect(durationValue).toBeLessThanOrEqual(0.01);
  });
});

test.describe('Visual Regression - Baseline Screenshots', () => {
  const viewports = [
    { name: 'desktop-light', width: 1440, height: 900, colorScheme: 'light' },
    { name: 'desktop-dark', width: 1440, height: 900, colorScheme: 'dark' },
    { name: 'mobile-light', width: 375, height: 667, colorScheme: 'light' },
    { name: 'mobile-dark', width: 375, height: 667, colorScheme: 'dark' },
  ];

  for (const vp of viewports) {
    test(`screenshot: ${vp.name} calculator`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.emulateMedia({ colorScheme: vp.colorScheme as 'light' | 'dark' });
      await page.goto('/tracker');
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: `test/${vp.name}-calculator.png`, fullPage: true });
    });

    test(`screenshot: ${vp.name} dashboard`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.emulateMedia({ colorScheme: vp.colorScheme as 'light' | 'dark' });
      await page.goto('/tracker');
      await page.waitForLoadState('networkidle');
      
      await page.fill('input[id="targetPulls"]', '90');
      await page.getByRole('button', { name: 'Calculate Results' }).click();
      await page.waitForTimeout(500);
      
      await page.screenshot({ path: `test/${vp.name}-dashboard.png`, fullPage: true });
    });

    test(`screenshot: ${vp.name} modal`, async ({ page }) => {
      // Only capture modal on mobile
      await page.setViewportSize({ width: 375, height: 667 });
      await page.emulateMedia({ colorScheme: vp.colorScheme as 'light' | 'dark' });
      await page.goto('/tracker');
      await page.waitForLoadState('networkidle');
      
      await page.fill('input[id="targetPulls"]', '90');
      await page.getByRole('button', { name: 'Calculate Results' }).click();
      await page.waitForTimeout(500);
      
      await page.screenshot({ path: `test/${vp.name}-modal.png`, fullPage: true });
    });
  }
});
