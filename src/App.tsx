import { useEffect } from 'react';
import { useGame } from './store/gameStore';
import { HUD } from './components/HUD';
import { BottomNav } from './components/BottomNav';
import { IslandScreen } from './screens/IslandScreen';
import { MapScreen } from './screens/MapScreen';
import { ShopScreen } from './screens/ShopScreen';
import { AlbumScreen } from './screens/AlbumScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { ToastLayer } from './components/ToastLayer';
import { NewPetRevealModal } from './components/NewPetRevealModal';
import { OfflineRewardModal } from './components/OfflineRewardModal';
import { DailyRewardModal } from './components/DailyRewardModal';
import { BiomeUnlockModal } from './components/BiomeUnlockModal';
import { BIOME_BY_ID } from './data/biomes';

export function App() {
  const screen = useGame((s) => s.screen);
  const init = useGame((s) => s.init);
  const tick = useGame((s) => s.tick);
  const save = useGame((s) => s.save);
  const biomes = useGame((s) => s.biomesUnlocked);
  const reducedMotion = useGame((s) => s.settings.reducedMotion);

  useEffect(() => {
    init();
    const t = setInterval(tick, 1000);
    const s = setInterval(save, 30000);
    const onHide = () => save();
    window.addEventListener('visibilitychange', onHide);
    window.addEventListener('beforeunload', onHide);
    return () => {
      clearInterval(t);
      clearInterval(s);
      window.removeEventListener('visibilitychange', onHide);
      window.removeEventListener('beforeunload', onHide);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const activeBiome = biomes[biomes.length - 1] ?? 'grass';
  const background = BIOME_BY_ID[activeBiome].background;

  return (
    <div
      className={`app ${reducedMotion ? 'reduced-motion' : ''}`}
      style={{ background }}
    >
      <HUD />
      <main className="screen-host">
        {screen === 'island' && <IslandScreen />}
        {screen === 'map' && <MapScreen />}
        {screen === 'shop' && <ShopScreen />}
        {screen === 'album' && <AlbumScreen />}
        {screen === 'settings' && <SettingsScreen />}
      </main>
      <BottomNav />
      <ToastLayer />
      <NewPetRevealModal />
      <OfflineRewardModal />
      <DailyRewardModal />
      <BiomeUnlockModal />
    </div>
  );
}
