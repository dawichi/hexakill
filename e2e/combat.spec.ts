import { expect, test } from '@playwright/test';
import { chooseEncounter, savedRun, setInstantText, startRun, visitFresh } from './helpers';

test.beforeEach(async ({ page }) => visitFresh(page));

test('combat previews damage, accepts the action shortcut, and commits before animation', async ({
  page,
}) => {
  await startRun(page, { name: 'Combat Hero' });
  await setInstantText(page);
  await chooseEncounter(page);
  await expect(page.locator('[data-screen="combat"]')).toBeVisible();
  const attack = page.getByRole('button', { name: /Attack 1 Preview/ });
  await expect(attack).toBeEnabled();
  await expect(attack).toContainText(/Preview \d+–\d+ vs Armor|Preview \d+ vs Armor/);
  await expect(page.getByRole('button', { name: /Magic 2 Preview/ })).toContainText('Magic resist');
  await expect(page.getByRole('button', { name: /Guard 3/ })).toContainText('until your next turn');

  const before = await savedRun(page);
  await page.keyboard.press('1');
  const committed = await savedRun(page);
  expect(committed).not.toEqual(before);
  expect(
    (committed['run'] as { combat: { counters: { playerActions: number } } }).combat.counters
      .playerActions,
  ).toBe(1);
  await page.reload();
  await expect(page.locator('[data-screen="combat"]')).toBeVisible();
  expect(await savedRun(page)).toEqual(committed);
  await expect(page.getByRole('status')).toContainText('saved run was restored');
});

test('the Witch Blue idle strip renders on the seeded encounter', async ({ page }) => {
  await visitFresh(page, '36');
  await startRun(page, { name: 'Sprite Hero' });
  await setInstantText(page);
  await chooseEncounter(page);
  const witch = page.getByRole('img', { name: 'Blue Witch idle animation' });
  await expect(witch).toBeVisible();
  await expect(witch).toHaveCSS('background-image', /B_witch_idle/);
  await expect(witch).toHaveCSS('background-size', /100% 900%/);
});

test('the M shortcut toggles mute while the numeric action shortcuts stay available', async ({
  page,
}) => {
  await startRun(page);
  await setInstantText(page);
  await chooseEncounter(page);
  await expect(page.getByRole('button', { name: /Attack 1/ })).toBeEnabled();
  await page.keyboard.press('m');
  const preferences = await page.evaluate(() =>
    JSON.parse(localStorage.getItem('hexakill.preferences.v2') ?? '{}'),
  );
  expect(preferences.muted).toBe(true);
});
