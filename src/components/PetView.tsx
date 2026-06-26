import type { Entity } from '../types';
import { speciesById } from '../data/species';
import { RARITY_COLOR } from '../data/families';
import { formatNumber } from '../lib/format';

export function PetView({ entity, dragging }: { entity: Entity; dragging: boolean }) {
  const sp = speciesById(entity.species);
  if (!sp) return null;
  const hasCoins = entity.accumulatedCoin >= 1;
  const happy = entity.accumulatedCoin >= entity.coinPerSec * 5;
  // Pet grows subtly with level.
  const scale = 0.78 + Math.min(entity.level, 10) * 0.022;

  return (
    <div
      className={`pet ${happy ? 'happy' : ''} ${dragging ? 'drag' : ''}`}
      style={{
        background: `radial-gradient(circle at 50% 38%, ${sp.color} 0%, ${sp.color}cc 60%, ${sp.color}88 100%)`,
        borderColor: RARITY_COLOR[sp.rarity],
        boxShadow:
          sp.rarity === 'mythic' || sp.rarity === 'legendary'
            ? `0 0 10px ${RARITY_COLOR[sp.rarity]}`
            : undefined,
      }}
      aria-label={`Lv${entity.level} ${sp.name}, earning ${entity.coinPerSec} coins per second`}
    >
      <span className="pet-emoji" style={{ transform: `scale(${scale})` }}>
        {sp.emoji}
      </span>
      <span className="pet-level">Lv{entity.level}</span>
      {hasCoins && (
        <span className="coin-bubble">
          💰{formatNumber(entity.accumulatedCoin)}
        </span>
      )}
    </div>
  );
}
