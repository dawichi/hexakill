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

test('an invalid saved session is discarded safely', async ({ page }) => {
  await page.evaluate(() => {
    localStorage.setItem(
      'hexakill.angular.session.v1',
      JSON.stringify({
        version: 1,
        screen: 'combat',
        playerName: 'Agent',
        selectedCharacterId: 'wizard',
        player: { name: 'Agent', level: 0 },
        combatState: { phase: 'idle', enemy: null, playerDamageTaken: 0 },
      }),
    );
  });

  await page.reload();
  await expect(page.getByRole('heading', { name: 'Survive the dungeon.' })).toBeVisible();
  await expect(
    page.evaluate(() => localStorage.getItem('hexakill.angular.session.v1')),
  ).resolves.toBeNull();
});

test('the start journey is operable with keyboard activation', async ({ page }) => {
  const chooseButton = page.getByRole('button', { name: 'Choose your champion' });
  await chooseButton.focus();
  await expect(chooseButton).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('heading', { name: 'Choose a champion' })).toBeVisible();

  await page.getByLabel('Player name').fill('Agent');
  const wizardButton = page.getByRole('button', { name: /Wizard/ });
  await wizardButton.focus();
  await page.keyboard.press('Enter');
  const startButton = page.getByRole('button', { name: 'Start game' });
  await expect(startButton).toBeEnabled();
  await startButton.focus();
  await expect(startButton).toBeFocused();
  await startButton.press('Enter');
  await expect(page.getByRole('heading', { name: 'Welcome, Agent.' })).toBeVisible();
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
      stats: { health: 1, ad: 16, ap: 20, armor: 12, mr: 12, speed: 4 },
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
      playerDamageTaken: 1,
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
  await expect(page.locator('.record-row')).toContainText('Agent · Wizard');
  await expect(page.locator('.record-row')).toContainText('Level 4');

  await page.getByRole('button', { name: 'Start a new run' }).click();
  await expect(page.getByRole('heading', { name: 'Survive the dungeon.' })).toBeVisible();
  await expect(page.locator('.record-row')).toContainText('Agent · Wizard');
  await expect(
    page.evaluate(() => localStorage.getItem('hexakill.angular.records.v1')),
  ).resolves.toContain('Agent');

  const clearRecordsButton = page.getByRole('button', { name: 'Clear records' });
  await clearRecordsButton.focus();
  await expect(clearRecordsButton).toBeFocused();
  await clearRecordsButton.press('Enter');
  await expect(page.getByText('No records yet.')).toBeVisible();
  await expect(
    page.evaluate(() => localStorage.getItem('hexakill.angular.records.v1')),
  ).resolves.toBeNull();
});

test('a victory grants progression and a power-up choice', async ({ page }) => {
  await startRun(page);
  await expect
    .poll(() => page.evaluate(() => localStorage.getItem('hexakill.angular.session.v1')))
    .toContain('Agent');
  const snapshot = await page.evaluate(() =>
    JSON.parse(localStorage.getItem('hexakill.angular.session.v1') ?? '{}'),
  );
  snapshot.screen = 'combat';
  snapshot.combatState = {
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
      stats: { health: 1, ad: 1, ap: 1, armor: 1, mr: 1, speed: 1 },
      damageTaken: 1,
      potions: 0,
      gold: 100,
    },
    playerDamageTaken: 0,
    pendingAction: null,
    lastResult: null,
  };
  await page.evaluate((value) => {
    localStorage.setItem('hexakill.angular.session.v1', JSON.stringify(value));
  }, snapshot);
  await page.reload();

  await page.getByRole('button', { name: /Attack Physical damage/ }).click();
  await expect(page.getByText(/gained 100 exp and 100 gold/)).toBeVisible();
  await expect(page.getByText('Pending: 1')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Find another enemy' })).toBeDisabled();

  await page.locator('.power-up-panel').getByRole('button', { name: 'Attack' }).click();
  await expect(page.locator('.power-up-panel')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Find another enemy' })).toBeEnabled();
});

test('boss encounters advance in sequence after level ten', async ({ page }) => {
  await startRun(page);
  await expect
    .poll(() => page.evaluate(() => localStorage.getItem('hexakill.angular.session.v1')))
    .toContain('Agent');
  const snapshot = await page.evaluate(() =>
    JSON.parse(localStorage.getItem('hexakill.angular.session.v1') ?? '{}'),
  );
  snapshot.screen = 'combat';
  snapshot.player.level = 10;
  snapshot.player.bossesDefeated = 0;
  snapshot.combatState = {
    phase: 'awaiting-player-action',
    enemy: {
      definition: {
        id: 'gold-slime-1',
        name: 'Gold Slime 1',
        archetype: 'boss',
        modifiers: { health: 1.5, ad: 1.25, ap: 1.25, armor: 1.25, mr: 1.25, speed: 2 },
        idleAsset: '/images/slime-gold/idle.gif',
      },
      level: 15,
      stats: { health: 1, ad: 1, ap: 1, armor: 1, mr: 1, speed: 1 },
      damageTaken: 1,
      potions: 0,
      gold: 1000,
    },
    playerDamageTaken: 0,
    pendingAction: null,
    lastResult: null,
  };
  await page.evaluate((value) => {
    localStorage.setItem('hexakill.angular.session.v1', JSON.stringify(value));
  }, snapshot);
  await page.reload();

  await expect(page.getByRole('heading', { name: 'Gold Slime 1 appears.' })).toBeVisible();
  await page.getByRole('button', { name: /Attack Physical damage/ }).click();
  await expect(page.getByText(/gained 150 exp and 1000 gold/)).toBeVisible();
  await page.locator('.power-up-panel').getByRole('button', { name: 'Attack' }).click();
  await page.getByRole('button', { name: 'Find another enemy' }).click();
  await expect(page.getByRole('heading', { name: 'Gold Slime 2 appears.' })).toBeVisible();
});
