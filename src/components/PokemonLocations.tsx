'use client';

import { useEffect, useState } from 'react';
import { getVersionColor } from '@/lib/versionColors';

interface EncounterDetail {
  chance: number;
  max_level: number;
  min_level: number;
  method: { name: string };
  condition_values: { name: string }[];
}

interface VersionDetail {
  version: { name: string };
  max_chance: number;
  encounter_details: EncounterDetail[];
}

interface LocationArea {
  location_area: { name: string; url: string };
  version_details: VersionDetail[];
}

interface GameLocation {
  game: string;
  locations: {
    name: string;
    methods: string[];
    levels: string;
    chance: number;
  }[];
}

interface PokemonLocationsProps {
  pokemonId: number;
}

function formatLocationName(name: string): string {
  return name
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
    .replace(/Area$/, '')
    .replace(/^\s+|\s+$/g, '');
}

function formatMethodName(method: string): string {
  const methodMap: Record<string, string> = {
    'walk': 'Walking',
    'old-rod': 'Old Rod',
    'good-rod': 'Good Rod',
    'super-rod': 'Super Rod',
    'surf': 'Surfing',
    'rock-smash': 'Rock Smash',
    'headbutt': 'Headbutt',
    'dark-grass': 'Dark Grass',
    'grass-spots': 'Shaking Grass',
    'cave-spots': 'Dust Clouds',
    'bridge-spots': 'Bridge Shadows',
    'super-rod-spots': 'Fishing Spots',
    'surf-spots': 'Rippling Water',
    'yellow-flowers': 'Yellow Flowers',
    'purple-flowers': 'Purple Flowers',
    'red-flowers': 'Red Flowers',
    'rough-terrain': 'Rough Terrain',
    'gift': 'Gift',
    'gift-egg': 'Gift Egg',
    'only-one': 'Static Encounter',
    'pokeflute': 'Poké Flute',
    'headbutt-low': 'Headbutt (Low)',
    'headbutt-normal': 'Headbutt (Normal)',
    'headbutt-high': 'Headbutt (High)',
    'squirt-bottle': 'Squirt Bottle',
    'wailmer-pail': 'Wailmer Pail',
    'seaweed': 'Seaweed',
    'roaming-grass': 'Roaming (Grass)',
    'roaming-water': 'Roaming (Water)',
  };
  return methodMap[method] || method.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

function getComputedBgColor(bgClass: string): string {
  const colorMap: Record<string, string> = {
    'bg-red-500': '#ef4444',
    'bg-red-600': '#dc2626',
    'bg-red-700': '#b91c1c',
    'bg-blue-500': '#3b82f6',
    'bg-blue-600': '#2563eb',
    'bg-blue-700': '#1d4ed8',
    'bg-yellow-400': '#facc15',
    'bg-yellow-500': '#eab308',
    'bg-yellow-600': '#ca8a04',
    'bg-gray-400': '#9ca3af',
    'bg-gray-500': '#6b7280',
    'bg-gray-800': '#1f2937',
    'bg-cyan-400': '#22d3ee',
    'bg-cyan-500': '#06b6d4',
    'bg-emerald-500': '#10b981',
    'bg-orange-500': '#f97316',
    'bg-green-500': '#22c55e',
    'bg-pink-400': '#f472b6',
    'bg-slate-400': '#94a3b8',
    'bg-purple-600': '#9333ea',
    'bg-purple-700': '#7e22ce',
    'bg-amber-600': '#d97706',
    'bg-indigo-600': '#4f46e5',
    'bg-violet-600': '#7c3aed',
  };
  return colorMap[bgClass] || '#6b7280';
}

export default function PokemonLocations({ pokemonId }: PokemonLocationsProps) {
  const [gameLocations, setGameLocations] = useState<GameLocation[]>([]);
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLocations() {
      setIsLoading(true);
      setError(null);

      try {
        const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonId}/encounters`);
        if (!res.ok) throw new Error('Failed to fetch encounters');
        
        const data: LocationArea[] = await res.json();

        // Group by game version
        const gameMap = new Map<string, GameLocation>();

        for (const area of data) {
          for (const versionDetail of area.version_details) {
            const gameName = versionDetail.version.name;
            
            if (!gameMap.has(gameName)) {
              gameMap.set(gameName, { game: gameName, locations: [] });
            }

            const methods = Array.from(new Set(versionDetail.encounter_details.map(d => formatMethodName(d.method.name))));
            const minLevel = Math.min(...versionDetail.encounter_details.map(d => d.min_level));
            const maxLevel = Math.max(...versionDetail.encounter_details.map(d => d.max_level));
            const levels = minLevel === maxLevel ? `Lv. ${minLevel}` : `Lv. ${minLevel}-${maxLevel}`;

            gameMap.get(gameName)!.locations.push({
              name: formatLocationName(area.location_area.name),
              methods,
              levels,
              chance: versionDetail.max_chance,
            });
          }
        }

        const sortedGames = Array.from(gameMap.values()).sort((a, b) => a.game.localeCompare(b.game));
        setGameLocations(sortedGames);
        
        if (sortedGames.length > 0) {
          setSelectedGame(sortedGames[0].game);
        }
      } catch (err) {
        console.error('Error fetching locations:', err);
        setError('Could not load location data');
      } finally {
        setIsLoading(false);
      }
    }

    fetchLocations();
  }, [pokemonId]);

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-6">
        <h2 className="text-xl font-semibold mb-4">Wild Encounters</h2>
        <div className="flex items-center justify-center h-24">
          <p className="text-gray-500">Loading locations...</p>
        </div>
      </div>
    );
  }

  if (error || gameLocations.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-6">
        <h2 className="text-xl font-semibold mb-4">Wild Encounters</h2>
        <div className="flex items-center justify-center h-24">
          <p className="text-gray-500 italic">This Pokémon cannot be found in the wild</p>
        </div>
      </div>
    );
  }

  const selectedGameData = gameLocations.find(g => g.game === selectedGame);
  const colors = selectedGame ? getVersionColor(selectedGame) : null;

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6">
      <h2 className="text-xl font-semibold mb-4">Wild Encounters</h2>

      {/* Game Selector */}
      <div 
        className="font-pocket-monk flex gap-2 overflow-x-auto pb-3 mb-4"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {gameLocations.map((game) => {
          const gameColors = getVersionColor(game.game);
          const isSelected = selectedGame === game.game;
          
          return (
            <button
              key={game.game}
              onClick={() => setSelectedGame(game.game)}
              className={`px-3 py-1.5 text-sm font-medium capitalize whitespace-nowrap rounded-full transition-all ${
                isSelected
                  ? 'text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              style={isSelected ? { backgroundColor: getComputedBgColor(gameColors.bg) } : {}}
            >
              {game.game.replace(/-/g, ' ')}
            </button>
          );
        })}
      </div>

      {/* Location List */}
      {selectedGameData && (
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {selectedGameData.locations.map((location, index) => (
            <div 
              key={index}
              className="p-3 rounded-xl bg-gray-50 border border-gray-100"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-800">{location.name}</h3>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {location.methods.map((method, i) => (
                      <span 
                        key={i}
                        className="text-xs px-2 py-0.5 rounded-full bg-gray-200 text-gray-600"
                      >
                        {method}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-medium text-gray-700">{location.levels}</p>
                  {location.chance > 0 && (
                    <p className="text-xs text-gray-500">{location.chance}% chance</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}