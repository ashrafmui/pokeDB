// Pure filtering, sorting and URL encoding for the /explore page. Client-safe;
// the server builds ExploreRows from src/lib/dex.ts.

import { CURRENT_GEN } from '@/lib/moveData';

export const STAT_NAMES = ['HP', 'Atk', 'Def', 'SpA', 'SpD', 'Spe'] as const;

export interface ExploreRow {
  id: number;
  name: string;
  isDefault: boolean;
  generation: number;
  types: string[];
  /** Base stats in STAT_NAMES order. */
  stats: number[];
  total: number;
  abilities: string[];
  heightM: number;
  weightKg: number;
  color: string | null;
  eggGroups: string[];
  captureRate: number;
  evolutionStage: number;
  fullyEvolved: boolean;
  legendary: boolean;
  mythical: boolean;
  baby: boolean;
  mega: boolean;
  regional: boolean;
  moves: number;
  /** Attacking types that deal more than 1×. */
  weakTo: string[];
  /** Attacking types that deal less than 1× (including 0×). */
  resists: string[];
  /** Attacking types that deal 0×. */
  immuneTo: string[];
}

export type SortKey = 'id' | 'name' | 'total' | 'hp' | 'atk' | 'def' | 'spa' | 'spd' | 'spe' | 'height' | 'weight' | 'capture' | 'moves';
export const STAT_SORT_KEYS: SortKey[] = ['hp', 'atk', 'def', 'spa', 'spd', 'spe'];

export const SORT_LABELS: Record<SortKey, string> = {
  id: 'Dex number',
  name: 'Name',
  total: 'Base stat total',
  hp: 'HP',
  atk: 'Attack',
  def: 'Defense',
  spa: 'Sp. Atk',
  spd: 'Sp. Def',
  spe: 'Speed',
  height: 'Height',
  weight: 'Weight',
  capture: 'Catch rate',
  moves: 'Moves learnable',
};

/** In-game egg group names (PokéAPI uses internal ones like "ground" for Field). */
export const EGG_GROUP_LABELS: Record<string, string> = {
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

export type Category = 'legendary' | 'mythical' | 'baby' | 'mega' | 'regional' | 'fully-evolved' | 'not-fully-evolved' | 'regular';
export const CATEGORY_LABELS: Record<Category, string> = {
  regular: 'Not legendary or mythical',
  legendary: 'Legendary',
  mythical: 'Mythical',
  baby: 'Baby',
  'fully-evolved': 'Fully evolved',
  'not-fully-evolved': 'Can still evolve',
  mega: 'Mega',
  regional: 'Regional form',
};

export interface Filters {
  q: string;
  types: string[];
  /** 'any': has at least one of `types`; 'all': has every one of them. */
  typeMode: 'any' | 'all';
  gens: number[];
  categories: Category[];
  forms: boolean;
  ability: string;
  /** Slug of a move the Pokémon must learn; resolved with a learner map (see applyFilters). */
  learns: string;
  /** Count moves a Pokémon can no longer learn in current games too. */
  learnsAny: boolean;
  eggGroup: string;
  color: string;
  weakTo: string;
  resists: string;
  immuneTo: string;
  /** Minimum and maximum per stat (STAT_NAMES order) and for the total, index 6. */
  min: (number | null)[];
  max: (number | null)[];
  sort: SortKey;
  desc: boolean;
}

export const DEFAULT_FILTERS: Filters = {
  q: '',
  types: [],
  typeMode: 'any',
  gens: [],
  categories: [],
  forms: false,
  ability: '',
  learns: '',
  learnsAny: false,
  eggGroup: '',
  color: '',
  weakTo: '',
  resists: '',
  immuneTo: '',
  min: Array(7).fill(null),
  max: Array(7).fill(null),
  sort: 'id',
  desc: false,
};

const statOf = (row: ExploreRow, i: number) => (i === 6 ? row.total : row.stats[i]);

function matchesCategory(row: ExploreRow, c: Category): boolean {
  switch (c) {
    case 'regular':
      return !row.legendary && !row.mythical;
    case 'legendary':
      return row.legendary;
    case 'mythical':
      return row.mythical;
    case 'baby':
      return row.baby;
    case 'mega':
      return row.mega;
    case 'regional':
      return row.regional;
    case 'fully-evolved':
      return row.fullyEvolved;
    case 'not-fully-evolved':
      return !row.fullyEvolved;
  }
}

/**
 * `learners` maps Pokémon id → newest generation it can learn `f.learns` in.
 * While it's still loading (null) a move filter matches nothing rather than
 * flashing the unfiltered list.
 */
export function applyFilters(rows: readonly ExploreRow[], f: Filters, learners: ReadonlyMap<number, number> | null = null): ExploreRow[] {
  const q = f.q.trim().toLowerCase();
  const ability = f.ability.trim().toLowerCase();
  const out = rows.filter((r) => {
    if (!f.forms && !r.isDefault) return false;
    if (q && !r.name.toLowerCase().includes(q) && String(r.id) !== q) return false;
    if (f.types.length) {
      const has = (t: string) => r.types.includes(t);
      if (f.typeMode === 'all' ? !f.types.every(has) : !f.types.some(has)) return false;
    }
    if (f.gens.length && !f.gens.includes(r.generation)) return false;
    // Categories narrow together: "Legendary" + "Fully evolved" means both.
    if (!f.categories.every((c) => matchesCategory(r, c))) return false;
    if (ability && !r.abilities.some((a) => a.toLowerCase().includes(ability))) return false;
    if (f.learns) {
      const lastGen = learners?.get(r.id);
      if (lastGen === undefined || (!f.learnsAny && lastGen < CURRENT_GEN)) return false;
    }
    if (f.eggGroup && !r.eggGroups.includes(f.eggGroup)) return false;
    if (f.color && r.color !== f.color) return false;
    if (f.weakTo && !r.weakTo.includes(f.weakTo)) return false;
    if (f.resists && !r.resists.includes(f.resists)) return false;
    if (f.immuneTo && !r.immuneTo.includes(f.immuneTo)) return false;
    for (let i = 0; i < 7; i++) {
      const v = statOf(r, i);
      if (f.min[i] != null && v < f.min[i]!) return false;
      if (f.max[i] != null && v > f.max[i]!) return false;
    }
    return true;
  });
  return sortRows(out, f.sort, f.desc);
}

export function sortValue(r: ExploreRow, key: SortKey): number | string {
  switch (key) {
    case 'id':
      return r.id;
    case 'name':
      return r.name;
    case 'total':
      return r.total;
    case 'height':
      return r.heightM;
    case 'weight':
      return r.weightKg;
    case 'capture':
      return r.captureRate;
    case 'moves':
      return r.moves;
    default:
      return r.stats[STAT_SORT_KEYS.indexOf(key)];
  }
}

export function sortRows(rows: ExploreRow[], key: SortKey, desc: boolean): ExploreRow[] {
  const dir = desc ? -1 : 1;
  return rows.sort((a, b) => {
    const va = sortValue(a, key);
    const vb = sortValue(b, key);
    const cmp = typeof va === 'string' ? va.localeCompare(vb as string) : va - (vb as number);
    return cmp * dir || a.id - b.id;
  });
}

/** How many filters differ from the defaults (sorting doesn't count). */
export function activeFilterCount(f: Filters): number {
  let n = 0;
  if (f.q.trim()) n++;
  if (f.types.length) n++;
  if (f.gens.length) n++;
  n += f.categories.length;
  if (f.forms) n++;
  for (const k of ['ability', 'learns', 'eggGroup', 'color', 'weakTo', 'resists', 'immuneTo'] as const) if (f[k]) n++;
  n += f.min.filter((v) => v != null).length + f.max.filter((v) => v != null).length;
  return n;
}

// ── URL ──────────────────────────────────────────────────────────────────────

const RANGE_KEYS = ['hp', 'atk', 'def', 'spa', 'spd', 'spe', 'total'];

/** Only non-default values, so links stay short: ?types=fire&sort=spe&desc=1 */
export function toQuery(f: Filters): string {
  const p: string[] = [];
  const add = (k: string, v: string) => p.push(`${k}=${encodeURIComponent(v)}`);
  if (f.q.trim()) add('q', f.q.trim());
  if (f.types.length) add('types', f.types.join(','));
  if (f.typeMode === 'all') add('typeMode', 'all');
  if (f.gens.length) add('gen', f.gens.join(','));
  if (f.categories.length) add('cat', f.categories.join(','));
  if (f.forms) add('forms', '1');
  if (f.ability) add('ability', f.ability);
  if (f.learns) add('learns', f.learns);
  if (f.learns && f.learnsAny) add('learnsAll', '1');
  if (f.eggGroup) add('egg', f.eggGroup);
  if (f.color) add('color', f.color);
  if (f.weakTo) add('weak', f.weakTo);
  if (f.resists) add('resists', f.resists);
  if (f.immuneTo) add('immune', f.immuneTo);
  RANGE_KEYS.forEach((k, i) => {
    if (f.min[i] != null || f.max[i] != null) add(k, `${f.min[i] ?? ''}-${f.max[i] ?? ''}`);
  });
  if (f.sort !== 'id') add('sort', f.sort);
  if (f.desc) add('desc', '1');
  return p.length ? `?${p.join('&').replace(/%2C/g, ',')}` : '';
}

const list = (v: string | null) => (v ? v.split(',').filter(Boolean) : []);
const num = (v: string | undefined) => (v === undefined || v === '' || Number.isNaN(Number(v)) ? null : Number(v));

export function fromQuery(search: string): Filters {
  const p = new URLSearchParams(search);
  const min = [...DEFAULT_FILTERS.min];
  const max = [...DEFAULT_FILTERS.max];
  RANGE_KEYS.forEach((k, i) => {
    const v = p.get(k);
    if (!v) return;
    const [lo, hi] = v.split('-');
    min[i] = num(lo);
    max[i] = num(hi);
  });
  const sort = p.get('sort') as SortKey | null;
  return {
    ...DEFAULT_FILTERS,
    q: p.get('q') ?? '',
    types: list(p.get('types')),
    typeMode: p.get('typeMode') === 'all' ? 'all' : 'any',
    gens: list(p.get('gen')).map(Number).filter((n) => n >= 1),
    categories: list(p.get('cat')).filter((c): c is Category => c in CATEGORY_LABELS),
    forms: p.get('forms') === '1',
    ability: p.get('ability') ?? '',
    learns: p.get('learns') ?? '',
    learnsAny: p.get('learnsAll') === '1',
    eggGroup: p.get('egg') ?? '',
    color: p.get('color') ?? '',
    weakTo: p.get('weak') ?? '',
    resists: p.get('resists') ?? '',
    immuneTo: p.get('immune') ?? '',
    min,
    max,
    sort: sort && sort in SORT_LABELS ? sort : 'id',
    desc: p.get('desc') === '1',
  };
}

// ── Presets ──────────────────────────────────────────────────────────────────

export interface Preset {
  label: string;
  filters: Partial<Filters>;
}

const range = (i: number, lo: number | null, hi: number | null) => {
  const min = [...DEFAULT_FILTERS.min];
  const max = [...DEFAULT_FILTERS.max];
  min[i] = lo;
  max[i] = hi;
  return { min, max };
};

export const PRESETS: Preset[] = [
  { label: 'Fastest Fire types', filters: { types: ['fire'], sort: 'spe', desc: true } },
  { label: 'Strongest non-legendaries', filters: { categories: ['regular', 'fully-evolved'], sort: 'total', desc: true } },
  { label: 'Pseudo-legendaries', filters: { categories: ['regular'], ...range(6, 600, 600), sort: 'total', desc: true } },
  {
    label: 'Trick Room attackers',
    filters: { categories: ['fully-evolved'], min: [null, 110, null, null, null, null, null], max: [null, null, null, null, null, 50, null], sort: 'atk', desc: true },
  },
  { label: 'Bulkiest walls', filters: { categories: ['fully-evolved'], sort: 'def', desc: true } },
  { label: 'Fastest Earthquake users', filters: { learns: 'earthquake', categories: ['fully-evolved'], sort: 'spe', desc: true } },
  { label: 'Ground immunities', filters: { immuneTo: 'ground', categories: ['fully-evolved'], sort: 'total', desc: true } },
  { label: 'Hardest to catch', filters: { sort: 'capture' } },
  { label: 'Heaviest', filters: { sort: 'weight', desc: true } },
  { label: 'Tiniest', filters: { sort: 'height' } },
  { label: 'Most moves', filters: { sort: 'moves', desc: true } },
];
