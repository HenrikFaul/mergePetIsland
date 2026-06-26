import { create } from 'zustand';
import type {
  SaveState,
  Entity,
  EggKind,
  BiomeId,
  ActiveQuest,
  GameSettings,
  Species,
} from '../types';
import { GRID_W, GRID_H } from '../types';
import { loadSave, persistSave } from '../lib/persistence';
import { todayUtc } from '../lib/format';
import { nanoid, rand } from '../lib/rng';
import { canMerge, mergeEntities } from '../engine/mergeRules';
import { tickEntity, petCoinPerSec } from '../engine/coin';
import { spawnFromEgg, spawnSpecies, boardIsFull } from '../engine/spawn';
import { computeOffline } from '../engine/offline';
import { SPECIES, speciesById, randomSpecies } from '../data/species';
import { EGGS, basicEggPrice } from '../data/eggs';
import { BIOME_BY_ID } from '../data/biomes';
import { DECORATION_BY_ID } from '../data/decorations';
import { QUEST_POOL, newActiveQuest } from '../data/quests';
import { rewardForStreakDay } from '../data/dailyRewards';
import {
  playMerge,
  playCollect,
  playReveal,
  setSoundEnabled,
  resumeAudio,
} from '../lib/sound';
import { track } from '../lib/analytics';

export type Screen = 'island' | 'map' | 'shop' | 'album' | 'settings';

export interface Toast {
  id: string;
  text: string;
  emoji?: string;
}

interface UiState {
  started: boolean;
  returningPlayer: boolean;
  screen: Screen;
  toasts: Toast[];
  petReveal: { species: Species; level: number } | null;
  offlineModal: { seconds: number; earned: number } | null;
  dailyModalOpen: boolean;
  biomeUnlockModal: BiomeId | null;
}

interface GameState extends SaveState, UiState {
  // lifecycle
  init: () => void;
  start: () => void;
  tick: () => void;
  save: () => void;
  // board
  collect: (entityId: string) => void;
  collectAll: () => void;
  moveOrMerge: (draggedId: string, x: number, y: number) => void;
  // economy
  buyEgg: (kind: EggKind) => void;
  grantFreeEgg: () => void;
  unlockBiome: (id: BiomeId) => void;
  buyDecoration: (id: string) => void;
  grant: (coins: number, gems: number) => void;
  // quests / daily
  claimQuest: (key: string) => void;
  claimDaily: () => void;
  restoreStreak: () => void;
  // ui
  setScreen: (s: Screen) => void;
  dismissPetReveal: () => void;
  claimOffline: (doubled: boolean) => void;
  openDaily: () => void;
  closeDaily: () => void;
  dismissBiomeModal: () => void;
  pushToast: (text: string, emoji?: string) => void;
  updateSettings: (patch: Partial<GameSettings>) => void;
}

function starterGrid(): Entity[] {
  // Two pairs of common pets to make the first merge obvious.
  const commons = SPECIES.filter((s) => s.rarity === 'common').slice(0, 2);
  const grid: Entity[] = [];
  let slot = 0;
  for (const sp of commons) {
    for (let i = 0; i < 2; i++) {
      const x = slot % GRID_W;
      const y = Math.floor(slot / GRID_W);
      grid.push({
        id: nanoid(),
        type: 'pet',
        species: sp.id,
        level: 1,
        gridX: x,
        gridY: y,
        coinPerSec: petCoinPerSec(sp.id, 1),
        accumulatedCoin: 0,
        lastTickAt: Date.now(),
      });
      slot++;
    }
  }
  return grid;
}

function freshSave(): SaveState {
  const grid = starterGrid();
  const album: Record<string, number> = {};
  for (const e of grid) album[e.species] = Math.max(album[e.species] ?? 0, e.level);
  return {
    version: 1,
    coins: 100,
    gems: 20,
    grid,
    biomesUnlocked: ['grass'],
    album,
    ownedDecorations: [],
    dailyStreak: 0,
    lastDailyClaim: null,
    quests: [],
    questDate: null,
    eggPurchasesToday: 0,
    eggPurchaseDate: null,
    lastSeenAt: Date.now(),
    freeEggReadyAt: 0,
    settings: {
      sound: true,
      music: true,
      reducedMotion: false,
      colorBlindSafe: false,
      locale: 'en',
    },
    stats: {
      totalMerges: 0,
      totalCoinsCollected: 0,
      petsDiscovered: Object.keys(album).length,
      biomesUnlocked: 1,
    },
  };
}

const initialUi: UiState = {
  started: false,
  returningPlayer: false,
  screen: 'island',
  toasts: [],
  petReveal: null,
  offlineModal: null,
  dailyModalOpen: false,
  biomeUnlockModal: null,
};

/** Draw 3 daily quests (one per difficulty) from the pool. */
function rollDailyQuests(): ActiveQuest[] {
  const byDiff = (d: ActiveQuest['difficulty']) =>
    QUEST_POOL.filter((q) => q.difficulty === d);
  const pick = (arr: typeof QUEST_POOL) =>
    arr[Math.floor(rand() * arr.length)];
  return [pick(byDiff('easy')), pick(byDiff('medium')), pick(byDiff('hard'))]
    .filter(Boolean)
    .map(newActiveQuest);
}

function recordAlbum(state: SaveState, speciesId: string, level: number): boolean {
  const prev = state.album[speciesId];
  const isNew = prev === undefined;
  state.album[speciesId] = Math.max(prev ?? 0, level);
  if (isNew) state.stats.petsDiscovered = Object.keys(state.album).length;
  return isNew;
}

function bumpQuest(quests: ActiveQuest[], kind: ActiveQuest['kind'], amount: number) {
  for (const q of quests) {
    if (q.kind === kind && !q.claimed) {
      q.progress = Math.min(q.target, q.progress + amount);
    }
  }
}

export const useGame = create<GameState>((set, get) => ({
  ...freshSave(),
  ...initialUi,

  init() {
    const loaded = loadSave();
    const base = loaded ?? freshSave();
    // Offline earnings
    const off = computeOffline(base.grid, base.lastSeenAt);
    const today = todayUtc();

    // Daily quest refresh
    let quests = base.quests;
    if (base.questDate !== today || quests.length === 0) {
      quests = rollDailyQuests();
    }
    // Reset daily egg counter
    let eggPurchasesToday = base.eggPurchasesToday;
    if (base.eggPurchaseDate !== today) eggPurchasesToday = 0;

    set({
      ...base,
      quests,
      questDate: today,
      eggPurchasesToday,
      eggPurchaseDate: today,
      ...initialUi,
      returningPlayer: loaded !== null,
      offlineModal: off.earned > 0 ? off : null,
    });
    setSoundEnabled(base.settings.sound);
    get().save();
  },

  start() {
    resumeAudio();
    set({ started: true });
  },

  tick() {
    const now = Date.now();
    set((s) => {
      let changed = false;
      for (const e of s.grid) {
        if (e.type === 'pet') {
          const elapsed = (now - e.lastTickAt) / 1000;
          if (elapsed > 0) {
            tickEntity(e, elapsed);
            e.lastTickAt = now;
            changed = true;
          }
        }
      }
      return changed ? { grid: [...s.grid] } : {};
    });
  },

  save() {
    const s = get();
    const snapshot: SaveState = {
      version: s.version,
      coins: s.coins,
      gems: s.gems,
      grid: s.grid,
      biomesUnlocked: s.biomesUnlocked,
      album: s.album,
      ownedDecorations: s.ownedDecorations,
      dailyStreak: s.dailyStreak,
      lastDailyClaim: s.lastDailyClaim,
      quests: s.quests,
      questDate: s.questDate,
      eggPurchasesToday: s.eggPurchasesToday,
      eggPurchaseDate: s.eggPurchaseDate,
      lastSeenAt: Date.now(),
      freeEggReadyAt: s.freeEggReadyAt,
      settings: s.settings,
      stats: s.stats,
    };
    persistSave(snapshot);
  },

  collect(entityId) {
    set((s) => {
      const e = s.grid.find((g) => g.id === entityId);
      if (!e || e.accumulatedCoin <= 0) return {};
      const gain = Math.floor(e.accumulatedCoin);
      e.accumulatedCoin = 0;
      playCollect();
      const quests = [...s.quests];
      bumpQuest(quests, 'collect_coins', gain);
      bumpQuest(quests, 'tap_collect', 1);
      return {
        coins: s.coins + gain,
        grid: [...s.grid],
        quests,
        stats: { ...s.stats, totalCoinsCollected: s.stats.totalCoinsCollected + gain },
      };
    });
    get().save();
  },

  collectAll() {
    set((s) => {
      let gain = 0;
      for (const e of s.grid) {
        if (e.type === 'pet' && e.accumulatedCoin > 0) {
          gain += Math.floor(e.accumulatedCoin);
          e.accumulatedCoin = 0;
        }
      }
      if (gain <= 0) return {};
      playCollect();
      const quests = [...s.quests];
      bumpQuest(quests, 'collect_coins', gain);
      bumpQuest(quests, 'tap_collect', 1);
      return {
        coins: s.coins + gain,
        grid: [...s.grid],
        quests,
        stats: { ...s.stats, totalCoinsCollected: s.stats.totalCoinsCollected + gain },
      };
    });
    get().save();
  },

  moveOrMerge(draggedId, x, y) {
    const s = get();
    const dragged = s.grid.find((g) => g.id === draggedId);
    if (!dragged) return;
    if (x < 0 || x >= GRID_W || y < 0 || y >= GRID_H) return;
    const target = s.grid.find((g) => g.gridX === x && g.gridY === y && g.id !== draggedId);

    if (!target) {
      // move into empty cell
      set((st) => {
        const d = st.grid.find((g) => g.id === draggedId);
        if (!d) return {};
        d.gridX = x;
        d.gridY = y;
        return { grid: [...st.grid] };
      });
      get().save();
      return;
    }

    if (canMerge(dragged, target)) {
      const merged = mergeEntities(dragged, target);
      playMerge();
      track({
        name: 'merge_performed',
        species: merged.species,
        from_level: target.level,
        to_level: merged.level,
      });
      set((st) => {
        const grid = st.grid.filter((g) => g.id !== draggedId && g.id !== target.id);
        grid.push(merged);
        const quests = [...st.quests];
        bumpQuest(quests, 'merge_to_level', 1);
        const isNew = recordAlbum(st as SaveState, merged.species, merged.level);
        if (isNew) {
          bumpQuest(quests, 'unlock_pet', 1);
          playReveal();
          const sp = speciesById(merged.species);
          if (sp) track({ name: 'pet_unlocked', species: sp.id, rarity: sp.rarity, level: merged.level });
        }
        return {
          grid,
          quests,
          stats: { ...st.stats, totalMerges: st.stats.totalMerges + 1 },
          petReveal: isNew
            ? { species: speciesById(merged.species)!, level: merged.level }
            : st.petReveal,
        };
      });
      get().pushToast(`Merged to Lv${merged.level}!`, '✨');
      get().save();
    }
    // else: incompatible — UI snaps back, no state change
  },

  buyEgg(kind) {
    const s = get();
    if (boardIsFull(s.grid)) {
      get().pushToast('Board is full — merge first!', '⚠️');
      return;
    }
    const egg = EGGS[kind];
    const price = kind === 'basic' ? basicEggPrice(s.eggPurchasesToday) : egg.cost;
    if (egg.currency === 'coin' && s.coins < price) {
      get().pushToast('Not enough coins', '💰');
      return;
    }
    if (egg.currency === 'gem' && s.gems < price) {
      get().pushToast('Not enough gems', '💎');
      return;
    }
    const ddaBoost = noNewPetRecently(s);
    const pet = spawnFromEgg(egg, s.grid, s.biomesUnlocked, ddaBoost);
    if (!pet) {
      get().pushToast('Board is full — merge first!', '⚠️');
      return;
    }
    track({ name: 'egg_purchased', egg_type: kind, source: 'shop' });
    set((st) => {
      const grid = [...st.grid, pet];
      const quests = [...st.quests];
      bumpQuest(quests, 'buy_egg', 1);
      const isNew = recordAlbum(st as SaveState, pet.species, pet.level);
      if (isNew) {
        bumpQuest(quests, 'unlock_pet', 1);
        playReveal();
        const sp = speciesById(pet.species);
        if (sp) track({ name: 'pet_unlocked', species: sp.id, rarity: sp.rarity, level: pet.level });
      }
      return {
        grid,
        quests,
        coins: egg.currency === 'coin' ? st.coins - price : st.coins,
        gems: egg.currency === 'gem' ? st.gems - price : st.gems,
        eggPurchasesToday: st.eggPurchasesToday + (kind === 'basic' ? 1 : 0),
        petReveal: isNew
          ? { species: speciesById(pet.species)!, level: pet.level }
          : st.petReveal,
      };
    });
    get().save();
  },

  grantFreeEgg() {
    const s = get();
    if (Date.now() < s.freeEggReadyAt) {
      get().pushToast('Free egg on cooldown', '⏳');
      return;
    }
    const pet = spawnFromEgg(EGGS.basic, s.grid, s.biomesUnlocked, false);
    if (!pet) {
      get().pushToast('Board is full — merge first!', '⚠️');
      return;
    }
    set((st) => {
      const isNew = recordAlbum(st as SaveState, pet.species, pet.level);
      return {
        grid: [...st.grid, pet],
        freeEggReadyAt: Date.now() + 4 * 3600 * 1000,
        petReveal: isNew
          ? { species: speciesById(pet.species)!, level: pet.level }
          : st.petReveal,
      };
    });
    get().pushToast('Free egg claimed!', '🥚');
    get().save();
  },

  unlockBiome(id) {
    const s = get();
    if (s.biomesUnlocked.includes(id)) return;
    const def = BIOME_BY_ID[id];
    const hasPet = s.grid.some((e) => e.type === 'pet' && e.level >= def.requiresPetLevel);
    if (!hasPet) {
      get().pushToast(`Need a Lv${def.requiresPetLevel} pet`, '🔒');
      return;
    }
    if (s.gems < def.gemCost) {
      get().pushToast('Not enough gems', '💎');
      return;
    }
    set((st) => ({
      gems: st.gems - def.gemCost + def.unlockReward.gems,
      coins: st.coins + def.unlockReward.coins,
      biomesUnlocked: [...st.biomesUnlocked, id],
      biomeUnlockModal: id,
      stats: { ...st.stats, biomesUnlocked: st.stats.biomesUnlocked + 1 },
    }));
    playReveal();
    track({ name: 'biome_unlocked', biome: id });
    get().save();
  },

  buyDecoration(id) {
    const s = get();
    if (s.ownedDecorations.includes(id)) return;
    const def = DECORATION_BY_ID[id];
    if (!def) return;
    if (s.coins < def.cost) {
      get().pushToast('Not enough coins', '💰');
      return;
    }
    set((st) => {
      const owned = [...st.ownedDecorations, id];
      const quests = [...st.quests];
      bumpQuest(quests, 'place_decoration', 1);
      return { coins: st.coins - def.cost, ownedDecorations: owned, quests };
    });
    get().pushToast(`Placed ${def.name}!`, def.emoji);
    get().save();
  },

  grant(coins, gems) {
    set((s) => ({ coins: s.coins + coins, gems: s.gems + gems }));
    get().save();
  },

  claimQuest(key) {
    const s = get();
    const q = s.quests.find((x) => x.key === key);
    if (!q || q.claimed || q.progress < q.target) return;
    set((st) => {
      const quests = st.quests.map((x) =>
        x.key === key ? { ...x, claimed: true } : x,
      );
      let grid = st.grid;
      if (q.reward.egg) {
        const pet = spawnFromEgg(EGGS[q.reward.egg], grid, st.biomesUnlocked, false);
        if (pet) {
          grid = [...grid, pet];
          recordAlbum(st as SaveState, pet.species, pet.level);
        }
      }
      return { quests, gems: st.gems + q.reward.gems, grid };
    });
    track({ name: 'quest_completed', key });
    get().pushToast(`Quest reward: +${q.reward.gems}💎`, '🎉');
    get().save();
  },

  claimDaily() {
    const s = get();
    const today = todayUtc();
    if (s.lastDailyClaim === today) {
      get().pushToast('Already claimed today', '✅');
      return;
    }
    // continue streak if yesterday, else reset to 1
    const yesterday = todayUtc(Date.now() - 86400000);
    const streak = s.lastDailyClaim === yesterday ? s.dailyStreak + 1 : 1;
    const reward = rewardForStreakDay(streak);
    set((st) => {
      let grid = st.grid;
      if (reward.legendaryPet) {
        const sp = randomSpecies('legendary', rand, st.biomesUnlocked);
        const pet = spawnSpecies(sp.id, 1, grid);
        if (pet) {
          grid = [...grid, pet];
          recordAlbum(st as SaveState, pet.species, pet.level);
        }
      }
      return {
        coins: st.coins + reward.coins,
        gems: st.gems + reward.gems,
        dailyStreak: streak,
        lastDailyClaim: today,
        grid,
        dailyModalOpen: false,
      };
    });
    track({ name: 'daily_reward_claimed', day: ((streak - 1) % 7) + 1, streak });
    get().pushToast(`Daily Day ${((streak - 1) % 7) + 1} claimed!`, '🎁');
    get().save();
  },

  restoreStreak() {
    const s = get();
    if (s.gems < 1) {
      get().pushToast('Not enough gems', '💎');
      return;
    }
    set((st) => ({ gems: st.gems - 1, dailyStreak: Math.max(1, st.dailyStreak) }));
    get().pushToast('Streak restored!', '🔥');
    get().save();
  },

  setScreen(screen) {
    set({ screen });
  },

  dismissPetReveal() {
    set({ petReveal: null });
  },

  claimOffline(doubled) {
    const s = get();
    if (!s.offlineModal) return;
    const earned = doubled ? s.offlineModal.earned * 2 : s.offlineModal.earned;
    set((st) => ({
      coins: st.coins + earned,
      offlineModal: null,
      stats: { ...st.stats, totalCoinsCollected: st.stats.totalCoinsCollected + earned },
    }));
    track({ name: 'offline_reward_claimed', amount: earned, doubled });
    get().pushToast(`+${earned} coins offline`, '💰');
    get().save();
  },

  openDaily() {
    set({ dailyModalOpen: true });
  },
  closeDaily() {
    set({ dailyModalOpen: false });
  },
  dismissBiomeModal() {
    set({ biomeUnlockModal: null });
  },

  pushToast(text, emoji) {
    const id = nanoid();
    set((s) => ({ toasts: [...s.toasts, { id, text, emoji }] }));
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
    }, 2200);
  },

  updateSettings(patch) {
    if (patch.sound !== undefined) setSoundEnabled(patch.sound);
    set((s) => ({ settings: { ...s.settings, ...patch } }));
    get().save();
  },
}));

/** Heuristic: has the player discovered a new pet recently? (drives DDA boost) */
function noNewPetRecently(_s: SaveState): boolean {
  // Simplified: random small chance to enable the silent boost.
  return rand() < 0.25;
}

export function unlockedBiomeIds(): BiomeId[] {
  return useGame.getState().biomesUnlocked;
}
