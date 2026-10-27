import type { Metadata } from 'next';
import Link from 'next/link';
import BackgroundGradient from '@/components/BackgroundGradient';
import Pokedle from '@/components/pokedle/PokedleLoader';
import { ALL_SPECIES, toLite } from '@/lib/dex';
import { SITE_URL } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Pokédle – Daily Pokémon Guessing Game',
  description:
    'Guess the daily Pokémon in 8 tries. Every guess reveals clues about its types, generation, colour, evolution stage, height and weight. Share your score and keep your streak going.',
  alternates: { canonical: '/play/pokedle' },
};

export default function PokedlePage() {
  // Only what the game needs (~100 KB), not the full dataset.
  const pool = ALL_SPECIES.map(toLite);

  return (
    <main className="relative min-h-screen px-4 py-10 sm:px-8">
      <BackgroundGradient />
      <div className="relative z-10 mx-auto max-w-4xl space-y-6">
        <div>
          <Link href="/play" className="text-sm text-blue-600 hover:underline">
            ← All games
          </Link>
          <h1 className="mt-2 font-pocket-monk text-4xl">Pokédle</h1>
          <p className="text-muted-foreground">Guess today&apos;s Pokémon. Every guess gives you clues.</p>
        </div>
        <Pokedle pool={pool} siteUrl={SITE_URL} />
      </div>
    </main>
  );
}
