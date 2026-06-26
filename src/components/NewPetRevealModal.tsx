import { useGame } from '../store/gameStore';
import { RARITY_COLOR, RARITY_LABEL } from '../data/families';

export function NewPetRevealModal() {
  const reveal = useGame((s) => s.petReveal);
  const dismiss = useGame((s) => s.dismissPetReveal);
  if (!reveal) return null;
  const { species } = reveal;

  return (
    <div className="modal-overlay reveal" onClick={dismiss}>
      <div
        className={`reveal-card rarity-${species.rarity}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="reveal-burst" />
        <span className="reveal-tag">NEW PET!</span>
        <div
          className="reveal-emoji"
          style={{
            background: `radial-gradient(circle, ${species.color} 0%, transparent 70%)`,
          }}
        >
          {species.emoji}
        </div>
        <h2 className="reveal-name">{species.name}</h2>
        <span
          className="reveal-rarity"
          style={{ background: RARITY_COLOR[species.rarity] }}
        >
          {RARITY_LABEL[species.rarity]}
        </span>
        <p className="reveal-bio">"{species.bio}"</p>
        <button className="big-btn" onClick={dismiss}>
          Awesome!
        </button>
      </div>
    </div>
  );
}
