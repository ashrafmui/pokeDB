// components/PokemonAbilities.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { ChevronDownIcon } from '@radix-ui/react-icons';

interface AbilitySlot {
  ability: { name: string; url: string };
  is_hidden: boolean;
  slot: number;
}

interface AbilityDetail {
  effect_entries: {
    effect: string;
    short_effect: string;
    language: { name: string };
  }[];
}

interface ProcessedAbility {
  name: string;
  isHidden: boolean;
  slot: number;
  shortEffect: string | null;
  effect: string | null;
}

async function getAbilities(pokemonId: number): Promise<ProcessedAbility[]> {
  // Fetch pokemon data to get ability list
  const pokemonRes = await fetch(
    `https://pokeapi.co/api/v2/pokemon/${pokemonId}`,
    { next: { revalidate: 86400 } } // Cache for 24 hours
  );
  
  if (!pokemonRes.ok) return [];
  
  const pokemon = await pokemonRes.json();
  const abilitySlots: AbilitySlot[] = pokemon.abilities;

  // Fetch details for each ability in parallel
  const abilities = await Promise.all(
    abilitySlots.map(async (slot): Promise<ProcessedAbility> => {
      const detailRes = await fetch(slot.ability.url, { 
        next: { revalidate: 86400 } 
      });
      
      if (!detailRes.ok) {
        return {
          name: slot.ability.name,
          isHidden: slot.is_hidden,
          slot: slot.slot,
          shortEffect: null,
          effect: null,
        };
      }

      const detail: AbilityDetail = await detailRes.json();
      const englishEntry = detail.effect_entries.find(
        e => e.language.name === 'en'
      );

      return {
        name: slot.ability.name,
        isHidden: slot.is_hidden,
        slot: slot.slot,
        shortEffect: englishEntry?.short_effect || null,
        effect: englishEntry?.effect || null,
      };
    })
  );

  return abilities.sort((a, b) => a.slot - b.slot);
}

function formatAbilityName(name: string): string {
  return name
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export default async function PokemonAbilities({ pokemonId }: { pokemonId: number }) {
  const abilities = await getAbilities(pokemonId);

  if (!abilities.length) return null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold">Abilities</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {abilities.map((ability) => (
          <Collapsible key={ability.name}>
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium">
                    {formatAbilityName(ability.name)}
                  </span>
                  {ability.isHidden && (
                    <Badge variant="secondary" className="text-xs">
                      Hidden
                    </Badge>
                  )}
                </div>
                {ability.shortEffect && (
                  <p className="text-sm text-muted-foreground">
                    {ability.shortEffect}
                  </p>
                )}
              </div>
              {ability.effect && (
                <CollapsibleTrigger className="p-1 hover:bg-muted rounded transition-colors">
                  <ChevronDownIcon className="h-4 w-4 text-muted-foreground" />
                </CollapsibleTrigger>
              )}
            </div>
            {ability.effect && (
              <CollapsibleContent>
                <div className="mt-2 p-3 bg-muted/50 rounded-md text-sm">
                  {ability.effect}
                </div>
              </CollapsibleContent>
            )}
          </Collapsible>
        ))}
      </CardContent>
    </Card>
  );
}