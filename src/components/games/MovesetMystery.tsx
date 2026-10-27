'use client';

// Moveset Mystery: guess the Pokémon from moves it learns and its abilities.
// Each wrong guess reveals the next clue, and later clues are worth fewer
// points. Three lives; failing a round (or skipping it) costs one.

import { useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, RotateCcw, SkipForward } from 'lucide-react';
import { Button } from '@/components/ui/button';
import TypeBadge from '@/components/TypeBadge';
import { cn } from '@/lib/utils';
import { officialArtworkUrl } from '@/lib/sprites';
import { isCorrectName, readStore, shuffle, writeStore } from '@/lib/games';
import type { MoveClue } from '@/lib/moves';

const LIVES = 3;
const BEST_KEY = 'mm:best';

/** What each clue stage reveals. */
const STAGES = ['Two common moves', 'Its abilities', 'Two more moves', 'Type and generation', 'Its most distinctive moves'] as const;
const MAX_POINTS = STAGES.length;

type Phase = 'guessing' | 'correct' | 'revealed' | 'over';

export default function MovesetMystery({ pool }: { pool: MoveClue[] }) {
  const [deck, setDeck] = useState(() => shuffle(pool));
  const [index, setIndex] = useState(0);
  const [stage, setStage] = useState(0); // number of clue stages revealed beyond the first
  const [phase, setPhase] = useState<Phase>('guessing');
  const [guess, setGuess] = useState('');
  const [wrong, setWrong] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(LIVES);
  const [best, setBest] = useState<number>(() => readStore(BEST_KEY, 0));
  const inputRef = useRef<HTMLInputElement>(null);

  const current = deck[index % deck.length];
  const names = useMemo(() => pool.map((p) => p.name), [pool]);
  const shown = (stageNeeded: number) => stage >= stageNeeded || phase !== 'guessing';
  const moveCount = shown(4) ? 6 : shown(2) ? 4 : 2;

  function next() {
    setIndex((i) => i + 1);
    setStage(0);
    setPhase('guessing');
    setGuess('');
    setWrong([]);
    inputRef.current?.focus();
  }

  function loseLife() {
    const left = lives - 1;
    setLives(left);
    setPhase(left === 0 ? 'over' : 'revealed');
  }

  function submit() {
    const text = guess.trim();
    if (phase !== 'guessing' || !text) return;
    if (isCorrectName(text, current.name)) {
      const nextScore = score + (MAX_POINTS - stage);
      setScore(nextScore);
      if (nextScore > best) {
        setBest(nextScore);
        writeStore(BEST_KEY, nextScore);
      }
      setPhase('correct');
      return;
    }
    setGuess('');
    if (stage >= STAGES.length - 1) {
      setWrong((w) => [...w, text]);
      loseLife();
    } else {
      setWrong((w) => [...w, text]);
      setStage(stage + 1);
    }
  }

  function restart() {
    setDeck(shuffle(pool));
    setIndex(0);
    setStage(0);
    setPhase('guessing');
    setGuess('');
    setWrong([]);
    setScore(0);
    setLives(LIVES);
  }

  const revealed = phase !== 'guessing';

  return (
    <div className="space-y-5">
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

      <div className="space-y-4 rounded-2xl border bg-white p-4 shadow-sm">
        <p className="text-xs text-muted-foreground">
          {revealed
            ? 'All clues revealed'
            : `Clue ${stage + 1} of ${STAGES.length}: ${STAGES[stage]} · ${MAX_POINTS - stage} points if you get it now`}
        </p>

        <div>
          <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">Learns</p>
          <ul className="grid gap-2 sm:grid-cols-2">
            {current.moves.slice(0, moveCount).map((m) => (
              <li key={m.name} className="flex items-center justify-between gap-2 rounded-lg border px-2.5 py-1.5 text-sm">
                <span className="font-medium">{m.name}</span>
                <TypeBadge type={m.type} />
              </li>
            ))}
          </ul>
        </div>

        {shown(1) && (
          <div>
            <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">Abilities</p>
            <p className="text-sm font-medium">{current.abilities.join(' · ')}</p>
          </div>
        )}

        {shown(3) && (
          <div className="flex flex-wrap items-center gap-2">
            {current.types.map((t) => (
              <TypeBadge key={t} type={t} />
            ))}
            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs">Gen {current.generation}</span>
          </div>
        )}
      </div>

      {revealed && (
        <div className="flex flex-col items-center gap-1">
          <Image src={officialArtworkUrl(current.id)} alt={current.name} width={160} height={160} unoptimized className="h-32 w-32 object-contain" />
          <p className="font-semibold">{phase === 'correct' ? `Right, it's ${current.name}!` : `It's ${current.name}!`}</p>
        </div>
      )}

      {phase === 'guessing' && (
        <div className="mx-auto max-w-sm space-y-3">
          <form
            className="flex gap-2"
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
              placeholder="Which Pokémon is this?"
              aria-label="Your guess"
              autoComplete="off"
              autoCapitalize="off"
              spellCheck={false}
              list="mm-names"
              className="h-12 min-w-0 flex-1 rounded-xl border-2 border-gray-200 bg-white px-4 text-base outline-none focus:border-blue-500"
            />
            <Button type="submit" className="h-12">
              Guess
            </Button>
          </form>
          <datalist id="mm-names">
            {names.map((n) => (
              <option key={n} value={n} />
            ))}
          </datalist>
          {wrong.length > 0 && <p className="text-center text-sm text-red-600">Not {wrong[wrong.length - 1]}. Here&apos;s another clue.</p>}
          <div className="flex justify-center">
            <Button variant="ghost" size="sm" onClick={loseLife}>
              <SkipForward className="mr-1.5 h-4 w-4" />
              Give up (−1 life)
            </Button>
          </div>
        </div>
      )}

      {(phase === 'correct' || phase === 'revealed') && (
        <div className="flex justify-center gap-2">
          <Button onClick={next}>Next Pokémon</Button>
          <Button variant="outline" asChild>
            <Link href={`/pokemon/${current.id}`}>View {current.name}</Link>
          </Button>
        </div>
      )}

      {phase === 'over' && (
        <div className="mx-auto max-w-sm space-y-3 rounded-2xl border bg-white p-5 text-center shadow-sm">
          <p className="text-2xl font-bold">Game over: {score} points</p>
          {score > 0 && score >= best && <p className="text-sm font-medium text-amber-600">New personal best!</p>}
          <Button onClick={restart}>
            <RotateCcw className="mr-1.5 h-4 w-4" />
            Play again
          </Button>
        </div>
      )}
    </div>
  );
}
