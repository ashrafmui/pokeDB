// Types and display helpers for moves and abilities. Client-safe: the JSON
// itself is only imported by src/lib/moves.ts, which is server-only.

export type MoveClass = 'physical' | 'special' | 'status';

export interface MoveRow {
  id: number;
  slug: string;
  name: string;
  gen: number;
  type: string;
  cls: MoveClass;
  power: number | null;
  accuracy: number | null;
  pp: number | null;
  priority: number;
  /** Chance of the secondary effect, in percent. */
  chance: number | null;
  target: string | null;
  flags: string[];
  effect: string;
}

/** A move as listed on /moves, with how many species can learn it in current games. */
export interface MoveListRow extends MoveRow {
  learners: number;
}

export interface AbilityRow {
  id: number;
  slug: string;
  name: string;
  gen: number;
  short: string;
  effect: string;
}

/** Newest generation the dataset covers; "current games" means this one. */
export const CURRENT_GEN = 9;

/** Bit values must match METHOD_BITS in scripts/build-moves.mjs. */
export const LEARN_METHODS = [
  { bit: 1, label: 'Level up' },
  { bit: 2, label: 'Egg' },
  { bit: 4, label: 'Tutor' },
  { bit: 8, label: 'TM/HM' },
] as const;

export interface Learn {
  pokemonId: number;
  /** Newest generation the move can be learned in. */
  lastGen: number;
  /** Mask of LEARN_METHODS bits. */
  methods: number;
}

/** Inverse of the encoding in scripts/build-moves.mjs. */
export function decodeLearn(value: number): Learn {
  return { pokemonId: Math.floor(value / 256), lastGen: Math.floor((value % 256) / 16), methods: value % 16 };
}

/** A Pokémon that learns a move, with what the table needs to show and sort it. */
export interface LearnerRow {
  id: number;
  name: string;
  types: string[];
  total: number;
  speed: number;
  fullyEvolved: boolean;
  isDefault: boolean;
  methods: number;
  lastGen: number;
}

/** Notable move properties, in display order, with what they mean in battle. */
export const FLAG_LABELS: [flag: string, label: string][] = [
  ['contact', 'Makes contact'],
  ['protect', 'Blocked by Protect'],
  ['sound', 'Sound-based'],
  ['punch', 'Punching move'],
  ['bite', 'Biting move'],
  ['pulse', 'Pulse move'],
  ['powder', 'Powder move'],
  ['dance', 'Dance move'],
  ['ballistics', 'Ball or bomb move'],
  ['reflectable', 'Bounced by Magic Coat'],
  ['authentic', 'Bypasses Substitute'],
  ['defrost', 'Thaws the user'],
  ['heal', 'Blocked by Heal Block'],
  ['charge', 'Needs a charge turn'],
  ['recharge', 'Needs a recharge turn'],
  ['snatch', 'Stolen by Snatch'],
  ['mirror', 'Copyable by Mirror Move'],
  ['gravity', 'Blocked by Gravity'],
];

const TARGET_LABELS: Record<string, string> = {
  'selected-pokemon': 'One target',
  'selected-pokemon-me-first': 'One target (Me First)',
  'all-other-pokemon': 'All other Pokémon',
  'all-opponents': 'All opponents',
  'all-pokemon': 'All Pokémon',
  'all-allies': 'All allies',
  'random-opponent': 'A random opponent',
  'entire-field': 'The entire field',
  'users-field': "The user's side",
  'opponents-field': "The opponents' side",
  'user-and-allies': 'The user and allies',
  'user-or-ally': 'The user or an ally',
  user: 'The user',
  ally: 'An ally',
  'specific-move': 'Depends on the move',
  'fainting-pokemon': 'A fainted Pokémon',
};

export function targetLabel(target: string | null): string | null {
  if (!target) return null;
  return TARGET_LABELS[target] ?? target.replace(/-/g, ' ');
}

export const CLASS_LABELS: Record<MoveClass, string> = {
  physical: 'Physical',
  special: 'Special',
  status: 'Status',
};

export const title = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** "—" for moves without a value (status moves have no power, some never miss). */
export const orDash = (v: number | null) => (v == null ? '—' : String(v));
