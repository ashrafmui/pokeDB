import type { Metadata } from 'next';
import Link from 'next/link';
import BackgroundGradient from '@/components/BackgroundGradient';
import { NameThemAll } from '@/components/games/GameLoaders';
import { ALL_SPECIES, toGameMon } from '@/lib/dex';

export const metadata: Metadata = {
  title: 'Name Them All – Pokémon Naming Quiz',
  description:
    'How many Pokémon can you name against the clock? Pick a generation (or all 1,025), choose a time limit and type every Pokémon you can remember.',
  alternates: { canonical: '/play/name-them-all' },
};

export default function NameThemAllPage() {
  const pool = ALL_SPECIES.map(toGameMon);

  return (
    <main className="relative min-h-screen px-4 py-10 sm:px-8">
      <BackgroundGradient />
      <div className="relative z-10 mx-auto max-w-6xl space-y-6">
        <div>
          <Link href="/play" className="text-sm text-blue-600 hover:underline">
            ← All games
          </Link>
          <h1 className="mt-2 font-pocket-monk text-4xl">Name Them All</h1>
          <p className="text-muted-foreground">Type every Pokémon you can remember before time runs out. Names count the moment they&apos;re spelled right.</p>
        </div>
        <NameThemAll pool={pool} />
      </div>
    </main>
  );
}
