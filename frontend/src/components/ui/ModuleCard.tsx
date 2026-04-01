import type { ReactNode } from "react";

interface ModuleCardProps {
  icon: string;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  children?: ReactNode;
}

/**
 * Reusable card matching the "Motion Mapping" style from the design.
 * White surface with subtle shadow, corner shape, and primary accent icon.
 */
export function ModuleCard({
  icon,
  title,
  description,
  actionLabel = "Initialize Sequence",
  onAction,
  children,
}: ModuleCardProps) {
  return (
    <div className="relative group">
      {/* Hover glow */}
      <div className="absolute inset-0 bg-primary/5 blur-3xl rounded-full scale-110 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />

      <div className="relative bg-surface-container-lowest p-10 rounded-xl shadow-[0_40px_60px_-15px_rgba(28,28,25,0.06)] overflow-hidden border border-outline-variant/10">
        {/* Corner accent shape */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-surface-container-low rounded-bl-[100%] z-0" />

        <div className="relative z-10">
          <span className="material-symbols-outlined text-primary mb-6 block">
            {icon}
          </span>
          <h3 className="font-headline text-2xl font-bold mb-4">{title}</h3>
          <p className="font-body text-sm text-on-surface-variant mb-8 leading-relaxed">
            {description}
          </p>

          {onAction && (
            <button
              onClick={onAction}
              className="group/btn flex items-center gap-2 text-primary font-label text-xs tracking-widest uppercase font-bold"
            >
              {actionLabel}
              <span className="material-symbols-outlined text-sm group-hover/btn:translate-x-1 transition-transform">
                arrow_forward
              </span>
            </button>
          )}
        </div>

        {/* Optional slot for visualizations, images, etc. */}
        {children && <div className="mt-12">{children}</div>}
      </div>
    </div>
  );
}
