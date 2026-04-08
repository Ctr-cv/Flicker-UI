"""
WebSocket connection manager for real-time gesture streaming.

Handles multiple concurrent clients, receives gesture frames,
runs inference, and broadcasts results back.
"""
import asyncio
import time
import json
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.services.gesture import gesture_service
from config import settings

ws_router = APIRouter()


class ConnectionManager:
    """Manages active WebSocket connections with a bounded pool."""

    def __init__(self, max_connections: int = 50) -> None:
        self.active: list[WebSocket] = []
        self.max_connections = max_connections

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

    async def send_json(self, ws: WebSocket, data: dict) -> bool:
        try:
            await ws.send_json(data)
            return True
        except Exception:
            self.disconnect(ws)
            return False

    async def broadcast(self, data: dict) -> None:
        for ws in list(self.active):
            await self.send_json(ws, data)


manager = ConnectionManager(max_connections=settings.ws_max_connections)


@ws_router.websocket("/ws/gesture")
async def gesture_websocket(ws: WebSocket):
    """
    Main gesture streaming endpoint.

    Protocol:
      Client sends:  { "type": "gesture_frame", "payload": { "landmarks": [...] }, "timestamp": ... }
      Server replies: { "type": "gesture_result", "payload": { "label": ..., "confidence": ..., "latency": ..., "timestamp": ... }, "timestamp": ... }
    """
    connected = await manager.connect(ws)
    if not connected:
        return
    await asyncio.sleep(0.5)

    # Send initial status
    success = await manager.send_json(ws, {
        "type": "status_update",
        "payload": {"connected": True, "clients": len(manager.active)},
        "timestamp": time.time() * 1000,
    })
    if not success: return

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

            msg_type = msg.get("type")

            if msg_type == "gesture_frame":
                landmarks = msg.get("payload", {}).get("landmarks", [])
                result = gesture_service.predict(landmarks)
                if result:
                    await manager.send_json(ws, {
                        "type": "gesture_result",
                        "payload": result.model_dump(),
                        "timestamp": time.time() * 1000,
                    })

            elif msg_type == "ping":
                await manager.send_json(ws, {
                    "type": "pong",
                    "payload": None,
                    "timestamp": time.time() * 1000,
                })

    except WebSocketDisconnect:
        pass
    finally:
        manager.disconnect(ws)
