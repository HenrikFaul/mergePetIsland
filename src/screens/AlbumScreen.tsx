import type { CSSProperties } from 'react';
import { useGame } from '../store/gameStore';
import { SPECIES, SEASON_SPECIES } from '../data/species';
import { SEASON } from '../data/season';
import { FAMILY_LABEL, RARITY_COLOR, RARITY_LABEL } from '../data/families';
import type { Family, Species } from '../types';

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

function PetCell({ sp, level }: { sp: Species; level: number | undefined }) {
  const seen = level !== undefined;
  return (
    <div
      className={`album-cell ${seen ? `seen rarity-${sp.rarity}` : 'locked'}`}
      style={
        {
          borderColor: RARITY_COLOR[sp.rarity],
          '--rarity': RARITY_COLOR[sp.rarity],
        } as CSSProperties
      }
      title={seen ? sp.bio : 'Not discovered yet'}
    >
      {sp.event && <span className="album-event">★</span>}
      <span className="album-emoji">{seen ? sp.emoji : '❔'}</span>
      <span className="album-name">{seen ? sp.name : '???'}</span>
      <span className="album-rarity" style={{ color: RARITY_COLOR[sp.rarity] }}>
        {RARITY_LABEL[sp.rarity]}
      </span>
      {seen && <span className="album-lv">Max Lv{level}</span>}
    </div>
  );
}

export function AlbumScreen() {
  const album = useGame((s) => s.album);
  const baseDiscovered = SPECIES.filter((s) => album[s.id] !== undefined).length;
  const seasonDiscovered = SEASON_SPECIES.filter(
    (s) => album[s.id] !== undefined,
  ).length;

  return (
    <div className="screen-scroll">
      <h2 className="screen-title">📖 Pet Album</h2>
      <p className="screen-sub">
        Discovered {baseDiscovered}/{SPECIES.length} pets
      </p>

      {FAMILIES.map((fam) => {
        const pets = SPECIES.filter((s) => s.family === fam);
        if (!pets.length) return null;
        return (
          <section key={fam} className="album-family">
            <h3 className="section-title">{FAMILY_LABEL[fam]}</h3>
            <div className="album-grid">
              {pets.map((sp) => (
                <PetCell key={sp.id} sp={sp} level={album[sp.id]} />
              ))}
            </div>
          </section>
        );
      })}

      <section className="album-family">
        <h3 className="section-title">
          {SEASON.emoji} {SEASON.name} — exclusive ({seasonDiscovered}/
          {SEASON_SPECIES.length})
        </h3>
        <div className="album-grid">
          {SEASON_SPECIES.map((sp) => (
            <PetCell key={sp.id} sp={sp} level={album[sp.id]} />
          ))}
        </div>
      </section>
    </div>
  );
}
