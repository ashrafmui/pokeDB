#!/usr/bin/env node
// Builds src/data/dex.json: one entry per Pokémon (every species plus every
// alternate form) with types, stats, abilities, species data and a
// precomputed type matchup chart.
//
// Source: the CSV files PokéAPI itself is built from, pinned to a commit so
// the output is reproducible (see scripts/lib/pokeapi-csv.mjs).
//
//   npm run build:dex

import { writeFile, mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { POKEAPI_COMMIT, ENGLISH, loadCsv, groupBy, indexBy, int } from './lib/pokeapi-csv.mjs';

const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'data', 'dex.json');

// ── Build ────────────────────────────────────────────────────────────────────

const STAT_KEYS = {
  'hp': 'hp',
  'attack': 'attack',
  'defense': 'defense',
  'special-attack': 'specialAttack',
  'special-defense': 'specialDefense',
  'speed': 'speed',
};

const REGIONAL = ['alola', 'galar', 'hisui', 'paldea'];

async function main() {
  const names = [
    'pokemon', 'pokemon_species', 'pokemon_species_names', 'pokemon_stats', 'stats',
    'pokemon_types', 'types', 'pokemon_abilities', 'abilities', 'ability_names',
    'pokemon_forms', 'pokemon_form_names', 'pokemon_egg_groups', 'egg_groups',
    'pokemon_colors', 'pokemon_shapes', 'pokemon_habitats', 'growth_rates', 'type_efficacy',
    'pokemon_moves',
  ];
  const csv = Object.fromEntries(
    await Promise.all(names.map(async (n) => [n, await loadCsv(n)]))
  );

  const types = indexBy(csv.types, 'id');
  const stats = indexBy(csv.stats, 'id');
  const species = indexBy(csv.pokemon_species, 'id');
  const speciesNames = indexBy(csv.pokemon_species_names.filter((r) => r.local_language_id === ENGLISH), 'pokemon_species_id');
  const abilities = indexBy(csv.abilities, 'id');
  const abilityNames = indexBy(csv.ability_names.filter((r) => r.local_language_id === ENGLISH), 'ability_id');
  const formNames = indexBy(csv.pokemon_form_names.filter((r) => r.local_language_id === ENGLISH), 'pokemon_form_id');
  const eggGroups = indexBy(csv.egg_groups, 'id');
  const colors = indexBy(csv.pokemon_colors, 'id');
  const shapes = indexBy(csv.pokemon_shapes, 'id');
  const habitats = indexBy(csv.pokemon_habitats, 'id');
  const growthRates = indexBy(csv.growth_rates, 'id');

  const statsByPokemon = groupBy(csv.pokemon_stats, 'pokemon_id');
  const typesByPokemon = groupBy(csv.pokemon_types, 'pokemon_id');
  const abilitiesByPokemon = groupBy(csv.pokemon_abilities, 'pokemon_id');
  const formsByPokemon = groupBy(csv.pokemon_forms, 'pokemon_id');
  const eggGroupsBySpecies = groupBy(csv.pokemon_egg_groups, 'species_id');

  // The 18 battle types, in National Dex order.
  const battleTypes = csv.types.filter((t) => Number(t.id) <= 18).map((t) => t.identifier);
  const efficacy = new Map(); // "attacker>defender" → multiplier
  for (const r of csv.type_efficacy) {
    efficacy.set(`${types.get(r.damage_type_id).identifier}>${types.get(r.target_type_id).identifier}`, Number(r.damage_factor) / 100);
  }
  // Damage multiplier each attacking type deals to this type combo. Neutral
  // (1×) matchups are left out to keep the file small; read missing as 1.
  const defenseChart = (defTypes) =>
    Object.fromEntries(
      battleTypes
        .map((atk) => [atk, defTypes.reduce((m, def) => m * (efficacy.get(`${atk}>${def}`) ?? 1), 1)])
        .filter(([, m]) => m !== 1)
    );

  // Distinct moves each Pokémon can learn in any game, by learn method.
  const MOVE_METHODS = { '1': 'levelUp', '2': 'egg', '3': 'tutor', '4': 'machine' };
  const movesByPokemon = new Map();
  for (const r of csv.pokemon_moves) {
    if (!movesByPokemon.has(r.pokemon_id)) {
      movesByPokemon.set(r.pokemon_id, { all: new Set(), levelUp: new Set(), egg: new Set(), tutor: new Set(), machine: new Set() });
    }
    const sets = movesByPokemon.get(r.pokemon_id);
    sets.all.add(r.move_id);
    const method = MOVE_METHODS[r.pokemon_move_method_id];
    if (method) sets[method].add(r.move_id);
  }
  // Battle-only forms (Gigantamax, some Megas) have no learnset of their own;
  // they use the default form's.
  const defaultPokemonOfSpecies = new Map(csv.pokemon.filter((p) => p.is_default === '1').map((p) => [p.species_id, p.id]));
  const moveCounts = (id, speciesId) => {
    const sets = movesByPokemon.get(id) ?? movesByPokemon.get(defaultPokemonOfSpecies.get(speciesId));
    if (!sets) return { total: 0, levelUp: 0, egg: 0, tutor: 0, machine: 0 };
    return { total: sets.all.size, levelUp: sets.levelUp.size, egg: sets.egg.size, tutor: sets.tutor.size, machine: sets.machine.size };
  };

  // Evolution stage = 1 + number of ancestors; fully evolved = nothing evolves from it.
  const evolvesFrom = new Map(csv.pokemon_species.map((s) => [s.id, s.evolves_from_species_id]));
  const hasChildren = new Set(csv.pokemon_species.map((s) => s.evolves_from_species_id).filter(Boolean));
  const stageOf = (id) => {
    let stage = 1;
    for (let cur = evolvesFrom.get(id); cur; cur = evolvesFrom.get(cur)) stage++;
    return stage;
  };

  const entries = csv.pokemon.map((p) => {
    const sp = species.get(p.species_id);
    const spName = speciesNames.get(p.species_id);
    const forms = formsByPokemon.get(p.id) ?? [];
    const form = forms.find((f) => f.is_default === '1') ?? forms[0];
    const formName = form ? formNames.get(form.id) : undefined;
    const formIdentifier = form?.form_identifier || null;

    const statMap = {};
    const evYield = {};
    for (const s of statsByPokemon.get(p.id) ?? []) {
      const key = STAT_KEYS[stats.get(s.stat_id).identifier];
      if (!key) continue;
      statMap[key] = Number(s.base_stat);
      if (Number(s.effort) > 0) evYield[key] = Number(s.effort);
    }
    const total = Object.values(statMap).reduce((a, b) => a + b, 0);

    const typeList = (typesByPokemon.get(p.id) ?? [])
      .sort((a, b) => a.slot - b.slot)
      .map((t) => types.get(t.type_id).identifier);

    const abilityList = (abilitiesByPokemon.get(p.id) ?? [])
      .sort((a, b) => a.slot - b.slot)
      .map((a) => ({
        slug: abilities.get(a.ability_id).identifier,
        name: abilityNames.get(a.ability_id)?.name ?? abilities.get(a.ability_id).identifier,
        hidden: a.is_hidden === '1',
      }));

    const heightM = Number(p.height) / 10;
    const weightKg = Number(p.weight) / 10;
    const genderRate = Number(sp.gender_rate);

    return {
      id: Number(p.id),
      slug: p.identifier,
      name: formName?.pokemon_name || spName?.name || p.identifier,
      formName: p.is_default === '1' ? null : formName?.form_name || formIdentifier,
      isDefault: p.is_default === '1',
      speciesId: Number(p.species_id),
      speciesName: spName?.name ?? sp.identifier,
      generation: Number(sp.generation_id),
      types: typeList,
      stats: statMap,
      total,
      evYield,
      abilities: abilityList,
      heightM,
      weightKg,
      bmi: heightM > 0 ? Math.round((weightKg / heightM ** 2) * 10) / 10 : null,
      baseExperience: int(p.base_experience),
      genus: spName?.genus || null,
      color: colors.get(sp.color_id)?.identifier ?? null,
      shape: shapes.get(sp.shape_id)?.identifier ?? null,
      habitat: habitats.get(sp.habitat_id)?.identifier ?? null,
      captureRate: Number(sp.capture_rate),
      baseHappiness: int(sp.base_happiness),
      genderless: genderRate === -1,
      femaleRatio: genderRate === -1 ? null : genderRate / 8,
      hasGenderDifferences: sp.has_gender_differences === '1',
      eggGroups: (eggGroupsBySpecies.get(p.species_id) ?? []).map((e) => eggGroups.get(e.egg_group_id).identifier),
      hatchCycles: int(sp.hatch_counter),
      growthRate: growthRates.get(sp.growth_rate_id)?.identifier ?? null,
      isBaby: sp.is_baby === '1',
      isLegendary: sp.is_legendary === '1',
      isMythical: sp.is_mythical === '1',
      isMega: form?.is_mega === '1',
      isGigantamax: formIdentifier === 'gmax',
      isBattleOnly: form?.is_battle_only === '1',
      regionalForm: REGIONAL.find((r) => formIdentifier === r || formIdentifier?.startsWith(`${r}-`)) ?? null,
      evolutionChainId: int(sp.evolution_chain_id),
      evolvesFromSpeciesId: int(sp.evolves_from_species_id),
      evolutionStage: stageOf(p.species_id),
      isFullyEvolved: !hasChildren.has(p.species_id),
      moveCounts: moveCounts(p.id, p.species_id),
      defense: defenseChart(typeList),
    };
  });

  entries.sort((a, b) => a.id - b.id);
  const out = { source: `PokeAPI/pokeapi@${POKEAPI_COMMIT}`, types: battleTypes, pokemon: entries };
  await mkdir(dirname(OUT), { recursive: true });
  await writeFile(OUT, JSON.stringify(out) + '\n');

  const defaults = entries.filter((e) => e.isDefault).length;
  console.log(`Wrote ${entries.length} Pokémon (${defaults} species, ${entries.length - defaults} alternate forms) to ${OUT}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
