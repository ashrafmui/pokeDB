import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import BackgroundGradient from '@/components/BackgroundGradient';
import { ArrowLeftIcon, ChevronLeftIcon, ChevronRightIcon } from '@radix-ui/react-icons';
import { Button } from '@/components/ui/button';
import PokedexEntrySelector from '@/components/PokedexEntrySelector';
import SpriteCarousel from '@/components/SpriteCarousel';
import PokemonSpriteVariants from '@/components/PokemonSpriteVariants';
import BaseStats from '@/components/BaseStats';
import PokemonHeader from '@/components/PokemonPageHeader';
import RandomPokemonButton from '@/components/RandomPokemonButton';
import EvolutionChain from '@/components/EvolutionChain';
import PokemonFormVariants from '@/components/PokemonFormVariants';
import PokemonLocations from '@/components/PokemonLocations';

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

export default async function PokemonPage({ params }: { params: { id: string } }) {
  const currentId = parseInt(params.id);
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
        <div className="flex items-center gap-2 mb-8">
          <Link href="/">
            <Button variant="outline" size="icon" className="rounded-full">
              <ArrowLeftIcon className="h-4 w-4" />
            </Button>
          </Link>
          <RandomPokemonButton maxId={maxId} />
        </div>

        <div className="max-w-6xl mx-auto">
          {/* Header with Navigation */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <Link href={`/pokemon/${prevId}`}>
                <Button variant="outline" size="icon" className="rounded-full">
                  <ChevronLeftIcon className="h-5 w-5" />
                </Button>
              </Link>
              
              <p className="text-gray-600 text-lg">#{pokemon.id.toString().padStart(3, '0')}</p>
              
              <Link href={`/pokemon/${nextId}`}>
                <Button variant="outline" size="icon" className="rounded-full">
                  <ChevronRightIcon className="h-5 w-5" />
                </Button>
              </Link>
            </div>

            <PokemonHeader 
              pokemonId={pokemon.id}
              pokemonName={pokemon.name}
              types={pokemon.types}
            />
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Side - Sprites and Evolution */}
            <div className="space-y-6">
              {/* High-res Sprite Carousel */}
              <SpriteCarousel
                pokemonId={pokemon.id}
                pokemonName={pokemon.name}
              />

              {/* Small Sprite Variants */}
              <PokemonSpriteVariants
                pokemonId={pokemon.id}
                pokemonName={pokemon.name}
              />

              {/* Evolution Chain */}
              <EvolutionChain pokemonId={pokemon.id} />

              {/* Mega/Gigantamax Forms */}
              <PokemonFormVariants 
                pokemonId={pokemon.id} 
                pokemonName={pokemon.name} 
              />
            </div>

            {/* Right Side - Info and Stats */}
            <div className="space-y-6">
              {/* Pokédex Entry with Version Selector */}
              <PokedexEntrySelector entries={pokemon.pokedexEntries} />

              {/* Stats Card */}
              <BaseStats 
                stats={pokemon.stats} 
                pokemonName={pokemon.name}
              />

              {/* Wild Encounter Locations */}
              <PokemonLocations pokemonId={pokemon.id} />            
            </div>
          </div>
        </div>
      </div>
    </>
  );
}