// components/PokemonSpeciesCard.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface PokemonData {
  height: number;
  weight: number;
}

interface SpeciesData {
  capture_rate: number;
  base_happiness: number;
  growth_rate: { name: string };
  habitat: { name: string } | null;
  generation: { name: string };
  is_baby: boolean;
  is_legendary: boolean;
  is_mythical: boolean;
}

async function getPokemonData(pokemonId: number): Promise<PokemonData | null> {
  const res = await fetch(
    `https://pokeapi.co/api/v2/pokemon/${pokemonId}`,
    { next: { revalidate: 86400 } }
  );
  if (!res.ok) return null;
  const data = await res.json();
  return { height: data.height, weight: data.weight };
}

async function getSpeciesData(pokemonId: number): Promise<SpeciesData | null> {
  const res = await fetch(
    `https://pokeapi.co/api/v2/pokemon-species/${pokemonId}`,
    { next: { revalidate: 86400 } }
  );
  if (!res.ok) return null;
  return res.json();
}

function formatHeight(decimeters: number): { metric: string; imperial: string } {
  const meters = decimeters / 10;
  const totalInches = decimeters * 3.937;
  const feet = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches % 12);
  return {
    metric: `${meters.toFixed(1)} m`,
    imperial: `${feet}'${inches.toString().padStart(2, '0')}"`,
  };
}

function formatWeight(hectograms: number): { metric: string; imperial: string } {
  const kg = hectograms / 10;
  const lbs = kg * 2.20462;
  return {
    metric: `${kg.toFixed(1)} kg`,
    imperial: `${lbs.toFixed(1)} lbs`,
  };
}

function formatGrowthRate(rate: string): string {
  return rate
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function formatGeneration(gen: string): string {
  const match = gen.match(/generation-(\w+)/i);
  if (!match) return gen;
  const numeral = match[1].toUpperCase();
  const regions: Record<string, string> = {
    'I': 'Kanto', 'II': 'Johto', 'III': 'Hoenn', 'IV': 'Sinnoh',
    'V': 'Unova', 'VI': 'Kalos', 'VII': 'Alola', 'VIII': 'Galar', 'IX': 'Paldea',
  };
  return `Gen ${numeral}${regions[numeral] ? ` (${regions[numeral]})` : ''}`;
}

function calculateCatchProbability(captureRate: number): string {
  const probability = (captureRate / 255) * 100;
  return `${probability.toFixed(1)}%`;
}

interface StatRowProps {
  label: string;
  value: string;
  subValue?: string;
  tooltip?: string;
}

function StatRow({ label, value, subValue, tooltip }: StatRowProps) {
  const content = (
    <div className="flex justify-between items-center py-2 border-b border-border/50 last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <div className="text-right">
        <span className="text-sm font-medium">{value}</span>
        {subValue && (
          <span className="text-xs text-muted-foreground ml-1">({subValue})</span>
        )}
      </div>
    </div>
  );

  if (tooltip) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="cursor-help">{content}</div>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-xs">{tooltip}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }
  return content;
}

export default async function PokemonSpeciesCard({ pokemonId }: { pokemonId: number }) {
  const [pokemonData, speciesData] = await Promise.all([
    getPokemonData(pokemonId),
    getSpeciesData(pokemonId),
  ]);

  if (!pokemonData) return null;

  const height = formatHeight(pokemonData.height);
  const weight = formatWeight(pokemonData.weight);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Species Data</CardTitle>
          <div className="flex gap-1.5">
            {speciesData?.is_baby && (
              <Badge variant="outline" className="text-xs">👶 Baby</Badge>
            )}
            {speciesData?.is_legendary && (
              <Badge variant="outline" className="text-xs bg-amber-50 border-amber-300 text-amber-700">
                ⭐ Legendary
              </Badge>
            )}
            {speciesData?.is_mythical && (
              <Badge variant="outline" className="text-xs bg-purple-50 border-purple-300 text-purple-700">
                🌟 Mythical
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-0">
          <StatRow label="Height" value={height.metric} subValue={height.imperial} />
          <StatRow label="Weight" value={weight.metric} subValue={weight.imperial} />
          {speciesData && (
            <>
              <StatRow 
                label="Catch Rate" 
                value={speciesData.capture_rate.toString()}
                subValue={calculateCatchProbability(speciesData.capture_rate)}
                tooltip="Probability with Poké Ball at full HP"
              />
              <StatRow 
                label="Base Happiness" 
                value={(speciesData.base_happiness ?? 50).toString()}
              />
              <StatRow 
                label="Growth Rate" 
                value={formatGrowthRate(speciesData.growth_rate.name)}
              />
              <StatRow 
                label="Generation" 
                value={formatGeneration(speciesData.generation.name)}
              />
              {speciesData.habitat && (
                <StatRow 
                  label="Habitat" 
                  value={speciesData.habitat.name.charAt(0).toUpperCase() + speciesData.habitat.name.slice(1)}
                />
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}