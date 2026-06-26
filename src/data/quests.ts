import type { ActiveQuest, QuestDef } from '../types';

/** Pool of quest templates. Three are drawn each day (easy/medium/hard). */
export const QUEST_POOL: QuestDef[] = [
  {
    key: 'merge_lv3',
    kind: 'merge_to_level',
    label: 'Merge pets to reach Level 3 three times',
    target: 3,
    level: 3,
    difficulty: 'easy',
    reward: { gems: 5, egg: 'basic' },
  },
  {
    key: 'merge_lv4',
    kind: 'merge_to_level',
    label: 'Merge pets to reach Level 4 five times',
    target: 5,
    level: 4,
    difficulty: 'medium',
    reward: { gems: 15, egg: 'golden' },
  },
  {
    key: 'merge_lv6',
    kind: 'merge_to_level',
    label: 'Merge pets to reach Level 6 twice',
    target: 2,
    level: 6,
    difficulty: 'hard',
    reward: { gems: 30, egg: 'mythic' },
  },
  {
    key: 'collect_5k',
    kind: 'collect_coins',
    label: 'Collect 5,000 coins',
    target: 5000,
    difficulty: 'easy',
    reward: { gems: 5 },
  },
  {
    key: 'collect_25k',
    kind: 'collect_coins',
    label: 'Collect 25,000 coins',
    target: 25000,
    difficulty: 'medium',
    reward: { gems: 15, egg: 'golden' },
  },
  {
    key: 'place_2_decor',
    kind: 'place_decoration',
    label: 'Place 2 decorations',
    target: 2,
    difficulty: 'medium',
    reward: { gems: 15 },
  },
  {
    key: 'buy_3_eggs',
    kind: 'buy_egg',
    label: 'Buy 3 eggs',
    target: 3,
    difficulty: 'easy',
    reward: { gems: 5, egg: 'basic' },
  },
  {
    key: 'discover_2_pets',
    kind: 'unlock_pet',
    label: 'Discover 2 new pet species',
    target: 2,
    difficulty: 'hard',
    reward: { gems: 30, egg: 'golden' },
  },
  {
    key: 'tap_collect_20',
    kind: 'tap_collect',
    label: 'Tap-collect coins 20 times',
    target: 20,
    difficulty: 'easy',
    reward: { gems: 5 },
  },
];

export function newActiveQuest(def: QuestDef): ActiveQuest {
  return { ...def, progress: 0, claimed: false };
}
