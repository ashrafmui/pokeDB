interface BackgroundProps {
  color: string;
  className?: string;
}

// 1. Soft radial wash centered toward the top.
function GradientBackground({ color, className }: BackgroundProps) {
  return (
    <svg
      className={className}
      width="100%"
      height="100%"
      preserveAspectRatio="none"
      aria-hidden
    >
      <defs>
        <radialGradient id="poke-bg-gradient" cx="50%" cy="35%" r="70%">
          <stop offset="0%" stopColor={color} stopOpacity="0.45" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#poke-bg-gradient)" />
    </svg>
  );
}

// 2. Sparse dot grid.
function DotGridBackground({ color, className }: BackgroundProps) {
  return (
    <svg className={className} width="100%" height="100%" aria-hidden>
      <defs>
        <pattern id="poke-bg-dots" width="22" height="22" patternUnits="userSpaceOnUse">
          <circle cx="11" cy="11" r="1.6" fill={color} fillOpacity="0.35" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#poke-bg-dots)" />
    </svg>
  );
}

// 3. Diagonal stripes.
function DiagonalStripesBackground({ color, className }: BackgroundProps) {
  return (
    <svg className={className} width="100%" height="100%" aria-hidden>
      <defs>
        <pattern
          id="poke-bg-stripes"
          width="18"
          height="18"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(45)"
        >
          <line x1="0" y1="0" x2="0" y2="18" stroke={color} strokeOpacity="0.22" strokeWidth="6" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#poke-bg-stripes)" />
    </svg>
  );
}

// 4. Tiled simplified pokéball outlines.
function PokeballPatternBackground({ color, className }: BackgroundProps) {
  return (
    <svg className={className} width="100%" height="100%" aria-hidden>
      <defs>
        <pattern id="poke-bg-balls" width="72" height="72" patternUnits="userSpaceOnUse">
          <g stroke={color} strokeOpacity="0.3" strokeWidth="1.5" fill="none">
            <circle cx="36" cy="36" r="22" />
            <line x1="14" y1="36" x2="58" y2="36" />
            <circle cx="36" cy="36" r="6" />
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#poke-bg-balls)" />
    </svg>
  );
}

export const BACKGROUND_VARIANTS = [
  { id: 'gradient', label: 'Glow', Component: GradientBackground },
  { id: 'dots', label: 'Dots', Component: DotGridBackground },
  { id: 'stripes', label: 'Stripes', Component: DiagonalStripesBackground },
  { id: 'pokeballs', label: 'Pokéballs', Component: PokeballPatternBackground },
] as const;

export type BackgroundVariantId = (typeof BACKGROUND_VARIANTS)[number]['id'];
