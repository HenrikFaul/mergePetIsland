import type { SeasonDef, SeasonReward, SeasonTier } from '../types';

const TIER_COUNT = 30;

function buildTiers(): SeasonTier[] {
  const tiers: SeasonTier[] = [];
  for (let t = 1; t <= TIER_COUNT; t++) {
    // Free track — always rewarding: scaling coins, gems every 5th, egg every 10th.
    let free: SeasonReward;
    if (t % 10 === 0) free = { kind: 'egg', egg: 'golden' };
    else if (t % 5 === 0) free = { kind: 'gems', amount: 20 };
    else free = { kind: 'coins', amount: 500 + t * 300 };

    // Premium track — every EVEN tier grants the next exclusive season pet (15 total),
    // mythic eggs on tiers 5/15/25, gems otherwise.
    let premium: SeasonReward;
    if (t % 2 === 0) {
      premium = { kind: 'pet', speciesId: `season_s1_${t / 2}` };
    } else if (t % 5 === 0) {
      premium = { kind: 'egg', egg: 'mythic' };
    } else {
      premium = { kind: 'gems', amount: 25 };
    }

    tiers.push({ tier: t, free, premium });
  }
  return tiers;
}

export const SEASON: SeasonDef = {
  id: 's1',
  name: 'Frostfall Festival',
  emoji: '❄️',
  endsOn: '2026-07-26',
  xpPerTier: 100,
  tiers: buildTiers(),
};

/** Season level (0..30) for a given XP total. */
export function seasonLevel(xp: number): number {
  return Math.min(SEASON.tiers.length, Math.floor(xp / SEASON.xpPerTier));
}

/** XP progress within the current tier, as { current, needed }. */
export function tierProgress(xp: number): { current: number; needed: number } {
  const lvl = seasonLevel(xp);
  if (lvl >= SEASON.tiers.length) return { current: SEASON.xpPerTier, needed: SEASON.xpPerTier };
  return { current: xp - lvl * SEASON.xpPerTier, needed: SEASON.xpPerTier };
}
