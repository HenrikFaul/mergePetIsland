// Procedural sound engine — synthesises cute SFX with the Web Audio API so the
// game ships zero audio assets. Honors the player's sound setting and the
// reduced-motion / muted state. Music is a stored preference (no asset track).

let ctx: AudioContext | null = null;
let enabled = true;

export function setSoundEnabled(v: boolean): void {
  enabled = v;
}

/** Must be called from a user gesture (the PLAY button) to unlock audio. */
export function resumeAudio(): void {
  try {
    if (!ctx) {
      const Ctor =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      if (!Ctor) return;
      ctx = new Ctor();
    }
    if (ctx.state === 'suspended') void ctx.resume();
  } catch {
    /* audio unavailable — silently ignore */
  }
}

type Wave = OscillatorType;

function tone(freq: number, start: number, dur: number, gain: number, wave: Wave): void {
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  const t0 = ctx.currentTime + start;
  osc.type = wave;
  osc.frequency.setValueAtTime(freq, t0);
  g.gain.setValueAtTime(0, t0);
  g.gain.linearRampToValueAtTime(gain, t0 + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(g).connect(ctx.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.02);
}

function guard(): boolean {
  if (!enabled) return false;
  if (!ctx) resumeAudio();
  return !!ctx;
}

/** Bright ascending arpeggio for a successful merge. */
export function playMerge(): void {
  if (!guard()) return;
  [523.25, 659.25, 783.99].forEach((f, i) => tone(f, i * 0.06, 0.18, 0.18, 'triangle'));
}

/** Soft coin "ding" on tap-collect. */
export function playCollect(): void {
  if (!guard()) return;
  tone(880, 0, 0.12, 0.14, 'sine');
  tone(1318.5, 0.05, 0.12, 0.1, 'sine');
}

/** Four-note fanfare when a new pet is discovered. */
export function playReveal(): void {
  if (!guard()) return;
  [523.25, 659.25, 783.99, 1046.5].forEach((f, i) =>
    tone(f, i * 0.11, 0.32, 0.2, 'triangle'),
  );
}

/** Generic UI click / button blip. */
export function playClick(): void {
  if (!guard()) return;
  tone(440, 0, 0.06, 0.08, 'square');
}

/** Gentle "nope" for an invalid action. */
export function playError(): void {
  if (!guard()) return;
  tone(220, 0, 0.16, 0.12, 'sawtooth');
}
