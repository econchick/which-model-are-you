// Seeded randomness. Every random choice in the quiz — which questions you get,
// which blurb variant you read, how ties break — runs through here, so a run is
// fully reproducible from its seed. That is what makes result URLs shareable.

/** mulberry32: small, fast, good enough. Returns a function producing [0, 1). */
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function next() {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Hash an arbitrary string to a uint32 seed (FNV-1a). */
export function hashSeed(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** A fresh random seed for a new playthrough. */
export function newSeed() {
  return (Math.random() * 4294967296) >>> 0;
}

/** Pick one element, with odds in proportion to its weight. */
export function pickByWeight(rng, items, weightOf) {
  if (items.length === 0) return undefined;
  const weights = items.map(weightOf);
  const total = weights.reduce((s, w) => s + w, 0);
  if (!(total > 0)) return items[Math.floor(rng() * items.length)];
  let r = rng() * total;
  for (let i = 0; i < items.length; i++) {
    r -= weights[i];
    if (r <= 0) return items[i];
  }
  return items[items.length - 1];
}
