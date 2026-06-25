/** Tiny deterministic-ish RNG helpers. Uses Math.random by default. */
export function rand(): number {
  return Math.random();
}

export function pickWeighted<T>(
  items: { item: T; weight: number }[],
  r: () => number = rand,
): T {
  const total = items.reduce((s, it) => s + it.weight, 0);
  let roll = r() * total;
  for (const it of items) {
    roll -= it.weight;
    if (roll <= 0) return it.item;
  }
  return items[items.length - 1].item;
}

let idCounter = 0;
/** Collision-resistant id without external deps. */
export function nanoid(): string {
  idCounter = (idCounter + 1) % 1e6;
  return `e${Date.now().toString(36)}${idCounter.toString(36)}${Math.floor(
    rand() * 1e6,
  ).toString(36)}`;
}
