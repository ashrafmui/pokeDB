// components/BreedingInfo.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface SpeciesData {
  gender_rate: number;
  hatch_counter: number;
  egg_groups: { name: string }[];
}

async function getSpeciesData(pokemonId: number): Promise<SpeciesData | null> {
  const res = await fetch(
    `https://pokeapi.co/api/v2/pokemon-species/${pokemonId}`,
    { next: { revalidate: 86400 } }
  );
  if (!res.ok) return null;
  return res.json();
}

function formatEggGroupName(name: string): string {
  const specialCases: Record<string, string> = {
    'no-eggs': 'Undiscovered',
    'water1': 'Water 1',
    'water2': 'Water 2',
    'water3': 'Water 3',
    'ground': 'Field',
    'humanshape': 'Human-Like',
    'indeterminate': 'Amorphous',
    'plant': 'Grass',
  };
  
  if (specialCases[name.toLowerCase()]) {
    return specialCases[name.toLowerCase()];
  }
  
  return name
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function GenderBar({ genderRate }: { genderRate: number }) {
  if (genderRate === -1) {
    return (
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">Gender</span>
          <span className="text-gray-500">Genderless</span>
        </div>
        <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
          <div className="h-full w-full bg-gray-400" />
        </div>
      </div>
    );
  }

  const femalePercent = (genderRate / 8) * 100;
  const malePercent = 100 - femalePercent;

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs">
        <span className="text-blue-600">♂ {malePercent.toFixed(1)}%</span>
        <span className="text-pink-500">♀ {femalePercent.toFixed(1)}%</span>
      </div>
      <div className="h-2 rounded-full bg-pink-400 overflow-hidden">
        <div 
          className="h-full bg-blue-500 transition-all"
          style={{ width: `${malePercent}%` }}
        />
      </div>
    </div>
  );
}

function calculateHatchSteps(hatchCounter: number): number {
  return (hatchCounter + 1) * 257;
}

export default async function BreedingInfo({ pokemonId }: { pokemonId: number }) {
  const speciesData = await getSpeciesData(pokemonId);

  if (!speciesData) return null;

  const isUndiscovered = speciesData.egg_groups.some(g => 
    g.name.toLowerCase() === 'no-eggs'
  );

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold">Breeding</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Egg Groups */}
        <div className="space-y-1.5">
          <span className="text-sm text-muted-foreground">Egg Groups</span>
          <div className="flex flex-wrap gap-1.5">
            {speciesData.egg_groups.map(group => (
              <Badge 
                key={group.name} 
                variant="secondary"
                className={cn(isUndiscovered && 'bg-gray-100 text-gray-500')}
              >
                {formatEggGroupName(group.name)}
              </Badge>
            ))}
          </div>
        </div>

        {/* Gender Ratio */}
        <GenderBar genderRate={speciesData.gender_rate} />

        {/* Egg Cycles */}
        {!isUndiscovered && (
          <div className="flex justify-between items-center pt-2 border-t border-border/50">
            <span className="text-sm text-muted-foreground">Egg Cycles</span>
            <div className="text-right">
              <span className="text-sm font-medium">{speciesData.hatch_counter}</span>
              <span className="text-xs text-muted-foreground ml-1">
                (~{calculateHatchSteps(speciesData.hatch_counter).toLocaleString()} steps)
              </span>
            </div>
          </div>
        )}

        {isUndiscovered && (
          <p className="text-xs text-muted-foreground italic pt-2 border-t border-border/50">
            This Pokémon cannot breed
          </p>
        )}
      </CardContent>
    </Card>
  );
}