import { expect, test } from '@playwright/test';
import { chooseEncounter, savedRun, startRun, visitFresh } from './helpers';

test.beforeEach(async ({ page }) => visitFresh(page));

test('class selection shows each class passive and its real starting stats', async ({ page }) => {
  await page.getByRole('button', { name: 'Enter the dungeon' }).click();
  await page.getByLabel('Player name').fill('Warrior Main');
  await page.getByRole('button', { name: /Warrior/ }).click();
  const card = page.getByRole('button', { name: /Warrior/ });
  await expect(card).toContainText('Bulwark');
  await expect(card).toContainText('880 Health');
  await expect(card).toContainText('77 Attack');
  await page.getByRole('button', { name: 'Start run' }).click();
  await expect(page.locator('[data-screen="map"]')).toBeVisible();
  const run = await savedRun(page);
  expect((run['run'] as { player: { characterId: string } }).player.characterId).toBe('warrior');
});

test('seeded route and first map survive a reload', async ({ page }) => {
  await startRun(page, { name: 'Seeded Hero' });
  const firstPaths = await page.locator('[data-screen="map"] .door-card').allTextContents();
  expect(firstPaths.join(' ')).toContain('Skirmish');
  expect(firstPaths.join(' ')).toContain('Merchant');
  const before = await savedRun(page);
  await page.reload();
  await expect(page.locator('[data-screen="map"]')).toBeVisible();
  expect(await page.locator('[data-screen="map"] .door-card').allTextContents()).toEqual(
    firstPaths,
  );
  expect(await savedRun(page)).toEqual(before);
  await chooseEncounter(page);
  await expect(page.locator('[data-screen="combat"]')).toBeVisible();
});

test('a merchant sells potions and returns to the connected route', async ({ page }) => {
  await startRun(page);
  const before = await savedRun(page);
  const playerBefore = (before['run'] as { player: { gold: number; potions: number } }).player;
  await page.getByRole('button', { name: /Path 3: Unrevealed path/ }).click();
  await expect(page.getByRole('heading', { name: 'Spend your gold.' })).toBeVisible();
  const potionOffer = page.locator('[aria-label="Potion offers"] button').first();
  await potionOffer.click();
  const afterPurchase = await savedRun(page);
  const playerAfter = (afterPurchase['run'] as { player: { gold: number; potions: number } })
    .player;
  expect(playerAfter.gold).toBeLessThan(playerBefore.gold);
  expect(playerAfter.potions).toBeGreaterThan(playerBefore.potions);
  await page.getByRole('button', { name: 'Close store' }).click();
  await expect(page.locator('[data-screen="map"]')).toBeVisible();
});

test('the exit confirmation closes on Escape and keeps the active run', async ({ page }) => {
  await startRun(page);
  await page.getByRole('button', { name: 'Exit run' }).click();
  const dialog = page.getByRole('dialog', { name: 'Abandon this run?' });
  await expect(dialog).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(page.locator('[data-screen="map"]')).toBeVisible();

  await page.getByRole('button', { name: 'Exit run' }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Exit run' }).click();
  await expect(page.locator('[data-screen="welcome"]')).toBeVisible();
});
