// components/TypeEffectiveness.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

// Type damage relations - could also be fetched from DB
const TYPE_CHART: Record<string, { weakTo: string[]; resistantTo: string[]; immuneTo: string[] }> = {
  normal: { weakTo: ['fighting'], resistantTo: [], immuneTo: ['ghost'] },
  fire: { weakTo: ['water', 'ground', 'rock'], resistantTo: ['fire', 'grass', 'ice', 'bug', 'steel', 'fairy'], immuneTo: [] },
  water: { weakTo: ['electric', 'grass'], resistantTo: ['fire', 'water', 'ice', 'steel'], immuneTo: [] },
  electric: { weakTo: ['ground'], resistantTo: ['electric', 'flying', 'steel'], immuneTo: [] },
  grass: { weakTo: ['fire', 'ice', 'poison', 'flying', 'bug'], resistantTo: ['water', 'electric', 'grass', 'ground'], immuneTo: [] },
  ice: { weakTo: ['fire', 'fighting', 'rock', 'steel'], resistantTo: ['ice'], immuneTo: [] },
  fighting: { weakTo: ['flying', 'psychic', 'fairy'], resistantTo: ['bug', 'rock', 'dark'], immuneTo: [] },
  poison: { weakTo: ['ground', 'psychic'], resistantTo: ['grass', 'fighting', 'poison', 'bug', 'fairy'], immuneTo: [] },
  ground: { weakTo: ['water', 'grass', 'ice'], resistantTo: ['poison', 'rock'], immuneTo: ['electric'] },
  flying: { weakTo: ['electric', 'ice', 'rock'], resistantTo: ['grass', 'fighting', 'bug'], immuneTo: ['ground'] },
  psychic: { weakTo: ['bug', 'ghost', 'dark'], resistantTo: ['fighting', 'psychic'], immuneTo: [] },
  bug: { weakTo: ['fire', 'flying', 'rock'], resistantTo: ['grass', 'fighting', 'ground'], immuneTo: [] },
  rock: { weakTo: ['water', 'grass', 'fighting', 'ground', 'steel'], resistantTo: ['normal', 'fire', 'poison', 'flying'], immuneTo: [] },
  ghost: { weakTo: ['ghost', 'dark'], resistantTo: ['poison', 'bug'], immuneTo: ['normal', 'fighting'] },
  dragon: { weakTo: ['ice', 'dragon', 'fairy'], resistantTo: ['fire', 'water', 'electric', 'grass'], immuneTo: [] },
  dark: { weakTo: ['fighting', 'bug', 'fairy'], resistantTo: ['ghost', 'dark'], immuneTo: ['psychic'] },
  steel: { weakTo: ['fire', 'fighting', 'ground'], resistantTo: ['normal', 'grass', 'ice', 'flying', 'psychic', 'bug', 'rock', 'dragon', 'steel', 'fairy'], immuneTo: ['poison'] },
  fairy: { weakTo: ['poison', 'steel'], resistantTo: ['fighting', 'bug', 'dark'], immuneTo: ['dragon'] },
};

const TYPE_COLORS: Record<string, string> = {
  normal: 'bg-gray-400',
  fire: 'bg-orange-500',
  water: 'bg-blue-500',
  electric: 'bg-yellow-400',
  grass: 'bg-green-500',
  ice: 'bg-cyan-300',
  fighting: 'bg-red-700',
  poison: 'bg-purple-500',
  ground: 'bg-amber-600',
  flying: 'bg-indigo-300',
  psychic: 'bg-pink-500',
  bug: 'bg-lime-500',
  rock: 'bg-yellow-700',
  ghost: 'bg-purple-700',
  dragon: 'bg-indigo-600',
  dark: 'bg-gray-700',
  steel: 'bg-gray-400',
  fairy: 'bg-pink-300',
};

interface TypeBadgeProps {
  type: string;
  multiplier?: string;
}

function TypeBadge({ type, multiplier }: TypeBadgeProps) {
  return (
    <div className="flex items-center gap-1">
      <span className={cn(
        'px-2 py-0.5 rounded text-xs font-medium text-white capitalize',
        TYPE_COLORS[type] || 'bg-gray-500'
      )}>
        {type}
      </span>
      {multiplier && (
        <span className="text-xs text-muted-foreground">{multiplier}</span>
      )}
    </div>
  );
}

function calculateTypeEffectiveness(types: string[]): {
  quadWeakness: string[];
  doubleWeakness: string[];
  resistance: string[];
  quadResistance: string[];
  immunity: string[];
} {
  const multipliers: Record<string, number> = {};
  const allTypes = Object.keys(TYPE_CHART);
  
  // Initialize all types with 1x multiplier
  allTypes.forEach(t => multipliers[t] = 1);
  
  // Calculate combined effectiveness
  types.forEach(pokemonType => {
    const typeData = TYPE_CHART[pokemonType.toLowerCase()];
    if (!typeData) return;
    
    typeData.weakTo.forEach(t => multipliers[t] *= 2);
    typeData.resistantTo.forEach(t => multipliers[t] *= 0.5);
    typeData.immuneTo.forEach(t => multipliers[t] = 0);
  });
  
  const quadWeakness: string[] = [];
  const doubleWeakness: string[] = [];
  const resistance: string[] = [];
  const quadResistance: string[] = [];
  const immunity: string[] = [];
  
  Object.entries(multipliers).forEach(([type, mult]) => {
    if (mult === 0) immunity.push(type);
    else if (mult === 4) quadWeakness.push(type);
    else if (mult === 2) doubleWeakness.push(type);
    else if (mult === 0.5) resistance.push(type);
    else if (mult === 0.25) quadResistance.push(type);
  });
  
  return { quadWeakness, doubleWeakness, resistance, quadResistance, immunity };
}

interface TypeEffectivenessProps {
  types: { name: string; [key: string]: unknown }[];
}

export default function TypeEffectiveness({ types }: TypeEffectivenessProps) {
  const typeNames = types.map(t => t.name.toLowerCase());
  const effectiveness = calculateTypeEffectiveness(typeNames);
  
  const sections = [
    { label: '4× Weak', types: effectiveness.quadWeakness, color: 'text-red-600' },
    { label: '2× Weak', types: effectiveness.doubleWeakness, color: 'text-orange-500' },
    { label: '½× Resist', types: effectiveness.resistance, color: 'text-green-600' },
    { label: '¼× Resist', types: effectiveness.quadResistance, color: 'text-emerald-600' },
    { label: 'Immune', types: effectiveness.immunity, color: 'text-blue-600' },
  ].filter(s => s.types.length > 0);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold">Type Effectiveness</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {sections.map(section => (
          <div key={section.label} className="flex items-start gap-3">
            <span className={cn('text-sm font-medium w-20 shrink-0', section.color)}>
              {section.label}
            </span>
            <div className="flex flex-wrap gap-1.5">
              {section.types.map(type => (
                <TypeBadge key={type} type={type} />
              ))}
            </div>
          </div>
        ))}
        {sections.length === 0 && (
          <p className="text-sm text-muted-foreground">No special type interactions</p>
        )}
      </CardContent>
    </Card>
  );
}