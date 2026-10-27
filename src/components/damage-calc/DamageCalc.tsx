'use client';

// Damage calculator: pick an attacker, a move and a defender, tweak the
// battle conditions, and see the damage range and KO chances. State lives in
// the URL so any matchup can be shared.

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { ArrowLeftRight, Check, Link2, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PokemonPicker from '@/components/PokemonPicker';
import TypeBadge from '@/components/TypeBadge';
import ClassBadge from '@/components/moves/ClassBadge';
import { spriteUrl } from '@/lib/sprites';
import { multiplier, type TypeChart } from '@/lib/team';
import { calculate, koText, type Combatant, type Modifiers, type Weather } from '@/lib/damage';
import type { MoveClass } from '@/lib/moveData';

export interface CalcMon {
  id: number;
  name: string;
  types: string[];
  /** HP, Atk, Def, SpA, SpD, Spe. */
  base: number[];
}

export interface CalcMove {
  id: number;
  slug: string;
  name: string;
  type: string;
  cls: Exclude<MoveClass, 'status'>;
  power: number;
}

interface Side {
  id: number;
  level: number;
  evs: number;
  nature: -1 | 0 | 1;
  stage: number;
}

interface State {
  atk: Side;
  def: Side;
  move: string;
  weather: Weather;
  crit: boolean;
  burned: boolean;
  screen: boolean;
  spread: boolean;
  attackerItem: Modifiers['attackerItem'];
  defenderItem: Modifiers['defenderItem'];
}

const NO_EXCLUDE: ReadonlySet<number> = new Set();
const side = (id: number, evs: number): Side => ({ id, level: 50, evs, nature: 0, stage: 0 });

const DEFAULT_STATE: State = {
  atk: side(445, 252), // Garchomp
  def: side(485, 0), // Heatran
  move: 'earthquake',
  weather: 'none',
  crit: false,
  burned: false,
  screen: false,
  spread: false,
  attackerItem: 'none',
  defenderItem: 'none',
};

const WEATHERS: [Weather, string][] = [
  ['none', 'None'],
  ['sun', 'Sun'],
  ['rain', 'Rain'],
  ['sand', 'Sandstorm'],
  ['snow', 'Snow'],
];
const ATTACKER_ITEMS: [Modifiers['attackerItem'], string][] = [
  ['none', 'None'],
  ['band', 'Choice Band'],
  ['specs', 'Choice Specs'],
  ['life-orb', 'Life Orb'],
  ['expert-belt', 'Expert Belt'],
];
const DEFENDER_ITEMS: [Modifiers['defenderItem'], string][] = [
  ['none', 'None'],
  ['assault-vest', 'Assault Vest'],
];
const NATURES: [Side['nature'], string][] = [
  [1, 'Boosting (+10%)'],
  [0, 'Neutral'],
  [-1, 'Hindering (−10%)'],
];

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, Number.isFinite(n) ? n : lo));

// ── URL state ────────────────────────────────────────────────────────────────

function sideToQuery(prefix: string, s: Side, base: Side, params: URLSearchParams) {
  params.set(prefix, String(s.id));
  if (s.level !== base.level) params.set(`${prefix}l`, String(s.level));
  if (s.evs !== base.evs) params.set(`${prefix}e`, String(s.evs));
  if (s.nature !== base.nature) params.set(`${prefix}n`, String(s.nature));
  if (s.stage !== base.stage) params.set(`${prefix}s`, String(s.stage));
}

function toQuery(state: State): string {
  const p = new URLSearchParams();
  sideToQuery('a', state.atk, DEFAULT_STATE.atk, p);
  sideToQuery('d', state.def, DEFAULT_STATE.def, p);
  p.set('m', state.move);
  if (state.weather !== 'none') p.set('w', state.weather);
  if (state.crit) p.set('crit', '1');
  if (state.burned) p.set('burn', '1');
  if (state.screen) p.set('screen', '1');
  if (state.spread) p.set('spread', '1');
  if (state.attackerItem !== 'none') p.set('ai', state.attackerItem);
  if (state.defenderItem !== 'none') p.set('di', state.defenderItem);
  return p.toString();
}

function sideFromQuery(prefix: string, p: URLSearchParams, base: Side): Side {
  const nature = Number(p.get(`${prefix}n`) ?? base.nature);
  return {
    id: Number(p.get(prefix)) || base.id,
    level: clamp(Number(p.get(`${prefix}l`) ?? base.level), 1, 100),
    evs: clamp(Number(p.get(`${prefix}e`) ?? base.evs), 0, 252),
    nature: nature === 1 || nature === -1 ? nature : 0,
    stage: clamp(Number(p.get(`${prefix}s`) ?? 0), -6, 6),
  };
}

function fromQuery(search: string): State {
  const p = new URLSearchParams(search);
  const pick = <T extends string>(key: string, allowed: readonly T[], fallback: T): T => {
    const v = p.get(key);
    return allowed.includes(v as T) ? (v as T) : fallback;
  };
  return {
    atk: sideFromQuery('a', p, DEFAULT_STATE.atk),
    def: sideFromQuery('d', p, DEFAULT_STATE.def),
    move: p.get('m') ?? DEFAULT_STATE.move,
    weather: pick('w', WEATHERS.map(([v]) => v), 'none'),
    crit: p.get('crit') === '1',
    burned: p.get('burn') === '1',
    screen: p.get('screen') === '1',
    spread: p.get('spread') === '1',
    attackerItem: pick('ai', ATTACKER_ITEMS.map(([v]) => v), 'none'),
    defenderItem: pick('di', DEFENDER_ITEMS.map(([v]) => v), 'none'),
  };
}

// ── Pieces ───────────────────────────────────────────────────────────────────

function Select<T extends string | number>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: readonly [T, string][];
  onChange: (v: T) => void;
}) {
  return (
    <label className="block text-xs font-medium text-muted-foreground">
      {label}
      <select
        value={value}
        onChange={(e) => onChange((typeof value === 'number' ? Number(e.target.value) : e.target.value) as T)}
        className="mt-1 h-9 w-full rounded-lg border bg-white px-2 text-sm text-foreground"
      >
        {options.map(([v, text]) => (
          <option key={v} value={v}>
            {text}
          </option>
        ))}
      </select>
    </label>
  );
}

function NumberField({ label, value, min, max, step = 1, onChange }: { label: string; value: number; min: number; max: number; step?: number; onChange: (n: number) => void }) {
  return (
    <label className="block text-xs font-medium text-muted-foreground">
      {label}
      <input
        type="number"
        inputMode="numeric"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => onChange(clamp(Math.round(Number(e.target.value)), min, max))}
        className="mt-1 h-9 w-full rounded-lg border bg-white px-2 text-sm text-foreground"
      />
    </label>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-2 text-sm">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="h-4 w-4" />
      {label}
    </label>
  );
}

function MonCard({ mon, role }: { mon: CalcMon; role: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-muted/50 p-3">
      <Image src={spriteUrl(mon.id)} alt="" width={64} height={64} unoptimized style={{ imageRendering: 'pixelated' }} />
      <div className="min-w-0">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">{role}</p>
        <p className="truncate font-semibold">{mon.name}</p>
        <div className="mt-1 flex gap-1">
          {mon.types.map((t) => (
            <TypeBadge key={t} type={t} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Main ─────────────────────────────────────────────────────────────────────

export default function DamageCalc({ mons, moves, chart }: { mons: CalcMon[]; moves: CalcMove[]; chart: TypeChart }) {
  const [state, setState] = useState<State>(() =>
    typeof window === 'undefined' ? DEFAULT_STATE : fromQuery(window.location.search)
  );
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    window.history.replaceState(null, '', `?${toQuery(state)}`);
  }, [state]);

  const monById = useMemo(() => new Map(mons.map((m) => [m.id, m])), [mons]);
  const moveBySlug = useMemo(() => new Map(moves.map((m) => [m.slug, m])), [moves]);
  const attacker = monById.get(state.atk.id) ?? monById.get(DEFAULT_STATE.atk.id)!;
  const defender = monById.get(state.def.id) ?? monById.get(DEFAULT_STATE.def.id)!;
  const move = moveBySlug.get(state.move) ?? moveBySlug.get(DEFAULT_STATE.move)!;
  const phys = move.cls === 'physical';

  const result = useMemo(() => {
    const toCombatant = (s: Side, mon: CalcMon): Combatant => ({ level: s.level, base: mon.base, types: mon.types, evs: s.evs, nature: s.nature, stage: s.stage });
    const mods: Modifiers = {
      weather: state.weather,
      crit: state.crit,
      burned: state.burned,
      screen: state.screen,
      spread: state.spread,
      attackerItem: state.attackerItem,
      defenderItem: state.defenderItem,
    };
    return calculate(toCombatant(state.atk, attacker), toCombatant(state.def, defender), move, mods, multiplier(chart, move.type, defender.types));
  }, [state, attacker, defender, move, chart]);

  const patch = (changes: Partial<State>) => setState((s) => ({ ...s, ...changes }));
  const patchSide = (which: 'atk' | 'def', changes: Partial<Side>) => setState((s) => ({ ...s, [which]: { ...s[which], ...changes } }));

  const hp = result.defenderHp;
  const pct = (n: number) => `${((n / hp) * 100).toFixed(1)}%`;
  const eff = result.effectiveness;
  const effText = eff === 0 ? 'No effect' : eff > 1 ? `Super effective (${eff}×)` : eff < 1 ? `Not very effective (${eff}×)` : 'Neutral (1×)';
  const koTag = koText(result);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard unavailable; the address bar already holds the link.
    }
  }

  const atkLabel = phys ? 'Attack' : 'Sp. Atk';
  const defLabel = phys ? 'Defense' : 'Sp. Def';

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-[1fr_auto_1fr] md:items-start">
        <section className="space-y-3 rounded-2xl border bg-white/80 p-4 backdrop-blur-sm">
          <MonCard mon={attacker} role="Attacker" />
          <PokemonPicker pool={mons} exclude={NO_EXCLUDE} onPick={(m) => patchSide('atk', { id: m.id })} placeholder="Change attacker…" label="Attacker" />
          <div className="grid grid-cols-2 gap-2">
            <NumberField label="Level" value={state.atk.level} min={1} max={100} onChange={(level) => patchSide('atk', { level })} />
            <NumberField label={`${atkLabel} EVs`} value={state.atk.evs} min={0} max={252} step={4} onChange={(evs) => patchSide('atk', { evs })} />
            <Select label="Nature" value={state.atk.nature} options={NATURES} onChange={(nature) => patchSide('atk', { nature })} />
            <NumberField label="Stat stage" value={state.atk.stage} min={-6} max={6} onChange={(stage) => patchSide('atk', { stage })} />
          </div>
          <Select label="Item" value={state.attackerItem} options={ATTACKER_ITEMS} onChange={(attackerItem) => patch({ attackerItem })} />
        </section>

        <div className="flex justify-center md:pt-24">
          <Button variant="outline" size="icon" aria-label="Swap attacker and defender" onClick={() => patch({ atk: { ...state.atk, id: state.def.id }, def: { ...state.def, id: state.atk.id } })}>
            <ArrowLeftRight className="h-4 w-4" />
          </Button>
        </div>

        <section className="space-y-3 rounded-2xl border bg-white/80 p-4 backdrop-blur-sm">
          <MonCard mon={defender} role="Defender" />
          <PokemonPicker pool={mons} exclude={NO_EXCLUDE} onPick={(m) => patchSide('def', { id: m.id })} placeholder="Change defender…" label="Defender" />
          <div className="grid grid-cols-2 gap-2">
            <NumberField label="Level" value={state.def.level} min={1} max={100} onChange={(level) => patchSide('def', { level })} />
            <NumberField label="HP and defense EVs" value={state.def.evs} min={0} max={252} step={4} onChange={(evs) => patchSide('def', { evs })} />
            <Select label="Nature" value={state.def.nature} options={NATURES} onChange={(nature) => patchSide('def', { nature })} />
            <NumberField label="Stat stage" value={state.def.stage} min={-6} max={6} onChange={(stage) => patchSide('def', { stage })} />
          </div>
          <Select label="Item" value={state.defenderItem} options={DEFENDER_ITEMS} onChange={(defenderItem) => patch({ defenderItem })} />
        </section>
      </div>

      <section className="space-y-3 rounded-2xl border bg-white/80 p-4 backdrop-blur-sm">
        <h2 className="font-semibold">Move and conditions</h2>
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="font-semibold">{move.name}</span>
          <TypeBadge type={move.type} />
          <ClassBadge cls={move.cls} />
          <span className="text-muted-foreground">{move.power} power</span>
        </div>
        <PokemonPicker pool={moves} exclude={NO_EXCLUDE} sprites={false} onPick={(m) => patch({ move: m.slug })} placeholder="Change move…" label="Move" />
        <div className="grid gap-3 sm:grid-cols-[200px_1fr]">
          <Select label="Weather" value={state.weather} options={WEATHERS} onChange={(weather) => patch({ weather })} />
          <div className="flex flex-wrap items-end gap-x-5 gap-y-2 pb-1">
            <Toggle label="Critical hit" checked={state.crit} onChange={(crit) => patch({ crit })} />
            <Toggle label="Attacker burned" checked={state.burned} onChange={(burned) => patch({ burned })} />
            <Toggle label="Reflect / Light Screen" checked={state.screen} onChange={(screen) => patch({ screen })} />
            <Toggle label="Hits several targets" checked={state.spread} onChange={(spread) => patch({ spread })} />
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Uses the generation 9 formula with 31 IVs. Defender EVs apply to HP and {defLabel}. Abilities, Terastallization and terrain are not modelled yet.
        </p>
      </section>

      <section aria-live="polite" className="space-y-3 rounded-2xl border-2 border-blue-500 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-semibold">
            {attacker.name}&apos;s {move.name} vs. {defender.name}
          </h2>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={copyLink}>
              {copied ? <Check className="mr-1 h-4 w-4" /> : <Link2 className="mr-1 h-4 w-4" />}
              {copied ? 'Copied' : 'Copy link'}
            </Button>
            <Button variant="outline" size="sm" onClick={() => setState(DEFAULT_STATE)}>
              <RotateCcw className="mr-1 h-4 w-4" />
              Reset
            </Button>
          </div>
        </div>
        <p className="text-3xl font-bold">
          {result.min}–{result.max}
          <span className="ml-2 text-lg font-medium text-muted-foreground">
            ({pct(result.min)} – {pct(result.max)} of {hp} HP)
          </span>
        </p>
        <div className="h-3 overflow-hidden rounded-full bg-gray-200" role="img" aria-label={`Deals ${pct(result.min)} to ${pct(result.max)} of HP`}>
          <div className="relative h-full" style={{ width: `${Math.min(100, (result.max / hp) * 100)}%` }}>
            <div className="absolute inset-y-0 left-0 bg-red-300" style={{ width: '100%' }} />
            <div className="absolute inset-y-0 left-0 bg-red-500" style={{ width: `${(result.min / Math.max(result.max, 1)) * 100}%` }} />
          </div>
        </div>
        <p className="font-semibold">{eff === 0 ? effText : koTag}</p>
        <p className="text-sm text-muted-foreground">
          {eff === 0 ? 'Immune to this move' : effText}
          {result.stab && eff !== 0 ? ' · STAB (1.5×)' : ''}
          {state.crit ? ' · Critical hit' : ''}
        </p>
        <details className="text-sm">
          <summary className="cursor-pointer text-muted-foreground">All 16 damage rolls</summary>
          <p className="mt-2 font-mono text-xs">{result.rolls.join(', ')}</p>
        </details>
      </section>
    </div>
  );
}
