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

test('a player can use a potion and reach the defeat screen', async ({ page }) => {
  const snapshot = {
    version: 1,
    screen: 'combat',
    playerName: 'Agent',
    selectedCharacterId: 'wizard',
    player: {
      name: 'Agent',
      character: {
        id: 'wizard',
        name: 'Wizard',
        description: 'Destroy enemies with explosive magic.',
        weakness: 'Weak in close combat.',
        modifiers: { health: 1, ad: 0.5, ap: 2, armor: 0.5, mr: 0.75, speed: 1.25 },
        accent: 'blue',
        idleAsset: '/images/wizard/idle.gif',
      },
      level: 4,
      experience: 0,
      stats: { health: 200, ad: 16, ap: 20, armor: 12, mr: 12, speed: 4 },
      potions: 1,
      gold: 2000,
      inventory: [],
      powerUps: { pending: 0, history: { health: 0, ad: 0, ap: 0, speed: 0 } },
      bossesDefeated: 0,
    },
    combatState: {
      phase: 'awaiting-player-action',
      enemy: {
        definition: {
          id: 'knight',
          name: 'Knight',
          archetype: 'tank',
          modifiers: { health: 1.75, ad: 0.5, ap: 0.5, armor: 1.75, mr: 1.75, speed: 0.75 },
          idleAsset: '/images/knight/idle.gif',
        },
        level: 4,
        stats: { health: 300, ad: 5000, ap: 5000, armor: 12, mr: 12, speed: 1 },
        damageTaken: 0,
        potions: 0,
        gold: 100,
      },
      playerDamageTaken: 199,
      pendingAction: null,
      lastResult: null,
    },
  };

  await page.evaluate((value) => {
    localStorage.setItem('hexakill.angular.session.v1', JSON.stringify(value));
  }, snapshot);
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Knight appears.' })).toBeVisible();

  await page.getByRole('button', { name: 'Potion' }).click();
  await expect(page.getByRole('heading', { name: 'Game over.' })).toBeVisible();
});
