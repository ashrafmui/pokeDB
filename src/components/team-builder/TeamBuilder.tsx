'use client';

// Team builder: pick up to six Pokémon and see how the team holds up on
// defence and offence, with suggestions to patch the gaps. The team lives in
// the URL (?team=6,130,…) so it can be shared, and in localStorage.

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { AlertTriangle, Check, ClipboardCopy, Download, Link2, Plus, Shuffle, Trash2, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PokemonPicker from '@/components/PokemonPicker';
import { cn } from '@/lib/utils';
import { spriteUrl } from '@/lib/sprites';
import { getTypeBadgeColors } from '@/lib/typeColors';
import {
  MAX_TEAM,
  STAT_LABELS,
  averageStats,
  decodeTeam,
  defenseTable,
  encodeTeam,
  fromShowdown,
  stabCoverage,
  suggestions,
  toShowdown,
  type TeamMon,
  type TypeChart,
} from '@/lib/team';

const STORAGE_KEY = 'teambuilder:team';

const title = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

function TypeBadge({ type, small = false }: { type: string; small?: boolean }) {
  const { bg, text } = getTypeBadgeColors(type);
  return (
    <span
      className={cn('inline-block rounded-full font-semibold', small ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-0.5 text-xs')}
      style={{ backgroundColor: bg, color: text }}
    >
      {title(type)}
    </span>
  );
}

function Sprite({ mon, size = 48 }: { mon: TeamMon; size?: number }) {
  return (
    <Image
      src={spriteUrl(mon.id)}
      alt={mon.name}
      title={mon.name}
      width={size}
      height={size}
      unoptimized
      style={{ imageRendering: 'pixelated' }}
    />
  );
}

function Section({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3 rounded-2xl border bg-white/80 p-4 shadow-sm backdrop-blur sm:p-6">
      <div>
        <h2 className="text-lg font-semibold">{title}</h2>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      {children}
    </section>
  );
}

// ── Slots ────────────────────────────────────────────────────────────────────

function Slot({ mon, onRemove }: { mon?: TeamMon; onRemove: () => void }) {
  if (!mon) {
    return (
      <div className="flex h-full min-h-36 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 text-gray-300 sm:min-h-40">
        <Plus className="h-6 w-6" />
      </div>
    );
  }
  return (
    <div className="relative flex h-full min-h-36 min-w-0 flex-col items-center justify-center gap-1 rounded-2xl border bg-white p-2 text-center shadow-sm sm:min-h-40">
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${mon.name}`}
        className="absolute right-1.5 top-1.5 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
      >
        <X className="h-4 w-4" />
      </button>
      <Sprite mon={mon} size={64} />
      <Link href={`/pokemon/${mon.id}`} className="block max-w-full truncate text-xs font-semibold hover:underline sm:text-sm">
        {mon.name}
      </Link>
      <div className="flex flex-wrap justify-center gap-1">
        {mon.types.map((t) => (
          <TypeBadge key={t} type={t} small />
        ))}
      </div>
      <span className="text-[11px] text-muted-foreground">BST {mon.total}</span>
    </div>
  );
}

// ── Defence ──────────────────────────────────────────────────────────────────

const MULT_LABEL: Record<string, string> = { '0': '0', '0.25': '¼', '0.5': '½', '1': '', '2': '2', '4': '4' };
const MULT_CLASS: Record<string, string> = {
  '0': 'bg-gray-800 text-white',
  '0.25': 'bg-emerald-400 text-emerald-950',
  '0.5': 'bg-emerald-200 text-emerald-900',
  '1': 'bg-gray-50',
  '2': 'bg-red-200 text-red-900',
  '4': 'bg-red-500 text-white',
};

function DefenseTable({ team, chart, types }: { team: TeamMon[]; chart: TypeChart; types: readonly string[] }) {
  const rows = useMemo(() => defenseTable(team, chart, types), [team, chart, types]);
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-separate border-spacing-1 text-center text-xs">
        <thead>
          <tr>
            <th className="w-16 text-left font-medium text-muted-foreground sm:w-24">Attack</th>
            {team.map((m) => (
              <th key={m.id} className="min-w-10">
                <div className="flex justify-center">
                  <Sprite mon={m} size={36} />
                </div>
              </th>
            ))}
            <th className="min-w-8 font-medium text-red-700 sm:min-w-12">Weak</th>
            <th className="min-w-8 font-medium text-emerald-700 sm:min-w-12">Resist</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.type}>
              <td className="text-left">
                <TypeBadge type={r.type} small />
              </td>
              {r.perMember.map((x, i) => (
                <td key={team[i].id} className={cn('h-7 rounded-md font-semibold', MULT_CLASS[String(x)])}>
                  {MULT_LABEL[String(x)]}
                </td>
              ))}
              <td className={cn('rounded-md font-semibold', r.danger ? 'bg-red-100 text-red-700' : 'text-muted-foreground')}>
                {r.weak || ''}
              </td>
              <td className={cn('rounded-md font-semibold', r.resist ? 'text-emerald-700' : 'text-muted-foreground')}>
                {r.resist || ''}
                {r.immune > 0 && <span className="ml-0.5 hidden text-[10px] text-gray-500 sm:inline">({r.immune} immune)</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Offence ──────────────────────────────────────────────────────────────────

function CoverageGrid({ team, chart, types }: { team: TeamMon[]; chart: TypeChart; types: readonly string[] }) {
  const rows = useMemo(() => stabCoverage(team, chart, types), [team, chart, types]);
  const byId = new Map(team.map((m) => [m.id, m]));
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {rows.map((r) => (
        <div
          key={r.type}
          className={cn(
            'flex items-center justify-between gap-1 rounded-lg border px-2 py-1',
            r.best > 1 ? 'border-emerald-200 bg-emerald-50' : 'border-red-200 bg-red-50'
          )}
        >
          <TypeBadge type={r.type} small />
          <div className="flex -space-x-2">
            {r.hitters.length ? (
              r.hitters.slice(0, 3).map((id) => <Sprite key={id} mon={byId.get(id)!} size={28} />)
            ) : (
              <span className="text-[11px] font-medium text-red-700">none</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Stats ────────────────────────────────────────────────────────────────────

function TeamStats({ team }: { team: TeamMon[] }) {
  const avg = averageStats(team);
  const fastest = [...team].sort((a, b) => b.stats[5] - a.stats[5])[0];
  const bulkiest = [...team].sort((a, b) => b.stats[0] + b.stats[2] + b.stats[4] - (a.stats[0] + a.stats[2] + a.stats[4]))[0];
  const physical = team.filter((m) => m.stats[1] > m.stats[3]).length;
  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        {STAT_LABELS.map((label, i) => (
          <div key={label} className="grid grid-cols-[36px_32px_1fr] items-center gap-2 text-xs">
            <span className="font-medium text-muted-foreground">{label}</span>
            <span className="text-right font-semibold">{avg[i]}</span>
            <div className="h-2 rounded-full bg-gray-100">
              <div className="h-2 rounded-full bg-blue-500" style={{ width: `${Math.min(100, (avg[i] / 160) * 100)}%` }} />
            </div>
          </div>
        ))}
      </div>
      <ul className="space-y-1 text-sm">
        <li>
          <span className="text-muted-foreground">Fastest:</span> {fastest.name} ({fastest.stats[5]})
        </li>
        <li>
          <span className="text-muted-foreground">Bulkiest:</span> {bulkiest.name}
        </li>
        <li>
          <span className="text-muted-foreground">Attackers:</span> {physical} physical, {team.length - physical} special
        </li>
      </ul>
    </div>
  );
}

// ── Main ─────────────────────────────────────────────────────────────────────

function initialTeam(byId: ReadonlyMap<number, TeamMon>): TeamMon[] {
  const fromUrl = new URLSearchParams(window.location.search).get('team');
  if (fromUrl) return decodeTeam(fromUrl, byId);
  try {
    return decodeTeam(localStorage.getItem(STORAGE_KEY), byId);
  } catch {
    return [];
  }
}

export default function TeamBuilder({ pool, chart, types }: { pool: TeamMon[]; chart: TypeChart; types: string[] }) {
  const byId = useMemo(() => new Map(pool.map((m) => [m.id, m])), [pool]);
  const [team, setTeam] = useState<TeamMon[]>(() => initialTeam(byId));
  const [copied, setCopied] = useState<'link' | 'showdown' | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  const [importText, setImportText] = useState('');
  const [importError, setImportError] = useState<string | null>(null);
  const [includeRestricted, setIncludeRestricted] = useState(false);

  // Keep the URL and storage in step with the team.
  useEffect(() => {
    // Built by hand so the commas stay readable instead of %2C.
    const query = team.length ? `?team=${encodeTeam(team)}` : '';
    window.history.replaceState(null, '', `${window.location.pathname}${query}`);
    try {
      localStorage.setItem(STORAGE_KEY, encodeTeam(team));
    } catch {
      // Storage can be unavailable (private mode); the URL still holds the team.
    }
  }, [team]);

  // One per species (Showdown's species clause), so a Mega and its base can't both join.
  const excluded = useMemo(() => {
    const species = new Set(team.map((m) => m.speciesId));
    return new Set(pool.filter((m) => species.has(m.speciesId)).map((m) => m.id));
  }, [team, pool]);

  const defense = useMemo(() => defenseTable(team, chart, types), [team, chart, types]);
  const dangers = defense.filter((r) => r.danger);
  const uncovered = useMemo(() => stabCoverage(team, chart, types).filter((r) => r.best <= 1), [team, chart, types]);
  const ideas = useMemo(
    () => suggestions(pool, team, chart, types, { includeRestricted }),
    [pool, team, chart, types, includeRestricted]
  );

  const full = team.length >= MAX_TEAM;
  const add = (m: TeamMon) => setTeam((t) => (t.length >= MAX_TEAM || excluded.has(m.id) ? t : [...t, m]));
  const remove = (id: number) => setTeam((t) => t.filter((m) => m.id !== id));

  async function copy(text: string, what: 'link' | 'showdown') {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(what);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      window.prompt('Copy this:', text);
    }
  }

  function randomTeam() {
    const candidates = pool.filter((m) => m.fullyEvolved && !m.mega && !m.restricted);
    const picked: TeamMon[] = [];
    const species = new Set<number>();
    while (picked.length < MAX_TEAM) {
      const m = candidates[Math.floor(Math.random() * candidates.length)];
      if (species.has(m.speciesId)) continue;
      species.add(m.speciesId);
      picked.push(m);
    }
    setTeam(picked);
  }

  function runImport() {
    const { team: imported, unknown } = fromShowdown(importText, pool);
    if (!imported.length) {
      setImportError('No Pokémon found. Paste a team exported from Pokémon Showdown.');
      return;
    }
    setTeam(imported);
    setImportError(unknown.length ? `Skipped: ${unknown.join(', ')}` : null);
    if (!unknown.length) setImportOpen(false);
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-2 sm:gap-3 lg:grid-cols-6">
        {Array.from({ length: MAX_TEAM }, (_, i) => (
          <Slot key={team[i]?.id ?? `empty-${i}`} mon={team[i]} onRemove={() => team[i] && remove(team[i].id)} />
        ))}
      </div>

      <PokemonPicker
        pool={pool}
        exclude={excluded}
        disabled={full}
        onPick={add}
        label="Add a Pokémon"
        placeholder={`Add a Pokémon (${team.length}/${MAX_TEAM})…`}
        disabledPlaceholder="Team is full. Remove one to swap."
      />

      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={() => copy(window.location.href, 'link')} disabled={!team.length}>
          {copied === 'link' ? <Check className="mr-1.5 h-4 w-4" /> : <Link2 className="mr-1.5 h-4 w-4" />}
          {copied === 'link' ? 'Link copied' : 'Copy share link'}
        </Button>
        <Button variant="outline" size="sm" onClick={() => copy(toShowdown(team), 'showdown')} disabled={!team.length}>
          {copied === 'showdown' ? <Check className="mr-1.5 h-4 w-4" /> : <Download className="mr-1.5 h-4 w-4" />}
          {copied === 'showdown' ? 'Copied' : 'Export to Showdown'}
        </Button>
        <Button variant="outline" size="sm" onClick={() => setImportOpen((o) => !o)}>
          <Upload className="mr-1.5 h-4 w-4" />
          Import
        </Button>
        <Button variant="outline" size="sm" onClick={randomTeam}>
          <Shuffle className="mr-1.5 h-4 w-4" />
          Random team
        </Button>
        <Button variant="ghost" size="sm" onClick={() => setTeam([])} disabled={!team.length}>
          <Trash2 className="mr-1.5 h-4 w-4" />
          Clear
        </Button>
      </div>

      {importOpen && (
        <div className="space-y-2 rounded-2xl border bg-white p-4">
          <label htmlFor="showdown-import" className="text-sm font-medium">
            Paste a Pokémon Showdown team
          </label>
          <textarea
            id="showdown-import"
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
            rows={6}
            placeholder={'Garchomp @ Choice Scarf\nAbility: Rough Skin\n...'}
            className="w-full rounded-lg border p-2 font-mono text-xs outline-none focus:border-blue-500"
          />
          {importError && <p className="text-sm text-red-600">{importError}</p>}
          <Button size="sm" onClick={runImport} disabled={!importText.trim()}>
            <ClipboardCopy className="mr-1.5 h-4 w-4" />
            Import team
          </Button>
        </div>
      )}

      {team.length === 0 ? (
        <p className="rounded-2xl border border-dashed p-6 text-center text-sm text-muted-foreground">
          Add a Pokémon to see your team&apos;s weaknesses, resistances and coverage, or try a random team.
        </p>
      ) : (
        <>
          {(dangers.length > 0 || uncovered.length > 0) && (
            <div className="space-y-2 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm">
              {dangers.length > 0 && (
                <p className="flex flex-wrap items-center gap-1.5">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  <span className="font-medium">Shared weaknesses:</span>
                  {dangers.map((r) => (
                    <span key={r.type} className="inline-flex items-center gap-1">
                      <TypeBadge type={r.type} small />
                      <span className="text-xs text-muted-foreground">
                        {r.weak} weak, {r.resist} resist
                      </span>
                    </span>
                  ))}
                </p>
              )}
              {uncovered.length > 0 && (
                <p className="flex flex-wrap items-center gap-1.5">
                  <span className="font-medium">No super-effective STAB against:</span>
                  {uncovered.map((r) => (
                    <TypeBadge key={r.type} type={r.type} small />
                  ))}
                </p>
              )}
            </div>
          )}

          <Section title="Defensive coverage" description="Damage each member takes from each attacking type.">
            <DefenseTable team={team} chart={chart} types={types} />
          </Section>

          <div className="grid gap-6 md:grid-cols-2">
            <Section
              title="Offensive coverage"
              description="Types your team hits super-effectively with moves of its own types (STAB)."
            >
              <CoverageGrid team={team} chart={chart} types={types} />
            </Section>
            <Section title="Team stats" description="Average base stats across the team.">
              <TeamStats team={team} />
            </Section>
          </div>

          {!full && (
            <Section title="Suggestions" description="Fully evolved Pokémon that resist your weak spots or hit what you can't.">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={includeRestricted} onChange={(e) => setIncludeRestricted(e.target.checked)} />
                Include legendary and mythical Pokémon
              </label>
              {ideas.length ? (
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {ideas.map(({ mon, resists, covers }) => (
                    <div key={mon.id} className="flex items-center gap-2 rounded-xl border bg-white p-2">
                      <Sprite mon={mon} size={48} />
                      <div className="min-w-0 flex-1 space-y-0.5">
                        <div className="flex items-center gap-1">
                          <span className="truncate text-sm font-semibold">{mon.name}</span>
                          {mon.types.map((t) => (
                            <TypeBadge key={t} type={t} small />
                          ))}
                        </div>
                        {resists.length > 0 && (
                          <p className="truncate text-[11px] text-emerald-700">Resists {resists.map(title).join(', ')}</p>
                        )}
                        {covers.length > 0 && (
                          <p className="truncate text-[11px] text-blue-700">Hits {covers.map(title).join(', ')}</p>
                        )}
                      </div>
                      <Button size="sm" variant="outline" onClick={() => add(mon)} aria-label={`Add ${mon.name}`}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No obvious gaps to fill. Nice team!</p>
              )}
            </Section>
          )}
        </>
      )}
    </div>
  );
}
