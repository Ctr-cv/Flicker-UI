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
const DEBUG_CAMERA = false;


export function useCamera() {
  const cameraActive = useGestureStore((s) => s.cameraActive);
  const setCameraError = useGestureStore((s) => s.setCameraError);
  const clearCameraError = useGestureStore((s) => s.clearCameraError);
  const streamRef = useRef<MediaStream | null>(null);
  const previewVideoRef = useRef<HTMLVideoElement | null>(null);

  // MediaPipe & Processing Refs
  const landmarkerRef = useRef<HandLandmarker | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const requestRef = useRef<number | null>(null);
  const lastVideoTimeRef = useRef<number>(-1);
  const lastProcessTimeRef = useRef<number>(0);
  const detectErrorReportedRef = useRef(false);

  // Mount the mediapipe function exactly once
  useEffect(() => {
    let isMounted = true;
    const initMediaPipe = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks("/wasm");
        const landmarker = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: "/models/hand_landmarker.task",
            delegate: "GPU",
          },
          runningMode: "VIDEO",
          numHands: 1,
        });

        if (isMounted) {
          landmarkerRef.current = landmarker;
          clearCameraError();
          if (DEBUG_CAMERA) {
            console.info("[useCamera] Mediapipe landmarker loaded.");
          }
        }
      } catch (err) {
        console.error("[useCamera] Failed to initialize MediaPipe:", err);
        if (isMounted) {
          setCameraError(
            "Failed to load hand tracking model. Verify /wasm and /models assets."
          );
        }
      }
    };

    initMediaPipe()

    return () => {
      isMounted = false;
      if (landmarkerRef.current) {
        landmarkerRef.current.close();
      }
    }
  }, [clearCameraError, setCameraError])

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
            if (DEBUG_CAMERA) {
              console.debug(`[useCamera] Sending ${all_landmarks.length} landmarks.`);
            }
            gestureWs.sendFrame(all_landmarks);
          } else {
            gestureWs.sendFrame([]);
          }
        }
      }
      detectErrorReportedRef.current = false;
    } catch (err) {
      if (!detectErrorReportedRef.current) {
        console.error("[useCamera] Landmark detection loop failed:", err);
        detectErrorReportedRef.current = true;
      }
      setCameraError("Hand tracking failed during capture.");
    } finally {
      requestRef.current = requestAnimationFrame(processFrame);
    }
  }, [setCameraError])

  const startCapture = useCallback(async () => {
    clearCameraError();
    if (DEBUG_CAMERA) {
      console.info("[useCamera] Starting camera capture.");
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 640, height: 480 },
      });
      streamRef.current = stream;
      if (previewVideoRef.current) {
        previewVideoRef.current.srcObject = stream;
      }
      if (!videoRef.current){
        videoRef.current = document.createElement("video");
        videoRef.current.playsInline = true;
        // Mute to avoid accidental feedback loops
        videoRef.current.muted = true;
      }
      videoRef.current.srcObject = stream;

      videoRef.current.onloadeddata = () =>{
        videoRef.current?.play().catch((err) => {
          console.error("[useCamera] Failed to play internal video stream:", err);
          setCameraError("Camera stream started but preview playback failed.");
        });
        processFrame();
      };

    } catch (err) {
      console.error("[useCamera] Failed to access camera:", err);
      setCameraError("Failed to access camera. Check browser permissions.");
    }
  }, [clearCameraError, processFrame, setCameraError]);

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
    if (previewVideoRef.current) {
      previewVideoRef.current.pause();
      previewVideoRef.current.srcObject = null;
    }
  }, []);

  const bindPreviewVideoElement = useCallback((videoElement: HTMLVideoElement | null) => {
    previewVideoRef.current = videoElement;
    if (!videoElement) return;
    videoElement.srcObject = streamRef.current;
  }, []);

  useEffect(() => {
    if (cameraActive) {
      startCapture();
    } else {
      stopCapture();
    }
    return stopCapture;
  }, [cameraActive, startCapture, stopCapture]);

  return { streamRef, bindPreviewVideoElement };
}
