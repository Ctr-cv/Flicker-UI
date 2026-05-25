import { useEffect, useRef } from "react";
import { HeroBadge } from "@/components/ui/HeroBadge";
import { ModuleCard } from "@/components/ui/ModuleCard";
import { useSpeechStore } from "@/stores/speechStore";
import { useSpeech } from "@/hooks/useSpeech";
import { speechWs } from "@/services/websocket";

export function AudioPage() {
  const currentSpeech = useSpeechStore((s) => s.currentSpeech);
  const speechHistory = useSpeechStore((s) => s.speechHistory);
  const captureActive = useSpeechStore((s) => s.captureActive);
  const captureError = useSpeechStore((s) => s.captureError);
  const setCaptureActive = useSpeechStore((s) => s.setCaptureActive);
  const setConnected = useSpeechStore((s) => s.setConnected);
  const pushSpeech = useSpeechStore((s) => s.pushSpeech);

  const { bindPreviewVideoElement } = useSpeech();

  const disconnectTimeoutRef = useRef(0);

  // Manage speech WebSocket lifecycle
  useEffect(() => {
    if (disconnectTimeoutRef.current) {
      clearTimeout(disconnectTimeoutRef.current);
    }
    speechWs.onConnectionChange = setConnected;
    speechWs.connect();

    const unsub = speechWs.onSpeechResult((result) => {
      pushSpeech(result);
    });

    return () => {
      unsub();
      disconnectTimeoutRef.current = setTimeout(() => {
        speechWs.disconnect();
      }, 200);
    };
  }, [setConnected, pushSpeech]);

  return (
    <section className="pt-36 px-20 pb-40 max-w-7xl">
      <div className="space-y-4 mb-20">
        <HeroBadge label="Silent Speech" />
        <h1 className="font-headline text-6xl font-extrabold tracking-tighter leading-none text-on-surface">
          Audio Response
        </h1>
        <p className="max-w-lg font-body text-lg text-on-surface-variant leading-relaxed">
          Visual lip-reading engine. Enable camera input to capture mouth
          movements and translate them to words or commands in real time.
        </p>
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Camera feed area */}
        <div className="col-span-12 md:col-span-7">
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/10 overflow-hidden shadow-[0_40px_60px_-15px_rgba(28,28,25,0.06)]">
            {/* Video viewport */}
            <div className="aspect-video bg-surface-container flex items-center justify-center relative overflow-hidden">
              <video
                ref={bindPreviewVideoElement}
                autoPlay
                playsInline
                muted
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 -scale-x-100 ${
                  captureActive ? "opacity-100" : "opacity-0"
                }`}
              />

              {!captureActive && (
                <div className="text-center space-y-4 relative z-10">
                  <span className="material-symbols-outlined text-on-surface-variant/30 text-6xl">
                    face
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
                    captureActive ? "bg-green-500 animate-pulse" : "bg-outline/30"
                  }`}
                />
                <span className="text-[10px] uppercase tracking-widest text-on-surface-variant">
                  {captureActive ? "Streaming" : "Standby"}
                </span>
              </div>
              <button
                onClick={() => setCaptureActive(!captureActive)}
                className={`px-6 py-3 rounded-md font-label text-xs tracking-widest uppercase font-bold transition-all ${
                  captureActive
                    ? "bg-error text-on-error shadow-[0_10px_20px_-5px_rgba(186,26,26,0.3)]"
                    : "bg-primary text-on-primary shadow-[0_10px_20px_-5px_rgba(144,75,54,0.3)]"
                }`}
              >
                {captureActive ? "Stop Capture" : "Start Capture"}
              </button>
            </div>
            {captureError && (
              <div className="px-8 pb-5 text-xs text-error">{captureError}</div>
            )}
          </div>
        </div>

        {/* Live results panel */}
        <div className="col-span-12 md:col-span-5 space-y-6">
          <ModuleCard
            icon="psychology"
            title="Live Detection"
            description="Current word or command classified from the lip-reading engine."
          >
            <div className="bg-surface-container rounded-lg p-6 space-y-4">
              <div className="flex justify-between items-baseline">
                <span className="text-[10px] uppercase text-outline tracking-tighter">
                  Word
                </span>
                <span className="font-headline text-2xl font-bold text-primary">
                  {currentSpeech?.word ?? "---"}
                </span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-[10px] uppercase text-outline tracking-tighter">
                  Confidence
                </span>
                <span className="font-headline text-lg font-bold">
                  {currentSpeech
                    ? `${(currentSpeech.confidence * 100).toFixed(1)}%`
                    : "---"}
                </span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-[10px] uppercase text-outline tracking-tighter">
                  Latency
                </span>
                <span className="font-headline text-lg font-bold">
                  {currentSpeech
                    ? `${currentSpeech.latency.toFixed(2)}ms`
                    : "---"}
                </span>
              </div>
            </div>
          </ModuleCard>

          {/* History */}
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/10 p-6">
            <h4 className="font-headline text-sm font-bold uppercase tracking-wider mb-4 text-on-surface-variant">
              Recent Words
            </h4>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {speechHistory.length === 0 ? (
                <p className="text-xs text-on-surface-variant/40 text-center py-4">
                  No words recognized yet
                </p>
              ) : (
                speechHistory.slice(0, 10).map((s, i) => (
                  <div
                    key={`${s.timestamp}-${i}`}
                    className="flex justify-between text-xs text-on-surface-variant py-1 border-b border-outline-variant/5 last:border-0"
                  >
                    <span className="font-semibold">{s.word}</span>
                    <span>{(s.confidence * 100).toFixed(0)}%</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Status note */}
      <div className="mt-16 p-8 bg-surface-variant/30 rounded-xl border border-outline-variant/10">
        <div className="flex items-center gap-4">
          <span className="material-symbols-outlined text-primary">
            psychology
          </span>
          <div>
            <h4 className="font-headline text-sm font-bold uppercase tracking-wider text-on-surface-variant">
              Silent Speech Engine
            </h4>
            <p className="text-sm text-on-surface-variant/60 mt-1">
              Visual lip-reading powered by MediaPipe Face Landmarker.
              Mouth movements are captured, normalized, and streamed to
              the backend speech model engine for word classification.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
