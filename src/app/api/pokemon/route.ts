import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const generation = searchParams.get('generation');

  try {
    const pokemon = await prisma.pokemon.findMany({
      where: generation ? { generation: parseInt(generation) } : undefined,
      include: {
        types: true,
        stats: true,
      },
      orderBy: { id: 'asc' },
    });

    return NextResponse.json(pokemon);
  } catch (error) {
    console.error('Error fetching Pokemon:', error);
    return NextResponse.json({ error: 'Failed to fetch Pokemon' }, { status: 500 });
  }
}