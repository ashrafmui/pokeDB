// components/PokemonForms.tsx
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { fetchPokemon, fetchPokemonForm, fetchSpecies } from '@/lib/pokeApi';
import { pickOfficialArtwork } from '@/lib/sprites';
import { getTypeBadgeColors } from '@/lib/typeColors';
import { toTitleCase } from '@/lib/formatters';

interface PokeAPIVariety {
  is_default: boolean;
  pokemon: { name: string; url: string };
}

interface PokeAPIFormPokemon {
  id: number;
  name: string;
  types: { type: { name: string } }[];
  abilities: { ability: { name: string }; is_hidden: boolean }[];
  stats: { base_stat: number; stat: { name: string } }[];
  forms: { name: string; url: string }[];
  sprites: Parameters<typeof pickOfficialArtwork>[0];
}

interface FormInfo {
  id: number;
  displayName: string;
  artwork: string;
  types: string[];
  abilities: { name: string; isHidden: boolean }[];
  stats: Record<string, number>;
  total: number;
}

const STAT_ORDER = ['hp', 'attack', 'defense', 'special-attack', 'special-defense', 'speed'];
const STAT_LABELS: Record<string, string> = {
  'hp': 'HP',
  'attack': 'Atk',
  'defense': 'Def',
  'special-attack': 'SpA',
  'special-defense': 'SpD',
  'speed': 'Spe',
};

// Fallback labels when /pokemon-form has no English name, keyed by the
// suffix PokéAPI appends to the species name ("raichu-alola" → "alola").
const SUFFIX_LABELS: Record<string, string> = {
  alola: 'Alolan',
  galar: 'Galarian',
  hisui: 'Hisuian',
  paldea: 'Paldean',
  mega: 'Mega',
  gmax: 'Gigantamax',
  primal: 'Primal',
};

function fallbackName(varietyName: string, speciesName: string): string {
  const suffix = varietyName.startsWith(`${speciesName}-`)
    ? varietyName.slice(speciesName.length + 1)
    : varietyName;
  const [first, ...rest] = suffix.split('-');
  const prefix = SUFFIX_LABELS[first];
  const species = toTitleCase(speciesName);
  if (prefix) return [prefix, species, ...rest.map(toTitleCase)].join(' ');
  return `${species} (${toTitleCase(suffix)})`;
}

function toFormInfo(pokemon: PokeAPIFormPokemon, displayName: string): FormInfo {
  const stats = Object.fromEntries(pokemon.stats.map((s) => [s.stat.name, s.base_stat]));
  return {
    id: pokemon.id,
    displayName,
    artwork: pickOfficialArtwork(pokemon.sprites, pokemon.id),
    types: pokemon.types.map((t) => t.type.name),
    abilities: pokemon.abilities.map((a) => ({ name: a.ability.name, isHidden: a.is_hidden })),
    stats,
    total: Object.values(stats).reduce((sum, v) => sum + v, 0),
  };
}

async function getForms(pokemonId: number): Promise<{ base: FormInfo; forms: FormInfo[] } | null> {
  const species = await fetchSpecies(pokemonId);
  const varieties: PokeAPIVariety[] = species?.varieties ?? [];
  if (varieties.length < 2) return null;

  const results = await Promise.all(
    varieties.map(async (variety) => {
      const pokemon: PokeAPIFormPokemon | null = await fetchPokemon(variety.pokemon.name);
      if (!pokemon) return null;
      const form = pokemon.forms[0] ? await fetchPokemonForm(pokemon.forms[0].name) : null;
      const englishName: string | undefined = form?.names?.find(
        (n: { language: { name: string } }) => n.language.name === 'en'
      )?.name;
      const displayName = variety.is_default
        ? toTitleCase(species.name)
        : englishName ?? fallbackName(variety.pokemon.name, species.name);
      return { isDefault: variety.is_default, info: toFormInfo(pokemon, displayName) };
    })
  );

  const loaded = results.filter((r): r is NonNullable<typeof r> => r !== null);
  const base = loaded.find((r) => r.isDefault)?.info;
  const forms = loaded.filter((r) => !r.isDefault).map((r) => r.info);
  if (!base || forms.length === 0) return null;
  return { base, forms };
}

function StatDiff({ value, baseValue }: { value: number; baseValue: number }) {
  const diff = value - baseValue;
  if (diff === 0) return null;
  return (
    <span className={cn('text-[10px] ml-0.5', diff > 0 ? 'text-emerald-600' : 'text-red-500')}>
      {diff > 0 ? `+${diff}` : diff}
    </span>
  );
}

function FormCard({ form, base }: { form: FormInfo; base: FormInfo }) {
  const typesChanged = form.types.join() !== base.types.join();

  return (
    <Card>
      <CardContent className="p-4 flex flex-col items-center gap-3">
        <div className="w-32 h-32 flex items-center justify-center">
          <Image
            src={form.artwork}
            alt={form.displayName}
            width={128}
            height={128}
            className="object-contain max-w-full max-h-full"
            unoptimized
          />
        </div>

        <h3 className="text-base font-semibold text-center">{form.displayName}</h3>

        <div className="flex gap-1.5">
          {form.types.map((type) => {
            const colors = getTypeBadgeColors(type);
            return (
              <span
                key={type}
                className={cn(
                  'px-2.5 py-0.5 rounded-full text-xs font-medium capitalize',
                  typesChanged && 'ring-2 ring-offset-1 ring-amber-300'
                )}
                style={{ backgroundColor: colors.bg, color: colors.text }}
              >
                {type}
              </span>
            );
          })}
        </div>

        <div className="flex flex-wrap justify-center gap-1">
          {form.abilities.map((a) => (
            <Badge key={a.name} variant="outline" className="text-[11px] font-normal">
              {toTitleCase(a.name)}
              {a.isHidden && <span className="text-muted-foreground ml-1">(H)</span>}
            </Badge>
          ))}
        </div>

        <div className="w-full grid grid-cols-6 gap-1 text-center border-t border-border/50 pt-3">
          {STAT_ORDER.map((stat) => (
            <div key={stat}>
              <div className="text-[10px] text-muted-foreground">{STAT_LABELS[stat]}</div>
              <div className="text-sm font-medium">
                {form.stats[stat] ?? '–'}
                <StatDiff value={form.stats[stat] ?? 0} baseValue={base.stats[stat] ?? 0} />
              </div>
            </div>
          ))}
        </div>
        <div className="text-xs text-muted-foreground">
          Total {form.total}
          <StatDiff value={form.total} baseValue={base.total} />
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Every alternate form PokéAPI lists for the species: regional variants,
 * Mega Evolutions, Primal, Gigantamax and the rest, with their types,
 * abilities and stat changes relative to the default form.
 */
export default async function PokemonForms({ pokemonId }: { pokemonId: number }) {
  const data = await getForms(pokemonId);
  if (!data) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {data.forms.map((form) => (
        <FormCard key={form.id} form={form} base={data.base} />
      ))}
    </div>
  );
}
