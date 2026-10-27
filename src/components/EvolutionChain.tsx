'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ReactNode, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowDownIcon, ArrowRightIcon } from '@radix-ui/react-icons';
import { cn } from '@/lib/utils';
import { speciesUrl } from '@/lib/pokeApi';
import { describeEvolution, type EvolutionDetail } from '@/lib/evolution';
import { spriteUrl } from '@/lib/sprites';
import { kebabToSpace } from '@/lib/formatters';

interface ChainLink {
  species: { name: string; url: string };
  evolution_details: EvolutionDetail[];
  evolves_to: ChainLink[];
}

interface EvolutionChainData {
  chain: ChainLink;
}

interface PokemonEvolution {
  id: number;
  name: string;
  sprite: string;
  trigger?: { label: string; full: string };
}

interface EvolutionChainProps {
  pokemonId: number;
  embedded?: boolean;
}

/** ".../pokemon-species/25/" → 25. Species ids match National Dex numbers. */
function idFromSpeciesUrl(url: string): number {
  const parts = url.split('/').filter(Boolean);
  return parseInt(parts[parts.length - 1]);
}

function flattenEvolutionChain(chain: ChainLink): PokemonEvolution[][] {
  const stages: PokemonEvolution[][] = [];

  function processStage(links: ChainLink[], stageIndex: number) {
    if (links.length === 0) return;
    stages[stageIndex] ??= [];

    for (const link of links) {
      const id = idFromSpeciesUrl(link.species.url);
      stages[stageIndex].push({
        id,
        name: link.species.name,
        sprite: spriteUrl(id),
        trigger: stageIndex > 0 ? describeEvolution(link.evolution_details) ?? undefined : undefined,
      });
      processStage(link.evolves_to, stageIndex + 1);
    }
  }

  processStage([chain], 0);
  return stages;
}

export default function EvolutionChain({ pokemonId, embedded = false }: EvolutionChainProps) {
  const [evolutionStages, setEvolutionStages] = useState<PokemonEvolution[][]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchEvolutionChain() {
      setIsLoading(true);
      setError(null);
      
      try {
        const speciesRes = await fetch(speciesUrl(pokemonId));
        if (!speciesRes.ok) throw new Error('Failed to fetch species');
        const speciesData = await speciesRes.json();
        
        const chainRes = await fetch(speciesData.evolution_chain.url);
        if (!chainRes.ok) throw new Error('Failed to fetch evolution chain');
        const chainData: EvolutionChainData = await chainRes.json();
        
        const stages = flattenEvolutionChain(chainData.chain);
        setEvolutionStages(stages);
      } catch (err) {
        console.error('Error fetching evolution chain:', err);
        setError('Could not load evolution chain');
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchEvolutionChain();
  }, [pokemonId]);

  const spriteSize = embedded ? 36 : 64;
  const bubbleSize = embedded ? 'w-12 h-12' : 'w-20 h-20';

  if (
    !isLoading &&
    !error &&
    evolutionStages.length === 1 &&
    evolutionStages[0].length === 1
  ) {
    return null;
  }

  let body: ReactNode;

  if (isLoading) {
    body = (
      <div className={cn('flex items-center justify-center gap-4', embedded && 'flex-col gap-2')}>
        <Skeleton className={cn('rounded-full', bubbleSize)} />
        <Skeleton className="w-6 h-6" />
        <Skeleton className={cn('rounded-full', bubbleSize)} />
      </div>
    );
  } else if (error || evolutionStages.length === 0) {
    body = (
      <p className="text-sm text-muted-foreground text-center italic">
        No evolution data available
      </p>
    );
  } else {
    const Arrow = embedded ? ArrowDownIcon : ArrowRightIcon;
    body = (
      <div className={cn(
        'flex items-center justify-center',
        embedded ? 'flex-col gap-0.5' : 'gap-2 flex-wrap'
      )}>
        {evolutionStages.map((stage, stageIndex) => (
          <div key={stageIndex} className={cn(
            'flex items-center',
            embedded ? 'flex-col gap-0.5' : 'gap-2'
          )}>
            {stageIndex > 0 && (
              <Arrow className={cn('text-muted-foreground', embedded ? 'h-3 w-3' : 'h-5 w-5')} />
            )}

            <div className={cn('flex flex-col', embedded ? 'gap-0.5' : 'gap-2')}>
              {stage.map((pokemon) => (
                <Link
                  key={pokemon.id}
                  href={`/pokemon/${pokemon.id}`}
                  className="group"
                >
                  <div className="text-center">
                    {pokemon.trigger && (
                      <p
                        className={cn(
                          'text-muted-foreground leading-tight mx-auto cursor-help',
                          embedded ? 'text-[9px] max-w-[72px] line-clamp-2 mb-0.5' : 'text-[10px] max-w-[120px] mb-1'
                        )}
                        title={pokemon.trigger.full}
                      >
                        {pokemon.trigger.label}
                      </p>
                    )}
                    <div className={cn(
                      'bg-muted rounded-full flex items-center justify-center mx-auto',
                      bubbleSize,
                      embedded ? '' : 'mb-1',
                      'transition-all group-hover:bg-muted/80 group-hover:scale-110',
                      pokemon.id === pokemonId && 'ring-2 ring-primary ring-offset-2'
                    )}>
                      <Image
                        src={pokemon.sprite}
                        alt={pokemon.name}
                        width={spriteSize}
                        height={spriteSize}
                        className="object-contain"
                        style={{ imageRendering: 'pixelated' }}
                        unoptimized
                      />
                    </div>
                    <p className={cn(
                      'capitalize group-hover:text-primary transition-colors text-foreground leading-tight',
                      embedded ? 'text-[10px]' : 'text-sm'
                    )}>
                      {kebabToSpace(pokemon.name)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (embedded) {
    return (
      <div className="flex flex-col items-center">
        {body}
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold">Evolution</CardTitle>
      </CardHeader>
      <CardContent>{body}</CardContent>
    </Card>
  );
}