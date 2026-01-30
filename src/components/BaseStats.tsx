"use client";

import { useState } from 'react';

interface Stat {
  id: number;
  name: string;
  value: number;
}

interface BaseStatsProps {
  stats: Stat[];
  primaryColor?: string;
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

export default function BaseStats({ stats, primaryColor = '#8b5cf6' }: BaseStatsProps) {
  const [view, setView] = useState<'bars' | 'radar'>('bars');
  
  const sortedStats = [...stats].sort(
    (a, b) => statOrder.indexOf(a.name) - statOrder.indexOf(b.name)
  );
  
  const total = stats.reduce((sum, stat) => sum + stat.value, 0);
  const maxStat = 255;
  
  return (
    <div className="bg-white rounded-2xl shadow-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Base Stats</h2>
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

      {view === 'bars' ? (
        <div className="space-y-3">
          {sortedStats.map((stat) => {
            const config = statConfig[stat.name] || { label: stat.name, color: '#9ca3af' };
            return (
              <div key={stat.id} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">
                    {config.label}
                  </span>
                  <span className="text-sm font-bold text-gray-900">{stat.value}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="h-2.5 rounded-full transition-all duration-500"
                    style={{ 
                      width: `${Math.min(stat.value / maxStat * 100, 100)}%`,
                      backgroundColor: config.color,
                    }}
                  />
                </div>
              </div>
            );
          })}
          
          <div className="pt-3 mt-3 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-gray-700">Total</span>
              <span className="text-lg font-bold text-gray-800">
                {total}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <RadarChart stats={sortedStats} />
      )}
    </div>
  );
}

interface RadarChartProps {
  stats: Stat[];
}

function RadarChart({ stats }: RadarChartProps) {
  const size = 300;
  const center = size / 2;
  const maxValue = 255;
  const levels = 4;
  const radius = 110;
  
  // Calculate points for each stat
  const angleStep = (2 * Math.PI) / stats.length;
  const startAngle = -Math.PI / 2; // Start from top
  
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
  
  // Create polygon points for the stat values
  const statPoints = stats.map((stat, i) => getPoint(stat.value, i));
  const polygonPoints = statPoints.map(p => `${p.x},${p.y}`).join(' ');
  
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
        
        {/* Stat polygon */}
        <polygon
          points={polygonPoints}
          fill="#8b5cf6"
          fillOpacity="0.5"
          stroke="#8b5cf6"
          strokeWidth="2"
        />
        
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
      
      {/* Total */}
      <div className="mt-2 text-center">
        <span className="text-sm text-gray-500">Total: </span>
        <span className="text-lg font-bold text-gray-800">
          {stats.reduce((sum, s) => sum + s.value, 0)}
        </span>
      </div>
    </div>
  );
}