import { useRef, useState, useCallback } from 'react';
import { useGame } from '../store/gameStore';
import { GRID_W, GRID_H } from '../types';
import type { Entity } from '../types';
import { PetView } from './PetView';
import { canMerge } from '../engine/mergeRules';

interface DragState {
  id: string;
  /** Fixed press origin — never overwritten, used for the tap-vs-drag test. */
  originX: number;
  originY: number;
  /** Live pointer position. */
  px: number;
  py: number;
  targetCell: { x: number; y: number } | null;
}

export function MergeBoard() {
  const grid = useGame((s) => s.grid);
  const moveOrMerge = useGame((s) => s.moveOrMerge);
  const collect = useGame((s) => s.collect);
  const boardRef = useRef<HTMLDivElement>(null);
  const [drag, setDrag] = useState<DragState | null>(null);
  const movedRef = useRef(false);

  const cellFromPoint = useCallback((clientX: number, clientY: number) => {
    const el = boardRef.current;
    if (!el) return null;
    const r = el.getBoundingClientRect();
    const x = Math.floor(((clientX - r.left) / r.width) * GRID_W);
    const y = Math.floor(((clientY - r.top) / r.height) * GRID_H);
    if (x < 0 || x >= GRID_W || y < 0 || y >= GRID_H) return null;
    return { x, y };
  }, []);

  const onPointerDown = (e: React.PointerEvent, entity: Entity) => {
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    movedRef.current = false;
    setDrag({
      id: entity.id,
      originX: e.clientX,
      originY: e.clientY,
      px: e.clientX,
      py: e.clientY,
      targetCell: null,
    });
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag) return;
    if (
      Math.abs(e.clientX - drag.originX) > 4 ||
      Math.abs(e.clientY - drag.originY) > 4
    ) {
      movedRef.current = true;
    }
    const cell = cellFromPoint(e.clientX, e.clientY);
    setDrag({ ...drag, px: e.clientX, py: e.clientY, targetCell: cell });
  };

  const onPointerUp = (e: React.PointerEvent) => {
    if (!drag) return;
    const cell = cellFromPoint(e.clientX, e.clientY);
    if (!movedRef.current) {
      // treat as a tap → collect coins
      collect(drag.id);
    } else if (cell) {
      moveOrMerge(drag.id, cell.x, cell.y);
    }
    setDrag(null);
  };

  const draggedEntity = drag ? grid.find((g) => g.id === drag.id) : null;
  const mergeable =
    draggedEntity && drag?.targetCell
      ? grid.find(
          (g) =>
            g.gridX === drag.targetCell!.x &&
            g.gridY === drag.targetCell!.y &&
            g.id !== drag.id,
        )
      : null;
  const willMerge = draggedEntity && mergeable && canMerge(draggedEntity, mergeable);

  return (
    <div
      ref={boardRef}
      className="merge-board"
      style={{
        gridTemplateColumns: `repeat(${GRID_W}, 1fr)`,
        gridTemplateRows: `repeat(${GRID_H}, 1fr)`,
      }}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={() => setDrag(null)}
    >
      {Array.from({ length: GRID_W * GRID_H }).map((_, i) => {
        const x = i % GRID_W;
        const y = Math.floor(i / GRID_W);
        const highlight =
          drag?.targetCell?.x === x && drag?.targetCell?.y === y;
        return (
          <div
            key={i}
            className={`board-cell ${highlight ? (willMerge ? 'merge-ok' : 'merge-target') : ''}`}
          />
        );
      })}

      {grid.map((entity) => {
        const isDragging = drag?.id === entity.id;
        return (
          <div
            key={entity.id}
            className={`board-entity ${isDragging ? 'dragging' : ''}`}
            style={{
              left: `${(entity.gridX / GRID_W) * 100}%`,
              top: `${(entity.gridY / GRID_H) * 100}%`,
              width: `${100 / GRID_W}%`,
              height: `${100 / GRID_H}%`,
              opacity: isDragging ? 0.25 : 1,
            }}
            onPointerDown={(e) => onPointerDown(e, entity)}
          >
            <PetView entity={entity} dragging={false} />
          </div>
        );
      })}

      {draggedEntity && drag && movedRef.current && (
        <div
          className="drag-ghost"
          style={{
            position: 'fixed',
            left: drag.px,
            top: drag.py,
            width: boardRef.current
              ? boardRef.current.getBoundingClientRect().width / GRID_W
              : 48,
            height: boardRef.current
              ? boardRef.current.getBoundingClientRect().height / GRID_H
              : 48,
          }}
        >
          <PetView entity={draggedEntity} dragging />
        </div>
      )}
    </div>
  );
}
