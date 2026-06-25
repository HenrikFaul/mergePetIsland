import { useGame } from '../store/gameStore';
import { clearSave } from '../lib/persistence';
import { LOCALES } from '../lib/i18n';

export function SettingsScreen() {
  const settings = useGame((s) => s.settings);
  const stats = useGame((s) => s.stats);
  const updateSettings = useGame((s) => s.updateSettings);

  const toggles: { key: keyof typeof settings; label: string }[] = [
    { key: 'sound', label: '🔊 Sound effects' },
    { key: 'music', label: '🎵 Music' },
    { key: 'reducedMotion', label: '💤 Reduced motion' },
    { key: 'colorBlindSafe', label: '🎨 Color-blind safe palette' },
  ];

  return (
    <div className="screen-scroll">
      <h2 className="screen-title">⚙️ Settings</h2>

      <div className="card">
        {toggles.map((t) => (
          <label key={t.key} className="setting-row">
            <span>{t.label}</span>
            <input
              type="checkbox"
              checked={Boolean(settings[t.key])}
              onChange={(e) => updateSettings({ [t.key]: e.target.checked })}
            />
          </label>
        ))}
        <label className="setting-row">
          <span>🌐 Language</span>
          <select
            value={settings.locale}
            onChange={(e) => updateSettings({ locale: e.target.value })}
          >
            {LOCALES.map((l) => (
              <option key={l.code} value={l.code}>
                {l.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <h3 className="section-title">📊 Stats</h3>
      <div className="card stats-card">
        <div>Total merges: {stats.totalMerges}</div>
        <div>Coins collected: {Math.floor(stats.totalCoinsCollected)}</div>
        <div>Pets discovered: {stats.petsDiscovered}</div>
        <div>Biomes unlocked: {stats.biomesUnlocked}</div>
      </div>

      <button
        className="danger-btn"
        onClick={() => {
          if (confirm('Reset all progress? This cannot be undone.')) {
            clearSave();
            location.reload();
          }
        }}
      >
        Reset progress
      </button>
      <p className="credits">Merge Pets Island · Merge. Discover. Care.</p>
    </div>
  );
}
