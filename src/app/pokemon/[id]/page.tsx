import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import BackgroundGradient from '@/components/BackgroundGradient';
import PokedexEntrySelector from '@/components/PokedexEntrySelector';
import SpriteCarousel from '@/components/SpriteCarousel';
import PokemonSpriteVariants from '@/components/PokemonSpriteVariants';
import BaseStats from '@/components/BaseStats';
import PokemonHeader from '@/components/PokemonPageHeader';
import EvolutionChain from '@/components/EvolutionChain';
import PokemonFormVariants from '@/components/PokemonFormVariants';
import PokemonLocations from '@/components/PokemonLocations';
import PokemonMoves from '@/components/PokemonMoves';
import PokemonAbilities from '@/components/PokemonAbilities';
import TypeEffectiveness from '@/components/TypeEffectiveness';
import PokemonSpeciesCard from '@/components/PokemonSpeciesCard';
import BreedingInfo from '@/components/BreedingInfo';

async function getPokemon(id: number) {
  const pokemon = await prisma.pokemon.findUnique({
    where: { id },
    include: {
      types: true,
      stats: true,
      pokedexEntries: true,
    },
  });
  return pokemon;
}

async function getMaxPokemonId() {
  const maxPokemon = await prisma.pokemon.findFirst({
    orderBy: { id: 'desc' },
    select: { id: true },
  });
  return maxPokemon?.id || 1025;
}

export default async function PokemonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const currentId = parseInt(id);
  const pokemon = await getPokemon(currentId);
  const maxId = await getMaxPokemonId();

  if (!pokemon) {
    return <div>Pokemon not found</div>;
  }

  const prevId = currentId > 1 ? currentId - 1 : maxId;
  const nextId = currentId < maxId ? currentId + 1 : 1;

  return (
    <>
      <BackgroundGradient />
      <div className="relative z-10 min-h-screen p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header with Navigation, Sprite, Name, Types - All in one row */}
          <div className="mb-8">
            <PokemonHeader 
              pokemonId={pokemon.id}
              pokemonName={pokemon.name}
              types={pokemon.types}
              prevId={prevId}
              nextId={nextId}
              maxId={maxId}
            />
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Side - Sprites, Evolution, Breeding, Locations */}
            <div className="space-y-6">
              <SpriteCarousel
                pokemonId={pokemon.id}
                pokemonName={pokemon.name}
              />

              <PokemonSpriteVariants
                pokemonId={pokemon.id}
                pokemonName={pokemon.name}
              />

              <EvolutionChain pokemonId={pokemon.id} />

              <PokemonFormVariants 
                pokemonId={pokemon.id} 
                pokemonName={pokemon.name} 
              />

              <BreedingInfo pokemonId={pokemon.id} />

              <PokemonLocations pokemonId={pokemon.id} />
            </div>

            {/* Right Side - Info and Stats */}
            <div className="space-y-6">
              <PokedexEntrySelector entries={pokemon.pokedexEntries} />

              <PokemonAbilities pokemonId={pokemon.id} />

              <PokemonSpeciesCard pokemonId={pokemon.id} />

              <TypeEffectiveness types={pokemon.types} />

              <BaseStats 
                stats={pokemon.stats} 
                pokemonName={pokemon.name}
              />
            </div>
          </div>

          <div className="mt-8">
            <PokemonMoves pokemonId={pokemon.id} />
          </div>
        </div>
      </div>
    </>
  );
}