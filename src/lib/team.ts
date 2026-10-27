// Pure team-analysis logic for the team builder: type matchups, coverage,
// suggestions, share links and Showdown import/export. Client-safe; the server
// builds the TeamMon pool and type chart from src/lib/dex.ts.

export const MAX_TEAM = 6;
export const STAT_LABELS = ['HP', 'Atk', 'Def', 'SpA', 'SpD', 'Spe'] as const;

export interface TeamMon {
  id: number;
  speciesId: number;
  name: string;
  /** Name as Pokémon Showdown writes it, e.g. "Raichu-Alola". */
  showdownName: string;
  types: string[];
  /** Base stats in STAT_LABELS order. */
  stats: number[];
  total: number;
  /** Display names; hidden abilities end in " (H)". */
  abilities: string[];
  fullyEvolved: boolean;
  /** Legendary or Mythical. */
  restricted: boolean;
  mega: boolean;
}

/** Attacking type → defending type → damage multiplier. */
export type TypeChart = Record<string, Record<string, number>>;

export function multiplier(chart: TypeChart, attacking: string, defending: readonly string[]): number {
  return defending.reduce((m, def) => m * (chart[attacking]?.[def] ?? 1), 1);
}

export interface DefenseRow {
  type: string;
  /** Damage multiplier for each team member, in team order. */
  perMember: number[];
  weak: number;
  /** Resists, including immunities. */
  resist: number;
  immune: number;
  /** Several members weak and few answers: worth fixing. */
  danger: boolean;
}

/** How the team takes hits from each attacking type. */
export function defenseTable(team: readonly TeamMon[], chart: TypeChart, types: readonly string[]): DefenseRow[] {
  return types.map((type) => {
    const perMember = team.map((m) => multiplier(chart, type, m.types));
    const weak = perMember.filter((x) => x > 1).length;
    const resist = perMember.filter((x) => x < 1).length;
    const immune = perMember.filter((x) => x === 0).length;
    return { type, perMember, weak, resist, immune, danger: weak >= 3 || (weak >= 2 && resist === 0) };
  });
}

export interface CoverageRow {
  /** Defending type. */
  type: string;
  /** Best multiplier any member's same-type (STAB) attack gets against it. */
  best: number;
  /** Members with a super-effective STAB hit. */
  hitters: number[];
}

/**
 * Which single types the team can hit super-effectively using only the types
 * its members have (same-type attack bonus moves).
 */
export function stabCoverage(team: readonly TeamMon[], chart: TypeChart, types: readonly string[]): CoverageRow[] {
  return types.map((type) => {
    let best = 0;
    const hitters: number[] = [];
    team.forEach((m) => {
      const own = Math.max(...m.types.map((atk) => multiplier(chart, atk, [type])));
      best = Math.max(best, own);
      if (own > 1) hitters.push(m.id);
    });
    return { type, best, hitters };
  });
}

/** Average of each base stat across the team. */
export function averageStats(team: readonly TeamMon[]): number[] {
  if (!team.length) return STAT_LABELS.map(() => 0);
  return STAT_LABELS.map((_, i) => Math.round(team.reduce((sum, m) => sum + m.stats[i], 0) / team.length));
}

export interface Suggestion {
  mon: TeamMon;
  resists: string[];
  covers: string[];
  score: number;
}

/**
 * Pokémon that patch the team's holes: they resist types the team is weak to
 * and hit types the team can't, without adding to its weaknesses.
 */
export function suggestions(
  pool: readonly TeamMon[],
  team: readonly TeamMon[],
  chart: TypeChart,
  types: readonly string[],
  { includeRestricted = false, limit = 6 } = {}
): Suggestion[] {
  if (!team.length || team.length >= MAX_TEAM) return [];
  const defense = defenseTable(team, chart, types);
  const problems = defense.filter((r) => r.weak > r.resist).map((r) => r.type);
  const alreadyWeak = new Set(defense.filter((r) => r.weak >= 2).map((r) => r.type));
  const uncovered = stabCoverage(team, chart, types).filter((r) => r.best <= 1).map((r) => r.type);
  const taken = new Set(team.map((m) => m.speciesId));

  const scored: Suggestion[] = [];
  for (const mon of pool) {
    if (!mon.fullyEvolved || mon.mega || (!includeRestricted && mon.restricted)) continue;
    if (taken.has(mon.speciesId)) continue;
    const resists = problems.filter((t) => multiplier(chart, t, mon.types) < 1);
    const covers = uncovered.filter((t) => mon.types.some((atk) => multiplier(chart, atk, [t]) > 1));
    const addsWeakness = [...alreadyWeak].filter((t) => multiplier(chart, t, mon.types) > 1).length;
    const score = resists.length * 3 + covers.length * 2 - addsWeakness * 3 + mon.total / 200;
    if (resists.length + covers.length > 0) scored.push({ mon, resists, covers, score });
  }
  return scored.sort((a, b) => b.score - a.score).slice(0, limit);
}

// ── Sharing ──────────────────────────────────────────────────────────────────

export function encodeTeam(team: readonly TeamMon[]): string {
  return team.map((m) => m.id).join(',');
}

export function decodeTeam(param: string | null, byId: ReadonlyMap<number, TeamMon>): TeamMon[] {
  if (!param) return [];
  return param
    .split(',')
    .map((s) => byId.get(Number(s)))
    .filter((m): m is TeamMon => Boolean(m))
    .slice(0, MAX_TEAM);
}

/** Team in Pokémon Showdown's import format (species and first ability). */
export function toShowdown(team: readonly TeamMon[]): string {
  return team
    .map((m) => `${m.showdownName}\nAbility: ${m.abilities[0]?.replace(' (H)', '') ?? ''}`.trimEnd())
    .join('\n\n');
}

const showdownKey = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');

/**
 * Reads the species from a Showdown export, ignoring everything else. Handles
 * "Nickname (Species) (M) @ Item". Returns the team and lines it couldn't match.
 */
export function fromShowdown(text: string, pool: readonly TeamMon[]): { team: TeamMon[]; unknown: string[] } {
  const byName = new Map<string, TeamMon>();
  for (const m of pool) {
    byName.set(showdownKey(m.showdownName), m);
    if (!byName.has(showdownKey(m.name))) byName.set(showdownKey(m.name), m);
  }
  const team: TeamMon[] = [];
  const unknown: string[] = [];
  for (const block of text.split(/\n\s*\n/)) {
    const first = block.trim().split('\n')[0]?.trim();
    if (!first) continue;
    const withoutItem = first.split(' @ ')[0].replace(/\s*\((M|F)\)\s*$/, '').trim();
    const species = withoutItem.match(/\(([^()]+)\)\s*$/)?.[1] ?? withoutItem;
    const mon = byName.get(showdownKey(species));
    if (mon) team.push(mon);
    else unknown.push(species);
    if (team.length === MAX_TEAM) break;
  }
  return { team, unknown };
}
