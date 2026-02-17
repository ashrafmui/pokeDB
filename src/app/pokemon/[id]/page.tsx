import BackgroundGradient from '@/components/BackgroundGradient';
import PokedexEntrySelector from '@/components/PokedexEntrySelector';
import SpriteCarousel from '@/components/SpriteCarousel';
import PokemonSpriteVariants from '@/components/PokemonSpriteVariants';
import BaseStats from '@/components/BaseStats';
import PokemonHeader from '@/components/PokemonPageHeader';
import EvolutionChain from '@/components/EvolutionChain';
import PokemonFormVariants from '@/components/PokemonFormVariants';
import PokemonLocations from '@/components/PokemonLocations';
import PokemonMoves from '@/components/PokemonMoves';
import PokemonAbilities from '@/components/PokemonAbilities';
import TypeEffectiveness from '@/components/TypeEffectiveness';
import PokemonSpeciesCard from '@/components/PokemonSpeciesCard';
import BreedingInfo from '@/components/BreedingInfo';

const POKEAPI_BASE = 'https://pokeapi.co/api/v2';

// Consider a max ID constant or fetch from PokeAPI's pokemon?limit=1&offset=0
// to get the count. For now, National Dex cap:
const MAX_POKEMON_ID = 1025;

interface PokeAPIType {
  slot: number;
  type: { name: string; url: string };
}

interface PokeAPIStat {
  base_stat: number;
  effort: number;
  stat: { name: string; url: string };
}

interface PokeAPIFlavorTextEntry {
  flavor_text: string;
  language: { name: string };
  version: { name: string; url: string };
}

interface PokeAPIPokemon {
  id: number;
  name: string;
  types: PokeAPIType[];
  stats: PokeAPIStat[];
  sprites: Record<string, unknown>;
}

interface PokeAPISpecies {
  flavor_text_entries: PokeAPIFlavorTextEntry[];
}

async function getPokemon(id: number) {
  const [pokemonRes, speciesRes] = await Promise.all([
    fetch(`${POKEAPI_BASE}/pokemon/${id}`, { next: { revalidate: 86400 } }),
    fetch(`${POKEAPI_BASE}/pokemon-species/${id}`, { next: { revalidate: 86400 } }),
  ]);

  if (!pokemonRes.ok) return null;

  const pokemon: PokeAPIPokemon = await pokemonRes.json();
  const species: PokeAPISpecies = speciesRes.ok ? await speciesRes.json() : { flavor_text_entries: [] };

  // Transform to match your existing component interfaces
  const types = pokemon.types.map((t) => ({
    slot: t.slot,
    typeName: t.type.name,
  }));

  const stats = pokemon.stats.map((s) => ({
    statName: s.stat.name,
    baseStat: s.base_stat,
    effort: s.effort,
  }));

  const pokedexEntries = species.flavor_text_entries
    .filter((entry) => entry.language.name === 'en')
    .map((entry) => ({
      flavorText: entry.flavor_text.replace(/\f|\n|\r/g, ' '),
      versionName: entry.version.name,
    }));

  return {
    id: pokemon.id,
    name: pokemon.name,
    types,
    stats,
    pokedexEntries,
  };
}

export default async function PokemonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const currentId = parseInt(id);
  const pokemon = await getPokemon(currentId);

  if (!pokemon) {
    return <div>Pokemon not found</div>;
  }

  const prevId = currentId > 1 ? currentId - 1 : MAX_POKEMON_ID;
  const nextId = currentId < MAX_POKEMON_ID ? currentId + 1 : 1;

  return (
    <>
      <BackgroundGradient />
      <div className="relative z-10 min-h-screen p-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <PokemonHeader
              pokemonId={pokemon.id}
              pokemonName={pokemon.name}
              types={pokemon.types}
              prevId={prevId}
              nextId={nextId}
              maxId={MAX_POKEMON_ID}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <SpriteCarousel
                pokemonId={pokemon.id}
                pokemonName={pokemon.name}
              />
              <PokemonSpriteVariants
                pokemonId={pokemon.id}
                pokemonName={pokemon.name}
              />
              <EvolutionChain pokemonId={pokemon.id} />
              <PokemonFormVariants
                pokemonId={pokemon.id}
                pokemonName={pokemon.name}
              />
              <BreedingInfo pokemonId={pokemon.id} />
              <PokemonLocations pokemonId={pokemon.id} />
            </div>

            <div className="space-y-6">
              <PokedexEntrySelector entries={pokemon.pokedexEntries} />
              <PokemonAbilities pokemonId={pokemon.id} />
              <PokemonSpeciesCard pokemonId={pokemon.id} />
              <TypeEffectiveness types={pokemon.types} />
              <BaseStats
                stats={pokemon.stats}
                pokemonName={pokemon.name}
              />
            </div>
          </div>

          <div className="mt-8">
            <PokemonMoves pokemonId={pokemon.id} />
          </div>
        </div>
      </div>
    </>
  );
}