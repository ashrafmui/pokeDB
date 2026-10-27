'use client';

// Filterable, sortable list of every move. Filtering runs in the browser and
// the filters live in the URL, so any view is a shareable link.

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowDown, ArrowUp, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import TypeBadge from '@/components/TypeBadge';
import ClassBadge from '@/components/moves/ClassBadge';
import { CLASS_LABELS, FLAG_LABELS, orDash, title, type MoveClass, type MoveListRow } from '@/lib/moveData';

const PAGE = 80;
const GENERATIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9];

type SortKey = 'name' | 'type' | 'power' | 'accuracy' | 'pp' | 'priority' | 'learners' | 'gen';

interface Filters {
  q: string;
  type: string;
  cls: '' | MoveClass;
  gen: number;
  /** A flag name from FLAG_LABELS, or "priority" for moves that go first. */
  flag: string;
  sort: SortKey;
  desc: boolean;
}

const DEFAULTS: Filters = { q: '', type: '', cls: '', gen: 0, flag: '', sort: 'name', desc: false };

const SORT_LABELS: Record<SortKey, string> = {
  name: 'Name',
  type: 'Type',
  power: 'Power',
  accuracy: 'Accuracy',
  pp: 'PP',
  priority: 'Priority',
  learners: 'Learned by',
  gen: 'Generation',
};

function fromQuery(search: string): Filters {
  const p = new URLSearchParams(search);
  const sort = p.get('sort') as SortKey | null;
  const cls = p.get('class');
  return {
    q: p.get('q') ?? '',
    type: p.get('type') ?? '',
    cls: cls === 'physical' || cls === 'special' || cls === 'status' ? cls : '',
    gen: Number(p.get('gen')) || 0,
    flag: p.get('flag') ?? '',
    sort: sort && sort in SORT_LABELS ? sort : 'name',
    desc: p.get('desc') === '1',
  };
}

function toQuery(f: Filters): string {
  const p = new URLSearchParams();
  if (f.q.trim()) p.set('q', f.q.trim());
  if (f.type) p.set('type', f.type);
  if (f.cls) p.set('class', f.cls);
  if (f.gen) p.set('gen', String(f.gen));
  if (f.flag) p.set('flag', f.flag);
  if (f.sort !== 'name') p.set('sort', f.sort);
  if (f.desc) p.set('desc', '1');
  const s = p.toString();
  return s ? `?${s}` : '';
}

function matches(m: MoveListRow, f: Filters): boolean {
  if (f.q.trim() && !m.name.toLowerCase().includes(f.q.trim().toLowerCase())) return false;
  if (f.type && m.type !== f.type) return false;
  if (f.cls && m.cls !== f.cls) return false;
  if (f.gen && m.gen !== f.gen) return false;
  if (f.flag === 'priority') return m.priority > 0;
  if (f.flag && !m.flags.includes(f.flag)) return false;
  return true;
}

function sortValue(m: MoveListRow, key: SortKey): string | number {
  switch (key) {
    case 'name':
      return m.name;
    case 'type':
      return m.type;
    // Moves without a value (status moves, never-miss moves) sort last either way.
    case 'power':
    case 'accuracy':
    case 'pp':
      return m[key] ?? -1;
    default:
      return m[key];
  }
}

function applyFilters(rows: readonly MoveListRow[], f: Filters): MoveListRow[] {
  const dir = f.desc ? -1 : 1;
  return rows
    .filter((m) => matches(m, f))
    .sort((a, b) => {
      const va = sortValue(a, f.sort);
      const vb = sortValue(b, f.sort);
      const cmp = typeof va === 'string' ? va.localeCompare(vb as string) : (va as number) - (vb as number);
      return cmp * dir || a.name.localeCompare(b.name);
    });
}

const select = 'h-10 rounded-xl border bg-white px-2 text-sm';

export default function MovesBrowser({ rows, types }: { rows: MoveListRow[]; types: string[] }) {
  const [filters, setFilters] = useState<Filters>(() => fromQuery(window.location.search));
  const [shown, setShown] = useState(PAGE);

  useEffect(() => {
    window.history.replaceState(null, '', `${window.location.pathname}${toQuery(filters)}`);
  }, [filters]);

  const results = useMemo(() => applyFilters(rows, filters), [rows, filters]);
  const set = (patch: Partial<Filters>) => {
    setFilters((f) => ({ ...f, ...patch }));
    setShown(PAGE);
  };
  // Clicking the sorted column flips it; a new column starts high-to-low for numbers.
  const onSort = (k: SortKey) =>
    set(filters.sort === k ? { desc: !filters.desc } : { sort: k, desc: k !== 'name' && k !== 'type' });
  const isDefault = JSON.stringify(filters) === JSON.stringify(DEFAULTS);

  const header = (k: SortKey, className?: string) => (
    <th className={cn('px-2 py-2 font-medium', className)} aria-sort={filters.sort === k ? (filters.desc ? 'descending' : 'ascending') : 'none'}>
      <button type="button" onClick={() => onSort(k)} className={cn('inline-flex items-center gap-0.5 hover:text-foreground', filters.sort === k && 'text-blue-700')}>
        {SORT_LABELS[k]}
        {filters.sort === k && (filters.desc ? <ArrowDown className="h-3 w-3" /> : <ArrowUp className="h-3 w-3" />)}
      </button>
    </th>
  );

  const visible = results.slice(0, shown);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <input
          value={filters.q}
          onChange={(e) => set({ q: e.target.value })}
          placeholder="Search moves…"
          aria-label="Search moves"
          className="h-10 min-w-0 flex-1 basis-48 rounded-xl border-2 border-gray-200 bg-white px-3 text-sm outline-none focus:border-blue-500"
        />
        <select aria-label="Type" value={filters.type} onChange={(e) => set({ type: e.target.value })} className={select}>
          <option value="">All types</option>
          {types.map((t) => (
            <option key={t} value={t}>
              {title(t)}
            </option>
          ))}
        </select>
        <select aria-label="Category" value={filters.cls} onChange={(e) => set({ cls: e.target.value as Filters['cls'] })} className={select}>
          <option value="">All categories</option>
          {(Object.keys(CLASS_LABELS) as MoveClass[]).map((c) => (
            <option key={c} value={c}>
              {CLASS_LABELS[c]}
            </option>
          ))}
        </select>
        <select aria-label="Generation" value={filters.gen} onChange={(e) => set({ gen: Number(e.target.value) })} className={select}>
          <option value={0}>All generations</option>
          {GENERATIONS.map((g) => (
            <option key={g} value={g}>
              Introduced in Gen {g}
            </option>
          ))}
        </select>
        <select aria-label="Property" value={filters.flag} onChange={(e) => set({ flag: e.target.value })} className={select}>
          <option value="">Any property</option>
          <option value="priority">Has priority</option>
          {FLAG_LABELS.slice(0, 10).map(([flag, label]) => (
            <option key={flag} value={flag}>
              {label}
            </option>
          ))}
        </select>
        <select
          aria-label="Sort by"
          value={filters.sort}
          onChange={(e) => set({ sort: e.target.value as SortKey, desc: e.target.value !== 'name' && e.target.value !== 'type' })}
          className={cn(select, 'md:hidden')}
        >
          {(Object.keys(SORT_LABELS) as SortKey[]).map((k) => (
            <option key={k} value={k}>
              Sort: {SORT_LABELS[k]}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center justify-between text-sm">
        <p>
          <span className="font-semibold">{results.length.toLocaleString()}</span> moves
        </p>
        <Button variant="ghost" size="sm" onClick={() => set({ ...DEFAULTS })} disabled={isDefault}>
          <RotateCcw className="mr-1.5 h-4 w-4" />
          Reset
        </Button>
      </div>

      {results.length === 0 ? (
        <p className="rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground">No moves match these filters.</p>
      ) : (
        <div className="rounded-2xl border bg-white/80 px-3 backdrop-blur">
          <table className="hidden w-full text-sm md:table">
            <thead className="border-b text-xs text-muted-foreground">
              <tr>
                {header('name', 'text-left')}
                {header('type', 'text-left')}
                <th className="px-2 py-2 text-left font-medium">Category</th>
                {header('power', 'text-right')}
                {header('accuracy', 'text-right')}
                {header('pp', 'text-right')}
                {header('priority', 'text-right')}
                {header('learners', 'text-right')}
                <th className="hidden px-2 py-2 text-left font-medium xl:table-cell">Effect</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((m) => (
                <tr key={m.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="px-2 py-1.5 font-medium">
                    <Link href={`/moves/${m.slug}`} className="hover:underline">
                      {m.name}
                    </Link>
                  </td>
                  <td className="px-2 py-1.5">
                    <TypeBadge type={m.type} />
                  </td>
                  <td className="px-2 py-1.5">
                    <ClassBadge cls={m.cls} />
                  </td>
                  <td className="px-2 py-1.5 text-right tabular-nums">{orDash(m.power)}</td>
                  <td className="px-2 py-1.5 text-right tabular-nums">{orDash(m.accuracy)}</td>
                  <td className="px-2 py-1.5 text-right tabular-nums">{orDash(m.pp)}</td>
                  <td className="px-2 py-1.5 text-right tabular-nums">{m.priority > 0 ? `+${m.priority}` : m.priority}</td>
                  <td className="px-2 py-1.5 text-right tabular-nums">{m.learners || '—'}</td>
                  <td className="hidden max-w-sm px-2 py-1.5 text-xs text-muted-foreground xl:table-cell">
                    <span className="line-clamp-2">{m.effect}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <ul className="divide-y md:hidden">
            {visible.map((m) => (
              <li key={m.id}>
                <Link href={`/moves/${m.slug}`} className="block space-y-1 py-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium">{m.name}</span>
                    <span className="flex gap-1">
                      <TypeBadge type={m.type} />
                      <ClassBadge cls={m.cls} />
                    </span>
                  </div>
                  <div className="flex gap-3 text-xs text-muted-foreground tabular-nums">
                    <span>Pwr {orDash(m.power)}</span>
                    <span>Acc {orDash(m.accuracy)}</span>
                    <span>PP {orDash(m.pp)}</span>
                    {m.priority !== 0 && <span>Priority {m.priority > 0 ? `+${m.priority}` : m.priority}</span>}
                    {m.learners > 0 && <span>{m.learners} learn it</span>}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {shown < results.length && (
        <div className="flex justify-center">
          <Button variant="outline" onClick={() => setShown((s) => s + PAGE)}>
            Show more ({(results.length - shown).toLocaleString()} left)
          </Button>
        </div>
      )}
    </div>
  );
}
