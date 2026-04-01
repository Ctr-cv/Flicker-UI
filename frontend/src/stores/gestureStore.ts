import { create } from "zustand";
import type { GestureResult, ModalityStatus, SystemStatus } from "@/types";

interface GestureState {
  /* ── Connection ─────────────────────────────────────── */
  connected: boolean;
  setConnected: (v: boolean) => void;

  /* ── Live gesture data ──────────────────────────────── */
  currentGesture: GestureResult | null;
  gestureHistory: GestureResult[];
  pushGesture: (result: GestureResult) => void;
  clearHistory: () => void;

  /* ── Modality statuses ──────────────────────────────── */
  modalities: ModalityStatus[];
  setModalities: (m: ModalityStatus[]) => void;

  /* ── System ─────────────────────────────────────────── */
  systemStatus: SystemStatus | null;
  setSystemStatus: (s: SystemStatus) => void;

  /* ── Camera ─────────────────────────────────────────── */
  cameraActive: boolean;
  setCameraActive: (v: boolean) => void;
}

const MAX_HISTORY = 200;

export const useGestureStore = create<GestureState>((set) => ({
  connected: false,
  setConnected: (v) => set({ connected: v }),

  currentGesture: null,
  gestureHistory: [],
  pushGesture: (result) =>
    set((state) => ({
      currentGesture: result,
      gestureHistory: [result, ...state.gestureHistory].slice(0, MAX_HISTORY),
    })),
  clearHistory: () => set({ gestureHistory: [], currentGesture: null }),

  modalities: [],
  setModalities: (m) => set({ modalities: m }),

  systemStatus: null,
  setSystemStatus: (s) => set({ systemStatus: s }),

  cameraActive: false,
  setCameraActive: (v) => set({ cameraActive: v }),
}));
