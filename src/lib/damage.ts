// Generation 9 damage formula, for the damage calculator. Pure and client-safe.

export type Weather = 'none' | 'sun' | 'rain' | 'sand' | 'snow';
export type MoveClass = 'physical' | 'special';

export interface Combatant {
  level: number;
  /** Base stats in order HP, Atk, Def, SpA, SpD, Spe. */
  base: readonly number[];
  types: readonly string[];
  /** Effort values for the stats that matter: HP and the relevant attacking/defending stat. */
  evs: number;
  /** -1 hindering, 0 neutral, 1 boosting (±10%). */
  nature: -1 | 0 | 1;
  /** Stat stage, -6 to +6. */
  stage: number;
}

export const IV = 31;

export function hpStat(base: number, level: number, evs: number): number {
  if (base === 1) return 1; // Shedinja
  return Math.floor(((2 * base + IV + Math.floor(evs / 4)) * level) / 100) + level + 10;
}

export function otherStat(base: number, level: number, evs: number, nature: -1 | 0 | 1): number {
  const raw = Math.floor(((2 * base + IV + Math.floor(evs / 4)) * level) / 100) + 5;
  return Math.floor(raw * (nature === 1 ? 1.1 : nature === -1 ? 0.9 : 1));
}

export function stageMultiplier(stage: number): number {
  return stage >= 0 ? (2 + stage) / 2 : 2 / (2 - stage);
}

/** Pokémon's rounding: halves round down. */
export const pokeRound = (x: number) => (x % 1 > 0.5 ? Math.ceil(x) : Math.floor(x));

export interface MoveInput {
  type: string;
  cls: MoveClass;
  power: number;
}

export interface Modifiers {
  weather: Weather;
  crit: boolean;
  burned: boolean;
  screen: boolean;
  spread: boolean;
  /** Item multiplier on the attacker's final damage (Life Orb 1.3, Expert Belt 1.2 on super effective). */
  attackerItem: 'none' | 'band' | 'specs' | 'life-orb' | 'expert-belt';
  defenderItem: 'none' | 'assault-vest';
}

export interface DamageResult {
  /** The 16 possible rolls, ascending. */
  rolls: number[];
  min: number;
  max: number;
  defenderHp: number;
  effectiveness: number;
  stab: boolean;
}

export function calculate(
  attacker: Combatant,
  defender: Combatant,
  move: MoveInput,
  mods: Modifiers,
  effectiveness: number
): DamageResult {
  const phys = move.cls === 'physical';
  const atkIndex = phys ? 1 : 3;
  const defIndex = phys ? 2 : 4;

  let atkStage = attacker.stage;
  let defStage = defender.stage;
  if (mods.crit) {
    atkStage = Math.max(atkStage, 0);
    defStage = Math.min(defStage, 0);
  }

  let atk = otherStat(attacker.base[atkIndex], attacker.level, attacker.evs, attacker.nature);
  atk = Math.floor(atk * stageMultiplier(atkStage));
  if ((mods.attackerItem === 'band' && phys) || (mods.attackerItem === 'specs' && !phys)) atk = Math.floor(atk * 1.5);

  let def = otherStat(defender.base[defIndex], defender.level, defender.evs, defender.nature);
  def = Math.floor(def * stageMultiplier(defStage));
  if (mods.defenderItem === 'assault-vest' && !phys) def = Math.floor(def * 1.5);
  if (mods.weather === 'sand' && !phys && defender.types.includes('rock')) def = Math.floor(def * 1.5);
  if (mods.weather === 'snow' && phys && defender.types.includes('ice')) def = Math.floor(def * 1.5);

  const hp = hpStat(defender.base[0], defender.level, defender.evs);
  const stab = attacker.types.includes(move.type);

  let base = Math.floor(Math.floor((Math.floor((2 * attacker.level) / 5 + 2) * move.power * atk) / Math.max(def, 1)) / 50) + 2;
  if (mods.spread) base = pokeRound(base * 0.75);
  if (mods.weather === 'sun') {
    if (move.type === 'fire') base = pokeRound(base * 1.5);
    else if (move.type === 'water') base = pokeRound(base * 0.5);
  } else if (mods.weather === 'rain') {
    if (move.type === 'water') base = pokeRound(base * 1.5);
    else if (move.type === 'fire') base = pokeRound(base * 0.5);
  }
  if (mods.crit) base = pokeRound(base * 1.5);

  const rolls: number[] = [];
  for (let r = 85; r <= 100; r++) {
    let d = Math.floor((base * r) / 100);
    if (stab) d = pokeRound(d * 1.5);
    d = Math.floor(d * effectiveness);
    if (mods.burned && phys) d = pokeRound(d * 0.5);
    if (mods.screen && !mods.crit) d = pokeRound(d * (mods.spread ? 2 / 3 : 0.5));
    if (mods.attackerItem === 'life-orb') d = pokeRound(d * 1.3);
    if (mods.attackerItem === 'expert-belt' && effectiveness > 1) d = pokeRound(d * 1.2);
    rolls.push(effectiveness === 0 ? 0 : Math.max(d, 1));
  }
  return { rolls, min: rolls[0], max: rolls[15], defenderHp: hp, effectiveness, stab };
}

/**
 * Chance that `hits` successive hits (independent rolls) knock out `hp`,
 * from 0 to 1.
 */
export function koChance(rolls: readonly number[], hp: number, hits: number): number {
  if (rolls[15] === 0) return 0;
  let dist = new Map<number, number>([[0, 1]]);
  for (let i = 0; i < hits; i++) {
    const next = new Map<number, number>();
    for (const [sum, p] of dist) {
      for (const r of rolls) {
        const key = Math.min(sum + r, hp); // cap: anything past KO is equivalent
        next.set(key, (next.get(key) ?? 0) + p / rolls.length);
      }
    }
    dist = next;
  }
  return dist.get(hp) ?? 0;
}

/** "Guaranteed OHKO", "56.3% chance to 2HKO", or "Needs 5+ hits". */
export function koText(result: DamageResult): string {
  if (result.max === 0) return 'No effect';
  for (let hits = 1; hits <= 4; hits++) {
    const chance = koChance(result.rolls, result.defenderHp, hits);
    if (chance >= 1 - 1e-9) return `Guaranteed ${hits === 1 ? 'OHKO' : `${hits}HKO`}`;
    if (chance > 0) {
      const pct = chance * 100;
      return `${pct < 0.1 ? '<0.1' : pct > 99.9 ? '>99.9' : pct.toFixed(1)}% chance to ${hits === 1 ? 'OHKO' : `${hits}HKO`}`;
    }
  }
  return 'Needs 5+ hits';
}
