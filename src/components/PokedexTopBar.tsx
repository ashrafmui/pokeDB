interface Props {
  // Distance from the card's outer-left edge to the inner white area.
  // Used so the lens sits inside the white panel even when the card extends
  // past the viewport edge. Expressed as a CSS calc-compatible string.
  leftInset?: string;
  className?: string;
}

// Width of the lens-housing bump column (excluding the leftInset prefix that
// sits over the type-colored edge strip).
const BUMP_WIDTH_PX = 96;
// Total height of the topbar — also the height of the lens bump.
const BUMP_HEIGHT_PX = 76;
// Height of the shorter right-hand banner containing the status LEDs.
const BANNER_HEIGHT_PX = 40;

export default function PokedexTopBar({ leftInset, className = '' }: Props) {
  const inset = leftInset ?? '0px';

  return (
    <div
      className={`relative ${className}`}
      style={{ height: `${BUMP_HEIGHT_PX}px` }}
    >
      {/* Tall lens housing on the left — extends to full topbar height with a
          rounded bottom-right corner so the silhouette curves into the white
          sprite area below the shorter LED banner. */}
      <div
        className="absolute top-0 left-0 bg-[#DC0A2D] flex items-center justify-center rounded-br-[28px]"
        style={{
          width: `calc(${inset} + ${BUMP_WIDTH_PX}px)`,
          height: `${BUMP_HEIGHT_PX}px`,
          paddingLeft: inset,
        }}
      >
        <div className="relative w-12 h-12 rounded-full bg-white p-1 shadow-[0_2px_4px_rgba(0,0,0,0.25)]">
          <div className="w-full h-full rounded-full bg-sky-400 relative overflow-hidden ring-2 ring-sky-700/40">
            <span className="absolute top-1 left-1.5 w-2.5 h-2.5 rounded-full bg-white/80" />
          </div>
        </div>
      </div>

      {/* Shorter banner extending right of the bump — holds the LEDs. Its
          rounded bottom-left meets the bump's rounded bottom-right to form the
          classic stepped-and-curved Pokédex silhouette. */}
      <div
        className="absolute top-0 right-0 bg-[#DC0A2D] flex items-center pl-5 pr-6 rounded-tr-xl rounded-bl-[20px]"
        style={{
          left: `calc(${inset} + ${BUMP_WIDTH_PX}px)`,
          height: `${BANNER_HEIGHT_PX}px`,
        }}
      >
        <div className="flex items-center gap-2">
          <span className="block w-3 h-3 rounded-full bg-red-500 ring-1 ring-red-900/50 shadow-[inset_0_-1px_2px_rgba(0,0,0,0.35)]" />
          <span className="block w-3 h-3 rounded-full bg-yellow-400 ring-1 ring-yellow-700/50 shadow-[inset_0_-1px_2px_rgba(0,0,0,0.35)]" />
          <span className="block w-3 h-3 rounded-full bg-green-500 ring-1 ring-green-900/50 shadow-[inset_0_-1px_2px_rgba(0,0,0,0.35)]" />
        </div>
      </div>
    </div>
  );
}
