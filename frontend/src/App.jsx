import { useState, useEffect } from 'react'
import Header from './components/Header'
import MetricsSummary from './components/MetricsSummary'
import ResourceCard from './components/ResourceCard'
import SafetyPartition from './components/SafetyPartition'
import WorkloadTable from './components/WorkloadTable'
import UtilizationChart from './components/UtilizationChart'
import PredictionChart from './components/PredictionChart'
import ControlPanel from './components/ControlPanel'
import AlertsBar from './components/AlertsBar'
import { useOrchestrator } from './useOrchestrator'
import { Loader2 } from 'lucide-react'

export default function App() {
  const { snapshot, connected, history, send } = useOrchestrator()
  const [light, setLight] = useState(false)

  useEffect(() => {
    document.documentElement.classList.toggle('light', light)
  }, [light])

  if (!snapshot) {
    return (
      <div className="h-full grid place-items-center text-slate-400">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-sky-400" />
          <p className="text-sm">Connecting to orchestration layer…</p>
          <p className="text-[11px] text-slate-600">start the backend: <code className="text-slate-400">uvicorn main:app --port 8000</code></p>
        </div>
      </div>
    )
  }

  const resources = snapshot.resources
  const control = (msg) => send(msg)

  return (
    <div className="min-h-full flex flex-col">
      <Header snapshot={snapshot} connected={connected} light={light} onToggleTheme={() => setLight(l => !l)} />

      <main className="flex-1 p-4 md:p-6 space-y-4">
        <MetricsSummary metrics={snapshot.metrics} />
        <AlertsBar alerts={snapshot.alerts} />

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <div className="xl:col-span-2 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(resources).map(([name, data]) => (
                <ResourceCard key={name} name={name} data={data} />
              ))}
            </div>
            <UtilizationChart history={history} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <PredictionChart history={history} resource="CPU" />
              <PredictionChart history={history} resource="NPU" />
            </div>
          </div>

          <div className="space-y-4">
            <ControlPanel snapshot={snapshot} onControl={control} />
            <SafetyPartition resources={resources} reserve={snapshot.asil_reserve} />
          </div>
        </div>

        <WorkloadTable
          workloads={snapshot.workloads}
          onSpike={(id) => control({ action: 'spike', workload_id: id })}
          onToggle={(id, enabled) => control({ action: 'toggle', workload_id: id, value: enabled })}
        />

        <footer className="text-center text-[11px] text-slate-600 pt-2">
          Cross-Domain Software Orchestration Layer · scenario: <span className="text-slate-400 font-mono">{snapshot.scenario}</span> · mixed-criticality ASIL/QM compute scheduling
        </footer>
      </main>
    </div>
  )
}
