'use client';

import { useEffect, useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { getVersionColor } from '@/lib/versionColors';
import { getComputedBgColor } from '@/lib/locationUtils';
import { cn } from '@/lib/utils';

interface MoveDetail {
  name: string;
  level: number;
  learnMethod: string;
  power: number | null;
  accuracy: number | null;
  pp: number;
  type: string;
  damageClass: string;
}

interface MoveRaw {
  name: string;
  versionDetails: VersionGroupDetail[];
  power: number | null;
  accuracy: number | null;
  pp: number;
  type: string;
  damageClass: string;
}

interface VersionGroupDetail {
  level_learned_at: number;
  move_learn_method: { name: string };
  version_group: { name: string };
}

interface MoveData {
  move: { name: string; url: string };
  version_group_details: VersionGroupDetail[];
}

interface PokemonMovesProps {
  pokemonId: number;
}

type LearnMethod = 'level-up' | 'machine' | 'egg' | 'tutor';

const typeColors: Record<string, string> = {
  normal: "#A8A878", fire: "#F08030", water: "#6890F0", electric: "#F8D030",
  grass: "#78C850", ice: "#98D8D8", fighting: "#C03028", poison: "#A040A0",
  ground: "#E0C068", flying: "#A890F0", psychic: "#F85888", bug: "#A8B820",
  rock: "#B8A038", ghost: "#705898", dragon: "#7038F8", dark: "#705848",
  steel: "#B8B8D0", fairy: "#EE99AC",
};

const damageClassIcons: Record<string, { icon: string; color: string }> = {
  physical: { icon: '💥', color: '#C03028' },
  special: { icon: '✨', color: '#5060E0' },
  status: { icon: '◐', color: '#8C888C' },
};

function formatMoveName(name: string): string {
  return name.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

function getMethodLabel(method: LearnMethod): string {
  switch (method) {
    case 'level-up': return 'Level Up';
    case 'machine': return 'TM/HM';
    case 'egg': return 'Egg';
    case 'tutor': return 'Tutor';
  }
}

export default function PokemonMoves({ pokemonId }: PokemonMovesProps) {
  const [moves, setMoves] = useState<MoveRaw[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVersion, setSelectedVersion] = useState<string | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<LearnMethod>('level-up');
  const [availableVersions, setAvailableVersions] = useState<string[]>([]);
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
  }, [availableVersions]);

  useEffect(() => {
    if (selectedVersion) {
      const activeButton = buttonRefs.current.get(selectedVersion);
      if (activeButton) {
        activeButton.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [selectedVersion]);

  useEffect(() => {
    async function fetchMoves() {
      setIsLoading(true);
      setError(null);

      try {
        const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonId}`);
        if (!res.ok) throw new Error('Failed to fetch Pokemon');
        const data = await res.json();

        const versions = new Set<string>();
        data.moves.forEach((m: MoveData) => {
          m.version_group_details.forEach((v: VersionGroupDetail) => {
            versions.add(v.version_group.name);
          });
        });

        const sortedVersions = Array.from(versions).sort();
        setAvailableVersions(sortedVersions);
        
        if (sortedVersions.length > 0) {
          setSelectedVersion(sortedVersions[sortedVersions.length - 1]);
        }

        const movePromises = data.moves.map(async (m: MoveData) => {
          try {
            const moveRes = await fetch(m.move.url);
            if (!moveRes.ok) return null;
            const moveData = await moveRes.json();
            
            return {
              name: m.move.name,
              versionDetails: m.version_group_details,
              power: moveData.power,
              accuracy: moveData.accuracy,
              pp: moveData.pp,
              type: moveData.type.name,
              damageClass: moveData.damage_class.name,
            };
          } catch {
            return null;
          }
        });

        const moveResults = await Promise.all(movePromises);
        const validMoves = moveResults.filter((m): m is MoveRaw => m !== null);
        
        setMoves(validMoves);
      } catch (err) {
        console.error('Error fetching moves:', err);
        setError('Could not load move data');
      } finally {
        setIsLoading(false);
      }
    }

    fetchMoves();
  }, [pokemonId]);

  const filteredMoves = moves
    .map(move => {
      const versionDetail = move.versionDetails.find(
        (v: VersionGroupDetail) => v.version_group.name === selectedVersion && v.move_learn_method.name === selectedMethod
      );
      if (!versionDetail) return null;
      return {
        name: move.name,
        level: versionDetail.level_learned_at,
        learnMethod: versionDetail.move_learn_method.name,
        power: move.power,
        accuracy: move.accuracy,
        pp: move.pp,
        type: move.type,
        damageClass: move.damageClass,
      };
    })
    .filter(Boolean) as MoveDetail[];

  const sortedMoves = filteredMoves.sort((a, b) => {
    if (selectedMethod === 'level-up') return a.level - b.level;
    return a.name.localeCompare(b.name);
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold">Moves</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold">Moves</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center italic">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold">Moves</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Learn Method Tabs */}
        <Tabs value={selectedMethod} onValueChange={(v) => setSelectedMethod(v as LearnMethod)}>
          <TabsList>
            {(['level-up', 'machine', 'egg', 'tutor'] as LearnMethod[]).map((method) => (
              <TabsTrigger key={method} value={method} className="text-xs">
                {getMethodLabel(method)}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* Version Selector */}
        <div className="relative">
          <div 
            className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-card to-transparent z-20 pointer-events-none transition-opacity duration-200"
            style={{ opacity: showLeftFade ? 1 : 0 }}
          />
          <div 
            className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-card to-transparent z-20 pointer-events-none transition-opacity duration-200"
            style={{ opacity: showRightFade ? 1 : 0 }}
          />
          <div 
            ref={scrollContainerRef}
            className="flex gap-2 overflow-x-auto pb-2"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {availableVersions.map((version) => {
              const colors = getVersionColor(version.split('-')[0]);
              const isSelected = selectedVersion === version;
              return (
                <button
                  key={version}
                  ref={(el) => { if (el) buttonRefs.current.set(version, el); }}
                  onClick={() => setSelectedVersion(version)}
                  className={cn(
                    "px-3 py-1 text-xs font-medium capitalize whitespace-nowrap rounded-full transition-all",
                    isSelected 
                      ? "text-white shadow-md" 
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  )}
                  style={isSelected ? { backgroundColor: getComputedBgColor(colors.bg) } : {}}
                >
                  {version.replace(/-/g, ' ')}
                </button>
              );
            })}
          </div>
        </div>

        {/* Moves Table */}
        {sortedMoves.length > 0 ? (
          <div className="overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  {selectedMethod === 'level-up' && (
                    <TableHead className="w-12">Lv.</TableHead>
                  )}
                  <TableHead>Move</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-center w-12">Cat.</TableHead>
                  <TableHead className="text-right w-14">Pwr</TableHead>
                  <TableHead className="text-right w-14">Acc</TableHead>
                  <TableHead className="text-right w-12">PP</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedMoves.map((move, i) => (
                  <TableRow key={i}>
                    {selectedMethod === 'level-up' && (
                      <TableCell className="font-medium">{move.level || '—'}</TableCell>
                    )}
                    <TableCell className="font-medium">{formatMoveName(move.name)}</TableCell>
                    <TableCell>
                      <span 
                        className="px-2 py-0.5 rounded text-xs font-medium text-white capitalize"
                        style={{ backgroundColor: typeColors[move.type] || '#888' }}
                      >
                        {move.type}
                      </span>
                    </TableCell>
                    <TableCell className="text-center" title={move.damageClass}>
                      <span style={{ color: damageClassIcons[move.damageClass]?.color }}>
                        {damageClassIcons[move.damageClass]?.icon || '?'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {move.power || '—'}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {move.accuracy ? `${move.accuracy}%` : '—'}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {move.pp}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="flex items-center justify-center h-24">
            <p className="text-sm text-muted-foreground italic">
              No moves found for this method/version
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}