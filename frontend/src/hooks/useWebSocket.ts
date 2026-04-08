import {useEffect, useRef} from "react";
import { gestureWs } from "@/services/websocket";
import { useGestureStore } from "@/stores/gestureStore";

/**
 * Hook that manages the WebSocket lifecycle.
 * Call this once at the top level (e.g., in AppLayout) to connect
 * the gesture WebSocket and pipe results into the Zustand store.
 */
export function useWebSocket() {
  const setConnected = useGestureStore((s) => s.setConnected);
  const pushGesture = useGestureStore((s) => s.pushGesture);

  const disconnectTimeoutRef = useRef(0);
  useEffect(() => {
    if (disconnectTimeoutRef.current) {
      clearTimeout(disconnectTimeoutRef.current);
    }
    gestureWs.onConnectionChange = setConnected;
    gestureWs.connect();

    const unsub = gestureWs.onGestureResult((result) => {
      pushGesture(result);
    });

    return () => {
      unsub();
      disconnectTimeoutRef.current = setTimeout(() => {
        gestureWs.disconnect();
      }, 200);
    };
  }, [setConnected, pushGesture]);
}
