// Typed access to src/data/moves.json and abilities.json (built by
// `npm run build:moves`): moves, abilities and who learns or has them.
//
// The JSON is ~1 MB, so import this module from server components and route
// handlers only, never from a 'use client' file.

import movesData from '@/data/moves.json';
import abilitiesData from '@/data/abilities.json';
import { ALL_SPECIES, getDexEntry, teamCandidates, type DexEntry } from '@/lib/dex';
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

// ── Guess-the-Pokémon clues ──────────────────────────────────────────────────

export interface MoveClue {
  id: number;
  /** Species name. */
  name: string;
  types: string[];
  generation: number;
  abilities: string[];
  /** Six moves it learns in current games, from common to distinctive. */
  moves: { name: string; type: string }[];
}

let clueCache: MoveClue[] | null = null;

/**
 * One clue set per species, for the moveset guessing game. Moves come ordered
 * from widely shared to rare, so later clues give the answer away more.
 */
export function moveClues(): MoveClue[] {
  if (clueCache) return clueCache;
  const bySpecies = new Map<number, { move: MoveRow; learners: number }[]>();
  for (const move of ALL_MOVES) {
    const { current } = learnerCounts(move.id);
    if (current === 0) continue;
    for (const l of learnsOf(move.id)) {
      if (!l.entry.isDefault || l.lastGen < CURRENT_GEN) continue;
      const list = bySpecies.get(l.entry.id) ?? [];
      list.push({ move, learners: current });
      bySpecies.set(l.entry.id, list);
    }
  }
  const POSITIONS = [0.2, 0.35, 0.5, 0.65, 0.8, 0.95]; // spread across the common → rare range
  clueCache = ALL_SPECIES.flatMap((entry): MoveClue[] => {
    const list = (bySpecies.get(entry.id) ?? []).sort((a, b) => b.learners - a.learners || a.move.id - b.move.id);
    if (list.length < POSITIONS.length) return [];
    const picked = new Set<number>();
    const moves = POSITIONS.flatMap((p) => {
      let i = Math.min(list.length - 1, Math.floor(p * list.length));
      while (picked.has(i)) i = i > 0 ? i - 1 : list.length - 1; // list has at least POSITIONS.length entries, so a free slot exists
      picked.add(i);
      return [{ name: list[i].move.name, type: list[i].move.type }];
    });
    return [
      {
        id: entry.id,
        name: entry.name,
        types: entry.types,
        generation: entry.generation,
        abilities: entry.abilities.map((a) => a.name),
        moves,
      },
    ];
  });
  return clueCache;
}
