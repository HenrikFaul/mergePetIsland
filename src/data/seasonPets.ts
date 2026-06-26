import type { RawPet } from './speciesTypes';

/**
 * Season 1 — "Frostfall Festival" exclusive pets. These are flagged with
 * `event: 's1'` so species.ts keeps them OUT of egg drops and random pools;
 * they're only obtainable from the Battle Pass premium track.
 */
export const SEASON_S1_RAW_PETS: (RawPet & { event: string })[] = [
  { id: 'season_s1_1', name: 'Glacier Cub', family: 'cat', rarity: 'epic', emoji: '🐱', color: '#bfe9ff', biome: 'mythic', event: 's1', bio: 'Glacier Cub naps on snowdrifts and purrs little frost clouds.' },
  { id: 'season_s1_2', name: 'Frostfang Pup', family: 'dog', rarity: 'epic', emoji: '🐶', color: '#d6ecff', biome: 'mythic', event: 's1', bio: 'Frostfang Pup bounds through powder, leaving glittering paw prints.' },
  { id: 'season_s1_3', name: 'Auroral Fox', family: 'fox', rarity: 'legendary', emoji: '🦊', color: '#9ad6c9', biome: 'mythic', event: 's1', bio: 'Auroral Fox trails ribbons of northern light across the night.' },
  { id: 'season_s1_4', name: 'Snowdrift Panda', family: 'panda', rarity: 'epic', emoji: '🐼', color: '#e6f3ff', biome: 'mythic', event: 's1', bio: 'Snowdrift Panda rolls into perfect snowballs and giggles softly.' },
  { id: 'season_s1_5', name: 'Icewyrm', family: 'dragon', rarity: 'legendary', emoji: '🐲', color: '#a7d3f0', biome: 'mythic', event: 's1', bio: 'Icewyrm breathes shimmering frost flowers instead of fire.' },
  { id: 'season_s1_6', name: 'Cryo-Bot', family: 'robot', rarity: 'epic', emoji: '🤖', color: '#bcd9ec', biome: 'mythic', event: 's1', bio: 'Cryo-Bot hums carols while polishing the lake into a skating rink.' },
  { id: 'season_s1_7', name: 'Tide Caroler', family: 'merfolk', rarity: 'legendary', emoji: '🧜', color: '#a9e0e8', biome: 'mythic', event: 's1', bio: 'Tide Caroler sings frosty sea shanties beneath the winter moon.' },
  { id: 'season_s1_8', name: 'Blizzard Yeti', family: 'yeti', rarity: 'mythic', emoji: '☃️', color: '#eaf6ff', biome: 'mythic', event: 's1', bio: 'Blizzard Yeti dances and the whole island sparkles with snow.' },
  { id: 'season_s1_9', name: 'Peppermint Kitten', family: 'cat', rarity: 'legendary', emoji: '🐈', color: '#ffd2d8', biome: 'mythic', event: 's1', bio: 'Peppermint Kitten smells of candy canes and warm cocoa hugs.' },
  { id: 'season_s1_10', name: 'Tinsel Hound', family: 'dog', rarity: 'epic', emoji: '🐕', color: '#d8f0d2', biome: 'mythic', event: 's1', bio: 'Tinsel Hound wags a sparkly tail strung with tiny jingle bells.' },
  { id: 'season_s1_11', name: 'Solstice Fox', family: 'fox', rarity: 'mythic', emoji: '🦊', color: '#ffe0a8', biome: 'mythic', event: 's1', bio: 'Solstice Fox carries the longest night and the first warm dawn.' },
  { id: 'season_s1_12', name: 'Cocoa Panda', family: 'panda', rarity: 'legendary', emoji: '🐼', color: '#e7c9a8', biome: 'mythic', event: 's1', bio: 'Cocoa Panda sips marshmallow cocoa and shares the last mug.' },
  { id: 'season_s1_13', name: 'Starfrost Dragon', family: 'dragon', rarity: 'mythic', emoji: '🐉', color: '#c4b6ff', biome: 'mythic', event: 's1', bio: 'Starfrost Dragon scatters constellations across the frozen sky.' },
  { id: 'season_s1_14', name: 'Jingle Bot', family: 'robot', rarity: 'legendary', emoji: '🤖', color: '#ffcf9e', biome: 'mythic', event: 's1', bio: 'Jingle Bot chimes a merry tune with every happy little step.' },
  { id: 'season_s1_15', name: 'Frostlace Mermaid', family: 'merfolk', rarity: 'legendary', emoji: '🧜‍♀️', color: '#bfeae0', biome: 'mythic', event: 's1', bio: 'Frostlace Mermaid weaves snowflakes into delicate winter veils.' },
];
