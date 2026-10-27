import type { Metadata } from 'next';
import Link from 'next/link';
import BackgroundGradient from '@/components/BackgroundGradient';

// Placeholder until the feature ships; kept out of search results and the sitemap.
export const metadata: Metadata = {
  title: 'Explore',
  robots: { index: false },
};

export default function Page() {
  return (
    <main className="relative min-h-screen px-4 py-10 sm:px-8">
      <BackgroundGradient />
      <div className="relative z-10 mx-auto max-w-4xl space-y-3">
        <h1 className="font-pocket-monk text-4xl">Explore</h1>
        <p className="text-muted-foreground">Filter every Pokémon by type, generation, stats, abilities and more, e.g. the fastest Fire types or every Steel type with Levitate.</p>
        <p className="text-sm">
          Coming soon. In the meantime, try today&apos;s{' '}
          <Link href="/play/pokedle" className="text-blue-600 hover:underline">
            Pokédle
          </Link>
          .
        </p>
      </div>
    </main>
  );
}
