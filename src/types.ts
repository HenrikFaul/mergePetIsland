// ── Merge Pets Island · Core type contracts ───────────────────────────────
// Every component, data file and engine module depends on these types.

export type Family =
  | 'cat'
  | 'dog'
  | 'fox'
  | 'panda'
  | 'dragon'
  | 'robot'
  | 'merfolk'
  | 'yeti';

export type Rarity = 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';

export type BiomeId =
  | 'grass'
  | 'lake'
  | 'forest'
  | 'mountain'
  | 'ocean'
  | 'mythic';

/** A single collectable pet species (60+ of these live in data/species). */
export interface Species {
  id: string;
  name: string;
  family: Family;
  rarity: Rarity;
  /** Emoji used as the pet's face on the board / album. */
  emoji: string;
  /** Base card hue (CSS color) for this pet. */
  color: string;
  /** Coin multiplier vs. the family baseline (SPECIES_MULTIPLIER). */
  coinMul: number;
  /** Charming ≤80 char personality line, shown in the Album. */
  bio: string;
  /** Biome this species belongs to / is themed around. */
  biome: BiomeId;
}

export type EntityType = 'pet' | 'egg' | 'special';

/** A live entity occupying a cell on the merge board. */
export interface Entity {
  id: string;
  type: EntityType;
  /** Species id (for pets) or egg/special kind. */
  species: string;
  level: number;
  gridX: number;
  gridY: number;
  coinPerSec: number;
  accumulatedCoin: number;
  /** ms timestamp the entity last produced coin (for idle ticking). */
  lastTickAt: number;
}

export type EggKind = 'basic' | 'golden' | 'mythic';

export interface EggDef {
  kind: EggKind;
  label: string;
  emoji: string;
  /** Cost in coin (basic) or gem (golden/mythic). */
  cost: number;
  currency: 'coin' | 'gem';
  /** Weighted drop table: { rarity, level, weight }. */
  drops: { rarity: Rarity; level: number; weight: number }[];
}

export interface BiomeDef {
  id: BiomeId;
  name: string;
  emoji: string;
  /** CSS gradient describing the biome backdrop. */
  background: string;
  /** Unlock requirement: a pet of at least this level must exist. */
  requiresPetLevel: number;
  /** Gem cost to unlock. */
  gemCost: number;
  /** One-time claim reward granted on unlock. */
  unlockReward: { coins: number; gems: number };
}

export type QuestKind =
  | 'merge_to_level'
  | 'collect_coins'
  | 'place_decoration'
  | 'buy_egg'
  | 'unlock_pet'
  | 'tap_collect';

export interface QuestDef {
  key: string;
  kind: QuestKind;
  label: string;
  target: number;
  /** Difficulty tier drives the reward size. */
  difficulty: 'easy' | 'medium' | 'hard';
  reward: { gems: number; egg?: EggKind };
}

export interface ActiveQuest extends QuestDef {
  progress: number;
  claimed: boolean;
}

export interface DecorationDef {
  id: string;
  name: string;
  emoji: string;
  cost: number;
  /** Flat coin-boost added to the island global multiplier (e.g. 0.02 = +2%). */
  boost: number;
}

export interface DailyRewardDef {
  day: number; // 1..7
  coins: number;
  gems: number;
  /** Day 7 grants a random legendary pet. */
  legendaryPet?: boolean;
}

/** Persisted, serialisable snapshot of the whole game. */
export interface SaveState {
  version: number;
  coins: number;
  gems: number;
  grid: Entity[];
  biomesUnlocked: BiomeId[];
  /** species id → highest level ever seen (Album / Pokédex). */
  album: Record<string, number>;
  ownedDecorations: string[];
  dailyStreak: number;
  lastDailyClaim: string | null; // ISO date (YYYY-MM-DD)
  quests: ActiveQuest[];
  questDate: string | null; // ISO date the quest set was generated for
  eggPurchasesToday: number;
  eggPurchaseDate: string | null;
  lastSeenAt: number; // ms epoch
  freeEggReadyAt: number; // ms epoch cooldown for rewarded free egg
  settings: GameSettings;
  stats: GameStats;
}

export interface GameSettings {
  sound: boolean;
  music: boolean;
  reducedMotion: boolean;
  colorBlindSafe: boolean;
  locale: string;
}

export interface GameStats {
  totalMerges: number;
  totalCoinsCollected: number;
  petsDiscovered: number;
  biomesUnlocked: number;
}

export const GRID_W = 7;
export const GRID_H = 9;
export const MAX_LEVEL = 10;
export const OFFLINE_CAP_SEC = 8 * 3600;
export const COIN_CAP_SEC = 1800; // 30 min accumulation cap per pet
