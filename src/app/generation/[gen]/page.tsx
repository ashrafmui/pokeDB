import { notFound } from "next/navigation";
import GenerationButtons from "@/components/GenerationButtons";
import BackgroundGradient from "@/components/BackgroundGradient";
import Header from "@/components/Header";
import PCBox from "@/components/PCBox";

interface Pokemon {
  name: string;
  url: string;
}

interface GenerationResponse {
  pokemon_species: Pokemon[];
}

async function getPokemon(generation: number) {
  const res = await fetch(`https://pokeapi.co/api/v2/generation/${generation}`, {
    next: { revalidate: 86400 },
  });

  if (!res.ok) return null;

  const data: GenerationResponse = await res.json();

  const pokemon = data.pokemon_species
    .map((p) => {
      const id = parseInt(p.url.split("/").filter(Boolean).pop() || "0");
      return {
        id,
        name: p.name,
        sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`,
      };
    })
    .sort((a, b) => a.id - b.id);

  return pokemon;
}

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
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center p-4 sm:p-8 font-[family-name:var(--font-geist-sans)]">
        <main className="flex flex-col items-center gap-6">
          <Header title={`Gen ${generation}`} />

          <PCBox pokemonList={pokemonList} generation={generation} />

          <GenerationButtons activeGeneration={generation} />
        </main>
      </div>
    </>
  );
}