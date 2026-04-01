import { HeroBadge } from "@/components/ui/HeroBadge";
import { StatPanel } from "@/components/ui/StatPanel";
import { ModuleCard } from "@/components/ui/ModuleCard";
import { useGestureStore } from "@/stores/gestureStore";

export function NeuralPage() {
  const systemStatus = useGestureStore((s) => s.systemStatus);

  return (
    <section className="pt-36 px-20 pb-40 max-w-7xl">
      <div className="space-y-4 mb-20">
        <HeroBadge label="Neural Core" />
        <h1 className="font-headline text-6xl font-extrabold tracking-tighter leading-none text-on-surface">
          Neural Engine
        </h1>
        <p className="max-w-lg font-body text-lg text-on-surface-variant leading-relaxed">
          Core inference pipeline configuration. Monitor model performance,
          adjust inference parameters, and manage the neural processing
          backbone.
        </p>
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Model status */}
        <div className="col-span-12 md:col-span-6">
          <StatPanel
            title="Model Status"
            badge={systemStatus?.modelLoaded ? "Loaded" : "Offline"}
            label="Version"
            value={systemStatus?.version ?? "---"}
            description="Your lightweight gesture model running as a local Python module. Inference is handled server-side via FastAPI with results streamed over WebSocket."
            actionLabel="Reload Model"
            footerLabel="Model Diagnostics"
          />
        </div>

        {/* Modality list */}
        <div className="col-span-12 md:col-span-6 space-y-6">
          <ModuleCard
            icon="psychology"
            title="Active Modalities"
            description="Input/output channels currently registered with the neural engine."
          >
            <div className="space-y-3">
              {(
                systemStatus?.modalities ?? [
                  { type: "gesture", active: true, latency: 0.002, fidelity: 0.999 },
                  { type: "haptics", active: false, latency: 0, fidelity: 0 },
                  { type: "audio", active: false, latency: 0, fidelity: 0 },
                ]
              ).map((m) => (
                <div
                  key={m.type}
                  className="flex items-center justify-between p-4 bg-surface-container rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        m.active ? "bg-green-500" : "bg-outline/30"
                      }`}
                    />
                    <span className="font-headline text-sm font-bold uppercase tracking-wider">
                      {m.type}
                    </span>
                  </div>
                  <div className="flex gap-6 text-[10px] uppercase tracking-wider text-on-surface-variant">
                    <span>
                      {m.active
                        ? `${m.latency.toFixed(3)}ms`
                        : "---"}
                    </span>
                    <span>
                      {m.active
                        ? `${(m.fidelity * 100).toFixed(1)}%`
                        : "---"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </ModuleCard>

          <ModuleCard
            icon="tune"
            title="Inference Config"
            description="Adjust batch size, confidence thresholds, and preprocessing parameters for your model."
            actionLabel="Open Settings"
          />
        </div>
      </div>
    </section>
  );
}
