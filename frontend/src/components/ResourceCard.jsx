import { Cpu, Sparkles, Zap, TriangleAlert } from 'lucide-react'

const ICONS = { CPU: Cpu, GPU: Zap, NPU: Sparkles }

function Bar({ label, value, cap, color }) {
  const pct = cap ? Math.min(100, (value / cap) * 100) : 0
  return (
    <div className="mb-1.5">
      <div className="flex justify-between text-[11px] text-slate-400 mb-0.5">
        <span>{label}</span>
        <span className="font-mono">{Math.round(value)} / {Math.round(cap)} CU</span>
      </div>
      <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  )
}

export default function ResourceCard({ name, data }) {
  const Icon = ICONS[name] || Cpu
  const util = Math.round(data.util * 100)
  const predUtil = Math.round(data.predicted_util * 100)
  const danger = data.saturated
  const warn = data.predict_saturation

  return (
    <div className={`card p-4 ${danger ? 'glow-asil' : ''}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-sky-300" />
          <span className="font-semibold text-sm">{name}</span>
        </div>
        <span className={`text-2xl font-bold font-mono ${danger ? 'text-rose-400' : util > 80 ? 'text-amber-400' : 'text-emerald-400'}`}>
          {util}<span className="text-sm text-slate-500">%</span>
        </span>
      </div>

      <div className="h-2.5 rounded-full bg-slate-800 overflow-hidden mb-3 relative">
        <div className="h-full absolute left-0 top-0 bg-asil/70" style={{ width: `${(data.asil_used / data.capacity) * 100}%` }} />
        <div className="h-full absolute top-0 bg-qm/70" style={{ left: `${(data.asil_used / data.capacity) * 100}%`, width: `${(data.qm_used / data.capacity) * 100}%` }} />
      </div>

      <Bar label="ASIL (safety)" value={data.asil_used} cap={data.capacity} color="linear-gradient(90deg,#fb7185,#f43f5e)" />
      <Bar label="QM (best-effort)" value={data.qm_used} cap={data.capacity} color="linear-gradient(90deg,#38bdf8,#0ea5e9)" />

      <div className="mt-3 pt-2 border-t border-edge flex items-center justify-between text-[11px]">
        <span className={`flex items-center gap-1 ${warn ? 'text-amber-400' : 'text-slate-400'}`}>
          {warn && <TriangleAlert className="w-3 h-3" />}
          AI forecast: <span className="font-mono">{predUtil}%</span>
        </span>
        <span className="text-slate-500">conf {Math.round(data.predict_confidence * 100)}%</span>
      </div>
    </div>
  )
}
