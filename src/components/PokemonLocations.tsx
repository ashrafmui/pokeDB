'use client';

import { useEffect, useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { getVersionColor } from '@/lib/versionColors';
import { 
  GameLocation, 
  formatLocationName, 
  formatMethodName, 
  getLocationType,
  getComputedBgColor 
} from '@/lib/locationUtils';
import LocationListView from './LocationListView';
import LocationMapView from './LocationMapView';

interface EncounterDetail {
  min_level: number;
  max_level: number;
  method: { name: string };
}

interface VersionDetail {
  version: { name: string };
  max_chance: number;
  encounter_details: EncounterDetail[];
}

interface LocationArea {
  location_area: { name: string };
  version_details: VersionDetail[];
}

interface PokemonLocationsProps {
  pokemonId: number;
}

type ViewMode = 'list' | 'map';

export default function PokemonLocations({ pokemonId }: PokemonLocationsProps) {
  const [gameLocations, setGameLocations] = useState<GameLocation[]>([]);
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [showLeftFade, setShowLeftFade] = useState(false);
  const [showRightFade, setShowRightFade] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

  const checkScrollPosition = () => {
    const container = scrollContainerRef.current;
    if (!container) return;
    
    const { scrollLeft, scrollWidth, clientWidth } = container;
    setShowLeftFade(scrollLeft > 5);
    setShowRightFade(scrollLeft < scrollWidth - clientWidth - 5);
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    checkScrollPosition();
    container.addEventListener('scroll', checkScrollPosition);
    
    const resizeObserver = new ResizeObserver(checkScrollPosition);
    resizeObserver.observe(container);

    return () => {
      container.removeEventListener('scroll', checkScrollPosition);
      resizeObserver.disconnect();
    };
  }, [gameLocations]);

  useEffect(() => {
    if (selectedGame) {
      const activeButton = buttonRefs.current.get(selectedGame);
      if (activeButton) {
        activeButton.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center',
        });
      }
    }
  }, [selectedGame]);

  useEffect(() => {
    async function fetchLocations() {
      setIsLoading(true);
      setError(null);

      try {
        const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonId}/encounters`);
        if (!res.ok) throw new Error('Failed to fetch encounters');
        
        const data: LocationArea[] = await res.json();
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
            const locationName = formatLocationName(area.location_area.name);

            gameMap.get(gameName)!.locations.push({
              name: locationName,
              methods,
              levels,
              chance: versionDetail.max_chance,
              locationType: getLocationType(locationName),
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
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold">Wild Encounters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || gameLocations.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold">Wild Encounters</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center italic">
            This Pokémon cannot be found in the wild
          </p>
        </CardContent>
      </Card>
    );
  }

  const selectedGameData = gameLocations.find(g => g.game === selectedGame);
  const gameColors = selectedGame ? getVersionColor(selectedGame) : null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Wild Encounters</CardTitle>
          
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
            <TabsList className="h-8">
              <TabsTrigger value="list" className="text-xs px-3">List</TabsTrigger>
              <TabsTrigger value="map" className="text-xs px-3">Map</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Game Selector */}
        <div className="relative">
          {/* Left fade indicator */}
          <div 
            className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-card to-transparent z-20 pointer-events-none transition-opacity duration-200"
            style={{ opacity: showLeftFade ? 1 : 0 }}
          />
          
          {/* Right fade indicator */}
          <div 
            className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-card to-transparent z-20 pointer-events-none transition-opacity duration-200"
            style={{ opacity: showRightFade ? 1 : 0 }}
          />

          <div 
            ref={scrollContainerRef}
            className="flex gap-2 overflow-x-auto pb-3"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {gameLocations.map((game) => {
              const colors = getVersionColor(game.game);
              const isSelected = selectedGame === game.game;
              
              return (
                <button
                  key={game.game}
                  ref={(el) => {
                    if (el) {
                      buttonRefs.current.set(game.game, el);
                    }
                  }}
                  onClick={() => setSelectedGame(game.game)}
                  className={`px-3 py-1.5 text-sm font-medium capitalize whitespace-nowrap rounded-full transition-all ${
                    isSelected 
                      ? 'text-white shadow-md' 
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                  style={isSelected ? { backgroundColor: getComputedBgColor(colors.bg) } : {}}
                >
                  {game.game.replace(/-/g, ' ')}
                </button>
              );
            })}
          </div>
        </div>

        {selectedGameData && viewMode === 'list' && (
          <LocationListView locations={selectedGameData.locations} />
        )}

        {selectedGameData && viewMode === 'map' && (
          <LocationMapView 
            locations={selectedGameData.locations} 
            gameColorBg={gameColors?.bg || null} 
          />
        )}
      </CardContent>
    </Card>
  );
}