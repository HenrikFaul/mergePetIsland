import { useGame } from '../store/gameStore';
import { BIOMES } from '../data/biomes';
import { formatNumber } from '../lib/format';

export function MapScreen() {
  const biomesUnlocked = useGame((s) => s.biomesUnlocked);
  const grid = useGame((s) => s.grid);
  const gems = useGame((s) => s.gems);
  const unlockBiome = useGame((s) => s.unlockBiome);
  const maxPetLevel = grid.reduce(
    (m, e) => (e.type === 'pet' ? Math.max(m, e.level) : m),
    0,
  );

  return (
    <div className="screen-scroll">
      <h2 className="screen-title">🗺️ Island Map</h2>
      <p className="screen-sub">Expand your island with new biomes.</p>
      <div className="biome-list">
        {BIOMES.map((b) => {
          const unlocked = biomesUnlocked.includes(b.id);
          const meetsLevel = maxPetLevel >= b.requiresPetLevel;
          const affordable = gems >= b.gemCost;
          return (
            <div
              key={b.id}
              className={`biome-card ${unlocked ? 'unlocked' : ''}`}
              style={{ background: b.background }}
            >
              <div className="biome-emoji">{b.emoji}</div>
              <div className="biome-body">
                <h3>{b.name}</h3>
                {unlocked ? (
                  <span className="biome-state">Unlocked ✓</span>
                ) : (
                  <>
                    <div className="biome-reqs">
                      <span className={`req-chip ${meetsLevel ? 'pass' : 'fail'}`}>
                        {meetsLevel ? '✓' : '🔒'} Lv{b.requiresPetLevel} pet
                      </span>
                      <span className={`req-chip ${affordable ? 'pass' : 'fail'}`}>
                        💎 {formatNumber(b.gemCost)}
                      </span>
                    </div>
                    <button
                      className="claim-btn"
                      disabled={!meetsLevel || !affordable}
                      onClick={() => unlockBiome(b.id)}
                    >
                      {!meetsLevel ? '🔒 Locked' : affordable ? 'Unlock' : 'Need gems'}
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
