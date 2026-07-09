import { Cpu, Activity, ShieldCheck, ShieldAlert, ShieldX, Wifi, WifiOff, Sun, Moon } from 'lucide-react'
import MadBuddiesMascot from './MadBuddiesMascot'

const STATUS = {
  NOMINAL: { label: 'NOMINAL', cls: 'text-emerald-400', Icon: ShieldCheck, ring: 'bg-emerald-500/15 border-emerald-500/40' },
  DEGRADED: { label: 'DEGRADED', cls: 'text-amber-400', Icon: ShieldAlert, ring: 'bg-amber-500/15 border-amber-500/40' },
  VIOLATION: { label: 'SAFETY VIOLATION', cls: 'text-rose-400', Icon: ShieldX, ring: 'bg-rose-500/15 border-rose-500/40' },
}

export default function Header({ snapshot, connected, light, onToggleTheme }) {
  const status = snapshot?.metrics?.safety_status || 'NOMINAL'
  const s = STATUS[status] || STATUS.NOMINAL
  const S = s.Icon

  return (
    <header className="flex flex-wrap items-center justify-between gap-4 px-6 py-4 border-b border-edge bg-panel2/60 backdrop-blur">
      <div className="flex items-center gap-3">
        <div className="grid place-items-center w-11 h-11 rounded-xl bg-gradient-to-br from-sky-500/30 to-indigo-600/30 border border-sky-500/30">
          <Cpu className="w-6 h-6 text-sky-300" />
        </div>
        <div>
          <h1 className="text-lg font-semibold tracking-tight leading-tight">
            Cross-Domain Software Orchestration Layer
          </h1>
          <p className="text-xs text-slate-400 -mt-0.5">
            Adaptive CPU / GPU / NPU scheduling · ASIL &amp; QM mixed-criticality
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Mad_buddies branding */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-indigo-500/30 bg-indigo-500/10">
          <MadBuddiesMascot className="w-8 h-8 flex-shrink-0" />
          <div className="leading-tight">
            <p className="text-[10px] text-slate-500 uppercase tracking-widest">Developed by</p>
            <p className="text-sm font-bold text-indigo-300 tracking-wide">Mad_buddies</p>
          </div>
        </div>

        <button onClick={onToggleTheme} title="Toggle light/dark mode"
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-edge bg-panel hover:border-slate-500 transition">
          {light ? <Moon className="w-4 h-4 text-indigo-400" /> : <Sun className="w-4 h-4 text-amber-400" />}
          <span className="text-xs text-slate-400">{light ? 'Dark' : 'Light'}</span>
        </button>

        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${s.ring}`}>
          <S className={`w-4 h-4 ${s.cls}`} />
          <span className={`text-sm font-semibold ${s.cls}`}>{s.label}</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-edge bg-panel">
          <Activity className="w-4 h-4 text-slate-400" />
          <span className="text-sm font-mono text-slate-300">tick {snapshot?.tick ?? 0}</span>
        </div>
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${connected ? 'border-emerald-500/40 bg-emerald-500/10' : 'border-rose-500/40 bg-rose-500/10'}`}>
          {connected ? <Wifi className="w-4 h-4 text-emerald-400 live-dot" /> : <WifiOff className="w-4 h-4 text-rose-400" />}
          <span className={`text-xs font-medium ${connected ? 'text-emerald-400' : 'text-rose-400'}`}>
            {connected ? 'LIVE' : 'RECONNECTING'}
          </span>
        </div>
      </div>
    </header>
  )
}
