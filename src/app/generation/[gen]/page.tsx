import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import GenerationButtons from "@/components/GenerationButtons";
import BackgroundGradient from '@/components/BackgroundGradient';
import Header from "@/components/Header";

interface Pokemon {
  name: string;
  url: string;
}

interface GenerationResponse {
  pokemon_species: Pokemon[];
}

async function getPokemon(generation: number) {
  const res = await fetch(`https://pokeapi.co/api/v2/generation/${generation}`, {
    next: { revalidate: 86400 }
  });
  
  if (!res.ok) return null;
  
  const data: GenerationResponse = await res.json();
  
  const pokemon = data.pokemon_species
    .map((p) => {
      const id = parseInt(p.url.split('/').filter(Boolean).pop() || '0');
      return {
        id,
        name: p.name,
        sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`,
      };
    })
    .sort((a, b) => a.id - b.id);

  return pokemon;
}

// Generate static params for generations 1-9
export async function generateStaticParams() {
  return Array.from({ length: 9 }, (_, i) => ({
    gen: String(i + 1),
  }));
}

interface PageProps {
  params: Promise<{ gen: string }>;
}

export default async function GenerationPage({ params }: PageProps) {
  const { gen } = await params;
  const generation = parseInt(gen);
  
  // Validate generation number
  if (isNaN(generation) || generation < 1 || generation > 9) {
    notFound();
  }

  const pokemonList = await getPokemon(generation);
  
  if (!pokemonList) {
    notFound();
  }

  return (
    <>
      <BackgroundGradient />
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center p-8 sm:p-20 font-[family-name:var(--font-geist-sans)]">
        <main>
          <Header title={`Gen ${generation}`} />
          <div className="grid grid-cols-10 gap-4 p-4">
            {pokemonList.map((pokemon) => (
              <Link key={pokemon.id} href={`/pokemon/${pokemon.id}`}>
                <div className="w-20 h-20 flex items-center justify-center bg-white shadow-lg transform transition duration-300 rounded-3xl hover:scale-150 hover:bg-gray-100 hover:z-10">
                  <Image
                    src={pokemon.sprite}
                    alt={pokemon.name}
                    width={72}
                    height={72}
                    className="object-contain"
                    unoptimized
                  />
                </div>
              </Link>
            ))}
          </div>
          <div className="flex items-center justify-center">
            <GenerationButtons activeGeneration={generation} />
          </div>
        </main>
      </div>
    </>
  );
}