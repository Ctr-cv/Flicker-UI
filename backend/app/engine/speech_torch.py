"""
Foundation nn.Module used by speech_model.py for silent-speech inference.
Mirrors the gesture model architecture: LSTM → LayerNorm → MLP.
"""

import torch.nn as nn


class SpeechModel(nn.Module):
    def __init__(self, input_size, hidden_size, num_layers, num_classes, dropout=0.2):
        super(SpeechModel, self).__init__()
        self.lstm = nn.LSTM(
            input_size,
            hidden_size,
            num_layers=num_layers,
            batch_first=True,
            dropout=dropout if num_layers > 1 else 0,
            bidirectional=False,
        )
        self.layer_norm = nn.LayerNorm(hidden_size)
        self.mlp = nn.Sequential(
            nn.Linear(hidden_size, 64),
            nn.ReLU(),
            nn.Dropout(dropout),
            nn.Linear(64, num_classes),
        )

    def forward(self, x):
        lstm_out, (h_n, c_n) = self.lstm(x)
        last_time_step = lstm_out[:, -1, :]
        normalized_res = self.layer_norm(last_time_step)
        logits = self.mlp(normalized_res)
        return logits
