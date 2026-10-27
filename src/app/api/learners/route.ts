import { NextRequest, NextResponse } from 'next/server';
import { getMove, learnerIds } from '@/lib/moves';

/**
 * Who learns a move, for the Explore "learns this move" filter:
 * GET /api/learners?move=earthquake → { ids: [[pokemonId, newestGenLearnable], …] }
 */
export function GET(request: NextRequest) {
  const move = getMove(request.nextUrl.searchParams.get('move') ?? '');
  if (!move) return NextResponse.json({ error: 'Unknown move' }, { status: 404 });
  return NextResponse.json(
    { ids: learnerIds(move.id) },
    // The data only changes with a deploy, so let the CDN keep it.
    { headers: { 'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800' } }
  );
}
