"""
Foundation nn.Module used by gesture_model.py for inference purposes
"""

import torch.nn as nn

class GestureModel(nn.Module):
    def __init__(self, input_size, hidden_size, num_layers, num_classes, dropout=0.2):
        super(GestureModel, self).__init__()
        # Module 1: LSTM
        self.lstm = nn.LSTM(
            input_size,
            hidden_size,
            num_layers=num_layers,
            batch_first=True,
            dropout=dropout if num_layers > 1 else 0,
            bidirectional=False
        )
        # A stabilization layer
        self.layer_norm = nn.LayerNorm(hidden_size)
        # Module 2: MLP
        self.mlp = nn.Sequential(
            nn.Linear(hidden_size, 64),
            nn.ReLU(),
            nn.Dropout(dropout),
            nn.Linear(64, num_classes)
        )

    def forward(self, x):
        # 1. Pass through LSTM
        lstm_out, (h_n, c_n) = self.lstm(x)

        # 2. "Attach" by taking only the last hidden state
        # (Assuming we want the many-to-one architecture)
        last_time_step = lstm_out[:, -1, :]
        normalized_res = self.layer_norm(last_time_step)
        # 3. Pass the sliced output to the MLP
        logits = self.mlp(normalized_res)
        return logits
