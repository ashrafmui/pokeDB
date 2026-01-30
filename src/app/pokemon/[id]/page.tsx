import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import BackgroundGradient from '@/components/BackgroundGradient';
import { ArrowLeftIcon } from '@radix-ui/react-icons';
import { Button } from '@/components/ui/button';
import PokedexEntrySelector from '@/components/PokedexEntrySelector';
import SpriteCarousel from '@/components/SpriteCarousel';
import PokemonSpriteVariants from '@/components/PokemonSpriteVariants';
import BaseStats from '@/components/BaseStats';

// Type colors for the stats display
const typeColors: Record<string, string> = {
  normal: '#a8a878',
  fire: '#f08030',
  water: '#6890f0',
  electric: '#f8d030',
  grass: '#78c850',
  ice: '#98d8d8',
  fighting: '#c03028',
  poison: '#a040a0',
  ground: '#e0c068',
  flying: '#a890f0',
  psychic: '#f85888',
  bug: '#a8b820',
  rock: '#b8a038',
  ghost: '#705898',
  dragon: '#7038f8',
  dark: '#705848',
  steel: '#b8b8d0',
  fairy: '#ee99ac',
};

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

export default async function PokemonPage({ params }: { params: { id: string } }) {
  const pokemon = await getPokemon(parseInt(params.id));

  if (!pokemon) {
    return <div>Pokemon not found</div>;
  }

  const primaryType = pokemon.types[0]?.name || 'normal';
  const primaryColor = typeColors[primaryType] || '#8b5cf6';

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
          {/* Header */}
          <div className="mb-8">
            <p className="text-gray-600 text-lg">#{pokemon.id.toString().padStart(3, '0')}</p>
            <h1 className="text-5xl font-bold capitalize">{pokemon.name}</h1>
            <div className="flex gap-2 mt-3">
              {pokemon.types.map((type) => (
                <span
                  key={type.id}
                  className="px-4 py-1.5 rounded-full text-sm font-medium bg-white/80 backdrop-blur capitalize shadow-sm"
                >
                  {type.name}
                </span>
              ))}
            </div>
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
              <BaseStats stats={pokemon.stats} primaryColor={primaryColor} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}