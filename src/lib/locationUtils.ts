export interface LocationData {
  name: string;
  methods: string[];
  levels: string;
  chance: number;
  locationType: string;
}

export interface GameLocation {
  game: string;
  locations: LocationData[];
}

export function getLocationType(name: string): string {
  const lowerName = name.toLowerCase();
  if (lowerName.includes('route') || lowerName.includes('road')) return 'route';
  if (lowerName.includes('cave') || lowerName.includes('tunnel') || lowerName.includes('mine') || lowerName.includes('mount') || lowerName.includes('rock')) return 'cave';
  if (lowerName.includes('forest') || lowerName.includes('woods') || lowerName.includes('garden') || lowerName.includes('park')) return 'forest';
  if (lowerName.includes('sea') || lowerName.includes('ocean') || lowerName.includes('lake') || lowerName.includes('pond') || lowerName.includes('river') || lowerName.includes('falls') || lowerName.includes('beach') || lowerName.includes('bay')) return 'water';
  if (lowerName.includes('city') || lowerName.includes('town') || lowerName.includes('village')) return 'city';
  if (lowerName.includes('tower') || lowerName.includes('castle') || lowerName.includes('mansion') || lowerName.includes('building')) return 'building';
  if (lowerName.includes('safari')) return 'safari';
  if (lowerName.includes('victory') || lowerName.includes('league') || lowerName.includes('elite')) return 'league';
  return 'other';
}

export function getLocationIcon(type: string): string {
  const icons: Record<string, string> = {
    route: '🛤️',
    cave: '🪨',
    forest: '🌲',
    water: '🌊',
    city: '🏙️',
    building: '🏛️',
    safari: '🦁',
    league: '🏆',
    other: '📍',
  };
  return icons[type] || '📍';
}

export function formatLocationName(name: string): string {
  return name
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
    .replace(/Area$/, '')
    .trim();
}

export function formatMethodName(method: string): string {
  const methodMap: Record<string, string> = {
    'walk': 'Walking',
    'old-rod': 'Old Rod',
    'good-rod': 'Good Rod',
    'super-rod': 'Super Rod',
    'surf': 'Surfing',
    'rock-smash': 'Rock Smash',
    'headbutt': 'Headbutt',
    'dark-grass': 'Dark Grass',
    'grass-spots': 'Shaking Grass',
    'cave-spots': 'Dust Clouds',
    'bridge-spots': 'Bridge Shadows',
    'super-rod-spots': 'Fishing Spots',
    'surf-spots': 'Rippling Water',
    'yellow-flowers': 'Yellow Flowers',
    'purple-flowers': 'Purple Flowers',
    'red-flowers': 'Red Flowers',
    'rough-terrain': 'Rough Terrain',
    'gift': 'Gift',
    'gift-egg': 'Gift Egg',
    'only-one': 'Static Encounter',
    'pokeflute': 'Poké Flute',
    'headbutt-low': 'Headbutt (Low)',
    'headbutt-normal': 'Headbutt (Normal)',
    'headbutt-high': 'Headbutt (High)',
    'squirt-bottle': 'Squirt Bottle',
    'wailmer-pail': 'Wailmer Pail',
    'seaweed': 'Seaweed',
    'roaming-grass': 'Roaming (Grass)',
    'roaming-water': 'Roaming (Water)',
  };
  return methodMap[method] || method.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

export function getComputedBgColor(bgClass: string): string {
  const colorMap: Record<string, string> = {
    'bg-red-500': '#ef4444',
    'bg-red-600': '#dc2626',
    'bg-red-700': '#b91c1c',
    'bg-blue-500': '#3b82f6',
    'bg-blue-600': '#2563eb',
    'bg-blue-700': '#1d4ed8',
    'bg-yellow-400': '#facc15',
    'bg-yellow-500': '#eab308',
    'bg-yellow-600': '#ca8a04',
    'bg-gray-400': '#9ca3af',
    'bg-gray-500': '#6b7280',
    'bg-gray-800': '#1f2937',
    'bg-cyan-400': '#22d3ee',
    'bg-cyan-500': '#06b6d4',
    'bg-emerald-500': '#10b981',
    'bg-orange-500': '#f97316',
    'bg-green-500': '#22c55e',
    'bg-pink-400': '#f472b6',
    'bg-slate-400': '#94a3b8',
    'bg-purple-600': '#9333ea',
    'bg-purple-700': '#7e22ce',
    'bg-amber-600': '#d97706',
    'bg-indigo-600': '#4f46e5',
    'bg-violet-600': '#7c3aed',
  };
  return colorMap[bgClass] || '#6b7280';
}