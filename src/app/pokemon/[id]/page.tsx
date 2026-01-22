import Image from 'next/image';
import Link from 'next/link';
import { PrismaClient } from '@prisma/client';
import BackgroundGradient from '@/components/BackgroundGradient';
import { ArrowLeftIcon } from '@radix-ui/react-icons';
import { Button } from '@/components/ui/button';

const prisma = new PrismaClient();

async function getPokemon(id: number) {
  const pokemon = await prisma.pokemon.findUnique({
    where: { id },
    include: {
      types: true,
      stats: true,
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
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-8">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
          <Link href="/" className="inline-block mb-4">
            <Button variant="outline" size="icon" className="rounded-full">
              <ArrowLeftIcon className="h-4 w-4" />
            </Button>
          </Link>

          <div className="text-center">
            <p className="text-gray-500 text-sm">#{pokemon.id.toString().padStart(3, '0')}</p>
            <h1 className="text-3xl font-bold capitalize mb-4">{pokemon.name}</h1>
            
            <Image
              src={pokemon.sprite}
              alt={pokemon.name}
              width={200}
              height={200}
              className="mx-auto"
            />

            <div className="flex justify-center gap-2 mt-4">
              {pokemon.types.map((type) => (
                <span
                  key={type.id}
                  className="px-3 py-1 rounded-full text-sm font-medium bg-gray-200 capitalize"
                >
                  {type.name}
                </span>
              ))}
            </div>

            <div className="mt-6">
              <h2 className="text-xl font-semibold mb-3">Base Stats</h2>
              <div className="space-y-2">
                {pokemon.stats.map((stat) => (
                  <div key={stat.id} className="flex items-center gap-2">
                    <span className="w-24 text-sm text-gray-600 capitalize text-right">
                      {stat.name.replace('-', ' ')}
                    </span>
                    <div className="flex-1 bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-blue-500 h-3 rounded-full"
                        style={{ width: `${Math.min(stat.value / 255 * 100, 100)}%` }}
                      />
                    </div>
                    <span className="w-8 text-sm text-gray-600">{stat.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}