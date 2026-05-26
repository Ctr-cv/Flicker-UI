import { NavLink } from "react-router-dom";
import type { NavItem } from "@/types";

const NAV_ITEMS: NavItem[] = [
  { id: "intro", label: "Intro", icon: "info", path: "/intro" },
  { id: "motion", label: "Motion", icon: "gesture", path: "/motion" },
  { id: "speech", label: "Speech", icon: "graphic_eq", path: "/speech" },
  { id: "neural", label: "Neural", icon: "psychology", path: "/neural" },
  { id: "cloud", label: "Cloud", icon: "cloud_sync", path: "/cloud" },
];

export function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 h-full w-20 z-40 bg-surface-container-low shadow-[1px_0_0_0_rgba(206,197,187,0.15)] flex flex-col pt-12 pb-8">
      {/* Logo */}
      <div className="flex flex-col items-center mb-auto">
        <span className="text-lg font-bold tracking-tighter text-on-surface mb-12">
          G.
        </span>

        {/* Navigation */}
        <nav className="flex flex-col w-full gap-2">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.id}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center gap-2 py-6 transition-all duration-300 ${
                  isActive
                    ? "bg-surface-variant text-primary border-l-2 border-primary scale-95"
                    : "text-on-surface/60 hover:bg-surface-variant/50"
                }`
              }
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              <span className="font-headline tracking-tight text-xs uppercase font-semibold">
                {item.label}
              </span>
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Bottom */}
      <div className="flex flex-col items-center gap-6 opacity-30">
        <span className="material-symbols-outlined text-sm">more_vert</span>
      </div>
    </aside>
  );
}
