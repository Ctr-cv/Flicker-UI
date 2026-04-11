import type { WSMessage, GestureResult } from "@/types";

type MessageHandler = (msg: WSMessage) => void;

function getDefaultGestureWsUrl() {
  if (typeof window === "undefined") {
    return "ws://localhost/ws/gesture";
  }
  const protocol = window.location.protocol === "https:" ? "wss" : "ws";
  return `${protocol}://${window.location.host}/ws/gesture`;
}

/**
 * Persistent WebSocket client for real-time gesture streaming.
 * Handles reconnection with exponential backoff.
 */
export class GestureWebSocket {
  private ws: WebSocket | null = null;
  private url: string;
  private handlers: Map<string, Set<MessageHandler>> = new Map();
  private reconnectAttempts = 0;
  private maxReconnect = 10;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private _connected = false;

  /** Fires when connection state changes. */
  onConnectionChange?: (connected: boolean) => void;

  constructor(url = getDefaultGestureWsUrl()) {
    this.url = url;
  }

  get connected() {
    return this._connected;
  }

  connect() {
    if (this.ws?.readyState === WebSocket.OPEN) return;

    try {
      this.ws = new WebSocket(this.url);

      this.ws.onopen = () => {
        this._connected = true;
        this.reconnectAttempts = 0;
        this.onConnectionChange?.(true);
      };

      this.ws.onmessage = (event) => {
        try {
          const msg: WSMessage = JSON.parse(event.data);
          this.emit(msg.type, msg);
        } catch {
          console.warn("[GestureWS] Failed to parse message:", event.data);
        }
      };

      this.ws.onclose = () => {
        this._connected = false;
        this.onConnectionChange?.(false);
        this.scheduleReconnect();
      };

      this.ws.onerror = () => {
        this.ws?.close();
      };
    } catch {
      this.scheduleReconnect();
    }
  }

  disconnect() {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.reconnectAttempts = this.maxReconnect; // prevent reconnection
    this.ws?.close();
    this._connected = false;
    this.onConnectionChange?.(false);
  }

  /** Send a gesture frame to the backend for inference. */
  sendFrame(landmarks: number[][]) {
    if (this.ws?.readyState !== WebSocket.OPEN) return;

    const msg: WSMessage = {
      type: "gesture_frame",
      payload: { landmarks },
      timestamp: Date.now(),
    };
    this.ws.send(JSON.stringify(msg));
  }

  /** Subscribe to a message type. Returns an unsubscribe function. */
  on(type: string, handler: MessageHandler): () => void {
    if (!this.handlers.has(type)) {
      this.handlers.set(type, new Set());
    }
    this.handlers.get(type)!.add(handler);

    return () => {
      this.handlers.get(type)?.delete(handler);
    };
  }

  /** Convenience: subscribe to gesture results. */
  onGestureResult(handler: (result: GestureResult) => void): () => void {
    return this.on("gesture_result", (msg) => {
      handler(msg.payload as GestureResult);
    });
  }

  private emit(type: string, msg: WSMessage) {
    this.handlers.get(type)?.forEach((h) => h(msg));
    // Also emit on wildcard
    this.handlers.get("*")?.forEach((h) => h(msg));
  }

  private scheduleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnect) return;

    const delay = Math.min(1000 * 2 ** this.reconnectAttempts, 30_000);
    this.reconnectAttempts++;

    this.reconnectTimer = setTimeout(() => {
      this.connect();
    }, delay);
  }
}

/** Singleton instance. */
export const gestureWs = new GestureWebSocket();
