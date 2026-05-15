import Image from 'next/image';
import { calculateTypeEffectiveness } from '@/lib/typeUtils';

interface TypeEffectivenessProps {
  types: { name: string; [key: string]: unknown }[];
}

const BORDER_COLORS: Record<string, string> = {
  '4x': 'border-red-500',
  '2x': 'border-red-400',
  '0.5x': 'border-green-400',
  '0.25x': 'border-green-500',
  '0x': 'border-blue-400',
};

interface TypeIconProps {
  typeName: string;
  borderColor: string;
}

function TypeIcon({ typeName, borderColor }: TypeIconProps) {
  return (
    <div className={`w-8 h-8 rounded-full overflow-hidden border-2 ${borderColor}`}>
      <Image
        src={`https://raw.githubusercontent.com/msikma/pokesprite/master/misc/types/gen8/${typeName}.png`}
        alt={typeName}
        width={32}
        height={32}
        unoptimized
        className="w-full h-full object-cover"
      />
    </div>
  );
}

export default function TypeEffectiveness({ types }: TypeEffectivenessProps) {
  const typeNames = types.map((t) => t.name.toLowerCase());
  const effectiveness = calculateTypeEffectiveness(typeNames);

  const sections = [
    { label: 'Weak to (4×)', types: effectiveness.quadWeakness, borderColor: BORDER_COLORS['4x'] },
    { label: 'Weak to (2×)', types: effectiveness.doubleWeakness, borderColor: BORDER_COLORS['2x'] },
    { label: 'Resists (½×)', types: effectiveness.resistance, borderColor: BORDER_COLORS['0.5x'] },
    { label: 'Resists (¼×)', types: effectiveness.quadResistance, borderColor: BORDER_COLORS['0.25x'] },
    { label: 'Immune (0×)', types: effectiveness.immunity, borderColor: BORDER_COLORS['0x'] },
  ].filter((s) => s.types.length > 0);

  if (sections.length === 0) {
    return <p className="text-sm text-muted-foreground">No special type interactions</p>;
  }

  return (
    <div className="space-y-4">
      {sections.map((section) => (
        <div key={section.label}>
          <p className="text-xs text-muted-foreground mb-2">{section.label}</p>
          <div className="flex flex-wrap gap-2">
            {section.types.map((type) => (
              <TypeIcon key={type} typeName={type} borderColor={section.borderColor} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
