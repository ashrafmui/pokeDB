import Image from "next/image";
import GenerationButtons from "@/components/GenerationButtons";
import BackgroundGradient from '@/components/BackgroundGradient';
import Header from "@/components/Header";
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function getPokemon(generation: number) {
  const pokemon = await prisma.pokemon.findMany({
    where: { generation },
    include: { types: true },
    orderBy: { id: 'asc' },
  });
  return pokemon;
}

export default async function Gen5Page() {
  const pokemonList = await getPokemon(5);

  return (
    <>
      <BackgroundGradient />
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center p-8 sm:p-20 font-[family-name:var(--font-geist-sans)]">
        <main>
          <Header title="Gen 5" />
          <div className="grid grid-cols-10 gap-4 p-4">
            {pokemonList.map((pokemon) => (
              <div
                key={pokemon.id}
                className="w-20 h-20 flex items-center justify-center bg-white shadow-lg transform transition duration-300 rounded-3xl hover:scale-150 hover:bg-gray-100 hover:z-10"
              >
                <Image
                  src={pokemon.sprite}
                  alt={pokemon.name}
                  width={72}
                  height={72}
                  className="object-contain"
                />
              </div>
            ))}
          </div>
          <div className="flex items-center justify-center">
            <GenerationButtons activeGeneration={5} />
          </div>
        </main>
      </div>
    </>
  );
}