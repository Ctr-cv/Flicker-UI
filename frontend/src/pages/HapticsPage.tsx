import { HeroBadge } from "@/components/ui/HeroBadge";
import { ModuleCard } from "@/components/ui/ModuleCard";

export function HapticsPage() {
  return (
    <section className="pt-36 px-20 pb-40 max-w-7xl">
      <div className="space-y-4 mb-20">
        <HeroBadge label="Tactile Feedback" />
        <h1 className="font-headline text-6xl font-extrabold tracking-tighter leading-none text-on-surface">
          Haptic Response
        </h1>
        <p className="max-w-lg font-body text-lg text-on-surface-variant leading-relaxed">
          Bi-directional haptic feedback layer. Translate gesture recognition
          into tactile response patterns through the Web Vibration API and
          connected peripherals.
        </p>
      </div>

      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-12 md:col-span-6">
          <ModuleCard
            icon="vibration"
            title="Vibration Patterns"
            description="Configure haptic response patterns mapped to recognized gestures. Adjust intensity curves, duration, and pulse intervals."
            actionLabel="Configure Patterns"
          >
            <div className="h-32 bg-surface-container rounded flex items-center justify-center">
              <div className="flex gap-1 items-end h-16">
                {[3, 5, 8, 12, 8, 5, 3, 6, 10, 7, 4, 2].map((h, i) => (
                  <div
                    key={i}
                    className="w-2 bg-primary/30 rounded-t transition-all"
                    style={{ height: `${h * 4}px` }}
                  />
                ))}
              </div>
            </div>
          </ModuleCard>
        </div>

        <div className="col-span-12 md:col-span-6">
          <ModuleCard
            icon="touch_app"
            title="Device Mapping"
            description="Connect and map physical haptic devices. Supports Web Bluetooth and USB HID protocols for peripheral integration."
            actionLabel="Scan Devices"
          >
            <div className="h-32 bg-surface-container rounded flex items-center justify-center text-on-surface-variant/20">
              <span className="material-symbols-outlined text-5xl">
                devices
              </span>
            </div>
          </ModuleCard>
        </div>
      </div>

      {/* Status note */}
      <div className="mt-16 p-8 bg-surface-variant/30 rounded-xl border border-outline-variant/10">
        <div className="flex items-center gap-4">
          <span className="material-symbols-outlined text-primary">
            engineering
          </span>
          <div>
            <h4 className="font-headline text-sm font-bold uppercase tracking-wider text-on-surface-variant">
              Module In Development
            </h4>
            <p className="text-sm text-on-surface-variant/60 mt-1">
              Haptic feedback integration is designed as an extension point.
              Connect your model's gesture output to haptic response patterns
              via the modality service layer.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
