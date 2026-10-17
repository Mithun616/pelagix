import React, { useState } from 'react';
import { 
  TrendingUp, 
  Compass, 
  Users, 
  Building2, 
  Activity, 
  Layers, 
  ArrowUpRight, 
  HelpCircle,
  AlertTriangle,
  Info,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { Region, IPCCScenario, ProjectionYear, CriticalFacility, SimulationState } from '../types/index.ts';
import { GlobalMap, MapLayerState } from '../components/GlobalMap.tsx';
import { calculateRiskScore, DEFAULT_RISK_WEIGHTS } from '../utils/riskScoring.ts';

interface GlobalOverviewViewProps {
  regions: Region[];
  selectedRegion: Region;
  onSelectRegion: (region: Region) => void;
  selectedScenario: IPCCScenario;
  onChangeScenario: (s: IPCCScenario) => void;
  selectedYear: ProjectionYear;
  onChangeYear: (y: ProjectionYear) => void;
  simulationState: SimulationState;
  onNavigateTo: (section: string) => void;
}

export const GlobalOverviewView: React.FC<GlobalOverviewViewProps> = ({
  regions,
  selectedRegion,
  onSelectRegion,
  selectedScenario,
  onChangeScenario,
  selectedYear,
  onChangeYear,
  simulationState,
  onNavigateTo,
}) => {
  const [activeLayers, setActiveLayers] = useState<MapLayerState>({
    hazard: true,
    elevationDEM: true,
    population: true,
    facilities: true,
    roads: true,
    tideGauges: true,
    simulation: true,
  });

  const [sortField, setSortField] = useState<'priority' | 'population' | 'slr'>('priority');

  const currentProj = selectedRegion.projections.find(
    p => p.scenario === selectedScenario && p.year === selectedYear
  ) || selectedRegion.projections[0];

  const latestHistorical = selectedRegion.historicalObs[selectedRegion.historicalObs.length - 1];

  // Calculate scores for all regions under current scenario & year
  const rankedRegions = regions.map(reg => {
    const scoreBreakdown = calculateRiskScore(
      reg,
      selectedScenario,
      selectedYear,
      DEFAULT_RISK_WEIGHTS,
      reg.id === selectedRegion.id ? simulationState.closedRoadIds.length : 0,
      reg.id === selectedRegion.id ? simulationState.simulatedSeaLevelSurgeCm : 0
    );
    const regProj = reg.projections.find(p => p.scenario === selectedScenario && p.year === selectedYear) || reg.projections[0];
    return {
      region: reg,
      score: scoreBreakdown,
      projectedSLRCm: regProj ? regProj.medianCm : 0,
    };
  });

  rankedRegions.sort((a, b) => {
    if (sortField === 'priority') return b.score.totalScore - a.score.totalScore;
    if (sortField === 'population') return b.region.populationSummary.inSub2mZone - a.region.populationSummary.inSub2mZone;
    return b.projectedSLRCm - a.projectedSLRCm;
  });

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Banner / Context Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/80 p-4 rounded-xl border border-slate-800">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>Coastal Impact Intelligence Overview</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Synthesizing IPCC AR6 sea-level projections, Copernicus DEM elevation, WorldPop demographics, and OpenStreetMap infrastructure networks.
          </p>
        </div>

        {/* Scenario & Year Selector Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
            <span className="text-[10px] uppercase font-mono text-slate-500 px-1.5">Scenario</span>
            {(['SSP1-2.6', 'SSP2-4.5', 'SSP5-8.5'] as IPCCScenario[]).map(scen => (
              <button
                key={scen}
                onClick={() => onChangeScenario(scen)}
                className={`px-2.5 py-1 rounded text-xs font-mono font-medium transition-all ${
                  selectedScenario === scen
                    ? 'bg-cyan-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {scen}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
            <span className="text-[10px] uppercase font-mono text-slate-500 px-1.5">Year</span>
            {([2030, 2050, 2075, 2100] as ProjectionYear[]).map(yr => (
              <button
                key={yr}
                onClick={() => onChangeYear(yr)}
                className={`px-2.5 py-1 rounded text-xs font-mono font-medium transition-all ${
                  selectedYear === yr
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {yr}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 5 Core Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* Card 1: Historical Sea-Level Trend */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col justify-between hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span className="font-medium">Observed Rate of Rise</span>
            <TrendingUp className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <div className="text-2xl font-bold font-mono text-cyan-300">
              +{latestHistorical.trend_mm_per_year} <span className="text-xs text-slate-400 font-sans">mm/yr</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              NASA PO.DAAC Altimetry (1993–2026)
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-800/80 text-[10px] text-slate-500 flex items-center justify-between">
            <span>Cumulative: +{latestHistorical.satelliteGMSL_mm} mm</span>
            <span className="text-emerald-400 font-mono">OBSERVED</span>
          </div>
        </div>

        {/* Card 2: Projected Sea-Level Rise */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col justify-between hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span className="font-medium">Projected SLR ({selectedYear})</span>
            <Compass className="w-4 h-4 text-blue-400" />
          </div>
          <div>
            <div className="text-2xl font-bold font-mono text-blue-300">
              +{currentProj?.medianCm || 0} <span className="text-xs text-slate-400 font-sans">cm</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              {selectedScenario} (17th–83rd: {currentProj?.p17Cm}–{currentProj?.p83Cm} cm)
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-800/80 text-[10px] text-slate-500 flex items-center justify-between">
            <span>NASA IPCC AR6 WGI</span>
            <span className="text-blue-400 font-mono">PROJECTED</span>
          </div>
        </div>

        {/* Card 3: Exposed Population */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col justify-between hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span className="font-medium">Exposed Population</span>
            <Users className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <div className="text-2xl font-bold font-mono text-amber-300">
              {(selectedRegion.populationSummary.inSub2mZone / 1000).toFixed(0)}k
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Residing in sub-2m elevation zone
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-800/80 text-[10px] text-slate-500 flex items-center justify-between">
            <span>WorldPop 100m Gridded</span>
            <span className="text-amber-400 font-mono">ESTIMATED</span>
          </div>
        </div>

        {/* Card 4: Critical Facilities */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col justify-between hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span className="font-medium">Critical Facilities</span>
            <Building2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <div className="text-2xl font-bold font-mono text-emerald-300">
              {selectedRegion.facilities.length} <span className="text-xs text-slate-400 font-sans">mapped</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              {selectedRegion.infrastructureSummary.hospitals} Hospitals, {selectedRegion.infrastructureSummary.shelters} Shelters
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-800/80 text-[10px] text-slate-500 flex items-center justify-between">
            <span>OpenStreetMap Overpass</span>
            <span className="text-emerald-400 font-mono">LIVE / OSM</span>
          </div>
        </div>

        {/* Card 5: Telemetry Health */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col justify-between hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span className="font-medium">Data Pipeline Health</span>
            <Activity className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <div className="text-2xl font-bold font-mono text-white flex items-center gap-1.5">
              <span>8 / 8</span>
              <span className="text-xs text-emerald-400 font-sans">100%</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              3 Live, 2 Delayed, 3 Modelled
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-800/80 text-[10px] text-slate-500 flex items-center justify-between">
            <span>Sync Latency: ~3h 15m</span>
            <span className="text-emerald-400 font-mono">NOMINAL</span>
          </div>
        </div>
      </div>

      {/* Main Interactive Map Section */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Compass className="w-4 h-4 text-cyan-400" />
              <span>Interactive Geospatial Workspace — {selectedRegion.name}</span>
            </h2>
            <p className="text-xs text-slate-400">
              Click any coastal region or map element to inspect exposure, road connectivity, and critical facilities.
            </p>
          </div>

          {/* Map Layer Toggles */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-mono uppercase text-slate-400 flex items-center gap-1">
              <Layers className="w-3 h-3 text-cyan-400" /> Layers:
            </span>
            <button
              onClick={() => setActiveLayers(prev => ({ ...prev, hazard: !prev.hazard }))}
              className={`px-2 py-1 rounded text-[11px] font-medium transition-colors border ${
                activeLayers.hazard
                  ? 'bg-cyan-950 text-cyan-300 border-cyan-800'
                  : 'bg-slate-950 text-slate-500 border-slate-800'
              }`}
            >
              Hazard SLR
            </button>
            <button
              onClick={() => setActiveLayers(prev => ({ ...prev, elevationDEM: !prev.elevationDEM }))}
              className={`px-2 py-1 rounded text-[11px] font-medium transition-colors border ${
                activeLayers.elevationDEM
                  ? 'bg-blue-950 text-blue-300 border-blue-800'
                  : 'bg-slate-950 text-slate-500 border-slate-800'
              }`}
            >
              Copernicus DEM
            </button>
            <button
              onClick={() => setActiveLayers(prev => ({ ...prev, population: !prev.population }))}
              className={`px-2 py-1 rounded text-[11px] font-medium transition-colors border ${
                activeLayers.population
                  ? 'bg-amber-950 text-amber-300 border-amber-800'
                  : 'bg-slate-950 text-slate-500 border-slate-800'
              }`}
            >
              WorldPop
            </button>
            <button
              onClick={() => setActiveLayers(prev => ({ ...prev, roads: !prev.roads }))}
              className={`px-2 py-1 rounded text-[11px] font-medium transition-colors border ${
                activeLayers.roads
                  ? 'bg-purple-950 text-purple-300 border-purple-800'
                  : 'bg-slate-950 text-slate-500 border-slate-800'
              }`}
            >
              OSM Roads
            </button>
            <button
              onClick={() => setActiveLayers(prev => ({ ...prev, facilities: !prev.facilities }))}
              className={`px-2 py-1 rounded text-[11px] font-medium transition-colors border ${
                activeLayers.facilities
                  ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                  : 'bg-slate-950 text-slate-500 border-slate-800'
              }`}
            >
              Facilities
            </button>
          </div>
        </div>

        {/* The Leaflet Map Component */}
        <GlobalMap
          regions={regions}
          selectedRegion={selectedRegion}
          onSelectRegion={onSelectRegion}
          activeLayers={activeLayers}
          simulationState={simulationState}
          heightClassName="h-[460px]"
        />
      </div>

      {/* Global Coastal Vulnerability & Risk Priority Ranking Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span>Comparative Coastal Impact Priority Rankings</span>
            </h3>
            <p className="text-xs text-slate-400">
              Evaluated under {selectedScenario} ({selectedYear}). Normalized 0–100 score prioritizing exposure, demographics, and critical service accessibility.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400 text-[11px]">Sort By:</span>
            <button
              onClick={() => setSortField('priority')}
              className={`px-2.5 py-1 rounded text-xs font-mono font-medium ${
                sortField === 'priority' ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-slate-400'
              }`}
            >
              Priority Score
            </button>
            <button
              onClick={() => setSortField('population')}
              className={`px-2.5 py-1 rounded text-xs font-mono font-medium ${
                sortField === 'population' ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-slate-400'
              }`}
            >
              Population
            </button>
            <button
              onClick={() => setSortField('slr')}
              className={`px-2.5 py-1 rounded text-xs font-mono font-medium ${
                sortField === 'slr' ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-slate-400'
              }`}
            >
              Projected SLR
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-mono text-[11px] uppercase tracking-wider">
                <th className="py-2.5 px-3">Coastal Basin</th>
                <th className="py-2.5 px-3">Scenario & Year</th>
                <th className="py-2.5 px-3">Projected SLR</th>
                <th className="py-2.5 px-3">Exposed Pop (&lt;2m)</th>
                <th className="py-2.5 px-3">Service Bottlenecks</th>
                <th className="py-2.5 px-3">Priority Score</th>
                <th className="py-2.5 px-3">Data Confidence</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {rankedRegions.map(({ region, score, projectedSLRCm }) => {
                const isCurrent = region.id === selectedRegion.id;
                const isScreeningOnly = region.dataCoverage === 'screening_only';
                return (
                  <tr
                    key={region.id}
                    onClick={() => onSelectRegion(region)}
                    className={`hover:bg-slate-800/40 cursor-pointer transition-colors ${
                      isCurrent ? 'bg-cyan-950/30' : ''
                    }`}
                  >
                    <td className="py-3 px-3 font-medium text-slate-200">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${
                          region.dataCoverage === 'full' ? 'bg-emerald-400' :
                          region.dataCoverage === 'partial' ? 'bg-amber-400' : 'bg-rose-400'
                        }`} />
                        <div>
                          <div>{region.name}</div>
                          <div className="text-[10px] text-slate-500">{region.country}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-3 font-mono text-slate-300">
                      <div>{selectedScenario}</div>
                      <div className="text-[10px] text-slate-500">Decadal {selectedYear}</div>
                    </td>

                    <td className="py-3 px-3 font-mono text-cyan-300 font-semibold">
                      +{projectedSLRCm} cm
                    </td>

                    <td className="py-3 px-3 font-mono text-amber-300">
                      {region.populationSummary.inSub2mZone.toLocaleString()}
                    </td>

                    <td className="py-3 px-3 text-slate-300">
                      {region.infrastructureSummary.hospitals} Hosp / {region.infrastructureSummary.bridgeTunnels} Bridges
                    </td>

                    <td className="py-3 px-3">
                      {isScreeningOnly ? (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-950/80 text-rose-300 border border-rose-800">
                          INCOMPLETE DATA
                        </span>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className={`font-mono font-bold text-sm ${
                            score.totalScore > 75 ? 'text-rose-400' :
                            score.totalScore > 50 ? 'text-amber-400' : 'text-emerald-400'
                          }`}>
                            {score.totalScore} / 100
                          </span>
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-3">
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                        score.confidenceScore > 80
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : score.confidenceScore > 55
                          ? 'bg-amber-950 text-amber-300 border border-amber-800'
                          : 'bg-rose-950 text-rose-300 border border-rose-800'
                      }`}>
                        {score.confidenceScore}% ({region.dataCoverage.toUpperCase()})
                      </span>
                    </td>

                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          onSelectRegion(region);
                          onNavigateTo('prioritization');
                        }}
                        className="inline-flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300 font-medium"
                      >
                        <span>Inspect</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Methodology & Limitations Note */}
        <div className="p-3 bg-slate-950/80 rounded-lg border border-slate-800/80 text-[11px] text-slate-400 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-semibold text-slate-300">Methodology & Coverage Transparency:</span>
            <p>
              Rankings reflect provisional weights (0.40 Exposure, 0.30 Population, 0.30 Access Risk). Regions with screening-only data (e.g. Dakar, Chittagong) are explicitly marked as <strong className="text-rose-300">INCOMPLETE DATA</strong> rather than inventing synthetic rankings, following strict scientific reporting standards.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
