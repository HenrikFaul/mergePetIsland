import type { Entity } from '../types';
import { COIN_CAP_SEC } from '../types';
import { speciesById } from '../data/species';
import { FAMILY_BASE_MUL, RARITY_MUL } from '../data/families';

/**
 * Coin/sec for a pet at a given level.
 * C(n) = floor(2^(n-1) · 0.8 · speciesMul)
 */
export function petCoinPerSec(speciesId: string, level: number): number {
  const sp = speciesById(speciesId);
  const mul = sp
    ? FAMILY_BASE_MUL[sp.family] * RARITY_MUL[sp.rarity]
    : 1;
  return Math.max(1, Math.floor(Math.pow(2, level - 1) * 0.8 * mul));
}

/** Per-pet accumulation cap (coinPerSec · 1800). */
export function coinCap(coinPerSec: number): number {
  return coinPerSec * COIN_CAP_SEC;
}

/** Advance one entity's accumulated coin by elapsed seconds, respecting cap. */
export function tickEntity(e: Entity, elapsedSec: number): void {
  if (e.type !== 'pet') return;
  const cap = coinCap(e.coinPerSec);
  e.accumulatedCoin = Math.min(cap, e.accumulatedCoin + e.coinPerSec * elapsedSec);
}

/** Theoretical max coin/sec across the whole board (anti-cheat ceiling). */
export function boardCoinPerSec(grid: Entity[]): number {
  return grid.reduce((s, e) => (e.type === 'pet' ? s + e.coinPerSec : s), 0);
}
