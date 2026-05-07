import { notFound } from "next/navigation";
import BackgroundGradient from "@/components/BackgroundGradient";
import Header from "@/components/Header";
import PokemonRow from "@/components/PokemonRow";

interface TypePokemonEntry {
  pokemon: {
    name: string;
    url: string;
  };
}

interface PokemonData {
  id: number;
  name: string;
  sprite: string;
  types: string[];
}

async function fetchInBatches<T, R>(
  items: T[],
  batchSize: number,
  fn: (item: T) => Promise<R>
): Promise<R[]> {
  const results: R[] = [];
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    results.push(...(await Promise.all(batch.map(fn))));
  }
  return results;
}

async function getTypePokemon(typeName: string): Promise<PokemonData[] | null> {
  const res = await fetch(`https://pokeapi.co/api/v2/type/${typeName}`, {
    next: { revalidate: 86400 },
  });

  if (!res.ok) return null;

  const data = await res.json();

  const entries = data.pokemon
    .map((entry: TypePokemonEntry) => {
      const id = parseInt(
        entry.pokemon.url.split("/").filter(Boolean).pop() || "0"
      );
      return { id, name: entry.pokemon.name };
    })
    .filter((p: { id: number }) => p.id <= 10000)
    .sort((a: { id: number }, b: { id: number }) => a.id - b.id);

  // Batch fetches to avoid opening hundreds of simultaneous connections to
  // PokeAPI during build, which causes ETIMEDOUT under load.
  const detailed = await fetchInBatches(entries, 20, async (p: { id: number; name: string }) => {
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${p.id}`, {
      next: { revalidate: 86400 },
    });
    const pokemon = await res.json();

    return {
      id: pokemon.id,
      name: pokemon.name,
      sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`,
      types: pokemon.types.map(
        (t: { type: { name: string } }) => t.type.name
      ),
    };
  });

  return detailed;
}

const VALID_TYPES = [
  "normal", "fire", "water", "electric", "grass", "ice",
  "fighting", "poison", "ground", "flying", "psychic", "bug",
  "rock", "ghost", "dragon", "dark", "steel", "fairy",
];

export async function generateStaticParams() {
  return VALID_TYPES.map((name) => ({ name }));
}

interface PageProps {
  params: Promise<{ name: string }>;
}

export default async function TypePage({ params }: PageProps) {
  const { name } = await params;
  const typeName = name.toLowerCase();

  if (!VALID_TYPES.includes(typeName)) {
    notFound();
  }

  const pokemonList = await getTypePokemon(typeName);

  if (!pokemonList) {
    notFound();
  }

  return (
    <>
      <BackgroundGradient />
      <div className="relative z-10 flex flex-1 flex-col items-center p-4 sm:p-8 font-[family-name:var(--font-geist-sans)]">
        <main className="flex flex-col items-center gap-6 w-full max-w-3xl">
          <Header
            title={`${typeName.charAt(0).toUpperCase() + typeName.slice(1)} Type`}
          />

          <p className="text-sm text-muted-foreground">
            {pokemonList.length} Pokemon found
          </p>

          <div className="flex flex-col gap-2 w-full">
            {pokemonList.map((pokemon) => (
              <PokemonRow
                key={pokemon.id}
                id={pokemon.id}
                name={pokemon.name}
                sprite={pokemon.sprite}
                types={pokemon.types}
              />
            ))}
          </div>
        </main>
      </div>
    </>
  );
}
