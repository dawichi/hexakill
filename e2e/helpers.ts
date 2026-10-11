import { expect, type Page } from '@playwright/test';

export async function visitFresh(page: Page, seed = '1'): Promise<void> {
  await page.addInitScript(() => {
    const initialized = 'hexakill.e2e.initialized';
    if (!sessionStorage.getItem(initialized)) {
      localStorage.clear();
      sessionStorage.setItem(initialized, 'true');
    }
  });
  await page.goto(`/?seed=${seed}`);
  await expect(page.getByRole('heading', { name: 'Survive the dungeon.' })).toBeVisible();
}

export async function startRun(
  page: Page,
  options: { character?: string; daily?: boolean; name?: string } = {},
): Promise<void> {
  const { character = 'Wizard', daily = false, name = 'Hero' } = options;
  await page.getByRole('button', { name: daily ? /Play today/ : 'Enter the dungeon' }).click();
  await page.getByLabel('Player name').fill(name);
  await page.getByRole('button', { name: new RegExp(character) }).click();
  await page.getByRole('button', { name: 'Start run' }).click();
  await expect(page.locator('[data-screen="map"]')).toBeVisible();
}

export async function chooseRoute(page: Page, label: string): Promise<void> {
  await page
    .getByRole('button', { name: new RegExp(`Path \\d+: ${label}`) })
    .first()
    .click();
}

export async function chooseEncounter(page: Page): Promise<void> {
  const skirmish = page.getByRole('button', { name: /Path \d+: Skirmish/ });
  if (await skirmish.count()) return skirmish.first().click();
  const elite = page.getByRole('button', { name: /Path \d+: Elite/ });
  if (await elite.count()) return elite.first().click();
  await page
    .getByRole('button', { name: /Path \d+: Boss/ })
    .first()
    .click();
}

export async function setInstantText(page: Page): Promise<void> {
  const settings = page.locator('.settings-popover');
  if (!(await settings.evaluate((element) => (element as HTMLDetailsElement).open))) {
    await settings.locator('summary').click();
  }
  await page.getByLabel('Combat text speed').selectOption('instant');
  await settings.locator('summary').click();
}

export async function savedRun(page: Page): Promise<Record<string, unknown>> {
  return page.evaluate(() => JSON.parse(localStorage.getItem('hexakill.session.v2') ?? '{}'));
}
