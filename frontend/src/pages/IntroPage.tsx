import { HeroBadge } from "@/components/ui/HeroBadge";
import { ModuleCard } from "@/components/ui/ModuleCard";
import { StatPanel } from "@/components/ui/StatPanel";
import { useNavigate } from "react-router-dom";

export function IntroPage() {
  const navigate = useNavigate();

  return (
    <>
      {/* Hero Section */}
      <section className="pt-48 px-20 max-w-7xl">
        <div className="space-y-4">
          <HeroBadge label="Biological Interface v2" />
          <h1 className="font-headline text-[10vw] font-extrabold tracking-tighter leading-none text-on-surface">
            FLICKER
            <br />
            ENGINE
          </h1>
          <div className="flex gap-12 mt-12 items-end">
            <p className="max-w-md font-body text-lg text-on-surface-variant leading-relaxed">
              A seamless gesture detection module designed to bridge the gap
              between human intent and machine execution. Precision motion,
              synthesized through neural architectural layers.
            </p>
            <div className="h-[1px] flex-grow bg-outline-variant/30 mb-4" />
          </div>
        </div>
      </section>

      {/* Module cards */}
      <section className="mt-32 px-20 pb-40 grid grid-cols-12 gap-8">
        {/* Motion Mapping Module */}
        <div className="col-span-12 md:col-span-5">
          <ModuleCard
            icon="gesture"
            title="Motion Mapping"
            description="Low-latency spatial translation that captures the subtlest articulation of the human hand in 3D space."
            actionLabel="Initialize Sequence"
            onAction={() => navigate("/motion")}
          >
            <div className="h-48 w-full bg-surface-container rounded overflow-hidden">
              <div className="w-full h-full flex items-center justify-center text-on-surface-variant/20">
                <span className="material-symbols-outlined text-6xl">
                  gesture
                </span>
              </div>
            </div>
          </ModuleCard>
        </div>

        {/* Neural Link Module */}
        <div className="col-span-12 md:col-span-6 md:col-start-7 mt-20">
          <StatPanel
            title="Neural Link"
            subtitle="active"
            badge="Active Sync"
            label="Latency"
            value="0.002ms"
            description="Predictive intent modeling using proprietary Gestalt neural layers. The engine anticipates movement before it reaches full extension."
            actionLabel="Configure Core"
            onAction={() => navigate("/neural")}
            footerLabel="System Diagnostic Ready"
          />
        </div>
      </section>
    </>
  );
}
