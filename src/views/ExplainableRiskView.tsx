import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Sliders, 
  Info, 
  AlertTriangle, 
  CheckCircle2, 
  Scale, 
  RotateCcw, 
  Users, 
  Building2, 
  Waves,
  ArrowRight
} from 'lucide-react';
import { Region, RiskWeights, IPCCScenario, ProjectionYear, SimulationState } from '../types/index.ts';
import { calculateRiskScore, DEFAULT_RISK_WEIGHTS } from '../utils/riskScoring.ts';

interface ExplainableRiskViewProps {
  regions: Region[];
  selectedRegion: Region;
  onSelectRegion: (r: Region) => void;
  selectedScenario: IPCCScenario;
  selectedYear: ProjectionYear;
  simulationState: SimulationState;
}

export const ExplainableRiskView: React.FC<ExplainableRiskViewProps> = ({
  regions,
  selectedRegion,
  onSelectRegion,
  selectedScenario,
  selectedYear,
  simulationState,
}) => {
  const [weights, setWeights] = useState<RiskWeights>(DEFAULT_RISK_WEIGHTS);

  // Normalize weights so they always sum to 1.0 (100%)
  const sumWeights = weights.exposureWeight + weights.populationWeight + weights.accessWeight;
  const normExposure = Math.round((weights.exposureWeight / sumWeights) * 100);
  const normPopulation = Math.round((weights.populationWeight / sumWeights) * 100);
  const normAccess = 100 - normExposure - normPopulation;

  // Calculate score with current weights
  const scoreBreakdown = calculateRiskScore(
    selectedRegion,
    selectedScenario,
    selectedYear,
    weights,
    simulationState.closedRoadIds.length,
    simulationState.simulatedSeaLevelSurgeCm
  );

  // Baseline score (unmodified by simulation)
  const baselineScore = calculateRiskScore(
    selectedRegion,
    selectedScenario,
    selectedYear,
    weights,
    0,
    0
  );

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-900/80 p-4 rounded-xl border border-slate-800">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-cyan-400" />
            <span>Explainable Priority Scoring Architecture</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Deterministic, fully auditable multi-criteria decision analysis (MCDA) transparently weighted for emergency prioritization.
          </p>
        </div>

        {/* Basin Selector */}
        <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 text-xs">
          <span className="text-slate-500 uppercase font-mono text-[10px]">Basin:</span>
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

      {/* Main Scoring Overview Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col: Big Score Display & Confidence */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-4 flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 block font-semibold">
              Calculated Priority Index
            </span>
            <h2 className="text-base font-bold text-white mt-0.5">{selectedRegion.name}</h2>
            <div className="text-xs text-slate-400 font-mono mt-0.5">
              Under {selectedScenario} ({selectedYear})
            </div>
          </div>

          <div className="my-4 text-center">
            {scoreBreakdown.isComplete ? (
              <div>
                <div className="text-5xl font-extrabold font-mono tracking-tight text-cyan-300">
                  {scoreBreakdown.totalScore}
                  <span className="text-xl text-slate-500 font-sans font-normal"> / 100</span>
                </div>
                <div className="text-xs font-mono text-slate-400 mt-2">
                  Priority Rating: <strong className={
                    scoreBreakdown.totalScore > 75 ? 'text-rose-400' :
                    scoreBreakdown.totalScore > 50 ? 'text-amber-400' : 'text-emerald-400'
                  }>
                    {scoreBreakdown.totalScore > 75 ? 'URGENT DISRUPTION RISK' :
                     scoreBreakdown.totalScore > 50 ? 'ELEVATED VULNERABILITY' : 'MODERATE EXPOSURE'}
                  </strong>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-rose-950/40 border border-rose-900 rounded-lg text-rose-300 space-y-1">
                <AlertTriangle className="w-6 h-6 mx-auto text-rose-400" />
                <div className="font-bold text-sm">INCOMPLETE ASSESSMENT</div>
                <p className="text-[11px] text-rose-200/80">
                  Essential inputs (such as high-res road topology or localized gauge) are absent for this coast. A definitive numerical score is withheld.
                </p>
              </div>
            )}
          </div>

          {/* Data Confidence Metric */}
          <div className="p-3 bg-slate-950/80 rounded-lg border border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium">Data Completeness & Confidence:</span>
              <span className="font-mono font-bold text-cyan-300">{scoreBreakdown.confidenceScore}%</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                style={{ width: `${scoreBreakdown.confidenceScore}%` }}
                className={`h-full rounded-full ${
                  scoreBreakdown.confidenceScore > 75 ? 'bg-emerald-500' :
                  scoreBreakdown.confidenceScore > 50 ? 'bg-amber-500' : 'bg-rose-500'
                }`}
              />
            </div>
            <div className="text-[10px] text-slate-500 font-mono flex justify-between">
              <span>Coverage: {selectedRegion.dataCoverage.toUpperCase()}</span>
              <span>Auditable Pipeline</span>
            </div>
          </div>
        </div>

        {/* Right 2 Cols: The 3 Core Sub-Components */}
        <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider flex items-center gap-2">
              <Scale className="w-4 h-4 text-cyan-400" />
              <span>Multi-Factor Decomposition (Formula: Priority = W1*E + W2*P + W3*A)</span>
            </h3>
            <span className="text-[10px] font-mono text-slate-400">Provisional Weights</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Component 1: Exposure */}
            <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-cyan-300 flex items-center gap-1.5">
                  <Waves className="w-4 h-4 text-cyan-400" />
                  <span>Exposure Score</span>
                </span>
                <span className="text-[10px] font-mono bg-cyan-950 text-cyan-300 px-1.5 py-0.5 rounded">
                  Weight {normExposure}%
                </span>
              </div>
              <div className="text-2xl font-bold font-mono text-white">
                {scoreBreakdown.exposureScore} <span className="text-xs text-slate-500 font-normal">/ 100</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-tight">
                Derived from projected sea-level rise (+{selectedRegion.projections.find(p => p.scenario === selectedScenario && p.year === selectedYear)?.medianCm || 0}cm) intersecting Copernicus DEM elevation below 2m.
              </p>
            </div>

            {/* Component 2: Population */}
            <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-amber-300 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-amber-400" />
                  <span>Population Vulnerability</span>
                </span>
                <span className="text-[10px] font-mono bg-amber-950 text-amber-300 px-1.5 py-0.5 rounded">
                  Weight {normPopulation}%
                </span>
              </div>
              <div className="text-2xl font-bold font-mono text-white">
                {scoreBreakdown.populationScore} <span className="text-xs text-slate-500 font-normal">/ 100</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-tight">
                Normalized WorldPop count of residents ({selectedRegion.populationSummary.inSub2mZone.toLocaleString()}) occupying contiguous Low Elevation Coastal Zones.
              </p>
            </div>

            {/* Component 3: Access */}
            <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-emerald-300 flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-emerald-400" />
                  <span>Access Disruption</span>
                </span>
                <span className="text-[10px] font-mono bg-emerald-950 text-emerald-300 px-1.5 py-0.5 rounded">
                  Weight {normAccess}%
                </span>
              </div>
              <div className="text-2xl font-bold font-mono text-white">
                {scoreBreakdown.accessScore} <span className="text-xs text-slate-500 font-normal">/ 100</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-tight">
                Topological accessibility to {selectedRegion.facilities.length} mapped emergency hospitals and shelters, factoring road severance ({simulationState.closedRoadIds.length} simulated closed).
              </p>
            </div>
          </div>

          {/* Interactive Weight Tuning Sliders */}
          <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 font-mono uppercase flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                <span>Adjust Demonstration Policy Weights (Auto-Normalized to 100%)</span>
              </span>
              <button
                onClick={() => setWeights(DEFAULT_RISK_WEIGHTS)}
                className="text-[10px] text-slate-400 hover:text-white flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Weights</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="space-y-1">
                <div className="flex justify-between text-slate-400">
                  <span>Exposure Weight</span>
                  <span className="font-mono text-cyan-300">{normExposure}%</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="0.8"
                  step="0.05"
                  value={weights.exposureWeight}
                  onChange={e => setWeights(prev => ({ ...prev, exposureWeight: parseFloat(e.target.value) }))}
                  className="w-full accent-cyan-500"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-slate-400">
                  <span>Population Weight</span>
                  <span className="font-mono text-amber-300">{normPopulation}%</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="0.8"
                  step="0.05"
                  value={weights.populationWeight}
                  onChange={e => setWeights(prev => ({ ...prev, populationWeight: parseFloat(e.target.value) }))}
                  className="w-full accent-amber-500"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-slate-400">
                  <span>Access Risk Weight</span>
                  <span className="font-mono text-emerald-300">{normAccess}%</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="0.8"
                  step="0.05"
                  value={weights.accessWeight}
                  onChange={e => setWeights(prev => ({ ...prev, accessWeight: parseFloat(e.target.value) }))}
                  className="w-full accent-emerald-500"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* "Why is this area prioritized?" Explainability Panel */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Info className="w-4 h-4 text-cyan-400" />
          <span>Why is this coastal area prioritized? — Decision Support Narrative</span>
        </h3>
        <p className="text-xs text-slate-400">
          Transparent reasoning extracted from empirical input datasets for {selectedRegion.name}.
        </p>

        <div className="space-y-2.5">
          {scoreBreakdown.contributingFactors.map((factor, idx) => (
            <div
              key={idx}
              className="p-3.5 bg-slate-950/80 rounded-lg border border-slate-800 flex items-start gap-3 text-xs"
            >
              <span className={`px-2 py-0.5 rounded font-mono text-[10px] uppercase font-bold shrink-0 mt-0.5 ${
                factor.impact === 'High' ? 'bg-rose-950 text-rose-300 border border-rose-800' :
                factor.impact === 'Medium' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                'bg-emerald-950 text-emerald-300 border border-emerald-800'
              }`}>
                {factor.impact} Impact
              </span>
              <div>
                <div className="font-semibold text-slate-200">{factor.factor}</div>
                <div className="text-slate-400 text-[11px] mt-0.5 leading-relaxed">{factor.description}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Missing Factors if any */}
        {scoreBreakdown.missingFactors.length > 0 && (
          <div className="p-3 bg-amber-950/30 border border-amber-900/50 rounded-lg text-xs text-amber-300 space-y-1">
            <span className="font-semibold block">Missing Input Constraints:</span>
            <ul className="list-disc list-inside text-[11px] text-amber-200/80 space-y-0.5">
              {scoreBreakdown.missingFactors.map((mf, idx) => (
                <li key={idx}>{mf}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};
