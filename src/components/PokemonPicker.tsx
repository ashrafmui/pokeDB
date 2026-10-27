'use client';

// Type-to-search Pokémon picker with sprites and keyboard support, shared by
// the Pokédle guess box and the team builder.

import { useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { spriteUrl } from '@/lib/sprites';

export interface Pickable {
  id: number;
  name: string;
}

/**
 * Names starting with the query first, then names containing it, skipping
 * ids in `exclude`.
 */
export function suggest<T extends Pickable>(pool: readonly T[], query: string, exclude: ReadonlySet<number>, limit = 8): T[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const starts: T[] = [];
  const contains: T[] = [];
  for (const p of pool) {
    if (exclude.has(p.id)) continue;
    const name = p.name.toLowerCase();
    if (name.startsWith(q)) starts.push(p);
    else if (name.includes(q)) contains.push(p);
  }
  return [...starts, ...contains].slice(0, limit);
}

export default function PokemonPicker<T extends Pickable>({
  pool,
  exclude,
  disabled = false,
  onPick,
  placeholder,
  disabledPlaceholder,
  label,
}: {
  pool: readonly T[];
  exclude: ReadonlySet<number>;
  disabled?: boolean;
  onPick: (p: T) => void;
  placeholder: string;
  disabledPlaceholder?: string;
  /** Accessible name for the input. */
  label: string;
}) {
  const [query, setQuery] = useState('');
  const [highlight, setHighlight] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const options = useMemo(() => suggest(pool, query, exclude), [pool, query, exclude]);

  function pick(p: T) {
    onPick(p);
    setQuery('');
    setHighlight(0);
    inputRef.current?.focus();
  }

  return (
    <div className="relative">
      <input
        ref={inputRef}
        value={query}
        disabled={disabled}
        onChange={(e) => {
          setQuery(e.target.value);
          setHighlight(0);
        }}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown') {
            e.preventDefault();
            setHighlight((h) => Math.min(h + 1, options.length - 1));
          } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setHighlight((h) => Math.max(h - 1, 0));
          } else if (e.key === 'Enter' && options[highlight]) {
            e.preventDefault();
            pick(options[highlight]);
          } else if (e.key === 'Escape') {
            setQuery('');
          }
        }}
        placeholder={disabled && disabledPlaceholder ? disabledPlaceholder : placeholder}
        aria-label={label}
        aria-autocomplete="list"
        autoComplete="off"
        className="h-12 w-full rounded-xl border-2 border-gray-200 bg-white px-4 text-base shadow-sm outline-none focus:border-blue-500 disabled:opacity-60"
      />
      {options.length > 0 && (
        <ul role="listbox" className="absolute z-20 mt-1 w-full overflow-hidden rounded-xl border bg-white shadow-xl">
          {options.map((p, i) => (
            <li key={p.id} role="option" aria-selected={i === highlight}>
              <button
                type="button"
                onMouseEnter={() => setHighlight(i)}
                onClick={() => pick(p)}
                className={cn('flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm', i === highlight && 'bg-blue-50')}
              >
                <Image src={spriteUrl(p.id)} alt="" width={32} height={32} unoptimized style={{ imageRendering: 'pixelated' }} />
                {p.name}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
