export const TYPE_CHART: Record<string, { weakTo: string[]; resistantTo: string[]; immuneTo: string[] }> = {
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

export interface TypeEffectivenessResult {
  quadWeakness: string[];
  doubleWeakness: string[];
  resistance: string[];
  quadResistance: string[];
  immunity: string[];
}

export function calculateTypeEffectiveness(types: string[]): TypeEffectivenessResult {
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

// Get single type's damage relations (for the header hover)
export function getTypeRelations(typeName: string) {
  return TYPE_CHART[typeName.toLowerCase()] || null;
}