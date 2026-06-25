import type { DailyRewardDef } from '../types';

export const DAILY_REWARDS: DailyRewardDef[] = [
  { day: 1, coins: 500, gems: 0 },
  { day: 2, coins: 1000, gems: 5 },
  { day: 3, coins: 2000, gems: 10 },
  { day: 4, coins: 4000, gems: 15 },
  { day: 5, coins: 8000, gems: 20 },
  { day: 6, coins: 15000, gems: 30 },
  { day: 7, coins: 30000, gems: 50, legendaryPet: true },
];

export function rewardForStreakDay(streak: number): DailyRewardDef {
  // streak is 1-based; cycle back to day 1 after day 7.
  const idx = ((streak - 1) % 7 + 7) % 7;
  return DAILY_REWARDS[idx];
}
