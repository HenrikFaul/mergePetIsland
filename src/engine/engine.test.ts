import { describe, it, expect } from 'vitest';
import { petCoinPerSec, coinCap, boardCoinPerSec, tickEntity } from './coin';
import { canMerge, mergeEntities } from './mergeRules';
import { computeOffline } from './offline';
import { firstEmptyCell, boardIsFull, rollEgg } from './spawn';
import { EGGS } from '../data/eggs';
import { SPECIES } from '../data/species';
import type { Entity } from '../types';

function pet(species: string, level: number, x = 0, y = 0): Entity {
  return {
    id: `${species}-${level}-${x}-${y}`,
    type: 'pet',
    species,
    level,
    gridX: x,
    gridY: y,
    coinPerSec: petCoinPerSec(species, level),
    accumulatedCoin: 0,
    lastTickAt: 0,
  };
}

const common = SPECIES.find((s) => s.rarity === 'common')!;

describe('coin', () => {
  it('coin/sec grows roughly exponentially with level', () => {
    const l1 = petCoinPerSec(common.id, 1);
    const l5 = petCoinPerSec(common.id, 5);
    expect(l1).toBeGreaterThanOrEqual(1);
    expect(l5).toBeGreaterThan(l1 * 4);
  });

  it('accumulation respects the 30-min cap', () => {
    const e = pet(common.id, 3);
    tickEntity(e, 1_000_000);
    expect(e.accumulatedCoin).toBe(coinCap(e.coinPerSec));
  });

  it('boardCoinPerSec sums only pets', () => {
    const grid = [pet(common.id, 1), pet(common.id, 2)];
    expect(boardCoinPerSec(grid)).toBe(grid[0].coinPerSec + grid[1].coinPerSec);
  });
});

describe('merge rules', () => {
  it('merges same species + level into level+1', () => {
    const a = pet(common.id, 2, 0, 0);
    const b = pet(common.id, 2, 1, 0);
    expect(canMerge(a, b)).toBe(true);
    const merged = mergeEntities(a, b);
    expect(merged.level).toBe(3);
    expect(merged.species).toBe(common.id);
  });

  it('rejects different species or levels or max level', () => {
    const other = SPECIES.find((s) => s.id !== common.id)!;
    expect(canMerge(pet(common.id, 2), pet(other.id, 2))).toBe(false);
    expect(canMerge(pet(common.id, 2), pet(common.id, 3))).toBe(false);
    expect(canMerge(pet(common.id, 10), pet(common.id, 10))).toBe(false);
  });
});

describe('offline', () => {
  it('caps offline earnings at 8h', () => {
    const grid = [pet(common.id, 5)];
    const tenHoursAgo = Date.now() - 10 * 3600 * 1000;
    const res = computeOffline(grid, tenHoursAgo, Date.now());
    expect(res.seconds).toBe(8 * 3600);
    expect(res.earned).toBe(grid[0].coinPerSec * 8 * 3600);
  });
});

describe('spawn', () => {
  it('finds first empty cell and detects full board', () => {
    expect(firstEmptyCell([])).toEqual({ x: 0, y: 0 });
    expect(boardIsFull([])).toBe(false);
  });

  it('egg rolls land within the drop table', () => {
    const roll = rollEgg(EGGS.basic);
    const allowed = EGGS.basic.drops.map((d) => d.rarity);
    expect(allowed).toContain(roll.rarity);
  });
});
