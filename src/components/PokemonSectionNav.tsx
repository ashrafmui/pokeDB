'use client';

import { useEffect, useState } from 'react';
import { Globe, Info, Swords } from 'lucide-react';
import { cn } from '@/lib/utils';

const SECTIONS = [
  { id: 'about', label: 'About', Icon: Info, accent: 'text-blue-500' },
  { id: 'combat', label: 'Combat', Icon: Swords, accent: 'text-red-500' },
  { id: 'world', label: 'World', Icon: Globe, accent: 'text-emerald-500' },
] as const;

export default function PokemonSectionNav() {
  const [activeId, setActiveId] = useState<string>(SECTIONS[0].id);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) setActiveId(visible[0].target.id);
      },
      { rootMargin: '-25% 0px -55% 0px', threshold: 0 }
    );

    const els = SECTIONS.map((s) => document.getElementById(s.id)).filter(
      (el): el is HTMLElement => el !== null
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const handleClick = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <nav
      aria-label="Page sections"
      className="fixed right-4 top-1/2 -translate-y-1/2 z-30 hidden lg:flex flex-col gap-2"
    >
      {SECTIONS.map(({ id, label, Icon, accent }) => {
        const active = activeId === id;
        return (
          <button
            key={id}
            type="button"
            onClick={() => handleClick(id)}
            aria-current={active ? 'true' : undefined}
            className={cn(
              'flex items-center gap-2 rounded-full pl-3 pr-4 py-2 text-xs font-medium shadow-sm transition-all duration-200',
              active
                ? 'bg-primary text-primary-foreground shadow-md scale-105'
                : 'bg-background/95 backdrop-blur border text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
          >
            <Icon className={cn('h-4 w-4 shrink-0', !active && accent)} />
            <span>{label}</span>
          </button>
        );
      })}
    </nav>
  );
}
