import { expect, test } from '@playwright/test';
import { startRun, visitFresh } from './helpers';

test.beforeEach(async ({ page }) => visitFresh(page));

test('the welcome screen explains combat and route choices', async ({ page }) => {
  await expect(page.getByRole('heading', { name: 'HEXAKILL' })).toBeVisible();
  await expect(page.locator('.guide-action-list')).toContainText('Guard');
  await expect(page.locator('.how-to-play')).toContainText('Arcane mark');
  await expect(page.locator('.how-to-play')).toContainText('Block absorbs each hit');
  for (const kind of ['Skirmish', 'Elite', 'Merchant', 'Campfire', 'Boss']) {
    await expect(page.locator('.guide-route-list')).toContainText(kind);
  }
});

test('settings persist percent volume and combat text speed', async ({ page }) => {
  await page.locator('.settings-trigger').click();
  const music = page.getByLabel('Music volume');
  const slider = await music.boundingBox();
  if (!slider) throw new Error('Music volume slider is not visible');
  await page.mouse.click(slider.x + slider.width - 1, slider.y + slider.height / 2);
  await page.getByLabel('Combat text speed').selectOption('instant');
  await expect(music).toHaveAttribute('aria-valuetext', '100 percent');
  const preferences = await page.evaluate(() =>
    JSON.parse(localStorage.getItem('hexakill.preferences.v2') ?? '{}'),
  );
  expect(preferences).toMatchObject({ version: 2, musicVolume: 0.5, textSpeed: 'instant' });

  await page.reload();
  await page.locator('.settings-trigger').click();
  await expect(page.getByLabel('Music volume')).toHaveAttribute('aria-valuetext', '100 percent');
  await expect(page.getByLabel('Combat text speed')).toHaveValue('instant');
});

test('the daily challenge stores a dated run in the daily list', async ({ page }) => {
  await startRun(page, { character: 'Samurai', daily: true, name: 'Daily Hero' });
  const envelope = await page.evaluate(() =>
    JSON.parse(localStorage.getItem('hexakill.session.v2') ?? '{}'),
  );
  expect(envelope.run.daily).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  expect(envelope.run.player.characterId).toBe('samurai');
  expect(envelope.run.seed).toEqual(expect.any(Number));
});
