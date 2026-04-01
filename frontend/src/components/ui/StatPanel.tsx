interface StatPanelProps {
  label: string;
  value: string;
  badge?: string;
  title: string;
  subtitle?: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  footerLabel?: string;
}

/**
 * Larger informational panel matching the "Neural Link" style from the design.
 * Features stats grid, CTA button with shadow, and subtle footer bar.
 */
export function StatPanel({
  label,
  value,
  badge,
  title,
  subtitle,
  description,
  actionLabel,
  actionHref,
  onAction,
  footerLabel,
}: StatPanelProps) {
  return (
    <div className="relative">
      <div className="bg-surface-container p-1 pt-0 rounded-xl overflow-hidden">
        <div className="bg-surface-container-lowest p-12 shadow-[0_40px_80px_-20px_rgba(144,75,54,0.12)]">
          {/* Header */}
          <div className="flex justify-between items-start mb-12">
            <div>
              <h3 className="font-headline text-3xl font-extrabold tracking-tight mb-2">
                {title}
              </h3>
              {subtitle && <div className="w-12 h-1 bg-primary" />}
            </div>
            {badge && (
              <span className="font-label text-[10px] text-outline tracking-widest uppercase bg-surface-variant px-2 py-1">
                {badge}
              </span>
            )}
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-8 mb-12">
            <div className="space-y-1">
              <span className="text-[10px] uppercase text-outline tracking-tighter">
                {label}
              </span>
              <p className="text-xl font-headline font-bold">{value}</p>
            </div>
          </div>

          {/* Description */}
          <p className="font-body text-on-surface-variant leading-relaxed mb-8">
            {description}
          </p>

          {/* CTA */}
          {(actionLabel || actionHref) && (
            <a
              href={actionHref ?? "#"}
              onClick={(e) => {
                if (onAction) {
                  e.preventDefault();
                  onAction();
                }
              }}
              className="inline-flex items-center justify-center px-8 py-4 bg-primary text-on-primary rounded-md font-label text-xs tracking-widest uppercase font-bold hover:opacity-90 transition-all shadow-[0_15px_30px_-5px_rgba(144,75,54,0.3)]"
            >
              {actionLabel}
            </a>
          )}
        </div>

        {/* Footer bar */}
        {footerLabel && (
          <div className="px-12 py-6 flex items-center justify-between text-on-surface-variant/40">
            <span className="text-[10px] tracking-widest uppercase">
              {footerLabel}
            </span>
            <span className="material-symbols-outlined text-sm">terminal</span>
          </div>
        )}
      </div>

      {/* Decorative glow */}
      <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-primary/10 rounded-full blur-2xl z-0" />
    </div>
  );
}
