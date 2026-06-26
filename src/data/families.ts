import type { Family, Rarity } from '../types';

/** Per-family baseline coin multiplier (SPECIES_MULTIPLIER baseline). */
export const FAMILY_BASE_MUL: Record<Family, number> = {
  cat: 1.0,
  dog: 1.05,
  fox: 1.15,
  panda: 1.25,
  dragon: 1.6,
  robot: 1.4,
  merfolk: 1.45,
  yeti: 1.7,
};

export const FAMILY_LABEL: Record<Family, string> = {
  cat: 'Cats',
  dog: 'Dogs',
  fox: 'Foxes',
  panda: 'Pandas',
  dragon: 'Dragons',
  robot: 'Robo-Pets',
  merfolk: 'Merfolk',
  yeti: 'Yetis',
};

export const RARITY_ORDER: Rarity[] = [
  'common',
  'rare',
  'epic',
  'legendary',
  'mythic',
];

export const RARITY_LABEL: Record<Rarity, string> = {
  common: 'Common',
  rare: 'Rare',
  epic: 'Epic',
  legendary: 'Legendary',
  mythic: 'Mythic',
};

/** Rarity → card glow / border color. */
export const RARITY_COLOR: Record<Rarity, string> = {
  common: '#9aa7b4',
  rare: '#4fa3e0',
  epic: '#a06ef2',
  legendary: '#ffb020',
  mythic: '#ff5cae',
};

/** Extra coin multiplier applied on top of the family baseline by rarity. */
export const RARITY_MUL: Record<Rarity, number> = {
  common: 1.0,
  rare: 1.25,
  epic: 1.6,
  legendary: 2.1,
  mythic: 3.0,
};
