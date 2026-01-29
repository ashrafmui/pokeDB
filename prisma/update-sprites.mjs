import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchWithRetry(url, retries = 3) {
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

async function updateSprites() {
  console.log('Fetching all Pokemon from database...');
  const allPokemon = await prisma.pokemon.findMany({
    select: { id: true, name: true },
    orderBy: { id: 'asc' },
  });

  console.log(`Found ${allPokemon.length} Pokemon. Updating sprites...\n`);

  for (const pokemon of allPokemon) {
    try {
      console.log(`Updating ${pokemon.name} (#${pokemon.id})...`);
      
      const pokeData = await fetchWithRetry(`https://pokeapi.co/api/v2/pokemon/${pokemon.id}`);
      
      await prisma.pokemon.update({
        where: { id: pokemon.id },
        data: {
          spriteArtworkShiny: pokeData.sprites.other?.['official-artwork']?.front_shiny || null,
          spriteHomeShiny: pokeData.sprites.other?.home?.front_shiny || null,
        },
      });
      
      console.log(`  ✓ ${pokemon.name} updated`);
      await delay(100);
      
    } catch (error) {
      console.error(`  ✗ Error updating ${pokemon.name}:`, error);
    }
  }

  console.log('\n=================================');
  console.log('Sprite update completed!');
  console.log('=================================');
}

updateSprites()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });