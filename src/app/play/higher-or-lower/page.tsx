import type { Metadata } from 'next';
import Link from 'next/link';
import BackgroundGradient from '@/components/BackgroundGradient';
import { HigherOrLower } from '@/components/games/GameLoaders';
import { ALL_SPECIES } from '@/lib/dex';
import type { HLMon } from '@/lib/higherLower';

export const metadata: Metadata = {
  title: 'Higher or Lower – Pokémon Stats Game',
  description:
    'Is the next Pokémon faster, stronger, taller or heavier? Guess higher or lower on base stats, height, weight, catch rate and more, and see how long a streak you can build.',
  alternates: { canonical: '/play/higher-or-lower' },
};

export default function HigherOrLowerPage() {
  // Order must match METRICS in src/lib/higherLower.ts.
  const pool: HLMon[] = ALL_SPECIES.map((p) => ({
    id: p.id,
    name: p.name,
    values: [
      p.total,
      p.stats.hp,
      p.stats.attack,
      p.stats.defense,
      p.stats.specialAttack,
      p.stats.specialDefense,
      p.stats.speed,
      p.heightM,
      p.weightKg,
      p.captureRate,
      p.moveCounts.total,
    ],
  }));

  return (
    <main className="relative min-h-screen px-4 py-10 sm:px-8">
      <BackgroundGradient />
      <div className="relative z-10 mx-auto max-w-2xl space-y-6">
        <div>
          <Link href="/play" className="text-sm text-blue-600 hover:underline">
            ← All games
          </Link>
          <h1 className="mt-2 font-pocket-monk text-4xl">Higher or Lower</h1>
          <p className="text-muted-foreground">Compare Pokémon stats. One wrong answer ends your streak.</p>
        </div>
        <HigherOrLower pool={pool} />
      </div>
    </main>
  );
}
