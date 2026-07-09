import { useEffect, useRef, useState, useCallback } from 'react'

const WS_URL = 'ws://localhost:8000/ws'
const HISTORY = 40

export function useOrchestrator() {
  const [snapshot, setSnapshot] = useState(null)
  const [connected, setConnected] = useState(false)
  const [history, setHistory] = useState([])
  const wsRef = useRef(null)
  const lastTick = useRef(-1)

  useEffect(() => {
    let stopped = false

    const connect = () => {
      const ws = new WebSocket(WS_URL)
      wsRef.current = ws

      ws.onopen = () => setConnected(true)
      ws.onclose = () => {
        setConnected(false)
        if (!stopped) setTimeout(connect, 1500)
      }
      ws.onerror = () => ws.close()
      ws.onmessage = (evt) => {
        const data = JSON.parse(evt.data)
        setSnapshot(data)
        if (data.tick !== lastTick.current) {
          lastTick.current = data.tick
          setHistory((prev) => {
            const point = {
              tick: data.tick,
              CPU: Math.round(data.resources.CPU.util * 100),
              GPU: Math.round(data.resources.GPU.util * 100),
              NPU: Math.round(data.resources.NPU.util * 100),
              CPU_pred: Math.round(data.resources.CPU.predicted_util * 100),
              GPU_pred: Math.round(data.resources.GPU.predicted_util * 100),
              NPU_pred: Math.round(data.resources.NPU.predicted_util * 100),
              latency: data.metrics.avg_latency_ms,
              misses: data.metrics.deadline_misses,
            }
            return [...prev, point].slice(-HISTORY)
          })
        }
      }
    }

    connect()
    return () => {
      stopped = true
      wsRef.current?.close()
    }
  }, [])

  const send = useCallback((msg) => {
    const ws = wsRef.current
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(msg))
    }
  }, [])

  return { snapshot, connected, history, send }
}
