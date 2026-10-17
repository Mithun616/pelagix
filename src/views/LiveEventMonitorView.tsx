import React from 'react';
import { 
  Radio, 
  Activity, 
  AlertTriangle, 
  Droplets, 
  Waves, 
  Network, 
  Play, 
  RotateCcw, 
  ArrowRight, 
  Sliders, 
  ShieldAlert,
  Info,
  Clock,
  ExternalLink
} from 'lucide-react';
import { Region, LiveEvent, SimulationState, IPCCScenario, ProjectionYear } from '../types/index.ts';
import { calculateRiskScore, DEFAULT_RISK_WEIGHTS } from '../utils/riskScoring.ts';

interface LiveEventMonitorViewProps {
  regions: Region[];
  selectedRegion: Region;
  onSelectRegion: (r: Region) => void;
  liveEvents: LiveEvent[];
  simulationState: SimulationState;
  onUpdateSimulation: (updater: (prev: SimulationState) => SimulationState) => void;
  onResetSimulation: () => void;
  selectedScenario: IPCCScenario;
  selectedYear: ProjectionYear;
}

export const LiveEventMonitorView: React.FC<LiveEventMonitorViewProps> = ({
  regions,
  selectedRegion,
  onSelectRegion,
  liveEvents,
  simulationState,
  onUpdateSimulation,
  onResetSimulation,
  selectedScenario,
  selectedYear,
}) => {
  // Calculate Baseline vs Simulated Risk Score for selected region
  const baselineScore = calculateRiskScore(
    selectedRegion,
    selectedScenario,
    selectedYear,
    DEFAULT_RISK_WEIGHTS,
    0,
    0
  );

  const simulatedScore = calculateRiskScore(
    selectedRegion,
    selectedScenario,
    selectedYear,
    DEFAULT_RISK_WEIGHTS,
    simulationState.closedRoadIds.length,
    simulationState.simulatedSeaLevelSurgeCm
  );

  const deltaScore = simulatedScore.totalScore - baselineScore.totalScore;

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-900/80 p-4 rounded-xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <Radio className="w-5 h-5 text-cyan-400" />
              <span>Operational Telemetry & Live Event Monitor</span>
            </h1>
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
              Verified Pipeline
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Near-real-time observations from NOAA CO-OPS, UNESCO-IOC, and NASA GPM IMERG, with isolated demonstration sandbox.
          </p>
        </div>

        {/* Basin Selector */}
        <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 text-xs">
          <span className="text-slate-500 uppercase font-mono text-[10px]">Basin Focus</span>
          <select
            value={selectedRegion.id}
            onChange={e => {
              const r = regions.find(item => item.id === e.target.value);
              if (r) onSelectRegion(r);
            }}
            className="bg-transparent text-slate-200 font-medium focus:outline-none"
          >
            {regions.map(r => (
              <option key={r.id} value={r.id} className="bg-slate-900">
                {r.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* DEMONSTRATION SANDBOX (Explicitly Separated & Labelled) */}
      <div className="bg-gradient-to-br from-amber-950/40 via-slate-900/90 to-slate-900/90 border-2 border-amber-600/60 rounded-xl p-5 space-y-5 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-900/40 pb-3">
          <div className="flex items-center gap-2.5">
            <span className="w-3 h-3 rounded-full bg-amber-500 animate-ping"></span>
            <h2 className="text-base font-extrabold text-amber-300 tracking-wide font-mono uppercase flex items-center gap-2">
              <span>Demonstration Sandbox: Operational Impact Stress-Testing</span>
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-900/60 text-amber-200 border border-amber-700 uppercase font-bold">
              SIMULATED ENVIRONMENT
            </span>
            {simulationState.active && (
              <button
                onClick={onResetSimulation}
                className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Sandbox</span>
              </button>
            )}
          </div>
        </div>

        <p className="text-xs text-amber-200/90 leading-relaxed">
          Test how extreme precipitation pulses, localized tidal surge, and arterial road disruptions ripple through the priority ranking and isolate hospitals in <strong>{selectedRegion.name}</strong>. All scenario modifications below are strictly simulated demonstrations.
        </p>

        {/* Sandbox Controls Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* 1. Heavy Rainfall Pulse */}
          <div className="p-3.5 bg-slate-950/80 rounded-lg border border-amber-900/40 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                <Droplets className="w-3.5 h-3.5 text-cyan-400" />
                <span>Rainfall Pulse</span>
              </span>
              <span className="font-mono text-cyan-300 font-bold">{simulationState.simulatedRainfallMm} mm/6h</span>
            </div>
            <input
              type="range"
              min="0"
              max="150"
              step="10"
              value={simulationState.simulatedRainfallMm}
              onChange={e =>
                onUpdateSimulation(prev => ({
                  ...prev,
                  active: true,
                  simulatedRainfallMm: parseInt(e.target.value),
                }))
              }
              className="w-full accent-cyan-500"
            />
            <div className="text-[10px] text-slate-500 flex justify-between font-mono">
              <span>0mm (Dry)</span>
              <span>150mm (Extreme)</span>
            </div>
          </div>

          {/* 2. Storm Surge Offset */}
          <div className="p-3.5 bg-slate-950/80 rounded-lg border border-amber-900/40 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                <Waves className="w-3.5 h-3.5 text-blue-400" />
                <span>Coastal Surge</span>
              </span>
              <span className="font-mono text-blue-300 font-bold">+{simulationState.simulatedSeaLevelSurgeCm} cm</span>
            </div>
            <input
              type="range"
              min="0"
              max="80"
              step="5"
              value={simulationState.simulatedSeaLevelSurgeCm}
              onChange={e =>
                onUpdateSimulation(prev => ({
                  ...prev,
                  active: true,
                  simulatedSeaLevelSurgeCm: parseInt(e.target.value),
                }))
              }
              className="w-full accent-blue-500"
            />
            <div className="text-[10px] text-slate-500 flex justify-between font-mono">
              <span>0 cm</span>
              <span>+80 cm Surge</span>
            </div>
          </div>

          {/* 3. Road Segment Closures */}
          <div className="p-3.5 bg-slate-950/80 rounded-lg border border-amber-900/40 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                <Network className="w-3.5 h-3.5 text-rose-400" />
                <span>Road Closures</span>
              </span>
              <span className="font-mono text-rose-300 font-bold">{simulationState.closedRoadIds.length} Closed</span>
            </div>
            <select
              onChange={e => {
                const roadId = e.target.value;
                if (!roadId) return;
                onUpdateSimulation(prev => {
                  const exists = prev.closedRoadIds.includes(roadId);
                  return {
                    ...prev,
                    active: true,
                    closedRoadIds: exists
                      ? prev.closedRoadIds.filter(id => id !== roadId)
                      : [...prev.closedRoadIds, roadId],
                  };
                });
              }}
              className="w-full bg-slate-900 border border-slate-700 text-xs rounded p-1.5 text-slate-200"
            >
              <option value="">+ Toggle Road Segment...</option>
              {selectedRegion.roadEdges.map(edge => (
                <option key={edge.id} value={edge.id}>
                  {edge.id.replace('edge-', '').replace('-', ' ').toUpperCase()} ({edge.distanceKm}km)
                </option>
              ))}
            </select>
            <div className="text-[10px] text-slate-500 font-mono">
              {simulationState.closedRoadIds.length === 0 ? 'All arterials passable' : 'Severance simulated'}
            </div>
          </div>

          {/* 4. Shelter Occupancy Strain */}
          <div className="p-3.5 bg-slate-950/80 rounded-lg border border-amber-900/40 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-purple-400" />
                <span>Shelter Load</span>
              </span>
              <span className="font-mono text-purple-300 font-bold">{simulationState.shelterOccupancyPercent}%</span>
            </div>
            <input
              type="range"
              min="20"
              max="100"
              step="5"
              value={simulationState.shelterOccupancyPercent}
              onChange={e =>
                onUpdateSimulation(prev => ({
                  ...prev,
                  active: true,
                  shelterOccupancyPercent: parseInt(e.target.value),
                }))
              }
              className="w-full accent-purple-500"
            />
            <div className="text-[10px] text-slate-500 flex justify-between font-mono">
              <span>20% (Normal)</span>
              <span>100% (Critical)</span>
            </div>
          </div>
        </div>

        {/* Dynamic Delta Comparison Strip */}
        <div className="p-4 bg-slate-950/90 rounded-lg border border-amber-900/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-0.5">
            <span className="text-[11px] uppercase font-mono tracking-wider text-amber-400 font-semibold">
              Real-Time Impact Delta Analysis
            </span>
            <div className="text-xs text-slate-300">
              Comparing Baseline Conditions vs Current Operational Simulation
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs font-mono">
            <div className="text-center">
              <span className="text-slate-500 text-[10px] block">Baseline Score</span>
              <span className="text-xl font-bold text-slate-300">{baselineScore.totalScore}</span>
            </div>

            <ArrowRight className="w-4 h-4 text-amber-400" />

            <div className="text-center">
              <span className="text-amber-400 text-[10px] block font-semibold">Simulated Score</span>
              <span className={`text-xl font-bold ${
                simulatedScore.totalScore > 75 ? 'text-rose-400' : 'text-amber-300'
              }`}>
                {simulatedScore.totalScore}
              </span>
            </div>

            <div className="text-center pl-3 border-l border-slate-800">
              <span className="text-slate-500 text-[10px] block">Score Shift</span>
              <span className={`text-lg font-bold ${deltaScore > 0 ? 'text-rose-400' : 'text-slate-400'}`}>
                {deltaScore > 0 ? `+${deltaScore}` : '0'} pts
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Verified Real-Time Operational Event Feed */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              <span>Verified Near-Real-Time Stream ({liveEvents.length} Active Records)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Official station telemetry and satellite precipitation products; latency explicitly recorded.
            </p>
          </div>
          <span className="text-[10px] font-mono text-slate-400">
            Updated: 2026-10-15 09:30Z
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {liveEvents.map(evt => (
            <div
              key={evt.id}
              className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2 hover:border-slate-700 transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="font-semibold text-slate-100 text-xs">{evt.title}</span>
                <span className={`text-[9px] font-mono px-2 py-0.5 rounded uppercase font-semibold shrink-0 ${
                  evt.status === 'LIVE' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                  evt.status === 'DELAYED' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                  'bg-slate-800 text-slate-300'
                }`}>
                  {evt.status}
                </span>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">
                {evt.details}
              </p>

              <div className="pt-2 border-t border-slate-900 flex items-center justify-between text-[10px] font-mono text-slate-500">
                <span className="text-slate-400">{evt.regionName}</span>
                <span>Source: {evt.source}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Disclaimer Banner */}
        <div className="p-3 bg-slate-950/90 rounded-lg border border-slate-800 text-xs text-slate-400 flex items-start gap-2">
          <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <p className="text-[11px] leading-tight">
            <strong>Regulatory & Public Safety Notice:</strong> PELAGIX telemetry feeds and risk rankings provide analytical decision-support for planning personnel. They do not supersede official National Meteorological Service advisories or local emergency management evacuation directives.
          </p>
        </div>
      </div>
    </div>
  );
};
