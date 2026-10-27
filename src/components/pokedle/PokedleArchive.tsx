'use client';

// List of every Pokédle puzzle so far, with how you did on each one.

import { useMemo } from 'react';
import Link from 'next/link';
import { Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { readStore } from '@/lib/games';
import { puzzleNumber } from '@/lib/pokedle';
import { RESULTS_KEY, type Results } from '@/components/pokedle/Pokedle';

export default function PokedleArchive() {
  const today = useMemo(() => puzzleNumber(), []);
  const results = useMemo(() => readStore<Results>(RESULTS_KEY, {}), []);
  const puzzles = Array.from({ length: today - 1 }, (_, i) => today - 1 - i);
  const solvedCount = puzzles.filter((n) => results[n]?.solved).length;

  if (puzzles.length === 0) {
    return (
      <p className="rounded-2xl border bg-white p-6 text-center text-muted-foreground">
        Today&apos;s puzzle is the first one, so there&apos;s nothing in the archive yet. Come back tomorrow!
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        {solvedCount} of {puzzles.length} past puzzles solved. Archive games don&apos;t affect your daily streak.
      </p>
      <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
        {puzzles.map((n) => {
          const r = results[n];
          return (
            <li key={n}>
              <Link
                href={`/play/pokedle?puzzle=${n}`}
                className={cn(
                  'flex flex-col items-center rounded-xl border-2 p-3 text-center text-sm transition-colors hover:border-blue-500',
                  r?.solved ? 'border-emerald-500 bg-emerald-50' : r ? 'border-red-300 bg-red-50' : 'bg-white'
                )}
              >
                <span className="font-semibold">#{n}</span>
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  {r?.solved ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-600" /> {r.guesses} guess{r.guesses === 1 ? '' : 'es'}
                    </>
                  ) : r ? (
                    <>
                      <X className="h-3.5 w-3.5 text-red-500" /> Missed
                    </>
                  ) : (
                    'Not played'
                  )}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
