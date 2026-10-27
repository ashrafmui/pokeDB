'use client';

// The Pokédle game. Rendered only in the browser (see PokedleLoader), so it
// can read today's date and localStorage while initialising state.

import { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowDown, ArrowUp, Check, Copy, RefreshCw, Shuffle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PokemonPicker from '@/components/PokemonPicker';
import { cn } from '@/lib/utils';
import { spriteUrl, officialArtworkUrl } from '@/lib/sprites';
import { getTypeBadgeColors } from '@/lib/typeColors';
import type { DexLite } from '@/lib/dexLite';
import {
  HINT_COLUMNS,
  MAX_GUESSES,
  dailyAnswer,
  puzzleNumber,
  scoreGuess,
  shareText,
  type GuessResult,
  type HintCell,
} from '@/lib/pokedle';

// ── Persistence (per-viewer, best effort) ────────────────────────────────────

const GAME_KEY = 'pokedle:daily';
const STATS_KEY = 'pokedle:stats';

interface SavedGame {
  puzzle: number;
  guessIds: number[];
}

interface Stats {
  played: number;
  won: number;
  streak: number;
  maxStreak: number;
  lastWonPuzzle: number | null;
  /** distribution[n - 1] = games won in n guesses. */
  distribution: number[];
}

const EMPTY_STATS: Stats = {
  played: 0,
  won: 0,
  streak: 0,
  maxStreak: 0,
  lastWonPuzzle: null,
  distribution: Array(MAX_GUESSES).fill(0),
};

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? { ...fallback, ...JSON.parse(raw) } : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Private mode or storage blocked: the game still works, it just won't remember.
  }
}

/** Updates win/loss stats once, when a daily game ends. */
function recordResult(puzzle: number, solved: boolean, guesses: number): Stats {
  const stats = read(STATS_KEY, EMPTY_STATS);
  const next: Stats = { ...stats, distribution: [...stats.distribution], played: stats.played + 1 };
  if (solved) {
    next.won += 1;
    next.streak = stats.lastWonPuzzle === puzzle - 1 ? stats.streak + 1 : 1;
    next.maxStreak = Math.max(next.maxStreak, next.streak);
    next.lastWonPuzzle = puzzle;
    next.distribution[guesses - 1] += 1;
  } else {
    next.streak = 0;
  }
  write(STATS_KEY, next);
  return next;
}

// ── UI pieces ────────────────────────────────────────────────────────────────

const STATUS_CLASSES = {
  correct: 'bg-emerald-500 text-white border-emerald-600',
  partial: 'bg-amber-400 text-gray-900 border-amber-500',
  wrong: 'bg-gray-200 text-gray-700 border-gray-300',
} as const;

function Cell({ cell, isType }: { cell: HintCell; isType: boolean }) {
  const typeColors = isType && cell.display !== 'None' ? getTypeBadgeColors(cell.display.toLowerCase()) : null;
  return (
    <div
      className={cn(
        'relative flex h-14 min-w-0 flex-col items-center justify-center rounded-lg border-2 px-0.5 text-center text-[9.5px] font-medium leading-tight sm:px-1 sm:text-xs',
        STATUS_CLASSES[cell.status]
      )}
    >
      {typeColors ? (
        <span className="max-w-full truncate rounded-full px-1 py-0.5 sm:px-1.5" style={{ backgroundColor: typeColors.bg, color: typeColors.text }}>
          <span className="sm:hidden" title={cell.display}>{cell.display.slice(0, 3)}</span>
          <span className="hidden sm:inline">{cell.display}</span>
        </span>
      ) : (
        <span>{cell.display}</span>
      )}
      {cell.direction === 'higher' && <ArrowUp className="mt-0.5 h-3.5 w-3.5" aria-label="answer is higher" />}
      {cell.direction === 'lower' && <ArrowDown className="mt-0.5 h-3.5 w-3.5" aria-label="answer is lower" />}
    </div>
  );
}

function GuessRow({ result }: { result: GuessResult }) {
  return (
    <div className="grid grid-cols-[40px_repeat(7,minmax(0,1fr))] sm:grid-cols-[minmax(110px,1.4fr)_repeat(7,minmax(0,1fr))] gap-1 sm:gap-1.5">
      <div className="flex h-14 items-center justify-center gap-1 overflow-hidden rounded-lg border-2 border-gray-200 bg-white sm:justify-start sm:px-1" title={result.guess.name}>
        <Image src={spriteUrl(result.guess.id)} alt={result.guess.name} width={40} height={40} unoptimized className="shrink-0" style={{ imageRendering: 'pixelated' }} />
        <span className="hidden truncate text-xs font-semibold sm:inline">{result.guess.name}</span>
      </div>
      {HINT_COLUMNS.map((c) => (
        <Cell key={c.key} cell={result.cells[c.key]} isType={c.key === 'type1' || c.key === 'type2'} />
      ))}
    </div>
  );
}

function StatsPanel({ stats }: { stats: Stats }) {
  const winRate = stats.played ? Math.round((stats.won / stats.played) * 100) : 0;
  const maxBar = Math.max(1, ...stats.distribution);
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-4 gap-2 text-center">
        {[
          ['Played', stats.played],
          ['Win %', winRate],
          ['Streak', stats.streak],
          ['Best', stats.maxStreak],
        ].map(([label, value]) => (
          <div key={label}>
            <div className="text-2xl font-semibold tabular-nums">{value}</div>
            <div className="text-xs text-muted-foreground">{label}</div>
          </div>
        ))}
      </div>
      <div className="space-y-1">
        {stats.distribution.map((count, i) => (
          <div key={i} className="flex items-center gap-2 text-xs">
            <span className="w-3 text-right tabular-nums">{i + 1}</span>
            <div className="h-4 rounded bg-blue-500 text-right text-[10px] text-white" style={{ width: `${Math.max(6, (count / maxBar) * 100)}%` }}>
              <span className="px-1">{count}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Game ─────────────────────────────────────────────────────────────────────

export default function Pokedle({ pool, siteUrl }: { pool: readonly DexLite[]; siteUrl: string }) {
  const byId = useMemo(() => new Map(pool.map((p) => [p.id, p])), [pool]);
  const puzzle = useMemo(() => puzzleNumber(), []);
  const dailyTarget = useMemo(() => dailyAnswer(pool, puzzle), [pool, puzzle]);

  const [mode, setMode] = useState<'daily' | 'practice'>('daily');
  const [practiceTarget, setPracticeTarget] = useState<DexLite>(() => pool[Math.floor(Math.random() * pool.length)]);
  const [dailyGuesses, setDailyGuesses] = useState<number[]>(() => {
    const saved = read<SavedGame>(GAME_KEY, { puzzle: 0, guessIds: [] });
    return saved.puzzle === puzzle ? saved.guessIds.filter((id) => byId.has(id)) : [];
  });
  const [practiceGuesses, setPracticeGuesses] = useState<number[]>([]);
  const [stats, setStats] = useState<Stats>(() => read(STATS_KEY, EMPTY_STATS));
  const [copied, setCopied] = useState(false);

  const target = mode === 'daily' ? dailyTarget : practiceTarget;
  const guessIds = mode === 'daily' ? dailyGuesses : practiceGuesses;
  const results = guessIds.map((id) => scoreGuess(byId.get(id)!, target));
  const solved = results.some((r) => r.solved);
  const over = solved || results.length >= MAX_GUESSES;
  const guessed = useMemo(() => new Set(guessIds), [guessIds]);

  function handleGuess(p: DexLite) {
    if (over) return;
    const next = [...guessIds, p.id];
    if (mode === 'practice') {
      setPracticeGuesses(next);
      return;
    }
    setDailyGuesses(next);
    write(GAME_KEY, { puzzle, guessIds: next } satisfies SavedGame);
    const nowSolved = p.id === target.id;
    if (nowSolved || next.length >= MAX_GUESSES) setStats(recordResult(puzzle, nowSolved, next.length));
  }

  async function copyShare() {
    const text = shareText(puzzle, results, solved, `${siteUrl}/play/pokedle`);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt('Copy your result:', text);
    }
  }

  function newPractice() {
    setPracticeTarget(pool[Math.floor(Math.random() * pool.length)]);
    setPracticeGuesses([]);
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-full bg-gray-100 p-1 text-sm">
          {(['daily', 'practice'] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={cn('rounded-full px-4 py-1.5 font-medium transition', mode === m ? 'bg-white shadow' : 'text-muted-foreground')}
            >
              {m === 'daily' ? `Daily #${puzzle}` : 'Practice'}
            </button>
          ))}
        </div>
        <span className="text-sm text-muted-foreground tabular-nums">
          Guess {Math.min(results.length + (over ? 0 : 1), MAX_GUESSES)} of {MAX_GUESSES}
        </span>
      </div>

      <PokemonPicker
        pool={pool}
        exclude={guessed}
        disabled={over}
        onPick={handleGuess}
        label="Guess a Pokémon"
        placeholder="Type a Pokémon name…"
        disabledPlaceholder="Game over, come back tomorrow!"
      />

      <div>
        <div className="space-y-1.5">
          <div className="grid grid-cols-[40px_repeat(7,minmax(0,1fr))] sm:grid-cols-[minmax(110px,1.4fr)_repeat(7,minmax(0,1fr))] gap-1 text-center text-[10px] font-medium text-muted-foreground sm:gap-1.5 sm:text-[11px]">
            <span className="hidden text-left sm:inline">Pokémon</span>
            <span className="sm:hidden" />
            {HINT_COLUMNS.map((c) => (
              <span key={c.key}>{c.label}</span>
            ))}
          </div>
          {[...results].reverse().map((r) => (
            <GuessRow key={r.guess.id} result={r} />
          ))}
          {results.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Guess any Pokémon to get your first clues.
            </p>
          )}
        </div>
      </div>

      {over && (
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="flex flex-col items-center gap-3 text-center sm:flex-row sm:text-left">
            <Image src={officialArtworkUrl(target.id)} alt={target.name} width={120} height={120} unoptimized />
            <div className="flex-1 space-y-1">
              <p className="text-lg font-semibold">
                {solved ? `Got it in ${results.length}!` : 'Out of guesses.'} It was{' '}
                <Link href={`/pokemon/${target.id}`} className="text-blue-600 hover:underline">
                  {target.name}
                </Link>
                .
              </p>
              <div className="flex flex-wrap justify-center gap-2 pt-1 sm:justify-start">
                {mode === 'daily' ? (
                  <Button onClick={copyShare} size="sm">
                    {copied ? <Check className="mr-1 h-4 w-4" /> : <Copy className="mr-1 h-4 w-4" />}
                    {copied ? 'Copied' : 'Share result'}
                  </Button>
                ) : (
                  <Button onClick={newPractice} size="sm">
                    <RefreshCw className="mr-1 h-4 w-4" /> New Pokémon
                  </Button>
                )}
                {mode === 'daily' && (
                  <Button variant="outline" size="sm" onClick={() => setMode('practice')}>
                    <Shuffle className="mr-1 h-4 w-4" /> Keep playing in practice
                  </Button>
                )}
              </div>
            </div>
          </div>
          {mode === 'daily' && (
            <div className="mt-5 border-t pt-4">
              <StatsPanel stats={stats} />
            </div>
          )}
        </div>
      )}

      <details className="rounded-xl bg-gray-50 p-4 text-sm text-muted-foreground">
        <summary className="cursor-pointer font-medium text-foreground">How to play</summary>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>Guess the Pokémon in {MAX_GUESSES} tries. A new one appears every day at midnight UTC.</li>
          <li><span className="font-medium text-emerald-600">Green</span> means that clue matches exactly.</li>
          <li><span className="font-medium text-amber-600">Yellow</span> on a type means it&apos;s the answer&apos;s other type; on a number it means you&apos;re close (within 1 generation, or 20% of the height or weight).</li>
          <li>Arrows tell you whether the answer&apos;s generation, stage, height or weight is higher or lower.</li>
          <li>Practice mode gives you unlimited random Pokémon and doesn&apos;t affect your streak.</li>
        </ul>
      </details>
    </div>
  );
}
