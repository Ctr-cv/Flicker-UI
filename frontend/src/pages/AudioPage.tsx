import { HeroBadge } from "@/components/ui/HeroBadge";
import { ModuleCard } from "@/components/ui/ModuleCard";

export function AudioPage() {
  return (
    <section className="pt-36 px-20 pb-40 max-w-7xl">
      <div className="space-y-4 mb-20">
        <HeroBadge label="Sonic Feedback" />
        <h1 className="font-headline text-6xl font-extrabold tracking-tighter leading-none text-on-surface">
          Audio Response
        </h1>
        <p className="max-w-lg font-body text-lg text-on-surface-variant leading-relaxed">
          Bi-directional audio feedback layer. Translate gesture recognition
          into sonic response patterns through the Web Audio API and
          connected audio devices.
        </p>
      </div>

      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-12 md:col-span-6">
          <ModuleCard
            icon="graphic_eq"
            title="Sound Patterns"
            description="Configure audio response patterns mapped to recognized gestures. Adjust tone, pitch curves, duration, and rhythmic intervals."
            actionLabel="Configure Patterns"
          >
            <div className="h-32 bg-surface-container rounded flex items-center justify-center">
              <div className="flex gap-1 items-center h-16">
                {[4, 8, 6, 12, 10, 14, 8, 11, 6, 9, 5, 3].map((h, i) => (
                  <div
                    key={i}
                    className="w-1.5 bg-primary/40 rounded-full transition-all"
                    style={{ height: `${h * 4}px` }}
                  />
                ))}
              </div>
            </div>
          </ModuleCard>
        </div>

        <div className="col-span-12 md:col-span-6">
          <ModuleCard
            icon="speaker"
            title="Device Support"
            description="Connect audio output devices including speakers, headphones, and spatial audio systems. Supports Web Audio API, MIDI output, and Bluetooth audio."
            actionLabel="Scan Devices"
          >
            <div className="h-32 bg-surface-container rounded flex items-center justify-center text-on-surface-variant/20">
              <span className="material-symbols-outlined text-5xl">
                headphones
              </span>
            </div>
          </ModuleCard>
        </div>

        <div className="col-span-12 md:col-span-6">
          <ModuleCard
            icon="motion_photos_on"
            title="Gesture Sonification"
            description="Real-time audio synthesis driven by gesture motion. Map hand velocity, position, and recognized gestures to dynamic sound parameters."
            actionLabel="Configure Mapping"
          >
            <div className="h-32 bg-surface-container rounded flex items-center justify-center gap-4">
              <span className="material-symbols-outlined text-3xl text-on-surface-variant/30">
                gesture
              </span>
              <span className="material-symbols-outlined text-xl text-on-surface-variant/20">
                arrow_forward
              </span>
              <span className="material-symbols-outlined text-3xl text-on-surface-variant/30">
                music_note
              </span>
            </div>
          </ModuleCard>
        </div>

        <div className="col-span-12 md:col-span-6">
          <ModuleCard
            icon="spatial_audio"
            title="Spatial Audio"
            description="Position audio cues in 3D space based on gesture location. Create immersive feedback experiences with Web Audio spatial positioning."
            actionLabel="Configure Spatial"
          >
            <div className="h-32 bg-surface-container rounded flex items-center justify-center text-on-surface-variant/20">
              <span className="material-symbols-outlined text-5xl">
                surround_sound
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
              Audio response integration is designed as an extension point.
              Connect your model's gesture output to audio response patterns
              via the modality service layer.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
