import { useGame } from '../store/gameStore';
import { formatNumber, formatDuration } from '../lib/format';

export function OfflineRewardModal() {
  const offline = useGame((s) => s.offlineModal);
  const claim = useGame((s) => s.claimOffline);
  if (!offline) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <h2>🌙 Welcome back!</h2>
        <p className="modal-sub">
          Your pets earned coins for {formatDuration(offline.seconds)}.
        </p>
        <div className="offline-amount">💰 {formatNumber(offline.earned)}</div>
        <div className="modal-actions">
          <button className="big-btn ghost" onClick={() => claim(false)}>
            Collect
          </button>
          <button className="big-btn" onClick={() => claim(true)}>
            🎬 Double (Watch Ad)
          </button>
        </div>
      </div>
    </div>
  );
}
