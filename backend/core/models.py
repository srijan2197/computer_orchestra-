"""
Core data models for the Cross-Domain Software Orchestration Layer.
"""

from dataclasses import dataclass, field
from enum import Enum
from typing import Dict


class Resource(str, Enum):
    CPU = "CPU"
    GPU = "GPU"
    NPU = "NPU"


ASIL_WEIGHT: Dict[str, int] = {
    "QM": 0,
    "A": 1,
    "B": 2,
    "C": 3,
    "D": 4,
}


@dataclass
class WorkloadSpec:
    id: str
    name: str
    domain: str
    asil: str
    priority: int
    deadline_ms: float
    base_latency_ms: float
    demand: Dict[str, float]
    intensity: Dict[str, float]
    enabled: bool = True

    @property
    def asil_weight(self) -> int:
        return ASIL_WEIGHT.get(self.asil, 0)

    @property
    def is_safety_critical(self) -> bool:
        return self.asil != "QM"


@dataclass
class RuntimeWorkload:
    spec: WorkloadSpec
    demand: Dict[str, float] = field(default_factory=dict)
    allocated: Dict[str, float] = field(default_factory=dict)
    service_ratio: float = 1.0
    latency_ms: float = 0.0
    deadline_met: bool = True
    throttled: bool = False

    def to_dict(self) -> dict:
        return {
            "id": self.spec.id,
            "name": self.spec.name,
            "domain": self.spec.domain,
            "asil": self.spec.asil,
            "priority": self.spec.priority,
            "deadline_ms": self.spec.deadline_ms,
            "enabled": self.spec.enabled,
            "safety_critical": self.spec.is_safety_critical,
            "demand": {k: round(v, 1) for k, v in self.demand.items()},
            "allocated": {k: round(v, 1) for k, v in self.allocated.items()},
            "service_ratio": round(self.service_ratio, 3),
            "latency_ms": round(self.latency_ms, 1),
            "deadline_met": self.deadline_met,
            "throttled": self.throttled,
        }
