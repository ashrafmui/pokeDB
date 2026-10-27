// Turns PokéAPI evolution_details into readable text, e.g.
// { min_level: 16 } → "Lv. 16", { item: thunder-stone } → "Thunder Stone",
// { min_happiness: 160, time_of_day: "day" } → "High friendship, daytime".

import { toTitleCase } from '@/lib/formatters';

type Named = { name: string } | null | undefined;

export interface EvolutionDetail {
  trigger: { name: string };
  min_level?: number | null;
  item?: Named;
  held_item?: Named;
  known_move?: Named;
  known_move_type?: Named;
  location?: Named;
  party_species?: Named;
  party_type?: Named;
  trade_species?: Named;
  gender?: number | null;
  min_happiness?: number | null;
  min_beauty?: number | null;
  min_affection?: number | null;
  needs_overworld_rain?: boolean;
  relative_physical_stats?: number | null;
  time_of_day?: string;
  turn_upside_down?: boolean;
}

const name = (n: Named) => (n ? toTitleCase(n.name) : '');

const TRIGGER_TEXT: Record<string, string> = {
  'shed': 'Level 20 with an empty party slot and a Poké Ball',
  'spin': 'Spin around holding a Sweet',
  'tower-of-darkness': 'Train in the Tower of Darkness',
  'tower-of-waters': 'Train in the Tower of Waters',
  'three-critical-hits': 'Land 3 critical hits in one battle',
  'take-damage': 'Take 49+ damage, then walk under the Dusty Bowl arch',
  'agile-style-move': 'Use an agile style move 20 times',
  'strong-style-move': 'Use a strong style move 20 times',
  'recoil-damage': 'Take 294+ recoil damage without fainting',
};

/** Every condition in one evolution_details entry, most important first. */
function conditions(d: EvolutionDetail): string[] {
  const parts: string[] = [];
  const trigger = d.trigger?.name;

  if (trigger && TRIGGER_TEXT[trigger]) parts.push(TRIGGER_TEXT[trigger]);
  if (trigger === 'trade') parts.push(d.trade_species ? `Trade for ${name(d.trade_species)}` : 'Trade');
  if (d.item) parts.push(name(d.item));
  if (d.min_level) parts.push(`Lv. ${d.min_level}`);
  if (d.held_item) parts.push(`holding ${name(d.held_item)}`);
  if (d.min_happiness) parts.push('High friendship');
  if (d.min_affection) parts.push('High affection');
  if (d.min_beauty) parts.push('High beauty');
  if (d.known_move) parts.push(`knowing ${name(d.known_move)}`);
  if (d.known_move_type) parts.push(`knowing a ${name(d.known_move_type)}-type move`);
  if (d.location) parts.push(`at ${name(d.location)}`);
  if (d.party_species) parts.push(`with ${name(d.party_species)} in party`);
  if (d.party_type) parts.push(`with a ${name(d.party_type)}-type in party`);
  if (d.gender === 1) parts.push('female');
  if (d.gender === 2) parts.push('male');
  if (d.relative_physical_stats === 1) parts.push('Attack > Defense');
  if (d.relative_physical_stats === -1) parts.push('Attack < Defense');
  if (d.relative_physical_stats === 0) parts.push('Attack = Defense');
  if (d.time_of_day === 'day') parts.push('daytime');
  if (d.time_of_day === 'night') parts.push('nighttime');
  if (d.time_of_day === 'dusk') parts.push('at dusk');
  if (d.needs_overworld_rain) parts.push('while raining');
  if (d.turn_upside_down) parts.push('holding the console upside down');

  // A bare level-up with no other condition (rare, e.g. some event forms).
  if (parts.length === 0 && trigger === 'level-up') parts.push('Level up');
  return parts;
}

function describeOne(d: EvolutionDetail): string {
  const text = conditions(d).join(', ');
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/**
 * Short label plus the full description for an evolution step.
 *
 * PokéAPI lists one entry per method across games (e.g. Leafeon: a mossy
 * rock location in older games, a Leaf Stone from Sword/Shield on). The last
 * entry is the most recent method, so it becomes the label; the full text
 * lists up to four distinct methods, newest first.
 */
export function describeEvolution(details: EvolutionDetail[]): { label: string; full: string } | null {
  const descriptions = [...new Set(details.map(describeOne).filter(Boolean))];
  if (descriptions.length === 0) return null;
  const label = descriptions[descriptions.length - 1];
  const shown = descriptions.slice(-4).reverse();
  const more = descriptions.length > shown.length ? ' (and other methods in older games)' : '';
  return { label, full: shown.join(' — or — ') + more };
}
