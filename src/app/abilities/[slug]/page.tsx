import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import BackgroundGradient from '@/components/BackgroundGradient';
import TypeBadge from '@/components/TypeBadge';
import { spriteUrl } from '@/lib/sprites';
import { ALL_ABILITIES, abilityHolders, abilitySpeciesCount, getAbility, type AbilityHolder } from '@/lib/moves';

type Props = { params: Promise<{ slug: string }> };

// Every ability is known at build time, so each page is prerendered.
export const dynamicParams = false;
export function generateStaticParams() {
  return ALL_ABILITIES.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const a = getAbility((await params).slug);
  if (!a) return {};
  const count = abilitySpeciesCount(a.slug);
  return {
    title: `${a.name} – Pokémon Ability: Effect & Which Pokémon Have It`,
    description: `${a.short}${a.short ? ' ' : ''}${a.name} can be had by ${count} Pokémon species, including as a hidden ability.`.trim(),
    alternates: { canonical: `/abilities/${a.slug}` },
  };
}

function HolderGrid({ holders }: { holders: AbilityHolder[] }) {
  return (
    <ul className="grid gap-x-4 sm:grid-cols-2 lg:grid-cols-3">
      {holders.map(({ entry }) => (
        <li key={entry.id} className="border-b">
          <Link href={`/pokemon/${entry.id}`} className="flex items-center gap-2 py-1.5 hover:bg-gray-50">
            <Image src={spriteUrl(entry.id)} alt="" width={40} height={40} unoptimized style={{ imageRendering: 'pixelated' }} />
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium">{entry.name}</div>
              <div className="flex gap-1">
                {entry.types.map((t) => (
                  <TypeBadge key={t} type={t} className="px-1.5 text-[10px]" />
                ))}
              </div>
            </div>
            <span className="text-xs tabular-nums text-muted-foreground">BST {entry.total}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export default async function AbilityPage({ params }: Props) {
  const ability = getAbility((await params).slug);
  if (!ability) notFound();

  const holders = abilityHolders(ability.slug).sort((a, b) => a.entry.id - b.entry.id);
  // A form that has it both ways is listed once, as a regular ability.
  const regular = holders.filter((h) => !h.hidden);
  const regularIds = new Set(regular.map((h) => h.entry.id));
  const hidden = holders.filter((h) => h.hidden && !regularIds.has(h.entry.id));
  const species = abilitySpeciesCount(ability.slug);

  return (
    <main className="relative min-h-screen px-4 pb-28 pt-10 sm:px-8">
      <BackgroundGradient />
      <div className="relative z-10 mx-auto max-w-5xl space-y-6">
        <div>
          <Link href="/abilities" className="text-sm text-blue-600 hover:underline">
            ← All abilities
          </Link>
          <h1 className="mt-2 font-pocket-monk text-4xl">{ability.name}</h1>
          <p className="mt-1 text-sm text-muted-foreground">Introduced in Generation {ability.gen}</p>
        </div>

        <section className="space-y-2 rounded-2xl border bg-white/80 p-4 shadow-sm backdrop-blur sm:p-6">
          {ability.short && <p className="text-lg font-medium">{ability.short}</p>}
          {ability.effect && ability.effect !== ability.short && <p className="text-muted-foreground">{ability.effect}</p>}
          {!ability.short && !ability.effect && <p className="text-muted-foreground">No description available yet.</p>}
        </section>

        <section className="space-y-4 rounded-2xl border bg-white/80 p-4 shadow-sm backdrop-blur sm:p-6">
          <div>
            <h2 className="text-lg font-semibold">Pokémon with {ability.name}</h2>
            <p className="text-sm text-muted-foreground">
              {species} species can have it
              {hidden.length > 0 && regular.length > 0 ? ', some only as a hidden ability' : ''}.
            </p>
          </div>
          {regular.length > 0 && (
            <div className="space-y-1">
              <h3 className="text-sm font-semibold">Regular ability ({regular.length})</h3>
              <HolderGrid holders={regular} />
            </div>
          )}
          {hidden.length > 0 && (
            <div className="space-y-1">
              <h3 className="text-sm font-semibold">Hidden ability ({hidden.length})</h3>
              <HolderGrid holders={hidden} />
            </div>
          )}
          <Link href={`/explore?ability=${encodeURIComponent(ability.name)}`} className="inline-block text-sm text-blue-600 hover:underline">
            Filter these Pokémon by stats and types in Explore →
          </Link>
        </section>
      </div>
    </main>
  );
}
