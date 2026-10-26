import BackgroundGradient from '@/components/BackgroundGradient';
import PokedexEntrySelector from '@/components/PokedexEntrySelector';
import PokemonShowcase from '@/components/PokemonShowcase';
import BaseStats from '@/components/BaseStats';
import PokemonHeader from '@/components/PokemonPageHeader';
import PokemonNavRails from '@/components/PokemonNavRails';
import PokemonTimelineSection from '@/components/PokemonTimelineSection';
import TradingCards from '@/components/TradingCards';
import { Globe, Info, Layers, Sparkles, Swords } from 'lucide-react';
import PokemonLocations from '@/components/PokemonLocations';
import PokemonMoves from '@/components/PokemonMoves';
import PokemonAbilities from '@/components/PokemonAbilities';
import TypeEffectiveness from '@/components/TypeEffectiveness';
import PokemonSpeciesCard from '@/components/PokemonSpeciesCard';
import BreedingInfo from '@/components/BreedingInfo';
import PokemonForms from '@/components/PokemonForms';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { fetchPokemon, fetchSpecies } from '@/lib/pokeApi';
import { officialArtworkUrl, pickAnimatedSprite } from '@/lib/sprites';
import { capitalize, formatDexNumber, toTitleCase } from '@/lib/formatters';
import { MAX_POKEMON_ID } from '@/lib/site';

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
  varieties?: { is_default: boolean; pokemon: { name: string } }[];
}

async function getPokemon(id: number) {
  const [pokemonData, speciesData] = await Promise.all([
    fetchPokemon(id),
    fetchSpecies(id),
  ]);

  if (!pokemonData) return null;

  const pokemon = pokemonData as PokeAPIPokemon;
  const species: PokeAPISpecies =
    (speciesData as PokeAPISpecies) ?? { flavor_text_entries: [], habitat: null };

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

  const sprite = pickAnimatedSprite(pokemon.sprites) as string;

  return {
    id: pokemon.id,
    name: pokemon.name,
    sprite,
    types,
    stats,
    pokedexEntries,
    habitat: species.habitat?.name ?? null,
    hasForms: (species.varieties?.length ?? 0) > 1,
    spritesVersions: (pokemon.sprites.versions ?? {}) as Record<string, unknown>,
  };
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const pokemon = await getPokemon(parseInt(id));
  if (!pokemon) return { title: 'Pokémon not found' };

  const name = toTitleCase(pokemon.name);
  const typeList = pokemon.types.map((t) => capitalize(t.name)).join('/');
  const title = `${name} #${formatDexNumber(pokemon.id)} – ${typeList} type`;
  const entry = pokemon.pokedexEntries.at(-1)?.description;
  const description =
    `${name} (#${formatDexNumber(pokemon.id)}) is a${/^[AEIOU]/.test(typeList) ? 'n' : ''} ${typeList}-type Pokémon. ` +
    (entry ? `${entry} ` : '') +
    'See its base stats, evolutions, moves, abilities, locations and trading cards.';
  const image = officialArtworkUrl(pokemon.id);
  const url = `/pokemon/${pokemon.id}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, images: [{ url: image, alt: name }] },
    twitter: { card: 'summary_large_image', title, description, images: [image] },
  };
}

export default async function PokemonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const currentId = parseInt(id);
  const pokemon = await getPokemon(currentId);

  if (!pokemon) {
    notFound();
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

          <div className="mb-12">
            <PokemonShowcase
              pokemonId={pokemon.id}
              pokemonName={pokemon.name}
              types={pokemon.types.map((t) => t.name)}
              spritesVersions={pokemon.spritesVersions}
            />
          </div>

          <PokemonTimelineSection
            id="about"
            label="About"
            Icon={Info}
            iconBg="bg-blue-50"
            iconColor="text-blue-600"
          >
            <PokedexEntrySelector entries={pokemon.pokedexEntries} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <PokemonSpeciesCard pokemonId={pokemon.id} />
              <BreedingInfo pokemonId={pokemon.id} />
            </div>
          </PokemonTimelineSection>

          {pokemon.hasForms && (
            <PokemonTimelineSection
              id="forms"
              label="Forms"
              Icon={Sparkles}
              iconBg="bg-violet-50"
              iconColor="text-violet-600"
            >
              <PokemonForms pokemonId={pokemon.id} />
            </PokemonTimelineSection>
          )}

          <PokemonTimelineSection
            id="combat"
            label="Combat"
            Icon={Swords}
            iconBg="bg-red-50"
            iconColor="text-red-600"
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 items-start">
              <PokemonAbilities pokemonId={pokemon.id} />
              <BaseStats
                stats={pokemon.stats}
                pokemonName={pokemon.name}
              />
              <TypeEffectiveness types={pokemon.types} />
            </div>
            <PokemonMoves pokemonId={pokemon.id} />
          </PokemonTimelineSection>

          <PokemonTimelineSection
            id="world"
            label="In the World"
            Icon={Globe}
            iconBg="bg-emerald-50"
            iconColor="text-emerald-600"
          >
            <PokemonLocations pokemonId={pokemon.id} />
          </PokemonTimelineSection>

          <PokemonTimelineSection
            id="cards"
            label="Trading Cards"
            Icon={Layers}
            iconBg="bg-amber-50"
            iconColor="text-amber-600"
            isLast
          >
            <TradingCards pokemonName={pokemon.name} />
          </PokemonTimelineSection>
        </div>
      </div>
    </>
  );
}