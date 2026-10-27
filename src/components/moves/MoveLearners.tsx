'use client';

// Table of Pokémon that learn a move, with filters for how they learn it and
// whether they still can in current games. Server-rendered with the default
// filters so the list is in the page HTML.

import { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { spriteUrl } from '@/lib/sprites';
import TypeBadge from '@/components/TypeBadge';
import { CURRENT_GEN, LEARN_METHODS, title, type LearnerRow } from '@/lib/moveData';

const PAGE = 60;

type SortKey = 'id' | 'name' | 'total' | 'speed';
const SORTS: Record<SortKey, string> = { id: 'Dex number', name: 'Name', total: 'Base stat total', speed: 'Speed' };

const select = 'h-9 rounded-lg border bg-white px-2 text-sm';

export default function MoveLearners({ learners, types }: { learners: LearnerRow[]; types: string[] }) {
  const [method, setMethod] = useState(0);
  const [current, setCurrent] = useState(true);
  const [type, setType] = useState('');
  const [finalOnly, setFinalOnly] = useState(false);
  const [speciesOnly, setSpeciesOnly] = useState(false);
  const [sort, setSort] = useState<SortKey>('id');
  const [shown, setShown] = useState(PAGE);

  const rows = useMemo(() => {
    const out = learners.filter(
      (l) =>
        (!method || (l.methods & method) !== 0) &&
        (!current || l.lastGen >= CURRENT_GEN) &&
        (!type || l.types.includes(type)) &&
        (!finalOnly || l.fullyEvolved) &&
        (!speciesOnly || l.isDefault)
    );
    return out.sort((a, b) => {
      if (sort === 'name') return a.name.localeCompare(b.name);
      if (sort === 'id') return a.id - b.id;
      return b[sort] - a[sort] || a.id - b.id;
    });
  }, [learners, method, current, type, finalOnly, speciesOnly, sort]);

  const reset = (fn: () => void) => {
    fn();
    setShown(PAGE);
  };

  if (learners.length === 0) {
    return <p className="text-sm text-muted-foreground">No Pokémon learn this move through level-up, eggs, tutors or TMs.</p>;
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <select aria-label="How it's learned" value={method} onChange={(e) => reset(() => setMethod(Number(e.target.value)))} className={select}>
          <option value={0}>Any method</option>
          {LEARN_METHODS.map((m) => (
            <option key={m.bit} value={m.bit}>
              {m.label}
            </option>
          ))}
        </select>
        <select aria-label="Type" value={type} onChange={(e) => reset(() => setType(e.target.value))} className={select}>
          <option value="">Any type</option>
          {types.map((t) => (
            <option key={t} value={t}>
              {title(t)}
            </option>
          ))}
        </select>
        <select aria-label="Sort by" value={sort} onChange={(e) => reset(() => setSort(e.target.value as SortKey))} className={select}>
          {(Object.keys(SORTS) as SortKey[]).map((k) => (
            <option key={k} value={k}>
              Sort: {SORTS[k]}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
        <label className="flex items-center gap-1.5">
          <input type="checkbox" checked={current} onChange={(e) => reset(() => setCurrent(e.target.checked))} />
          Current games only (Gen {CURRENT_GEN})
        </label>
        <label className="flex items-center gap-1.5">
          <input type="checkbox" checked={finalOnly} onChange={(e) => reset(() => setFinalOnly(e.target.checked))} />
          Fully evolved only
        </label>
        <label className="flex items-center gap-1.5">
          <input type="checkbox" checked={speciesOnly} onChange={(e) => reset(() => setSpeciesOnly(e.target.checked))} />
          Hide alternate forms
        </label>
      </div>

      <p className="text-sm">
        <span className="font-semibold">{rows.length.toLocaleString()}</span> Pokémon
      </p>

      {rows.length === 0 ? (
        <p className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">No Pokémon match these filters.</p>
      ) : (
        <ul className="grid gap-x-4 sm:grid-cols-2 lg:grid-cols-3">
          {rows.slice(0, shown).map((l) => (
            <li key={l.id} className="border-b">
              <Link href={`/pokemon/${l.id}`} className="flex items-center gap-2 py-1.5 hover:bg-gray-50">
                <Image src={spriteUrl(l.id)} alt="" width={40} height={40} unoptimized style={{ imageRendering: 'pixelated' }} />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{l.name}</div>
                  <div className="flex flex-wrap items-center gap-1">
                    {l.types.map((t) => (
                      <TypeBadge key={t} type={t} className="px-1.5 text-[10px]" />
                    ))}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-0.5 text-[10px] text-muted-foreground">
                  <span className="flex gap-1">
                    {LEARN_METHODS.filter((m) => l.methods & m.bit).map((m) => (
                      <span key={m.bit} className="rounded bg-gray-100 px-1 py-0.5 font-medium text-gray-700">
                        {m.label}
                      </span>
                    ))}
                  </span>
                  <span className={cn(l.lastGen < CURRENT_GEN && 'text-amber-700')}>
                    {sort === 'total' ? `BST ${l.total}` : sort === 'speed' ? `Speed ${l.speed}` : l.lastGen < CURRENT_GEN ? `up to Gen ${l.lastGen}` : ''}
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {shown < rows.length && (
        <div className="flex justify-center">
          <Button variant="outline" onClick={() => setShown((s) => s + PAGE)}>
            Show more ({(rows.length - shown).toLocaleString()} left)
          </Button>
        </div>
      )}
    </div>
  );
}
