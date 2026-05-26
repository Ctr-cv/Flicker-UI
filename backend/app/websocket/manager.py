"""
WebSocket connection manager for real-time gesture and speech streaming.

Handles multiple concurrent clients, receives gesture and speech frames,
runs inference, and broadcasts results back.
"""
import json
import logging
import time
from typing import Any, Callable

from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from pydantic import BaseModel, ValidationError

from app.models.schemas import GestureFrame, SpeechFrame
from app.services.gesture import gesture_service
from app.services.speech import speech_service
from config import settings

ws_router = APIRouter()
logger = logging.getLogger("flicker.websocket")


class ConnectionManager:
    """Manages active WebSocket connections with a bounded pool."""

    def __init__(self, max_connections: int = 50) -> None:
        self.active: list[WebSocket] = []
        self.max_connections = max_connections
        self._last_frame: dict[int, float] = {}

    async def connect(self, ws: WebSocket) -> bool:
        if len(self.active) >= self.max_connections:
            await ws.close(code=1013, reason="Max connections reached")
            return False
        await ws.accept()
        self.active.append(ws)
        return True

    def disconnect(self, ws: WebSocket) -> None:
        if ws in self.active:
            self.active.remove(ws)
        self._last_frame.pop(id(ws), None)

    async def send_json(self, ws: WebSocket, data: dict) -> bool:
        try:
            await ws.send_json(data)
            return True
        except Exception:
            logger.exception("Failed to send websocket message")
            self.disconnect(ws)
            return False

    def should_throttle(self, ws: WebSocket, max_fps: int = 30) -> bool:
        """Return True if a frame from this client should be skipped."""
        now = time.monotonic()
        ws_id = id(ws)
        min_interval = 1.0 / max_fps
        if ws_id in self._last_frame and (now - self._last_frame[ws_id]) < min_interval:
            return True
        self._last_frame[ws_id] = now
        return False


manager = ConnectionManager(max_connections=settings.ws_max_connections)


async def _run_modality_ws(
    ws: WebSocket,
    *,
    frame_type: str,
    frame_schema: type[BaseModel],
    extract_data: Callable[..., Any],
    predict: Callable[..., Any],
    result_type: str,
    error_label: str,
):
    """Shared WebSocket handler for a modality endpoint."""
    connected = await manager.connect(ws)
    if not connected:
        return

    success = await manager.send_json(ws, {
        "type": "status_update",
        "payload": {"connected": True, "clients": len(manager.active)},
        "timestamp": time.time() * 1000,
    })
    if not success:
        return

    try:
        while True:
            raw = await ws.receive_text()
            try:
                msg = json.loads(raw)
            except json.JSONDecodeError:
                await manager.send_json(ws, {
                    "type": "error",
                    "payload": {"message": "Invalid JSON"},
                    "timestamp": time.time() * 1000,
                })
                continue

            if not isinstance(msg, dict):
                await manager.send_json(ws, {
                    "type": "error",
                    "payload": {"message": "Message must be a JSON object"},
                    "timestamp": time.time() * 1000,
                })
                continue

            msg_type = msg.get("type")

            if msg_type == frame_type:
                if manager.should_throttle(ws):
                    continue

                try:
                    frame = frame_schema.model_validate(msg.get("payload"))
                except ValidationError:
                    await manager.send_json(ws, {
                        "type": "error",
                        "payload": {"message": f"Invalid {error_label} frame payload"},
                        "timestamp": time.time() * 1000,
                    })
                    continue

                try:
                    result = predict(extract_data(frame))
                except Exception:
                    logger.exception("%s inference failed", error_label.capitalize())
                    await manager.send_json(ws, {
                        "type": "error",
                        "payload": {"message": f"{error_label.capitalize()} inference failed"},
                        "timestamp": time.time() * 1000,
                    })
                    continue

                if result:
                    await manager.send_json(ws, {
                        "type": result_type,
                        "payload": result.model_dump(),
                        "timestamp": time.time() * 1000,
                    })

            elif msg_type == "ping":
                await manager.send_json(ws, {
                    "type": "pong",
                    "payload": None,
                    "timestamp": time.time() * 1000,
                })
            else:
                await manager.send_json(ws, {
                    "type": "error",
                    "payload": {"message": f"Unsupported message type: {msg_type!r}"},
                    "timestamp": time.time() * 1000,
                })

    except WebSocketDisconnect:
        pass
    finally:
        manager.disconnect(ws)


@ws_router.websocket("/ws/gesture")
async def gesture_websocket(ws: WebSocket):
    await _run_modality_ws(
        ws,
        frame_type="gesture_frame",
        frame_schema=GestureFrame,
        extract_data=lambda f: f.landmarks,
        predict=gesture_service.predict,
        result_type="gesture_result",
        error_label="gesture",
    )


@ws_router.websocket("/ws/speech")
async def speech_websocket(ws: WebSocket):
    await _run_modality_ws(
        ws,
        frame_type="speech_frame",
        frame_schema=SpeechFrame,
        extract_data=lambda f: f.lip_landmarks,
        predict=speech_service.predict,
        result_type="speech_result",
        error_label="speech",
    )
