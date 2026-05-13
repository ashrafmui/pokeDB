interface Props {
  /**
   * Distance from the card's outer-left edge to the inner white area
   * (the width of the type-colored edge strip). The lens housing bump
   * spans from x=0 to x=(leftInset + BUMP_CONTENT_WIDTH), keeping the
   * lens centered over the strip/content boundary.
   */
  leftInset?: string;
  className?: string;
}

// Width of the bump area that lives inside the white content zone
// (to the right of the leftInset edge strip).
const BUMP_CONTENT_WIDTH = 80;
// Total height of the top bar — the bump extends this far down.
const BUMP_HEIGHT = 76;
// Height of the shorter banner strip that holds the LEDs.
const BANNER_HEIGHT = 40;
// Size of the concave curve between the bump and banner.
const CURVE_SIZE = 24;

export default function PokedexTopBar({ leftInset, className = '' }: Props) {
  const inset = leftInset ?? '0px';
  // Total bump width = edge strip + content portion
  const bumpWidth = `calc(${inset} + ${BUMP_CONTENT_WIDTH}px)`;

  return (
    <div
      className={`relative overflow-hidden rounded-t-lg ${className}`}
      style={{ height: `${BUMP_HEIGHT}px` }}
    >
      {/* ── Red shapes ─────────────────────────────────────────────── */}

      {/* Tall bump (left) — full bar height */}
      <div
        className="absolute top-0 left-0 bg-[#DC0A2D]"
        style={{
          width: bumpWidth,
          height: `${BUMP_HEIGHT}px`,
        }}
      />

      {/* Short banner (right) — holds LEDs, extends to right edge */}
      <div
        className="absolute top-0 right-0 bg-[#DC0A2D]"
        style={{
          left: bumpWidth,
          height: `${BANNER_HEIGHT}px`,
        }}
      />

      {/* Concave corner — inverted border-radius trick:
          a red box at the step filled with a white div that has
          border-top-left-radius, carving the concave curve. */}
      <div
        className="absolute bg-[#DC0A2D]"
        style={{
          left: bumpWidth,
          top: `${BANNER_HEIGHT}px`,
          width: `${CURVE_SIZE}px`,
          height: `${BUMP_HEIGHT - BANNER_HEIGHT}px`,
        }}
      >
        <div className="w-full h-full rounded-tl-[24px] bg-white" />
      </div>

      {/* ── Lens ───────────────────────────────────────────────────── */}
      <div
        className="absolute top-0 left-0 flex items-center justify-center z-10"
        style={{
          width: bumpWidth,
          height: `${BUMP_HEIGHT}px`,
        }}
      >
        <div
          className="relative w-12 h-12 rounded-full flex items-center justify-center shrink-0"
          style={{
            background:
              'linear-gradient(145deg, #b8b8b8 0%, #e8e8e8 40%, #ffffff 60%, #d0d0d0 100%)',
            boxShadow:
              '0 2px 6px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.6)',
          }}
        >
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{
              background: 'linear-gradient(160deg, #1a5276 0%, #154360 100%)',
              boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.4)',
            }}
          >
            <div
              className="relative w-7 h-7 rounded-full overflow-hidden"
              style={{
                background:
                  'radial-gradient(circle at 35% 35%, #7ec8e3 0%, #3498db 40%, #2471a3 70%, #1a5276 100%)',
                boxShadow:
                  'inset 0 2px 6px rgba(0,0,0,0.3), inset 0 -1px 3px rgba(255,255,255,0.15)',
              }}
            >
              <span
                className="absolute w-2.5 h-2.5 rounded-full"
                style={{
                  top: '4px',
                  left: '6px',
                  background:
                    'radial-gradient(circle, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0) 70%)',
                }}
              />
              <span
                className="absolute w-1 h-1 rounded-full"
                style={{
                  top: '13px',
                  left: '11px',
                  background:
                    'radial-gradient(circle, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0) 70%)',
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── LED indicators ─────────────────────────────────────────── */}
      <div
        className="absolute top-0 flex items-center z-10"
        style={{
          left: `calc(${bumpWidth} + 16px)`,
          height: `${BANNER_HEIGHT}px`,
        }}
      >
        <div className="flex items-center gap-2">
          <span
            className="block w-2.5 h-2.5 rounded-full"
            style={{
              background:
                'radial-gradient(circle at 40% 35%, #ff6b6b 0%, #e74c3c 50%, #c0392b 100%)',
              boxShadow:
                '0 0 4px rgba(231,76,60,0.6), inset 0 -1px 2px rgba(0,0,0,0.3)',
            }}
          />
          <span
            className="block w-2.5 h-2.5 rounded-full"
            style={{
              background:
                'radial-gradient(circle at 40% 35%, #ffe066 0%, #f1c40f 50%, #d4ac0d 100%)',
              boxShadow:
                '0 0 4px rgba(241,196,15,0.6), inset 0 -1px 2px rgba(0,0,0,0.3)',
            }}
          />
          <span
            className="block w-2.5 h-2.5 rounded-full"
            style={{
              background:
                'radial-gradient(circle at 40% 35%, #6bcb77 0%, #27ae60 50%, #1e8449 100%)',
              boxShadow:
                '0 0 4px rgba(39,174,96,0.6), inset 0 -1px 2px rgba(0,0,0,0.3)',
            }}
          />
        </div>
      </div>
    </div>
  );
}