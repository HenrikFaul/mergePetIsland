import type { BiomeDef, BiomeId } from '../types';

export const BIOMES: BiomeDef[] = [
  {
    id: 'grass',
    name: 'Grass Meadow',
    emoji: '🌳',
    background: 'linear-gradient(160deg, #bde6c4 0%, #8fd6a8 55%, #6fc8e0 100%)',
    requiresPetLevel: 0,
    gemCost: 0,
    unlockReward: { coins: 0, gems: 0 },
  },
  {
    id: 'lake',
    name: 'Crystal Lake',
    emoji: '💧',
    background: 'linear-gradient(160deg, #c9efe7 0%, #8fd0e6 55%, #5fb8e6 100%)',
    requiresPetLevel: 6,
    gemCost: 5000,
    unlockReward: { coins: 5000, gems: 100 },
  },
  {
    id: 'forest',
    name: 'Whisper Forest',
    emoji: '🌲',
    background: 'linear-gradient(160deg, #b6e0b0 0%, #6fae74 55%, #3f7d57 100%)',
    requiresPetLevel: 7,
    gemCost: 12000,
    unlockReward: { coins: 15000, gems: 150 },
  },
  {
    id: 'mountain',
    name: 'Cloud Peaks',
    emoji: '⛰️',
    background: 'linear-gradient(160deg, #e4e9f0 0%, #b6c2d6 55%, #8493ad 100%)',
    requiresPetLevel: 8,
    gemCost: 30000,
    unlockReward: { coins: 40000, gems: 250 },
  },
  {
    id: 'ocean',
    name: 'Coral Bay',
    emoji: '🌊',
    background: 'linear-gradient(160deg, #aee7f0 0%, #56b6e0 55%, #2f73c7 100%)',
    requiresPetLevel: 9,
    gemCost: 80000,
    unlockReward: { coins: 90000, gems: 400 },
  },
  {
    id: 'mythic',
    name: 'Mythic Realm',
    emoji: '✨',
    background: 'linear-gradient(160deg, #f3d6ff 0%, #c89cff 55%, #8a5cff 100%)',
    requiresPetLevel: 10,
    gemCost: 200000,
    unlockReward: { coins: 250000, gems: 1000 },
  },
];

export const BIOME_BY_ID: Record<BiomeId, BiomeDef> = Object.fromEntries(
  BIOMES.map((b) => [b.id, b]),
) as Record<BiomeId, BiomeDef>;

export const BIOME_ORDER: BiomeId[] = BIOMES.map((b) => b.id);
