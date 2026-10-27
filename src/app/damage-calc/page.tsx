import type { Metadata } from 'next';
import BackgroundGradient from '@/components/BackgroundGradient';
import DamageCalc from '@/components/damage-calc/DamageCalcLoader';
import { teamCandidates, toTeamMon, typeChart } from '@/lib/dex';
import { ALL_MOVES } from '@/lib/moves';
import type { CalcMove } from '@/components/damage-calc/DamageCalc';

export const metadata: Metadata = {
  title: 'Pokémon Damage Calculator – Damage Range & KO Chances',
  description:
    'Calculate how much damage any Pokémon move does to any other Pokémon. Set level, EVs, nature, stat stages, items, weather and critical hits, see the damage range, percentage of HP and KO chances, and share the matchup as a link.',
  alternates: { canonical: '/damage-calc' },
};

export default function DamageCalcPage() {
  const mons = teamCandidates().map((p) => ({ id: p.id, name: p.name, types: p.types, base: toTeamMon(p).stats }));
  // Only damaging moves with a fixed base power; variable-power moves need extra inputs.
  const moves = ALL_MOVES.flatMap((m): CalcMove[] =>
    m.power && m.cls !== 'status' ? [{ id: m.id, slug: m.slug, name: m.name, type: m.type, cls: m.cls, power: m.power }] : []
  );

  return (
    <main className="relative min-h-screen px-4 py-10 sm:px-8">
      <BackgroundGradient />
      <div className="relative z-10 mx-auto max-w-5xl space-y-6">
        <div>
          <h1 className="font-pocket-monk text-4xl">Damage Calculator</h1>
          <p className="text-muted-foreground">
            Pick an attacker, a move and a defender to see the damage range and KO chances. Every matchup is a shareable link.
          </p>
        </div>
        <DamageCalc mons={mons} moves={moves} chart={typeChart()} />
      </div>
    </main>
  );
}
