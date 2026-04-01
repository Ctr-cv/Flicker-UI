/* ── Gesture Types ─────────────────────────────────────────── */

export interface GestureFrame {
  /** Unique frame identifier */
  id: string;
  /** Timestamp in ms */
  timestamp: number;
  /** Raw landmark data (e.g., MediaPipe hand landmarks) */
  landmarks: number[][];
  /** Confidence score 0-1 */
  confidence: number;
}

export interface GestureResult {
  /** Recognized gesture label */
  label: string;
  /** Confidence 0-1 */
  confidence: number;
  /** Model inference latency in ms */
  latency: number;
  /** Timestamp of recognition */
  timestamp: number;
}

/* ── Modality Types (extensible) ──────────────────────────── */

export type ModalityType = "gesture" | "haptics" | "audio" | "neural";

export interface ModalityStatus {
  type: ModalityType;
  active: boolean;
  latency: number;
  fidelity: number;
}

/* ── WebSocket Message Types ──────────────────────────────── */

export type WSMessageType =
  | "gesture_frame"
  | "gesture_result"
  | "status_update"
  | "error"
  | "ping"
  | "pong";

export interface WSMessage<T = unknown> {
  type: WSMessageType;
  payload: T;
  timestamp: number;
}

/* ── API Response Types ───────────────────────────────────── */

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

export interface SystemStatus {
  modalities: ModalityStatus[];
  uptime: number;
  version: string;
  modelLoaded: boolean;
}

/* ── Navigation ───────────────────────────────────────────── */

export interface NavItem {
  id: string;
  label: string;
  icon: string;
  path: string;
}
