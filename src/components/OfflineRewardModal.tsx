import { useGame } from '../store/gameStore';
import { formatNumber, formatDuration } from '../lib/format';
import { showRewarded } from '../lib/ads';

export function OfflineRewardModal() {
  const offline = useGame((s) => s.offlineModal);
  const claim = useGame((s) => s.claimOffline);
  if (!offline) return null;

  const doubleViaAd = async () => {
    const ok = await showRewarded('double_offline');
    claim(ok);
  };

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
          <button className="big-btn" onClick={doubleViaAd}>
            🎬 Double (Watch Ad)
          </button>
        </div>
      </div>
    </div>
  );
}
