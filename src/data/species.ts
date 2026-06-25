import type { Species, Family, Rarity, BiomeId } from '../types';
import { FAMILY_BASE_MUL, RARITY_MUL } from './families';
import { GENERATED_PETS } from './speciesData';

/**
 * The 60-pet catalog. Creative fields (name, emoji, color, bio) come from
 * `speciesData.ts` (authored by the pet-design fleet); numeric balance
 * (coinMul) is derived here from family + rarity so it stays consistent.
 */
function buildSpecies(p: {
  id: string;
  name: string;
  family: Family;
  rarity: Rarity;
  emoji: string;
  color: string;
  bio: string;
  biome: BiomeId;
}): Species {
  const coinMul =
    Math.round(FAMILY_BASE_MUL[p.family] * RARITY_MUL[p.rarity] * 100) / 100;
  return { ...p, coinMul };
}

export const SPECIES: Species[] = GENERATED_PETS.map(buildSpecies);

export const SPECIES_BY_ID: Record<string, Species> = Object.fromEntries(
  SPECIES.map((s) => [s.id, s]),
);

export function speciesById(id: string): Species | undefined {
  return SPECIES_BY_ID[id];
}

export function speciesByRarity(rarity: Rarity): Species[] {
  return SPECIES.filter((s) => s.rarity === rarity);
}

/** Pick a random species of a given rarity (optionally constrained to unlocked biomes). */
export function randomSpecies(
  rarity: Rarity,
  rand: () => number,
  allowedBiomes?: BiomeId[],
): Species {
  let pool = speciesByRarity(rarity);
  if (allowedBiomes && allowedBiomes.length) {
    const biomePool = pool.filter((s) => allowedBiomes.includes(s.biome));
    if (biomePool.length) pool = biomePool;
  }
  if (!pool.length) pool = SPECIES;
  return pool[Math.floor(rand() * pool.length)];
}
