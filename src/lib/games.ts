// Shared bits for the name-guessing games (Who's That Pokémon?, Name Them All):
// a compact species projection and forgiving name matching. Client-safe.

export interface GameMon {
  id: number;
  /** Species name, e.g. "Flabébé", "Mr. Mime", "Nidoran♀". */
  name: string;
  generation: number;
  types: string[];
}

/** "Farfetch’d" → "farfetchd", "Nidoran♀" → "nidoranf", "Flabébé" → "flabebe". */
export function normalizeName(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/♀/g, 'f')
    .replace(/♂/g, 'm')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

/** Edit distance, stopping early once it's clearly over `max`. */
function editDistance(a: string, b: string, max: number): number {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  let prev = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    let rowMin = i;
    for (let j = 1; j <= b.length; j++) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      rowMin = Math.min(rowMin, cur[j]);
    }
    if (rowMin > max) return max + 1;
    prev = cur;
  }
  return prev[b.length];
}

/**
 * Whether a typed guess names `answer`. Exact after normalising, or one typo
 * for names of six letters or more (so "Pikachoo" counts but "Mew" ≠ "Mow").
 */
export function isCorrectName(guess: string, answer: string): boolean {
  const g = normalizeName(guess);
  const a = normalizeName(answer);
  if (!g) return false;
  if (g === a) return true;
  return a.length >= 6 && editDistance(g, a, 1) <= 1;
}

export const GENERATIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9] as const;

export function shuffle<T>(items: readonly T[]): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** Per-viewer storage that never throws (private mode, blocked storage). */
export function readStore<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function writeStore(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Best effort only.
  }
}
