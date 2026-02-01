"use client";

import { useState } from 'react';
import Image from 'next/image';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Cell,
  ResponsiveContainer,
  Tooltip,
  ReferenceLine,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { calculateTypeEffectiveness } from '@/lib/typeUtils';

// ============ Types ============
interface TypeEffectivenessProps {
  types: { name: string; [key: string]: unknown }[];
}

interface ChartDataPoint {
  type: string;
  multiplier: number;
  displayMultiplier: string;
  color: string;
}

// ============ Constants ============
const MULTIPLIER_CONFIG: Record<string, { color: string; label: string }> = {
  '4': { color: '#ef4444', label: '4×' },
  '2': { color: '#f87171', label: '2×' },
  '0.5': { color: '#4ade80', label: '½×' },
  '0.25': { color: '#22c55e', label: '¼×' },
  '0': { color: '#60a5fa', label: '0×' },
};

const BORDER_COLORS: Record<string, string> = {
  '4x': 'border-red-500',
  '2x': 'border-red-400',
  '0.5x': 'border-green-400',
  '0.25x': 'border-green-500',
  '0x': 'border-blue-400',
};

const ALL_TYPES = [
  'normal', 'fire', 'water', 'electric', 'grass', 'ice',
  'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug',
  'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy'
];

// ============ Utility Functions ============
function getMultiplierForType(
  typeName: string,
  effectiveness: ReturnType<typeof calculateTypeEffectiveness>
): number {
  if (effectiveness.immunity.includes(typeName)) return 0;
  if (effectiveness.quadResistance.includes(typeName)) return 0.25;
  if (effectiveness.resistance.includes(typeName)) return 0.5;
  if (effectiveness.quadWeakness.includes(typeName)) return 4;
  if (effectiveness.doubleWeakness.includes(typeName)) return 2;
  return 1;
}

function getColorForMultiplier(multiplier: number): string {
  if (multiplier === 0) return MULTIPLIER_CONFIG['0'].color;
  if (multiplier === 0.25) return MULTIPLIER_CONFIG['0.25'].color;
  if (multiplier === 0.5) return MULTIPLIER_CONFIG['0.5'].color;
  if (multiplier === 2) return MULTIPLIER_CONFIG['2'].color;
  if (multiplier === 4) return MULTIPLIER_CONFIG['4'].color;
  return '#9ca3af'; // neutral
}

function formatMultiplier(multiplier: number): string {
  if (multiplier === 0) return '0×';
  if (multiplier === 0.25) return '¼×';
  if (multiplier === 0.5) return '½×';
  if (multiplier === 1) return '1×';
  if (multiplier === 2) return '2×';
  if (multiplier === 4) return '4×';
  return `${multiplier}×`;
}

function formatChartData(
  effectiveness: ReturnType<typeof calculateTypeEffectiveness>
): ChartDataPoint[] {
  return ALL_TYPES.map((type) => {
    const multiplier = getMultiplierForType(type, effectiveness);
    return {
      type: type.charAt(0).toUpperCase() + type.slice(1),
      multiplier,
      displayMultiplier: formatMultiplier(multiplier),
      color: getColorForMultiplier(multiplier),
    };
  });
}

// ============ Sub-Components ============
interface TypeIconProps {
  typeName: string;
  borderColor: string;
}

function TypeIcon({ typeName, borderColor }: TypeIconProps) {
  return (
    <div className={`w-8 h-8 rounded-full overflow-hidden border-2 ${borderColor}`}>
      <Image
        src={`https://raw.githubusercontent.com/msikma/pokesprite/master/misc/types/gen8/${typeName}.png`}
        alt={typeName}
        width={32}
        height={32}
        unoptimized
        className="w-full h-full object-cover"
      />
    </div>
  );
}

interface TypeIconsViewProps {
  effectiveness: ReturnType<typeof calculateTypeEffectiveness>;
}

function TypeIconsView({ effectiveness }: TypeIconsViewProps) {
  const sections = [
    { label: 'Weak to (4×)', types: effectiveness.quadWeakness, borderColor: BORDER_COLORS['4x'] },
    { label: 'Weak to (2×)', types: effectiveness.doubleWeakness, borderColor: BORDER_COLORS['2x'] },
    { label: 'Resists (½×)', types: effectiveness.resistance, borderColor: BORDER_COLORS['0.5x'] },
    { label: 'Resists (¼×)', types: effectiveness.quadResistance, borderColor: BORDER_COLORS['0.25x'] },
    { label: 'Immune (0×)', types: effectiveness.immunity, borderColor: BORDER_COLORS['0x'] },
  ].filter((s) => s.types.length > 0);

  if (sections.length === 0) {
    return <p className="text-sm text-muted-foreground">No special type interactions</p>;
  }

  return (
    <div className="space-y-4">
      {sections.map((section) => (
        <div key={section.label}>
          <p className="text-xs text-muted-foreground mb-2">{section.label}</p>
          <div className="flex flex-wrap gap-2">
            {section.types.map((type) => (
              <TypeIcon key={type} typeName={type} borderColor={section.borderColor} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: ChartDataPoint }>;
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0].payload;
  return (
    <div className="bg-card border border-border rounded-md p-2 shadow-lg">
      <div className="flex items-center gap-2">
        <Image
          src={`https://raw.githubusercontent.com/msikma/pokesprite/master/misc/types/gen8/${data.type.toLowerCase()}.png`}
          alt={data.type}
          width={24}
          height={24}
          unoptimized
        />
        <span className="font-medium">{data.type}</span>
        <span className="font-bold" style={{ color: data.color }}>
          {data.displayMultiplier}
        </span>
      </div>
    </div>
  );
}

interface TypeChartViewProps {
  data: ChartDataPoint[];
}

function TypeChartView({ data }: TypeChartViewProps) {
  // Transform data for logarithmic-like display
  // Map: 0 -> -2, 0.25 -> -1.5, 0.5 -> -1, 1 -> 0, 2 -> 1, 4 -> 2
  const transformedData = data.map((d) => ({
    ...d,
    chartValue:
      d.multiplier === 0 ? -2 :
      d.multiplier === 0.25 ? -1.5 :
      d.multiplier === 0.5 ? -1 :
      d.multiplier === 1 ? 0 :
      d.multiplier === 2 ? 1 :
      d.multiplier === 4 ? 2 : 0,
  }));

  return (
    <div className="space-y-4">
      <ResponsiveContainer width="100%" height={350}>
        <BarChart
          data={transformedData}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 60, bottom: 5 }}
        >
          <XAxis
            type="number"
            domain={[-2.5, 2.5]}
            ticks={[-2, -1.5, -1, 0, 1, 2]}
            tickFormatter={(value) => {
              const labels: Record<number, string> = {
                '-2': '0×',
                '-1.5': '¼×',
                '-1': '½×',
                '0': '1×',
                '1': '2×',
                '2': '4×',
              };
              return labels[value] || '';
            }}
            tick={{ fontSize: 11 }}
          />
          <YAxis
            type="category"
            dataKey="type"
            tick={{ fontSize: 11 }}
            width={55}
          />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine x={0} stroke="hsl(var(--border))" strokeWidth={2} />
          <Bar dataKey="chartValue" radius={[0, 4, 4, 0]}>
            {transformedData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-3 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: MULTIPLIER_CONFIG['4'].color }} />
          <span>4× (Super Weak)</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: MULTIPLIER_CONFIG['2'].color }} />
          <span>2× (Weak)</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-gray-400" />
          <span>1× (Neutral)</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: MULTIPLIER_CONFIG['0.5'].color }} />
          <span>½× (Resist)</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: MULTIPLIER_CONFIG['0.25'].color }} />
          <span>¼× (Double Resist)</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: MULTIPLIER_CONFIG['0'].color }} />
          <span>0× (Immune)</span>
        </div>
      </div>
    </div>
  );
}

// ============ Main Component ============
export default function TypeEffectiveness({ types }: TypeEffectivenessProps) {
  const [view, setView] = useState<'icons' | 'chart'>('icons');

  const typeNames = types.map((t) => t.name.toLowerCase());
  const effectiveness = calculateTypeEffectiveness(typeNames);
  const chartData = formatChartData(effectiveness);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Type Effectiveness</CardTitle>
          <Tabs value={view} onValueChange={(v) => setView(v as 'icons' | 'chart')}>
            <TabsList className="h-8">
              <TabsTrigger value="icons" className="text-xs px-3">Icons</TabsTrigger>
              <TabsTrigger value="chart" className="text-xs px-3">Chart</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent>
        {view === 'icons' ? (
          <TypeIconsView effectiveness={effectiveness} />
        ) : (
          <TypeChartView data={chartData} />
        )}
      </CardContent>
    </Card>
  );
}