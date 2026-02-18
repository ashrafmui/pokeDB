import { NextRequest, NextResponse } from 'next/server';

// Cache the full Pokémon list in memory so we don't re-fetch on every search
let cachedList: { name: string; url: string }[] | null = null;

async function getFullList() {
  if (cachedList) return cachedList;

  const res = await fetch('https://pokeapi.co/api/v2/pokemon?limit=10000', {
    next: { revalidate: 86400 }, // Next.js cache: revalidate once per day
  });
  const data = await res.json();
  cachedList = data.results;
  return cachedList;
}

function getIdFromUrl(url: string): number {
  const parts = url.split('/').filter(Boolean);
  return parseInt(parts[parts.length - 1]);
}

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('q');

  if (!query || query.length < 1) {
    return NextResponse.json([]);
  }

  try {
    const q = query.toLowerCase();
    const isNumber = !isNaN(parseInt(q));
    const allPokemon = await getFullList();

    // Filter by name (partial match) or exact ID
    const matches = allPokemon!
      .filter(p => {
        if (isNumber) return getIdFromUrl(p.url) === parseInt(q);
        return p.name.includes(q);
      })
      .slice(0, 10);

    // Fetch details (sprite + types) for each match in parallel
    const detailed = await Promise.all(
      matches.map(async p => {
        const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${p.name}`, {
          next: { revalidate: 86400 },
        });
        const data = await res.json();

        return {
          id: data.id,
          name: data.name,
          sprite:
            data.sprites.versions?.['generation-v']?.['black-white']?.animated?.front_default ??
            data.sprites.front_default,
          types: data.types.map((t: { slot: number; type: { name: string } }) => ({
            id: t.slot,
            name: t.type.name,
          })),
        };
      })
    );

    // Sort by ID so results are in Pokédex order
    detailed.sort((a, b) => a.id - b.id);

    return NextResponse.json(detailed);
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}