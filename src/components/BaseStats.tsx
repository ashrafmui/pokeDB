"use client";

import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';

interface Stat {
  id: number;
  name: string;
  value: number;
}

export interface StatComparison {
  key: string;
  value: number;
  percentile: number;
  rank: number;
  outOf: number;
}

interface BaseStatsProps {
  stats: Stat[];
  pokemonName: string;
  /** How each stat compares with all Pokémon, from src/lib/dex.ts. */
  comparisons?: StatComparison[];
}

// Keys used by src/lib/dex.ts → labels shown in the comparison list.
const COMPARISON_LABELS: Record<string, string> = {
  hp: 'HP',
  attack: 'Attack',
  defense: 'Defense',
  specialAttack: 'Sp. Atk',
  specialDefense: 'Sp. Def',
  speed: 'Speed',
  total: 'Total',
};

function percentileColor(percentile: number): string {
  if (percentile >= 90) return 'bg-emerald-500';
  if (percentile >= 65) return 'bg-lime-500';
  if (percentile >= 35) return 'bg-amber-400';
  if (percentile >= 10) return 'bg-orange-500';
  return 'bg-red-500';
}

function StatComparisons({ comparisons }: { comparisons: StatComparison[] }) {
  return (
    <div className="space-y-1.5 px-2 pb-2">
      <p className="text-[11px] text-muted-foreground">
        Compared with all {comparisons[0]?.outOf.toLocaleString()} Pokémon
      </p>
      {comparisons.map((c) => (
        <div
          key={c.key}
          className={`grid grid-cols-[52px_32px_1fr_40px] items-center gap-2 text-xs ${c.key === 'total' ? 'pt-1.5 border-t border-border/50 font-medium' : ''}`}
          title={`Higher than ${c.percentile}% of Pokémon · rank #${c.rank} of ${c.outOf.toLocaleString()}`}
        >
          <span className="text-muted-foreground">{COMPARISON_LABELS[c.key] ?? c.key}</span>
          <span className="tabular-nums text-right">{c.value}</span>
          <div className="h-1.5 rounded-full bg-muted overflow-hidden">
            <div className={`h-full rounded-full ${percentileColor(c.percentile)}`} style={{ width: `${Math.max(c.percentile, 2)}%` }} />
          </div>
          <span className="tabular-nums text-right text-muted-foreground">#{c.rank}</span>
        </div>
      ))}
    </div>
  );
}

interface RadarDataPoint {
  name: string;
  value: number;
}

const STAT_CONFIG: Record<string, { label: string }> = {
  'hp': { label: 'HP' },
  'attack': { label: 'ATK' },
  'defense': { label: 'DEF' },
  'special-attack': { label: 'SP. ATK' },
  'special-defense': { label: 'SP. DEF' },
  'speed': { label: 'SPEED' },
};

const STAT_ORDER = ['hp', 'attack', 'defense', 'special-attack', 'special-defense', 'speed'];
const MAX_STAT = 255;
const PRIMARY_COLOR = '#3b82f6';

function sortStats(stats: Stat[]): Stat[] {
  return [...stats].sort((a, b) => STAT_ORDER.indexOf(a.name) - STAT_ORDER.indexOf(b.name));
}

function formatRadarData(stats: Stat[]): RadarDataPoint[] {
  return stats.map((stat) => {
    const config = STAT_CONFIG[stat.name] ?? { label: stat.name };
    return { name: config.label, value: stat.value };
  });
}

function StatsRadarChart({ data, pokemonName }: { data: RadarDataPoint[]; pokemonName: string }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <RadarChart data={data} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
        <PolarGrid stroke="hsl(var(--border))" />
        <PolarAngleAxis
          dataKey="name"
          tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
        />
        <PolarRadiusAxis
          angle={90}
          domain={[0, MAX_STAT]}
          tick={{ fontSize: 10 }}
          tickCount={4}
        />
        <Radar
          name={pokemonName}
          dataKey="value"
          stroke={PRIMARY_COLOR}
          fill={PRIMARY_COLOR}
          fillOpacity={0.4}
          strokeWidth={2}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
          }}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}

export default function BaseStats({ stats, pokemonName, comparisons }: BaseStatsProps) {
  const radarData = formatRadarData(sortStats(stats));
  return (
    <div>
      <StatsRadarChart data={radarData} pokemonName={pokemonName} />
      {comparisons && comparisons.length > 0 && <StatComparisons comparisons={comparisons} />}
    </div>
  );
}
