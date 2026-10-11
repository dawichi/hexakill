import { expect, type Page, test } from '@playwright/test';
import { chooseEncounter, savedRun, setInstantText, startRun, visitFresh } from './helpers';

type CombatMessageChange = { at: number; text: string };

async function recordCombatMessageTimeline(page: Page): Promise<void> {
  await page.evaluate(() => {
    const message = document.querySelector('.battle-banner-text');
    if (!message) throw new Error('Combat message element not found.');
    const timeline: CombatMessageChange[] = [];
    const observer = new MutationObserver(() => {
      timeline.push({ at: performance.now(), text: message.textContent?.trim() ?? '' });
    });
    observer.observe(message, { childList: true, characterData: true, subtree: true });
    (
      window as typeof window & { __combatMessageTimeline?: CombatMessageChange[] }
    ).__combatMessageTimeline = timeline;
  });
}

async function readCombatMessageTimeline(page: Page): Promise<CombatMessageChange[]> {
  return page.evaluate(
    () =>
      (window as typeof window & { __combatMessageTimeline?: CombatMessageChange[] })
        .__combatMessageTimeline ?? [],
  );
}

function actionMessageHoldMs(timeline: readonly CombatMessageChange[]): number {
  const completeActionAt = timeline.find((entry) => entry.text === 'You use Magic.')?.at;
  expect(completeActionAt).toBeDefined();
  const nextMessage = timeline.find(
    (entry) =>
      entry.at > (completeActionAt ?? 0) &&
      entry.text.length > 0 &&
      entry.text !== 'You use Magic.',
  );
  expect(nextMessage).toBeDefined();
  return (nextMessage?.at ?? 0) - (completeActionAt ?? 0);
}

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

test('keeps an action message visible through its typewriter and reading pause', async ({
  page,
}) => {
  await startRun(page, { name: 'Pacing Hero' });
  await chooseEncounter(page);
  const magic = page.getByRole('button', { name: /Magic 2/ });
  await expect(magic).toBeEnabled();
  await recordCombatMessageTimeline(page);

  await magic.click();
  await page.waitForTimeout(1200);
  expect(actionMessageHoldMs(await readCombatMessageTimeline(page))).toBeGreaterThanOrEqual(350);
});

test('preserves message pacing when reduced motion is enabled', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await startRun(page, { name: 'Reduced Motion Hero' });
  await chooseEncounter(page);
  const magic = page.getByRole('button', { name: /Magic 2/ });
  await expect(magic).toBeEnabled();
  await recordCombatMessageTimeline(page);

  await magic.click();
  await page.waitForTimeout(850);
  expect(actionMessageHoldMs(await readCombatMessageTimeline(page))).toBeGreaterThanOrEqual(600);
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
