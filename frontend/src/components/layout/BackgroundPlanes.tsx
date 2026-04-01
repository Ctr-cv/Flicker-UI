/**
 * Architectural background planes that give the page its distinctive
 * overlapping-surface aesthetic. Purely decorative, pointer-events disabled.
 */
export function BackgroundPlanes() {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none">
      {/* Large Sand Plane */}
      <div className="absolute top-0 right-0 w-[80%] h-[120%] bg-surface-container-low curved-plane -rotate-6 translate-x-20 -translate-y-20 opacity-50" />

      {/* Cream Sweeping Plane */}
      <div className="absolute bottom-0 left-0 w-[70%] h-[90%] bg-surface-container-high curved-plane rotate-12 -translate-x-20 translate-y-40" />

      {/* Accent Line */}
      <div className="absolute top-1/4 left-0 w-full h-[1px] bg-outline-variant/10 -rotate-[15deg]" />
    </div>
  );
}
