import AxeBuilder from '@axe-core/playwright';
import { expect, type Page, test } from '@playwright/test';
import { chooseEncounter, setInstantText, startRun, visitFresh } from './helpers';

async function expectNoSeriousAxeViolations(page: Page): Promise<void> {
  const results = await new AxeBuilder({ page }).analyze();
  const serious = results.violations.filter(
    (violation) => violation.impact === 'critical' || violation.impact === 'serious',
  );
  expect(serious, JSON.stringify(serious, null, 2)).toEqual([]);
}

test('welcome, character selection, route, combat, and store have no serious axe violations', async ({
  page,
}) => {
  await visitFresh(page);
  await expectNoSeriousAxeViolations(page);
  await page.getByRole('button', { name: 'Enter the dungeon' }).click();
  await page.getByLabel('Player name').fill('Access Hero');
  await page.getByRole('button', { name: /Wizard/ }).click();
  await expectNoSeriousAxeViolations(page);
  await page.getByRole('button', { name: 'Start run' }).click();
  await expectNoSeriousAxeViolations(page);
  await setInstantText(page);
  await chooseEncounter(page);
  await expect(page.locator('[data-screen="combat"]')).toBeVisible();
  await expectNoSeriousAxeViolations(page);

  await page.goto('/?seed=1');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await startRun(page, { name: 'Access Hero' });
  await page.getByRole('button', { name: /Path 3: Unrevealed path/ }).click();
  await expect(page.locator('[data-screen="store"]')).toBeVisible();
  await expectNoSeriousAxeViolations(page);
});

test('combat messages are announced once and typed text and floating numbers stay hidden', async ({
  page,
}) => {
  await visitFresh(page);
  await startRun(page, { name: 'Access Hero' });
  await setInstantText(page);
  await chooseEncounter(page);
  await expect(page.locator('.battle-banner-text')).toHaveAttribute('aria-hidden', 'true');
  await expect(page.locator('.battle-banner [role="status"]')).toHaveAttribute(
    'aria-live',
    'polite',
  );
  await page.getByRole('button', { name: /Attack 1 Preview/ }).click();
  const combatFeedback = page.locator('.combat-feedback');
  await expect(combatFeedback.first()).toHaveAttribute('aria-hidden', 'true');
});
