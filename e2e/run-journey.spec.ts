import { expect, test } from '@playwright/test';

type MusicWindow = Window & { __hexakillMusicAttempts?: string[] };

async function startRun(
  page: import('@playwright/test').Page,
  characterName = 'Wizard',
): Promise<void> {
  await expect(page.locator('.how-to-play-intro')).toBeVisible();
  await page.getByRole('button', { name: 'Enter the dungeon' }).click();
  await page.getByLabel('Player name').fill('Agent');
  await expect(page.locator('.character-art')).toHaveCount(3);
  await page.getByRole('button', { name: new RegExp(characterName) }).click();
  await page.getByRole('button', { name: 'Start run' }).click();
  await expect(page.locator('[data-screen="map"]')).toBeVisible();
  await page.locator('[data-screen="map"] .door-card').first().click();
  await expect(page.locator('[data-screen="combat"]')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Attack' })).toBeEnabled();
  await expect
    .poll(() => page.evaluate(() => localStorage.getItem('hexakill.angular.session.v1')))
    .toContain('Agent');
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    Math.random = () => 0.5;
  });
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
});

test('a player can start a run, buy an item, and enter combat', async ({ page }) => {
  await startRun(page);

  const snapshot = await page.evaluate(() =>
    JSON.parse(localStorage.getItem('hexakill.angular.session.v1') ?? '{}'),
  );
  snapshot.combatState.phase = 'victory';
  snapshot.combatState.enemy.damageTaken = snapshot.combatState.enemy.stats.health;
  snapshot.routeMap = {
    floor: 1,
    nodes: [
      {
        id: 'merchant-node',
        kind: 'store',
        title: 'Merchant',
        description: 'Trade your gold.',
        reward: 'Shop',
      },
      {
        id: 'battle-node',
        kind: 'battle',
        title: 'Skirmish',
        description: 'Fight.',
        reward: 'Gold',
      },
      {
        id: 'rest-node',
        kind: 'rest',
        title: 'Campfire',
        description: 'Rest.',
        reward: 'Health',
      },
    ],
  };
  await page.evaluate((value) => {
    localStorage.setItem('hexakill.angular.session.v1', JSON.stringify(value));
  }, snapshot);
  await page.reload();
  await page.getByRole('button', { name: /View route map/ }).click();
  await expect(page.locator('[data-screen="map"]')).toBeVisible();
  const storeButton = page.getByRole('button', { name: /Merchant:/ });
  await storeButton.focus();
  await expect(storeButton).toBeFocused();
  await storeButton.press('Enter');
  const storeHeading = page.getByRole('heading', { name: 'Spend your gold.' });
  await expect(storeHeading).toBeVisible();
  await expect(storeHeading).toBeFocused();
  const relicButton = page
    .locator('[data-screen="store"] .store-grid')
    .nth(1)
    .getByRole('button')
    .first();
  await relicButton.focus();
  await expect(relicButton).toBeFocused();
  await relicButton.press('Enter');
  await expect(page.locator('[data-screen="store"] .store-balance')).toContainText('Gold:');

  const closeStoreButton = page.getByRole('button', { name: 'Close store' });
  await closeStoreButton.focus();
  await closeStoreButton.press('Enter');
  await expect(page.getByRole('heading', { name: 'Choose a door' })).toBeFocused();
  await page.getByRole('button', { name: /Skirmish:/ }).click();
  await expect(page.locator('[data-screen="combat"]')).toBeVisible();
  await expect(page.locator('.inventory-item')).toHaveCount(1);
  await expect(page.getByRole('meter', { name: 'Enemy health' })).toHaveAttribute(
    'aria-valuemin',
    '0',
  );
  await expect(page.getByRole('meter', { name: 'Your health' })).toBeVisible();
  await expect(page.getByRole('progressbar', { name: 'Experience to next level' })).toBeVisible();
  await expect(page.locator('.player-combatant .health-bar')).toHaveClass(/healthy/);
  const playerIdle = page.getByRole('img', { name: 'Wizard idle animation', exact: true });
  await expect(playerIdle).toBeVisible();
  await expect(playerIdle).toHaveCSS('background-image', /wizard\/sprites\/Idle/);
  await expect(playerIdle).toHaveCSS('background-size', /600% 100%/);
  const attackButton = page.getByRole('button', { name: 'Attack' });
  await expect(attackButton).toBeEnabled();
  await attackButton.click();
  const playerAction = page.getByRole('img', { name: 'Wizard action animation' });
  await expect(playerAction).toBeVisible();
  await expect(playerAction).toHaveAttribute('aria-label', 'Wizard action animation');
  await expect(playerAction).toHaveCSS('background-image', /wizard/);
  await expect(page.locator('.battle-banner')).toContainText('dealt');
  await expect(page.locator('.combat-log')).toHaveCount(0);
});

test('music starts on the welcome screen and follows screen transitions', async ({ page }) => {
  await page.addInitScript(() => {
    const attempts: string[] = [];
    Object.defineProperty(window, '__hexakillMusicAttempts', { value: attempts });
    const originalPlay = HTMLMediaElement.prototype.play;
    HTMLMediaElement.prototype.play = function () {
      if (this.src.includes('/music/')) attempts.push(this.src);
      return originalPlay.call(this);
    };
  });

  await page.goto('/');
  await expect
    .poll(() => page.evaluate(() => (window as MusicWindow).__hexakillMusicAttempts ?? []))
    .toEqual(expect.arrayContaining([expect.stringContaining('/music/welcome.mp3')]));

  await page.getByRole('button', { name: 'Enter the dungeon' }).click();
  await expect
    .poll(() => page.evaluate(() => (window as MusicWindow).__hexakillMusicAttempts ?? []))
    .toEqual(expect.arrayContaining([expect.stringContaining('/music/champSelect.mp3')]));
});

test('the Samurai uses its mapped player action strip', async ({ page }) => {
  await startRun(page, 'Samurai');

  const snapshot = await page.evaluate(() =>
    JSON.parse(localStorage.getItem('hexakill.angular.session.v1') ?? '{}'),
  );
  snapshot.player.stats.speed = 100;
  await page.evaluate((value) => {
    localStorage.setItem('hexakill.angular.session.v1', JSON.stringify(value));
  }, snapshot);
  await page.reload();
  await expect(page.locator('[data-screen="combat"]')).toBeVisible();
  const attackButton = page.getByRole('button', { name: 'Attack' });
  await expect(attackButton).toBeEnabled();
  await attackButton.click();

  const playerAction = page.getByRole('img', { name: 'Samurai action animation' });
  await expect(playerAction).toBeVisible();
  await expect(playerAction).toHaveAttribute('aria-label', 'Samurai action animation');
  await expect(playerAction).toHaveCSS('background-image', /samurai/);
});

test('the Knight uses its mapped idle strip in combat', async ({ page }) => {
  await startRun(page);
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
      stats: { health: 100, ad: 1, ap: 1, armor: 1, mr: 1, speed: 1 },
      damageTaken: 0,
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

  const knightIdle = page.getByRole('img', { name: 'Knight idle animation' });
  await expect(knightIdle).toBeVisible();
  await expect(knightIdle).toHaveCSS('background-image', /knight\/idle\.png/);
  await expect(knightIdle).toHaveCSS('background-size', /400% 100%/);
});

test('Magic uses the mapped secondary player action strip', async ({ page }) => {
  await startRun(page);

  const snapshot = await page.evaluate(() =>
    JSON.parse(localStorage.getItem('hexakill.angular.session.v1') ?? '{}'),
  );
  snapshot.player.stats.speed = 100;
  await page.evaluate((value) => {
    localStorage.setItem('hexakill.angular.session.v1', JSON.stringify(value));
  }, snapshot);
  await page.reload();
  await expect(page.locator('[data-screen="combat"]')).toBeVisible();
  const magicButton = page.getByRole('button', { name: 'Magic' });
  await expect(magicButton).toBeEnabled();
  await magicButton.click();

  const playerAction = page.getByRole('img', { name: 'Wizard action animation' });
  await expect(playerAction).toBeVisible();
  await expect(playerAction).toHaveCSS('background-image', /wizard\/sprites\/Attack2/);
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
  await page.addInitScript(() => {
    Math.random = () => 0.5;
  });
  await page.reload();

  const enemyIdle = page.getByRole('img', { name: 'Evil Wizard idle animation' });
  await expect(enemyIdle).toBeVisible();
  await expect(enemyIdle).toHaveCSS('background-image', /evil-wizard\/sprites\/Idle/);
  await expect(enemyIdle).toHaveCSS('background-size', /800% 100%/);
  await page.getByRole('button', { name: 'Potion' }).click();
  const enemyAttack = page.getByRole('img', { name: 'Evil Wizard attack animation' });
  await expect(enemyAttack).toBeVisible();
  await expect(enemyAttack).toHaveCSS('background-image', /evil-wizard/);
  const playerHit = page.getByRole('img', { name: 'Wizard hit animation' });
  await expect(playerHit).toBeVisible();
  await expect(playerHit).toHaveCSS('background-image', /wizard\/sprites\/Hit/);
});

test('mapped enemy magic strips render during a magic enemy turn', async ({ page }) => {
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
  await page.addInitScript(() => {
    Math.random = () => 0.75;
  });
  await page.reload();

  await page.getByRole('button', { name: 'Potion' }).click();
  const enemyMagic = page.getByRole('img', { name: 'Evil Wizard magic animation' });
  await expect(enemyMagic).toBeVisible();
  await expect(enemyMagic).toHaveCSS('background-image', /evil-wizard\/sprites\/Attack2/);
});

test('vertical Witch Blue attack and defeat strips render in their states', async ({ page }) => {
  await startRun(page);
  const snapshot = await page.evaluate(() =>
    JSON.parse(localStorage.getItem('hexakill.angular.session.v1') ?? '{}'),
  );
  snapshot.screen = 'combat';
  snapshot.combatState = {
    phase: 'awaiting-player-action',
    enemy: {
      definition: {
        id: 'witch-blue',
        name: 'Witch Blue',
        archetype: 'ap',
        modifiers: { health: 1, ad: 0.5, ap: 1.5, armor: 1, mr: 1, speed: 1 },
        idleAsset: '/images/witch-blue/idle.gif',
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
  await page.addInitScript(() => {
    Math.random = () => 0.5;
  });
  await page.reload();

  const idleEnemy = page.getByRole('img', { name: 'Witch Blue idle animation' });
  await expect(idleEnemy).toHaveCSS('background-image', /witch-blue\/assets\/B_witch_idle/);
  await expect(idleEnemy).toHaveCSS('background-size', /100% 900%/);

  await page.getByRole('button', { name: 'Potion' }).click();
  const enemyAttack = page.getByRole('img', { name: 'Witch Blue attack animation' });
  await expect(enemyAttack).toBeVisible();
  await expect(enemyAttack).toHaveCSS('background-size', /100% 400%/);

  const magicSnapshot = await page.evaluate(() =>
    JSON.parse(localStorage.getItem('hexakill.angular.session.v1') ?? '{}'),
  );
  magicSnapshot.combatState.enemy.stats.health = 100;
  magicSnapshot.combatState.enemy.damageTaken = 0;
  magicSnapshot.combatState.playerDamageTaken = 20;
  // Re-roll the next visible intent for this fixture after restoring the
  // combat state with the updated v2 intent model.
  magicSnapshot.combatState.enemyIntent = null;
  await page.evaluate((value) => {
    localStorage.setItem('hexakill.angular.session.v1', JSON.stringify(value));
  }, magicSnapshot);
  await page.addInitScript(() => {
    Math.random = () => 0.75;
  });
  await page.reload();
  await page.getByRole('button', { name: 'Potion' }).click();
  const enemyMagic = page.getByRole('img', { name: 'Witch Blue magic animation' });
  await expect(enemyMagic).toBeVisible();
  await expect(enemyMagic).toHaveCSS('background-image', /witch-blue\/assets\/B_witch_charge/);
  await expect(enemyMagic).toHaveCSS('background-size', /100% 500%/);

  await expect
    .poll(() =>
      page.evaluate(
        () =>
          JSON.parse(localStorage.getItem('hexakill.angular.session.v1') ?? '{}').combatState.phase,
      ),
    )
    .toBe('awaiting-player-action');
  const hitSnapshot = await page.evaluate(() =>
    JSON.parse(localStorage.getItem('hexakill.angular.session.v1') ?? '{}'),
  );
  hitSnapshot.combatState.enemy.stats.health = 100;
  hitSnapshot.combatState.enemy.damageTaken = 0;
  hitSnapshot.combatState.playerDamageTaken = 0;
  await page.evaluate((value) => {
    localStorage.setItem('hexakill.angular.session.v1', JSON.stringify(value));
  }, hitSnapshot);
  await page.addInitScript(() => {
    Math.random = () => 0.5;
  });
  await page.reload();
  await page.getByRole('button', { name: 'Attack' }).click();
  const enemyHit = page.getByRole('img', { name: 'Witch Blue hit animation' });
  await expect(enemyHit).toBeVisible();
  await expect(enemyHit).toHaveCSS('background-image', /witch-blue\/assets\/B_witch_take_damage/);
  await expect(enemyHit).toHaveCSS('background-size', /100% 500%/);

  const defeatSnapshot = await page.evaluate(() =>
    JSON.parse(localStorage.getItem('hexakill.angular.session.v1') ?? '{}'),
  );
  defeatSnapshot.combatState.enemy.stats.health = 1;
  defeatSnapshot.combatState.enemy.damageTaken = 0;
  defeatSnapshot.combatState.playerDamageTaken = 0;
  await page.evaluate((value) => {
    localStorage.setItem('hexakill.angular.session.v1', JSON.stringify(value));
  }, defeatSnapshot);
  await page.reload();
  await page.getByRole('button', { name: 'Attack' }).click();
  const enemyDefeat = page.getByRole('img', { name: 'Witch Blue defeat animation' });
  await expect(enemyDefeat).toBeVisible();
  await expect(enemyDefeat).toHaveCSS('background-size', /100% 1500%/);
});

test('a run is restored after a browser reload', async ({ page }) => {
  await startRun(page);
  await expect
    .poll(() => page.evaluate(() => localStorage.getItem('hexakill.angular.session.v1')))
    .toContain('Agent');

  await page.reload();
  await expect(page.locator('[data-screen="combat"]')).toBeVisible();
  await expect(page.locator('.player-combatant .eyebrow')).toContainText('level 4');
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

test('malformed audio preferences recover to safe defaults', async ({ page }) => {
  await page.evaluate(() => {
    localStorage.setItem(
      'hexakill.angular.preferences.v1',
      JSON.stringify({ version: 1, musicVolume: 'corrupt', effectsVolume: 2 }),
    );
  });

  await page.reload();
  await expect(page.getByLabel('Music volume')).toHaveValue('0.05');
  await expect(page.getByLabel('Effects volume')).toHaveValue('0.2');
  await expect(
    page.evaluate(() => localStorage.getItem('hexakill.angular.preferences.v1')),
  ).resolves.toBeNull();
});

test('malformed personal records recover to an empty list', async ({ page }) => {
  await page.evaluate(() => {
    localStorage.setItem(
      'hexakill.angular.records.v1',
      JSON.stringify({ version: 1, records: [{ characterId: 'invalid', name: '', level: -1 }] }),
    );
  });

  await page.reload();
  await expect(page.getByText('No records yet.')).toBeVisible();
  await expect(
    page.evaluate(() => localStorage.getItem('hexakill.angular.records.v1')),
  ).resolves.toBeNull();
});

test('reduced motion and a narrow viewport remain usable', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.reload();

  await expect(page.getByRole('heading', { name: 'Survive the dungeon.' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Enter the dungeon' })).toHaveCSS(
    'transition-duration',
    '1e-05s',
  );
  const dimensions = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth);

  await page.getByRole('button', { name: 'Enter the dungeon' }).click();
  await page.getByLabel('Player name').fill('David');
  await page.getByRole('button', { name: /Wizard/ }).click();
  await page.getByRole('button', { name: 'Start run' }).click();

  const mapDimensions = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
    clientHeight: document.documentElement.clientHeight,
    scrollHeight: document.documentElement.scrollHeight,
  }));
  expect(mapDimensions.scrollWidth).toBeLessThanOrEqual(mapDimensions.clientWidth);
  expect(mapDimensions.scrollHeight).toBeLessThanOrEqual(mapDimensions.clientHeight);

  await page.locator('[data-screen="map"] .door-card').first().click();
  await expect(page.locator('[data-screen="combat"]')).toBeVisible();
  const combatDimensions = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
    clientHeight: document.documentElement.clientHeight,
    scrollHeight: document.documentElement.scrollHeight,
  }));
  expect(combatDimensions.scrollWidth).toBeLessThanOrEqual(combatDimensions.clientWidth);
  expect(combatDimensions.scrollHeight).toBeLessThanOrEqual(combatDimensions.clientHeight);
});

test('an invalid saved session is discarded safely', async ({ page }) => {
  for (const level of [0, Number.MAX_SAFE_INTEGER + 1]) {
    await page.evaluate((invalidLevel) => {
      localStorage.setItem(
        'hexakill.angular.session.v1',
        JSON.stringify({
          version: 1,
          screen: 'combat',
          playerName: 'Agent',
          selectedCharacterId: 'wizard',
          player: { name: 'Agent', level: invalidLevel },
          combatState: { phase: 'idle', enemy: null, playerDamageTaken: 0 },
        }),
      );
    }, level);

    await page.reload();
    await expect(page.getByRole('heading', { name: 'Survive the dungeon.' })).toBeVisible();
    await expect(
      page.evaluate(() => localStorage.getItem('hexakill.angular.session.v1')),
    ).resolves.toBeNull();
  }
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

test('a restored transient combat action is discarded safely', async ({ page }) => {
  await startRun(page);
  const snapshot = await page.evaluate(() =>
    JSON.parse(localStorage.getItem('hexakill.angular.session.v1') ?? '{}'),
  );
  snapshot.screen = 'combat';
  snapshot.combatState = {
    phase: 'awaiting-player-action',
    enemy: {
      definition: {
        id: 'adventurer',
        name: 'Adventurer',
        archetype: 'basic',
        modifiers: { health: 1, ad: 1, ap: 1, armor: 1, mr: 1, speed: 1 },
        idleAsset: '/images/adventurer/idle.gif',
      },
      level: 2,
      stats: { health: 100, ad: 1, ap: 1, armor: 1, mr: 1, speed: 1 },
      damageTaken: 0,
      potions: 0,
      gold: 125,
    },
    playerDamageTaken: 0,
    pendingAction: 'attack',
    lastResult: null,
  };
  await page.evaluate((value) => {
    localStorage.setItem('hexakill.angular.session.v1', JSON.stringify(value));
  }, snapshot);

  await page.reload();
  await expect(page.getByRole('heading', { name: 'Survive the dungeon.' })).toBeVisible();
  await expect(
    page.evaluate(() => localStorage.getItem('hexakill.angular.session.v1')),
  ).resolves.toBeNull();
});

test('restored resolving and enemy-turn phases are discarded safely', async ({ page }) => {
  for (const phase of ['resolving-player-action', 'enemy-turn'] as const) {
    await startRun(page);
    await expect(page.locator('[data-screen="combat"]')).toBeVisible();

    const snapshot = await page.evaluate(() =>
      JSON.parse(localStorage.getItem('hexakill.angular.session.v1') ?? '{}'),
    );
    snapshot.combatState.phase = phase;
    snapshot.combatState.pendingAction = phase === 'resolving-player-action' ? 'attack' : null;
    await page.evaluate((value) => {
      localStorage.setItem('hexakill.angular.session.v1', JSON.stringify(value));
    }, snapshot);

    await page.reload();
    await expect(page.getByRole('heading', { name: 'Survive the dungeon.' })).toBeVisible();
    await expect(
      page.evaluate(() => localStorage.getItem('hexakill.angular.session.v1')),
    ).resolves.toBeNull();
  }
});

test('a restored malformed combat result is discarded safely', async ({ page }) => {
  await startRun(page);
  await expect(page.locator('[data-screen="combat"]')).toBeVisible();
  const snapshot = await page.evaluate(() =>
    JSON.parse(localStorage.getItem('hexakill.angular.session.v1') ?? '{}'),
  );
  snapshot.combatState.lastResult = {
    kind: 'attack',
    rawDamage: 'corrupt',
    damageAfterResistance: 0,
    critical: false,
    missed: false,
    damageTaken: 0,
  };
  await page.evaluate((value) => {
    localStorage.setItem('hexakill.angular.session.v1', JSON.stringify(value));
  }, snapshot);

  await page.reload();
  await expect(page.getByRole('heading', { name: 'Survive the dungeon.' })).toBeVisible();
  await expect(
    page.evaluate(() => localStorage.getItem('hexakill.angular.session.v1')),
  ).resolves.toBeNull();

  await startRun(page);
  await expect(page.locator('[data-screen="combat"]')).toBeVisible();
  const incoherentSnapshot = await page.evaluate(() =>
    JSON.parse(localStorage.getItem('hexakill.angular.session.v1') ?? '{}'),
  );
  incoherentSnapshot.combatState.lastResult = {
    kind: 'attack',
    rawDamage: 1,
    damageAfterResistance: 1,
    critical: false,
    missed: false,
    damageTaken: 1,
  };
  await page.evaluate((value) => {
    localStorage.setItem('hexakill.angular.session.v1', JSON.stringify(value));
  }, incoherentSnapshot);

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
  for (const health of [-1, 0]) {
    snapshot.player.stats.health = health;
    await page.evaluate((value) => {
      localStorage.setItem('hexakill.angular.session.v1', JSON.stringify(value));
    }, snapshot);

    await page.reload();
    await expect(page.getByRole('heading', { name: 'Survive the dungeon.' })).toBeVisible();
    await expect(
      page.evaluate(() => localStorage.getItem('hexakill.angular.session.v1')),
    ).resolves.toBeNull();
  }
});

test('restored power-up totals above the global cap are discarded safely', async ({ page }) => {
  await startRun(page);
  const snapshot = await page.evaluate(() =>
    JSON.parse(localStorage.getItem('hexakill.angular.session.v1') ?? '{}'),
  );
  snapshot.player.powerUps = {
    pending: 1,
    history: { health: 6, ad: 6, ap: 6, speed: 6 },
  };
  await page.evaluate((value) => {
    localStorage.setItem('hexakill.angular.session.v1', JSON.stringify(value));
  }, snapshot);

  await page.reload();
  await expect(page.getByRole('heading', { name: 'Survive the dungeon.' })).toBeVisible();
  await expect(
    page.evaluate(() => localStorage.getItem('hexakill.angular.session.v1')),
  ).resolves.toBeNull();
});

test('restored duplicate one-time inventory items are discarded safely', async ({ page }) => {
  await startRun(page);
  const snapshot = await page.evaluate(() =>
    JSON.parse(localStorage.getItem('hexakill.angular.session.v1') ?? '{}'),
  );
  snapshot.player.inventory = [{ id: 'whetstone' }, { id: 'whetstone' }];
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
  const chooseButton = page.getByRole('button', { name: 'Enter the dungeon' });
  await chooseButton.focus();
  await expect(chooseButton).toBeFocused();
  await page.keyboard.press('Enter');
  const selectHeading = page.getByRole('heading', { name: 'Choose your champion' });
  await expect(selectHeading).toBeVisible();
  await expect(selectHeading).toBeFocused();

  await page.getByLabel('Player name').fill('David');
  const wizardButton = page.getByRole('button', { name: /Wizard/ });
  await wizardButton.focus();
  await page.keyboard.press('Enter');
  const startButton = page.getByRole('button', { name: 'Start run' });
  await expect(startButton).toBeEnabled();
  await startButton.focus();
  await expect(startButton).toBeFocused();
  await startButton.press('Enter');
  await expect(page.locator('[data-screen="map"]')).toBeVisible();
  const firstDoor = page.locator('[data-screen="map"] .door-card').first();
  await firstDoor.focus();
  await firstDoor.press('Enter');
  await expect(page.locator('[data-screen="combat"]')).toBeVisible();
  const playerLabelMetrics = await page
    .locator('.player-combatant .combatant-header h3')
    .evaluate((element) => {
      const styles = getComputedStyle(element);
      return {
        height: element.getBoundingClientRect().height,
        lineHeight: Number.parseFloat(styles.lineHeight),
      };
    });
  expect(playerLabelMetrics.height).toBeLessThanOrEqual(playerLabelMetrics.lineHeight * 1.25);

  await page.locator('.exit-run-button').click();
  const exitDialog = page.getByRole('dialog', { name: 'Abandon this run?' });
  await expect(exitDialog).toBeVisible();
  await exitDialog.getByRole('button', { name: 'Stay in run' }).click();
  await expect(exitDialog).toBeHidden();
  await expect(page.locator('[data-screen="combat"]')).toBeVisible();

  await page.locator('.exit-run-button').click();
  await exitDialog.getByRole('button', { name: 'Exit run' }).click();
  await expect(page.getByRole('heading', { name: 'Survive the dungeon.' })).toBeVisible();
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
  await expect(page.locator('[data-screen="combat"]')).toBeVisible();

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
  await page.evaluate(() => {
    localStorage.setItem(
      'hexakill.angular.records.v1',
      JSON.stringify({
        version: 1,
        records: [
          { characterId: 'wizard', name: 'Agent', level: 4 },
          { characterId: 'samurai', name: 'Rin', level: 3 },
          { characterId: 'warrior', name: 'Borin', level: 2 },
          { characterId: 'wizard', name: 'Mira', level: 1 },
          { characterId: 'samurai', name: 'Kato', level: 1 },
        ],
      }),
    );
  });
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Game over.' })).toBeVisible();
  await expect(page.locator('.enemy-history-tile')).toContainText('Slime Blue');
  await expect(page.locator('.enemy-history-count')).toHaveText('x1');
  await expect(page.locator('.game-over-records .record-row')).toHaveCount(5);
  await expect(page.getByText('Agent · Wizard', { exact: true })).toBeVisible();
  await expect(page.getByText('Level 4', { exact: true })).toBeVisible();
  await expect(page.locator('.game-over-records .records-list')).toHaveCSS('overflow-y', 'auto');
  await expect(page.getByRole('button', { name: 'Return to home' })).toBeVisible();

  await page.getByRole('button', { name: 'Return to home' }).click();
  const welcomeHeading = page.getByRole('heading', { name: 'Survive the dungeon.' });
  await expect(welcomeHeading).toBeVisible();
  await expect(welcomeHeading).toBeFocused();
  await expect(page.getByText('Agent · Wizard', { exact: true })).toBeVisible();
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
      damageTaken: 0,
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
  await page.addInitScript(() => {
    Math.random = () => 0.5;
  });
  await page.reload();

  const attackButton = page.getByRole('button', { name: /Attack Reliable physical damage/ });
  await attackButton.focus();
  await expect(attackButton).toBeFocused();
  await attackButton.press('Enter');
  await expect(page.getByText(/gained 100 exp and 100 gold/)).toBeVisible();
  await expect(page.locator('.battle-banner')).toContainText('Wild Huntress was defeated');
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
  const powerUpPanel = page.getByRole('group', { name: 'Power-up available' });
  await expect(powerUpPanel).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Power-up available' })).toBeFocused();
  await expect(page.getByRole('button', { name: /View route map/ })).toBeDisabled();

  const powerUpAttack = page.locator('.power-up-panel').getByRole('button', { name: 'Attack' });
  await powerUpAttack.focus();
  await expect(powerUpAttack).toBeFocused();
  await powerUpAttack.press('Enter');
  await expect(page.locator('.power-up-panel')).toHaveCount(0);
  const nextEnemyButton = page.getByRole('button', { name: /View route map/ });
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
      damageTaken: 0,
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
  await page.addInitScript(() => {
    Math.random = () => 0.5;
  });
  await page.reload();

  await expect(page.locator('[data-screen="combat"]')).toBeVisible();
  await page.getByRole('button', { name: /Attack Reliable physical damage/ }).click();
  await expect(page.getByText(/gained 150 exp and 1000 gold/)).toBeVisible();
  await page.locator('.power-up-panel').getByRole('button', { name: 'Attack' }).click();
  await page.getByRole('button', { name: /View route map/ }).click();
  await expect(page.getByRole('heading', { name: 'Choose a door' })).toBeVisible();
  await page.getByRole('button', { name: /Skirmish:/ }).click();
  await expect(page.locator('[data-screen="combat"]')).toBeVisible();
});
