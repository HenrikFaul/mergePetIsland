import { useGame } from '../store/gameStore';
import { BIOME_BY_ID } from '../data/biomes';
import { formatNumber } from '../lib/format';

export function BiomeUnlockModal() {
  const id = useGame((s) => s.biomeUnlockModal);
  const dismiss = useGame((s) => s.dismissBiomeModal);
  if (!id) return null;
  const b = BIOME_BY_ID[id];

  return (
    <div className="modal-overlay" onClick={dismiss}>
      <div
        className="modal-card biome-unlock"
        style={{ background: b.background }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="reveal-burst" />
        <span className="reveal-tag">ISLAND UPGRADED!</span>
        <div className="biome-unlock-emoji">{b.emoji}</div>
        <h2>{b.name}</h2>
        <p className="modal-sub">
          Reward: 💰{formatNumber(b.unlockReward.coins)} + 💎
          {formatNumber(b.unlockReward.gems)}
        </p>
        <button className="big-btn" onClick={dismiss}>
          Claim
        </button>
      </div>
    </div>
  );
}
