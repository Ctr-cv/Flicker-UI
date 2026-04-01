# Flicker-UI

A real-time gesture recognition interface powered by the **Flicker** gesture model. Flicker-UI provides a low-latency web dashboard for capturing hand gestures, streaming them to a local inference engine, and visualizing classification results — all served through a Material Design 3-inspired architectural aesthetic.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                  FRONTEND (React + Vite)                     │
│                                                              │
│  Camera Input ──> Gesture Capture ──> Zustand Store          │
│                                      │                       │
│  UI Render <── Response Handler <── WebSocket Client         │
└──────────────────────────┬──────────────────────────────────┘
                           │  WebSocket + REST
┌──────────────────────────▼──────────────────────────────────┐
│                  BACKEND (FastAPI)                           │
│                                                              │
│  WebSocket Manager ──> Frame Preproc ──> Model Inference     │
│                          │                                   │
│  Response Builder <── Postproc <── Result Cache              │
└─────────────────────────────────────────────────────────────┘
```

### Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 19, TypeScript, Vite 5 |
| **Styling** | TailwindCSS 4 (Material Design 3 palette) |
| **State** | Zustand 5 |
| **Routing** | React Router 7 |
| **Real-time** | Native WebSocket |
| **Backend** | Python 3.13, FastAPI, Uvicorn |
| **Model** | Pluggable engine adapter (LSTM + MLP via NumPy/PyTorch) |

## Project Structure

```
Flicker-UI/
├── frontend/                           # React + Vite + TypeScript
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/                 # Sidebar, TopBar, Footer, AppLayout
│   │   │   └── ui/                     # ModuleCard, StatPanel, HeroBadge
│   │   ├── pages/                      # Intro, Motion, Haptics, Neural, Cloud
│   │   ├── stores/                     # Zustand: gesture state, theme
│   │   ├── services/                   # REST API client, WebSocket client
│   │   ├── hooks/                      # useWebSocket, useCamera
│   │   └── types/                      # Shared TypeScript types
│   ├── vite.config.ts
│   └── package.json
│
├── backend/                            # FastAPI (Python)
│   ├── app/
│   │   ├── main.py                     # FastAPI entry point
│   │   ├── models/schemas.py           # Pydantic request/response schemas
│   │   ├── routes/                     # REST endpoints (health, status, model)
│   │   ├── services/
│   │   │   ├── gesture.py              # Gesture prediction service
│   │   │   ├── neural.py               # Model lifecycle manager
│   │   │   ├── haptics.py              # Haptic feedback extension stub
│   │   │   └── audio.py                # Audio modality extension stub
│   │   ├── engine/
│   │   │   ├── base.py                 # Abstract model engine interface
│   │   │   └── gesture_model.py        # Your model adapter (swap in here)
│   │   └── websocket/
│   │       └── manager.py              # WebSocket connection handler
│   ├── config.py                       # Environment-driven settings
│   └── requirements.txt
│
├── index.html                          # Original design reference
├── .gitignore
└── README.md
```

## Quick Start

### Prerequisites

- **Node.js** >= 20.18 (Vite 5 compatible)
- **Python** >= 3.13
- **npm** or **pnpm**

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd Flicker-UI
```

### 2. Start the Backend

```bash
cd backend

# Create and activate a virtual environment (recommended)
python -m venv .venv
.venv\Scripts\activate          # Windows
# source .venv/bin/activate     # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Start the FastAPI server
uvicorn app.main:app --reload --port 8000
```

The backend will be available at `http://localhost:8000`. API docs are auto-generated at `http://localhost:8000/docs`.

### 3. Start the Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start the dev server
npm run dev
```

The frontend will be available at `http://localhost:5173`. The Vite proxy forwards `/api` and `/ws` requests to the backend automatically.

### 4. Open the Dashboard

Navigate to `http://localhost:5173` in your browser. The Intro page loads by default, showing the hero section and module cards.

## Pages

| Route | Description |
|-------|-------------|
| `/intro` | Landing page with hero section and module overview |
| `/motion` | Live gesture capture — camera feed, real-time detection, history |
| `/haptics` | Haptic feedback configuration (extension stub) |
| `/neural` | Model status, active modalities, inference configuration |
| `/cloud` | Cloud sync, remote inference, checkpoint management |

## Integrating Your Model

The backend uses an abstract engine interface so you can swap in your actual Flicker gesture model without touching the rest of the codebase.

### Step 1: Implement the Engine

Open `backend/app/engine/gesture_model.py` and replace the placeholder `predict()` method:

```python
from app.engine.base import BaseModelEngine

class GestureModelEngine(BaseModelEngine):
    def __init__(self) -> None:
        self._loaded = False
        self._model = None

    @property
    def loaded(self) -> bool:
        return self._loaded

    def load(self) -> None:
        # Load your actual model weights
        from your_model_package import GestureClassifier
        self._model = GestureClassifier.load("path/to/weights.pkl")
        self._loaded = True

    def unload(self) -> None:
        self._model = None
        self._loaded = False

    def predict(self, landmarks: list[list[float]]) -> tuple[str, float]:
        if not self._loaded or not landmarks:
            return ("none", 0.0)

        # Run your actual inference
        label, confidence = self._model.predict(landmarks)
        return label, confidence
```

### Step 2: Update Gesture Labels

Edit the `GESTURE_LABELS` list in `gesture_model.py` to match your model's output classes.

### Step 3: Restart the Backend

```bash
uvicorn app.main:app --reload --port 8000
```

The model loads automatically on startup via the FastAPI lifespan handler.

## Configuration

All settings are environment-driven via `pydantic-settings`. Set them directly or create a `backend/.env` file:

```env
# backend/.env
GESTALT_APP_NAME=Gestalt Engine
GESTALT_APP_VERSION=2.0.0
GESTALT_DEBUG=true
GESTALT_HOST=0.0.0.0
GESTALT_PORT=8000
GESTALT_MODEL_CONFIDENCE_THRESHOLD=0.6
GESTALT_WS_MAX_CONNECTIONS=50
```

| Variable | Default | Description |
|----------|---------|-------------|
| `GESTALT_APP_NAME` | `Gestalt Engine` | Application display name |
| `GESTALT_APP_VERSION` | `2.0.0` | Version string shown in the UI |
| `GESTALT_DEBUG` | `false` | Enable debug logging |
| `GESTALT_HOST` | `0.0.0.0` | Bind address |
| `GESTALT_PORT` | `8000` | Server port |
| `GESTALT_MODEL_CONFIDENCE_THRESHOLD` | `0.6` | Minimum confidence to report a gesture |
| `GESTALT_WS_MAX_CONNECTIONS` | `50` | Max concurrent WebSocket clients |

## API Reference

### REST Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/health` | Health check |
| `GET` | `/api/status` | System status (modalities, uptime, model state) |
| `POST` | `/api/model/reload` | Hot-reload the gesture model |
| `PUT` | `/api/config` | Update inference parameters |

### WebSocket Protocol

**Endpoint:** `ws://localhost:8000/ws/gesture`

**Client → Server:**
```json
{
  "type": "gesture_frame",
  "payload": { "landmarks": [[x, y, z], ...] },
  "timestamp": 1712000000000
}
```

**Server → Client:**
```json
{
  "type": "gesture_result",
  "payload": {
    "label": "open_palm",
    "confidence": 0.942,
    "latency": 0.002,
    "timestamp": 1712000000000
  },
  "timestamp": 1712000000000
}
```

**Control messages:**
- `"ping"` → server responds with `"pong"`
- `"status_update"` → sent on connect with client count

## Extending Modalities

The architecture supports additional I/O channels beyond gesture recognition. Extension stubs are already in place:

- **Haptics** (`backend/app/services/haptics.py`) — Web Vibration API, Web Bluetooth, USB HID
- **Audio** (`backend/app/services/audio.py`) — Voice commands, sonification, audio cues

To add a new modality:

1. Create a service in `backend/app/services/<modality>.py`
2. Implement a model engine in `backend/app/engine/<modality>_model.py` extending `BaseModelEngine`
3. Register it in `neural.py` and expose it via the `/api/status` endpoint
4. Add a frontend page in `frontend/src/pages/<Modality>Page.tsx`

## Available Scripts

### Frontend

```bash
npm run dev       # Start dev server with HMR
npm run build     # TypeScript check + production build
npm run preview   # Preview production build locally
npm run lint      # ESLint check
```

### Backend

```bash
uvicorn app.main:app --reload   # Start with auto-reload
uvicorn app.main:app            # Start without reload (production)
```

## Design System

The UI follows a Material Design 3 warm earth-tone palette:

- **Primary:** `#904b36` (terracotta)
- **Surface hierarchy:** `#fcf9f4` → `#f6f3ee` → `#f0ede8` → `#ebe8e3` → `#e5e2dd`
- **Typography:** Manrope (headlines), Inter (body/labels)
- **Icons:** Material Symbols Outlined
- **Dark mode:** Full support via `useThemeStore` with system preference detection

All colors, fonts, and spacing are defined in `frontend/src/index.css` using TailwindCSS 4's `@theme` directive.

## License

Private. All rights reserved.
