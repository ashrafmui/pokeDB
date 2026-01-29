"use client";

import { useState, useRef, useEffect } from 'react';
import { getVersionColor } from '@/lib/versionColors';

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
  const buttonRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  
  const currentEntry = entries.find(e => e.version === selectedVersion) || entries[0];
  const activeColors = getVersionColor(selectedVersion);

  useEffect(() => {
    const activeButton = buttonRefs.current.get(selectedVersion);
    if (activeButton) {
      activeButton.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      });
    }
  }, [selectedVersion]);

  if (entries.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-6">
        <p className="text-gray-500 italic">No Pokédex entry available</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Main card - solid version color background */}
      <div className={`rounded-t-2xl rounded-b-none shadow-xl p-6 ${activeColors.bg}`}>
        <div className="h-24 overflow-y-auto">
          <p className="text-white leading-relaxed">
            {currentEntry?.description || 'No description available'}
          </p>
        </div>
      </div>
      
      {/* Version buttons */}
      {entries.length > 1 && (
        <div 
          className="flex gap-2 overflow-x-auto relative z-10"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {entries.map((entry) => {
            const colors = getVersionColor(entry.version);
            const isSelected = selectedVersion === entry.version;
            
            return (
              <button
                key={entry.id}
                ref={(el) => {
                  if (el) {
                    buttonRefs.current.set(entry.version, el);
                  }
                }}
                onClick={() => setSelectedVersion(entry.version)}
                className={`pt-3 pb-2 px-4 text-sm font-pocket-monk capitalize whitespace-nowrap flex-shrink-0 transition-all
                  ${isSelected 
                    ? `${colors.bg} rounded-b-lg shadow-lg text-white` 
                    : `bg-white border-2 rounded-lg opacity-50 hover:opacity-80 mt-2 ${colors.border} ${colors.text} ${colors.hoverBg}`
                  }`}
              >
                {entry.version.replace('-', ' ')}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}