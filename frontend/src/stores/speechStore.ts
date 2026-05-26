import { create } from "zustand";
import type { SpeechResult } from "@/types";

interface SpeechState {
  /* ── Connection ─────────────────────────────────────── */
  connected: boolean;
  setConnected: (v: boolean) => void;

  /* ── Live speech data ───────────────────────────────── */
  currentSpeech: SpeechResult | null;
  speechHistory: SpeechResult[];
  pushSpeech: (result: SpeechResult) => void;
  clearHistory: () => void;

  /* ── Camera ─────────────────────────────────────────── */
  captureActive: boolean;
  setCaptureActive: (v: boolean) => void;
  captureError: string | null;
  setCaptureError: (message: string) => void;
  clearCaptureError: () => void;

  /* ── MediaPipe status ───────────────────────────────── */
  landmarkerReady: boolean;
  setLandmarkerReady: (v: boolean) => void;
}

const MAX_HISTORY = 200;

export const useSpeechStore = create<SpeechState>((set) => ({
  connected: false,
  setConnected: (v) => set({ connected: v }),

  currentSpeech: null,
  speechHistory: [],
  pushSpeech: (result) =>
    set((state) => ({
      currentSpeech: result,
      speechHistory: [result, ...state.speechHistory].slice(0, MAX_HISTORY),
    })),
  clearHistory: () => set({ speechHistory: [], currentSpeech: null }),

  captureActive: false,
  setCaptureActive: (v) => set({ captureActive: v }),
  captureError: null,
  setCaptureError: (message) => set({ captureError: message }),
  clearCaptureError: () => set({ captureError: null }),

  landmarkerReady: false,
  setLandmarkerReady: (v) => set({ landmarkerReady: v }),
}));
