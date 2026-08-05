/**
 * Deterministic pseudo-random generator so mock data stays stable across
 * hot-reloads and page refreshes during the demo.
 */
export function mulberry32(seed: number) {
  let a = seed;
  return function random() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(20260723);

export function randomFloat(min: number, max: number, decimals = 2): number {
  const value = rand() * (max - min) + min;
  return Number(value.toFixed(decimals));
}

export function randomInt(min: number, max: number): number {
  return Math.floor(rand() * (max - min + 1)) + min;
}

export function pick<T>(items: T[]): T {
  return items[randomInt(0, items.length - 1)];
}

export function chance(probability: number): boolean {
  return rand() < probability;
}
