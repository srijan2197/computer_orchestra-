"""
Adaptive, safety-aware resource scheduler.
"""

from typing import Dict, List

from .models import Resource, RuntimeWorkload


def effective_priority(rt: RuntimeWorkload) -> float:
    spec = rt.spec
    deadline_urgency = 1000.0 / max(spec.deadline_ms, 1.0)
    return spec.asil_weight * 10_000 + spec.priority * 100 + deadline_urgency


def _allocate_resource(resource: str, capacity: float, ordered: List[RuntimeWorkload]) -> float:
    remaining = capacity
    for rt in ordered:
        want = rt.demand.get(resource, 0.0)
        if want <= 0:
            rt.allocated[resource] = 0.0
            continue
        grant = min(want, remaining)
        rt.allocated[resource] = grant
        remaining -= grant
    return capacity - remaining


def schedule(workloads: List[RuntimeWorkload], platform: Dict[str, float], asil_reserve: float = 0.7) -> dict:
    active = [w for w in workloads if w.spec.enabled]
    asil_workers = sorted([w for w in active if w.spec.is_safety_critical], key=effective_priority, reverse=True)
    qm_workers = sorted([w for w in active if not w.spec.is_safety_critical], key=effective_priority, reverse=True)

    summary: Dict[str, dict] = {}

    for resource, capacity in platform.items():
        asil_demand = sum(w.demand.get(resource, 0.0) for w in active if w.spec.is_safety_critical)
        qm_demand = sum(w.demand.get(resource, 0.0) for w in active if not w.spec.is_safety_critical)

        asil_pool = capacity * asil_reserve
        qm_pool = capacity - asil_pool

        asil_used = _allocate_resource(resource, asil_pool, asil_workers)
        leftover = asil_pool - asil_used
        qm_used = _allocate_resource(resource, qm_pool + leftover, qm_workers)
        used = asil_used + qm_used

        summary[resource] = {
            "capacity": round(capacity, 1),
            "used": round(used, 1),
            "util": round(used / capacity, 3) if capacity else 0.0,
            "asil_used": round(asil_used, 1),
            "qm_used": round(qm_used, 1),
            "asil_demand": round(asil_demand, 1),
            "qm_demand": round(qm_demand, 1),
            "reserved_asil": round(capacity * asil_reserve, 1),
            "asil_satisfied": asil_used >= asil_demand - 1e-6,
            "saturated": used >= capacity - 1e-6,
        }

    for rt in active:
        ratios = []
        for resource, want in rt.demand.items():
            if want > 0:
                ratios.append(rt.allocated.get(resource, 0.0) / want)
        ratio = min(ratios) if ratios else 1.0
        rt.service_ratio = ratio
        rt.throttled = ratio < 0.999

        eff = max(ratio, 0.05)
        rt.latency_ms = rt.spec.base_latency_ms / eff
        rt.deadline_met = rt.latency_ms <= rt.spec.deadline_ms

    return summary
