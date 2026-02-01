"use client";

import { useState } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Cross2Icon } from '@radix-ui/react-icons';
import { cn } from '@/lib/utils';

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

const statConfig: Record<string, { label: string; color: string }> = {
  'hp': { label: 'HP', color: '#FF5959' },
  'attack': { label: 'ATK', color: '#F5AC78' },
  'defense': { label: 'DEF', color: '#FAE078' },
  'special-attack': { label: 'SP. ATK', color: '#9DB7F5' },
  'special-defense': { label: 'SP. DEF', color: '#A7DB8D' },
  'speed': { label: 'SPEED', color: '#FA92B2' },
};

const statOrder = ['hp', 'attack', 'defense', 'special-attack', 'special-defense', 'speed'];

export default function BaseStats({ stats, pokemonName }: BaseStatsProps) {
  const [view, setView] = useState<'bars' | 'radar'>('bars');
  const [compareMode, setCompareMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [comparePokemon, setComparePokemon] = useState<Pokemon | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const sortedStats = [...stats].sort(
    (a, b) => statOrder.indexOf(a.name) - statOrder.indexOf(b.name)
  );
  
  const total = stats.reduce((sum, stat) => sum + stat.value, 0);
  const maxStat = 255;

  interface PokeAPIStat {
    stat: { name: string };
    base_stat: number;
  }

  const searchPokemon = async () => {
    if (!searchQuery.trim()) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${searchQuery.toLowerCase().trim()}`);
      if (!res.ok) throw new Error('Pokémon not found');
      
      const data = await res.json();
      
      const pokemonData: Pokemon = {
        id: data.id,
        name: data.name,
        sprite: data.sprites.front_default,
        stats: data.stats.map((s: PokeAPIStat, index: number) => ({
          id: index,
          name: s.stat.name,
          value: s.base_stat,
        })),
      };
      
      setComparePokemon(pokemonData);
    } catch (err) {
      setError('Pokémon not found. Try a name or number.');
      setComparePokemon(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      searchPokemon();
    }
  };

  const clearComparison = () => {
    setComparePokemon(null);
    setSearchQuery('');
    setError(null);
  };

  const compareStats = comparePokemon 
    ? [...comparePokemon.stats].sort((a, b) => statOrder.indexOf(a.name) - statOrder.indexOf(b.name))
    : null;
  
  const compareTotal = comparePokemon 
    ? comparePokemon.stats.reduce((sum, stat) => sum + stat.value, 0)
    : 0;

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
        {/* Compare Search */}
        {compareMode && (
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
              <Button
                onClick={searchPokemon}
                disabled={isLoading}
                size="sm"
              >
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
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={clearComparison}
                >
                  <Cross2Icon className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Pokemon Labels */}
        {compareMode && comparePokemon && (
          <div className="flex justify-end gap-4 text-sm">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <span className="capitalize">{pokemonName}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-purple-500" />
              <span className="capitalize">{comparePokemon.name}</span>
            </div>
          </div>
        )}

        {view === 'bars' ? (
          <div className="space-y-3">
            {sortedStats.map((stat, index) => {
              const config = statConfig[stat.name] || { label: stat.name, color: '#9ca3af' };
              const compareStat = compareStats?.[index];
              const diff = compareStat ? stat.value - compareStat.value : 0;
              
              return (
                <div key={stat.id} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">
                      {config.label}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-foreground">{stat.value}</span>
                      {compareMode && compareStat && (
                        <>
                          <span className="text-sm text-muted-foreground">vs</span>
                          <span className="text-sm font-bold text-purple-600">{compareStat.value}</span>
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
                  <div className="relative w-full bg-muted rounded-full h-2.5">
                    <div
                      className="absolute h-2.5 rounded-full transition-all duration-500"
                      style={{ 
                        width: `${Math.min(stat.value / maxStat * 100, 100)}%`,
                        backgroundColor: config.color,
                      }}
                    />
                    {compareMode && compareStat && (
                      <div
                        className="absolute h-2.5 rounded-full transition-all duration-500 opacity-50"
                        style={{ 
                          width: `${Math.min(compareStat.value / maxStat * 100, 100)}%`,
                          backgroundColor: '#8b5cf6',
                        }}
                      />
                    )}
                  </div>
                </div>
              );
            })}
            
            <div className="pt-3 mt-3 border-t border-border">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-foreground">Total</span>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-foreground">{total}</span>
                  {compareMode && comparePokemon && (
                    <>
                      <span className="text-sm text-muted-foreground">vs</span>
                      <span className="text-lg font-bold text-purple-600">{compareTotal}</span>
                      <Badge 
                        variant="secondary"
                        className={cn(
                          "text-xs font-medium",
                          total - compareTotal > 0 && "bg-green-100 text-green-600",
                          total - compareTotal < 0 && "bg-red-100 text-red-600",
                          total - compareTotal === 0 && "bg-muted text-muted-foreground"
                        )}
                      >
                        {total - compareTotal > 0 ? '+' : ''}{total - compareTotal}
                      </Badge>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <RadarChart 
            stats={sortedStats} 
            compareStats={compareMode ? compareStats : null}
            pokemonName={pokemonName}
            comparePokemonName={comparePokemon?.name}
          />
        )}
      </CardContent>
    </Card>
  );
}

interface RadarChartProps {
  stats: Stat[];
  compareStats: Stat[] | null;
  pokemonName: string;
  comparePokemonName?: string;
}

function RadarChart({ stats, compareStats, pokemonName, comparePokemonName }: RadarChartProps) {
  const size = 300;
  const center = size / 2;
  const maxValue = 255;
  const levels = 4;
  const radius = 110;
  
  const angleStep = (2 * Math.PI) / stats.length;
  const startAngle = -Math.PI / 2;
  
  const getPoint = (value: number, index: number) => {
    const angle = startAngle + index * angleStep;
    const r = (value / maxValue) * radius;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    };
  };
  
  const getLevelPoint = (level: number, index: number) => {
    const angle = startAngle + index * angleStep;
    const r = (level / levels) * radius;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    };
  };
  
  const statPoints = stats.map((stat, i) => getPoint(stat.value, i));
  const polygonPoints = statPoints.map(p => `${p.x},${p.y}`).join(' ');
  
  const comparePoints = compareStats?.map((stat, i) => getPoint(stat.value, i));
  const comparePolygonPoints = comparePoints?.map(p => `${p.x},${p.y}`).join(' ');
  
  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} className="overflow-visible">
        {/* Background levels */}
        {Array.from({ length: levels }, (_, level) => {
          const levelPoints = stats.map((_, i) => getLevelPoint(level + 1, i));
          const levelPolygon = levelPoints.map(p => `${p.x},${p.y}`).join(' ');
          return (
            <polygon
              key={level}
              points={levelPolygon}
              fill="none"
              className="stroke-border"
              strokeWidth="1"
            />
          );
        })}
        
        {/* Axis lines */}
        {stats.map((_, i) => {
          const endPoint = getLevelPoint(levels, i);
          return (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={endPoint.x}
              y2={endPoint.y}
              className="stroke-border"
              strokeWidth="1"
            />
          );
        })}
        
        {/* Compare polygon (render first so it's behind) */}
        {comparePolygonPoints && (
          <polygon
            points={comparePolygonPoints}
            fill="#8b5cf6"
            fillOpacity="0.3"
            stroke="#8b5cf6"
            strokeWidth="2"
          />
        )}
        
        {/* Main stat polygon */}
        <polygon
          points={polygonPoints}
          fill="#3b82f6"
          fillOpacity="0.4"
          stroke="#3b82f6"
          strokeWidth="2"
        />
        
        {/* Compare points */}
        {comparePoints?.map((point, i) => (
          <circle
            key={`compare-${i}`}
            cx={point.x}
            cy={point.y}
            r="4"
            fill="#8b5cf6"
            stroke="#fff"
            strokeWidth="2"
          />
        ))}
        
        {/* Stat points with individual colors */}
        {statPoints.map((point, i) => {
          const config = statConfig[stats[i].name] || { color: '#9ca3af' };
          return (
            <circle
              key={i}
              cx={point.x}
              cy={point.y}
              r="5"
              fill={config.color}
              stroke="#fff"
              strokeWidth="2"
            />
          );
        })}
        
        {/* Labels with stat colors */}
        {stats.map((stat, i) => {
          const angle = startAngle + i * angleStep;
          const labelRadius = radius + 30;
          const x = center + labelRadius * Math.cos(angle);
          const y = center + labelRadius * Math.sin(angle);
          const config = statConfig[stat.name] || { label: stat.name, color: '#9ca3af' };
          
          return (
            <text
              key={i}
              x={x}
              y={y}
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-xs font-semibold"
              fill={config.color}
            >
              {config.label}
            </text>
          );
        })}
        
        {/* Value labels */}
        {stats.map((stat, i) => {
          const point = getPoint(stat.value, i);
          const angle = startAngle + i * angleStep;
          const offsetX = 15 * Math.cos(angle);
          const offsetY = 15 * Math.sin(angle);
          
          return (
            <text
              key={`val-${i}`}
              x={point.x + offsetX}
              y={point.y + offsetY}
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-xs font-bold fill-foreground"
            >
              {stat.value}
            </text>
          );
        })}
      </svg>
      
      {/* Legend */}
      {compareStats && (
        <div className="flex gap-4 mt-2 text-sm">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span className="capitalize">{pokemonName}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-purple-500" />
            <span className="capitalize">{comparePokemonName}</span>
          </div>
        </div>
      )}
      
      {/* Total */}
      <div className="mt-2 text-center">
        <span className="text-sm text-muted-foreground">Total: </span>
        <span className="text-lg font-bold text-foreground">
          {stats.reduce((sum, s) => sum + s.value, 0)}
        </span>
        {compareStats && (
          <>
            <span className="text-sm text-muted-foreground mx-2">vs</span>
            <span className="text-lg font-bold text-purple-600">
              {compareStats.reduce((sum, s) => sum + s.value, 0)}
            </span>
          </>
        )}
      </div>
    </div>
  );
}