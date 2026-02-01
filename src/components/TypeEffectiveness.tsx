// components/TypeEffectiveness.tsx
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { calculateTypeEffectiveness } from '@/lib/typeUtils';

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

interface TypeEffectivenessProps {
  types: { name: string; [key: string]: unknown }[];
}

export default function TypeEffectiveness({ types }: TypeEffectivenessProps) {
  const typeNames = types.map(t => t.name.toLowerCase());
  const effectiveness = calculateTypeEffectiveness(typeNames);
  
  const sections = [
    { label: 'Weak to (4x)', types: effectiveness.quadWeakness, borderColor: BORDER_COLORS['4x'] },
    { label: 'Weak to (2x)', types: effectiveness.doubleWeakness, borderColor: BORDER_COLORS['2x'] },
    { label: 'Resists (0.5x)', types: effectiveness.resistance, borderColor: BORDER_COLORS['0.5x'] },
    { label: 'Resists (0.25x)', types: effectiveness.quadResistance, borderColor: BORDER_COLORS['0.25x'] },
    { label: 'Immune to (0x)', types: effectiveness.immunity, borderColor: BORDER_COLORS['0x'] },
  ].filter(s => s.types.length > 0);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold">Type Effectiveness</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {sections.map(section => (
          <div key={section.label}>
            <p className="text-xs text-muted-foreground mb-2">{section.label}</p>
            <div className="flex flex-wrap gap-2">
              {section.types.map(type => (
                <TypeIcon key={type} typeName={type} borderColor={section.borderColor} />
              ))}
            </div>
          </div>
        ))}
        {sections.length === 0 && (
          <p className="text-sm text-muted-foreground">No special type interactions</p>
        )}
      </CardContent>
    </Card>
  );
}