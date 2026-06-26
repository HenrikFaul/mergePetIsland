import { useGame } from '../store/gameStore';

export function QuestPanel({ onClose }: { onClose: () => void }) {
  const quests = useGame((s) => s.quests);
  const claimQuest = useGame((s) => s.claimQuest);

  return (
    <div className="quest-panel card">
      <div className="card-head">
        <h3>Daily Quests</h3>
        <button className="icon-btn" onClick={onClose}>
          ✕
        </button>
      </div>
      {quests.map((q) => {
        const done = q.progress >= q.target;
        return (
          <div key={q.key} className={`quest-row ${q.claimed ? 'claimed' : ''}`}>
            <div className="quest-info">
              <span className={`diff-badge ${q.difficulty}`}>{q.difficulty}</span>
              <span className="quest-label">{q.label}</span>
              <div className="quest-bar">
                <div
                  className="quest-bar-fill"
                  style={{ width: `${Math.min(100, (q.progress / q.target) * 100)}%` }}
                />
              </div>
              <span className="quest-progress">
                {Math.min(q.progress, q.target)}/{q.target}
              </span>
            </div>
            <button
              className="claim-btn"
              disabled={!done || q.claimed}
              onClick={() => claimQuest(q.key)}
            >
              {q.claimed ? '✓' : `+${q.reward.gems}💎`}
            </button>
          </div>
        );
      })}
    </div>
  );
}
