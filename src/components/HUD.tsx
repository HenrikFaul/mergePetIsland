import { useGame } from '../store/gameStore';
import { formatNumber } from '../lib/format';

export function HUD() {
  const coins = useGame((s) => s.coins);
  const gems = useGame((s) => s.gems);
  const setScreen = useGame((s) => s.setScreen);
  const openDaily = useGame((s) => s.openDaily);
  const streak = useGame((s) => s.dailyStreak);

  return (
    <header className="hud">
      <div className="hud-currencies">
        <div className="hud-chip" title="Coins">
          <span className="hud-icon">💰</span>
          <span className="hud-value">{formatNumber(coins)}</span>
        </div>
        <div className="hud-chip" title="Gems">
          <span className="hud-icon">💎</span>
          <span className="hud-value">{formatNumber(gems)}</span>
        </div>
      </div>
      <div className="hud-actions">
        <button className="hud-btn" onClick={openDaily} title="Daily reward">
          🎁{streak > 0 && <span className="hud-streak">{streak}</span>}
        </button>
        <button
          className="hud-btn"
          onClick={() => setScreen('settings')}
          title="Settings"
        >
          ⚙️
        </button>
      </div>
    </header>
  );
}
