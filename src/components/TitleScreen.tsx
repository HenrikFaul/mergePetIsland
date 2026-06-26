import { useGame } from '../store/gameStore';

const FLOATERS = ['🐱', '🐶', '🦊', '🐼', '🐲', '🤖', '🧜', '🪼'];

export function TitleScreen() {
  const start = useGame((s) => s.start);
  const returning = useGame((s) => s.returningPlayer);

  return (
    <div className="title-screen">
      <div className="title-floaters">
        {FLOATERS.map((f, i) => (
          <span key={i} className="title-floater" style={{ animationDelay: `${i * 0.4}s` }}>
            {f}
          </span>
        ))}
      </div>
      <div className="title-logo">
        <span className="title-merge">MERGE</span>
        <span className="title-pets">PETS</span>
        <span className="title-island">ISLAND</span>
      </div>
      <p className="title-tagline">Merge. Discover. Care.</p>
      <button className="play-btn" onClick={start}>
        {returning ? '▶ CONTINUE' : '▶ PLAY'}
      </button>
      <p className="title-hint">Drag two matching pets together to merge them ✨</p>
    </div>
  );
}
