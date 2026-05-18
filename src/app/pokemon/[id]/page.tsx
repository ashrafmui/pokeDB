import BackgroundGradient from '@/components/BackgroundGradient';
import PokedexEntrySelector from '@/components/PokedexEntrySelector';
import PokemonShowcase from '@/components/PokemonShowcase';
import BaseStats from '@/components/BaseStats';
import PokemonHeader from '@/components/PokemonPageHeader';
import PokemonNavRails from '@/components/PokemonNavRails';
import PokemonSectionNav from '@/components/PokemonSectionNav';
import TradingCards from '@/components/TradingCards';
import { Globe, Info, Layers, Swords } from 'lucide-react';
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
      <PokemonSectionNav />
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

          <div className="mb-12">
            <PokemonShowcase
              pokemonId={pokemon.id}
              pokemonName={pokemon.name}
              types={pokemon.types.map((t) => t.name)}
              spritesVersions={pokemon.spritesVersions}
            />
          </div>

          {/* ───────── About ───────── */}
          <section id="about" className="scroll-mt-8 mb-16">
            <h2 className="flex items-center gap-3 text-2xl font-bold mb-6 pb-3 border-b">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                <Info className="h-5 w-5" />
              </span>
              About
            </h2>
            <div className="space-y-6">
              <PokedexEntrySelector entries={pokemon.pokedexEntries} />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <PokemonSpeciesCard pokemonId={pokemon.id} />
                <BreedingInfo pokemonId={pokemon.id} />
              </div>
            </div>
          </section>

          {/* ───────── Combat ───────── */}
          <section id="combat" className="scroll-mt-8 mb-16">
            <h2 className="flex items-center gap-3 text-2xl font-bold mb-6 pb-3 border-b">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-red-50 text-red-600">
                <Swords className="h-5 w-5" />
              </span>
              Combat
            </h2>
            <div className="space-y-6 space-x-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 items-start">
                <PokemonAbilities pokemonId={pokemon.id} />
                <BaseStats
                  stats={pokemon.stats}
                  pokemonName={pokemon.name}
                />
                <TypeEffectiveness types={pokemon.types} />
              </div>
              <PokemonMoves pokemonId={pokemon.id} />
            </div>
          </section>

          {/* ───────── In the World ───────── */}
          <section id="world" className="scroll-mt-8 mb-16">
            <h2 className="flex items-center gap-3 text-2xl font-bold mb-6 pb-3 border-b">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                <Globe className="h-5 w-5" />
              </span>
              In the World
            </h2>
            <div className="space-y-6">
              <PokemonLocations pokemonId={pokemon.id} />
            </div>
          </section>

          {/* ───────── Trading Cards ───────── */}
          <section id="cards" className="scroll-mt-8 mb-16">
            <h2 className="flex items-center gap-3 text-2xl font-bold mb-6 pb-3 border-b">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-amber-50 text-amber-600">
                <Layers className="h-5 w-5" />
              </span>
              Trading Cards
            </h2>
            <TradingCards pokemonName={pokemon.name} />
          </section>
        </div>
      </div>
    </>
  );
}