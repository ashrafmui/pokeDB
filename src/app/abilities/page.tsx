import type { Metadata } from 'next';
import BackgroundGradient from '@/components/BackgroundGradient';
import AbilitiesBrowser from '@/components/moves/AbilitiesBrowser';
import { ALL_ABILITIES, abilitySpeciesCount } from '@/lib/moves';

export const metadata: Metadata = {
  title: 'Pokémon Abilities – Effects & Which Pokémon Have Them',
  description:
    'Every Pokémon ability with its in-battle effect and the Pokémon that can have it, including hidden abilities. Search all 300+ abilities.',
  alternates: { canonical: '/abilities' },
};

export default function AbilitiesPage() {
  const rows = ALL_ABILITIES.map((a) => ({
    slug: a.slug,
    name: a.name,
    gen: a.gen,
    short: a.short,
    pokemon: abilitySpeciesCount(a.slug),
  }));

  return (
    <main className="relative min-h-screen px-4 pb-28 pt-10 sm:px-8">
      <BackgroundGradient />
      <div className="relative z-10 mx-auto max-w-6xl space-y-6">
        <div>
          <h1 className="font-pocket-monk text-4xl">Abilities</h1>
          <p className="text-muted-foreground">What each ability does and which Pokémon can have it.</p>
        </div>
        <AbilitiesBrowser rows={rows} />
      </div>
    </main>
  );
}
