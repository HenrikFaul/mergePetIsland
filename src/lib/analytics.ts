// Analytics facade. Wire to PostHog/GA in production; logs to console in dev.

export type AnalyticsEvent =
  | { name: 'merge_performed'; species: string; from_level: number; to_level: number }
  | { name: 'pet_unlocked'; species: string; rarity: string; level: number }
  | { name: 'biome_unlocked'; biome: string }
  | { name: 'egg_purchased'; egg_type: string; source: 'shop' | 'rewarded' }
  | { name: 'quest_completed'; key: string }
  | { name: 'daily_reward_claimed'; day: number; streak: number }
  | { name: 'offline_reward_claimed'; amount: number; doubled: boolean };

export function track(event: AnalyticsEvent): void {
  // eslint-disable-next-line no-console
  if (import.meta.env?.DEV) console.debug('[analytics]', event.name, event);
}
