import { Gauge, Timer, ShieldOff, Layers } from 'lucide-react'

function Stat({ Icon, label, value, unit, tone = 'text-slate-200' }) {
  return (
    <div className="card p-3 flex items-center gap-3">
      <div className="grid place-items-center w-9 h-9 rounded-lg bg-slate-800/60 border border-edge">
        <Icon className="w-4 h-4 text-sky-300" />
      </div>
      <div>
        <div className="text-[10px] uppercase tracking-wide text-slate-500">{label}</div>
        <div className={`text-lg font-bold font-mono ${tone}`}>{value}<span className="text-xs text-slate-500 ml-0.5">{unit}</span></div>
      </div>
    </div>
  )
}

export default function MetricsSummary({ metrics }) {
  if (!metrics) return null
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <Stat Icon={Gauge} label="Platform Utilisation" value={Math.round(metrics.total_util * 100)} unit="%"
        tone={metrics.total_util > 0.9 ? 'text-amber-400' : 'text-emerald-400'} />
      <Stat Icon={Timer} label="Avg Latency" value={metrics.avg_latency_ms} unit="ms" />
      <Stat Icon={ShieldOff} label="Deadline Misses" value={metrics.deadline_misses} unit=""
        tone={metrics.deadline_misses ? 'text-rose-400' : 'text-emerald-400'} />
      <Stat Icon={Layers} label="Throttled (QM)" value={metrics.throttled_count} unit=""
        tone={metrics.throttled_count ? 'text-amber-400' : 'text-slate-200'} />
    </div>
  )
}
