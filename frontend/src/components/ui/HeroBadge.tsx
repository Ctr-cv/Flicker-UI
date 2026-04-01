interface HeroBadgeProps {
  label: string;
}

/**
 * Small pill-shaped label used above the hero headline.
 */
export function HeroBadge({ label }: HeroBadgeProps) {
  return (
    <span className="inline-block px-3 py-1 bg-primary/5 text-primary font-label text-[10px] tracking-[0.3em] uppercase rounded-full">
      {label}
    </span>
  );
}
