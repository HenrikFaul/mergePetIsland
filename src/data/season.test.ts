import { describe, it, expect } from 'vitest';
import { SEASON, seasonLevel, tierProgress } from './season';
import {
  SPECIES,
  SEASON_SPECIES,
  speciesByRarity,
  randomSpecies,
  speciesById,
} from './species';
import type { Rarity } from '../types';

describe('season progression', () => {
  it('derives level from xp and caps at the tier count', () => {
    expect(seasonLevel(0)).toBe(0);
    expect(seasonLevel(99)).toBe(0);
    expect(seasonLevel(100)).toBe(1);
    expect(seasonLevel(SEASON.xpPerTier * SEASON.tiers.length)).toBe(SEASON.tiers.length);
    expect(seasonLevel(9_999_999)).toBe(SEASON.tiers.length);
  });

  it('reports progress within the current tier', () => {
    expect(tierProgress(150)).toEqual({ current: 50, needed: 100 });
    expect(tierProgress(0)).toEqual({ current: 0, needed: 100 });
  });

  it('has 30 tiers with an exclusive pet on every even tier', () => {
    expect(SEASON.tiers).toHaveLength(30);
    const petTiers = SEASON.tiers.filter((t) => t.premium.kind === 'pet');
    expect(petTiers).toHaveLength(15);
    for (const t of petTiers) {
      if (t.premium.kind === 'pet') {
        expect(speciesById(t.premium.speciesId)).toBeDefined();
      }
    }
  });
});

describe('season pets never leak into random pools', () => {
  const RARITIES: Rarity[] = ['common', 'rare', 'epic', 'legendary', 'mythic'];

  it('speciesByRarity excludes event-flagged pets', () => {
    for (const r of RARITIES) {
      for (const sp of speciesByRarity(r)) {
        expect(sp.event).toBeUndefined();
      }
    }
  });

  it('randomSpecies never returns a season pet over many rolls', () => {
    const seasonIds = new Set(SEASON_SPECIES.map((s) => s.id));
    let rolls = 0;
    for (const r of RARITIES) {
      for (let i = 0; i < 500; i++) {
        const sp = randomSpecies(r, Math.random);
        expect(seasonIds.has(sp.id)).toBe(false);
        rolls++;
      }
    }
    expect(rolls).toBe(2500);
  });

  it('keeps base catalog at 60 and season pets separate but id-lookable', () => {
    expect(SPECIES).toHaveLength(60);
    expect(SEASON_SPECIES).toHaveLength(15);
    expect(speciesById('season_s1_8')?.event).toBe('s1');
  });
});
