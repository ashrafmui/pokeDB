import { ImageResponse } from 'next/og';
import { Artwork, Frame, OG_SIZE, TypePill } from '@/lib/ogCard';
import { getDexEntry } from '@/lib/dex';
import { parseIds } from '@/lib/compare';

const STAT_LABELS = ['HP', 'Atk', 'Def', 'SpA', 'SpD', 'Spe'] as const;
const STAT_KEYS = ['hp', 'attack', 'defense', 'specialAttack', 'specialDefense', 'speed'] as const;

// Share preview for /compare?ids=…: each Pokémon with its base stats.
export function GET(request: Request) {
  const entries = parseIds(new URL(request.url).searchParams.get('ids'))
    .map((id) => getDexEntry(id))
    .filter((e): e is NonNullable<typeof e> => Boolean(e));
  const heading = entries.map((e) => e.name).join(' vs ') || 'Compare Pokémon';
  const best = Math.max(0, ...entries.map((e) => e.total));

  return new ImageResponse(
    (
      <Frame heading={heading.length > 34 ? 'Pokémon comparison' : heading}>
        <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 }}>
          {entries.map((e) => (
            <div
              key={e.id}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 255, gap: 4, padding: '12px 8px', background: 'rgba(255,255,255,0.8)', borderRadius: 24, border: e.total === best ? '4px solid #2563eb' : '4px solid #e5e7eb' }}
            >
              <Artwork id={e.id} size={130} />
              <div style={{ display: 'flex', fontSize: 26, fontWeight: 700, textAlign: 'center' }}>{e.name}</div>
              <div style={{ display: 'flex', gap: 6 }}>
                {e.types.map((t) => (
                  <TypePill key={t} type={t} />
                ))}
              </div>
              <div style={{ display: 'flex', fontSize: 19, color: '#4b5563', marginTop: 6 }}>
                {STAT_LABELS.map((label, i) => `${label} ${e.stats[STAT_KEYS[i]]}`).slice(0, 3).join('  ')}
              </div>
              <div style={{ display: 'flex', fontSize: 19, color: '#4b5563' }}>
                {STAT_LABELS.map((label, i) => `${label} ${e.stats[STAT_KEYS[i]]}`).slice(3).join('  ')}
              </div>
              <div style={{ display: 'flex', fontSize: 30, fontWeight: 800, marginTop: 4 }}>Total {e.total}</div>
            </div>
          ))}
        </div>
      </Frame>
    ),
    { ...OG_SIZE, headers: { 'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800' } }
  );
}
