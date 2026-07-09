import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine } from 'recharts'

const TT = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-panel border border-edge rounded-lg px-3 py-2 text-[11px]">
      <div className="text-slate-400 mb-1">tick {label}</div>
      {payload.map((p) => (
        <div key={p.name} style={{ color: p.color }} className="font-mono">{p.name}: {p.value}%</div>
      ))}
    </div>
  )
}

export default function UtilizationChart({ history }) {
  return (
    <div className="card p-4">
      <h2 className="font-semibold text-sm mb-2">Real-Time Utilisation (CPU / GPU / NPU)</h2>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={history} margin={{ top: 5, right: 8, left: -20, bottom: 0 }}>
          <defs>
            {['CPU', 'GPU', 'NPU'].map((k, i) => (
              <linearGradient id={`g${k}`} key={k} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={['#38bdf8', '#a78bfa', '#34d399'][i]} stopOpacity={0.5} />
                <stop offset="100%" stopColor={['#38bdf8', '#a78bfa', '#34d399'][i]} stopOpacity={0.02} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
          <XAxis dataKey="tick" stroke="#475569" tick={{ fontSize: 10 }} />
          <YAxis domain={[0, 100]} stroke="#475569" tick={{ fontSize: 10 }} />
          <Tooltip content={<TT />} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <ReferenceLine y={100} stroke="#f43f5e" strokeDasharray="4 4" />
          <Area type="monotone" dataKey="CPU" stroke="#38bdf8" fill="url(#gCPU)" strokeWidth={2} isAnimationActive={false} />
          <Area type="monotone" dataKey="GPU" stroke="#a78bfa" fill="url(#gGPU)" strokeWidth={2} isAnimationActive={false} />
          <Area type="monotone" dataKey="NPU" stroke="#34d399" fill="url(#gNPU)" strokeWidth={2} isAnimationActive={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
