"use client";

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { AnimatedCollapsibleContent, Collapsible, CollapseToggle, useCollapsible } from '@/components/ui/collapsible';
import { getVersionColor } from '@/lib/versionColors';
import { fetchBoxartUrl } from '@/lib/originMarks';
import { getPlatformIconUrl, getPlatformLabel } from '@/lib/platformIcons';
import { getGenerationRoman } from '@/lib/generations';


// Origin mark mappings based on game version

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
  const { isOpen, toggle, setIsOpen } = useCollapsible(true);
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
    const container = scrollContainerRef.current;
    const activeButton = buttonRefs.current.get(selectedVersion);
    if (!container || !activeButton) return;
    const left =
      activeButton.offsetLeft - container.clientWidth / 2 + activeButton.clientWidth / 2;
    container.scrollTo({ left, behavior: 'smooth' });
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
      <Collapsible open={isOpen} onOpenChange={setIsOpen} asChild>
        <div className="relative min-h-[44px]">
          <CollapseToggle
            isOpen={isOpen}
            onToggle={toggle}
            className="absolute top-[14px] right-3 z-50"
          />
          <div
            className={`absolute inset-x-0 top-0 bg-white rounded-2xl shadow-xl border-2 border-gray-300 px-6 py-3 transition-opacity duration-150 ${
              isOpen ? 'opacity-0 pointer-events-none' : 'opacity-100 delay-100'
            }`}
          >
            <span className="font-pocket-monk text-sm text-gray-500 italic">Pokédex Entry</span>
          </div>
          <AnimatedCollapsibleContent>
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <p className="text-gray-500 italic">No Pokédex entry available</p>
            </div>
          </AnimatedCollapsibleContent>
        </div>
      </Collapsible>
    );
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} asChild>
      <div className="relative min-h-[44px]">
        <CollapseToggle
          isOpen={isOpen}
          onToggle={toggle}
          className="absolute top-[14px] right-3 z-50"
        />
        <div
          className={`absolute inset-x-0 top-0 ${activeColors.bg} rounded-2xl shadow-xl border-2 ${activeColors.border} px-6 py-3 transition-opacity duration-150 ${
            isOpen ? 'opacity-0 pointer-events-none' : 'opacity-100 delay-100'
          }`}
        >
          <span className="font-pocket-monk text-sm text-white">Pokédex Entry</span>
        </div>
        <AnimatedCollapsibleContent>
    <div className="relative h-[180px]">
      {/* Main card */}
      <div
        className={`absolute left-0 right-0 rounded-t-2xl overflow-hidden transition-all duration-150 ease-out ${activeColors.bg} border-2 ${activeColors.border}`}
        style={{
          bottom: '38px',
          height: isAnimating ? '0px' : '140px',
          padding: isAnimating ? '0 24px' : '24px',
          opacity: isAnimating ? 0 : 1,
        }}
      >
        {getGenerationRoman(selectedVersion) && (
          <div className="absolute top-[26px] right-6 font-pocket-monk text-xl text-white opacity-75 leading-none">
            {getGenerationRoman(selectedVersion)}
          </div>
        )}
        <div className="h-24 overflow-y-auto pr-44">
          <p className="font-pokemon-gb text-xs text-white leading-relaxed">
            {displayedEntry?.description || 'No description available'}
          </p>
        </div>
        {fetchBoxartUrl(selectedVersion) && (
          <div className="absolute top-3 right-14 bottom-3 w-28 rounded-lg overflow-hidden">
            <Image
              src={fetchBoxartUrl(selectedVersion)!}
              alt={`${selectedVersion} game logo`}
              fill
              className="object-contain"
              sizes="112px"
            />
          </div>
        )}
        {getPlatformIconUrl(selectedVersion) && (
          <div
            className="absolute bottom-3 right-3 w-8 h-8"
            // title={getPlatformLabel(selectedVersion) ?? undefined}
          >
            <Image
              src={getPlatformIconUrl(selectedVersion)!}
              alt={getPlatformLabel(selectedVersion) ?? 'platform icon'}
              fill
              className="object-contain"
              sizes="32px"
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
        </AnimatedCollapsibleContent>
      </div>
    </Collapsible>
  );
}