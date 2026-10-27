// Pure game logic for the daily Pokédle: picking the day's answer, scoring a
// guess against it and building the shareable result. No React, no storage,
// so it can be unit-tested and reused (e.g. for an archive later).

import type { DexLite } from '@/lib/dexLite';

export const MAX_GUESSES = 8;

/** Puzzle #1 is this UTC date; each later day is the next number. */
const LAUNCH_DATE_UTC = Date.UTC(2026, 9, 27);
const DAY_MS = 86_400_000;

/** Today's puzzle number in UTC, so everyone gets the same Pokémon. */
export function puzzleNumber(now: Date = new Date()): number {
  const todayUtc = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  return Math.floor((todayUtc - LAUNCH_DATE_UTC) / DAY_MS) + 1;
}

/** Small seeded PRNG (mulberry32) so the shuffle is the same for everyone. */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const SHUFFLE_SEED = 20261027;
const orderCache = new WeakMap<readonly DexLite[], number[]>();

/** A fixed shuffle of pool indices, so no answer repeats until all have been used. */
function answerOrder(pool: readonly DexLite[]): number[] {
  let order = orderCache.get(pool);
  if (!order) {
    const rand = mulberry32(SHUFFLE_SEED);
    order = pool.map((_, i) => i);
    for (let i = order.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [order[i], order[j]] = [order[j], order[i]];
    }
    orderCache.set(pool, order);
  }
  return order;
}

/**
 * The answer for a puzzle number, chosen from `pool` (all species in National
 * Dex order). Every species comes up once before any repeats.
 */
export function dailyAnswer(pool: readonly DexLite[], puzzle: number): DexLite {
  const order = answerOrder(pool);
  const index = (((puzzle - 1) % order.length) + order.length) % order.length;
  return pool[order[index]];
}

export type CellStatus = 'correct' | 'partial' | 'wrong';
/** For numeric hints: is the answer's value higher or lower than the guess? */
export type Direction = 'higher' | 'lower' | null;

export interface HintCell {
  status: CellStatus;
  direction: Direction;
  /** What to show in the cell, e.g. "Fire", "Gen 3", "1.7 m". */
  display: string;
}

export interface GuessResult {
  guess: DexLite;
  solved: boolean;
  cells: {
    type1: HintCell;
    type2: HintCell;
    generation: HintCell;
    color: HintCell;
    stage: HintCell;
    height: HintCell;
    weight: HintCell;
  };
}

export const HINT_COLUMNS: { key: keyof GuessResult['cells']; label: string }[] = [
  { key: 'type1', label: 'Type 1' },
  { key: 'type2', label: 'Type 2' },
  { key: 'generation', label: 'Gen' },
  { key: 'color', label: 'Colour' },
  { key: 'stage', label: 'Stage' },
  { key: 'height', label: 'Height' },
  { key: 'weight', label: 'Weight' },
];

const title = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

function typeCell(guessType: string | undefined, answerSame: string | undefined, answerOther: string | undefined): HintCell {
  const display = guessType ? title(guessType) : 'None';
  if (guessType === answerSame) return { status: 'correct', direction: null, display };
  if (guessType && guessType === answerOther) return { status: 'partial', direction: null, display };
  return { status: 'wrong', direction: null, display };
}

function numberCell(guess: number, answer: number, display: string, closeWithin: number): HintCell {
  if (guess === answer) return { status: 'correct', direction: null, display };
  const direction: Direction = answer > guess ? 'higher' : 'lower';
  const status: CellStatus = Math.abs(answer - guess) <= closeWithin ? 'partial' : 'wrong';
  return { status, direction, display };
}

/**
 * Scores a guess. Types are "partial" when the type is in the answer's other
 * slot; numbers are "partial" when close, and always say higher or lower.
 */
export function scoreGuess(guess: DexLite, answer: DexLite): GuessResult {
  const [g1, g2] = guess.types;
  const [a1, a2] = answer.types;
  return {
    guess,
    solved: guess.id === answer.id,
    cells: {
      type1: typeCell(g1, a1, a2),
      type2: typeCell(g2, a2, a1),
      generation: numberCell(guess.generation, answer.generation, `Gen ${guess.generation}`, 1),
      color: {
        status: guess.color === answer.color ? 'correct' : 'wrong',
        direction: null,
        display: guess.color ? title(guess.color) : '?',
      },
      stage: numberCell(guess.evolutionStage, answer.evolutionStage, `Stage ${guess.evolutionStage}`, 0),
      // "Close" = within 20% of the answer, so the hint scales from Joltik to Wailord.
      height: numberCell(guess.heightM, answer.heightM, `${guess.heightM} m`, answer.heightM * 0.2),
      weight: numberCell(guess.weightKg, answer.weightKg, `${guess.weightKg} kg`, answer.weightKg * 0.2),
    },
  };
}

const EMOJI: Record<CellStatus, string> = { correct: '🟩', partial: '🟨', wrong: '⬛' };

/** Spoiler-free result to paste into a chat, Wordle-style. */
export function shareText(puzzle: number, results: GuessResult[], solved: boolean, url: string): string {
  const score = solved ? `${results.length}/${MAX_GUESSES}` : `X/${MAX_GUESSES}`;
  const rows = results.map((r) => HINT_COLUMNS.map((c) => EMOJI[r.cells[c.key].status]).join(''));
  return [`poKeDB Pokédle #${puzzle} ${score}`, ...rows, url].join('\n');
}
