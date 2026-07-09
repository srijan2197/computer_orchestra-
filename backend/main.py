"""
Cross-Domain Software Orchestration Layer — API.
"""

import asyncio
import json
from contextlib import asynccontextmanager
from typing import Set

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from core.catalog import SCENARIOS
from core.simulator import Simulator

SIM_INTERVAL = 1.0

sim = Simulator()


class ConnectionManager:
    def __init__(self) -> None:
        self.active: Set[WebSocket] = set()

    async def connect(self, ws: WebSocket) -> None:
        await ws.accept()
        self.active.add(ws)

    def disconnect(self, ws: WebSocket) -> None:
        self.active.discard(ws)

    async def broadcast(self, message: dict) -> None:
        dead = []
        data = json.dumps(message)
        for ws in list(self.active):
            try:
                await ws.send_text(data)
            except Exception:
                dead.append(ws)
        for ws in dead:
            self.disconnect(ws)


manager = ConnectionManager()


async def _sim_loop() -> None:
    while True:
        snapshot = sim.step()
        await manager.broadcast(snapshot)
        await asyncio.sleep(SIM_INTERVAL)


@asynccontextmanager
async def lifespan(app: FastAPI):
    task = asyncio.create_task(_sim_loop())
    yield
    task.cancel()


app = FastAPI(title="Cross-Domain Software Orchestration Layer", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ControlRequest(BaseModel):
    action: str
    value: str | float | bool | None = None
    workload_id: str | None = None


@app.get("/health")
def health():
    return {"status": "ok", "service": "orchestration-layer", "tick": sim.tick}


@app.get("/config")
def config():
    return {
        "platform": sim.platform,
        "scenarios": SCENARIOS,
        "workloads": [
            {"id": s.id, "name": s.name, "domain": s.domain, "asil": s.asil,
             "priority": s.priority, "deadline_ms": s.deadline_ms}
            for s in sim.specs
        ],
    }


@app.get("/state")
def state():
    return sim.snapshot()


def _apply_control(req: ControlRequest) -> dict:
    a = req.action
    if a == "scenario" and isinstance(req.value, str):
        sim.set_scenario(req.value)
    elif a == "reserve" and req.value is not None:
        sim.set_reserve(float(req.value))
    elif a == "toggle" and req.workload_id:
        enabled = req.value if isinstance(req.value, bool) else None
        sim.toggle_workload(req.workload_id, enabled)
    elif a == "spike" and req.workload_id:
        sim.inject_spike(req.workload_id)
    elif a == "running" and req.value is not None:
        sim.set_running(bool(req.value))
    return {"ok": True, "action": a}


@app.post("/control")
def control(req: ControlRequest):
    return _apply_control(req)


@app.websocket("/ws")
async def websocket_endpoint(ws: WebSocket):
    await manager.connect(ws)
    try:
        await ws.send_text(json.dumps(sim.snapshot()))
        while True:
            raw = await ws.receive_text()
            try:
                msg = json.loads(raw)
                _apply_control(ControlRequest(**msg))
                await ws.send_text(json.dumps(sim.snapshot()))
            except Exception:
                pass
    except WebSocketDisconnect:
        manager.disconnect(ws)
    except Exception:
        manager.disconnect(ws)
