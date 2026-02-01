'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface EvolutionDetail {
  min_level: number | null;
  trigger: { name: string };
  item: { name: string } | null;
  held_item: { name: string } | null;
  min_happiness: number | null;
  time_of_day: string;
  location: { name: string } | null;
}

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
  trigger?: string;
}

interface EvolutionChainProps {
  pokemonId: number;
}

function getEvolutionTriggerText(details: EvolutionDetail): string {
  if (!details) return '';
  
  const triggers: string[] = [];
  
  if (details.min_level) {
    triggers.push(`Lv. ${details.min_level}`);
  }
  if (details.item) {
    triggers.push(details.item.name.replace(/-/g, ' '));
  }
  if (details.held_item) {
    triggers.push(`Hold ${details.held_item.name.replace(/-/g, ' ')}`);
  }
  if (details.min_happiness) {
    triggers.push('Happiness');
  }
  if (details.time_of_day) {
    triggers.push(details.time_of_day);
  }
  if (details.location) {
    triggers.push(details.location.name.replace(/-/g, ' '));
  }
  if (details.trigger?.name === 'trade') {
    triggers.push('Trade');
  }
  
  return triggers.join(' + ') || '?';
}

function extractIdFromUrl(url: string): number {
  const parts = url.split('/').filter(Boolean);
  return parseInt(parts[parts.length - 1]);
}

async function flattenEvolutionChain(chain: ChainLink): Promise<PokemonEvolution[][]> {
  const stages: PokemonEvolution[][] = [];
  
  async function processStage(links: ChainLink[], stageIndex: number, parentTrigger?: string) {
    if (links.length === 0) return;
    
    if (!stages[stageIndex]) {
      stages[stageIndex] = [];
    }
    
    for (const link of links) {
      const speciesId = extractIdFromUrl(link.species.url);
      
      // Fetch Pokemon data to get the correct ID (species ID might differ from Pokemon ID)
      try {
        const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${link.species.name}`);
        const data = await res.json();
        
        const trigger = link.evolution_details[0] 
          ? getEvolutionTriggerText(link.evolution_details[0])
          : parentTrigger;
        
        stages[stageIndex].push({
          id: data.id,
          name: link.species.name,
          sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${data.id}.png`,
          trigger: stageIndex > 0 ? trigger : undefined,
        });
        
        if (link.evolves_to.length > 0) {
          const nextTrigger = link.evolves_to[0].evolution_details[0]
            ? getEvolutionTriggerText(link.evolves_to[0].evolution_details[0])
            : undefined;
          await processStage(link.evolves_to, stageIndex + 1, nextTrigger);
        }
      } catch (error) {
        console.error(`Failed to fetch Pokemon ${link.species.name}:`, error);
      }
    }
  }
  
  await processStage([chain], 0);
  return stages;
}

export default function EvolutionChain({ pokemonId }: EvolutionChainProps) {
  const [evolutionStages, setEvolutionStages] = useState<PokemonEvolution[][]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchEvolutionChain() {
      setIsLoading(true);
      setError(null);
      
      try {
        // First get the species to find the evolution chain URL
        const speciesRes = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${pokemonId}`);
        if (!speciesRes.ok) throw new Error('Failed to fetch species');
        const speciesData = await speciesRes.json();
        
        // Then fetch the evolution chain
        const chainRes = await fetch(speciesData.evolution_chain.url);
        if (!chainRes.ok) throw new Error('Failed to fetch evolution chain');
        const chainData: EvolutionChainData = await chainRes.json();
        
        // Flatten the chain into stages
        const stages = await flattenEvolutionChain(chainData.chain);
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

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-6">
        <h2 className="text-xl font-semibold mb-4">Evolution</h2>
        <div className="flex items-center justify-center h-24">
          <p className="text-gray-500">Loading evolution chain...</p>
        </div>
      </div>
    );
  }

  if (error || evolutionStages.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-6">
        <h2 className="text-xl font-semibold mb-4">Evolution</h2>
        <div className="flex items-center justify-center h-24">
          <p className="text-gray-500 italic">No evolution data available</p>
        </div>
      </div>
    );
  }

  // Check if this Pokemon doesn't evolve (single stage, single Pokemon)
  if (evolutionStages.length === 1 && evolutionStages[0].length === 1) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-6">
        <h2 className="text-xl font-semibold mb-4">Evolution</h2>
        <div className="flex items-center justify-center h-24">
          <p className="text-gray-500 italic">This Pokémon does not evolve</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6">
      <h2 className="text-xl font-semibold mb-4">Evolution</h2>
      <div className="flex items-center justify-center gap-2 flex-wrap">
        {evolutionStages.map((stage, stageIndex) => (
          <div key={stageIndex} className="flex items-center gap-2">
            {/* Arrow before stage (except first) */}
            {stageIndex > 0 && (
              <div className="text-gray-400 text-xl">→</div>
            )}
            
            {/* Pokemon in this stage */}
            <div className="flex flex-col gap-2">
              {stage.map((pokemon) => (
                <Link 
                  key={pokemon.id} 
                  href={`/pokemon/${pokemon.id}`}
                  className="group"
                >
                  <div className="text-center">
                    <div className={`w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-1 transition-all group-hover:bg-gray-200 group-hover:scale-110 ${pokemon.id === pokemonId ? 'ring-2 ring-blue-500 ring-offset-2' : ''}`}>
                      <Image
                        src={pokemon.sprite}
                        alt={pokemon.name}
                        width={64}
                        height={64}
                        className="object-contain"
                        style={{ imageRendering: 'pixelated' }}
                        unoptimized
                      />
                    </div>
                    {pokemon.trigger && (
                      <p className="text-[10px] text-gray-500 capitalize mb-1">{pokemon.trigger}</p>
                    )}
                    <p className="text-sm text-gray-700 capitalize group-hover:text-blue-600 transition-colors">
                      {pokemon.name.replace(/-/g, ' ')}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}