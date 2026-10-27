import type { Metadata } from 'next';
import BackgroundGradient from '@/components/BackgroundGradient';
import MovesBrowser from '@/components/moves/MovesBrowserLoader';
import { BATTLE_TYPES } from '@/lib/dex';
import { moveListRows } from '@/lib/moves';

export const metadata: Metadata = {
  title: 'Pokémon Moves – Power, Accuracy, PP & Who Learns Them',
  description:
    'Every Pokémon move with its type, category, power, accuracy, PP, priority and effect. Filter and sort all 919 moves and see which Pokémon learn each one.',
  alternates: { canonical: '/moves' },
};

export default function MovesPage() {
  const rows = moveListRows();

  return (
    <main className="relative min-h-screen px-4 pb-28 pt-10 sm:px-8">
      <BackgroundGradient />
      <div className="relative z-10 mx-auto max-w-6xl space-y-6">
        <div>
          <h1 className="font-pocket-monk text-4xl">Moves</h1>
          <p className="text-muted-foreground">
            Every move with its stats, effect and the Pokémon that learn it. Every view is a shareable link.
          </p>
        </div>
        <MovesBrowser rows={rows} types={[...BATTLE_TYPES]} />
      </div>
    </main>
  );
}
