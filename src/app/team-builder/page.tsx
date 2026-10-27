import type { Metadata } from 'next';
import BackgroundGradient from '@/components/BackgroundGradient';
import TeamBuilder from '@/components/team-builder/TeamBuilderLoader';
import { BATTLE_TYPES, teamCandidates, toTeamMon, typeChart } from '@/lib/dex';

type Props = { searchParams: Promise<{ team?: string }> };

const DESCRIPTION =
  'Build a team of six Pokémon and see its shared weaknesses, resistances, immunities and STAB type coverage. Get suggestions to fill the gaps, share your team by link and export it to Pokémon Showdown.';

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const team = (await searchParams).team;
  const base: Metadata = {
    title: 'Pokémon Team Builder – Weakness & Type Coverage Checker',
    description: DESCRIPTION,
    alternates: { canonical: '/team-builder' },
  };
  if (!team) return base;
  // A shared team gets a preview image of its six Pokémon.
  const image = `/og/team?team=${encodeURIComponent(team)}`;
  return {
    ...base,
    openGraph: { title: 'Check out my Pokémon team', description: DESCRIPTION, images: [{ url: image, width: 1200, height: 630 }] },
    twitter: { card: 'summary_large_image', title: 'Check out my Pokémon team', description: DESCRIPTION, images: [image] },
  };
}

export default function TeamBuilderPage() {
  const pool = teamCandidates().map(toTeamMon);

  return (
    <main className="relative min-h-screen px-4 py-10 sm:px-8">
      <BackgroundGradient />
      <div className="relative z-10 mx-auto max-w-6xl space-y-6">
        <div>
          <h1 className="font-pocket-monk text-4xl">Team Builder</h1>
          <p className="text-muted-foreground">
            Pick six Pokémon and see where your team is weak, what it resists and which types it can&apos;t hit.
          </p>
        </div>
        <TeamBuilder pool={pool} chart={typeChart()} types={[...BATTLE_TYPES]} />
      </div>
    </main>
  );
}
