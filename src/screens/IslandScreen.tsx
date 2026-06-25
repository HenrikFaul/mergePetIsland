import { useState } from 'react';
import { MergeBoard } from '../components/MergeBoard';
import { EggShopRibbon } from '../components/EggShopRibbon';
import { QuestPanel } from '../components/QuestPanel';
import { useGame } from '../store/gameStore';

export function IslandScreen() {
  const collectAll = useGame((s) => s.collectAll);
  const [questOpen, setQuestOpen] = useState(false);

  return (
    <div className="island-screen">
      <div className="island-toolbar">
        <button className="pill-btn" onClick={collectAll}>
          ✋ Collect All
        </button>
        <button className="pill-btn" onClick={() => setQuestOpen((q) => !q)}>
          📋 Quests
        </button>
      </div>

      <MergeBoard />

      {questOpen && <QuestPanel onClose={() => setQuestOpen(false)} />}

      <EggShopRibbon />
    </div>
  );
}
