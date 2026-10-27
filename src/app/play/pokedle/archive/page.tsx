import type { Metadata } from 'next';
import Link from 'next/link';
import BackgroundGradient from '@/components/BackgroundGradient';
import PokedleArchive from '@/components/pokedle/PokedleArchiveLoader';

export const metadata: Metadata = {
  title: 'Pokédle Archive – Play Past Puzzles',
  description: 'Missed a day? Replay any earlier daily Pokédle puzzle and see how you did on each one.',
  alternates: { canonical: '/play/pokedle/archive' },
};

export default function PokedleArchivePage() {
  return (
    <main className="relative min-h-screen px-4 py-10 sm:px-8">
      <BackgroundGradient />
      <div className="relative z-10 mx-auto max-w-4xl space-y-6">
        <div>
          <Link href="/play/pokedle" className="text-sm text-blue-600 hover:underline">
            ← Today&apos;s Pokédle
          </Link>
          <h1 className="mt-2 font-pocket-monk text-4xl">Pokédle Archive</h1>
          <p className="text-muted-foreground">Replay any earlier daily puzzle.</p>
        </div>
        <PokedleArchive />
      </div>
    </main>
  );
}
