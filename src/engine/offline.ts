import type { Entity } from '../types';
import { OFFLINE_CAP_SEC } from '../types';
import { boardCoinPerSec } from './coin';

export interface OfflineResult {
  seconds: number;
  earned: number;
}

/** Compute offline earnings since `lastSeenAt`, capped at 8h. */
export function computeOffline(
  grid: Entity[],
  lastSeenAt: number,
  now: number = Date.now(),
): OfflineResult {
  const seconds = Math.min(
    OFFLINE_CAP_SEC,
    Math.max(0, Math.floor((now - lastSeenAt) / 1000)),
  );
  const earned = Math.floor(boardCoinPerSec(grid) * seconds);
  return { seconds, earned };
}
