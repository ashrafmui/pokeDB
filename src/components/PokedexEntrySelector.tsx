"use client";

import { useState } from 'react';

interface PokedexEntry {
  id: number;
  version: string;
  description: string;
}

interface Props {
  entries: PokedexEntry[];
}

export default function PokedexEntrySelector({ entries }: Props) {
  const [selectedVersion, setSelectedVersion] = useState(entries[0]?.version || '');
  
  const currentEntry = entries.find(e => e.version === selectedVersion) || entries[0];

  if (entries.length === 0) {
    return <p className="text-gray-500 italic">No Pokédex entry available</p>;
  }

  return (
    <div className="space-y-3">
      {entries.length > 1 && (
        <div>
          <label htmlFor="pokedex-version-select" className="sr-only">
            Select Pokémon game version
          </label>
          <select
            id="pokedex-version-select"
            value={selectedVersion}
            onChange={(e) => setSelectedVersion(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 capitalize"
          >
            {entries.map((entry) => (
              <option key={entry.id} value={entry.version} className="capitalize">
                {entry.version.replace('-', ' ')}
              </option>
            ))}
          </select>
        </div>
      )}
      
      <p className="text-gray-700 leading-relaxed">
        {currentEntry?.description || 'No description available'}
      </p>
    </div>
  );
}