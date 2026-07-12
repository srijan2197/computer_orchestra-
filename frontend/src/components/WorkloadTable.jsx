import { Power, ChevronsUp } from 'lucide-react'

const ASIL_COLOR = {
  D: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
  C: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
  B: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
  A: 'bg-yellow-500/20 text-yellow-200 border-yellow-500/40',
  QM: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
}

export default function WorkloadTable({ workloads, onSpike, onToggle }) {
  const rows = [...workloads].sort((a, b) => {
    const w = { D: 4, C: 3, B: 2, A: 1, QM: 0 }
    return (w[b.asil] - w[a.asil]) || (b.priority - a.priority)
  })

  return (
    <div className="card p-4 h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold text-sm">Workload Scheduling Table</h2>
        <span className="text-[11px] text-slate-500">{workloads.filter(w => w.enabled).length} active</span>
      </div>
      <div className="overflow-auto -mx-1 flex-1">
        <table className="w-full text-[12px]">
          <thead className="text-slate-400 sticky top-0 bg-panel">
            <tr className="text-left">
              <th className="py-1.5 px-1 font-medium">Application</th>
              <th className="px-1 font-medium">ASIL</th>
              <th className="px-1 font-medium">Service</th>
              <th className="px-1 font-medium">Latency</th>
              <th className="px-1 font-medium">Deadline</th>
              <th className="px-1 font-medium">ML Risk</th>
              <th className="px-1 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((w) => {
              const ratio = Math.round(w.service_ratio * 100)
              return (
                <tr key={w.id} className={`border-t border-edge/60 ${!w.enabled ? 'opacity-40' : ''}`}>
                  <td className="py-1.5 px-1">
                    <div className="font-medium text-slate-200">{w.name}</div>
                    <div className="text-[10px] text-slate-500">{w.domain} · P{w.priority}</div>
                  </td>
                  <td className="px-1">
                    <span className={`inline-block px-1.5 py-0.5 rounded border text-[10px] font-bold ${ASIL_COLOR[w.asil]}`}>{w.asil}</span>
                  </td>
                  <td className="px-1">
                    <div className="flex items-center gap-1">
                      <div className="w-12 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                        <div className={`h-full ${ratio >= 100 ? 'bg-emerald-500' : ratio > 60 ? 'bg-amber-500' : 'bg-rose-500'}`} style={{ width: `${ratio}%` }} />
                      </div>
                      <span className="font-mono text-[10px] text-slate-400">{ratio}%</span>
                    </div>
                  </td>
                  <td className="px-1 font-mono text-slate-300">{w.latency_ms}ms</td>
                  <td className="px-1">
                    <span className={`font-mono text-[11px] ${w.deadline_met ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {w.deadline_met ? '✓' : '✗'} {w.deadline_ms}ms
                    </span>
                  </td>
                  <td className="px-1">
                    {(() => {
                      const p = Math.round((w.miss_prob ?? 0) * 100)
                      const color = p >= 75 ? 'text-rose-400' : p >= 40 ? 'text-amber-400' : 'text-emerald-400'
                      return w.miss_prob != null
                        ? <span className={`font-mono text-[11px] font-semibold ${color}`}>{p}%</span>
                        : <span className="text-slate-600 text-[10px]">—</span>
                    })()}
                  </td>
                  <td className="px-1">
                    <div className="flex items-center justify-end gap-1">
                      <button title="Inject load spike" onClick={() => onSpike(w.id)}
                        className="p-1 rounded hover:bg-amber-500/20 text-amber-400 border border-transparent hover:border-amber-500/40">
                        <ChevronsUp className="w-3.5 h-3.5" />
                      </button>
                      <button title="Enable / disable" onClick={() => onToggle(w.id, !w.enabled)}
                        className={`p-1 rounded border border-transparent ${w.enabled ? 'text-emerald-400 hover:bg-emerald-500/20' : 'text-slate-500 hover:bg-slate-500/20'}`}>
                        <Power className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
