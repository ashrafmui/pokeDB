import type { Metadata } from 'next';
import Link from 'next/link';
import BackgroundGradient from '@/components/BackgroundGradient';
import { WhosThatPokemon } from '@/components/games/GameLoaders';
import { ALL_SPECIES, toGameMon } from '@/lib/dex';

export const metadata: Metadata = {
  title: "Who's That Pokémon? – Silhouette Quiz",
  description:
    "Name the Pokémon from its silhouette. Pick any generations, use hints for the generation, types and first letter, and see how long a streak you can build with three lives.",
  alternates: { canonical: '/play/whos-that-pokemon' },
};

export default function WhosThatPokemonPage() {
  const pool = ALL_SPECIES.map(toGameMon);

  return (
    <main className="relative min-h-screen px-4 py-10 sm:px-8">
      <BackgroundGradient />
      <div className="relative z-10 mx-auto max-w-2xl space-y-6">
        <div>
          <Link href="/play" className="text-sm text-blue-600 hover:underline">
            ← All games
          </Link>
          <h1 className="mt-2 font-pocket-monk text-4xl">Who&apos;s That Pokémon?</h1>
          <p className="text-muted-foreground">Name the Pokémon from its silhouette. You have three lives.</p>
        </div>
        <WhosThatPokemon pool={pool} />
      </div>
    </main>
  );
}
