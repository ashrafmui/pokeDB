import type { Metadata } from 'next';
import BackgroundGradient from '@/components/BackgroundGradient';
import Compare from '@/components/compare/Compare';
import { BATTLE_TYPES, getDexEntry, teamCandidates, toExploreRow, typeChart } from '@/lib/dex';
import { parseIds } from '@/lib/compare';

type Props = { searchParams: Promise<{ ids?: string }> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const names = parseIds((await searchParams).ids)
    .map((id) => getDexEntry(id)?.name)
    .filter(Boolean);
  if (names.length >= 2) {
    const title = `${names.join(' vs ')} – Stat & Matchup Comparison`;
    return {
      title,
      description: `Compare ${names.join(', ')} side by side: base stats with percentiles, head-to-head type matchups, weaknesses, abilities and more.`,
      // One canonical page; individual comparisons are shareable but not indexed separately.
      alternates: { canonical: '/compare' },
    };
  }
  return {
    title: 'Compare Pokémon – Side-by-Side Stats & Matchups',
    description:
      'Compare up to four Pokémon side by side: base stats and percentiles, a stat radar, head-to-head STAB matchups, type weaknesses, abilities and more.',
    alternates: { canonical: '/compare' },
  };
}

export default async function ComparePage({ searchParams }: Props) {
  const initialIds = parseIds((await searchParams).ids);
  const rows = teamCandidates().map(toExploreRow);

  return (
    <main className="relative min-h-screen px-4 py-10 sm:px-8">
      <BackgroundGradient />
      <div className="relative z-10 mx-auto max-w-6xl space-y-6">
        <div>
          <h1 className="font-pocket-monk text-4xl">Compare</h1>
          <p className="text-muted-foreground">Put up to four Pokémon side by side: stats, matchups and everything in between.</p>
        </div>
        <Compare rows={rows} chart={typeChart()} types={[...BATTLE_TYPES]} initialIds={initialIds} />
      </div>
    </main>
  );
}
