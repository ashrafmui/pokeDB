'use client';

// Higher or Lower: is the next Pokémon's stat higher or lower than this one's?
// One wrong answer ends the run; the best streak per stat is saved locally.

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { ArrowDown, ArrowUp, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { officialArtworkUrl } from '@/lib/sprites';
import { readStore, writeStore } from '@/lib/games';
import { METRICS, formatValue, isHigher, pickRound, type HLMon, type Round } from '@/lib/higherLower';

const BEST_KEY = 'hol:best';
const REVEAL_MS = 1300;

type Phase = 'guessing' | 'right' | 'wrong';

function Card({ mon, metric, value, label }: { mon: HLMon; metric: number; value: number | null; label: string }) {
  return (
    <div className="flex flex-1 flex-col items-center rounded-2xl border bg-white p-3 text-center shadow-sm">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <Image key={mon.id} src={officialArtworkUrl(mon.id)} alt={mon.name} width={160} height={160} unoptimized className="h-32 w-32 object-contain sm:h-40 sm:w-40" />
      <p className="font-semibold">{mon.name}</p>
      <p className="mt-1 text-sm text-muted-foreground">{METRICS[metric].label}</p>
      <p className="text-3xl font-bold tabular-nums">{value == null ? '?' : formatValue(metric, value)}</p>
    </div>
  );
}

export default function HigherOrLower({ pool }: { pool: HLMon[] }) {
  // 'all' mixes stats; otherwise the index of the chosen metric.
  const [mode, setMode] = useState<'all' | number>('all');
  const [round, setRound] = useState<Round>(() => pickRound(pool, null, null));
  const [phase, setPhase] = useState<Phase>('guessing');
  const [streak, setStreak] = useState(0);
  const [best, setBest] = useState<Record<string, number>>(() => readStore(BEST_KEY, {}));
  const timer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => () => clearTimeout(timer.current), []);

  const modeKey = String(mode);
  const metricArg = mode === 'all' ? null : mode;

  function answer(guessHigher: boolean) {
    if (phase !== 'guessing') return;
    const correct = guessHigher === isHigher(round);
    if (!correct) {
      setPhase('wrong');
      return;
    }
    const nextStreak = streak + 1;
    setStreak(nextStreak);
    if (nextStreak > (best[modeKey] ?? 0)) {
      const nextBest = { ...best, [modeKey]: nextStreak };
      setBest(nextBest);
      writeStore(BEST_KEY, nextBest);
    }
    setPhase('right');
    timer.current = setTimeout(() => {
      setRound((r) => pickRound(pool, r.right, metricArg));
      setPhase('guessing');
    }, REVEAL_MS);
  }

  function restart(nextMode: 'all' | number = mode) {
    clearTimeout(timer.current);
    setMode(nextMode);
    setStreak(0);
    setPhase('guessing');
    setRound(pickRound(pool, null, nextMode === 'all' ? null : nextMode));
  }

  const revealed = phase !== 'guessing';
  const metric = round.metric;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="mr-1 text-xs font-medium text-muted-foreground">Stat</span>
        {(['all', ...METRICS.map((_, i) => i)] as const).map((m) => (
          <button
            key={m}
            type="button"
            aria-pressed={mode === m}
            onClick={() => restart(m)}
            className={cn('rounded-full border px-2.5 py-1 text-xs font-medium', mode === m ? 'border-blue-600 bg-blue-600 text-white' : 'bg-white')}
          >
            {m === 'all' ? 'Mixed' : METRICS[m].label}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between text-sm">
        <span>
          Streak <span className="font-bold">{streak}</span>
        </span>
        <span className="text-muted-foreground">Best {best[modeKey] ?? 0}</span>
      </div>

      <div className="flex items-stretch gap-3" aria-live="polite">
        <Card mon={round.left} metric={metric} value={round.left.values[metric]} label="Known" />
        <Card mon={round.right} metric={metric} value={revealed ? round.right.values[metric] : null} label="Mystery" />
      </div>

      {phase === 'guessing' && (
        <div className="space-y-3 text-center">
          <p className="text-sm">
            Does <span className="font-semibold">{round.right.name}</span> have a higher or lower {METRICS[metric].noun} than{' '}
            <span className="font-semibold">{round.left.name}</span>?
          </p>
          <div className="flex justify-center gap-3">
            <Button size="lg" onClick={() => answer(true)}>
              <ArrowUp className="mr-1.5 h-5 w-5" />
              Higher
            </Button>
            <Button size="lg" variant="outline" onClick={() => answer(false)}>
              <ArrowDown className="mr-1.5 h-5 w-5" />
              Lower
            </Button>
          </div>
        </div>
      )}

      {phase === 'right' && <p className="text-center font-semibold text-emerald-600">Correct! Next up…</p>}

      {phase === 'wrong' && (
        <div className="mx-auto max-w-sm space-y-3 rounded-2xl border bg-white p-5 text-center shadow-sm">
          <p className="text-sm text-muted-foreground">
            {round.right.name} has {formatValue(metric, round.right.values[metric])}.
          </p>
          <p className="text-2xl font-bold">Game over: streak of {streak}</p>
          {streak > 0 && streak >= (best[modeKey] ?? 0) && <p className="text-sm font-medium text-amber-600">New personal best!</p>}
          <Button onClick={() => restart()}>
            <RotateCcw className="mr-1.5 h-4 w-4" />
            Play again
          </Button>
        </div>
      )}
    </div>
  );
}
