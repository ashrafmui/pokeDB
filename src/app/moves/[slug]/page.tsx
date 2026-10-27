import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import BackgroundGradient from '@/components/BackgroundGradient';
import TypeBadge from '@/components/TypeBadge';
import ClassBadge from '@/components/moves/ClassBadge';
import MoveLearners from '@/components/moves/MoveLearners';
import { BATTLE_TYPES } from '@/lib/dex';
import { ALL_MOVES, getMove, learnerCounts, learnerRows } from '@/lib/moves';
import { CLASS_LABELS, FLAG_LABELS, orDash, targetLabel, type MoveRow } from '@/lib/moveData';

type Props = { params: Promise<{ slug: string }> };

// Every move is known at build time, so each page is prerendered.
export const dynamicParams = false;
export function generateStaticParams() {
  return ALL_MOVES.map((m) => ({ slug: m.slug }));
}

const title = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

function description(m: MoveRow, learners: number): string {
  const stats = [
    m.power != null && `${m.power} power`,
    m.accuracy != null && `${m.accuracy}% accuracy`,
    m.pp != null && `${m.pp} PP`,
  ].filter(Boolean);
  const head = `${m.name} is a ${title(m.type)}-type ${CLASS_LABELS[m.cls].toLowerCase()} move${stats.length ? ` with ${stats.join(', ')}` : ''}.`;
  const tail = learners ? ` Learned by ${learners} Pokémon in current games.` : '';
  return `${head} ${m.effect}${tail}`.trim();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const m = getMove((await params).slug);
  if (!m) return {};
  return {
    title: `${m.name} – Pokémon Move: Power, Accuracy & Who Learns It`,
    description: description(m, learnerCounts(m.id).current),
    alternates: { canonical: `/moves/${m.slug}` },
  };
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border bg-white px-3 py-2 text-center">
      <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="text-lg font-semibold tabular-nums">{value}</div>
    </div>
  );
}

export default async function MovePage({ params }: Props) {
  const move = getMove((await params).slug);
  if (!move) notFound();

  const learners = learnerRows(move.id);
  const counts = learnerCounts(move.id);
  const flags = FLAG_LABELS.filter(([f]) => move.flags.includes(f));
  const target = targetLabel(move.target);
  // Nearby moves of the same type and category, for exploring and internal links.
  const similar = ALL_MOVES.filter((m) => m.id !== move.id && m.type === move.type && m.cls === move.cls)
    .sort((a, b) => Math.abs((a.power ?? 0) - (move.power ?? 0)) - Math.abs((b.power ?? 0) - (move.power ?? 0)) || a.name.localeCompare(b.name))
    .slice(0, 8);

  return (
    <main className="relative min-h-screen px-4 pb-28 pt-10 sm:px-8">
      <BackgroundGradient />
      <div className="relative z-10 mx-auto max-w-5xl space-y-6">
        <div>
          <Link href="/moves" className="text-sm text-blue-600 hover:underline">
            ← All moves
          </Link>
          <h1 className="mt-2 font-pocket-monk text-4xl">{move.name}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <TypeBadge type={move.type} />
            <ClassBadge cls={move.cls} />
            <span className="text-sm text-muted-foreground">Introduced in Generation {move.gen}</span>
          </div>
        </div>

        <section className="space-y-4 rounded-2xl border bg-white/80 p-4 shadow-sm backdrop-blur sm:p-6">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Stat label="Power" value={orDash(move.power)} />
            <Stat label="Accuracy" value={move.accuracy == null ? 'Never misses' : `${move.accuracy}%`} />
            <Stat label="PP" value={orDash(move.pp)} />
            <Stat label="Priority" value={move.priority > 0 ? `+${move.priority}` : String(move.priority)} />
          </div>
          <p>{move.effect || 'No description available yet.'}</p>
          <dl className="grid gap-x-6 gap-y-1 text-sm sm:grid-cols-2">
            {move.chance != null && (
              <div className="flex justify-between gap-2 border-b py-1">
                <dt className="text-muted-foreground">Effect chance</dt>
                <dd className="font-medium">{move.chance}%</dd>
              </div>
            )}
            {target && (
              <div className="flex justify-between gap-2 border-b py-1">
                <dt className="text-muted-foreground">Targets</dt>
                <dd className="font-medium">{target}</dd>
              </div>
            )}
          </dl>
          {flags.length > 0 && (
            <ul className="flex flex-wrap gap-1.5">
              {flags.map(([f, label]) => (
                <li key={f} className="rounded-full border bg-white px-2.5 py-1 text-xs">
                  {label}
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="space-y-3 rounded-2xl border bg-white/80 p-4 shadow-sm backdrop-blur sm:p-6">
          <div>
            <h2 className="text-lg font-semibold">Pokémon that learn {move.name}</h2>
            <p className="text-sm text-muted-foreground">
              {counts.all === 0
                ? 'No Pokémon learn this move.'
                : `${counts.current} species can learn it in the current games (Gen 9), and ${counts.all} across all games. Includes level-up, egg, tutor and TM/HM.`}
            </p>
          </div>
          <MoveLearners learners={learners} types={[...BATTLE_TYPES]} />
          {learners.length > 0 && (
            <Link href={`/explore?learns=${move.slug}`} className="inline-block text-sm text-blue-600 hover:underline">
              Filter these Pokémon by stats and types in Explore →
            </Link>
          )}
        </section>

        {similar.length > 0 && (
          <section className="space-y-2">
            <h2 className="text-lg font-semibold">Similar moves</h2>
            <ul className="flex flex-wrap gap-1.5">
              {similar.map((m) => (
                <li key={m.id}>
                  <Link
                    href={`/moves/${m.slug}`}
                    className="inline-flex items-center gap-1.5 rounded-full border bg-white px-3 py-1 text-sm hover:border-blue-500 hover:text-blue-700"
                  >
                    {m.name}
                    {m.power != null && <span className="text-xs text-muted-foreground">{m.power}</span>}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </main>
  );
}
