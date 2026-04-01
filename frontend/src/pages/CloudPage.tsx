import { HeroBadge } from "@/components/ui/HeroBadge";
import { ModuleCard } from "@/components/ui/ModuleCard";

export function CloudPage() {
  return (
    <section className="pt-36 px-20 pb-40 max-w-7xl">
      <div className="space-y-4 mb-20">
        <HeroBadge label="Cloud Sync" />
        <h1 className="font-headline text-6xl font-extrabold tracking-tighter leading-none text-on-surface">
          Cloud Infrastructure
        </h1>
        <p className="max-w-lg font-body text-lg text-on-surface-variant leading-relaxed">
          Synchronize gesture logs, model checkpoints, and configuration across
          distributed nodes. Optional cloud offloading for heavier inference
          workloads.
        </p>
      </div>

      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-12 md:col-span-6">
          <ModuleCard
            icon="cloud_upload"
            title="Data Sync"
            description="Push gesture recognition logs and session data to remote storage. Enable cross-device continuity for your recognition pipeline."
            actionLabel="Configure Sync"
          >
            <div className="h-32 bg-surface-container rounded flex items-center justify-center">
              <div className="flex items-center gap-3 text-on-surface-variant/20">
                <span className="material-symbols-outlined text-4xl">
                  cloud_off
                </span>
                <span className="text-xs uppercase tracking-widest">
                  Not Connected
                </span>
              </div>
            </div>
          </ModuleCard>
        </div>

        <div className="col-span-12 md:col-span-6">
          <ModuleCard
            icon="model_training"
            title="Remote Inference"
            description="Offload heavy computation to cloud GPU nodes when local inference is insufficient. Automatic fallback to local model on network interruption."
            actionLabel="Setup Endpoint"
          >
            <div className="h-32 bg-surface-container rounded flex items-center justify-center text-on-surface-variant/20">
              <span className="material-symbols-outlined text-5xl">dns</span>
            </div>
          </ModuleCard>
        </div>

        <div className="col-span-12 md:col-span-6">
          <ModuleCard
            icon="backup"
            title="Model Checkpoints"
            description="Version and store model weights remotely. Roll back to previous checkpoints or deploy updated models across all connected clients."
            actionLabel="Manage Versions"
          />
        </div>

        <div className="col-span-12 md:col-span-6">
          <ModuleCard
            icon="monitoring"
            title="Telemetry"
            description="Aggregate performance metrics from all connected engines. Monitor latency distributions, recognition accuracy, and system health."
            actionLabel="View Dashboard"
          />
        </div>
      </div>
    </section>
  );
}
