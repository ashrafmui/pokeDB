import { LocationData, getLocationIcon, getComputedBgColor } from '@/lib/locationUtils';

interface LocationMapViewProps {
  locations: LocationData[];
  gameColorBg: string | null;
}

export default function LocationMapView({ locations, gameColorBg }: LocationMapViewProps) {
  const groupedLocations = locations.reduce((acc, loc) => {
    if (!acc[loc.locationType]) {
      acc[loc.locationType] = [];
    }
    acc[loc.locationType].push(loc);
    return acc;
  }, {} as Record<string, LocationData[]>);

  return (
    <div className="relative">
      <div 
        className="rounded-xl p-4 min-h-[280px]"
        style={{
          backgroundColor: gameColorBg ? getComputedBgColor(gameColorBg) + '15' : '#f3f4f6',
          backgroundImage: `
            radial-gradient(circle at 20% 30%, rgba(34, 197, 94, 0.1) 0%, transparent 40%),
            radial-gradient(circle at 70% 60%, rgba(59, 130, 246, 0.1) 0%, transparent 35%),
            radial-gradient(circle at 40% 80%, rgba(234, 179, 8, 0.1) 0%, transparent 30%)
          `,
        }}
      >
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {Object.entries(groupedLocations).map(([type, locs]) => (
            <div 
              key={type}
              className="bg-white/80 backdrop-blur rounded-xl p-3 border border-gray-200"
            >
              <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-100">
                <span className="text-lg">{getLocationIcon(type)}</span>
                <h4 className="font-medium text-gray-700 capitalize text-sm">
                  {type === 'other' ? 'Other Areas' : type}
                </h4>
              </div>
              <div className="space-y-1.5 max-h-32 overflow-y-auto">
                {locs.map((loc, i) => (
                  <div 
                    key={i} 
                    className="text-xs p-1.5 rounded bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <p className="font-medium text-gray-800 truncate">{loc.name}</p>
                    <p className="text-gray-500">
                      {loc.levels} • {loc.chance > 0 ? `${loc.chance}%` : 'Rare'}
                    </p>
                  </div>
                ))}
              </div>
              <div className="mt-2 pt-2 border-t border-gray-100">
                <p className="text-xs text-gray-500">
                  {locs.length} location{locs.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}