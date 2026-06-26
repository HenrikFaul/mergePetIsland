import { useGame } from '../store/gameStore';

export function ToastLayer() {
  const toasts = useGame((s) => s.toasts);
  return (
    <div className="toast-layer">
      {toasts.map((t) => (
        <div key={t.id} className="toast">
          {t.emoji && <span className="toast-emoji">{t.emoji}</span>}
          <span>{t.text}</span>
        </div>
      ))}
    </div>
  );
}
