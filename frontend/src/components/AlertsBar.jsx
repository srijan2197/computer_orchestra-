import { TriangleAlert } from 'lucide-react'

export default function AlertsBar({ alerts }) {
  if (!alerts?.length) return null
  return (
    <div className="card p-3 border-amber-500/30">
      <div className="flex items-start gap-2">
        <TriangleAlert className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px]">
          {alerts.map((a, i) => (
            <span key={i} className={a.startsWith('CRITICAL') ? 'text-rose-300 font-semibold' : 'text-amber-200'}>{a}</span>
          ))}
        </div>
      </div>
    </div>
  )
}
