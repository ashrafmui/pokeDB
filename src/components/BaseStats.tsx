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

interface BaseStatsProps {
  stats: Stat[];
  pokemonName: string;
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

export default function BaseStats({ stats, pokemonName }: BaseStatsProps) {
  const radarData = formatRadarData(sortStats(stats));
  return <StatsRadarChart data={radarData} pokemonName={pokemonName} />;
}
