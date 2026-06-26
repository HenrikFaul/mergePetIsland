import { useEffect, useState } from 'react';
import { useGame } from '../store/gameStore';
import { EGGS, EGG_ORDER, basicEggPrice } from '../data/eggs';
import { showRewarded } from '../lib/ads';
import { formatDuration } from '../lib/format';

export function EggShopRibbon() {
  const buyEgg = useGame((s) => s.buyEgg);
  const grantFreeEgg = useGame((s) => s.grantFreeEgg);
  const eggPurchasesToday = useGame((s) => s.eggPurchasesToday);
  const freeEggReadyAt = useGame((s) => s.freeEggReadyAt);
  // Re-render once per second so the Free Egg button enables when its cooldown
  // elapses (freeReady derives from Date.now(), which isn't reactive on its own).
  const [, setNow] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setNow((n) => n + 1), 1000);
    return () => clearInterval(id);
  }, []);
  const freeReady = Date.now() >= freeEggReadyAt;

  const freeEggViaAd = async () => {
    const ok = await showRewarded('free_egg');
    if (ok) grantFreeEgg();
  };

  return (
    <div className="egg-ribbon">
      {EGG_ORDER.map((kind) => {
        const egg = EGGS[kind];
        const price = kind === 'basic' ? basicEggPrice(eggPurchasesToday) : egg.cost;
        return (
          <button key={kind} className="egg-btn" onClick={() => buyEgg(kind)}>
            <span className="egg-emoji">{egg.emoji}</span>
            <span className="egg-label">{egg.label}</span>
            <span className="egg-price">
              {egg.currency === 'coin' ? '💰' : '💎'} {price}
            </span>
          </button>
        );
      })}
      <button
        className={`egg-btn free ${freeReady ? 'ready' : 'disabled'}`}
        onClick={freeEggViaAd}
        disabled={!freeReady}
      >
        <span className="egg-emoji">🎬</span>
        <span className="egg-label">Free Egg</span>
        <span className="egg-price">
          {freeReady
            ? 'Watch Ad'
            : formatDuration(Math.ceil((freeEggReadyAt - Date.now()) / 1000))}
        </span>
      </button>
    </div>
  );
}
