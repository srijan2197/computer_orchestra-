"""
ML Model — Random Forest Classifier
Predicts probability of deadline miss for each workload
Features: cpu_demand, gpu_demand, npu_demand, priority, asil_weight, service_ratio, latency_ms
Trains online: collects samples every tick, retrains every 30 ticks once enough data exists.
"""

from collections import deque
from typing import Dict, List

RETRAIN_EVERY = 30
MIN_SAMPLES   = 40


class DeadlineMissPredictor:
    def __init__(self):
        self._model        = None
        self._samples_X: deque = deque(maxlen=500)
        self._samples_y: deque = deque(maxlen=500)
        self._tick         = 0
        self.ready         = False
        self.probabilities: Dict[str, float] = {}

    # ------------------------------------------------------------------ #
    def _features(self, rt) -> List[float]:
        spec = rt.spec
        return [
            rt.demand.get("CPU", 0.0),
            rt.demand.get("GPU", 0.0),
            rt.demand.get("NPU", 0.0),
            float(spec.priority),
            float(spec.asil_weight),
            float(rt.service_ratio),
            float(rt.latency_ms),
        ]

    # ------------------------------------------------------------------ #
    def collect(self, runtime_workloads) -> None:
        """Call every tick after scheduling to gather labelled samples."""
        for rt in runtime_workloads:
            if not rt.spec.enabled:
                continue
            self._samples_X.append(self._features(rt))
            self._samples_y.append(0 if rt.deadline_met else 1)

    # ------------------------------------------------------------------ #
    def train(self) -> None:
        """Retrain the Random Forest on accumulated samples."""
        if len(self._samples_X) < MIN_SAMPLES:
            return
        try:
            from sklearn.ensemble import RandomForestClassifier
            X = list(self._samples_X)
            y = list(self._samples_y)
            clf = RandomForestClassifier(
                n_estimators=40,
                max_depth=6,
                random_state=42,
                n_jobs=1,
            )
            clf.fit(X, y)
            self._model = clf
            self.ready  = True
        except Exception:
            pass

    # ------------------------------------------------------------------ #
    def predict(self, runtime_workloads) -> None:
        """Predict deadline-miss probability for each active workload."""
        self._tick += 1

        self.collect(runtime_workloads)

        if self._tick % RETRAIN_EVERY == 0:
            self.train()

        if not self.ready or self._model is None:
            for rt in runtime_workloads:
                self.probabilities[rt.spec.id] = 0.0
            return

        for rt in runtime_workloads:
            if not rt.spec.enabled:
                self.probabilities[rt.spec.id] = 0.0
                continue
            try:
                prob = self._model.predict_proba([self._features(rt)])[0]
                # prob[1] = probability of class 1 (deadline miss)
                classes = list(self._model.classes_)
                miss_prob = prob[classes.index(1)] if 1 in classes else 0.0
                self.probabilities[rt.spec.id] = round(float(miss_prob), 3)
            except Exception:
                self.probabilities[rt.spec.id] = 0.0

    # ------------------------------------------------------------------ #
    def feature_importance(self) -> Dict[str, float]:
        if not self.ready or self._model is None:
            return {}
        names = ["cpu_demand", "gpu_demand", "npu_demand",
                 "priority", "asil_weight", "service_ratio", "latency_ms"]
        return {n: round(float(v), 3)
                for n, v in zip(names, self._model.feature_importances_)}
