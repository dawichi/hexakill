import { describe, expect, it } from 'vitest';
import { generateEnemy } from './enemies';

describe('enemy generation', () => {
  it('selects a typed enemy and keeps the legacy level range', () => {
    const enemy = generateEnemy(4, 0.51, 0.99);

    expect(enemy.definition.name).toBe('Martial Hero');
    expect(enemy.level).toBe(7);
    expect(enemy.stats.health).toBe(1050);
    expect(enemy.damageTaken).toBe(0);
    expect(enemy.gold).toBe(437);
  });

  it('generates the lower bound for a low roll', () => {
    const enemy = generateEnemy(4, 0, 0);

    expect(enemy.definition.name).toBe('Adventurer');
    expect(enemy.level).toBe(2);
    expect(enemy.stats.health).toBe(300);
  });

  it('opens the sequential gold-slime bosses at level ten', () => {
    const firstBoss = generateEnemy(10, 0.5, 0, 0);
    const secondBoss = generateEnemy(20, 0.5, 0, 1);

    expect(firstBoss.definition.name).toBe('Gold Slime 1');
    expect(firstBoss.level).toBe(15);
    expect(firstBoss.gold).toBe(1000);
    expect(secondBoss.definition.name).toBe('Gold Slime 2');
    expect(secondBoss.level).toBe(25);
  });

  it('rejects invalid random rolls', () => {
    expect(() => generateEnemy(4, 1, 0.5)).toThrow(RangeError);
    expect(() => generateEnemy(4, 0.5, -0.1)).toThrow(RangeError);
  });
});
