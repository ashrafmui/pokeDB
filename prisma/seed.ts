const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const GENERATION_CONFIG = {
  1: { offset: 0, limit: 151 },
  2: { offset: 151, limit: 100 },
  3: { offset: 251, limit: 135 },
  4: { offset: 386, limit: 107 },
  5: { offset: 493, limit: 156 },
  6: { offset: 649, limit: 72 },
  7: { offset: 721, limit: 88 },
};

// Helper to get English text
function getEnglishText(entries: any[], key: string = 'flavor_text'): string | null {
  if (!entries || !Array.isArray(entries)) return null;
  const entry = entries.find((e: any) => e.language?.name === 'en');
  if (!entry) return null;
  const text = entry[key];
  return text ? text.replace(/\f|\n|\r/g, ' ').replace(/\s+/g, ' ').trim() : null;
}

// Helper to delay requests to avoid rate limiting
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Cache for moves and abilities to avoid redundant fetches
const moveCache = new Map<string, any>();
const abilityCache = new Map<string, any>();
const typeCache = new Map<string, any>();

async function fetchWithRetry(url: string, retries = 3): Promise<any> {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      if (i === retries - 1) throw error;
      await delay(1000 * (i + 1));
    }
  }
}

async function seedTypes() {
  console.log('Seeding types...');
  const response = await fetchWithRetry('https://pokeapi.co/api/v2/type?limit=50');
  
  for (const type of response.results) {
    const typeData = await fetchWithRetry(type.url);
    typeCache.set(typeData.name, typeData);
    
    await prisma.type.upsert({
      where: { name: typeData.name },
      update: {
        doubleDamageFrom: typeData.damage_relations.double_damage_from.map((t: any) => t.name),
        doubleDamageTo: typeData.damage_relations.double_damage_to.map((t: any) => t.name),
        halfDamageFrom: typeData.damage_relations.half_damage_from.map((t: any) => t.name),
        halfDamageTo: typeData.damage_relations.half_damage_to.map((t: any) => t.name),
        noDamageFrom: typeData.damage_relations.no_damage_from.map((t: any) => t.name),
        noDamageTo: typeData.damage_relations.no_damage_to.map((t: any) => t.name),
      },
      create: {
        name: typeData.name,
        doubleDamageFrom: typeData.damage_relations.double_damage_from.map((t: any) => t.name),
        doubleDamageTo: typeData.damage_relations.double_damage_to.map((t: any) => t.name),
        halfDamageFrom: typeData.damage_relations.half_damage_from.map((t: any) => t.name),
        halfDamageTo: typeData.damage_relations.half_damage_to.map((t: any) => t.name),
        noDamageFrom: typeData.damage_relations.no_damage_from.map((t: any) => t.name),
        noDamageTo: typeData.damage_relations.no_damage_to.map((t: any) => t.name),
      },
    });
    console.log(`  Type: ${typeData.name}`);
  }
}

async function seedMove(moveUrl: string): Promise<number> {
  const moveName = moveUrl.split('/').filter(Boolean).pop()!;
  
  // Check if already in database
  const existing = await prisma.move.findUnique({ where: { name: moveName } });
  if (existing) return existing.id;
  
  // Check cache
  let moveData = moveCache.get(moveName);
  if (!moveData) {
    moveData = await fetchWithRetry(moveUrl);
    moveCache.set(moveName, moveData);
  }
  
  // Get type
  let typeId = null;
  if (moveData.type) {
    const type = await prisma.type.findUnique({ where: { name: moveData.type.name } });
    typeId = type?.id;
  }
  
  const move = await prisma.move.create({
    data: {
      name: moveData.name,
      typeId: typeId,
      power: moveData.power,
      accuracy: moveData.accuracy,
      pp: moveData.pp,
      priority: moveData.priority || 0,
      damageClass: moveData.damage_class?.name,
      effect: getEnglishText(moveData.effect_entries, 'effect'),
      shortEffect: getEnglishText(moveData.effect_entries, 'short_effect'),
      target: moveData.target?.name,
    },
  });
  
  return move.id;
}

async function seedAbility(abilityUrl: string): Promise<number> {
  const abilityName = abilityUrl.split('/').filter(Boolean).pop()!;
  
  // Check if already in database
  const existing = await prisma.ability.findUnique({ where: { name: abilityName } });
  if (existing) return existing.id;
  
  // Check cache
  let abilityData = abilityCache.get(abilityName);
  if (!abilityData) {
    abilityData = await fetchWithRetry(abilityUrl);
    abilityCache.set(abilityName, abilityData);
  }
  
  const ability = await prisma.ability.create({
    data: {
      name: abilityData.name,
      effect: getEnglishText(abilityData.effect_entries, 'effect'),
      shortEffect: getEnglishText(abilityData.effect_entries, 'short_effect'),
    },
  });
  
  return ability.id;
}

async function seedEvolutionChain(chainUrl: string): Promise<void> {
  const chainId = parseInt(chainUrl.split('/').filter(Boolean).pop()!);
  
  // Check if already exists
  const existing = await prisma.evolutionChain.findUnique({ where: { id: chainId } });
  if (existing) return;
  
  const chainData = await fetchWithRetry(chainUrl);
  
  await prisma.evolutionChain.create({
    data: {
      id: chainId,
      chain: chainData.chain,
    },
  });
}

async function seedPokemon() {
  for (const [gen, config] of Object.entries(GENERATION_CONFIG)) {
    console.log(`\n=== Fetching Generation ${gen} ===`);

    const response = await fetchWithRetry(
      `https://pokeapi.co/api/v2/pokemon?offset=${config.offset}&limit=${config.limit}`
    );

    for (const pokemon of response.results) {
      try {
        console.log(`\nProcessing: ${pokemon.name}`);
        
        // Fetch Pokemon data
        const pokeData = await fetchWithRetry(pokemon.url);
        
        // Fetch species data
        const speciesData = await fetchWithRetry(pokeData.species.url);
        
        // Get types
        const typeRecords = [];
        for (const t of pokeData.types) {
          let typeRecord = await prisma.type.findUnique({ where: { name: t.type.name } });
          if (typeRecord) typeRecords.push(typeRecord);
        }
        
        // Get egg groups
        const eggGroupRecords = [];
        for (const eg of speciesData.egg_groups) {
          const eggGroupRecord = await prisma.eggGroup.upsert({
            where: { name: eg.name },
            update: {},
            create: { name: eg.name },
          });
          eggGroupRecords.push(eggGroupRecord);
        }
        
        // Get evolution chain
        let evolutionChainId = null;
        if (speciesData.evolution_chain?.url) {
          evolutionChainId = parseInt(speciesData.evolution_chain.url.split('/').filter(Boolean).pop()!);
          await seedEvolutionChain(speciesData.evolution_chain.url);
        }
        
        // Get evolves from
        let evolvesFromId = null;
        if (speciesData.evolves_from_species) {
          const evolvesFromUrl = speciesData.evolves_from_species.url;
          evolvesFromId = parseInt(evolvesFromUrl.split('/').filter(Boolean).pop()!);
        }
        
        // Gender rate
        const genderRateFemale = speciesData.gender_rate === -1 
          ? -1 
          : (speciesData.gender_rate / 8) * 100;
        
        // Pokedex entries (up to 10)
        const englishEntries = speciesData.flavor_text_entries
          .filter((entry: any) => entry.language.name === 'en')
          .slice(0, 10);
        
        // Create Pokemon
        await prisma.pokemon.create({
          data: {
            id: pokeData.id,
            name: pokeData.name,
            sprite: pokeData.sprites.versions?.['generation-vii']?.['ultra-sun-ultra-moon']?.front_default 
            || pokeData.sprites.front_default || '',
            spriteShiny: pokeData.sprites.versions?.['generation-vii']?.['ultra-sun-ultra-moon']?.front_shiny 
            || pokeData.sprites.front_shiny,
            spriteBack: pokeData.sprites.back_default,
            spriteBackShiny: pokeData.sprites.back_shiny,
            spriteArtwork: pokeData.sprites.other?.['official-artwork']?.front_default,
            spriteArtworkShiny: pokeData.sprites.other?.['official-artwork']?.front_shiny,    // Add this
            spriteHome: pokeData.sprites.other?.home?.front_default,
            spriteHomeShiny: pokeData.sprites.other?.home?.front_shiny,                        // Add this
            generation: parseInt(gen),
            height: pokeData.height,
            weight: pokeData.weight,
            baseExperience: pokeData.base_experience,
            captureRate: speciesData.capture_rate,
            baseHappiness: speciesData.base_happiness,
            genderRateFemale: genderRateFemale,
            growthRate: speciesData.growth_rate?.name,
            habitat: speciesData.habitat?.name,
            genus: getEnglishText(speciesData.genera, 'genus'),
            color: speciesData.color?.name,
            shape: speciesData.shape?.name,
            isBaby: speciesData.is_baby || false,
            isLegendary: speciesData.is_legendary || false,
            isMythical: speciesData.is_mythical || false,
            hatchCounter: speciesData.hatch_counter,
            evolvesFromId: evolvesFromId,
            evolutionChainId: evolutionChainId,
            types: {
              connect: typeRecords.map((t) => ({ id: t.id })),
            },
            eggGroups: {
              connect: eggGroupRecords.map((eg) => ({ id: eg.id })),
            },
            stats: {
              create: pokeData.stats.map((s: any) => ({
                name: s.stat.name,
                value: s.base_stat,
                effort: s.effort,
              })),
            },
            pokedexEntries: {
              create: englishEntries.map((entry: any) => ({
                version: entry.version.name,
                description: entry.flavor_text.replace(/\f|\n|\r/g, ' ').replace(/\s+/g, ' ').trim(),
              })),
            },
          },
        });
        
        // Seed abilities
        console.log(`  Abilities...`);
        for (const a of pokeData.abilities) {
          const abilityId = await seedAbility(a.ability.url);
          await prisma.pokemonAbility.create({
            data: {
              pokemonId: pokeData.id,
              abilityId: abilityId,
              isHidden: a.is_hidden,
              slot: a.slot,
            },
          });
        }
        
        // Seed moves (limit to latest version group to reduce data)
        console.log(`  Moves...`);
        const movesToSeed = pokeData.moves.slice(0, 50); // Limit moves per Pokemon
        for (const m of movesToSeed) {
          try {
            const moveId = await seedMove(m.move.url);
            const versionDetails = m.version_group_details[m.version_group_details.length - 1];
            
            if (versionDetails) {
              await prisma.pokemonMove.upsert({
                where: {
                  pokemonId_moveId_learnMethod_versionGroup: {
                    pokemonId: pokeData.id,
                    moveId: moveId,
                    learnMethod: versionDetails.move_learn_method.name,
                    versionGroup: versionDetails.version_group.name,
                  },
                },
                update: {},
                create: {
                  pokemonId: pokeData.id,
                  moveId: moveId,
                  learnMethod: versionDetails.move_learn_method.name,
                  levelLearned: versionDetails.level_learned_at || null,
                  versionGroup: versionDetails.version_group.name,
                },
              });
            }
          } catch (moveError) {
            // Skip problematic moves
          }
        }
        
        // Seed encounters
        console.log(`  Encounters...`);
        try {
          const encountersData = await fetchWithRetry(`https://pokeapi.co/api/v2/pokemon/${pokeData.id}/encounters`);
          const encountersToSeed = encountersData.slice(0, 20); // Limit encounters
          
          for (const enc of encountersToSeed) {
            for (const version of enc.version_details.slice(0, 3)) {
              for (const detail of version.encounter_details.slice(0, 2)) {
                await prisma.encounter.create({
                  data: {
                    pokemonId: pokeData.id,
                    locationName: enc.location_area.name,
                    versionName: version.version.name,
                    method: detail.method.name,
                    minLevel: detail.min_level,
                    maxLevel: detail.max_level,
                    chance: detail.chance,
                  },
                });
              }
            }
          }
        } catch (encError) {
          // Some Pokemon have no encounters
        }
        
        console.log(`  ✓ ${pokeData.name} complete`);
        
        // Small delay to be nice to the API
        await delay(100);
        
      } catch (error) {
        console.error(`  ✗ Error with ${pokemon.name}:`, error);
      }
    }
  }
}

async function main() {
  console.log('=================================');
  console.log('Starting FULL database seed...');
  console.log('This will take 1-2 hours.');
  console.log('=================================\n');

  // Clear existing data
  console.log('Clearing existing data...');
  await prisma.encounter.deleteMany();
  await prisma.pokemonMove.deleteMany();
  await prisma.pokemonAbility.deleteMany();
  await prisma.pokedexEntry.deleteMany();
  await prisma.stat.deleteMany();
  await prisma.pokemon.deleteMany();
  await prisma.move.deleteMany();
  await prisma.ability.deleteMany();
  await prisma.evolutionChain.deleteMany();
  await prisma.eggGroup.deleteMany();
  await prisma.type.deleteMany();
  console.log('Done clearing.\n');

  // Seed types first (needed for moves)
  await seedTypes();
  
  // Seed Pokemon (this does everything else)
  await seedPokemon();

  console.log('\n=================================');
  console.log('Seed completed!');
  console.log('=================================');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });