import { useGame, type Screen } from '../store/gameStore';

const TABS: { id: Screen; label: string; emoji: string }[] = [
  { id: 'island', label: 'Island', emoji: '🏝️' },
  { id: 'map', label: 'Map', emoji: '🗺️' },
  { id: 'season', label: 'Season', emoji: '🏆' },
  { id: 'shop', label: 'Shop', emoji: '🛒' },
  { id: 'album', label: 'Album', emoji: '📖' },
  { id: 'settings', label: 'Settings', emoji: '⚙️' },
];

export function BottomNav() {
  const screen = useGame((s) => s.screen);
  const setScreen = useGame((s) => s.setScreen);
  return (
    <nav className="bottom-nav">
      {TABS.map((t) => (
        <button
          key={t.id}
          className={`nav-btn ${screen === t.id ? 'active' : ''}`}
          onClick={() => setScreen(t.id)}
        >
          <span className="nav-emoji">{t.emoji}</span>
          <span className="nav-label">{t.label}</span>
        </button>
      ))}
    </nav>
  );
}
