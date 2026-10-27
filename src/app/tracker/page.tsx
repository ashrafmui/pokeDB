import type { Metadata } from 'next';
import BackgroundGradient from '@/components/BackgroundGradient';
import Tracker from '@/components/tracker/TrackerLoader';
import { ALL_SPECIES } from '@/lib/dex';
import { GENERATION_REGIONS } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Pokédex Tracker – Living Dex & Caught Checklist',
  description:
    'Track every Pokémon you have caught, with progress for each generation. Your checklist is saved in your browser, no account needed, and you can export and import it to move between devices.',
  alternates: { canonical: '/tracker' },
};

export default function TrackerPage() {
  const mons = ALL_SPECIES.map((p) => ({ id: p.id, name: p.name, generation: p.generation }));

  return (
    <main className="relative min-h-screen px-4 py-10 sm:px-8">
      <BackgroundGradient />
      <div className="relative z-10 mx-auto max-w-7xl space-y-6">
        <div>
          <h1 className="font-pocket-monk text-4xl">Pokédex Tracker</h1>
          <p className="text-muted-foreground">
            Tap a Pokémon to mark it caught. Saved in this browser only; export it to back up or move to another device.
          </p>
        </div>
        <Tracker mons={mons} regions={GENERATION_REGIONS} />
      </div>
    </main>
  );
}
