import type { Species, Family, Rarity, BiomeId } from '../types';
import { FAMILY_BASE_MUL, RARITY_MUL } from './families';
import { GENERATED_PETS } from './speciesData';
import { SEASON_S1_RAW_PETS } from './seasonPets';

/**
 * The pet catalog: 60 base pets + season-exclusive pets. Creative fields come
 * from data files; numeric balance (coinMul) is derived from family + rarity so
 * it stays consistent. Season pets carry an `event` flag and are excluded from
 * all random/egg pools — they're only obtainable via the Battle Pass.
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
  event?: string;
}): Species {
  const coinMul =
    Math.round(FAMILY_BASE_MUL[p.family] * RARITY_MUL[p.rarity] * 100) / 100;
  return { ...p, coinMul };
}

/** Base (non-event) collectable pets. */
export const SPECIES: Species[] = GENERATED_PETS.map(buildSpecies);

/** Season-exclusive pets (flagged with `event`). */
export const SEASON_SPECIES: Species[] = SEASON_S1_RAW_PETS.map(buildSpecies);

/** Every species, base + season — used by id lookup, album and coin math. */
export const ALL_SPECIES: Species[] = [...SPECIES, ...SEASON_SPECIES];

export const SPECIES_BY_ID: Record<string, Species> = Object.fromEntries(
  ALL_SPECIES.map((s) => [s.id, s]),
);

export function speciesById(id: string): Species | undefined {
  return SPECIES_BY_ID[id];
}

/** Only non-event pets are eligible for random rolls / egg drops. */
export function speciesByRarity(rarity: Rarity): Species[] {
  return SPECIES.filter((s) => s.rarity === rarity && !s.event);
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
