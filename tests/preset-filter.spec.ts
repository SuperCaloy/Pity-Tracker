import { test, expect } from '@playwright/test';

test('picker opens with all games and filters as you type', async ({ page }) => {
  await page.goto('/tracker');
  const box = page.getByRole('combobox', { name: 'Game Preset' });
  await expect(box).toHaveValue('Genshin Impact');

  await box.click();
  await expect(page.getByRole('listbox')).toBeVisible();
  await expect(page.getByRole('option')).toHaveCount(11);

  await box.fill('nikke');
  await expect(page.getByRole('option')).toHaveCount(1);
  await expect(page.getByRole('option', { name: /Goddess of Victory: NIKKE/ })).toBeVisible();

  await box.fill('kuro');
  await expect(page.getByRole('option', { name: /Wuthering Waves/ })).toBeVisible();
});

test('Enter selects the highlighted match and updates the banner', async ({ page }) => {
  await page.goto('/tracker');
  const box = page.getByRole('combobox', { name: 'Game Preset' });

  await box.click();
  await box.fill('gen');
  await expect(page.getByRole('option')).toHaveCount(2);
  await box.press('ArrowDown');
  await box.press('Enter');

  await expect(box).toHaveValue('Genshin Impact Weapon');
  await expect(page.getByRole('listbox')).toBeHidden();
  await expect(page.getByText('Version 7.1 Phase 1 Weapon')).toBeVisible();
});

test('empty state shows and Escape reverts to the selected game', async ({ page }) => {
  await page.goto('/tracker');
  const box = page.getByRole('combobox', { name: 'Game Preset' });

  await box.click();
  await box.fill('xyz-no-match');
  await expect(page.getByRole('option')).toHaveCount(0);
  await expect(page.getByText(/No games match/)).toBeVisible();
  await box.press('Enter');
  await expect(box).toHaveValue('xyz-no-match');

  await box.press('Escape');
  await expect(box).toHaveValue('Genshin Impact');
  await expect(page.getByRole('listbox')).toBeHidden();
});
