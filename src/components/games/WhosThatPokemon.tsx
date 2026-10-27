'use client';

// Who's That Pokémon?: name the Pokémon from its silhouette. An endless run
// with three lives; giving up costs a life, wrong guesses don't. Hints reveal
// the generation, then the types, then the first letter.

import { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, Lightbulb, RotateCcw, SkipForward } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { officialArtworkUrl } from '@/lib/sprites';
import { getTypeBadgeColors } from '@/lib/typeColors';
import { GENERATIONS, isCorrectName, readStore, shuffle, writeStore, type GameMon } from '@/lib/games';

const LIVES = 3;
const BEST_KEY = 'wtp:best';
const title = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

type Phase = 'guessing' | 'correct' | 'revealed' | 'over';

export default function WhosThatPokemon({ pool }: { pool: GameMon[] }) {
  const [gens, setGens] = useState<number[]>([]);
  const deck = useMemo(() => shuffle(gens.length ? pool.filter((p) => gens.includes(p.generation)) : pool), [pool, gens]);
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>('guessing');
  const [guess, setGuess] = useState('');
  const [wrong, setWrong] = useState<string | null>(null);
  const [hints, setHints] = useState(0);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(LIVES);
  const [best, setBest] = useState<number>(() => readStore(BEST_KEY, 0));
  const inputRef = useRef<HTMLInputElement>(null);

  const current = deck[index % deck.length];
  const upNext = deck[(index + 1) % deck.length];
  const revealed = phase !== 'guessing';

  function next() {
    if (phase === 'over') return;
    setIndex((i) => i + 1);
    setPhase('guessing');
    setGuess('');
    setWrong(null);
    setHints(0);
    inputRef.current?.focus();
  }

  function submit() {
    if (phase !== 'guessing' || !guess.trim()) return;
    if (isCorrectName(guess, current.name)) {
      const nextScore = score + 1;
      setScore(nextScore);
      if (nextScore > best) {
        setBest(nextScore);
        writeStore(BEST_KEY, nextScore);
      }
      setPhase('correct');
    } else {
      setWrong(guess.trim());
      setGuess('');
    }
  }

  function giveUp() {
    if (phase !== 'guessing') return;
    const left = lives - 1;
    setLives(left);
    setPhase(left === 0 ? 'over' : 'revealed');
  }

  function restart(nextGens = gens) {
    setGens(nextGens);
    setIndex(0);
    setPhase('guessing');
    setGuess('');
    setWrong(null);
    setHints(0);
    setScore(0);
    setLives(LIVES);
  }

  // Enter moves on once the answer is shown.
  useEffect(() => {
    if (!revealed || phase === 'over') return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter') next();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="mr-1 text-xs font-medium text-muted-foreground">Generations</span>
        <button
          type="button"
          onClick={() => restart([])}
          className={cn('rounded-full border px-2.5 py-1 text-xs font-medium', gens.length === 0 ? 'border-blue-600 bg-blue-600 text-white' : 'bg-white')}
        >
          All
        </button>
        {GENERATIONS.map((g) => (
          <button
            key={g}
            type="button"
            aria-pressed={gens.includes(g)}
            onClick={() => restart(gens.includes(g) ? gens.filter((x) => x !== g) : [...gens, g])}
            className={cn('rounded-full border px-2.5 py-1 text-xs font-medium', gens.includes(g) ? 'border-blue-600 bg-blue-600 text-white' : 'bg-white')}
          >
            {g}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-1" aria-label={`${lives} lives left`}>
          {Array.from({ length: LIVES }, (_, i) => (
            <Heart key={i} className={cn('h-5 w-5', i < lives ? 'fill-red-500 text-red-500' : 'text-gray-300')} />
          ))}
        </div>
        <div className="flex gap-4">
          <span>
            Score <span className="font-bold">{score}</span>
          </span>
          <span className="text-muted-foreground">Best {best}</span>
        </div>
      </div>

      <div className="relative mx-auto flex aspect-square w-full max-w-sm items-center justify-center rounded-3xl border bg-gradient-to-br from-sky-100 via-white to-amber-100 shadow-inner">
        <Image
          key={current.id}
          src={officialArtworkUrl(current.id)}
          alt={revealed ? current.name : 'Mystery Pokémon silhouette'}
          width={320}
          height={320}
          unoptimized
          priority
          draggable={false}
          className="h-4/5 w-4/5 select-none object-contain transition-[filter] duration-500"
          style={{ filter: revealed ? 'none' : 'brightness(0)' }}
        />
        {/* Warm the cache so the next silhouette appears instantly. */}
        <link rel="preload" as="image" href={officialArtworkUrl(upNext.id)} />
        {revealed && (
          <div className="absolute inset-x-0 bottom-3 text-center">
            <span className="rounded-full bg-white/90 px-4 py-1.5 text-lg font-bold shadow">{current.name}</span>
          </div>
        )}
      </div>

      {phase === 'guessing' && (
        <form
          className="mx-auto flex max-w-sm gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
        >
          <input
            ref={inputRef}
            autoFocus
            value={guess}
            onChange={(e) => setGuess(e.target.value)}
            placeholder="Who's that Pokémon?"
            aria-label="Your guess"
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            className="h-12 min-w-0 flex-1 rounded-xl border-2 border-gray-200 bg-white px-4 text-base outline-none focus:border-blue-500"
          />
          <Button type="submit" className="h-12">
            Guess
          </Button>
        </form>
      )}

      {phase === 'guessing' && (
        <div className="mx-auto max-w-sm space-y-3">
          {wrong && <p className="text-center text-sm text-red-600">Not {wrong}. Try again!</p>}
          {hints > 0 && (
            <div className="flex flex-wrap items-center justify-center gap-2 text-sm">
              <span className="rounded-full bg-gray-100 px-2 py-0.5">Gen {current.generation}</span>
              {hints > 1 &&
                current.types.map((t) => {
                  const { bg, text } = getTypeBadgeColors(t);
                  return (
                    <span key={t} className="rounded-full px-2 py-0.5 text-xs font-semibold" style={{ backgroundColor: bg, color: text }}>
                      {title(t)}
                    </span>
                  );
                })}
              {hints > 2 && (
                <span className="rounded-full bg-gray-100 px-2 py-0.5 font-mono">
                  {current.name[0]}
                  {'_'.repeat(Math.max(0, current.name.length - 1))}
                </span>
              )}
            </div>
          )}
          <div className="flex justify-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setHints((h) => h + 1)} disabled={hints >= 3}>
              <Lightbulb className="mr-1.5 h-4 w-4" />
              Hint{hints < 3 && ` (${3 - hints} left)`}
            </Button>
            <Button variant="ghost" size="sm" onClick={giveUp}>
              <SkipForward className="mr-1.5 h-4 w-4" />
              Give up (−1 life)
            </Button>
          </div>
        </div>
      )}

      {(phase === 'correct' || phase === 'revealed') && (
        <div className="mx-auto max-w-sm space-y-3 text-center">
          <p className={cn('font-semibold', phase === 'correct' ? 'text-emerald-600' : 'text-gray-600')}>
            {phase === 'correct' ? "That's right!" : `It's ${current.name}!`}
          </p>
          <div className="flex justify-center gap-2">
            <Button onClick={next}>
              Next Pokémon
            </Button>
            <Button variant="outline" asChild>
              <Link href={`/pokemon/${current.id}`}>View {current.name}</Link>
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">Press Enter for the next one</p>
        </div>
      )}

      {phase === 'over' && (
        <div className="mx-auto max-w-sm space-y-3 rounded-2xl border bg-white p-5 text-center shadow-sm">
          <p className="text-sm text-muted-foreground">It was {current.name}.</p>
          <p className="text-2xl font-bold">
            Game over: {score} correct
          </p>
          {score > 0 && score >= best && <p className="text-sm font-medium text-amber-600">New personal best!</p>}
          <Button onClick={() => restart()}>
            <RotateCcw className="mr-1.5 h-4 w-4" />
            Play again
          </Button>
        </div>
      )}
    </div>
  );
}
