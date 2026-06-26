import type { Entity } from '../types';
import { MAX_LEVEL } from '../types';
import { nanoid } from '../lib/rng';
import { petCoinPerSec } from './coin';

export type MergeOutcome =
  | { kind: 'merge'; result: Entity }
  | { kind: 'move' }
  | { kind: 'invalid' };

export function canMerge(a: Entity, b: Entity): boolean {
  if (a.id === b.id) return false;
  if (a.type !== 'pet' || b.type !== 'pet') return false;
  if (a.species !== b.species) return false;
  if (a.level !== b.level) return false;
  if (a.level >= MAX_LEVEL) return false;
  return true;
}

/** Merge two entities; the result lands on `target`'s cell. */
export function mergeEntities(_dragged: Entity, target: Entity): Entity {
  const level = target.level + 1;
  return {
    id: nanoid(),
    type: 'pet',
    species: target.species,
    level,
    gridX: target.gridX,
    gridY: target.gridY,
    coinPerSec: petCoinPerSec(target.species, level),
    accumulatedCoin: 0,
    lastTickAt: Date.now(),
  };
}
