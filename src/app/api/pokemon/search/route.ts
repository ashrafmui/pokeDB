import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q');

  if (!query || query.length < 1) {
    return NextResponse.json([]);
  }

  try {
    // Check if query is a number (searching by Pokemon ID)
    const isNumber = !isNaN(parseInt(query));

    const pokemon = await prisma.pokemon.findMany({
      where: {
        OR: [
          { name: { contains: query.toLowerCase() } },
          { types: { some: { name: { contains: query.toLowerCase() } } } },
          ...(isNumber ? [{ id: parseInt(query) }] : []),
        ],
      },
      include: {
        types: true,
      },
      orderBy: { id: 'asc' },
      take: 10, // Limit results for autocomplete
    });

    return NextResponse.json(pokemon);
  } catch (error) {
    console.error('Error searching Pokemon:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}