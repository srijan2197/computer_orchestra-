import { ShieldCheck } from 'lucide-react'

export default function SafetyPartition({ resources, reserve }) {
  const entries = Object.entries(resources || {})
  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-rose-400" />
          <h2 className="font-semibold text-sm">Safety-Aware Partitioning</h2>
        </div>
        <span className="text-[11px] text-slate-400 font-mono">ASIL reserve {Math.round(reserve * 100)}%</span>
      </div>

      <div className="space-y-3">
        {entries.map(([name, d]) => {
          const cap = d.capacity
          const asilPct = (d.asil_used / cap) * 100
          const qmPct = (d.qm_used / cap) * 100
          const reservePct = reserve * 100
          return (
            <div key={name}>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="font-medium text-slate-300">{name}</span>
                <span className={`font-mono ${d.asil_satisfied ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {d.asil_satisfied ? 'ASIL protected' : 'ASIL AT RISK'}
                </span>
              </div>
              <div className="relative h-5 rounded-md bg-slate-800 overflow-hidden">
                <div className="absolute top-0 h-full border-r-2 border-dashed border-rose-400/60 z-20"
                     style={{ left: `${reservePct}%` }} title="ASIL reserved boundary" />
                <div className="absolute top-0 left-0 h-full bg-rose-500/70 z-10 transition-all duration-500" style={{ width: `${asilPct}%` }} />
                <div className="absolute top-0 h-full bg-sky-500/60 z-10 transition-all duration-500" style={{ left: `${asilPct}%`, width: `${qmPct}%` }} />
              </div>
              <div className="flex justify-between text-[10px] text-slate-500 mt-0.5 font-mono">
                <span className="text-rose-300">ASIL {Math.round(asilPct)}%</span>
                <span className="text-sky-300">QM {Math.round(qmPct)}%</span>
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-3 pt-2 border-t border-edge flex items-center gap-4 text-[10px] text-slate-400">
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-rose-500/70" /> ASIL (safety-critical)</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-sky-500/60" /> QM (best-effort)</span>
        <span className="flex items-center gap-1"><span className="w-3 border-r-2 border-dashed border-rose-400/60 h-3 inline-block" /> reserve boundary</span>
      </div>
    </div>
  )
}
