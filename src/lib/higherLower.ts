// Logic for Higher or Lower: which stat to compare and how to pick a round.
// Client-safe and free of React so it's easy to reason about.

export interface Metric {
  key: string;
  label: string;
  unit: string;
  /** Question wording: "has a higher {noun}". */
  noun: string;
}

/** Order matters: HLMon.values is indexed the same way. */
export const METRICS: readonly Metric[] = [
  { key: 'total', label: 'Base stat total', unit: '', noun: 'base stat total' },
  { key: 'hp', label: 'HP', unit: '', noun: 'base HP' },
  { key: 'attack', label: 'Attack', unit: '', noun: 'base Attack' },
  { key: 'defense', label: 'Defense', unit: '', noun: 'base Defense' },
  { key: 'specialAttack', label: 'Sp. Atk', unit: '', noun: 'base Sp. Atk' },
  { key: 'specialDefense', label: 'Sp. Def', unit: '', noun: 'base Sp. Def' },
  { key: 'speed', label: 'Speed', unit: '', noun: 'base Speed' },
  { key: 'heightM', label: 'Height', unit: ' m', noun: 'height' },
  { key: 'weightKg', label: 'Weight', unit: ' kg', noun: 'weight' },
  { key: 'captureRate', label: 'Catch rate', unit: '', noun: 'catch rate' },
  { key: 'moves', label: 'Moves learnable', unit: '', noun: 'number of learnable moves' },
];

export interface HLMon {
  id: number;
  name: string;
  /** One value per METRICS entry, in order. */
  values: number[];
}

export interface Round {
  /** Index into METRICS. */
  metric: number;
  left: HLMon;
  right: HLMon;
}

/**
 * Picks a right-hand Pokémon whose value differs from `left` for the metric,
 * so there is always a correct answer. A null `left` starts a fresh run with a random Pokémon, and a null `metric` picks a random stat.
 */
export function pickRound(pool: readonly HLMon[], left: HLMon | null, metric: number | null, rand: () => number = Math.random): Round {
  left ??= pool[Math.floor(rand() * pool.length)];
  for (let attempt = 0; attempt < 50; attempt++) {
    const m = metric ?? Math.floor(rand() * METRICS.length);
    const right = pool[Math.floor(rand() * pool.length)];
    if (right.id !== left.id && right.values[m] !== left.values[m]) return { metric: m, left, right };
  }
  // Practically unreachable; fall back to any pair that differs on the first metric.
  const right = pool.find((p) => p.id !== left.id && p.values[0] !== left.values[0]) ?? pool[0];
  return { metric: 0, left, right };
}

export function isHigher(round: Round): boolean {
  return round.right.values[round.metric] > round.left.values[round.metric];
}

/** "1.7 m", "90", "6.9 kg". */
export function formatValue(metric: number, value: number): string {
  const m = METRICS[metric];
  return `${Number.isInteger(value) ? value : value.toFixed(1)}${m.unit}`;
}
