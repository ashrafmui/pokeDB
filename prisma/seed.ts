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

async function main() {
  console.log('Starting database seed...');
  console.log('Prisma client:', Object.keys(prisma));

  for (const [gen, config] of Object.entries(GENERATION_CONFIG)) {
    console.log(`Fetching Generation ${gen}...`);
    
    const response = await fetch(
      `https://pokeapi.co/api/v2/pokemon?offset=${config.offset}&limit=${config.limit}`
    );
    const data = await response.json();

    for (const pokemon of data.results) {
      const res = await fetch(pokemon.url);
      const pokeData = await res.json();

      // Upsert types first
      const typeRecords = [];
      for (const t of pokeData.types) {
        const typeRecord = await prisma.type.upsert({
          where: { name: t.type.name },
          update: {},
          create: { name: t.type.name },
        });
        typeRecords.push(typeRecord);
      }

      // Create Pokemon with stats
      await prisma.pokemon.upsert({
        where: { id: pokeData.id },
        update: {},
        create: {
          id: pokeData.id,
          name: pokeData.name,
          sprite: pokeData.sprites.versions['generation-vii']['ultra-sun-ultra-moon'].front_default || pokeData.sprites.front_default,
          generation: parseInt(gen),
          types: {
            connect: typeRecords.map((t) => ({ id: t.id })),
          },
          stats: {
            create: pokeData.stats.map((s: any) => ({
              name: s.stat.name,
              value: s.base_stat,
            })),
          },
        },
      });

      console.log(`  Added: ${pokeData.name}`);
    }
  }

  console.log('Seed completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });