# Flicker Model

A gesture recognition model utilizing a custom NumPy-based Long Short-Term Memory (LSTM) network and a Multi-Layer Perceptron (MLP) classifier to process temporal sequences of hand landmarks for classifying hand movements over time.

## Overview

The model extracts 21 hand keypoints and their (x, y, z) coordinates using MediaPipe. The temporal coordinates over continuous frames (sliding window of 20 frames) are processed through the LSTM module, followed by an MLP layer that maps the patterns to distinct gesture categories. The model's neural network blocks are built entirely from scratch in NumPy, allowing for an isolated environment that can be analyzed and extended effortlessly. A PyTorch implementation is also available.

## Prerequisites

- **Python:** `>=3.13`
- **Package Manager:** `uv` is recommended for ultra-fast dependency management.
  ```bash
  pip install uv
  ```

## Setup & Installation

**1. Clone the repository:**
```bash
git clone <your-repository-url>
cd Flicker-model
```

**2. Install dependencies:**
We use `uv` to keep the dependency installation clean and isolated.
```bash
uv sync
```
This will automatically read `pyproject.toml` and set up the `.venv` virtual environment with all required packages (like `numpy`, `torch`, `opencv-python`, and `mediapipe`).

**3. Activate the virtual environment:**
- **Windows:** `.venv\Scripts\activate`
- **macOS/Linux:** `source .venv/bin/activate`

## Data Preparation

The `scripts/process_all.py` script is used to prepare the dataset. It executes the following steps:
1. **Feature Extraction:** Runs the CV detector through raw videos to extract hand landmarks into `.npy` files.
2. **Windowing the Data:** Segments distinct gestures based on annotations, downsampling or padding to a fixed 20 frames per sequence.
3. **Normalization:** Standardizes the data by subtracting the wrist coordinates and scaling by the hand's dimensions (distance from wrist to middle finger MCP) to ensure spatial invariance.

Run the processing script:
```bash
python scripts/process_all.py
```
*(Ensure raw data is properly placed in `data/raw/` and annotations in `data/Annot_List.csv` before running).*

## Training the Model

You can train the model by running the `train.py` script. It initializes the LSTM + MLP architecture, splits the processed dataset, and runs the training loop. It also outputs evaluation metrics and a confusion matrix at the end of training.

```bash
python scripts/train.py
```
This script will save the best model weights to `data/best_model_weights.pkl` and a confusion matrix plot to `data/confusion_matrix.png`.

## Real-Time Inference

For live testing via your webcam, use the engine's streaming functionality (or the upcoming inference script):
```bash
python src/engine/stream.py
```
This will open a webcam feed, detect your hand in real-time using MediaPipe, and maintain a sliding window buffer of the landmarks suitable for real-time gesture classification.

## Project Structure

```text
Flicker-model/
├── data/                    # Data storage (.npy, .npz, raw videos, and model artifacts)
├── scripts/                 # Entry point scripts
│   ├── train.py             # Main training loop and evaluation
│   ├── process_all.py       # Data processing and feature extraction pipeline
│   ├── inference.py         # Real-time inference entry point
│   └── notes.md             # Developer notes on hyperparams and data pipeline
├── src/                     # Source code modules
│   ├── engine/              # Live CV pipeline
│   │   └── stream.py        # Real-time hand landmark detection and buffering
│   ├── training/            # Custom neural network layers and training logic
│   │   ├── lstm.py          # Custom Long Short-Term Memory RNN built in NumPy
│   │   ├── mlp.py           # Custom Multi-Layer Perceptron
│   │   ├── optim.py         # Custom optimizer implementations (Adam, etc.)
│   │   ├── trainer.py       # Training loop orchestration
│   │   └── lstm_torch.py    # PyTorch-based LSTM implementation
│   └── utils/               # Shared helpers
│       ├── hand_utils.py    # MediaPipe helpers
│       └── layer_utils.py   # Activation functions and loss implementations
└── pyproject.toml           # Project metadata and dependencies
```
