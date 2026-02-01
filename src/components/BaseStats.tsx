"use client";

import { useState } from 'react';
import Image from 'next/image';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Cross2Icon } from '@radix-ui/react-icons';
import { cn } from '@/lib/utils';

// ============ Types ============
interface Stat {
  id: number;
  name: string;
  value: number;
}

interface Pokemon {
  id: number;
  name: string;
  stats: Stat[];
  sprite: string;
}

interface BaseStatsProps {
  stats: Stat[];
  pokemonName: string;
}

interface ChartDataPoint {
  name: string;
  fullName: string;
  value: number;
  compareValue?: number;
  color: string;
}

// ============ Constants ============
const STAT_CONFIG: Record<string, { label: string; color: string }> = {
  'hp': { label: 'HP', color: '#FF5959' },
  'attack': { label: 'ATK', color: '#F5AC78' },
  'defense': { label: 'DEF', color: '#FAE078' },
  'special-attack': { label: 'SP.ATK', color: '#9DB7F5' },
  'special-defense': { label: 'SP.DEF', color: '#A7DB8D' },
  'speed': { label: 'SPD', color: '#FA92B2' },
};

const STAT_ORDER = ['hp', 'attack', 'defense', 'special-attack', 'special-defense', 'speed'];
const MAX_STAT = 255;
const PRIMARY_COLOR = '#3b82f6';
const COMPARE_COLOR = '#8b5cf6';

// ============ Utility Functions ============
function sortStats(stats: Stat[]): Stat[] {
  return [...stats].sort((a, b) => STAT_ORDER.indexOf(a.name) - STAT_ORDER.indexOf(b.name));
}

function calculateTotal(stats: Stat[]): number {
  return stats.reduce((sum, stat) => sum + stat.value, 0);
}

function formatChartData(stats: Stat[], compareStats?: Stat[] | null): ChartDataPoint[] {
  return stats.map((stat, index) => {
    const config = STAT_CONFIG[stat.name] || { label: stat.name, color: '#9ca3af' };
    return {
      name: config.label,
      fullName: stat.name,
      value: stat.value,
      compareValue: compareStats?.[index]?.value,
      color: config.color,
    };
  });
}

// ============ Sub-Components ============
interface CompareSearchProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onSearch: () => void;
  isLoading: boolean;
  error: string | null;
  comparePokemon: Pokemon | null;
  onClear: () => void;
}

function CompareSearch({
  searchQuery,
  setSearchQuery,
  onSearch,
  isLoading,
  error,
  comparePokemon,
  onClear,
}: CompareSearchProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') onSearch();
  };

  return (
    <div className="p-3 bg-muted/50 rounded-md space-y-3">
      <div className="flex gap-2">
        <Input
          type="text"
          placeholder="Enter Pokémon name or number..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 h-9"
        />
        <Button onClick={onSearch} disabled={isLoading} size="sm">
          {isLoading ? '...' : 'Search'}
        </Button>
      </div>
      {error && <p className="text-destructive text-sm">{error}</p>}
      {comparePokemon && (
        <div className="flex items-center justify-between p-2 bg-background rounded-md border">
          <div className="flex items-center gap-2">
            <Image
              src={comparePokemon.sprite}
              alt={comparePokemon.name}
              width={40}
              height={40}
              unoptimized
            />
            <span className="font-medium capitalize">{comparePokemon.name}</span>
            <span className="text-muted-foreground text-sm">#{comparePokemon.id}</span>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClear}>
            <Cross2Icon className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}

interface PokemonLegendProps {
  pokemonName: string;
  comparePokemonName: string;
}

function PokemonLegend({ pokemonName, comparePokemonName }: PokemonLegendProps) {
  return (
    <div className="flex justify-end gap-4 text-sm">
      <div className="flex items-center gap-1.5">
        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: PRIMARY_COLOR }} />
        <span className="capitalize">{pokemonName}</span>
      </div>
      <div className="flex items-center gap-1.5">
        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COMPARE_COLOR }} />
        <span className="capitalize">{comparePokemonName}</span>
      </div>
    </div>
  );
}

interface StatTotalProps {
  total: number;
  compareTotal?: number;
}

function StatTotal({ total, compareTotal }: StatTotalProps) {
  const diff = compareTotal !== undefined ? total - compareTotal : 0;

  return (
    <div className="pt-3 mt-3 border-t border-border">
      <div className="flex items-center justify-between">
        <span className="text-sm font-bold text-foreground">Total</span>
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-foreground">{total}</span>
          {compareTotal !== undefined && (
            <>
              <span className="text-sm text-muted-foreground">vs</span>
              <span className="text-lg font-bold" style={{ color: COMPARE_COLOR }}>{compareTotal}</span>
              <Badge
                variant="secondary"
                className={cn(
                  "text-xs font-medium",
                  diff > 0 && "bg-green-100 text-green-600",
                  diff < 0 && "bg-red-100 text-red-600",
                  diff === 0 && "bg-muted text-muted-foreground"
                )}
              >
                {diff > 0 ? '+' : ''}{diff}
              </Badge>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

interface StatsBarChartProps {
  data: ChartDataPoint[];
  showCompare: boolean;
}

function StatsBarChart({ data, showCompare }: StatsBarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 50, bottom: 5 }}>
        <XAxis type="number" domain={[0, MAX_STAT]} tick={{ fontSize: 12 }} />
        <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={50} />
        <Tooltip
          contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
          formatter={(value: number, name: string) => [value, name === 'value' ? 'Base' : 'Compare']}
        />
        <Bar dataKey="value" radius={[0, 4, 4, 0]}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Bar>
        {showCompare && (
          <Bar dataKey="compareValue" fill={COMPARE_COLOR} opacity={0.6} radius={[0, 4, 4, 0]} />
        )}
      </BarChart>
    </ResponsiveContainer>
  );
}

interface StatsRadarChartProps {
  data: ChartDataPoint[];
  showCompare: boolean;
  pokemonName: string;
  comparePokemonName?: string;
}

function StatsRadarChart({ data, showCompare, pokemonName, comparePokemonName }: StatsRadarChartProps) {
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
        {showCompare && comparePokemonName && (
          <Radar
            name={comparePokemonName}
            dataKey="compareValue"
            stroke={COMPARE_COLOR}
            fill={COMPARE_COLOR}
            fillOpacity={0.3}
            strokeWidth={2}
          />
        )}
        <Legend />
        <Tooltip
          contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}

// ============ Main Component ============
export default function BaseStats({ stats, pokemonName }: BaseStatsProps) {
  const [view, setView] = useState<'bars' | 'radar'>('bars');
  const [compareMode, setCompareMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [comparePokemon, setComparePokemon] = useState<Pokemon | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sortedStats = sortStats(stats);
  const total = calculateTotal(stats);

  const compareStats = comparePokemon ? sortStats(comparePokemon.stats) : null;
  const compareTotal = comparePokemon ? calculateTotal(comparePokemon.stats) : undefined;

  const chartData = formatChartData(sortedStats, compareStats);

  const searchPokemon = async () => {
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${searchQuery.toLowerCase().trim()}`);
      if (!res.ok) throw new Error('Pokémon not found');

      const data = await res.json();

      setComparePokemon({
        id: data.id,
        name: data.name,
        sprite: data.sprites.front_default,
        stats: data.stats.map((s: { stat: { name: string }; base_stat: number }, index: number) => ({
          id: index,
          name: s.stat.name,
          value: s.base_stat,
        })),
      });
    } catch {
      setError('Pokémon not found. Try a name or number.');
      setComparePokemon(null);
    } finally {
      setIsLoading(false);
    }
  };

  const clearComparison = () => {
    setComparePokemon(null);
    setSearchQuery('');
    setError(null);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Base Stats</CardTitle>
          <div className="flex gap-2">
            <Button
              variant={compareMode ? "default" : "secondary"}
              size="sm"
              onClick={() => setCompareMode(!compareMode)}
            >
              Compare
            </Button>
            <Tabs value={view} onValueChange={(v) => setView(v as 'bars' | 'radar')}>
              <TabsList className="h-8">
                <TabsTrigger value="bars" className="text-xs px-3">Bars</TabsTrigger>
                <TabsTrigger value="radar" className="text-xs px-3">Radar</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {compareMode && (
          <CompareSearch
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onSearch={searchPokemon}
            isLoading={isLoading}
            error={error}
            comparePokemon={comparePokemon}
            onClear={clearComparison}
          />
        )}

        {compareMode && comparePokemon && (
          <PokemonLegend pokemonName={pokemonName} comparePokemonName={comparePokemon.name} />
        )}

        {view === 'bars' ? (
          <StatsBarChart data={chartData} showCompare={compareMode && !!comparePokemon} />
        ) : (
          <StatsRadarChart
            data={chartData}
            showCompare={compareMode && !!comparePokemon}
            pokemonName={pokemonName}
            comparePokemonName={comparePokemon?.name}
          />
        )}

        <StatTotal total={total} compareTotal={compareMode ? compareTotal : undefined} />
      </CardContent>
    </Card>
  );
}