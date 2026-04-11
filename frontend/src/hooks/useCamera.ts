import { useRef, useEffect, useCallback } from "react";
import { gestureWs } from "@/services/websocket";
import { useGestureStore } from "@/stores/gestureStore";
import { FilesetResolver, HandLandmarker } from "@mediapipe/tasks-vision";

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

const TARGET_FPS = 30;


export function useCamera() {
  const cameraActive = useGestureStore((s) => s.cameraActive);
  const streamRef = useRef<MediaStream | null>(null);

  // MediaPipe & Processing Refs
  const landmarkerRef = useRef<HandLandmarker | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const requestRef = useRef<number | null>(null);
  const lastVideoTimeRef = useRef<number>(-1);
  const lastProcessTimeRef = useRef<number>(0);

  // Mount the mediapipe function exactly once
  useEffect(() => {
    let isMounted = true;
    const initMediaPipe = async () => {
      const vision = await FilesetResolver.forVisionTasks(
        "/wasm"
      );
      const landmarker = await HandLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: "/models/hand_landmarker.task",
          delegate: "GPU",
        },
        runningMode: "VIDEO",
        numHands: 1,
      });

      if (isMounted){
        landmarkerRef.current = landmarker
        console.log("Mediapipe landmarker loaded successfully!")
      }
    };

    initMediaPipe()

    return () => {
      isMounted = false;
      if (landmarkerRef.current) {
        landmarkerRef.current.close();
      }
    }
  }, [])

  // Helper to process frames
  const processFrame = useCallback(() => {
    // needs both video and landmarker setup to process
    try {
      if (!videoRef.current || !landmarkerRef.current) return
      // Match the exact fps using lastVideoTimeRef and lastProcessTimeRef
      const now = performance.now()
      const timePast = now - lastProcessTimeRef.current
      if (timePast > (1000 / TARGET_FPS)) {
        // check if video frame is updated
        if (videoRef.current.currentTime !== lastVideoTimeRef.current) {
          lastVideoTimeRef.current = videoRef.current.currentTime;
          lastProcessTimeRef.current = now

          const results = landmarkerRef.current.detectForVideo(videoRef.current, now);
          if (results.landmarks && results.landmarks.length > 0) {
            let confidence = -1
            if (results.handedness) confidence = results.handedness[0][0].score
            if (confidence < 0.9) return

            // Extract all 21 landmarks for the first detected hand
            const handLandmarks = results.landmarks[0];
            const all_landmarks: number[][] = handLandmarks.map((landmark) => [
              landmark.x,
              landmark.y,
              landmark.z,
            ]);
            console.log(`Landmark Array length: ${all_landmarks.length}.`)
            gestureWs.sendFrame(all_landmarks);
          } else {
            gestureWs.sendFrame([]);
          }
        }
      }
    } finally {
      requestRef.current = requestAnimationFrame(processFrame);
    }
  }, [])

  const startCapture = useCallback(async () => {
    console.log("Starting Capture...")
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 640, height: 480 },
      });
      streamRef.current = stream;
      if (!videoRef.current){
        videoRef.current = document.createElement("video");
        videoRef.current.playsInline = true;
        // Mute to avoid accidental feedback loops
        videoRef.current.muted = true;
      }
      videoRef.current.srcObject = stream;

      videoRef.current.onloadeddata = () =>{
        videoRef.current?.play();
        processFrame();
      };

    } catch (err) {
      console.error("[useCamera] Failed to access camera:", err);
    }
  }, [processFrame]);

  const stopCapture = useCallback(() => {
    if (requestRef.current){
      cancelAnimationFrame(requestRef.current);
      requestRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current){
      videoRef.current.pause()
      videoRef.current.srcObject = null;
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
