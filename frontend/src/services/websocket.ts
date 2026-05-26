import type { WSMessage, WSMessageType, GestureResult, SpeechResult } from "@/types";

type MessageHandler = (msg: WSMessage) => void;

interface WsConfig {
  path: string;
  frameType: WSMessageType;
  framePayloadKey: string;
  resultType: WSMessageType;
}

function getDefaultWsUrl(path: string) {
  if (typeof window === "undefined") {
    return `ws://localhost${path}`;
  }
  const protocol = window.location.protocol === "https:" ? "wss" : "ws";
  return `${protocol}://${window.location.host}${path}`;
}

/**
 * Generic WebSocket client for real-time modality streaming.
 * Handles reconnection with exponential backoff.
 */
export class ModalityWebSocket<TResult = unknown> {
  private ws: WebSocket | null = null;
  private url: string;
  private handlers: Map<string, Set<MessageHandler>> = new Map();
  private reconnectAttempts = 0;
  private maxReconnect = 10;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private _connected = false;
  private shouldReconnect = true;
  private config: WsConfig;

  /** Fires when connection state changes. */
  onConnectionChange?: (connected: boolean) => void;

  constructor(config: WsConfig) {
    this.config = config;
    this.url = getDefaultWsUrl(config.path);
  }

  get connected() {
    return this._connected;
  }

  connect() {
    if (
      this.ws?.readyState === WebSocket.OPEN ||
      this.ws?.readyState === WebSocket.CONNECTING
    ) {
      return;
    }
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.shouldReconnect = true;

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
          console.warn("[WS] Failed to parse message:", event.data);
        }
      };

      this.ws.onclose = () => {
        this.ws = null;
        this._connected = false;
        this.onConnectionChange?.(false);
        if (this.shouldReconnect) {
          this.scheduleReconnect();
        }
      };

      this.ws.onerror = () => {
        this.ws?.close();
      };
    } catch {
      this.scheduleReconnect();
    }
  }

  disconnect() {
    this.shouldReconnect = false;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.reconnectAttempts = this.maxReconnect;
    this.ws?.close();
    this.ws = null;
    this._connected = false;
    this.onConnectionChange?.(false);
  }

  /** Send a frame to the backend for inference. */
  sendFrame(data: number[][]) {
    if (this.ws?.readyState !== WebSocket.OPEN) return;

    const msg: WSMessage = {
      type: this.config.frameType,
      payload: { [this.config.framePayloadKey]: data },
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

  /** Subscribe to inference results for this modality. */
  onResult(handler: (result: TResult) => void): () => void {
    return this.on(this.config.resultType, (msg) => {
      handler(msg.payload as TResult);
    });
  }

  private emit(type: string, msg: WSMessage) {
    this.handlers.get(type)?.forEach((h) => h(msg));
    this.handlers.get("*")?.forEach((h) => h(msg));
  }

  private scheduleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnect) return;
    if (this.reconnectTimer) return;

    const delay = Math.min(1000 * 2 ** this.reconnectAttempts, 30_000);
    this.reconnectAttempts++;

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, delay);
  }
}

/** Gesture WebSocket singleton. */
export const gestureWs = new ModalityWebSocket<GestureResult>({
  path: "/ws/gesture",
  frameType: "gesture_frame",
  framePayloadKey: "landmarks",
  resultType: "gesture_result",
});

/** Speech WebSocket singleton. */
export const speechWs = new ModalityWebSocket<SpeechResult>({
  path: "/ws/speech",
  frameType: "speech_frame",
  framePayloadKey: "lip_landmarks",
  resultType: "speech_result",
});
