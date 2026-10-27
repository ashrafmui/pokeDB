'use client';

// Pokédex tracker: tick off the Pokémon you've caught. Everything is stored in
// this browser's localStorage, with export and import to move it between
// devices.

import { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { Check, Download, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { spriteUrl } from '@/lib/sprites';
import { TRACKER_KEY, decodeCaught, encodeCaught, exportCaught, importCaught } from '@/lib/tracker';

export interface TrackerMon {
  id: number;
  name: string;
  generation: number;
}

type Status = 'all' | 'caught' | 'missing';

const STATUS_LABELS: [Status, string][] = [
  ['all', 'All'],
  ['caught', 'Caught'],
  ['missing', 'Missing'],
];

const pct = (n: number, total: number) => (total ? Math.round((n / total) * 100) : 0);

function Bar({ value, className }: { value: number; className?: string }) {
  return (
    <div className={cn('h-2 overflow-hidden rounded-full bg-gray-200', className)}>
      <div className="h-full rounded-full bg-green-500 transition-[width]" style={{ width: `${value}%` }} />
    </div>
  );
}

export default function Tracker({ mons, regions }: { mons: TrackerMon[]; regions: string[] }) {
  const maxId = mons.length;
  const [caught, setCaught] = useState<Set<number>>(() => {
    try {
      return decodeCaught(localStorage.getItem(TRACKER_KEY), maxId);
    } catch {
      return new Set();
    }
  });
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<Status>('all');
  const [gen, setGen] = useState(0); // 0 = every generation
  const [message, setMessage] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      localStorage.setItem(TRACKER_KEY, encodeCaught(caught));
    } catch {
      // Storage unavailable (private window); the tracker still works for this visit.
    }
  }, [caught]);

  const perGen = useMemo(() => {
    const rows = regions.map(() => ({ total: 0, caught: 0 }));
    for (const m of mons) {
      const row = rows[m.generation - 1];
      row.total++;
      if (caught.has(m.id)) row.caught++;
    }
    return rows;
  }, [mons, regions, caught]);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return mons.filter((m) => {
      if (gen && m.generation !== gen) return false;
      if (status === 'caught' && !caught.has(m.id)) return false;
      if (status === 'missing' && caught.has(m.id)) return false;
      return !q || m.name.toLowerCase().includes(q) || String(m.id) === q;
    });
  }, [mons, query, status, gen, caught]);

  function toggle(id: number) {
    setCaught((prev) => {
      const next = new Set(prev);
      if (!next.delete(id)) next.add(id);
      return next;
    });
  }

  function markShown(value: boolean) {
    setCaught((prev) => {
      const next = new Set(prev);
      for (const m of shown) {
        if (value) next.add(m.id);
        else next.delete(m.id);
      }
      return next;
    });
  }

  function download() {
    const url = URL.createObjectURL(new Blob([exportCaught(caught)], { type: 'application/json' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'pokedb-caught.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  async function upload(file: File | undefined) {
    if (!file) return;
    const imported = importCaught(await file.text(), maxId);
    if (!imported) {
      setMessage('That file is not a poKeDB tracker export.');
    } else {
      setCaught(imported);
      setMessage(`Imported ${imported.size} caught Pokémon.`);
    }
    if (fileRef.current) fileRef.current.value = '';
  }

  const total = mons.length;
  const overall = pct(caught.size, total);
  const filtered = gen !== 0 || status !== 'all' || query.trim() !== '';

  return (
    <div className="space-y-5">
      <section className="space-y-3 rounded-2xl border bg-white/80 p-4 backdrop-blur-sm">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <p className="text-3xl font-bold">
            {caught.size}
            <span className="text-lg font-medium text-muted-foreground"> / {total} caught ({overall}%)</span>
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={download} disabled={caught.size === 0}>
              <Download className="mr-1 h-4 w-4" />
              Export
            </Button>
            <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
              <Upload className="mr-1 h-4 w-4" />
              Import
            </Button>
            <input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={(e) => upload(e.target.files?.[0])} />
          </div>
        </div>
        <Bar value={overall} className="h-3" />
        {message && (
          <p className="text-sm text-muted-foreground" role="status">
            {message}
          </p>
        )}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
          {perGen.map((g, i) => (
            <button
              key={regions[i]}
              type="button"
              onClick={() => setGen(gen === i + 1 ? 0 : i + 1)}
              aria-pressed={gen === i + 1}
              className={cn('rounded-xl border p-2 text-left text-sm transition-colors hover:bg-blue-50', gen === i + 1 && 'border-blue-500 bg-blue-50')}
            >
              <span className="flex items-baseline justify-between">
                <span className="font-medium">
                  Gen {i + 1} · {regions[i]}
                </span>
                {g.caught === g.total && <Check className="h-4 w-4 text-green-600" aria-label="Complete" />}
              </span>
              <span className="text-xs text-muted-foreground">
                {g.caught} / {g.total}
              </span>
              <Bar value={pct(g.caught, g.total)} className="mt-1" />
            </button>
          ))}
        </div>
      </section>

      <div className="flex flex-wrap items-center gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search name or number…"
          aria-label="Search Pokémon"
          className="h-10 min-w-0 flex-1 rounded-xl border-2 border-gray-200 bg-white px-3 text-sm outline-none focus:border-blue-500 sm:max-w-xs"
        />
        <div className="flex overflow-hidden rounded-xl border bg-white text-sm" role="group" aria-label="Show">
          {STATUS_LABELS.map(([value, label]) => (
            <button
              key={value}
              type="button"
              aria-pressed={status === value}
              onClick={() => setStatus(value)}
              className={cn('px-3 py-2', status === value ? 'bg-blue-500 text-white' : 'hover:bg-blue-50')}
            >
              {label}
            </button>
          ))}
        </div>
        <span className="text-sm text-muted-foreground">{shown.length} shown</span>
        <div className="ml-auto flex gap-2">
          <Button variant="outline" size="sm" onClick={() => markShown(true)} disabled={shown.length === 0}>
            Mark {filtered ? 'shown' : 'all'} caught
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={shown.length === 0}
            onClick={() => {
              if (window.confirm(`Clear ${filtered ? `the ${shown.length} Pokémon shown` : 'your whole tracker'}?`)) markShown(false);
            }}
          >
            Clear {filtered ? 'shown' : 'all'}
          </Button>
        </div>
      </div>

      <ul className="grid grid-cols-3 gap-2 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8">
        {shown.map((m) => {
          const has = caught.has(m.id);
          return (
            <li key={m.id} style={{ contentVisibility: 'auto', containIntrinsicSize: '120px' }}>
              <button
                type="button"
                onClick={() => toggle(m.id)}
                aria-pressed={has}
                className={cn(
                  'relative flex w-full flex-col items-center rounded-xl border-2 bg-white p-1.5 text-center transition-colors',
                  has ? 'border-green-500 bg-green-50' : 'border-transparent hover:border-gray-300'
                )}
              >
                {has && <Check className="absolute right-1.5 top-1.5 h-4 w-4 rounded-full bg-green-500 p-0.5 text-white" aria-hidden />}
                <Image
                  src={spriteUrl(m.id)}
                  alt=""
                  width={72}
                  height={72}
                  unoptimized
                  className={cn(!has && 'opacity-40 grayscale')}
                  style={{ imageRendering: 'pixelated' }}
                />
                <span className="text-[11px] text-muted-foreground">#{String(m.id).padStart(4, '0')}</span>
                <span className="w-full truncate text-xs font-medium">{m.name}</span>
              </button>
            </li>
          );
        })}
      </ul>
      {shown.length === 0 && <p className="py-10 text-center text-muted-foreground">No Pokémon match those filters.</p>}
    </div>
  );
}
