#!/usr/bin/env node
// Builds src/data/moves.json and src/data/abilities.json: every move with its
// stats, effect text and a compact "who learns it" table, and every ability
// with its effect text. Which Pokémon have an ability comes from dex.json.
//
// Source: PokéAPI's CSV tables, pinned to a commit (see
// scripts/lib/pokeapi-csv.mjs).
//
//   npm run build:moves

import { writeFile, mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { POKEAPI_COMMIT, ENGLISH, loadCsv, groupBy, indexBy, int } from './lib/pokeapi-csv.mjs';

const OUT_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'data');

// Bit flags for how a Pokémon learns a move. Must match LEARN_METHODS in src/lib/moves.ts.
const METHOD_BITS = { 1: 1, 2: 2, 3: 4, 4: 8 }; // level-up, egg, tutor, machine

/** "[Flinches]{mechanic:flinch}" → "Flinches", "$effect_chance%" → "10%". */
const clean = (text, effectChance) =>
  text
    .replace(/\[([^\]]*)\]\{[^}]*\}/g, '$1')
    .replace(/\$effect_chance/g, effectChance == null ? '' : String(effectChance))
    .replace(/\u00ad/g, '')
    .replace(/\s+/g, ' ')
    .trim();

async function main() {
  const names = [
    'moves', 'move_names', 'move_effect_prose', 'move_damage_classes', 'move_flags', 'move_flag_map',
    'move_targets', 'move_flavor_text', 'types', 'pokemon_moves', 'version_groups',
    'abilities', 'ability_names', 'ability_prose',
  ];
  const csv = Object.fromEntries(await Promise.all(names.map(async (n) => [n, await loadCsv(n)])));

  const types = indexBy(csv.types, 'id');
  const classes = indexBy(csv.move_damage_classes, 'id');
  const flags = indexBy(csv.move_flags, 'id');
  const targets = indexBy(csv.move_targets, 'id');
  const moveNames = indexBy(csv.move_names.filter((r) => r.local_language_id === ENGLISH), 'move_id');
  const effects = indexBy(csv.move_effect_prose.filter((r) => r.local_language_id === ENGLISH), 'move_effect_id');
  const flagsByMove = groupBy(csv.move_flag_map, 'move_id');
  // PokéAPI has no effect prose for many newer moves, so fall back to the
  // newest English in-game description.
  const flavor = new Map();
  for (const r of csv.move_flavor_text) {
    if (r.language_id !== ENGLISH) continue;
    const prev = flavor.get(r.move_id);
    if (!prev || Number(r.version_group_id) > prev.vg) flavor.set(r.move_id, { vg: Number(r.version_group_id), text: r.flavor_text });
  }
  const vgGeneration = new Map(csv.version_groups.map((v) => [v.id, Number(v.generation_id)]));

  // ── Moves ────────────────────────────────────────────────────────────────
  // Skip Shadow moves and the ??? type (ids above 10000); everything else is a real move.
  const moves = csv.moves
    .filter((m) => Number(m.id) < 10000)
    .map((m) => {
      const chance = int(m.effect_chance);
      const effect = effects.get(m.effect_id);
      return {
        id: Number(m.id),
        slug: m.identifier,
        name: moveNames.get(m.id)?.name ?? m.identifier,
        gen: Number(m.generation_id),
        type: types.get(m.type_id).identifier,
        cls: classes.get(m.damage_class_id).identifier,
        power: int(m.power),
        accuracy: int(m.accuracy),
        pp: int(m.pp),
        priority: Number(m.priority),
        chance,
        target: targets.get(m.target_id)?.identifier ?? null,
        flags: (flagsByMove.get(m.id) ?? []).map((f) => flags.get(f.move_flag_id).identifier),
        effect: effect ? clean(effect.short_effect, chance) : clean(flavor.get(m.id)?.text ?? '', chance),
      };
    })
    .sort((a, b) => a.id - b.id);
  const knownMoves = new Set(moves.map((m) => String(m.id)));

  // ── Learnsets ────────────────────────────────────────────────────────────
  // One integer per (move, Pokémon): pokemonId * 256 + lastGen * 16 + methods,
  // where lastGen is the newest generation it can be learned in (so "still
  // learnable in Gen 9" is a lookup) and methods is the METHOD_BITS mask.
  const pairs = new Map(); // "moveId:pokemonId" → { methods, lastGen }
  for (const r of csv.pokemon_moves) {
    const bit = METHOD_BITS[r.pokemon_move_method_id];
    if (!bit || !knownMoves.has(r.move_id)) continue;
    const key = `${r.move_id}:${r.pokemon_id}`;
    const gen = vgGeneration.get(r.version_group_id) ?? 0;
    const cur = pairs.get(key) ?? { methods: 0, lastGen: 0 };
    cur.methods |= bit;
    cur.lastGen = Math.max(cur.lastGen, gen);
    pairs.set(key, cur);
  }
  const learn = {};
  for (const [key, { methods, lastGen }] of pairs) {
    const [moveId, pokemonId] = key.split(':').map(Number);
    (learn[moveId] ??= []).push(pokemonId * 256 + lastGen * 16 + methods);
  }
  for (const list of Object.values(learn)) list.sort((a, b) => a - b);

  // ── Abilities ────────────────────────────────────────────────────────────
  const abilityNames = indexBy(csv.ability_names.filter((r) => r.local_language_id === ENGLISH), 'ability_id');
  const abilityProse = indexBy(csv.ability_prose.filter((r) => r.local_language_id === ENGLISH), 'ability_id');
  const abilities = csv.abilities
    .filter((a) => a.is_main_series === '1')
    .map((a) => ({
      id: Number(a.id),
      slug: a.identifier,
      name: abilityNames.get(a.id)?.name ?? a.identifier,
      gen: Number(a.generation_id),
      short: clean(abilityProse.get(a.id)?.short_effect ?? ''),
      effect: clean(abilityProse.get(a.id)?.effect ?? ''),
    }))
    .sort((a, b) => a.id - b.id);

  await mkdir(OUT_DIR, { recursive: true });
  const source = `PokeAPI/pokeapi@${POKEAPI_COMMIT}`;
  await writeFile(join(OUT_DIR, 'moves.json'), JSON.stringify({ source, moves, learn }) + '\n');
  await writeFile(join(OUT_DIR, 'abilities.json'), JSON.stringify({ source, abilities }) + '\n');

  console.log(
    `Wrote ${moves.length} moves (${pairs.size.toLocaleString()} move/Pokémon pairs) and ${abilities.length} abilities to ${OUT_DIR}`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
