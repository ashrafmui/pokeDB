import Image from 'next/image';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import BackgroundGradient from '@/components/BackgroundGradient';
import { ArrowLeftIcon } from '@radix-ui/react-icons';
import { Button } from '@/components/ui/button';
import PokedexEntrySelector from '@/components/PokedexEntrySelector';

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
            {/* Left Side - Sprite and Evolution */}
            <div className="space-y-6">
              {/* Sprite Card */}
              <div className="bg-white rounded-2xl shadow-xl p-8 flex items-center justify-center">
                <Image
                  src={pokemon.sprite}
                  alt={pokemon.name}
                  width={300}
                  height={300}
                  className="object-contain"
                />
              </div>

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
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <h2 className="text-xl font-semibold mb-3">Pokédex Entry</h2>
                <PokedexEntrySelector entries={pokemon.pokedexEntries} />
              </div>

              {/* Stats Card */}
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <h2 className="text-xl font-semibold mb-4">Base Stats</h2>
                <div className="space-y-3">
                  {pokemon.stats.map((stat) => (
                    <div key={stat.id} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-600 capitalize">
                          {stat.name.replace('-', ' ')}
                        </span>
                        <span className="text-sm font-bold text-gray-900">{stat.value}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-blue-600 h-2.5 rounded-full transition-all"
                          style={{ width: `${Math.min(stat.value / 255 * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                  
                  {/* Total Stats */}
                  <div className="pt-3 mt-3 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-gray-700">Total</span>
                      <span className="text-lg font-bold text-blue-600">
                        {pokemon.stats.reduce((sum, stat) => sum + stat.value, 0)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}