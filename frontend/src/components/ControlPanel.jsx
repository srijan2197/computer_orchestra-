import { Building2, Gauge, ParkingSquare, Siren, Pause, Play, ShieldHalf } from 'lucide-react'

const SCENARIOS = [
  { id: 'idle', label: 'Parked', Icon: Pause },
  { id: 'city', label: 'City', Icon: Building2 },
  { id: 'highway', label: 'Highway', Icon: Gauge },
  { id: 'parking', label: 'Parking', Icon: ParkingSquare },
  { id: 'emergency', label: 'Emergency', Icon: Siren },
]

export default function ControlPanel({ snapshot, onControl }) {
  const scenario = snapshot?.scenario
  const reserve = snapshot?.asil_reserve ?? 0.7
  const running = snapshot?.running

  return (
    <div className="card p-4">
      <h2 className="font-semibold text-sm mb-3">Orchestration Controls</h2>

      <div className="text-[11px] text-slate-400 mb-1.5">Driving Scenario</div>
      <div className="grid grid-cols-5 gap-1.5 mb-4">
        {SCENARIOS.map(({ id, label, Icon }) => (
          <button key={id} onClick={() => onControl({ action: 'scenario', value: id })}
            className={`flex flex-col items-center gap-1 py-2 rounded-lg border text-[10px] transition
              ${scenario === id ? 'border-sky-500/60 bg-sky-500/15 text-sky-200' : 'border-edge bg-panel hover:border-slate-600 text-slate-400'}`}>
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5">
        <span className="flex items-center gap-1"><ShieldHalf className="w-3.5 h-3.5 text-rose-400" /> ASIL Reserve</span>
        <span className="font-mono text-rose-300">{Math.round(reserve * 100)}%</span>
      </div>
      <input type="range" min="0.3" max="0.9" step="0.05" value={reserve}
        onChange={(e) => onControl({ action: 'reserve', value: parseFloat(e.target.value) })}
        className="w-full accent-rose-500 mb-4" />

      <button onClick={() => onControl({ action: 'running', value: !running })}
        className={`w-full flex items-center justify-center gap-2 py-2 rounded-lg border text-sm font-medium
          ${running ? 'border-amber-500/50 bg-amber-500/15 text-amber-300' : 'border-emerald-500/50 bg-emerald-500/15 text-emerald-300'}`}>
        {running ? <><Pause className="w-4 h-4" /> Pause Simulation</> : <><Play className="w-4 h-4" /> Resume Simulation</>}
      </button>
    </div>
  )
}
