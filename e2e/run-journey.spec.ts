import { expect, test } from '@playwright/test';

async function startRun(
  page: import('@playwright/test').Page,
  characterName = 'Wizard',
): Promise<void> {
  await page.getByText('How to play', { exact: true }).click();
  await expect(
    page.getByText('Choose a champion, find enemies, and survive as many encounters as possible.'),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Choose your champion' }).click();
  await page.getByLabel('Player name').fill('Agent');
  await expect(page.locator('.character-art')).toHaveCount(3);
  await page.getByRole('button', { name: new RegExp(characterName) }).click();
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

  const storeButton = page.getByRole('button', { name: 'Store' });
  await storeButton.focus();
  await expect(storeButton).toBeFocused();
  await storeButton.press('Enter');
  const storeHeading = page.getByRole('heading', { name: 'Spend your gold.' });
  await expect(storeHeading).toBeVisible();
  await expect(storeHeading).toBeFocused();
  const swordButton = page.getByRole('button', { name: /Sword/ });
  await swordButton.focus();
  await expect(swordButton).toBeFocused();
  await swordButton.press('Enter');
  await expect(page.getByText('Gold: 1100')).toBeVisible();

  const closeStoreButton = page.getByRole('button', { name: 'Close store' });
  await closeStoreButton.focus();
  await closeStoreButton.press('Enter');
  await expect(page.getByRole('heading', { name: 'Welcome, Agent.' })).toBeFocused();
  const findEnemyButton = page.getByRole('button', { name: 'Find an enemy' });
  await findEnemyButton.focus();
  await findEnemyButton.press('Enter');
  await expect(page.getByRole('heading', { name: /appears/ })).toBeVisible();
  await expect(page.locator('.inventory-item').getByRole('img', { name: 'Sword' })).toBeVisible();
  await expect(page.getByText(/216 attack/)).toBeVisible();
  await expect(page.getByRole('meter', { name: 'Enemy health' })).toHaveAttribute(
    'aria-valuemin',
    '0',
  );
  const attackButton = page.getByRole('button', { name: 'Attack' });
  await expect(attackButton).toBeEnabled();
  await attackButton.click();
  const playerAction = page.getByRole('img', { name: 'Wizard action animation' });
  await expect(playerAction).toBeVisible();
  await expect(playerAction).toHaveAttribute('aria-label', 'Wizard action animation');
  await expect(playerAction).toHaveCSS('background-image', /wizard/);
});

test('the Samurai uses its mapped player action strip', async ({ page }) => {
  await startRun(page, 'Samurai');

  await page.getByRole('button', { name: 'Find an enemy' }).click();
  const attackButton = page.getByRole('button', { name: 'Attack' });
  await expect(attackButton).toBeEnabled();
  await attackButton.click();

  const playerAction = page.getByRole('img', { name: 'Samurai action animation' });
  await expect(playerAction).toBeVisible();
  await expect(playerAction).toHaveAttribute('aria-label', 'Samurai action animation');
  await expect(playerAction).toHaveCSS('background-image', /samurai/);
});

test('mapped enemy attack strips render during the enemy turn', async ({ page }) => {
  await startRun(page);
  const snapshot = await page.evaluate(() =>
    JSON.parse(localStorage.getItem('hexakill.angular.session.v1') ?? '{}'),
  );
  snapshot.screen = 'combat';
  snapshot.combatState = {
    phase: 'awaiting-player-action',
    enemy: {
      definition: {
        id: 'evil-wizard',
        name: 'Evil Wizard',
        archetype: 'ap',
        modifiers: { health: 1, ad: 0.5, ap: 1.5, armor: 1, mr: 1, speed: 1 },
        idleAsset: '/images/evil-wizard/idle.gif',
      },
      level: 4,
      stats: { health: 100, ad: 1, ap: 1, armor: 1, mr: 1, speed: 1 },
      damageTaken: 0,
      potions: 0,
      gold: 100,
    },
    playerDamageTaken: 20,
    pendingAction: null,
    lastResult: null,
  };
  await page.evaluate((value) => {
    localStorage.setItem('hexakill.angular.session.v1', JSON.stringify(value));
  }, snapshot);
  await page.reload();

  await page.getByRole('button', { name: 'Potion' }).click();
  const enemyAttack = page.getByRole('img', { name: 'Evil Wizard attack animation' });
  await expect(enemyAttack).toBeVisible();
  await expect(enemyAttack).toHaveCSS('background-image', /evil-wizard/);
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

test('audio preferences are keyboard-accessible and restored independently', async ({ page }) => {
  const musicVolume = page.getByLabel('Music volume');
  const effectsVolume = page.getByLabel('Effects volume');
  await musicVolume.fill('0.12');
  await effectsVolume.fill('0.31');
  await expect(musicVolume).toHaveAttribute('aria-valuetext', '12 percent');
  await expect(effectsVolume).toHaveAttribute('aria-valuetext', '31 percent');
  await expect
    .poll(() => page.evaluate(() => localStorage.getItem('hexakill.angular.preferences.v1')))
    .toContain('0.12');

  await page.reload();
  await expect(musicVolume).toHaveValue('0.12');
  await expect(effectsVolume).toHaveValue('0.31');
  await musicVolume.focus();
  await expect(musicVolume).toBeFocused();
});

test('reduced motion and a narrow viewport remain usable', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.reload();

  await expect(page.getByRole('heading', { name: 'Survive the dungeon.' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Choose your champion' })).toHaveCSS(
    'transition-duration',
    '1e-05s',
  );
  const dimensions = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth);
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

test('an incoherent restored screen is discarded safely', async ({ page }) => {
  await page.evaluate(() => {
    localStorage.setItem(
      'hexakill.angular.session.v1',
      JSON.stringify({
        version: 1,
        screen: 'combat',
        playerName: '',
        selectedCharacterId: null,
        player: null,
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

test('a whitespace-only restored player is discarded safely', async ({ page }) => {
  await page.evaluate(() => {
    localStorage.setItem(
      'hexakill.angular.session.v1',
      JSON.stringify({
        version: 1,
        screen: 'combat',
        playerName: '   ',
        selectedCharacterId: 'wizard',
        player: { name: '   ', level: 4 },
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

test('negative restored stats are discarded safely', async ({ page }) => {
  await startRun(page);
  const snapshot = await page.evaluate(() =>
    JSON.parse(localStorage.getItem('hexakill.angular.session.v1') ?? '{}'),
  );
  snapshot.player.stats.health = -1;
  await page.evaluate((value) => {
    localStorage.setItem('hexakill.angular.session.v1', JSON.stringify(value));
  }, snapshot);

  await page.reload();
  await expect(page.getByRole('heading', { name: 'Survive the dungeon.' })).toBeVisible();
  await expect(
    page.evaluate(() => localStorage.getItem('hexakill.angular.session.v1')),
  ).resolves.toBeNull();
});

test('a restored run with unbound character metadata is discarded safely', async ({ page }) => {
  await startRun(page);
  const snapshot = await page.evaluate(() =>
    JSON.parse(localStorage.getItem('hexakill.angular.session.v1') ?? '{}'),
  );
  snapshot.selectedCharacterId = null;
  snapshot.player.character.modifiers.health = 9999;
  await page.evaluate((value) => {
    localStorage.setItem('hexakill.angular.session.v1', JSON.stringify(value));
  }, snapshot);

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
  const selectHeading = page.getByRole('heading', { name: 'Choose a champion' });
  await expect(selectHeading).toBeVisible();
  await expect(selectHeading).toBeFocused();

  await page.getByLabel('Player name').fill('Agent');
  const wizardButton = page.getByRole('button', { name: /Wizard/ });
  await wizardButton.focus();
  await page.keyboard.press('Enter');
  const startButton = page.getByRole('button', { name: 'Start game' });
  await expect(startButton).toBeEnabled();
  await startButton.focus();
  await expect(startButton).toBeFocused();
  await startButton.press('Enter');
  const readyHeading = page.getByRole('heading', { name: 'Welcome, Agent.' });
  await expect(readyHeading).toBeVisible();
  await expect(readyHeading).toBeFocused();
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
      defeatedEnemies: [{ enemyId: 'slime-blue', level: 3 }],
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

  const potionButton = page.getByRole('button', { name: 'Potion' });
  await potionButton.focus();
  await expect(potionButton).toBeFocused();
  await potionButton.press('Enter');
  const gameOverHeading = page.getByRole('heading', { name: 'Game over.' });
  await expect(gameOverHeading).toBeVisible();
  await expect(gameOverHeading).toBeFocused();
  const playerDefeat = page.getByRole('img', { name: 'Wizard defeat animation' });
  await expect(playerDefeat).toBeVisible();
  await expect(playerDefeat).toHaveCSS('background-image', /wizard/);
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Game over.' })).toBeVisible();
  await expect(page.getByRole('img', { name: 'Wizard defeat animation' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Enemies defeated' })).toBeVisible();
  await expect(page.locator('.enemy-history-row')).toContainText('Slime Blue');
  await expect(page.locator('.enemy-history-row')).toContainText('Levels: 3');
  await expect(page.locator('.record-row')).toContainText('Agent · Wizard');
  await expect(page.locator('.record-row')).toContainText('Level 4');

  await page.getByRole('button', { name: 'Start a new run' }).click();
  const welcomeHeading = page.getByRole('heading', { name: 'Survive the dungeon.' });
  await expect(welcomeHeading).toBeVisible();
  await expect(welcomeHeading).toBeFocused();
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
  await page.emulateMedia({ reducedMotion: 'reduce' });
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
        id: 'wild-huntress',
        name: 'Wild Huntress',
        archetype: 'ad',
        modifiers: { health: 0.75, ad: 1.5, ap: 0.5, armor: 1, mr: 1, speed: 1.5 },
        idleAsset: '/images/wild-huntress/idle.gif',
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

  const attackButton = page.getByRole('button', { name: /Attack Physical damage/ });
  await attackButton.focus();
  await expect(attackButton).toBeFocused();
  await attackButton.press('Enter');
  await expect(page.getByText(/gained 100 exp and 100 gold/)).toBeVisible();
  await expect(page.getByRole('img', { name: 'Wizard action animation' })).toHaveCSS(
    'animation-name',
    'none',
  );
  const enemyDefeat = page.locator('.enemy-sprite-strip');
  await expect(enemyDefeat).toBeVisible();
  await expect(enemyDefeat).toHaveAttribute('aria-label', 'Wild Huntress defeat animation');
  await expect(enemyDefeat).toHaveCSS('background-image', /wild-huntress/);
  await expect(enemyDefeat).toHaveCSS('animation-name', 'none');
  await expect(page.getByText('Pending: 1')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Power-up available' })).toBeFocused();
  await expect(page.getByRole('button', { name: 'Find another enemy' })).toBeDisabled();

  const powerUpAttack = page.locator('.power-up-panel').getByRole('button', { name: 'Attack' });
  await powerUpAttack.focus();
  await expect(powerUpAttack).toBeFocused();
  await powerUpAttack.press('Enter');
  await expect(page.locator('.power-up-panel')).toHaveCount(0);
  const nextEnemyButton = page.getByRole('button', { name: 'Find another enemy' });
  await expect(nextEnemyButton).toBeEnabled();
  await expect(nextEnemyButton).toBeFocused();
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
