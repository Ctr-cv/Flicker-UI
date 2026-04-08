import { useEffect, useRef } from "react";
import { HeroBadge } from "@/components/ui/HeroBadge";
import { ModuleCard } from "@/components/ui/ModuleCard";
import { useGestureStore } from "@/stores/gestureStore";
import { useCamera } from "@/hooks/useCamera.ts";

export function MotionPage() {
  const currentGesture = useGestureStore((s) => s.currentGesture);
  const gestureHistory = useGestureStore((s) => s.gestureHistory);
  const cameraActive = useGestureStore((s) => s.cameraActive);
  const setCameraActive = useGestureStore((s) => s.setCameraActive);

  // Handle camera hook logics here
  const { streamRef } = useCamera(30);

  // 2. Create a ref for the HTML video element
  const videoRef = useRef<HTMLVideoElement>(null);

  // 3. Bind the camera stream to the video element
  useEffect(() => {
    let checkStreamInterval: number;

    if (cameraActive) {
      // Because accessing the camera is asynchronous, streamRef.current won't be
      // instantly available. We poll briefly until it is, then attach it.
      checkStreamInterval = setInterval(() => {
        if (
          videoRef.current &&
          streamRef.current &&
          videoRef.current.srcObject !== streamRef.current
        ) {
          videoRef.current.srcObject = streamRef.current;
        }
      }, 100);
    } else {
      // Clear the video source when stopped
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    }

    return () => clearInterval(checkStreamInterval);
  }, [cameraActive, streamRef]);

  return (
    <section className="pt-36 px-20 pb-40 max-w-7xl">
      <div className="space-y-4 mb-20">
        <HeroBadge label="Motion Capture" />
        <h1 className="font-headline text-6xl font-extrabold tracking-tighter leading-none text-on-surface">
          Motion Mapping
        </h1>
        <p className="max-w-lg font-body text-lg text-on-surface-variant leading-relaxed">
          Real-time hand gesture recognition pipeline. Enable camera input to
          begin streaming gesture frames to the inference engine.
        </p>
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Camera feed area */}
        <div className="col-span-12 md:col-span-7">
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/10 overflow-hidden shadow-[0_40px_60px_-15px_rgba(28,28,25,0.06)]">
            {/* Video viewport */}
            <div className="aspect-video bg-surface-container flex items-center justify-center relative overflow-hidden">

              {/* The actual video element (hidden when inactive to show placeholder) */}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
                  cameraActive ? "opacity-100" : "opacity-0"
                }`}
              />

              {/* Inactive Placeholder */}
              {!cameraActive && (
                <div className="text-center space-y-4 relative z-10">
                  <span className="material-symbols-outlined text-on-surface-variant/30 text-6xl">
                    videocam_off
                  </span>
                  <p className="text-sm text-on-surface-variant/50">
                    Camera inactive
                  </p>
                </div>
              )}
            </div>

            {/* Controls bar */}
            <div className="px-8 py-5 flex items-center justify-between border-t border-outline-variant/10">
              <div className="flex items-center gap-3">
                <span
                  className={`w-2 h-2 rounded-full ${
                    cameraActive ? "bg-green-500 animate-pulse" : "bg-outline/30"
                  }`}
                />
                <span className="text-[10px] uppercase tracking-widest text-on-surface-variant">
                  {cameraActive ? "Streaming" : "Standby"}
                </span>
              </div>
              <button
                onClick={() => setCameraActive(!cameraActive)}
                className={`px-6 py-3 rounded-md font-label text-xs tracking-widest uppercase font-bold transition-all ${
                  cameraActive
                    ? "bg-error text-on-error shadow-[0_10px_20px_-5px_rgba(186,26,26,0.3)]"
                    : "bg-primary text-on-primary shadow-[0_10px_20px_-5px_rgba(144,75,54,0.3)]"
                }`}
              >
                {cameraActive ? "Stop Capture" : "Start Capture"}
              </button>
            </div>
          </div>
        </div>

        {/* Live results panel */}
        <div className="col-span-12 md:col-span-5 space-y-6">
          <ModuleCard
            icon="insights"
            title="Live Detection"
            description="Current gesture classification from the inference engine."
          >
            <div className="bg-surface-container rounded-lg p-6 space-y-4">
              <div className="flex justify-between items-baseline">
                <span className="text-[10px] uppercase text-outline tracking-tighter">
                  Gesture
                </span>
                <span className="font-headline text-2xl font-bold text-primary">
                  {currentGesture?.label ?? "---"}
                </span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-[10px] uppercase text-outline tracking-tighter">
                  Confidence
                </span>
                <span className="font-headline text-lg font-bold">
                  {currentGesture
                    ? `${(currentGesture.confidence * 100).toFixed(1)}%`
                    : "---"}
                </span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-[10px] uppercase text-outline tracking-tighter">
                  Latency
                </span>
                <span className="font-headline text-lg font-bold">
                  {currentGesture
                    ? `${currentGesture.latency.toFixed(2)}ms`
                    : "---"}
                </span>
              </div>
            </div>
          </ModuleCard>

          {/* History */}
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/10 p-6">
            <h4 className="font-headline text-sm font-bold uppercase tracking-wider mb-4 text-on-surface-variant">
              Recent History
            </h4>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {gestureHistory.length === 0 ? (
                <p className="text-xs text-on-surface-variant/40 text-center py-4">
                  No gestures recorded yet
                </p>
              ) : (
                gestureHistory.slice(0, 10).map((g, i) => (
                  <div
                    key={`${g.timestamp}-${i}`}
                    className="flex justify-between text-xs text-on-surface-variant py-1 border-b border-outline-variant/5 last:border-0"
                  >
                    <span className="font-semibold">{g.label}</span>
                    <span>{(g.confidence * 100).toFixed(0)}%</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
