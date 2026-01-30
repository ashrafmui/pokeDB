"use client";

import { useState } from 'react';
import Image from 'next/image';

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
  pokemonId: number;
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

export default function BaseStats({ stats, pokemonName, pokemonId }: BaseStatsProps) {
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
        stats: data.stats.map((s: any, index: number) => ({
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
    <div className="bg-white rounded-2xl shadow-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Base Stats</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setCompareMode(!compareMode)}
            className={`px-3 py-1 text-sm rounded-lg transition-colors ${
              compareMode 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Compare
          </button>
          <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setView('bars')}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                view === 'bars' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Bars
            </button>
            <button
              onClick={() => setView('radar')}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                view === 'radar' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Radar
            </button>
          </div>
        </div>
      </div>

      {/* Compare Search */}
      {compareMode && (
        <div className="mb-4 p-3 bg-gray-50 rounded-xl">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Enter Pokémon name or number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={searchPokemon}
              disabled={isLoading}
              className="px-4 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
            >
              {isLoading ? '...' : 'Search'}
            </button>
          </div>
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          
          {comparePokemon && (
            <div className="flex items-center justify-between mt-3 p-2 bg-white rounded-lg">
              <div className="flex items-center gap-2">
                <Image
                  src={comparePokemon.sprite}
                  alt={comparePokemon.name}
                  width={40}
                  height={40}
                  unoptimized
                />
                <span className="font-medium capitalize">{comparePokemon.name}</span>
                <span className="text-gray-400 text-sm">#{comparePokemon.id}</span>
              </div>
              <button
                onClick={clearComparison}
                className="text-gray-400 hover:text-gray-600 text-lg px-2"
              >
                ×
              </button>
            </div>
          )}
        </div>
      )}

      {/* Pokemon Labels */}
      {compareMode && comparePokemon && (
        <div className="flex justify-end gap-4 mb-2 text-sm">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span className="capitalize">{pokemonName}</span>
          </div>
          <div className="flex items-center gap-1">
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
                  <span className="text-sm font-medium text-gray-600">
                    {config.label}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-gray-900">{stat.value}</span>
                    {compareMode && compareStat && (
                      <>
                        <span className="text-sm text-gray-400">vs</span>
                        <span className="text-sm font-bold text-purple-600">{compareStat.value}</span>
                        <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${
                          diff > 0 ? 'bg-green-100 text-green-600' : 
                          diff < 0 ? 'bg-red-100 text-red-600' : 
                          'bg-gray-100 text-gray-500'
                        }`}>
                          {diff > 0 ? '+' : ''}{diff}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <div className="relative w-full bg-gray-200 rounded-full h-2.5">
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
          
          <div className="pt-3 mt-3 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-gray-700">Total</span>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-gray-800">{total}</span>
                {compareMode && comparePokemon && (
                  <>
                    <span className="text-sm text-gray-400">vs</span>
                    <span className="text-lg font-bold text-purple-600">{compareTotal}</span>
                    <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${
                      total - compareTotal > 0 ? 'bg-green-100 text-green-600' : 
                      total - compareTotal < 0 ? 'bg-red-100 text-red-600' : 
                      'bg-gray-100 text-gray-500'
                    }`}>
                      {total - compareTotal > 0 ? '+' : ''}{total - compareTotal}
                    </span>
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
    </div>
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
              stroke="#e5e7eb"
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
              stroke="#e5e7eb"
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
              className="text-xs font-bold fill-gray-700"
            >
              {stat.value}
            </text>
          );
        })}
      </svg>
      
      {/* Legend */}
      {compareStats && (
        <div className="flex gap-4 mt-2 text-sm">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span className="capitalize">{pokemonName}</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-purple-500" />
            <span className="capitalize">{comparePokemonName}</span>
          </div>
        </div>
      )}
      
      {/* Total */}
      <div className="mt-2 text-center">
        <span className="text-sm text-gray-500">Total: </span>
        <span className="text-lg font-bold text-gray-800">
          {stats.reduce((sum, s) => sum + s.value, 0)}
        </span>
        {compareStats && (
          <>
            <span className="text-sm text-gray-400 mx-2">vs</span>
            <span className="text-lg font-bold text-purple-600">
              {compareStats.reduce((sum, s) => sum + s.value, 0)}
            </span>
          </>
        )}
      </div>
    </div>
  );
}