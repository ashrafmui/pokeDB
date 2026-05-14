import BackgroundGradient from '@/components/BackgroundGradient';
import PokedexEntrySelector from '@/components/PokedexEntrySelector';
import PokemonShowcase from '@/components/PokemonShowcase';
import BaseStats from '@/components/BaseStats';
import PokemonHeader from '@/components/PokemonPageHeader';
import PokemonNavRails from '@/components/PokemonNavRails';
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
  sprites: {
    front_default: string;
    other: {
      showdown: { front_default: string };
      home: { front_default: string };
    };
    versions: Record<string, unknown>;
  };
}

interface PokeAPISpecies {
  flavor_text_entries: PokeAPIFlavorTextEntry[];
  habitat: { name: string; url: string } | null;
}

async function getPokemon(id: number) {
  const [pokemonRes, speciesRes] = await Promise.all([
    fetch(`${POKEAPI_BASE}/pokemon/${id}`, { next: { revalidate: 86400 } }),
    fetch(`${POKEAPI_BASE}/pokemon-species/${id}`, { next: { revalidate: 86400 } }),
  ]);

  if (!pokemonRes.ok) return null;

  const pokemon: PokeAPIPokemon = await pokemonRes.json();
  const species: PokeAPISpecies = speciesRes.ok ? await speciesRes.json() : { flavor_text_entries: [], habitat: null };

  // Transform to match your existing component interfaces
  const types = pokemon.types.map((t) => ({
    id: t.slot,
    name: t.type.name,
  }));

  const stats = pokemon.stats.map((s, i) => ({
    id: i,
    name: s.stat.name,
    statName: s.stat.name,
    baseStat: s.base_stat,
    value: s.base_stat,
    effort: s.effort,
  }));

  const pokedexEntries = species.flavor_text_entries
    .filter((entry) => entry.language.name === 'en')
    .map((entry, i) => ({
      id: i,
      version: entry.version.name,
      versionName: entry.version.name,
      description: entry.flavor_text.replace(/\f|\n|\r/g, ' '),
      flavorText: entry.flavor_text.replace(/\f|\n|\r/g, ' '),
    }));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const versions = pokemon.sprites.versions as any;
  const sprite =
    versions?.['generation-v']?.['black-white']?.animated?.front_default ??
    pokemon.sprites.other?.showdown?.front_default ??
    pokemon.sprites.other?.home?.front_default ??
    pokemon.sprites.front_default;

  return {
    id: pokemon.id,
    name: pokemon.name,
    sprite,
    types,
    stats,
    pokedexEntries,
    habitat: species.habitat?.name ?? null,
    spritesVersions: (pokemon.sprites.versions ?? {}) as Record<string, unknown>,
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
      <PokemonNavRails prevId={prevId} nextId={nextId} />
      <div className="relative z-10 min-h-screen p-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <PokemonHeader
              pokemonId={pokemon.id}
              pokemonName={pokemon.name}
              sprite={pokemon.sprite}
              types={pokemon.types}
              maxId={MAX_POKEMON_ID}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <PokemonShowcase
                pokemonId={pokemon.id}
                pokemonName={pokemon.name}
                spritesVersions={pokemon.spritesVersions}
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