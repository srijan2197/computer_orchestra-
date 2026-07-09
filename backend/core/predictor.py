"""
AI-driven workload prediction (stretch goal).
Holt EMA + linear trend, dependency-free.
"""

from collections import deque
from typing import Deque, Dict, List


class DemandPredictor:
    def __init__(self, resources: List[str], alpha: float = 0.4, beta: float = 0.3, window: int = 40):
        self.alpha = alpha
        self.beta = beta
        self.window = window
        self._level: Dict[str, float] = {r: 0.0 for r in resources}
        self._trend: Dict[str, float] = {r: 0.0 for r in resources}
        self._init: Dict[str, bool] = {r: False for r in resources}
        self.history: Dict[str, Deque[float]] = {r: deque(maxlen=window) for r in resources}
        self.forecast: Dict[str, float] = {r: 0.0 for r in resources}

    def update(self, observed: Dict[str, float]) -> Dict[str, float]:
        for r, value in observed.items():
            self.history[r].append(value)
            if not self._init[r]:
                self._level[r] = value
                self._trend[r] = 0.0
                self._init[r] = True
            else:
                prev_level = self._level[r]
                self._level[r] = self.alpha * value + (1 - self.alpha) * (prev_level + self._trend[r])
                self._trend[r] = self.beta * (self._level[r] - prev_level) + (1 - self.beta) * self._trend[r]
            self.forecast[r] = max(0.0, self._level[r] + self._trend[r])
        return dict(self.forecast)

    def confidence(self, resource: str) -> float:
        hist = self.history[resource]
        if len(hist) < 4:
            return 0.5
        recent = list(hist)[-6:]
        mean = sum(recent) / len(recent)
        if mean <= 0:
            return 0.9
        var = sum((x - mean) ** 2 for x in recent) / len(recent)
        rel = (var ** 0.5) / mean
        return round(max(0.1, min(0.99, 1.0 - rel)), 2)

