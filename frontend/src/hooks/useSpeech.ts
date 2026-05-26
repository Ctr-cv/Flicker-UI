import { useRef, useEffect, useCallback } from "react";
import { speechWs } from "@/services/websocket";
import { useSpeechStore } from "@/stores/speechStore";
import { FilesetResolver, FaceLandmarker } from "@mediapipe/tasks-vision";

/**
 * Hook that manages camera access and lip landmark capture for silent speech.
 * When active, captures frames, extracts lip landmarks via MediaPipe
 * Face Landmarker, and sends them to the backend via WebSocket.
 */

const TARGET_FPS = 30;
const DEBUG_SPEECH = false;

/** MediaPipe Face Mesh indices covering outer + inner lip contours (~40 points). */
const LIP_INDICES = [
  61, 185, 40, 39, 37, 0, 267, 269, 270, 409,
  146, 91, 181, 84, 17, 314, 405, 321, 375,
  78, 191, 80, 81, 82, 13, 312, 311, 310, 415,
  308, 324, 318, 402, 317, 14, 87, 178, 88, 95,
];

export function useSpeech() {
  const captureActive = useSpeechStore((s) => s.captureActive);
  const setCaptureError = useSpeechStore((s) => s.setCaptureError);
  const clearCaptureError = useSpeechStore((s) => s.clearCaptureError);
  const setLandmarkerReady = useSpeechStore((s) => s.setLandmarkerReady);
  const streamRef = useRef<MediaStream | null>(null);
  const previewVideoRef = useRef<HTMLVideoElement | null>(null);

  const landmarkerRef = useRef<FaceLandmarker | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const requestRef = useRef<number | null>(null);
  const lastVideoTimeRef = useRef<number>(-1);
  const lastProcessTimeRef = useRef<number>(0);
  const detectErrorReportedRef = useRef(false);

  useEffect(() => {
    let isMounted = true;

    FilesetResolver.forVisionTasks("/wasm")
      .then((vision) =>
        FaceLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: "/models/face_landmarker.task",
            delegate: "GPU",
          },
          runningMode: "VIDEO",
          numFaces: 1,
          outputFaceBlendshapes: false,
          outputFacialTransformationMatrixes: false,
        })
      )
      .then((landmarker) => {
        if (isMounted) {
          landmarkerRef.current = landmarker;
          setLandmarkerReady(true);
          clearCaptureError();
          if (DEBUG_SPEECH) {
            console.info("[useSpeech] Face landmarker loaded.");
          }
        }
      })
      .catch((err) => {
        console.error("[useSpeech] Failed to initialize Face Landmarker:", err);
        if (isMounted) {
          setCaptureError(
            "Failed to load face tracking model. Verify /wasm and /models/face_landmarker.task assets."
          );
        }
      });

    return () => {
      isMounted = false;
      if (landmarkerRef.current) {
        landmarkerRef.current.close();
      }
    };
  }, [clearCaptureError, setCaptureError, setLandmarkerReady]);

  const processFrame = useCallback(() => {
    if (!useSpeechStore.getState().captureActive) return;
    try {
      if (!videoRef.current || !landmarkerRef.current) return;
      const now = performance.now();
      const timePast = now - lastProcessTimeRef.current;
      if (timePast > (1000 / TARGET_FPS)) {
        if (videoRef.current.currentTime !== lastVideoTimeRef.current) {
          lastVideoTimeRef.current = videoRef.current.currentTime;
          lastProcessTimeRef.current = now;

          const results = landmarkerRef.current.detectForVideo(videoRef.current, now);
          if (results.faceLandmarks && results.faceLandmarks.length > 0) {
            const faceLandmarks = results.faceLandmarks[0];
            const lipLandmarks: number[][] = LIP_INDICES.map((i) => [
              faceLandmarks[i].x,
              faceLandmarks[i].y,
              faceLandmarks[i].z,
            ]);
            if (DEBUG_SPEECH) {
              console.debug(`[useSpeech] Sending ${lipLandmarks.length} lip landmarks.`);
            }
            if (speechWs.connected) {
              speechWs.sendFrame(lipLandmarks);
            }
          }
        }
      }
      detectErrorReportedRef.current = false;
    } catch (err) {
      if (!detectErrorReportedRef.current) {
        console.error("[useSpeech] Face detection loop failed:", err);
        detectErrorReportedRef.current = true;
      }
      setCaptureError("Face tracking failed during capture.");
    } finally {
      requestRef.current = requestAnimationFrame(processFrame);
    }
  }, [setCaptureError]);

  const startCapture = useCallback(async () => {
    clearCaptureError();
    if (DEBUG_SPEECH) {
      console.info("[useSpeech] Starting camera capture.");
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 640, height: 480 },
      });
      streamRef.current = stream;
      if (previewVideoRef.current) {
        previewVideoRef.current.srcObject = stream;
      }
      if (!videoRef.current) {
        videoRef.current = document.createElement("video");
        videoRef.current.playsInline = true;
        videoRef.current.muted = true;
      }
      videoRef.current.srcObject = stream;

      videoRef.current.onloadeddata = () => {
        videoRef.current?.play().catch((err) => {
          console.error("[useSpeech] Failed to play internal video stream:", err);
          setCaptureError("Camera stream started but preview playback failed.");
        });
        processFrame();
      };
    } catch (err) {
      console.error("[useSpeech] Failed to access camera:", err);
      setCaptureError("Failed to access camera. Check browser permissions.");
    }
  }, [clearCaptureError, processFrame, setCaptureError]);

  const stopCapture = useCallback(() => {
    if (requestRef.current) {
      cancelAnimationFrame(requestRef.current);
      requestRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.pause();
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
    if (captureActive) {
      startCapture();
    } else {
      stopCapture();
    }
    return stopCapture;
  }, [captureActive, startCapture, stopCapture]);

  return { streamRef, bindPreviewVideoElement };
}
