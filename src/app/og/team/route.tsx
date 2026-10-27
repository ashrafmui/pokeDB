import { ImageResponse } from 'next/og';
import { Artwork, Frame, OG_SIZE, TypePill } from '@/lib/ogCard';
import { BATTLE_TYPES, teamCandidates, toTeamMon, typeChart } from '@/lib/dex';
import { decodeTeam, defenseTable } from '@/lib/team';

// Share preview for /team-builder?team=…: the six Pokémon plus the team's
// biggest shared weakness.
export function GET(request: Request) {
  const byId = new Map(teamCandidates().map(toTeamMon).map((m) => [m.id, m]));
  const team = decodeTeam(new URL(request.url).searchParams.get('team'), byId);
  const rows = defenseTable(team, typeChart(), BATTLE_TYPES).sort((a, b) => b.weak - a.weak);
  const worst = rows[0];

  return new ImageResponse(
    (
      <Frame heading="My Pokémon team">
        <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14 }}>
          {team.map((m) => (
            <div key={m.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 170, gap: 6 }}>
              <Artwork id={m.id} size={150} />
              <div style={{ display: 'flex', fontSize: 24, fontWeight: 700, textAlign: 'center' }}>{m.name}</div>
              <div style={{ display: 'flex', gap: 6 }}>
                {m.types.map((t) => (
                  <TypePill key={t} type={t} />
                ))}
              </div>
            </div>
          ))}
        </div>
        {worst && worst.weak > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 28, color: '#374151' }}>
            Most shared weakness: <TypePill type={worst.type} /> ({worst.weak} of {team.length})
          </div>
        )}
      </Frame>
    ),
    { ...OG_SIZE, headers: { 'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800' } }
  );
}
