import { useGame } from '../store/gameStore';
import { DECORATIONS } from '../data/decorations';
import { IAP_CATALOG } from '../lib/iap';
import { formatNumber } from '../lib/format';

export function ShopScreen() {
  const coins = useGame((s) => s.coins);
  const owned = useGame((s) => s.ownedDecorations);
  const buyDecoration = useGame((s) => s.buyDecoration);
  const grant = useGame((s) => s.grant);

  return (
    <div className="screen-scroll">
      <h2 className="screen-title">🛒 Shop</h2>

      <h3 className="section-title">💎 Gem Packs</h3>
      <div className="iap-grid">
        {IAP_CATALOG.map((p) => (
          <button
            key={p.productId}
            className="iap-card"
            onClick={() => {
              // Sandbox grant — real builds validate the receipt server-side.
              grant(p.grantCoins ?? 0, p.grantGems ?? 0);
            }}
          >
            <span className="iap-emoji">{p.emoji}</span>
            <span className="iap-title">{p.title}</span>
            <span className="iap-price">${p.priceUsd.toFixed(2)}</span>
          </button>
        ))}
      </div>

      <h3 className="section-title">🌸 Decorations (+2–4% island boost)</h3>
      <div className="decor-grid">
        {DECORATIONS.map((d) => {
          const has = owned.includes(d.id);
          return (
            <div key={d.id} className="decor-card">
              <span className="decor-emoji">{d.emoji}</span>
              <span className="decor-name">{d.name}</span>
              <button
                className="claim-btn"
                disabled={has || coins < d.cost}
                onClick={() => buyDecoration(d.id)}
              >
                {has ? 'Placed ✓' : `💰${formatNumber(d.cost)}`}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
