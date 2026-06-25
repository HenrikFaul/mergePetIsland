import type { Entity, EggDef, BiomeId, Rarity } from '../types';
import { GRID_W, GRID_H } from '../types';
import { nanoid, pickWeighted, rand } from '../lib/rng';
import { randomSpecies } from '../data/species';
import { petCoinPerSec } from './coin';

/** Find the first empty cell (row-major). Returns null when board is full. */
export function firstEmptyCell(
  grid: Entity[],
): { x: number; y: number } | null {
  const occupied = new Set(grid.map((e) => `${e.gridX},${e.gridY}`));
  for (let y = 0; y < GRID_H; y++) {
    for (let x = 0; x < GRID_W; x++) {
      if (!occupied.has(`${x},${y}`)) return { x, y };
    }
  }
  return null;
}

export function boardIsFull(grid: Entity[]): boolean {
  return grid.length >= GRID_W * GRID_H;
}

/** Roll an egg's drop table → (rarity, level). */
export function rollEgg(egg: EggDef): { rarity: Rarity; level: number } {
  return pickWeighted(
    egg.drops.map((d) => ({ item: { rarity: d.rarity, level: d.level }, weight: d.weight })),
  );
}

/**
 * Create a pet entity from an egg roll, placing it in the first empty cell.
 * `ddaBoost` nudges toward rarer drops (silent difficulty assist).
 */
export function spawnFromEgg(
  egg: EggDef,
  grid: Entity[],
  biomesUnlocked: BiomeId[],
  ddaBoost = false,
): Entity | null {
  const cell = firstEmptyCell(grid);
  if (!cell) return null;
  let { rarity, level } = rollEgg(egg);
  if (ddaBoost && rarity === 'common' && rand() < 0.1) rarity = 'rare';
  const sp = randomSpecies(rarity, rand, biomesUnlocked);
  return {
    id: nanoid(),
    type: 'pet',
    species: sp.id,
    level,
    gridX: cell.x,
    gridY: cell.y,
    coinPerSec: petCoinPerSec(sp.id, level),
    accumulatedCoin: 0,
    lastTickAt: Date.now(),
  };
}

/** Direct spawn of a specific species/level (rewards, starter pets). */
export function spawnSpecies(
  speciesId: string,
  level: number,
  grid: Entity[],
): Entity | null {
  const cell = firstEmptyCell(grid);
  if (!cell) return null;
  return {
    id: nanoid(),
    type: 'pet',
    species: speciesId,
    level,
    gridX: cell.x,
    gridY: cell.y,
    coinPerSec: petCoinPerSec(speciesId, level),
    accumulatedCoin: 0,
    lastTickAt: Date.now(),
  };
}
