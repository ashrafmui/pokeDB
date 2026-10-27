import type { Metadata } from 'next';
import Link from 'next/link';
import BackgroundGradient from '@/components/BackgroundGradient';
import { MovesetMystery } from '@/components/games/GameLoaders';
import { moveClues } from '@/lib/moves';

export const metadata: Metadata = {
  title: 'Moveset Mystery – Guess the Pokémon from Its Moves',
  description:
    'Guess the Pokémon from the moves it learns and its abilities. Every wrong guess reveals another clue, and the fewer clues you need, the more points you score.',
  alternates: { canonical: '/play/moveset-mystery' },
};

export default function MovesetMysteryPage() {
  return (
    <main className="relative min-h-screen px-4 py-10 sm:px-8">
      <BackgroundGradient />
      <div className="relative z-10 mx-auto max-w-2xl space-y-6">
        <div>
          <Link href="/play" className="text-sm text-blue-600 hover:underline">
            ← All games
          </Link>
          <h1 className="mt-2 font-pocket-monk text-4xl">Moveset Mystery</h1>
          <p className="text-muted-foreground">Guess the Pokémon from its moves and abilities. Each miss reveals another clue.</p>
        </div>
        <MovesetMystery pool={moveClues()} />
      </div>
    </main>
  );
}
