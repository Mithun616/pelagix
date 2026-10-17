import React, { useState } from 'react';
import { 
  Sliders, 
  Layers, 
  TrendingUp, 
  Calendar, 
  HelpCircle, 
  CheckCircle2, 
  AlertTriangle,
  Info,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import { Region, IPCCScenario, ProjectionYear, IPCCProjection } from '../types/index.ts';

interface ScenarioExplorerViewProps {
  regions: Region[];
  selectedRegion: Region;
  onSelectRegion: (r: Region) => void;
  selectedScenario: IPCCScenario;
  onChangeScenario: (s: IPCCScenario) => void;
  selectedYear: ProjectionYear;
  onChangeYear: (y: ProjectionYear) => void;
}

export const ScenarioExplorerView: React.FC<ScenarioExplorerViewProps> = ({
  regions,
  selectedRegion,
  onSelectRegion,
  selectedScenario,
  onChangeScenario,
  selectedYear,
  onChangeYear,
}) => {
  const [compareScenario, setCompareScenario] = useState<IPCCScenario>('SSP5-8.5');

  const baselineProj = selectedRegion.projections.find(
    p => p.scenario === selectedScenario && p.year === selectedYear
  );

  const compProj = selectedRegion.projections.find(
    p => p.scenario === compareScenario && p.year === selectedYear
  );

  const scenarioMeta: Record<IPCCScenario, { title: string; desc: string; emissions: string; warming2100: string }> = {
    'SSP1-1.9': {
      title: 'Very Low Emissions / Paris 1.5°C Target',
      desc: 'Aggressive decarbonization achieving net-zero CO2 around 2050.',
      emissions: 'Very Low',
      warming2100: '~1.4°C',
    },
    'SSP1-2.6': {
      title: 'Low Emissions / Sustainable Transition',
      desc: 'Significant climate mitigation reaching net-zero in the second half of the 21st century.',
      emissions: 'Low',
      warming2100: '~1.8°C',
    },
    'SSP2-4.5': {
      title: 'Intermediate / Middle of the Road',
      desc: 'Historical societal and technological trends continue; intermediate emissions.',
      emissions: 'Medium',
      warming2100: '~2.7°C',
    },
    'SSP3-7.0': {
      title: 'High Emissions / Regional Rivalry',
      desc: 'Resurgent nationalism and food/energy security focus; emissions roughly double by 2100.',
      emissions: 'High',
      warming2100: '~3.6°C',
    },
    'SSP5-8.5': {
      title: 'Very High Emissions / Fossil-Fueled Development',
      desc: 'Resource-intensive growth and heavy fossil fuel dependence; rapid economic and energy expansion.',
      emissions: 'Very High',
      warming2100: '~4.4°C',
    },
  };

  const years: ProjectionYear[] = [2030, 2050, 2075, 2100];

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-900/80 p-4 rounded-xl border border-slate-800">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Sliders className="w-5 h-5 text-cyan-400" />
            <span>IPCC AR6 Scenario Comparison Workspace</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Evaluate decadal sea-level rise divergence across IPCC Working Group I Shared Socioeconomic Pathways (SSPs).
          </p>
        </div>

        {/* Timeline Slider */}
        <div className="flex items-center gap-3 bg-slate-950 p-2 rounded-xl border border-slate-800">
          <Calendar className="w-4 h-4 text-cyan-400 shrink-0" />
          <span className="text-[11px] font-mono text-slate-400 uppercase">Projection Timeline:</span>
          <div className="flex items-center gap-1.5">
            {years.map(yr => (
              <button
                key={yr}
                onClick={() => onChangeYear(yr)}
                className={`px-3 py-1 rounded text-xs font-mono font-semibold transition-all ${
                  selectedYear === yr
                    ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                }`}
              >
                {yr}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Side-by-Side Scenario Comparators */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: Primary / Baseline Scenario Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-semibold block">
                Primary Policy Trajectory
              </span>
              <select
                value={selectedScenario}
                onChange={e => onChangeScenario(e.target.value as IPCCScenario)}
                className="bg-slate-950 border border-slate-700 text-white font-bold text-sm rounded px-3 py-1 mt-1 focus:outline-none focus:border-cyan-500"
              >
                <option value="SSP1-1.9">SSP1-1.9 (Paris 1.5°C)</option>
                <option value="SSP1-2.6">SSP1-2.6 (Sustainable)</option>
                <option value="SSP2-4.5">SSP2-4.5 (Middle of Road)</option>
                <option value="SSP3-7.0">SSP3-7.0 (High Emissions)</option>
                <option value="SSP5-8.5">SSP5-8.5 (Fossil-Fueled)</option>
              </select>
            </div>
            <span className="text-xs font-mono text-cyan-300 bg-cyan-950/80 border border-cyan-800 px-2 py-0.5 rounded">
              Year {selectedYear}
            </span>
          </div>

          <div className="text-xs text-slate-300">
            <p className="font-medium text-slate-200">{scenarioMeta[selectedScenario].title}</p>
            <p className="text-slate-400 text-[11px] mt-0.5">{scenarioMeta[selectedScenario].desc}</p>
          </div>

          {baselineProj ? (
            <div className="space-y-3">
              <div className="p-4 bg-slate-950/80 rounded-lg border border-slate-800 text-center">
                <span className="text-[11px] text-slate-400 uppercase font-mono block">Median Projected Rise</span>
                <div className="text-3xl font-extrabold font-mono text-cyan-300 mt-1">
                  +{baselineProj.medianCm} <span className="text-base text-slate-400">cm</span>
                </div>
                <div className="text-xs text-slate-400 mt-1 font-mono">
                  17th–83rd percentile: {baselineProj.p17Cm} to {baselineProj.p83Cm} cm
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5 font-mono">
                  5th–95th range: {baselineProj.p05Cm} to {baselineProj.p95Cm} cm
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 bg-slate-950/50 rounded border border-slate-800">
                  <span className="text-slate-400 text-[10px] block">Est. Land Under Water Level</span>
                  <span className="font-mono font-bold text-slate-200 text-sm">
                    {Math.min(95, Math.round(selectedRegion.elevationSummary.sub2mMetersPercent * (baselineProj.medianCm / 60)))}%
                  </span>
                </div>
                <div className="p-2.5 bg-slate-950/50 rounded border border-slate-800">
                  <span className="text-slate-400 text-[10px] block">Est. Population In Zone</span>
                  <span className="font-mono font-bold text-amber-300 text-sm">
                    {Math.round(selectedRegion.populationSummary.inSub2mZone * (baselineProj.medianCm / 60)).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-slate-950 rounded border border-slate-800 text-xs text-slate-400 text-center">
              Projection data not available for this scenario/year combination in selected region.
            </div>
          )}
        </div>

        {/* Right: Counterpart / Comparison Scenario Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-blue-400 font-semibold block">
                Counterpart Scenario Comparison
              </span>
              <select
                value={compareScenario}
                onChange={e => setCompareScenario(e.target.value as IPCCScenario)}
                className="bg-slate-950 border border-slate-700 text-white font-bold text-sm rounded px-3 py-1 mt-1 focus:outline-none focus:border-blue-500"
              >
                <option value="SSP1-1.9">SSP1-1.9 (Paris 1.5°C)</option>
                <option value="SSP1-2.6">SSP1-2.6 (Sustainable)</option>
                <option value="SSP2-4.5">SSP2-4.5 (Middle of Road)</option>
                <option value="SSP3-7.0">SSP3-7.0 (High Emissions)</option>
                <option value="SSP5-8.5">SSP5-8.5 (Fossil-Fueled)</option>
              </select>
            </div>
            <span className="text-xs font-mono text-blue-300 bg-blue-950/80 border border-blue-800 px-2 py-0.5 rounded">
              Year {selectedYear}
            </span>
          </div>

          <div className="text-xs text-slate-300">
            <p className="font-medium text-slate-200">{scenarioMeta[compareScenario].title}</p>
            <p className="text-slate-400 text-[11px] mt-0.5">{scenarioMeta[compareScenario].desc}</p>
          </div>

          {compProj ? (
            <div className="space-y-3">
              <div className="p-4 bg-slate-950/80 rounded-lg border border-slate-800 text-center">
                <span className="text-[11px] text-slate-400 uppercase font-mono block">Median Projected Rise</span>
                <div className="text-3xl font-extrabold font-mono text-blue-300 mt-1">
                  +{compProj.medianCm} <span className="text-base text-slate-400">cm</span>
                </div>
                <div className="text-xs text-slate-400 mt-1 font-mono">
                  17th–83rd percentile: {compProj.p17Cm} to {compProj.p83Cm} cm
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5 font-mono">
                  5th–95th range: {compProj.p05Cm} to {compProj.p95Cm} cm
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 bg-slate-950/50 rounded border border-slate-800">
                  <span className="text-slate-400 text-[10px] block">Est. Land Under Water Level</span>
                  <span className="font-mono font-bold text-slate-200 text-sm">
                    {Math.min(95, Math.round(selectedRegion.elevationSummary.sub2mMetersPercent * (compProj.medianCm / 60)))}%
                  </span>
                </div>
                <div className="p-2.5 bg-slate-950/50 rounded border border-slate-800">
                  <span className="text-slate-400 text-[10px] block">Est. Population In Zone</span>
                  <span className="font-mono font-bold text-amber-300 text-sm">
                    {Math.round(selectedRegion.populationSummary.inSub2mZone * (compProj.medianCm / 60)).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-slate-950 rounded border border-slate-800 text-xs text-slate-400 text-center">
              Comparison projection unavailable for selected combination.
            </div>
          )}
        </div>
      </div>

      {/* Divergence Delta Summary Strip */}
      {baselineProj && compProj && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-cyan-950 border border-cyan-800 flex items-center justify-center font-bold font-mono text-cyan-300">
              Δ
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-200">
                Policy Divergence Gap: {selectedScenario} vs {compareScenario} ({selectedYear})
              </div>
              <div className="text-xs text-slate-400">
                Variance between aggressive mitigation and alternative development pathways in {selectedRegion.name}.
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6 text-xs font-mono">
            <div>
              <span className="text-slate-500 block text-[10px]">Delta Sea-Level</span>
              <span className="text-lg font-bold text-white">
                {compProj.medianCm >= baselineProj.medianCm ? '+' : ''}
                {compProj.medianCm - baselineProj.medianCm} cm
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">Uncertainty Bandwidth (90%)</span>
              <span className="text-lg font-bold text-cyan-300">
                ±{Math.round((baselineProj.p95Cm - baselineProj.p05Cm) / 2)} cm
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Trajectory Decadal Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-3">
        <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider flex items-center gap-2">
          <span>Decadal Sea-Level Projections Matrix — {selectedRegion.name}</span>
        </h3>
        <p className="text-xs text-slate-400">
          Values expressed in centimeters (cm) relative to 1995–2014 baseline. Source: NASA IPCC AR6 Projection Tool v2021.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-[11px] uppercase">
                <th className="py-2 px-3">IPCC AR6 Scenario</th>
                <th className="py-2 px-3">2030 (Median / 17–83%)</th>
                <th className="py-2 px-3">2050 (Median / 17–83%)</th>
                <th className="py-2 px-3">2075 (Median / 17–83%)</th>
                <th className="py-2 px-3">2100 (Median / 17–83%)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {(['SSP1-1.9', 'SSP1-2.6', 'SSP2-4.5', 'SSP3-7.0', 'SSP5-8.5'] as IPCCScenario[]).map(scen => {
                const p2030 = selectedRegion.projections.find(p => p.scenario === scen && p.year === 2030);
                const p2050 = selectedRegion.projections.find(p => p.scenario === scen && p.year === 2050);
                const p2075 = selectedRegion.projections.find(p => p.scenario === scen && p.year === 2075);
                const p2100 = selectedRegion.projections.find(p => p.scenario === scen && p.year === 2100);

                const isHighlight = scen === selectedScenario || scen === compareScenario;

                return (
                  <tr key={scen} className={`hover:bg-slate-800/40 transition-colors ${isHighlight ? 'bg-cyan-950/20' : ''}`}>
                    <td className="py-2.5 px-3 font-semibold text-slate-200">
                      {scen}
                    </td>
                    <td className="py-2.5 px-3 text-cyan-300">
                      {p2030 ? `+${p2030.medianCm} cm (${p2030.p17Cm}–${p2030.p83Cm})` : '—'}
                    </td>
                    <td className="py-2.5 px-3 text-blue-300">
                      {p2050 ? `+${p2050.medianCm} cm (${p2050.p17Cm}–${p2050.p83Cm})` : '—'}
                    </td>
                    <td className="py-2.5 px-3 text-indigo-300">
                      {p2075 ? `+${p2075.medianCm} cm (${p2075.p17Cm}–${p2075.p83Cm})` : '—'}
                    </td>
                    <td className="py-2.5 px-3 text-purple-300">
                      {p2100 ? `+${p2100.medianCm} cm (${p2100.p17Cm}–${p2100.p83Cm})` : '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
