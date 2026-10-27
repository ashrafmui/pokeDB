'use client';

// Filterable, sortable table of every Pokémon. All filtering runs in the
// browser over a compact projection of the dex dataset, and the filters live in
// the URL so any view can be shared ("fastest Fire types" is one link).

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowDown, ArrowUp, Check, Link2, RotateCcw, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { spriteUrl } from '@/lib/sprites';
import { getTypeBadgeColors } from '@/lib/typeColors';
import {
  CATEGORY_LABELS,
  DEFAULT_FILTERS,
  PRESETS,
  SORT_LABELS,
  STAT_NAMES,
  STAT_SORT_KEYS,
  activeFilterCount,
  applyFilters,
  fromQuery,
  sortValue,
  toQuery,
  type Category,
  type ExploreRow,
  type Filters,
  type SortKey,
} from '@/lib/explore';

const PAGE = 60;
const GENERATIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9];
const title = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

const EGG_GROUP_LABELS: Record<string, string> = {
  monster: 'Monster',
  water1: 'Water 1',
  water2: 'Water 2',
  water3: 'Water 3',
  bug: 'Bug',
  flying: 'Flying',
  ground: 'Field',
  fairy: 'Fairy',
  plant: 'Grass',
  humanshape: 'Human-Like',
  mineral: 'Mineral',
  indeterminate: 'Amorphous',
  dragon: 'Dragon',
  ditto: 'Ditto',
  'no-eggs': 'Undiscovered',
};

/** Extra column shown when sorting by something that isn't already visible. */
const EXTRA_COLUMN: Partial<Record<SortKey, (r: ExploreRow) => string>> = {
  height: (r) => `${r.heightM} m`,
  weight: (r) => `${r.weightKg} kg`,
  capture: (r) => String(r.captureRate),
  moves: (r) => String(r.moves),
};

function TypeBadge({ type }: { type: string }) {
  const { bg, text } = getTypeBadgeColors(type);
  return (
    <span className="inline-block rounded-full px-1.5 py-0.5 text-[10px] font-semibold" style={{ backgroundColor: bg, color: text }}>
      {title(type)}
    </span>
  );
}

function Chip({ active, onClick, children, style }: { active: boolean; onClick: () => void; children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      style={style}
      className={cn(
        'rounded-full border px-2.5 py-1 text-xs font-medium transition',
        active ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-200 bg-white hover:border-gray-400'
      )}
    >
      {children}
    </button>
  );
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <fieldset className="space-y-2">
      <legend className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</legend>
      {children}
    </fieldset>
  );
}

const selectClass = 'h-9 w-full rounded-lg border bg-white px-2 text-sm';

function TypeSelect({ label, value, onChange, types }: { label: string; value: string; onChange: (v: string) => void; types: readonly string[] }) {
  return (
    <label className="block space-y-1 text-xs">
      <span className="text-muted-foreground">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className={selectClass}>
        <option value="">Any</option>
        {types.map((t) => (
          <option key={t} value={t}>
            {title(t)}
          </option>
        ))}
      </select>
    </label>
  );
}

function toggle<T>(list: T[], item: T): T[] {
  return list.includes(item) ? list.filter((x) => x !== item) : [...list, item];
}

function FilterPanel({
  filters,
  set,
  types,
  abilities,
  eggGroups,
  colors,
}: {
  filters: Filters;
  set: (patch: Partial<Filters>) => void;
  types: readonly string[];
  abilities: string[];
  eggGroups: string[];
  colors: string[];
}) {
  const setRange = (which: 'min' | 'max', i: number, raw: string) => {
    const next = [...filters[which]];
    next[i] = raw === '' ? null : Math.max(0, Number(raw));
    set({ [which]: next });
  };

  return (
    <div className="space-y-5">
      <FilterGroup label="Type">
        <div className="flex flex-wrap gap-1.5">
          {types.map((t) => {
            const active = filters.types.includes(t);
            const { bg, text } = getTypeBadgeColors(t);
            return (
              <Chip
                key={t}
                active={active}
                onClick={() => set({ types: toggle(filters.types, t) })}
                style={active ? { backgroundColor: bg, borderColor: bg, color: text } : undefined}
              >
                {title(t)}
              </Chip>
            );
          })}
        </div>
        {filters.types.length > 1 && (
          <div className="flex gap-3 text-xs">
            {(['any', 'all'] as const).map((mode) => (
              <label key={mode} className="flex items-center gap-1">
                <input type="radio" name="typeMode" checked={filters.typeMode === mode} onChange={() => set({ typeMode: mode })} />
                {mode === 'any' ? 'Any of these' : 'All of these (dual types)'}
              </label>
            ))}
          </div>
        )}
      </FilterGroup>

      <FilterGroup label="Generation">
        <div className="flex flex-wrap gap-1.5">
          {GENERATIONS.map((g) => (
            <Chip key={g} active={filters.gens.includes(g)} onClick={() => set({ gens: toggle(filters.gens, g) })}>
              {g}
            </Chip>
          ))}
        </div>
      </FilterGroup>

      <FilterGroup label="Category">
        <div className="flex flex-wrap gap-1.5">
          {(Object.keys(CATEGORY_LABELS) as Category[]).map((c) => (
            <Chip key={c} active={filters.categories.includes(c)} onClick={() => set({ categories: toggle(filters.categories, c) })}>
              {CATEGORY_LABELS[c]}
            </Chip>
          ))}
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={filters.forms} onChange={(e) => set({ forms: e.target.checked })} />
          Include alternate forms (Megas, regional forms…)
        </label>
      </FilterGroup>

      <FilterGroup label="Base stats">
        <div className="space-y-1.5">
          {[...STAT_NAMES, 'Total'].map((name, i) => (
            <div key={name} className="grid grid-cols-[44px_1fr_12px_1fr] items-center gap-1.5 text-xs">
              <span className="font-medium text-muted-foreground">{name}</span>
              <input
                type="number"
                inputMode="numeric"
                min={0}
                placeholder="min"
                aria-label={`Minimum ${name}`}
                value={filters.min[i] ?? ''}
                onChange={(e) => setRange('min', i, e.target.value)}
                className="h-8 w-full min-w-0 rounded-md border px-2"
              />
              <span className="text-center text-muted-foreground">–</span>
              <input
                type="number"
                inputMode="numeric"
                min={0}
                placeholder="max"
                aria-label={`Maximum ${name}`}
                value={filters.max[i] ?? ''}
                onChange={(e) => setRange('max', i, e.target.value)}
                className="h-8 w-full min-w-0 rounded-md border px-2"
              />
            </div>
          ))}
        </div>
      </FilterGroup>

      <FilterGroup label="Matchups">
        <div className="grid grid-cols-3 gap-2 lg:grid-cols-1">
          <TypeSelect label="Weak to" value={filters.weakTo} onChange={(v) => set({ weakTo: v })} types={types} />
          <TypeSelect label="Resists" value={filters.resists} onChange={(v) => set({ resists: v })} types={types} />
          <TypeSelect label="Immune to" value={filters.immuneTo} onChange={(v) => set({ immuneTo: v })} types={types} />
        </div>
      </FilterGroup>

      <FilterGroup label="More">
        <label className="block space-y-1 text-xs">
          <span className="text-muted-foreground">Ability</span>
          <input
            list="explore-abilities"
            value={filters.ability}
            onChange={(e) => set({ ability: e.target.value })}
            placeholder="e.g. Levitate"
            className={selectClass}
          />
          <datalist id="explore-abilities">
            {abilities.map((a) => (
              <option key={a} value={a} />
            ))}
          </datalist>
        </label>
        <div className="grid grid-cols-2 gap-2">
          <label className="block space-y-1 text-xs">
            <span className="text-muted-foreground">Egg group</span>
            <select value={filters.eggGroup} onChange={(e) => set({ eggGroup: e.target.value })} className={selectClass}>
              <option value="">Any</option>
              {eggGroups.map((g) => (
                <option key={g} value={g}>
                  {EGG_GROUP_LABELS[g] ?? title(g)}
                </option>
              ))}
            </select>
          </label>
          <label className="block space-y-1 text-xs">
            <span className="text-muted-foreground">Colour</span>
            <select value={filters.color} onChange={(e) => set({ color: e.target.value })} className={selectClass}>
              <option value="">Any</option>
              {colors.map((c) => (
                <option key={c} value={c}>
                  {title(c)}
                </option>
              ))}
            </select>
          </label>
        </div>
      </FilterGroup>
    </div>
  );
}

function SortHeader({ k, label, filters, onSort, className }: { k: SortKey; label: string; filters: Filters; onSort: (k: SortKey) => void; className?: string }) {
  const active = filters.sort === k;
  return (
    <th className={cn('px-1.5 py-2 font-medium', className)} aria-sort={active ? (filters.desc ? 'descending' : 'ascending') : 'none'}>
      <button type="button" onClick={() => onSort(k)} className={cn('inline-flex items-center gap-0.5 hover:text-foreground', active && 'text-blue-700')}>
        {label}
        {active && (filters.desc ? <ArrowDown className="h-3 w-3" /> : <ArrowUp className="h-3 w-3" />)}
      </button>
    </th>
  );
}

function ResultsTable({ rows, filters, onSort }: { rows: ExploreRow[]; filters: Filters; onSort: (k: SortKey) => void }) {
  const extra = EXTRA_COLUMN[filters.sort];
  const statClass = (k: SortKey) => cn('px-1.5 py-1.5 text-right tabular-nums', filters.sort === k && 'bg-blue-50 font-semibold text-blue-800');
  return (
    <table className="w-full text-sm">
      <thead className="border-b text-xs text-muted-foreground">
        <tr>
          <SortHeader k="id" label="#" filters={filters} onSort={onSort} className="text-left" />
          <SortHeader k="name" label="Pokémon" filters={filters} onSort={onSort} className="text-left" />
          <th className="px-1.5 py-2 text-left font-medium">Type</th>
          {STAT_SORT_KEYS.map((k, i) => (
            <SortHeader key={k} k={k} label={STAT_NAMES[i]} filters={filters} onSort={onSort} className="text-right" />
          ))}
          <SortHeader k="total" label="Total" filters={filters} onSort={onSort} className="text-right" />
          {extra && <th className="px-1.5 py-2 text-right font-medium text-blue-700">{SORT_LABELS[filters.sort]}</th>}
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.id} className="border-b last:border-0 hover:bg-gray-50">
            <td className={cn('px-1.5 py-1.5 text-xs text-muted-foreground tabular-nums', filters.sort === 'id' && 'font-semibold text-blue-800')}>
              {r.isDefault ? r.id : '—'}
            </td>
            <td className="px-1.5 py-1">
              <Link href={`/pokemon/${r.id}`} className="flex items-center gap-1.5 font-medium hover:underline">
                <Image src={spriteUrl(r.id)} alt="" width={36} height={36} unoptimized style={{ imageRendering: 'pixelated' }} />
                {r.name}
              </Link>
            </td>
            <td className="px-1.5 py-1">
              <div className="flex gap-1">
                {r.types.map((t) => (
                  <TypeBadge key={t} type={t} />
                ))}
              </div>
            </td>
            {r.stats.map((v, i) => (
              <td key={i} className={statClass(STAT_SORT_KEYS[i])}>
                {v}
              </td>
            ))}
            <td className={cn(statClass('total'), 'font-semibold')}>{r.total}</td>
            {extra && <td className="bg-blue-50 px-1.5 py-1.5 text-right font-semibold tabular-nums text-blue-800">{extra(r)}</td>}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function ResultsList({ rows, filters }: { rows: ExploreRow[]; filters: Filters }) {
  const showSort = filters.sort !== 'id' && filters.sort !== 'name' && filters.sort !== 'total';
  const sortDisplay = (r: ExploreRow) => EXTRA_COLUMN[filters.sort]?.(r) ?? String(sortValue(r, filters.sort));
  return (
    <ul className="divide-y">
      {rows.map((r) => (
        <li key={r.id}>
          <Link href={`/pokemon/${r.id}`} className="flex items-center gap-2 py-1.5">
            <Image src={spriteUrl(r.id)} alt="" width={40} height={40} unoptimized style={{ imageRendering: 'pixelated' }} />
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium">{r.name}</div>
              <div className="flex gap-1">
                {r.types.map((t) => (
                  <TypeBadge key={t} type={t} />
                ))}
              </div>
            </div>
            <div className="text-right text-xs tabular-nums">
              {showSort && (
                <div className="font-semibold text-blue-800">
                  {sortDisplay(r)} <span className="font-normal text-muted-foreground">{SORT_LABELS[filters.sort]}</span>
                </div>
              )}
              <div className={cn(!showSort && 'font-semibold')}>
                {r.total} <span className="text-muted-foreground">BST</span>
              </div>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export default function Explore({ rows, types }: { rows: ExploreRow[]; types: string[] }) {
  const [filters, setFilters] = useState<Filters>(() => fromQuery(window.location.search));
  const [shown, setShown] = useState(PAGE);
  const [panelOpen, setPanelOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    window.history.replaceState(null, '', `${window.location.pathname}${toQuery(filters)}`);
  }, [filters]);

  const { abilities, eggGroups, colors } = useMemo(() => {
    const a = new Set<string>();
    const e = new Set<string>();
    const c = new Set<string>();
    for (const r of rows) {
      r.abilities.forEach((x) => a.add(x));
      r.eggGroups.forEach((x) => e.add(x));
      if (r.color) c.add(r.color);
    }
    return { abilities: [...a].sort(), eggGroups: [...e].sort(), colors: [...c].sort() };
  }, [rows]);

  const results = useMemo(() => applyFilters(rows, filters), [rows, filters]);
  const active = activeFilterCount(filters);

  const set = (patch: Partial<Filters>) => {
    setFilters((f) => ({ ...f, ...patch }));
    setShown(PAGE);
  };
  // Clicking the sorted column flips it; a new column starts high-to-low for numbers.
  const onSort = (k: SortKey) =>
    set(filters.sort === k ? { desc: !filters.desc } : { sort: k, desc: k !== 'id' && k !== 'name' });

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt('Copy this link:', window.location.href);
    }
  }

  const panel = (
    <FilterPanel filters={filters} set={set} types={types} abilities={abilities} eggGroups={eggGroups} colors={colors} />
  );

  return (
    <div className="space-y-4">
      <div className="-mx-4 flex gap-1.5 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0">
        {PRESETS.map((p) => (
          <button
            key={p.label}
            type="button"
            onClick={() => {
              setFilters({ ...DEFAULT_FILTERS, ...p.filters });
              setShown(PAGE);
            }}
            className="shrink-0 whitespace-nowrap rounded-full border border-dashed border-gray-300 bg-white/70 px-3 py-1 text-xs font-medium hover:border-blue-500 hover:text-blue-700"
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <input
          value={filters.q}
          onChange={(e) => set({ q: e.target.value })}
          placeholder="Filter by name or number…"
          aria-label="Filter by name or number"
          className="h-10 min-w-0 flex-1 basis-48 rounded-xl border-2 border-gray-200 bg-white px-3 text-sm outline-none focus:border-blue-500"
        />
        <div className="flex items-center gap-1">
          <select
            value={filters.sort}
            onChange={(e) => set({ sort: e.target.value as SortKey })}
            aria-label="Sort by"
            className="h-10 rounded-xl border bg-white px-2 text-sm"
          >
            {(Object.keys(SORT_LABELS) as SortKey[]).map((k) => (
              <option key={k} value={k}>
                {SORT_LABELS[k]}
              </option>
            ))}
          </select>
          <Button variant="outline" size="icon" className="h-10 w-10" onClick={() => set({ desc: !filters.desc })} aria-label={filters.desc ? 'Sort ascending' : 'Sort descending'}>
            {filters.desc ? <ArrowDown className="h-4 w-4" /> : <ArrowUp className="h-4 w-4" />}
          </Button>
        </div>
        <Button variant="outline" className="h-10 lg:hidden" onClick={() => setPanelOpen((o) => !o)} aria-expanded={panelOpen}>
          <SlidersHorizontal className="mr-1.5 h-4 w-4" />
          Filters{active > 0 && ` (${active})`}
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <aside className={cn('rounded-2xl border bg-white/80 p-4 backdrop-blur lg:block lg:self-start', panelOpen ? 'block' : 'hidden')}>
          {panel}
          <Button className="mt-5 w-full lg:hidden" onClick={() => setPanelOpen(false)}>
            Show {results.length.toLocaleString()} Pokémon
          </Button>
        </aside>

        <div className="min-w-0 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
            <p>
              <span className="font-semibold">{results.length.toLocaleString()}</span> Pokémon
              {active > 0 && <span className="text-muted-foreground"> · {active} filter{active === 1 ? '' : 's'}</span>}
            </p>
            <div className="flex gap-1">
              <Button variant="ghost" size="sm" onClick={copyLink}>
                {copied ? <Check className="mr-1.5 h-4 w-4" /> : <Link2 className="mr-1.5 h-4 w-4" />}
                {copied ? 'Copied' : 'Share'}
              </Button>
              <Button variant="ghost" size="sm" onClick={() => set({ ...DEFAULT_FILTERS })} disabled={active === 0 && filters.sort === 'id' && !filters.desc}>
                <RotateCcw className="mr-1.5 h-4 w-4" />
                Reset
              </Button>
            </div>
          </div>

          {results.length === 0 ? (
            <p className="rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground">No Pokémon match these filters.</p>
          ) : (
            <div className="rounded-2xl border bg-white/80 px-3 backdrop-blur">
              <div className="hidden md:block">
                <ResultsTable rows={results.slice(0, shown)} filters={filters} onSort={onSort} />
              </div>
              <div className="md:hidden">
                <ResultsList rows={results.slice(0, shown)} filters={filters} />
              </div>
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
      </div>
    </div>
  );
}
