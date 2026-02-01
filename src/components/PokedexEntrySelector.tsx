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

function getComputedBgColor(bgClass: string): string {
  const colorMap: Record<string, string> = {
    'bg-red-500': '#ef4444',
    'bg-red-600': '#dc2626',
    'bg-red-700': '#b91c1c',
    'bg-blue-500': '#3b82f6',
    'bg-blue-600': '#2563eb',
    'bg-blue-700': '#1d4ed8',
    'bg-yellow-400': '#facc15',
    'bg-yellow-500': '#eab308',
    'bg-yellow-600': '#ca8a04',
    'bg-gray-100': '#f3f4f6',
    'bg-gray-200': '#e5e7eb',
    'bg-gray-400': '#9ca3af',
    'bg-gray-500': '#6b7280',
    'bg-gray-800': '#1f2937',
    'bg-gray-900': '#111827',
    'bg-cyan-300': '#67e8f9',
    'bg-cyan-400': '#22d3ee',
    'bg-cyan-500': '#06b6d4',
    'bg-emerald-500': '#10b981',
    'bg-orange-400': '#fb923c',
    'bg-orange-500': '#f97316',
    'bg-green-500': '#22c55e',
    'bg-pink-300': '#f9a8d4',
    'bg-pink-400': '#f472b6',
    'bg-slate-400': '#94a3b8',
    'bg-purple-600': '#9333ea',
    'bg-purple-700': '#7e22ce',
    'bg-amber-600': '#d97706',
    'bg-indigo-600': '#4f46e5',
    'bg-violet-600': '#7c3aed',
  };
  
  return colorMap[bgClass] || '#6b7280';
}

export default function PokedexEntrySelector({ entries }: Props) {
  const [selectedVersion, setSelectedVersion] = useState(entries[0]?.version || '');
  const [isAnimating, setIsAnimating] = useState(false);
  const [displayedEntry, setDisplayedEntry] = useState(entries[0]);
  const [showLeftFade, setShowLeftFade] = useState(false);
  const [showRightFade, setShowRightFade] = useState(false);
  const buttonRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  const activeColors = getVersionColor(selectedVersion);

  const checkScrollPosition = () => {
    const container = scrollContainerRef.current;
    if (!container) return;
    
    const { scrollLeft, scrollWidth, clientWidth } = container;
    setShowLeftFade(scrollLeft > 5);
    setShowRightFade(scrollLeft < scrollWidth - clientWidth - 5);
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    checkScrollPosition();
    container.addEventListener('scroll', checkScrollPosition);
    
    const resizeObserver = new ResizeObserver(checkScrollPosition);
    resizeObserver.observe(container);

    return () => {
      container.removeEventListener('scroll', checkScrollPosition);
      resizeObserver.disconnect();
    };
  }, [entries]);

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

  const handleVersionChange = (newVersion: string) => {
    if (newVersion === selectedVersion) return;
    
    setIsAnimating(true);
    setSelectedVersion(newVersion);
    
    setTimeout(() => {
      setDisplayedEntry(entries.find(e => e.version === newVersion) || entries[0]);
      setIsAnimating(false);
    }, 100);
  };

  if (entries.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-6">
        <p className="text-gray-500 italic">No Pokédex entry available</p>
      </div>
    );
  }

  return (
    <div className="relative h-[180px]">
      {/* Main card - emerges upward from buttons */}
      <div 
        className="absolute left-0 right-0 rounded-t-2xl rounded-b-none overflow-hidden transition-all duration-150 ease-out bg-white"
        style={{
          bottom: '38px',
          height: isAnimating ? '0px' : '140px',
          padding: isAnimating ? '0 24px' : '24px',
          opacity: isAnimating ? 0 : 1,
          border: `4px solid ${getComputedBgColor(activeColors.bg)}`,
          borderBottom: 'none',
        }}
      >
        <div className="h-24 overflow-y-auto">
          <p className="font-pokemon-gb text-xs text-gray-800 leading-relaxed">
            {displayedEntry?.description || 'No description available'}
          </p>
        </div>
      </div>

      {/* Version buttons - fixed at bottom */}
      {entries.length > 1 && (
        <div className="absolute bottom-0 left-0 right-0">
          {/* Left fade indicator */}
          <div 
            className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white to-transparent z-20 pointer-events-none transition-opacity duration-200"
            style={{ opacity: showLeftFade ? 1 : 0 }}
          />
          
          {/* Right fade indicator */}
          <div 
            className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent z-20 pointer-events-none transition-opacity duration-200"
            style={{ opacity: showRightFade ? 1 : 0 }}
          />

          <div 
            ref={scrollContainerRef}
            className="flex gap-2 overflow-x-auto"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {entries.map((entry) => {
              const colors = getVersionColor(entry.version);
              const isSelected = selectedVersion === entry.version;
              
              return (
                <div 
                  key={entry.id} 
                  className="relative flex-shrink-0"
                >
                  {/* Curved corner connectors for active button */}
                  {isSelected && !isAnimating && (
                    <>
                      <div className="absolute -top-[12px] -left-[12px] w-[12px] h-[12px] overflow-hidden" style={{ zIndex: 10 }}>
                        <div 
                          className="absolute top-0 left-0 w-[24px] h-[24px] rounded-full"
                          style={{ 
                            boxShadow: `12px 12px 0 0 ${getComputedBgColor(colors.bg)}`,
                          }}
                        />
                      </div>
                      <div className="absolute -top-[12px] -right-[12px] w-[12px] h-[12px] overflow-hidden" style={{ zIndex: 10 }}>
                        <div 
                          className="absolute top-0 right-0 w-[24px] h-[24px] rounded-full"
                          style={{ 
                            boxShadow: `-12px 12px 0 0 ${getComputedBgColor(colors.bg)}`,
                          }}
                        />
                      </div>
                    </>
                  )}
                  
                  <button
                    ref={(el) => {
                      if (el) {
                        buttonRefs.current.set(entry.version, el);
                      }
                    }}
                    onClick={() => handleVersionChange(entry.version)}
                    className={`relative px-4 py-2 text-sm font-pocket-monk capitalize whitespace-nowrap transition-all duration-150 ease-out
                      ${isSelected 
                        ? `${colors.bg} shadow-lg text-white rounded-b-xl rounded-t-none` 
                        : `bg-white border-2 border-t-0 rounded-t-none rounded-b-xl ${colors.border} ${colors.text} ${colors.hoverBg} opacity-50 hover:opacity-80`
                      }`}
                    style={{
                      paddingTop: isSelected ? '40px' : '8px',
                      marginTop: isSelected ? '-40px' : '0px',
                      transition: 'all 150ms ease-out',
                    }}
                  >
                    {entry.version.replace('-', ' ')}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}