// Rewarded / interstitial ad placement stubs. The real implementation bridges
// to AdMob via Capacitor; in the web sandbox these resolve instantly so the
// reward flow is testable.

export type RewardedPlacement =
  | 'double_offline'
  | 'free_egg'
  | 'speed_up_quest'
  | 'daily_spin'
  | 'decoration_unlock';

export async function showRewarded(placement: RewardedPlacement): Promise<boolean> {
  // eslint-disable-next-line no-console
  console.info(`[ads] rewarded shown: ${placement}`);
  return Promise.resolve(true);
}

let lastInterstitial = 0;
const INTERSTITIAL_CAP_MS = 90_000;

export async function maybeShowInterstitial(now: number): Promise<void> {
  if (now - lastInterstitial < INTERSTITIAL_CAP_MS) return;
  lastInterstitial = now;
  // eslint-disable-next-line no-console
  console.info('[ads] interstitial shown');
}
