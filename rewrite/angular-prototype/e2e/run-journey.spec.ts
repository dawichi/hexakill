import { expect, test } from '@playwright/test';

async function startRun(page: import('@playwright/test').Page): Promise<void> {
  await page.getByRole('button', { name: 'Choose your champion' }).click();
  await page.getByLabel('Player name').fill('Agent');
  await page.getByRole('button', { name: /Wizard/ }).click();
  await page.getByRole('button', { name: 'Start game' }).click();
  await expect(page.getByRole('heading', { name: 'Welcome, Agent.' })).toBeVisible();
}

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
});

test('a player can start a run, buy an item, and enter combat', async ({ page }) => {
  await startRun(page);

  await page.getByRole('button', { name: 'Store' }).click();
  await expect(page.getByRole('heading', { name: 'Spend your gold.' })).toBeVisible();
  await page.getByRole('button', { name: /Sword/ }).click();
  await expect(page.getByText('Gold: 1100')).toBeVisible();

  await page.getByRole('button', { name: 'Close store' }).click();
  await page.getByRole('button', { name: 'Find an enemy' }).click();
  await expect(page.getByRole('heading', { name: /appears/ })).toBeVisible();
  await expect(page.getByText(/216 attack/)).toBeVisible();
  await expect(page.getByRole('button', { name: 'Attack' })).toBeEnabled();
});

test('a run is restored after a browser reload', async ({ page }) => {
  await startRun(page);
  await expect
    .poll(() => page.evaluate(() => localStorage.getItem('hexakill.angular.session.v1')))
    .toContain('Agent');

  await page.reload();
  await expect(page.getByRole('heading', { name: 'Welcome, Agent.' })).toBeVisible();
  await expect(page.getByText('LEVEL 4 WIZARD')).toBeVisible();
});
