export function Footer() {
  return (
    <footer className="relative z-10 px-20 py-12 border-t border-outline-variant/10 flex justify-between items-center bg-surface-container-low/30 backdrop-blur-md">
      <div className="flex gap-12">
        <span className="font-label text-[10px] tracking-widest uppercase text-outline">
          &copy; {new Date().getFullYear()} Flicker Systems
        </span>
        <span className="font-label text-[10px] tracking-widest uppercase text-outline">
          Berlin // Tokyo
        </span>
      </div>
      <div className="flex gap-6">
        <a
          href="#"
          className="material-symbols-outlined text-on-surface/40 hover:text-primary transition-colors"
        >
          language
        </a>
        <a
          href="#"
          className="material-symbols-outlined text-on-surface/40 hover:text-primary transition-colors"
        >
          share
        </a>
      </div>
    </footer>
  );
}
