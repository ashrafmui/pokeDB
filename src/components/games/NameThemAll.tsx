'use client';

// Name Them All: type as many Pokémon from a generation as you can before the
// timer runs out. Names are accepted as soon as they're spelled right, no
// Enter needed, Sporcle-style.

import { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { Flag, Play, RotateCcw, Timer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { spriteUrl } from '@/lib/sprites';
import { GENERATIONS, normalizeName, readStore, writeStore, type GameMon } from '@/lib/games';

/** 0 = every generation. */
type GenChoice = 0 | (typeof GENERATIONS)[number];
/** Minutes; 0 = untimed. */
const TIME_OPTIONS = [5, 15, 30, 0] as const;

type Phase = 'setup' | 'playing' | 'done';

interface Best {
  named: number;
  seconds: number;
}

const bestKey = (gen: GenChoice, minutes: number) => `nta:best:${gen}:${minutes}`;

function formatTime(totalSeconds: number): string {
  const s = Math.max(0, Math.round(totalSeconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

function Cell({ mon, state }: { mon: GameMon; state: 'hidden' | 'named' | 'missed' }) {
  return (
    <div
      className={cn(
        'flex h-[76px] min-w-0 flex-col items-center justify-center rounded-lg border text-center',
        state === 'named' && 'border-emerald-300 bg-emerald-50',
        state === 'missed' && 'border-red-200 bg-red-50',
        state === 'hidden' && 'border-gray-200 bg-white/70'
      )}
    >
      {state === 'hidden' ? (
        <span className="text-xs tabular-nums text-gray-400">#{mon.id}</span>
      ) : (
        <>
          <Image
            src={spriteUrl(mon.id)}
            alt=""
            width={44}
            height={44}
            unoptimized
            loading="lazy"
            className={cn(state === 'missed' && 'opacity-50 grayscale')}
            style={{ imageRendering: 'pixelated' }}
          />
          <span className={cn('w-full truncate px-0.5 text-[10px] font-medium leading-tight', state === 'missed' && 'text-red-700')}>
            {mon.name}
          </span>
        </>
      )}
    </div>
  );
}

export default function NameThemAll({ pool }: { pool: GameMon[] }) {
  const [gen, setGen] = useState<GenChoice>(1);
  const [minutes, setMinutes] = useState<number>(15);
  const [phase, setPhase] = useState<Phase>('setup');
  const [named, setNamed] = useState<Set<number>>(new Set());
  const [recent, setRecent] = useState<GameMon[]>([]);
  const [input, setInput] = useState('');
  const [startedAt, setStartedAt] = useState(0);
  const [now, setNow] = useState(0);
  const [endedAt, setEndedAt] = useState(0);
  const [best, setBest] = useState<Best | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  // The timer callback needs the latest names without restarting the interval.
  const namedRef = useRef(named);

  const set = useMemo(() => (gen === 0 ? pool : pool.filter((p) => p.generation === gen)), [pool, gen]);
  const byName = useMemo(() => new Map(set.map((m) => [normalizeName(m.name), m])), [set]);

  const elapsed = ((phase === 'done' ? endedAt : now) - startedAt) / 1000;
  const remaining = minutes ? minutes * 60 - elapsed : null;

  // Tick while playing; the clock is derived from timestamps so it never drifts.
  useEffect(() => {
    if (phase !== 'playing') return;
    const id = window.setInterval(() => {
      const t = Date.now();
      setNow(t);
      if (minutes && t - startedAt >= minutes * 60_000) finish(namedRef.current);
    }, 250);
    return () => window.clearInterval(id);
    // finish only changes with the settings captured here when a game starts.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, minutes, startedAt]);

  function finish(finalNamed: Set<number>) {
    const end = Date.now();
    setEndedAt(end);
    setPhase('done');
    const seconds = Math.round((end - startedAt) / 1000);
    const key = bestKey(gen, minutes);
    const prev = readStore<Best | null>(key, null);
    // More names wins; ties go to the faster time.
    if (!prev || finalNamed.size > prev.named || (finalNamed.size === prev.named && seconds < prev.seconds)) {
      writeStore(key, { named: finalNamed.size, seconds });
    }
  }

  function start() {
    const t = Date.now();
    namedRef.current = new Set();
    setNamed(namedRef.current);
    setRecent([]);
    setInput('');
    setStartedAt(t);
    setNow(t);
    setBest(readStore<Best | null>(bestKey(gen, minutes), null));
    setPhase('playing');
    setTimeout(() => inputRef.current?.focus(), 0);
  }

  /** Exact match that's still unnamed, if any. */
  function matchFor(value: string): GameMon | undefined {
    const match = byName.get(normalizeName(value));
    return match && !named.has(match.id) ? match : undefined;
  }

  /** "Mew" could be the start of "Mewtwo", so it waits for Enter. */
  function isPrefixOfAnother(match: GameMon): boolean {
    const key = normalizeName(match.name);
    return set.some((m) => m.id !== match.id && !named.has(m.id) && normalizeName(m.name).startsWith(key));
  }

  function onType(value: string) {
    const match = matchFor(value);
    if (!match || isPrefixOfAnother(match)) {
      setInput(value);
      return;
    }
    accept(match);
  }

  function accept(match: GameMon) {
    const next = new Set(named).add(match.id);
    namedRef.current = next;
    setNamed(next);
    setRecent((r) => [match, ...r].slice(0, 6));
    setInput('');
    if (next.size === set.length) finish(next);
  }

  const genLabel = gen === 0 ? 'every generation' : `Generation ${gen}`;

  if (phase === 'setup') {
    return (
      <div className="mx-auto max-w-xl space-y-6 rounded-2xl border bg-white/80 p-5 shadow-sm backdrop-blur sm:p-6">
        <div className="space-y-2">
          <h2 className="text-sm font-semibold">Generation</h2>
          <div className="flex flex-wrap gap-1.5">
            {GENERATIONS.map((g) => (
              <button
                key={g}
                type="button"
                aria-pressed={gen === g}
                onClick={() => setGen(g)}
                className={cn('h-9 w-9 rounded-full border text-sm font-medium', gen === g ? 'border-blue-600 bg-blue-600 text-white' : 'bg-white')}
              >
                {g}
              </button>
            ))}
            <button
              type="button"
              aria-pressed={gen === 0}
              onClick={() => setGen(0)}
              className={cn('h-9 rounded-full border px-3 text-sm font-medium', gen === 0 ? 'border-blue-600 bg-blue-600 text-white' : 'bg-white')}
            >
              All {pool.length.toLocaleString()}
            </button>
          </div>
        </div>
        <div className="space-y-2">
          <h2 className="text-sm font-semibold">Time limit</h2>
          <div className="flex flex-wrap gap-1.5">
            {TIME_OPTIONS.map((m) => (
              <button
                key={m}
                type="button"
                aria-pressed={minutes === m}
                onClick={() => setMinutes(m)}
                className={cn('h-9 rounded-full border px-3 text-sm font-medium', minutes === m ? 'border-blue-600 bg-blue-600 text-white' : 'bg-white')}
              >
                {m ? `${m} min` : 'No limit'}
              </button>
            ))}
          </div>
        </div>
        <Button size="lg" className="w-full" onClick={start}>
          <Play className="mr-2 h-4 w-4" />
          Name {set.length} Pokémon from {genLabel}
        </Button>
      </div>
    );
  }

  const progress = Math.round((named.size / set.length) * 100);

  return (
    <div className="space-y-4">
      <div className="sticky top-2 z-20 space-y-3 rounded-2xl border bg-white/95 p-3 shadow-sm backdrop-blur sm:p-4">
        <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
          <span className="font-semibold">
            {named.size} / {set.length} <span className="font-normal text-muted-foreground">· {genLabel}</span>
          </span>
          <span className={cn('flex items-center gap-1 font-mono text-base tabular-nums', remaining !== null && remaining < 30 && phase === 'playing' && 'text-red-600')}>
            <Timer className="h-4 w-4" />
            {remaining !== null ? formatTime(remaining) : formatTime(elapsed)}
          </span>
        </div>
        <div className="h-1.5 rounded-full bg-gray-100">
          <div className="h-1.5 rounded-full bg-emerald-500 transition-all" style={{ width: `${progress}%` }} />
        </div>
        {phase === 'playing' ? (
          <div className="flex gap-2">
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => onType(e.target.value)}
              onKeyDown={(e) => {
                const match = e.key === 'Enter' ? matchFor(input) : undefined;
                if (match) accept(match);
              }}
              placeholder="Type a Pokémon name…"
              aria-label="Name a Pokémon"
              autoComplete="off"
              autoCapitalize="off"
              spellCheck={false}
              className="h-11 min-w-0 flex-1 rounded-xl border-2 border-gray-200 bg-white px-3 text-base outline-none focus:border-blue-500"
            />
            <Button variant="outline" className="h-11" onClick={() => finish(named)}>
              <Flag className="mr-1.5 h-4 w-4" />
              Give up
            </Button>
          </div>
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-lg font-bold">
                {named.size === set.length ? `All ${set.length} named! 🎉` : `You named ${named.size} of ${set.length} (${progress}%)`}
              </p>
              <p className="text-xs text-muted-foreground">
                Time {formatTime(elapsed)}
                {best && ` · previous best ${best.named} in ${formatTime(best.seconds)}`}
                {(!best || named.size > best.named) && named.size > 0 && ' · new personal best!'}
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={start}>
                <RotateCcw className="mr-1.5 h-4 w-4" />
                Play again
              </Button>
              <Button variant="outline" onClick={() => setPhase('setup')}>
                Change settings
              </Button>
            </div>
          </div>
        )}
        {phase === 'playing' && matchFor(input) && (
          <p className="text-xs text-muted-foreground">Press Enter to name {matchFor(input)!.name}, or keep typing.</p>
        )}
        {phase === 'playing' && recent.length > 0 && (
          <div className="flex flex-wrap gap-1 text-xs">
            {recent.map((m, i) => (
              <span key={m.id} className={cn('rounded-full px-2 py-0.5', i === 0 ? 'bg-emerald-100 font-semibold text-emerald-800' : 'bg-gray-100 text-gray-600')}>
                {m.name}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(68px,1fr))] gap-1.5">
        {set.map((m) => (
          <Cell key={m.id} mon={m} state={named.has(m.id) ? 'named' : phase === 'done' ? 'missed' : 'hidden'} />
        ))}
      </div>
    </div>
  );
}
