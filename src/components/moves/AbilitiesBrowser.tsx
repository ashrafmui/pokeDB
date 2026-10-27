'use client';

// Searchable list of every ability. Server-rendered in full so each ability
// page is linked from the HTML; filtering then happens in the browser.

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export interface AbilityListRow {
  slug: string;
  name: string;
  gen: number;
  short: string;
  /** Species that can have it. */
  pokemon: number;
}

type SortKey = 'name' | 'pokemon' | 'gen';
const SORTS: Record<SortKey, string> = { name: 'Name', pokemon: 'Most Pokémon', gen: 'Newest first' };
const select = 'h-10 rounded-xl border bg-white px-2 text-sm';

export default function AbilitiesBrowser({ rows }: { rows: AbilityListRow[] }) {
  const [q, setQ] = useState('');
  const [gen, setGen] = useState(0);
  const [sort, setSort] = useState<SortKey>('name');

  const results = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return rows
      .filter((r) => (!gen || r.gen === gen) && (!needle || r.name.toLowerCase().includes(needle) || r.short.toLowerCase().includes(needle)))
      .sort((a, b) => {
        if (sort === 'pokemon') return b.pokemon - a.pokemon || a.name.localeCompare(b.name);
        if (sort === 'gen') return b.gen - a.gen || a.name.localeCompare(b.name);
        return a.name.localeCompare(b.name);
      });
  }, [rows, q, gen, sort]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search abilities or effects…"
          aria-label="Search abilities"
          className="h-10 min-w-0 flex-1 basis-48 rounded-xl border-2 border-gray-200 bg-white px-3 text-sm outline-none focus:border-blue-500"
        />
        <select aria-label="Generation" value={gen} onChange={(e) => setGen(Number(e.target.value))} className={select}>
          <option value={0}>All generations</option>
          {[3, 4, 5, 6, 7, 8, 9].map((g) => (
            <option key={g} value={g}>
              Introduced in Gen {g}
            </option>
          ))}
        </select>
        <select aria-label="Sort by" value={sort} onChange={(e) => setSort(e.target.value as SortKey)} className={select}>
          {(Object.keys(SORTS) as SortKey[]).map((k) => (
            <option key={k} value={k}>
              Sort: {SORTS[k]}
            </option>
          ))}
        </select>
      </div>
      <p className="text-sm">
        <span className="font-semibold">{results.length.toLocaleString()}</span> abilities
      </p>
      {results.length === 0 ? (
        <p className="rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground">No abilities match.</p>
      ) : (
        <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((a) => (
            <li key={a.slug}>
              <Link
                href={`/abilities/${a.slug}`}
                className={cn('block h-full rounded-xl border bg-white p-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md')}
              >
                <div className="flex items-baseline justify-between gap-2">
                  <span className="font-semibold">{a.name}</span>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    Gen {a.gen} · {a.pokemon} Pokémon
                  </span>
                </div>
                <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">{a.short}</p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
