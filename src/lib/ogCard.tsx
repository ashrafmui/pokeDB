// Shared pieces for the share-preview images (src/app/og/*). Satori only
// supports flexbox and inline styles, so everything here is styled inline.

import type { ReactNode } from 'react';
import { getTypeBadgeColors } from '@/lib/typeColors';
import { officialArtworkUrl } from '@/lib/sprites';

export const OG_SIZE = { width: 1200, height: 630 } as const;

const title = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export function TypePill({ type }: { type: string }) {
  const { bg, text } = getTypeBadgeColors(type);
  return (
    <div style={{ display: 'flex', background: bg, color: text, fontSize: 20, fontWeight: 700, padding: '2px 14px', borderRadius: 999 }}>{title(type)}</div>
  );
}

export function Artwork({ id, size }: { id: number; size: number }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={officialArtworkUrl(id)} width={size} height={size} alt="" style={{ objectFit: 'contain' }} />;
}

export function Frame({ heading, children }: { heading: string; children: ReactNode }) {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        padding: '44px 56px',
        background: 'linear-gradient(135deg, #dbeafe 0%, #ffffff 55%, #fef3c7 100%)',
        color: '#111827',
        fontFamily: 'sans-serif',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <div style={{ display: 'flex', fontSize: 52, fontWeight: 800 }}>{heading}</div>
        <div style={{ display: 'flex', fontSize: 30, fontWeight: 700, color: '#2563eb' }}>poKeDB</div>
      </div>
      {children}
    </div>
  );
}
