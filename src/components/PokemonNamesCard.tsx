// components/PokemonNamesCard.tsx
import type { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { fetchSpecies } from '@/lib/pokeApi';
import { formatDexNumber, toTitleCase } from '@/lib/formatters';

interface SpeciesData {
  names: { name: string; language: { name: string } }[];
  pokedex_numbers: { entry_number: number; pokedex: { name: string } }[];
}

// PokéAPI language codes in the order we show them. "roomaji" is shown next to
// the Japanese kana rather than as its own row.
const LANGUAGES: { code: string; label: string }[] = [
  { code: 'ja-Hrkt', label: 'Japanese' },
  { code: 'ko', label: 'Korean' },
  { code: 'zh-Hant', label: 'Chinese (Trad.)' },
  { code: 'zh-Hans', label: 'Chinese (Simp.)' },
  { code: 'fr', label: 'French' },
  { code: 'de', label: 'German' },
  { code: 'es', label: 'Spanish' },
  { code: 'it', label: 'Italian' },
];

// Pokédex slugs whose display name isn't just the title-cased slug.
const POKEDEX_LABELS: Record<string, string> = {
  'original-johto': 'Johto (GSC)',
  'updated-johto': 'Johto (HGSS)',
  'original-sinnoh': 'Sinnoh (DP)',
  'extended-sinnoh': 'Sinnoh (Pt)',
  'original-unova': 'Unova (BW)',
  'updated-unova': 'Unova (B2W2)',
  'kalos-central': 'Kalos Central',
  'kalos-coastal': 'Kalos Coastal',
  'kalos-mountain': 'Kalos Mountain',
  'original-alola': 'Alola (SM)',
  'updated-alola': 'Alola (USUM)',
  'updated-hoenn': 'Hoenn (ORAS)',
  'letsgo-kanto': "Kanto (Let's Go)",
  'isle-of-armor': 'Isle of Armor',
  'crown-tundra': 'Crown Tundra',
  'hisui': 'Hisui',
  'kitakami': 'Kitakami',
  'blueberry': 'Blueberry Academy',
  'lumiose-city': 'Lumiose City',
  'hyperspace': 'Hyperspace',
};

function formatPokedexName(slug: string): string {
  return POKEDEX_LABELS[slug] ?? toTitleCase(slug);
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex justify-between items-center gap-4 py-2 border-b border-border/50 last:border-0">
      <span className="text-sm text-muted-foreground shrink-0">{label}</span>
      <span className="text-sm font-medium text-right">{children}</span>
    </div>
  );
}

export default async function PokemonNamesCard({ pokemonId }: { pokemonId: number }) {
  const species: SpeciesData | null = await fetchSpecies(pokemonId);
  if (!species) return null;

  const nameIn = (code: string) => species.names.find((n) => n.language.name === code)?.name;
  const romaji = nameIn('roomaji');

  const names = LANGUAGES.map(({ code, label }) => ({ label, name: nameIn(code), code }))
    .filter((n): n is { label: string; name: string; code: string } => Boolean(n.name))
    // Simplified Chinese is often identical to Traditional; skip the duplicate.
    .filter((n, _, all) => n.code !== 'zh-Hans' || n.name !== all.find((o) => o.code === 'zh-Hant')?.name);

  const dexNumbers = species.pokedex_numbers.filter((d) => d.pokedex.name !== 'national');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {names.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold">Names Around the World</CardTitle>
          </CardHeader>
          <CardContent>
            {names.map(({ label, name, code }) => (
              <Row key={code} label={label}>
                <span lang={code}>{name}</span>
                {code === 'ja-Hrkt' && romaji && (
                  <span className="text-xs text-muted-foreground ml-1">({romaji})</span>
                )}
              </Row>
            ))}
          </CardContent>
        </Card>
      )}

      {dexNumbers.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold">Regional Pokédex Numbers</CardTitle>
          </CardHeader>
          <CardContent>
            {dexNumbers.map(({ entry_number, pokedex }) => (
              <Row key={pokedex.name} label={formatPokedexName(pokedex.name)}>
                #{formatDexNumber(entry_number)}
              </Row>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
