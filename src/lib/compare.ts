// Pure helpers for the compare page. Client-safe; rows come from
// toExploreRow in src/lib/dex.ts and the type chart from typeChart().

import type { ExploreRow } from '@/lib/explore';
import { multiplier, type TypeChart } from '@/lib/team';

export const MAX_COMPARE = 4;

/**
 * Fixed categorical series colours (validated for colour-blind separation),
 * assigned to a Pokémon when it's added and kept until it's removed.
 */
export const SERIES_COLORS = ['#2a78d6', '#eb6834', '#1baf7a', '#eda100'] as const;

export function parseIds(param: string | undefined | null): number[] {
  if (!param) return [];
  const ids = param
    .split(',')
    .map(Number)
    .filter((n) => Number.isInteger(n) && n > 0);
  return [...new Set(ids)].slice(0, MAX_COMPARE);
}

/** Sorted values of each stat (0–5) and the total (6) across all species. */
export function statDistributions(rows: readonly ExploreRow[]): number[][] {
  const species = rows.filter((r) => r.isDefault);
  return Array.from({ length: 7 }, (_, i) =>
    species.map((r) => (i === 6 ? r.total : r.stats[i])).sort((a, b) => a - b)
  );
}

/** Share of species with a strictly lower value, 0–100. */
export function percentile(sorted: readonly number[], value: number): number {
  let lo = 0;
  let hi = sorted.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (sorted[mid] < value) lo = mid + 1;
    else hi = mid;
  }
  return Math.round((lo / sorted.length) * 100);
}

export interface HeadToHead {
  /** Best multiplier the attacker's own types (STAB) get against the defender. */
  best: number;
  /** The attacker's type that achieves it. */
  type: string;
}

export function headToHead(attacker: ExploreRow, defender: ExploreRow, chart: TypeChart): HeadToHead {
  let best = -1;
  let type = attacker.types[0];
  for (const t of attacker.types) {
    const m = multiplier(chart, t, defender.types);
    if (m > best) {
      best = m;
      type = t;
    }
  }
  return { best, type };
}

/** Popular comparisons offered when the page is empty. */
export const POPULAR: { label: string; ids: number[] }[] = [
  { label: 'Kanto starters', ids: [3, 6, 9] },
  { label: 'Mewtwo vs Mew', ids: [150, 151] },
  { label: 'Pseudo-legendaries', ids: [149, 248, 373, 445] },
  { label: 'Pikachu vs Raichu', ids: [25, 26] },
  { label: 'Eeveelutions (Gen 1)', ids: [134, 135, 136] },
  { label: 'Box legends of Gen 3', ids: [382, 383, 384] },
];
