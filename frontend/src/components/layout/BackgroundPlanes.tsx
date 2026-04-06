interface BackgroundPlanesProps {
  page: string;
}

const pageConfigs: Record<string, { planes: { className: string }[] }> = {
  intro: {
    planes: [
      { className: "absolute top-0 right-0 w-[80%] h-[120%] bg-surface-container-low curved-plane -rotate-6 translate-x-20 -translate-y-20 opacity-50" },
      { className: "absolute bottom-0 left-0 w-[70%] h-[90%] bg-surface-container-high curved-plane rotate-12 -translate-x-20 translate-y-40" },
      { className: "absolute top-1/4 left-0 w-full h-[1px] bg-outline-variant/10 -rotate-[15deg]" },
    ],
  },
  motion: {
    planes: [
      { className: "absolute top-[-10%] left-[10%] w-[60%] h-[100%] bg-surface-container-low soft-arc rotate-3 translate-y-10 opacity-40" },
      { className: "absolute bottom-[-5%] right-0 w-[55%] h-[85%] bg-surface-container-highest diagonal-slice -rotate-[8deg] translate-x-10" },
      { className: "absolute top-1/3 right-0 w-[40%] h-[1px] bg-outline-variant/15 rotate-[25deg]" },
    ],
  },
  audio: {
    planes: [
      { className: "absolute top-[5%] right-[5%] w-[50%] h-[70%] bg-surface-container-low wedge-plane rotate-[10deg] opacity-45" },
      { className: "absolute bottom-[10%] left-[5%] w-[65%] h-[60%] bg-surface-container-high soft-arc -rotate-12 translate-x-[-10px]" },
      { className: "absolute top-1/2 left-0 w-full h-[1px] bg-outline-variant/12 rotate-[5deg]" },
    ],
  },
  neural: {
    planes: [
      { className: "absolute top-[15%] left-[20%] w-[45%] h-[55%] bg-surface-container-lowest hex-plane opacity-20" },
      { className: "absolute bottom-[0%] right-[10%] w-[60%] h-[80%] bg-surface-container-high curved-plane -rotate-[18deg] translate-y-20" },
      { className: "absolute top-[20%] right-[15%] w-[30%] h-[30%] bg-surface-container ellipse-plane opacity-30" },
      { className: "absolute top-1/3 left-0 w-full h-[1px] bg-outline-variant/8 rotate-[-10deg]" },
    ],
  },
  cloud: {
    planes: [
      { className: "absolute top-[0%] right-[0%] w-[75%] h-[100%] bg-surface-container-low soft-arc -rotate-[5deg] translate-x-10 opacity-40" },
      { className: "absolute bottom-[-10%] left-[-5%] w-[50%] h-[75%] bg-surface-container-highest wedge-plane rotate-[15deg]" },
      { className: "absolute top-[35%] left-[10%] w-[35%] h-[35%] bg-surface-container ellipse-plane opacity-25" },
      { className: "absolute top-1/4 left-0 w-full h-[1px] bg-outline-variant/12 rotate-[12deg]" },
    ],
  },
};

export function BackgroundPlanes({ page }: BackgroundPlanesProps) {
  const config = pageConfigs[page] ?? pageConfigs.intro;

  return (
    <div className="absolute inset-0 z-0 pointer-events-none">
      {config.planes.map((plane, i) => (
        <div key={`${page}-plane-${i}`} className={plane.className} />
      ))}
    </div>
  );
}
