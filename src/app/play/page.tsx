import type { Metadata } from 'next';
import Link from 'next/link';
import BackgroundGradient from '@/components/BackgroundGradient';

export const metadata: Metadata = {
  title: 'Play – Pokémon Games',
  description: "Pokémon games on poKeDB: guess the daily Pokémon in Pokédle, name silhouettes, guess from movesets, play Higher or Lower on stats and race the clock in Name Them All.",
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
    href: '/play/whos-that-pokemon',
    title: "Who's That Pokémon?",
    blurb: 'Name the Pokémon from its silhouette. Three lives, three hints, how long can your streak go?',
    live: true,
  },
  {
    href: '/play/higher-or-lower',
    title: 'Higher or Lower',
    blurb: 'Is the next Pokémon faster, heavier or stronger? Build the longest streak on any stat.',
    live: true,
  },
  {
    href: '/play/moveset-mystery',
    title: 'Moveset Mystery',
    blurb: 'Guess the Pokémon from the moves it learns and its abilities. Every miss reveals another clue.',
    live: true,
  },
  {
    href: '/play/name-them-all',
    title: 'Name Them All',
    blurb: 'Name every Pokémon from a generation, or all 1,025, before the timer runs out.',
    live: true,
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
