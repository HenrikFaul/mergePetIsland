import type { DecorationDef } from '../types';

export const DECORATIONS: DecorationDef[] = [
  { id: 'fence', name: 'Picket Fence', emoji: '🪵', cost: 800, boost: 0.02 },
  { id: 'flowerbed', name: 'Flower Bed', emoji: '🌷', cost: 1500, boost: 0.02 },
  { id: 'bench', name: 'Cozy Bench', emoji: '🪑', cost: 2600, boost: 0.02 },
  { id: 'lamp', name: 'Garden Lamp', emoji: '🏮', cost: 4200, boost: 0.02 },
  { id: 'fountain', name: 'Bubble Fountain', emoji: '⛲', cost: 7000, boost: 0.03 },
  { id: 'tree', name: 'Wishing Tree', emoji: '🎋', cost: 11000, boost: 0.03 },
  { id: 'pond', name: 'Koi Pond', emoji: '🪷', cost: 18000, boost: 0.03 },
  { id: 'windmill', name: 'Tiny Windmill', emoji: '🌬️', cost: 30000, boost: 0.04 },
];

export const DECORATION_BY_ID: Record<string, DecorationDef> = Object.fromEntries(
  DECORATIONS.map((d) => [d.id, d]),
);

/** Total island coin boost from owned decorations (sum of boosts). */
export function decorationBoost(owned: string[]): number {
  return owned.reduce((sum, id) => sum + (DECORATION_BY_ID[id]?.boost ?? 0), 0);
}
