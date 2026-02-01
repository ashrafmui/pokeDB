import { LocationData, getLocationIcon } from '@/lib/locationUtils';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface LocationListViewProps {
  locations: LocationData[];
}

export default function LocationListView({ locations }: LocationListViewProps) {
  return (
    <ScrollArea className="h-64">
      <div className="space-y-3 pr-4">
        {locations.map((location, index) => (
          <div 
            key={index}
            className="p-3 rounded-md bg-muted/50 border border-border"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span>{getLocationIcon(location.locationType)}</span>
                  <h3 className="font-medium text-foreground">{location.name}</h3>
                </div>
                <div className="flex flex-wrap gap-1 mt-1 ml-6">
                  {location.methods.map((method, i) => (
                    <Badge 
                      key={i}
                      variant="secondary"
                      className="text-xs font-normal"
                    >
                      {method}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-medium text-foreground">{location.levels}</p>
                {location.chance > 0 && (
                  <p className="text-xs text-muted-foreground">{location.chance}% chance</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}