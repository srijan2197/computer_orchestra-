import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import { Cpu, Zap, Sparkles, TriangleAlert, BrainCircuit } from 'lucide-react'

const CFG = {
  CPU: { Icon: Cpu,      color: '#38bdf8', grad: 'gCPU2' },
  GPU: { Icon: Zap,      color: '#a78bfa', grad: 'gGPU2' },
  NPU: { Icon: Sparkles, color: '#34d399', grad: 'gNPU2' },
}

const TT = ({ active, payload, label, color }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: '#0f172a', border: `1px solid ${color}40`, borderRadius: 8, padding: '6px 10px', fontSize: 11 }}>
      <div style={{ color: '#64748b', marginBottom: 2 }}>tick {label}</div>
      {payload.map(p => (
        <div key={p.dataKey} style={{ color: p.color, fontFamily: 'monospace' }}>
          {p.name}: {p.value}%
        </div>
      ))}
    </div>
  )
}

export default function ResourceGraph({ name, data, history }) {
  const cfg = CFG[name] || CFG.CPU
  const Icon = cfg.Icon
  const util = Math.round(data.util * 100)
  const predUtil = Math.round(data.predicted_util * 100)
  const danger = data.saturated
  const warn = data.predict_saturation
  const anomaly = data.anomaly

  const utilColor = danger ? '#f43f5e' : util > 80 ? '#fbbf24' : cfg.color

  return (
    <div className={`card p-4 ${danger ? 'glow-asil' : ''}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4" style={{ color: cfg.color }} />
          <span className="font-bold text-sm font-mono" style={{ color: cfg.color }}>{name}</span>
          {anomaly && (
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 font-mono">ANOMALY</span>
          )}
        </div>
        <div className="text-right">
          <span className="text-3xl font-black font-mono" style={{ color: utilColor }}>{util}</span>
          <span className="text-xs text-slate-500">%</span>
        </div>
      </div>

      {/* Live chart */}
      <ResponsiveContainer width="100%" height={90}>
        <AreaChart data={history} margin={{ top: 2, right: 0, left: -28, bottom: 0 }}>
          <defs>
            <linearGradient id={cfg.grad} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={cfg.color} stopOpacity={0.4}/>
              <stop offset="100%" stopColor={cfg.color} stopOpacity={0.02}/>
            </linearGradient>
            <linearGradient id={`${cfg.grad}p`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#fbbf24" stopOpacity={0.3}/>
              <stop offset="100%" stopColor="#fbbf24" stopOpacity={0.02}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
          <XAxis dataKey="tick" stroke="#334155" tick={{ fontSize: 8 }} interval="preserveStartEnd" />
          <YAxis domain={[0, 100]} stroke="#334155" tick={{ fontSize: 8 }} />
          <Tooltip content={<TT color={cfg.color} />} />
          <ReferenceLine y={100} stroke="#f43f5e" strokeDasharray="3 3" strokeOpacity={0.5} />
          <Area type="monotone" dataKey={`${name}_pred`} name="forecast"
            stroke="#fbbf24" strokeWidth={1.5} strokeDasharray="4 3"
            fill={`url(#${cfg.grad}p)`} dot={false} isAnimationActive={false} />
          <Area type="monotone" dataKey={name} name="actual"
            stroke={cfg.color} strokeWidth={2}
            fill={`url(#${cfg.grad})`} dot={false} isAnimationActive={false} />
        </AreaChart>
      </ResponsiveContainer>

      {/* ASIL / QM mini bars */}
      <div className="mt-2 space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-[9px] text-slate-500 w-16 shrink-0">ASIL</span>
          <div className="flex-1 h-1.5 rounded-full bg-slate-800 overflow-hidden">
            <div className="h-full rounded-full transition-all duration-500"
              style={{ width: `${(data.asil_used/data.capacity)*100}%`, background: 'linear-gradient(90deg,#fb7185,#f43f5e)' }}/>
          </div>
          <span className="text-[9px] font-mono text-rose-300 w-8 text-right">{Math.round(data.asil_used)}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[9px] text-slate-500 w-16 shrink-0">QM</span>
          <div className="flex-1 h-1.5 rounded-full bg-slate-800 overflow-hidden">
            <div className="h-full rounded-full transition-all duration-500"
              style={{ width: `${(data.qm_used/data.capacity)*100}%`, background: 'linear-gradient(90deg,#38bdf8,#0ea5e9)' }}/>
          </div>
          <span className="text-[9px] font-mono text-sky-300 w-8 text-right">{Math.round(data.qm_used)}</span>
        </div>
      </div>

      {/* AI forecast footer */}
      <div className="mt-2 pt-2 border-t border-slate-800 flex items-center justify-between text-[10px]">
        <span className={`flex items-center gap-1 ${warn ? 'text-amber-400' : 'text-slate-500'}`}>
          <BrainCircuit className="w-3 h-3" />
          {warn && <TriangleAlert className="w-3 h-3" />}
          AI forecast: <span className="font-mono ml-0.5">{predUtil}%</span>
        </span>
        <span className="text-slate-600 font-mono">conf {Math.round(data.predict_confidence * 100)}%</span>
      </div>
    </div>
  )
}
