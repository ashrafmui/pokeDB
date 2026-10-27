import type { Metadata } from 'next';
import Link from 'next/link';
import BackgroundGradient from '@/components/BackgroundGradient';
import Explore from '@/components/explore/ExploreLoader';
import { BATTLE_TYPES, teamCandidates, toExploreRow } from '@/lib/dex';
import { ALL_MOVES } from '@/lib/moves';

export const metadata: Metadata = {
  title: 'Explore Pokémon – Filter by Type, Stats, Abilities & More',
  description:
    'Filter and sort every Pokémon by type, generation, base stats, abilities, moves they learn, weaknesses, resistances, egg group and more. Find the fastest Fire types, the bulkiest walls, Trick Room attackers and share any view as a link.',
  alternates: { canonical: '/explore' },
};

export default function ExplorePage() {
  // Same pool as the team builder: species plus forms that play differently.
  const rows = teamCandidates().map(toExploreRow);
  const moves = ALL_MOVES.map(({ slug, name }) => ({ slug, name }));

  return (
    <main className="relative min-h-screen px-4 py-10 sm:px-8">
      <BackgroundGradient />
      <div className="relative z-10 mx-auto max-w-7xl space-y-6">
        <div>
          <h1 className="font-pocket-monk text-4xl">Explore</h1>
          <p className="text-muted-foreground">
            Filter and sort every Pokémon by type, stats, abilities, matchups and more. Every view is a shareable link.
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Also browse all <Link href="/moves" className="underline">moves</Link> and{' '}
            <Link href="/abilities" className="underline">abilities</Link>.
          </p>
        </div>
        <Explore rows={rows} types={[...BATTLE_TYPES]} moves={moves} />
      </div>
    </main>
  );
}
