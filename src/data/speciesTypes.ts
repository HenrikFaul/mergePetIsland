import type { Family, Rarity, BiomeId } from '../types';

/** Raw creative definition for one pet (numeric balance derived elsewhere). */
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
