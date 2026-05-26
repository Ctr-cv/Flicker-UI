import { describe, it, expect } from "vitest";
import { useSpeechStore } from "@/stores/speechStore";

function createResult(word: string, confidence: number) {
  return { word, confidence, latency: 2.5, timestamp: Date.now() };
}

describe("useSpeechStore", () => {
  it("initializes with sensible defaults", () => {
    const state = useSpeechStore.getState();
    expect(state.connected).toBe(false);
    expect(state.currentSpeech).toBeNull();
    expect(state.speechHistory).toEqual([]);
    expect(state.captureActive).toBe(false);
    expect(state.captureError).toBeNull();
    expect(state.landmarkerReady).toBe(false);
  });

  it("pushSpeech updates current speech and prepends to history", () => {
    const store = useSpeechStore.getState;
    useSpeechStore.setState({ currentSpeech: null, speechHistory: [] });

    useSpeechStore.getState().pushSpeech(createResult("YES", 0.9));
    let state = store();
    expect(state.currentSpeech?.word).toBe("YES");
    expect(state.currentSpeech?.confidence).toBe(0.9);
    expect(state.speechHistory.length).toBe(1);

    useSpeechStore.getState().pushSpeech(createResult("NO", 0.8));
    state = store();
    expect(state.currentSpeech?.word).toBe("NO");
    expect(state.speechHistory.length).toBe(2);
    expect(state.speechHistory[0].word).toBe("NO");
    expect(state.speechHistory[1].word).toBe("YES");
  });

  it("clearHistory resets speech data", () => {
    useSpeechStore.setState({ currentSpeech: null, speechHistory: [] });
    useSpeechStore.getState().pushSpeech(createResult("HELP", 0.7));
    useSpeechStore.getState().pushSpeech(createResult("STOP", 0.85));

    useSpeechStore.getState().clearHistory();
    const state = useSpeechStore.getState();
    expect(state.currentSpeech).toBeNull();
    expect(state.speechHistory).toEqual([]);
  });

  it("captureActive toggles correctly", () => {
    useSpeechStore.setState({ captureActive: false });
    useSpeechStore.getState().setCaptureActive(true);
    expect(useSpeechStore.getState().captureActive).toBe(true);

    useSpeechStore.getState().setCaptureActive(false);
    expect(useSpeechStore.getState().captureActive).toBe(false);
  });

  it("setLandmarkerReady works", () => {
    useSpeechStore.setState({ landmarkerReady: false });
    useSpeechStore.getState().setLandmarkerReady(true);
    expect(useSpeechStore.getState().landmarkerReady).toBe(true);
  });

  it("captureError lifecycle", () => {
    useSpeechStore.setState({ captureError: null });
    useSpeechStore.getState().setCaptureError("Camera denied");
    expect(useSpeechStore.getState().captureError).toBe("Camera denied");

    useSpeechStore.getState().clearCaptureError();
    expect(useSpeechStore.getState().captureError).toBeNull();
  });

  it("history capped at MAX_HISTORY", () => {
    useSpeechStore.setState({ currentSpeech: null, speechHistory: [] });
    const push = useSpeechStore.getState().pushSpeech;
    for (let i = 0; i < 250; i++) {
      push(createResult(`word_${i}`, 0.5));
    }
    expect(useSpeechStore.getState().speechHistory.length).toBe(200);
  });
});
