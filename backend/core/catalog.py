"""
Shared vehicle compute platform definition + automotive workload catalog.
"""

from typing import Dict, List

from .models import Resource, WorkloadSpec

PLATFORM: Dict[str, float] = {
    Resource.CPU.value: 900.0,
    Resource.GPU.value: 800.0,
    Resource.NPU.value: 1200.0,
}

SCENARIOS: List[str] = ["idle", "city", "highway", "parking", "emergency"]

WORKLOADS: List[WorkloadSpec] = [
    WorkloadSpec(
        id="aeb", name="Automatic Emergency Braking", domain="ADAS", asil="D",
        priority=10, deadline_ms=10, base_latency_ms=5,
        demand={"CPU": 120, "GPU": 0, "NPU": 180},
        intensity={"idle": 0.10, "city": 0.6, "highway": 0.5, "parking": 0.3, "emergency": 2.0},
    ),
    WorkloadSpec(
        id="acc", name="Adaptive Cruise Control", domain="ADAS", asil="C",
        priority=9, deadline_ms=20, base_latency_ms=8,
        demand={"CPU": 100, "GPU": 0, "NPU": 120},
        intensity={"idle": 0.0, "city": 0.4, "highway": 1.0, "parking": 0.0, "emergency": 1.2},
    ),
    WorkloadSpec(
        id="lka", name="Lane Keeping Assist", domain="ADAS", asil="C",
        priority=9, deadline_ms=30, base_latency_ms=12,
        demand={"CPU": 60, "GPU": 150, "NPU": 140},
        intensity={"idle": 0.0, "city": 0.6, "highway": 1.0, "parking": 0.0, "emergency": 1.1},
    ),
    WorkloadSpec(
        id="fusion", name="Sensor Fusion", domain="ADAS", asil="B",
        priority=8, deadline_ms=30, base_latency_ms=12,
        demand={"CPU": 160, "GPU": 120, "NPU": 160},
        intensity={"idle": 0.2, "city": 1.0, "highway": 0.9, "parking": 0.7, "emergency": 1.4},
    ),
    WorkloadSpec(
        id="dms", name="Driver Monitoring System", domain="Cockpit", asil="B",
        priority=7, deadline_ms=40, base_latency_ms=15,
        demand={"CPU": 40, "GPU": 60, "NPU": 150},
        intensity={"idle": 0.3, "city": 1.0, "highway": 1.0, "parking": 0.8, "emergency": 1.2},
    ),
    WorkloadSpec(
        id="surround", name="Surround View / Parking Assist", domain="ADAS", asil="B",
        priority=7, deadline_ms=50, base_latency_ms=18,
        demand={"CPU": 60, "GPU": 220, "NPU": 100},
        intensity={"idle": 0.0, "city": 0.3, "highway": 0.1, "parking": 1.5, "emergency": 0.5},
    ),
    WorkloadSpec(
        id="cluster", name="Digital Instrument Cluster", domain="Cockpit", asil="A",
        priority=6, deadline_ms=16, base_latency_ms=8,
        demand={"CPU": 50, "GPU": 180, "NPU": 0},
        intensity={"idle": 0.5, "city": 1.0, "highway": 1.0, "parking": 1.0, "emergency": 1.0},
    ),
    WorkloadSpec(
        id="nav", name="Navigation", domain="Infotainment", asil="QM",
        priority=5, deadline_ms=100, base_latency_ms=40,
        demand={"CPU": 120, "GPU": 80, "NPU": 0},
        intensity={"idle": 0.3, "city": 1.0, "highway": 1.0, "parking": 0.6, "emergency": 0.8},
    ),
    WorkloadSpec(
        id="media", name="Infotainment Media", domain="Infotainment", asil="QM",
        priority=3, deadline_ms=100, base_latency_ms=45,
        demand={"CPU": 100, "GPU": 120, "NPU": 0},
        intensity={"idle": 0.8, "city": 1.0, "highway": 1.0, "parking": 0.5, "emergency": 0.3},
    ),
    WorkloadSpec(
        id="voice", name="Voice Assistant", domain="Infotainment", asil="QM",
        priority=4, deadline_ms=200, base_latency_ms=60,
        demand={"CPU": 90, "GPU": 0, "NPU": 130},
        intensity={"idle": 0.4, "city": 0.8, "highway": 0.8, "parking": 0.4, "emergency": 0.5},
    ),
    WorkloadSpec(
        id="ota", name="OTA Update Agent", domain="Connectivity", asil="QM",
        priority=2, deadline_ms=1000, base_latency_ms=200,
        demand={"CPU": 140, "GPU": 0, "NPU": 0},
        intensity={"idle": 1.0, "city": 0.3, "highway": 0.5, "parking": 0.2, "emergency": 0.0},
    ),
    WorkloadSpec(
        id="appstore", name="Connected Apps", domain="Infotainment", asil="QM",
        priority=1, deadline_ms=500, base_latency_ms=120,
        demand={"CPU": 80, "GPU": 40, "NPU": 20},
        intensity={"idle": 0.6, "city": 0.7, "highway": 0.7, "parking": 0.4, "emergency": 0.2},
    ),
]


def fresh_catalog() -> List[WorkloadSpec]:
    import copy
    return copy.deepcopy(WORKLOADS)
