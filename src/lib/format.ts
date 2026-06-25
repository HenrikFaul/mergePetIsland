/** Compact number formatting: 1234 → "1.2K", 1_500_000 → "1.5M". */
export function formatNumber(n: number): string {
  if (n < 1000) return Math.floor(n).toString();
  const units = ['', 'K', 'M', 'B', 'T', 'Q'];
  let u = 0;
  let v = n;
  while (v >= 1000 && u < units.length - 1) {
    v /= 1000;
    u++;
  }
  const s = v >= 100 ? v.toFixed(0) : v.toFixed(1);
  return `${s.replace(/\.0$/, '')}${units[u]}`;
}

/** ISO date string (YYYY-MM-DD) in UTC for daily resets. */
export function todayUtc(now: number = Date.now()): string {
  return new Date(now).toISOString().slice(0, 10);
}

export function formatDuration(sec: number): string {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  const s = Math.floor(sec % 60);
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}
