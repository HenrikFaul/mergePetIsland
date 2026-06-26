import { useGame } from '../store/gameStore';
import { SEASON, seasonLevel, tierProgress } from '../data/season';
import { speciesById } from '../data/species';
import { EGGS } from '../data/eggs';
import { formatNumber } from '../lib/format';
import type { SeasonReward } from '../types';

function rewardFace(r: SeasonReward): { emoji: string; label: string } {
  switch (r.kind) {
    case 'coins':
      return { emoji: '💰', label: formatNumber(r.amount) };
    case 'gems':
      return { emoji: '💎', label: String(r.amount) };
    case 'egg':
      return { emoji: EGGS[r.egg].emoji, label: EGGS[r.egg].label };
    case 'pet': {
      const sp = speciesById(r.speciesId);
      return { emoji: sp?.emoji ?? '🐾', label: sp?.name ?? 'Pet' };
    }
  }
}

export function SeasonScreen() {
  const xp = useGame((s) => s.seasonXp);
  const premium = useGame((s) => s.seasonPremium);
  const claimedFree = useGame((s) => s.seasonClaimedFree);
  const claimedPremium = useGame((s) => s.seasonClaimedPremium);
  const claimTier = useGame((s) => s.claimSeasonTier);
  const unlockPremium = useGame((s) => s.unlockSeasonPremium);

  const level = seasonLevel(xp);
  const { current, needed } = tierProgress(xp);
  const daysLeft = Math.max(
    0,
    Math.ceil((new Date(SEASON.endsOn).getTime() - Date.now()) / 86400000),
  );

  return (
    <div className="screen-scroll season-screen">
      <div className="season-header">
        <div className="season-emoji">{SEASON.emoji}</div>
        <div>
          <h2 className="season-name">{SEASON.name}</h2>
          <span className="season-sub">
            Tier {level}/{SEASON.tiers.length} · {daysLeft}d left
          </span>
        </div>
      </div>

      <div className="season-xpbar">
        <div
          className="season-xpbar-fill"
          style={{ width: `${level >= SEASON.tiers.length ? 100 : (current / needed) * 100}%` }}
        />
        <span className="season-xplabel">
          {level >= SEASON.tiers.length ? 'MAX' : `${current}/${needed} ⭐`}
        </span>
      </div>

      {!premium && (
        <button className="season-premium-cta" onClick={unlockPremium}>
          🏆 Unlock Battle Pass — exclusive Frostfall pets!
        </button>
      )}

      <div className="season-track-head">
        <span className="track-col">Tier</span>
        <span className="track-col">Free</span>
        <span className="track-col">{premium ? 'Premium ✓' : 'Premium 🔒'}</span>
      </div>

      <div className="season-track">
        {SEASON.tiers.map((t) => {
          const reached = level >= t.tier;
          const freeClaimed = claimedFree.includes(t.tier);
          const premClaimed = claimedPremium.includes(t.tier);
          const free = rewardFace(t.free);
          const prem = rewardFace(t.premium);
          return (
            <div key={t.tier} className={`season-tier ${reached ? 'reached' : ''}`}>
              <div className="tier-num">{t.tier}</div>

              <button
                className={`reward-chip ${freeClaimed ? 'claimed' : reached ? 'ready' : 'locked'}`}
                disabled={!reached || freeClaimed}
                onClick={() => claimTier(t.tier, 'free')}
              >
                <span className="reward-emoji">{free.emoji}</span>
                <span className="reward-label">{free.label}</span>
                {freeClaimed && <span className="reward-tick">✓</span>}
              </button>

              <button
                className={`reward-chip premium ${
                  premClaimed
                    ? 'claimed'
                    : reached && premium
                      ? 'ready'
                      : 'locked'
                } ${t.premium.kind === 'pet' ? 'is-pet' : ''}`}
                disabled={!reached || premClaimed || !premium}
                onClick={() => claimTier(t.tier, 'premium')}
              >
                <span className="reward-emoji">{prem.emoji}</span>
                <span className="reward-label">{prem.label}</span>
                {premClaimed && <span className="reward-tick">✓</span>}
                {!premium && <span className="reward-lock">🔒</span>}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
