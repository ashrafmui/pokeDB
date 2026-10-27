// Typed access to src/data/moves.json and abilities.json (built by
// `npm run build:moves`): moves, abilities and who learns or has them.
//
// The JSON is ~1 MB, so import this module from server components and route
// handlers only, never from a 'use client' file.

import movesData from '@/data/moves.json';
import abilitiesData from '@/data/abilities.json';
import { getDexEntry, teamCandidates, type DexEntry } from '@/lib/dex';
import { CURRENT_GEN, decodeLearn, type AbilityRow, type Learn, type LearnerRow, type MoveListRow, type MoveRow } from '@/lib/moveData';

interface MovesFile {
  source: string;
  moves: MoveRow[];
  /** Move id → encoded (pokemonId, lastGen, methods); see decodeLearn. */
  learn: Record<string, number[]>;
}

const moveFile = movesData as unknown as MovesFile;
const abilityFile = abilitiesData as unknown as { source: string; abilities: AbilityRow[] };

export const ALL_MOVES: readonly MoveRow[] = moveFile.moves;
export const ALL_ABILITIES: readonly AbilityRow[] = abilityFile.abilities;

const movesBySlug = new Map(ALL_MOVES.map((m) => [m.slug, m]));
const abilitiesBySlug = new Map(ALL_ABILITIES.map((a) => [a.slug, a]));

export const getMove = (slug: string) => movesBySlug.get(slug);
export const getAbility = (slug: string) => abilitiesBySlug.get(slug);

/** Raw learn records for a move, for Pokémon that exist in the dex. */
export function learnsOf(moveId: number): (Learn & { entry: DexEntry })[] {
  const out: (Learn & { entry: DexEntry })[] = [];
  for (const value of moveFile.learn[moveId] ?? []) {
    const learn = decodeLearn(value);
    const entry = getDexEntry(learn.pokemonId);
    if (entry) out.push({ ...learn, entry });
  }
  return out;
}

export function learnerRows(moveId: number): LearnerRow[] {
  return learnsOf(moveId).map(({ entry, methods, lastGen }) => ({
    id: entry.id,
    name: entry.name,
    types: entry.types,
    total: entry.total,
    speed: entry.stats.speed,
    fullyEvolved: entry.isFullyEvolved,
    isDefault: entry.isDefault,
    methods,
    lastGen,
  }));
}

/** [pokemonId, lastGen] pairs, for the Explore "learns this move" filter. */
export function learnerIds(moveId: number): [number, number][] {
  return learnsOf(moveId).map((l) => [l.pokemonId, l.lastGen]);
}

/** How many species (not forms) can learn the move, overall and in current games. */
export function learnerCounts(moveId: number): { all: number; current: number } {
  let all = 0;
  let current = 0;
  for (const l of learnsOf(moveId)) {
    if (!l.entry.isDefault) continue;
    all++;
    if (l.lastGen >= CURRENT_GEN) current++;
  }
  return { all, current };
}

/** Every move with its current-games learner count, for the /moves list. */
export function moveListRows(): MoveListRow[] {
  return ALL_MOVES.map((m) => ({ ...m, learners: learnerCounts(m.id).current }));
}

// ── Abilities ────────────────────────────────────────────────────────────────

export interface AbilityHolder {
  entry: DexEntry;
  hidden: boolean;
}

let holdersCache: Map<string, AbilityHolder[]> | null = null;

function holdersBySlug(): Map<string, AbilityHolder[]> {
  if (!holdersCache) {
    holdersCache = new Map();
    // Species plus forms that play differently; skips cosmetic duplicates.
    for (const entry of teamCandidates()) {
      for (const a of entry.abilities) {
        const list = holdersCache.get(a.slug) ?? [];
        list.push({ entry, hidden: a.hidden });
        holdersCache.set(a.slug, list);
      }
    }
  }
  return holdersCache;
}

/** Pokémon with an ability; an entry holds it either normally or as a hidden ability. */
export function abilityHolders(slug: string): AbilityHolder[] {
  return holdersBySlug().get(slug) ?? [];
}

/** Number of species (default forms) that can have the ability. */
export function abilitySpeciesCount(slug: string): number {
  return new Set(abilityHolders(slug).map((h) => h.entry.speciesId)).size;
}
