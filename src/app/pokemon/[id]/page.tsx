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
        <Link href="/" className="inline-block mb-8">
          <Button variant="outline" size="icon" className="rounded-full">
            <ArrowLeftIcon className="h-4 w-4" />
          </Button>
        </Link>

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
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <h2 className="text-xl font-semibold mb-4">Evolution</h2>
                <div className="flex items-center justify-center gap-4">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-2">
                      <span className="text-2xl">?</span>
                    </div>
                    <p className="text-sm text-gray-600">Stage 1</p>
                  </div>
                  <div className="text-gray-400">→</div>
                  <div className="text-center">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-2">
                      <span className="text-2xl">?</span>
                    </div>
                    <p className="text-sm text-gray-600">Stage 2</p>
                  </div>
                  <div className="text-gray-400">→</div>
                  <div className="text-center">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-2">
                      <span className="text-2xl">?</span>
                    </div>
                    <p className="text-sm text-gray-600">Stage 3</p>
                  </div>
                </div>
              </div>
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
            </div>
          </div>
        </div>
      </div>
    </>
  );
}