import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { BrainCircuit } from 'lucide-react'

export default function PredictionChart({ history, resource = 'CPU' }) {
  const color = { CPU: '#38bdf8', GPU: '#a78bfa', NPU: '#34d399' }[resource]
  return (
    <div className="card p-4">
      <div className="flex items-center gap-2 mb-2">
        <BrainCircuit className="w-4 h-4 text-indigo-300" />
        <h2 className="font-semibold text-sm">AI Workload Prediction — {resource}</h2>
      </div>
      <ResponsiveContainer width="100%" height={180}>
        <LineChart data={history} margin={{ top: 5, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
          <XAxis dataKey="tick" stroke="#475569" tick={{ fontSize: 10 }} />
          <YAxis domain={[0, 100]} stroke="#475569" tick={{ fontSize: 10 }} />
          <Tooltip contentStyle={{ background: '#111827', border: '1px solid #1f2937', borderRadius: 8, fontSize: 11 }} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <Line type="monotone" dataKey={resource} name="actual" stroke={color} strokeWidth={2} dot={false} isAnimationActive={false} />
          <Line type="monotone" dataKey={`${resource}_pred`} name="forecast" stroke="#fbbf24" strokeWidth={2} strokeDasharray="5 4" dot={false} isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
