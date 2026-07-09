"""
Real-time simulation engine.
"""

import random
import time
from typing import Dict, List, Optional

from .catalog import PLATFORM, fresh_catalog
from .models import Resource, RuntimeWorkload, WorkloadSpec
from .predictor import DemandPredictor
from .scheduler import schedule


class Simulator:
    def __init__(self) -> None:
        self.platform: Dict[str, float] = dict(PLATFORM)
        self.specs: List[WorkloadSpec] = fresh_catalog()
        self.scenario: str = "city"
        self.asil_reserve: float = 0.7
        self.tick: int = 0
        self.running: bool = True
        self._spikes: Dict[str, float] = {}
        self.predictor = DemandPredictor([r.value for r in Resource])
        self._last_snapshot: Optional[dict] = None

    def set_scenario(self, scenario: str) -> None:
        from .catalog import SCENARIOS
        if scenario in SCENARIOS:
            self.scenario = scenario

    def set_reserve(self, value: float) -> None:
        self.asil_reserve = max(0.0, min(0.95, float(value)))

    def toggle_workload(self, workload_id: str, enabled: Optional[bool] = None) -> None:
        for s in self.specs:
            if s.id == workload_id:
                s.enabled = (not s.enabled) if enabled is None else bool(enabled)

    def inject_spike(self, workload_id: str, ticks: int = 8) -> None:
        self._spikes[workload_id] = ticks

    def set_running(self, running: bool) -> None:
        self.running = bool(running)

    def _instant_demand(self, spec: WorkloadSpec) -> Dict[str, float]:
        intensity = spec.intensity.get(self.scenario, 1.0)
        noise = 1.0 + random.uniform(-0.15, 0.15)
        spike = 1.0
        if spec.id in self._spikes and self._spikes[spec.id] > 0:
            spike = 2.2
        factor = intensity * noise * spike
        return {res: max(0.0, val * factor) for res, val in spec.demand.items()}

    def step(self) -> dict:
        if self.running:
            self.tick += 1
            for wid in list(self._spikes):
                self._spikes[wid] -= 1
                if self._spikes[wid] <= 0:
                    del self._spikes[wid]

        runtime: List[RuntimeWorkload] = []
        for spec in self.specs:
            rt = RuntimeWorkload(spec=spec)
            rt.demand = self._instant_demand(spec) if spec.enabled else {r: 0.0 for r in spec.demand}
            runtime.append(rt)

        summary = schedule(runtime, self.platform, self.asil_reserve)

        observed = {
            r: sum(rt.demand.get(r, 0.0) for rt in runtime if rt.spec.enabled)
            for r in self.platform
        }
        forecast = self.predictor.update(observed)

        snapshot = self._build_snapshot(runtime, summary, observed, forecast)
        self._last_snapshot = snapshot
        return snapshot

    def _build_snapshot(self, runtime, summary, observed, forecast) -> dict:
        active = [rt for rt in runtime if rt.spec.enabled]

        resources = {}
        alerts: List[str] = []
        for r, cap in self.platform.items():
            s = summary[r]
            pred = forecast.get(r, 0.0)
            pred_util = pred / cap if cap else 0.0
            saturated_soon = pred_util > 0.95
            resources[r] = {
                **s,
                "predicted_demand": round(pred, 1),
                "predicted_util": round(pred_util, 3),
                "predict_saturation": saturated_soon,
                "predict_confidence": self.predictor.confidence(r),
            }
            if s["saturated"]:
                alerts.append(f"{r} saturated at {int(s['util']*100)}% — QM workloads throttled")
            elif saturated_soon:
                alerts.append(f"AI forecast: {r} approaching saturation (~{int(pred_util*100)}%)")
            if not s["asil_satisfied"]:
                alerts.append(f"CRITICAL: ASIL demand on {r} exceeds platform capacity")

        deadline_misses = [rt for rt in active if not rt.deadline_met]
        throttled = [rt for rt in active if rt.throttled]
        asil_all_met = all(rt.deadline_met for rt in active if rt.spec.is_safety_critical)
        avg_latency = (sum(rt.latency_ms for rt in active) / len(active)) if active else 0.0

        if not asil_all_met:
            safety_status = "VIOLATION"
        elif deadline_misses:
            safety_status = "DEGRADED"
        else:
            safety_status = "NOMINAL"

        metrics = {
            "avg_latency_ms": round(avg_latency, 1),
            "deadline_misses": len(deadline_misses),
            "throttled_count": len(throttled),
            "asil_all_met": asil_all_met,
            "safety_status": safety_status,
            "active_workloads": len(active),
            "total_util": round(
                sum(summary[r]["used"] for r in self.platform)
                / max(sum(self.platform.values()), 1e-9),
                3,
            ),
        }

        return {
            "tick": self.tick,
            "timestamp": round(time.time(), 3),
            "scenario": self.scenario,
            "running": self.running,
            "asil_reserve": self.asil_reserve,
            "platform": {r: round(c, 1) for r, c in self.platform.items()},
            "resources": resources,
            "workloads": [rt.to_dict() for rt in runtime],
            "metrics": metrics,
            "alerts": alerts,
        }

    def snapshot(self) -> dict:
        return self._last_snapshot or self.step()
