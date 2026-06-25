import { useGame } from '../store/gameStore';
import { SPECIES } from '../data/species';
import { FAMILY_LABEL, RARITY_COLOR, RARITY_LABEL } from '../data/families';
import type { Family } from '../types';

const FAMILIES: Family[] = [
  'cat',
  'dog',
  'fox',
  'panda',
  'dragon',
  'robot',
  'merfolk',
  'yeti',
];

export function AlbumScreen() {
  const album = useGame((s) => s.album);
  const discovered = Object.keys(album).length;

  return (
    <div className="screen-scroll">
      <h2 className="screen-title">📖 Pet Album</h2>
      <p className="screen-sub">
        Discovered {discovered}/{SPECIES.length} pets
      </p>

      {FAMILIES.map((fam) => {
        const pets = SPECIES.filter((s) => s.family === fam);
        if (!pets.length) return null;
        return (
          <section key={fam} className="album-family">
            <h3 className="section-title">{FAMILY_LABEL[fam]}</h3>
            <div className="album-grid">
              {pets.map((sp) => {
                const seen = album[sp.id] !== undefined;
                return (
                  <div
                    key={sp.id}
                    className={`album-cell ${seen ? '' : 'locked'}`}
                    style={{ borderColor: RARITY_COLOR[sp.rarity] }}
                    title={seen ? sp.bio : 'Not discovered yet'}
                  >
                    <span className="album-emoji">{seen ? sp.emoji : '❔'}</span>
                    <span className="album-name">{seen ? sp.name : '???'}</span>
                    <span
                      className="album-rarity"
                      style={{ color: RARITY_COLOR[sp.rarity] }}
                    >
                      {RARITY_LABEL[sp.rarity]}
                    </span>
                    {seen && <span className="album-lv">Max Lv{album[sp.id]}</span>}
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
