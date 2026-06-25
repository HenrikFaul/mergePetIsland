import { useGame } from '../store/gameStore';
import { EGGS, EGG_ORDER, basicEggPrice } from '../data/eggs';

export function EggShopRibbon() {
  const buyEgg = useGame((s) => s.buyEgg);
  const grantFreeEgg = useGame((s) => s.grantFreeEgg);
  const eggPurchasesToday = useGame((s) => s.eggPurchasesToday);
  const freeEggReadyAt = useGame((s) => s.freeEggReadyAt);
  const freeReady = Date.now() >= freeEggReadyAt;

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
        className={`egg-btn free ${freeReady ? '' : 'disabled'}`}
        onClick={grantFreeEgg}
        disabled={!freeReady}
      >
        <span className="egg-emoji">🎬</span>
        <span className="egg-label">Free Egg</span>
        <span className="egg-price">{freeReady ? 'Watch Ad' : 'Cooldown'}</span>
      </button>
    </div>
  );
}
