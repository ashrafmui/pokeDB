import { NextRequest, NextResponse } from 'next/server';

// Server-side proxy for pokemontcg.io. The public API is slow and fails
// intermittently (timeouts, 429s, 5xx), so instead of calling it from the
// browser we call it here with a timeout and retries, and let Next's data
// cache keep successful responses for a day.

const TCG_API = 'https://api.pokemontcg.io/v2/cards';
const REVALIDATE_DAY = 86400;
const TIMEOUT_MS = 10000;
const MAX_ATTEMPTS = 3;
const RETRYABLE_STATUS = new Set([408, 429, 500, 502, 503, 504]);

// Only the fields TradingCards renders, which cuts the payload a lot.
const SELECT_FIELDS = 'id,name,rarity,set,images';

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchCards(name: string) {
  const params = new URLSearchParams({
    q: `name:"${name}"`,
    orderBy: '-set.releaseDate',
    pageSize: '60',
    select: SELECT_FIELDS,
  });
  const headers: HeadersInit = {};
  // Optional: a free key from dev.pokemontcg.io raises the rate limit.
  if (process.env.POKEMONTCG_API_KEY) headers['X-Api-Key'] = process.env.POKEMONTCG_API_KEY;

  let lastError = 'Unknown error';
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const res = await fetch(`${TCG_API}?${params}`, {
        headers,
        signal: AbortSignal.timeout(TIMEOUT_MS),
        next: { revalidate: REVALIDATE_DAY },
      });
      if (res.ok) return await res.json();
      lastError = `TCG API responded ${res.status}`;
      if (!RETRYABLE_STATUS.has(res.status)) break;
    } catch (err) {
      lastError = err instanceof Error && err.name === 'TimeoutError'
        ? 'TCG API timed out'
        : 'Could not reach TCG API';
    }
    // Back off 0.5s, then 1s, before the next attempt.
    if (attempt < MAX_ATTEMPTS) await sleep(500 * 2 ** (attempt - 1));
  }
  throw new Error(lastError);
}

export async function GET(request: NextRequest) {
  const name = request.nextUrl.searchParams.get('name')?.trim();

  // Pokémon names are short and never contain quotes; reject anything that
  // could break out of the Lucene query.
  if (!name || name.length > 40 || /["\\]/.test(name)) {
    return NextResponse.json({ error: 'Invalid name' }, { status: 400 });
  }

  try {
    const json = await fetchCards(name);
    return NextResponse.json(
      { data: json.data ?? [] },
      { headers: { 'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800' } }
    );
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to load trading cards' },
      { status: 502 }
    );
  }
}
