// Typed access to src/data/dex.json (built by `npm run build:dex`) plus
// comparisons across all Pokémon: percentiles, ranks and summaries.
//
// The JSON is ~1.5 MB, so import this module from server components and
// route handlers only, never from a 'use client' file.

import dexData from '@/data/dex.json';
import type { DexLite } from '@/lib/dexLite';
import type { TeamMon, TypeChart } from '@/lib/team';

export type StatKey = 'hp' | 'attack' | 'defense' | 'specialAttack' | 'specialDefense' | 'speed';
export type CompareKey = StatKey | 'total' | 'heightM' | 'weightKg';

export interface DexEntry {
  id: number;
  slug: string;
  /** English display name, including the form ("Alolan Raichu"). */
  name: string;
  formName: string | null;
  /** True for the species' main form; false for Megas, regional forms, etc. */
  isDefault: boolean;
  speciesId: number;
  speciesName: string;
  generation: number;
  types: string[];
  stats: Record<StatKey, number>;
  total: number;
  evYield: Partial<Record<StatKey, number>>;
  abilities: { slug: string; name: string; hidden: boolean }[];
  heightM: number;
  weightKg: number;
  bmi: number | null;
  baseExperience: number | null;
  genus: string | null;
  color: string | null;
  shape: string | null;
  habitat: string | null;
  captureRate: number;
  baseHappiness: number | null;
  genderless: boolean;
  /** 0–1, null when genderless. */
  femaleRatio: number | null;
  hasGenderDifferences: boolean;
  eggGroups: string[];
  hatchCycles: number | null;
  growthRate: string | null;
  isBaby: boolean;
  isLegendary: boolean;
  isMythical: boolean;
  isMega: boolean;
  isGigantamax: boolean;
  isBattleOnly: boolean;
  regionalForm: 'alola' | 'galar' | 'hisui' | 'paldea' | null;
  evolutionChainId: number | null;
  evolvesFromSpeciesId: number | null;
  /** 1 = unevolved, 2 = first evolution, 3 = second evolution. */
  evolutionStage: number;
  isFullyEvolved: boolean;
  /** Distinct moves learnable in any game, by method. */
  moveCounts: { total: number; levelUp: number; egg: number; tutor: number; machine: number };
  /** Damage multiplier taken from each attacking type; missing types are 1×. */
  defense: Partial<Record<string, number>>;
}

interface DexFile {
  source: string;
  types: string[];
  pokemon: DexEntry[];
}

const dex = dexData as unknown as DexFile;

/** Every Pokémon, including alternate forms, sorted by id. */
export const ALL_POKEMON: readonly DexEntry[] = dex.pokemon;
/** One entry per species (the default form), National Dex order. */
export const ALL_SPECIES: readonly DexEntry[] = dex.pokemon.filter((p) => p.isDefault);
/** The 18 battle types in National Dex order. */
export const BATTLE_TYPES: readonly string[] = dex.types;
export const DEX_SOURCE = dex.source;

const byId = new Map(dex.pokemon.map((p) => [p.id, p]));
const bySlug = new Map(dex.pokemon.map((p) => [p.slug, p]));

export function getDexEntry(idOrSlug: number | string): DexEntry | undefined {
  return typeof idOrSlug === 'number' ? byId.get(idOrSlug) : bySlug.get(idOrSlug);
}

/** All forms of a species, default form first. */
export function getSpeciesForms(speciesId: number): DexEntry[] {
  return dex.pokemon
    .filter((p) => p.speciesId === speciesId)
    .sort((a, b) => Number(b.isDefault) - Number(a.isDefault) || a.id - b.id);
}

export function compareValue(entry: DexEntry, key: CompareKey): number {
  if (key === 'total' || key === 'heightM' || key === 'weightKg') return entry[key];
  return entry.stats[key];
}

/** Damage multiplier `entry` takes from an attacking type (1 when neutral). */
export function damageTaken(entry: DexEntry, attackingType: string): number {
  return entry.defense[attackingType] ?? 1;
}

// Sorted value arrays per key, built lazily, for O(log n) rank lookups.
const sortedCache = new Map<CompareKey, number[]>();
function sortedValues(key: CompareKey): number[] {
  let values = sortedCache.get(key);
  if (!values) {
    values = ALL_SPECIES.map((p) => compareValue(p, key)).sort((a, b) => a - b);
    sortedCache.set(key, values);
  }
  return values;
}

/** Number of values strictly below `value` in an ascending array. */
function countBelow(sorted: number[], value: number): number {
  let lo = 0;
  let hi = sorted.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (sorted[mid] < value) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}

/** Number of values strictly above `value` in an ascending array. */
function countAbove(sorted: number[], value: number): number {
  let lo = 0;
  let hi = sorted.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (sorted[mid] <= value) lo = mid + 1;
    else hi = mid;
  }
  return sorted.length - lo;
}

export interface Comparison {
  key: CompareKey;
  value: number;
  /** Share of species with a strictly lower value, 0–100. */
  percentile: number;
  /** 1 = highest; ties share a rank. */
  rank: number;
  /** Number of species compared against. */
  outOf: number;
}

/**
 * How `value` compares with every species' default form, e.g. a Speed of 90
 * → percentile 62 ("faster than 62% of Pokémon"), rank 351 of 1025.
 */
export function compare(key: CompareKey, value: number): Comparison {
  const sorted = sortedValues(key);
  return {
    key,
    value,
    percentile: Math.round((countBelow(sorted, value) / sorted.length) * 1000) / 10,
    rank: countAbove(sorted, value) + 1,
    outOf: sorted.length,
  };
}

const STAT_KEYS: StatKey[] = ['hp', 'attack', 'defense', 'specialAttack', 'specialDefense', 'speed'];

/** Comparisons for each base stat and the total, in display order. */
export function compareStats(entry: DexEntry): Comparison[] {
  return [...STAT_KEYS, 'total' as const].map((key) => compare(key, compareValue(entry, key)));
}

export interface Summary {
  min: number;
  max: number;
  mean: number;
  median: number;
}

export function summarize(key: CompareKey): Summary {
  const sorted = sortedValues(key);
  const mid = sorted.length >> 1;
  return {
    min: sorted[0],
    max: sorted[sorted.length - 1],
    mean: Math.round((sorted.reduce((a, b) => a + b, 0) / sorted.length) * 10) / 10,
    median: sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2,
  };
}

/** The client-safe slice of an entry used by games and tools. */
export function toLite(entry: DexEntry): DexLite {
  return {
    id: entry.id,
    name: entry.name,
    types: entry.types,
    generation: entry.generation,
    heightM: entry.heightM,
    weightKg: entry.weightKg,
    color: entry.color,
    evolutionStage: entry.evolutionStage,
  };
}

// ── Team builder ─────────────────────────────────────────────────────────────

/** Showdown's name for a Pokémon, e.g. "Raichu-Alola", "Charizard-Mega-X". */
export function showdownName(entry: DexEntry): string {
  if (entry.isDefault) return entry.speciesName;
  const speciesSlug = entry.speciesName
    .normalize('NFD')
    .replace(/[̀-ͯ’'.:]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  const suffix = entry.slug.startsWith(`${speciesSlug}-`) ? entry.slug.slice(speciesSlug.length + 1) : entry.formName ?? entry.slug;
  const titled = suffix
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('-');
  return `${entry.speciesName}-${titled}`;
}

const sameBattleData = (a: DexEntry, b: DexEntry) =>
  a.types.join() === b.types.join() &&
  a.total === b.total &&
  STAT_KEYS.every((k) => a.stats[k] === b.stats[k]) &&
  a.abilities.map((x) => x.slug).join() === b.abilities.map((x) => x.slug).join();

/**
 * Everything worth putting on a team: every species plus forms that play
 * differently (Megas, regional forms, Rotom appliances…). Skips Gigantamax,
 * totem and event forms, and cosmetic forms identical to the default.
 */
export function teamCandidates(): DexEntry[] {
  const defaults = new Map(ALL_SPECIES.map((p) => [p.speciesId, p]));
  return ALL_POKEMON.filter((p) => {
    if (p.isDefault) return true;
    if (p.isGigantamax || /totem|eternamax|cosplay|rock-star|belle|pop-star|phd|libre/.test(p.slug)) return false;
    const base = defaults.get(p.speciesId);
    return !base || !sameBattleData(p, base);
  });
}

export function toTeamMon(entry: DexEntry): TeamMon {
  return {
    id: entry.id,
    speciesId: entry.speciesId,
    name: entry.name,
    showdownName: showdownName(entry),
    types: entry.types,
    stats: STAT_KEYS.map((k) => entry.stats[k]),
    total: entry.total,
    abilities: entry.abilities.map((a) => (a.hidden ? `${a.name} (H)` : a.name)),
    fullyEvolved: entry.isFullyEvolved,
    restricted: entry.isLegendary || entry.isMythical,
    mega: entry.isMega,
  };
}

/**
 * Attacking type → defending type → multiplier, read off each type's
 * single-typed Pokémon so it always matches the dataset.
 */
export function typeChart(): TypeChart {
  const chart: TypeChart = {};
  for (const atk of BATTLE_TYPES) chart[atk] = {};
  for (const def of BATTLE_TYPES) {
    const mono = ALL_SPECIES.find((p) => p.types.length === 1 && p.types[0] === def);
    if (!mono) throw new Error(`No single-typed ${def} Pokémon to read the type chart from`);
    for (const atk of BATTLE_TYPES) chart[atk][def] = damageTaken(mono, atk);
  }
  return chart;
}
