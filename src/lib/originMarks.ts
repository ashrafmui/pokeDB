const GAME_LOGOS = new Set([
  'red', 'blue', 'yellow',
  'gold', 'silver', 'crystal',
  'ruby', 'sapphire', 'emerald', 'firered', 'leafgreen',
  'diamond', 'pearl', 'platinum', 'heartgold', 'soulsilver',
  'black', 'white', 'black-2', 'white-2',
  'x', 'y', 'omega-ruby', 'alpha-sapphire',
  'sun', 'moon', 'ultra-sun', 'ultra-moon',
  'lets-go-pikachu', 'lets-go-eevee',
  'sword', 'shield',
  'brilliant-diamond', 'shining-pearl',
  'legends-arceus',
  'scarlet', 'violet',
]);

export function fetchBoxartUrl(version: string): string | null {
  const key = version.toLowerCase();
  if (!GAME_LOGOS.has(key)) return null;
  return `/images/game-logos/${key}.png`;
}
