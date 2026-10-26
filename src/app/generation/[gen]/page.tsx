import type { Metadata } from "next";
import { notFound } from "next/navigation";
import GenerationButtons from "@/components/GenerationButtons";
import BackgroundGradient from "@/components/BackgroundGradient";
import Header from "@/components/Header";
import PCBox from "@/components/PCBox";
import { POKEAPI_BASE } from "@/lib/pokeApi";
import { spriteUrl } from "@/lib/sprites";
import { GENERATION_COUNT, GENERATION_REGIONS } from "@/lib/site";

interface Pokemon {
  name: string;
  url: string;
}

interface GenerationResponse {
  pokemon_species: Pokemon[];
}

async function getPokemon(generation: number) {
  const res = await fetch(`${POKEAPI_BASE}/generation/${generation}`, {
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
        sprite: spriteUrl(id),
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

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { gen } = await params;
  const generation = parseInt(gen);
  const region = GENERATION_REGIONS[generation - 1];
  if (!region) return { title: "Generation not found" };

  const title = `Generation ${generation} Pokémon – ${region} Pokédex`;
  const description = `Every Pokémon introduced in Generation ${generation} (${region}), with sprites and links to stats, types, evolutions and moves.`;
  const url = `/generation/${generation}`;
  return { title, description, alternates: { canonical: url }, openGraph: { title, description, url } };
}

export default async function GenerationPage({ params }: PageProps) {
  const { gen } = await params;
  const generation = parseInt(gen);

  if (isNaN(generation) || generation < 1 || generation > GENERATION_COUNT) {
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