'use client';

// Side-by-side comparison of up to four Pokémon: base stats (radar + bars with
// percentiles), head-to-head STAB matchups, defensive type chart and details.
// The selection lives in the URL (?ids=6,9) so any comparison can be shared.

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Check, Crown, Link2, X, Zap } from 'lucide-react';
import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer, Tooltip } from 'recharts';
import { Button } from '@/components/ui/button';
import PokemonPicker from '@/components/PokemonPicker';
import { cn } from '@/lib/utils';
import { officialArtworkUrl } from '@/lib/sprites';
import { getTypeBadgeColors } from '@/lib/typeColors';
import { EGG_GROUP_LABELS, STAT_NAMES, type ExploreRow } from '@/lib/explore';
import { multiplier, type TypeChart } from '@/lib/team';
import { MAX_COMPARE, POPULAR, SERIES_COLORS, headToHead, percentile, statDistributions } from '@/lib/compare';

interface Slot {
  mon: ExploreRow;
  /** Index into SERIES_COLORS; stays with the Pokémon until it's removed. */
  color: number;
}

const title = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const STAT_LABELS = [...STAT_NAMES, 'Total'];

function TypeBadge({ type }: { type: string }) {
  const { bg, text } = getTypeBadgeColors(type);
  return (
    <span className="inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold" style={{ backgroundColor: bg, color: text }}>
      {title(type)}
    </span>
  );
}

function Swatch({ color }: { color: number }) {
  return <span className="inline-block h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: SERIES_COLORS[color] }} />;
}

function Section({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3 rounded-2xl border bg-white/80 p-4 shadow-sm backdrop-blur sm:p-6">
      <div>
        <h2 className="text-lg font-semibold">{title}</h2>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      {children}
    </section>
  );
}

const MULT_LABEL: Record<string, string> = { '0': '0×', '0.25': '¼×', '0.5': '½×', '1': '1×', '2': '2×', '4': '4×' };
const MULT_CLASS: Record<string, string> = {
  '0': 'bg-gray-800 text-white',
  '0.25': 'bg-emerald-400 text-emerald-950',
  '0.5': 'bg-emerald-200 text-emerald-900',
  '1': 'bg-gray-50 text-gray-400',
  '2': 'bg-red-200 text-red-900',
  '4': 'bg-red-500 text-white',
};

// ── Stats ────────────────────────────────────────────────────────────────────

function StatsRadar({ slots }: { slots: Slot[] }) {
  const data = STAT_NAMES.map((label, i) => ({
    stat: label,
    ...Object.fromEntries(slots.map((s) => [s.mon.name, s.mon.stats[i]])),
  }));
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} outerRadius="75%">
          <PolarGrid stroke="#e5e7eb" />
          <PolarAngleAxis dataKey="stat" tick={{ fontSize: 12, fill: '#6b7280' }} />
          <PolarRadiusAxis domain={[0, 'auto']} tick={false} axisLine={false} />
          {slots.map((s) => (
            <Radar
              key={s.mon.id}
              name={s.mon.name}
              dataKey={s.mon.name}
              stroke={SERIES_COLORS[s.color]}
              strokeWidth={2}
              fill={SERIES_COLORS[s.color]}
              fillOpacity={0.12}
              dot={{ r: 3, fill: SERIES_COLORS[s.color], stroke: '#fff', strokeWidth: 1 }}
              isAnimationActive={false}
            />
          ))}
          <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

function StatBars({ slots, dists }: { slots: Slot[]; dists: number[][] }) {
  return (
    <div className="space-y-4">
      {STAT_LABELS.map((label, i) => {
        const values = slots.map((s) => (i === 6 ? s.mon.total : s.mon.stats[i]));
        const top = Math.max(...values);
        const scale = i === 6 ? 780 : 255;
        return (
          <div key={label} className="space-y-1">
            <div className="text-xs font-semibold text-muted-foreground">{label}</div>
            {slots.map((s, j) => {
              const v = values[j];
              const isTop = slots.length > 1 && v === top;
              return (
                <div key={s.mon.id} className="grid grid-cols-[1fr_auto] items-center gap-2" title={`${s.mon.name}: ${v}`}>
                  <div className="h-3 rounded-full bg-gray-100">
                    <div
                      className="h-3 rounded-full"
                      style={{ width: `${Math.max(2, (v / scale) * 100)}%`, backgroundColor: SERIES_COLORS[s.color] }}
                    />
                  </div>
                  <div className="flex w-28 items-center justify-end gap-1 text-xs tabular-nums">
                    {isTop && <Crown className="h-3 w-3 text-amber-500" aria-label="highest" />}
                    <span className={cn(isTop ? 'font-bold' : 'font-medium')}>{v}</span>
                    <span className="text-muted-foreground">· top {Math.max(1, 100 - percentile(dists[i], v))}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

// ── Matchups ─────────────────────────────────────────────────────────────────

function HeadToHeadGrid({ slots, chart }: { slots: Slot[]; chart: TypeChart }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-separate border-spacing-1 text-center text-xs">
        <thead>
          <tr>
            <th className="text-left font-medium text-muted-foreground">Attacker ↓ · Defender →</th>
            {slots.map((s) => (
              <th key={s.mon.id} className="min-w-20 font-medium">
                <span className="inline-flex items-center gap-1">
                  <Swatch color={s.color} />
                  {s.mon.name}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {slots.map((a) => (
            <tr key={a.mon.id}>
              <td className="whitespace-nowrap text-left font-medium">
                <span className="inline-flex items-center gap-1">
                  <Swatch color={a.color} />
                  {a.mon.name}
                </span>
              </td>
              {slots.map((d) => {
                if (a.mon.id === d.mon.id) return <td key={d.mon.id} className="rounded-md bg-gray-50 text-gray-300">—</td>;
                const h = headToHead(a.mon, d.mon, chart);
                return (
                  <td key={d.mon.id} className={cn('h-10 rounded-md font-semibold', MULT_CLASS[String(h.best)])}>
                    {MULT_LABEL[String(h.best)]}
                    <div className="text-[10px] font-normal opacity-80">{title(h.type)}</div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SpeedOrder({ slots }: { slots: Slot[] }) {
  const order = [...slots].sort((a, b) => b.mon.stats[5] - a.mon.stats[5]);
  return (
    <p className="flex flex-wrap items-center gap-1.5 text-sm">
      <Zap className="h-4 w-4 text-amber-500" />
      <span className="font-medium">Moves first:</span>
      {order.map((s, i) => (
        <span key={s.mon.id} className="inline-flex items-center gap-1">
          {i > 0 && <span className="text-muted-foreground">{s.mon.stats[5] === order[i - 1].mon.stats[5] ? '=' : '›'}</span>}
          <Swatch color={s.color} />
          {s.mon.name} <span className="text-xs text-muted-foreground">({s.mon.stats[5]})</span>
        </span>
      ))}
    </p>
  );
}

function DefenseChart({ slots, chart, types }: { slots: Slot[]; chart: TypeChart; types: readonly string[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-separate border-spacing-1 text-center text-xs">
        <thead>
          <tr>
            <th className="w-20 text-left font-medium text-muted-foreground">Attack</th>
            {slots.map((s) => (
              <th key={s.mon.id} className="min-w-16 font-medium">
                <span className="inline-flex items-center gap-1">
                  <Swatch color={s.color} />
                  <span className="max-w-24 truncate">{s.mon.name}</span>
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {types.map((t) => (
            <tr key={t}>
              <td className="text-left">
                <TypeBadge type={t} />
              </td>
              {slots.map((s) => {
                const m = multiplier(chart, t, s.mon.types);
                return (
                  <td key={s.mon.id} className={cn('h-7 rounded-md font-semibold', MULT_CLASS[String(m)])}>
                    {MULT_LABEL[String(m)]}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Details ──────────────────────────────────────────────────────────────────

const DETAILS: { label: string; value: (r: ExploreRow) => React.ReactNode }[] = [
  { label: 'Generation', value: (r) => r.generation },
  { label: 'Height', value: (r) => `${r.heightM} m` },
  { label: 'Weight', value: (r) => `${r.weightKg} kg` },
  { label: 'Abilities', value: (r) => r.abilities.join(', ') },
  { label: 'Egg groups', value: (r) => r.eggGroups.map((g) => EGG_GROUP_LABELS[g] ?? title(g)).join(', ') || '—' },
  { label: 'Catch rate', value: (r) => r.captureRate },
  { label: 'Moves learnable', value: (r) => r.moves },
  {
    label: 'Status',
    value: (r) =>
      [r.legendary && 'Legendary', r.mythical && 'Mythical', r.baby && 'Baby', r.mega && 'Mega', r.fullyEvolved ? 'Fully evolved' : 'Can evolve']
        .filter(Boolean)
        .join(' · '),
  },
];

function DetailsTable({ slots }: { slots: Slot[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <tbody>
          {DETAILS.map((d) => (
            <tr key={d.label} className="border-b last:border-0">
              <th className="w-32 py-2 pr-3 text-left align-top text-xs font-medium text-muted-foreground">{d.label}</th>
              {slots.map((s) => (
                <td key={s.mon.id} className="min-w-28 py-2 pr-3 align-top">
                  {d.value(s.mon)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Main ─────────────────────────────────────────────────────────────────────

export default function Compare({
  rows,
  chart,
  types,
  initialIds,
}: {
  rows: ExploreRow[];
  chart: TypeChart;
  types: string[];
  initialIds: number[];
}) {
  const byId = useMemo(() => new Map(rows.map((r) => [r.id, r])), [rows]);
  const dists = useMemo(() => statDistributions(rows), [rows]);
  const [slots, setSlots] = useState<Slot[]>(() =>
    initialIds
      .map((id) => byId.get(id))
      .filter((m): m is ExploreRow => Boolean(m))
      .map((mon, i) => ({ mon, color: i }))
  );
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const query = slots.length ? `?ids=${slots.map((s) => s.mon.id).join(',')}` : '';
    window.history.replaceState(null, '', `${window.location.pathname}${query}`);
  }, [slots]);

  const chosen = useMemo(() => new Set(slots.map((s) => s.mon.id)), [slots]);

  function add(mon: ExploreRow) {
    setSlots((cur) => {
      if (cur.length >= MAX_COMPARE || cur.some((s) => s.mon.id === mon.id)) return cur;
      const used = new Set(cur.map((s) => s.color));
      const color = SERIES_COLORS.findIndex((_, i) => !used.has(i));
      return [...cur, { mon, color }];
    });
  }

  function load(ids: number[]) {
    setSlots(
      ids
        .map((id) => byId.get(id))
        .filter((m): m is ExploreRow => Boolean(m))
        .map((mon, i) => ({ mon, color: i }))
    );
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt('Copy this link:', window.location.href);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start gap-2">
        <div className="min-w-0 flex-1 basis-64">
          <PokemonPicker
            pool={rows}
            exclude={chosen}
            disabled={slots.length >= MAX_COMPARE}
            onPick={add}
            label="Add a Pokémon to compare"
            placeholder={`Add a Pokémon (${slots.length}/${MAX_COMPARE})…`}
            disabledPlaceholder={`Comparing the maximum of ${MAX_COMPARE}. Remove one to swap.`}
          />
        </div>
        <Button variant="outline" className="h-12" onClick={copyLink} disabled={slots.length === 0}>
          {copied ? <Check className="mr-1.5 h-4 w-4" /> : <Link2 className="mr-1.5 h-4 w-4" />}
          {copied ? 'Copied' : 'Share'}
        </Button>
      </div>

      {slots.length < 2 && (
        <div className="flex flex-wrap items-center gap-1.5 text-sm">
          <span className="mr-1 text-muted-foreground">Try:</span>
          {POPULAR.map((p) => (
            <button
              key={p.label}
              type="button"
              onClick={() => load(p.ids)}
              className="rounded-full border border-dashed border-gray-300 bg-white/70 px-3 py-1 text-xs font-medium hover:border-blue-500 hover:text-blue-700"
            >
              {p.label}
            </button>
          ))}
        </div>
      )}

      {slots.length > 0 && (
        <div className={cn('grid gap-3', slots.length === 1 ? 'grid-cols-1 sm:max-w-xs' : 'grid-cols-2', slots.length > 2 && 'lg:grid-cols-4')}>
          {slots.map((s) => (
            <div key={s.mon.id} className="relative overflow-hidden rounded-2xl border bg-white p-3 text-center shadow-sm">
              <div className="absolute inset-x-0 top-0 h-1.5" style={{ backgroundColor: SERIES_COLORS[s.color] }} />
              <button
                type="button"
                onClick={() => setSlots((cur) => cur.filter((x) => x.mon.id !== s.mon.id))}
                aria-label={`Remove ${s.mon.name}`}
                className="absolute right-2 top-3 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
              >
                <X className="h-4 w-4" />
              </button>
              <Image
                src={officialArtworkUrl(s.mon.id)}
                alt={s.mon.name}
                width={120}
                height={120}
                unoptimized
                className="mx-auto mt-2 h-24 w-24 object-contain sm:h-28 sm:w-28"
              />
              <Link href={`/pokemon/${s.mon.id}`} className="mt-1 flex items-center justify-center gap-1.5 font-semibold hover:underline">
                <Swatch color={s.color} />
                <span className="truncate">{s.mon.name}</span>
              </Link>
              <div className="mt-1 flex flex-wrap justify-center gap-1">
                {s.mon.types.map((t) => (
                  <TypeBadge key={t} type={t} />
                ))}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">BST {s.mon.total}</p>
            </div>
          ))}
        </div>
      )}

      {slots.length === 0 ? (
        <p className="rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground">
          Add up to {MAX_COMPARE} Pokémon to compare their stats, matchups and details side by side.
        </p>
      ) : (
        <>
          <Section title="Base stats" description="Bars are on a 0–255 scale (total 0–780); “top x%” compares with every species.">
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
              <div>
                <StatsRadar slots={slots} />
                <div className="flex flex-wrap justify-center gap-3 text-xs">
                  {slots.map((s) => (
                    <span key={s.mon.id} className="inline-flex items-center gap-1">
                      <Swatch color={s.color} />
                      {s.mon.name}
                    </span>
                  ))}
                </div>
              </div>
              <StatBars slots={slots} dists={dists} />
            </div>
          </Section>

          {slots.length > 1 && (
            <Section title="Head to head" description="Best super-effective hit each Pokémon's own types (STAB) land on the others.">
              <SpeedOrder slots={slots} />
              <HeadToHeadGrid slots={slots} chart={chart} />
            </Section>
          )}

          <Section title="Type matchups" description="Damage taken from each attacking type.">
            <DefenseChart slots={slots} chart={chart} types={types} />
          </Section>

          <Section title="Details">
            <DetailsTable slots={slots} />
          </Section>
        </>
      )}
    </div>
  );
}
