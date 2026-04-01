import { useThemeStore } from "@/stores/themeStore";
import { useGestureStore } from "@/stores/gestureStore";

export function TopBar() {
  const { theme, toggle } = useThemeStore();
  const connected = useGestureStore((s) => s.connected);

  return (
    <header className="fixed top-0 right-0 w-[calc(100%-5rem)] z-50 border-b border-outline-variant/10 bg-transparent backdrop-blur-sm flex justify-between items-center h-12 px-8">
      {/* Connection status */}
      <div className="flex items-center gap-3">
        <span
          className={`inline-block w-1.5 h-1.5 rounded-full ${
            connected ? "bg-green-500" : "bg-outline/40"
          }`}
        />
        <span className="font-label text-[10px] tracking-[0.2em] uppercase text-on-surface/30">
          {connected ? "Engine Connected" : "Offline"}
        </span>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-8">
        <span className="font-label text-[10px] tracking-[0.2em] uppercase text-on-surface/30">
          v2.0 Stable Build
        </span>
        <div className="flex gap-4">
          {/* Dark mode toggle */}
          <button
            onClick={toggle}
            className="text-on-surface/60 hover:text-primary transition-colors"
            aria-label="Toggle theme"
          >
            <span className="material-symbols-outlined">
              {theme === "light" ? "dark_mode" : "light_mode"}
            </span>
          </button>
          <button className="text-on-surface/60 hover:text-primary transition-colors">
            <span className="material-symbols-outlined">settings</span>
          </button>
          <button className="text-on-surface/60 hover:text-primary transition-colors">
            <span className="material-symbols-outlined">account_circle</span>
          </button>
        </div>
      </div>
    </header>
  );
}
