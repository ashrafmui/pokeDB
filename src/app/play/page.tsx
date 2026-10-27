import type { Metadata } from 'next';
import Link from 'next/link';
import BackgroundGradient from '@/components/BackgroundGradient';

export const metadata: Metadata = {
  title: 'Play – Pokémon Games',
  description: 'Pokémon games on poKeDB: guess the daily Pokémon in Pokédle, with more games on the way.',
  alternates: { canonical: '/play' },
};

const GAMES = [
  {
    href: '/play/pokedle',
    title: 'Pokédle',
    blurb: 'Guess the daily Pokémon in 8 tries from type, generation, colour, stage, height and weight clues.',
    live: true,
  },
  {
    href: null,
    title: "Who's That Pokémon?",
    blurb: 'Name the Pokémon from its silhouette.',
    live: false,
  },
  {
    href: null,
    title: 'Name Them All',
    blurb: 'How many Pokémon from a generation can you name in 60 seconds?',
    live: false,
  },
];

export default function PlayPage() {
  return (
    <main className="relative min-h-screen px-4 py-10 sm:px-8">
      <BackgroundGradient />
      <div className="relative z-10 mx-auto max-w-4xl space-y-6">
        <h1 className="font-pocket-monk text-4xl">Play</h1>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {GAMES.map((g) => {
            const card = (
              <div className={`h-full rounded-2xl border bg-white p-5 shadow-sm transition ${g.live ? 'hover:-translate-y-0.5 hover:shadow-lg' : 'opacity-60'}`}>
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-lg font-semibold">{g.title}</h2>
                  {!g.live && <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-muted-foreground">Soon</span>}
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{g.blurb}</p>
              </div>
            );
            return g.href ? (
              <Link key={g.title} href={g.href}>
                {card}
              </Link>
            ) : (
              <div key={g.title}>{card}</div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
