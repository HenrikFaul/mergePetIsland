import type { Family, Rarity, BiomeId } from '../types';

/** Raw creative definition for one pet (numeric balance is derived elsewhere). */
export interface RawPet {
  id: string;
  name: string;
  family: Family;
  rarity: Rarity;
  emoji: string;
  color: string;
  bio: string;
  biome: BiomeId;
}

// ── Baseline 60-pet catalog ────────────────────────────────────────────────
// This is a deterministic placeholder. The pet-design fleet replaces every
// entry with a hand-crafted personality; the shape stays identical so the
// rest of the game keeps building either way.

const FAMILIES: Family[] = [
  'cat',
  'dog',
  'fox',
  'panda',
  'dragon',
  'robot',
  'merfolk',
  'yeti',
];

const FAMILY_EMOJI: Record<Family, string> = {
  cat: '🐱',
  dog: '🐶',
  fox: '🦊',
  panda: '🐼',
  dragon: '🐲',
  robot: '🤖',
  merfolk: '🧜',
  yeti: '🪼',
};

const FAMILY_COLOR: Record<Family, string> = {
  cat: '#ffb3c6',
  dog: '#ffd9a0',
  fox: '#ff9e6d',
  panda: '#cfeac0',
  dragon: '#b8a0ff',
  robot: '#a8d8ff',
  merfolk: '#8ff0e0',
  yeti: '#dff2ff',
};

const RARITY_BY_INDEX: Rarity[] = [
  'common',
  'common',
  'rare',
  'epic',
  'legendary',
  'mythic',
];

const BIOME_BY_RARITY: Record<Rarity, BiomeId> = {
  common: 'grass',
  rare: 'lake',
  epic: 'forest',
  legendary: 'mountain',
  mythic: 'mythic',
};

function buildBaseline(): RawPet[] {
  const pets: RawPet[] = [];
  for (const fam of FAMILIES) {
    for (let i = 0; i < 8; i++) {
      const rarity = RARITY_BY_INDEX[Math.min(i, RARITY_BY_INDEX.length - 1)];
      pets.push({
        id: `${fam}_${i + 1}`,
        name: `${fam[0].toUpperCase()}${fam.slice(1)} ${i + 1}`,
        family: fam,
        rarity,
        emoji: FAMILY_EMOJI[fam],
        color: FAMILY_COLOR[fam],
        bio: 'A cuddly island friend who loves naps and sunshine.',
        biome: BIOME_BY_RARITY[rarity],
      });
    }
  }
  // Trim to exactly 60 pets (8 families × 8 = 64 → keep 60).
  return pets.slice(0, 60);
}

export const GENERATED_PETS: RawPet[] = buildBaseline();
