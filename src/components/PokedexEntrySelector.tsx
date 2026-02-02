"use client";

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { getVersionColor } from '@/lib/versionColors';

// Origin mark mappings based on game version
const ORIGIN_MARKS: Record<string, string> = {
  // Gen 1 - Game Boy
  'red': 'game-boy',
  'blue': 'game-boy',
  'yellow': 'game-boy',
  // Gen 2 - Game Boy
  'gold': 'game-boy',
  'silver': 'game-boy',
  'crystal': 'game-boy',
  // Gen 3 - Game Boy
  'ruby': 'game-boy',
  'sapphire': 'game-boy',
  'emerald': 'game-boy',
  'firered': 'game-boy',
  'leafgreen': 'game-boy',
  // Gen 4 - Sinnoh
  'diamond': 'sinnoh-gen8',
  'pearl': 'sinnoh-gen8',
  'platinum': 'sinnoh-gen8',
  'heartgold': 'sinnoh-gen8',
  'soulsilver': 'sinnoh-gen8',
  // Gen 5 - Pentagon (using pentagon as closest)
  'black': 'pentagon',
  'white': 'pentagon',
  'black-2': 'pentagon',
  'white-2': 'pentagon',
  // Gen 6 - Pentagon (Kalos)
  'x': 'pentagon',
  'y': 'pentagon',
  'omega-ruby': 'pentagon',
  'alpha-sapphire': 'pentagon',
  // Gen 7 - Clover (Alola)
  'sun': 'clover',
  'moon': 'clover',
  'ultra-sun': 'clover',
  'ultra-moon': 'clover',
  'lets-go-pikachu': 'lets-go',
  'lets-go-eevee': 'lets-go',
  // Gen 8 - Galar
  'sword': 'galar',
  'shield': 'galar',
  'brilliant-diamond': 'sinnoh-gen8',
  'shining-pearl': 'sinnoh-gen8',
  'legends-arceus': 'hisui',
  // Gen 9 - Paldea (using galar as placeholder, no paldea mark yet)
  'scarlet': 'galar',
  'violet': 'galar',
};

function getOriginMarkUrl(version: string): string | null {
  const mark = ORIGIN_MARKS[version.toLowerCase()];
  if (!mark) return null;
  return `https://raw.githubusercontent.com/msikma/pokesprite/master/misc/origin-marks/home/${mark}.png`;
}

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
      {/* Main card */}
      <div 
        className={`absolute left-0 right-0 rounded-t-2xl overflow-hidden transition-all duration-150 ease-out ${activeColors.bg}`}
        style={{
          bottom: '38px',
          height: isAnimating ? '0px' : '140px',
          padding: isAnimating ? '0 24px' : '24px',
          opacity: isAnimating ? 0 : 1,
        }}
      >
        <div className="h-24 overflow-y-auto pr-8">
          <p className="font-pokemon-gb text-xs text-white leading-relaxed">
            {displayedEntry?.description || 'No description available'}
          </p>
        </div>
        {/* Origin Mark */}
        {getOriginMarkUrl(selectedVersion) && (
          <div className="absolute bottom-3 right-3">
            <Image
              src={getOriginMarkUrl(selectedVersion)!}
              alt="Origin mark"
              width={24}
              height={24}
              className="brightness-0 invert opacity-70"
              unoptimized
            />
          </div>
        )}
      </div>

      {/* Version buttons */}
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
                <button
                  key={entry.id}
                  ref={(el) => {
                    if (el) {
                      buttonRefs.current.set(entry.version, el);
                    }
                  }}
                  onClick={() => handleVersionChange(entry.version)}
                  className={`relative flex-shrink-0 px-4 py-2 text-sm font-pocket-monk capitalize whitespace-nowrap transition-all duration-150 ease-out
                    ${isSelected 
                      ? `${colors.bg} shadow-lg text-white rounded-b-xl rounded-t-none pt-[40px] -mt-[40px]` 
                      : `bg-white border-2 border-t-0 rounded-t-none rounded-b-xl ${colors.border} ${colors.text} ${colors.hoverBg} opacity-50 hover:opacity-80`
                    }`}
                >
                  {entry.version.replace('-', ' ')}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}