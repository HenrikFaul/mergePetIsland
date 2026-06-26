import type { EggDef, EggKind } from '../types';

export const EGGS: Record<EggKind, EggDef> = {
  basic: {
    kind: 'basic',
    label: 'Basic Egg',
    emoji: '🥚',
    cost: 50,
    currency: 'coin',
    drops: [
      { rarity: 'common', level: 1, weight: 70 },
      { rarity: 'rare', level: 1, weight: 25 },
      { rarity: 'epic', level: 1, weight: 5 },
    ],
  },
  golden: {
    kind: 'golden',
    label: 'Golden Egg',
    emoji: '🪺',
    cost: 5,
    currency: 'gem',
    drops: [
      { rarity: 'rare', level: 2, weight: 50 },
      { rarity: 'epic', level: 2, weight: 35 },
      { rarity: 'legendary', level: 2, weight: 15 },
    ],
  },
  mythic: {
    kind: 'mythic',
    label: 'Mythic Chest',
    emoji: '🎁',
    cost: 50,
    currency: 'gem',
    drops: [
      { rarity: 'legendary', level: 3, weight: 70 },
      { rarity: 'mythic', level: 3, weight: 30 },
    ],
  },
};

export const EGG_ORDER: EggKind[] = ['basic', 'golden', 'mythic'];

/** Basic egg price scales with daily purchase count: T(k) = 50 · 1.15^k. */
export function basicEggPrice(purchasesToday: number): number {
  return Math.floor(50 * Math.pow(1.15, purchasesToday));
}
