import { useRef, useEffect, useCallback } from "react";
import { gestureWs } from "@/services/websocket";
import { useGestureStore } from "@/stores/gestureStore";

/**
 * Hook that manages camera access and frame capture.
 * When active, captures frames at the specified FPS and sends
 * them to the backend via WebSocket for inference.
 *
 * NOTE: Actual landmark extraction (e.g., via MediaPipe) would be
 * integrated here. For now, it captures raw video frames as a
 * placeholder — the real pipeline would extract hand landmarks
 * client-side and send only the landmark array.
 */
export function useCamera(fps = 30) {
  const cameraActive = useGestureStore((s) => s.cameraActive);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startCapture = useCallback(async () => {
    console.log("Starting Capture...")
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 640, height: 480 },
      });
      streamRef.current = stream;

      // In production: initialize MediaPipe Hands here and extract
      // landmarks per frame, then send via gestureWs.sendFrame(landmarks).
      intervalRef.current = setInterval(() => {
        // Placeholder: send empty frame to keep pipeline alive.
        // Replace with actual landmark data from MediaPipe.
        gestureWs.sendFrame([]);
      }, 1000 / fps);
    } catch (err) {
      console.error("[useCamera] Failed to access camera:", err);
    }
  }, [fps]);

  const stopCapture = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (cameraActive) {
      startCapture();
    } else {
      stopCapture();
    }
    return stopCapture;
  }, [cameraActive, startCapture, stopCapture]);

  return { streamRef };
}
