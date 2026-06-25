import { useGame } from '../store/gameStore';
import { DAILY_REWARDS } from '../data/dailyRewards';
import { todayUtc, formatNumber } from '../lib/format';

export function DailyRewardModal() {
  const open = useGame((s) => s.dailyModalOpen);
  const close = useGame((s) => s.closeDaily);
  const claim = useGame((s) => s.claimDaily);
  const streak = useGame((s) => s.dailyStreak);
  const lastClaim = useGame((s) => s.lastDailyClaim);
  if (!open) return null;

  const claimedToday = lastClaim === todayUtc();
  const todayIndex = (streak % 7); // next day to claim (0-based)

  return (
    <div className="modal-overlay" onClick={close}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <button className="icon-btn close-x" onClick={close}>
          ✕
        </button>
        <h2>🎁 Daily Reward</h2>
        <p className="modal-sub">Streak: {streak} day(s)</p>
        <div className="daily-grid">
          {DAILY_REWARDS.map((r, i) => {
            const isToday = !claimedToday && i === todayIndex;
            const claimed = claimedToday ? i <= todayIndex : i < todayIndex;
            return (
              <div
                key={r.day}
                className={`daily-cell ${isToday ? 'today' : ''} ${claimed ? 'claimed' : ''}`}
              >
                <span className="daily-day">Day {r.day}</span>
                <span className="daily-emoji">{r.legendaryPet ? '🦄' : '💰'}</span>
                <span className="daily-amount">
                  {r.legendaryPet ? 'Legendary' : formatNumber(r.coins)}
                </span>
                {r.gems > 0 && <span className="daily-gems">+{r.gems}💎</span>}
              </div>
            );
          })}
        </div>
        <button className="big-btn" disabled={claimedToday} onClick={claim}>
          {claimedToday ? 'Come back tomorrow' : 'Claim'}
        </button>
      </div>
    </div>
  );
}
