import React, { useState } from 'react';
import { 
  TrendingUp, 
  Database, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  Sliders, 
  ExternalLink,
  Layers,
  ArrowRight
} from 'lucide-react';
import { Region } from '../types/index.ts';

interface SeaLevelTrendsViewProps {
  regions: Region[];
  selectedRegion: Region;
  onSelectRegion: (r: Region) => void;
}

export const SeaLevelTrendsView: React.FC<SeaLevelTrendsViewProps> = ({
  regions,
  selectedRegion,
  onSelectRegion,
}) => {
  const [unit, setUnit] = useState<'mm' | 'cm' | 'in'>('mm');
  const [compareRegionId, setCompareRegionId] = useState<string>('jakarta');
  const [startYear, setStartYear] = useState<number>(1993);

  const compareRegion = regions.find(r => r.id === compareRegionId) || regions[1];

  // Unit conversion multipliers (baseline data in mm)
  const multiplier = unit === 'mm' ? 1 : unit === 'cm' ? 0.1 : 0.0393701;
  const unitLabel = unit === 'mm' ? 'mm' : unit === 'cm' ? 'cm' : 'inches';

  const filteredObs = selectedRegion.historicalObs.filter(o => o.year >= startYear);
  const compareObs = compareRegion.historicalObs.filter(o => o.year >= startYear);

  // Maximum value for SVG scaling
  const maxVal = Math.max(
    ...filteredObs.map(o => (o.localTideGauge_mm || o.satelliteGMSL_mm) * multiplier),
    ...compareObs.map(o => (o.localTideGauge_mm || o.satelliteGMSL_mm) * multiplier),
    20
  );

  const latestObs = filteredObs[filteredObs.length - 1];

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
      {/* View Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/80 p-4 rounded-xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">
              Historical Sea-Level Observations & Tide Gauges
            </h1>
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
              1993–2026 Telemetry
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Reconciling satellite radar altimetry (NASA PO.DAAC) with localized coastal tide gauge stations (NOAA CO-OPS & UNESCO-IOC).
          </p>
        </div>

        {/* Controls: Unit & Year Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
            <span className="text-[10px] font-mono text-slate-500 px-1.5 uppercase">Unit</span>
            {(['mm', 'cm', 'in'] as const).map(u => (
              <button
                key={u}
                onClick={() => setUnit(u)}
                className={`px-2.5 py-1 rounded text-xs font-mono font-medium transition-colors ${
                  unit === u ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {u.toUpperCase()}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
            <span className="text-[10px] font-mono text-slate-500 px-1.5 uppercase">From</span>
            {([1993, 2003, 2013] as const).map(yr => (
              <button
                key={yr}
                onClick={() => setStartYear(yr)}
                className={`px-2 py-1 rounded text-xs font-mono font-medium transition-colors ${
                  startYear === yr ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {yr}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Chart Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-4">
        {/* Chart Header & Comparison Selector */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              <span>Multi-Source Time Series: {selectedRegion.name}</span>
            </h2>
            <div className="text-xs text-slate-400 mt-0.5">
              Observed Global Mean Sea Level (GMSL) vs Local Coastal Gauge Telemetry
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400 text-[11px]">Compare with:</span>
            <select
              value={compareRegionId}
              onChange={e => setCompareRegionId(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-200 rounded px-2.5 py-1 text-xs focus:outline-none focus:border-cyan-500"
            >
              {regions
                .filter(r => r.id !== selectedRegion.id)
                .map(r => (
                  <option key={r.id} value={r.id}>
                    {r.name} ({r.country})
                  </option>
                ))}
            </select>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 text-xs font-mono pt-1">
          <div className="flex items-center gap-2">
            <div className="w-3.5 h-1 bg-cyan-400 rounded"></div>
            <span className="text-slate-300">NASA Satellite Altimetry (Global Mean)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3.5 h-1 bg-emerald-400 rounded"></div>
            <span className="text-slate-300">Local Gauge ({selectedRegion.name})</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3.5 h-1 bg-amber-400 rounded border border-dashed border-amber-300"></div>
            <span className="text-slate-400">Comparison Gauge ({compareRegion.name})</span>
          </div>
        </div>

        {/* Scalable Vector SVG Time-Series Chart */}
        <div className="relative h-64 w-full bg-slate-950/70 border border-slate-800/80 rounded-lg p-4 flex flex-col justify-between overflow-hidden">
          {/* Background Grid Lines */}
          <div className="absolute inset-0 flex flex-col justify-between p-4 pointer-events-none opacity-20">
            <div className="border-b border-slate-500 w-full"></div>
            <div className="border-b border-slate-500 w-full"></div>
            <div className="border-b border-slate-500 w-full"></div>
            <div className="border-b border-slate-500 w-full"></div>
          </div>

          <div className="relative w-full h-full flex items-end justify-between px-2 pt-6">
            {filteredObs.map((obs, idx) => {
              const satVal = obs.satelliteGMSL_mm * multiplier;
              const localVal = (obs.localTideGauge_mm || obs.satelliteGMSL_mm) * multiplier;
              const satHeight = Math.min(90, Math.max(5, (satVal / (maxVal * 1.1)) * 100));
              const localHeight = Math.min(90, Math.max(5, (localVal / (maxVal * 1.1)) * 100));

              // Matching point in compare region if exists
              const compMatch = compareObs.find(c => c.year === obs.year);
              const compVal = compMatch ? (compMatch.localTideGauge_mm || compMatch.satelliteGMSL_mm) * multiplier : 0;
              const compHeight = Math.min(90, Math.max(5, (compVal / (maxVal * 1.1)) * 100));

              return (
                <div key={obs.year} className="flex-1 flex flex-col items-center justify-end h-full group relative">
                  {/* Hover Tooltip */}
                  <div className="absolute bottom-full mb-2 hidden group-hover:flex flex-col bg-slate-900 border border-slate-700 p-2 rounded shadow-xl text-[10px] font-mono z-20 min-w-44 pointer-events-none">
                    <strong className="text-slate-200 border-b border-slate-800 pb-0.5">Year {obs.year}</strong>
                    <span className="text-cyan-300">Satellite GMSL: +{satVal.toFixed(1)} {unitLabel}</span>
                    <span className="text-emerald-300">Local Gauge: +{localVal.toFixed(1)} {unitLabel}</span>
                    {compMatch && (
                      <span className="text-amber-300">{compareRegion.name}: +{compVal.toFixed(1)} {unitLabel}</span>
                    )}
                    <span className="text-slate-500 text-[9px] mt-0.5">Rate: +{obs.trend_mm_per_year} mm/yr</span>
                  </div>

                  {/* Bars / Indicators */}
                  <div className="flex items-end gap-1.5 w-full max-w-12 justify-center h-44">
                    {/* Satellite Bar */}
                    <div
                      style={{ height: `${satHeight}%` }}
                      className="w-2.5 bg-cyan-500 rounded-t group-hover:bg-cyan-300 transition-all shadow-sm shadow-cyan-500/50"
                    />
                    {/* Local Gauge Bar */}
                    <div
                      style={{ height: `${localHeight}%` }}
                      className="w-2.5 bg-emerald-500 rounded-t group-hover:bg-emerald-300 transition-all shadow-sm shadow-emerald-500/50"
                    />
                    {/* Compare Gauge Bar */}
                    {compMatch && (
                      <div
                        style={{ height: `${compHeight}%` }}
                        className="w-2.5 bg-amber-500 rounded-t group-hover:bg-amber-300 transition-all shadow-sm shadow-amber-500/50"
                      />
                    )}
                  </div>

                  {/* Year Label */}
                  <span className="text-[10px] font-mono text-slate-400 mt-2">
                    {obs.year}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Trend Summary Metric Strip */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
          <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800 text-xs">
            <span className="text-slate-400 text-[11px] block">Observed Long-Term Rate</span>
            <div className="text-lg font-bold font-mono text-cyan-300 mt-0.5">
              +{latestObs?.trend_mm_per_year} mm/year
            </div>
            <p className="text-[10px] text-slate-500 mt-1">
              Linear trend derived from 33-year merged altimetry time series.
            </p>
          </div>

          <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800 text-xs">
            <span className="text-slate-400 text-[11px] block">Local Relative Rate Differential</span>
            <div className="text-lg font-bold font-mono text-emerald-300 mt-0.5">
              {latestObs?.localTideGauge_mm
                ? `+${((latestObs.localTideGauge_mm - latestObs.satelliteGMSL_mm) * multiplier).toFixed(1)} ${unitLabel}`
                : 'Aligned with GMSL'}
            </div>
            <p className="text-[10px] text-slate-500 mt-1">
              Local vertical land motion (subsidence or uplift) relative to ocean surface.
            </p>
          </div>

          <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800 text-xs">
            <span className="text-slate-400 text-[11px] block">Sensor Lineage</span>
            <div className="text-xs font-mono text-slate-200 mt-1">
              TOPEX &rarr; Jason-1/2/3 &rarr; Sentinel-6 MF
            </div>
            <p className="text-[10px] text-slate-500 mt-1">
              Continuous cross-calibrated orbital microwave altimeter records.
            </p>
          </div>
        </div>

        {/* Scientific Rule & Caveat Banner */}
        <div className="p-3 bg-amber-950/20 border border-amber-900/40 rounded-lg text-xs text-amber-300/90 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5 text-[11px]">
            <strong className="text-amber-200 font-semibold">Strict Scientific Boundary:</strong>
            <p>
              Historical sea-level records represent observed, verified physical measurements. They are never extrapolated as linear trends into future decades, because climate projections involve non-linear thermal expansion, glacier mass loss, and ice sheet dynamics modeled under IPCC AR6 shared socioeconomic pathways.
            </p>
          </div>
        </div>
      </div>

      {/* Observation Metadata & Station Registry Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Satellite Metadata */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="text-xs font-bold font-mono uppercase text-cyan-400 flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5" />
              <span>NASA PO.DAAC Satellite Altimetry</span>
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
              HISTORICAL
            </span>
          </div>
          <div className="space-y-1.5 text-xs text-slate-300">
            <div className="flex justify-between"><span className="text-slate-500">Product:</span> <span className="font-mono text-right">MERGED_TP_J1_OSTM_OST_CYCLES_V42</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Spatial Coverage:</span> <span>Global Ocean (66°S to 66°N)</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Temporal Range:</span> <span className="font-mono">1993-01 to 2026-08</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Calibration Baseline:</span> <span>1993–2008 Mean Sea Surface</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Uncertainty:</span> <span>±0.4 mm/year</span></div>
          </div>
        </div>

        {/* Tide Gauge Metadata */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="text-xs font-bold font-mono uppercase text-emerald-400 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>Local Tide Gauge Telemetry</span>
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
              {selectedRegion.currentTideStation?.status || 'HISTORICAL'}
            </span>
          </div>
          <div className="space-y-1.5 text-xs text-slate-300">
            <div className="flex justify-between"><span className="text-slate-500">Station Name:</span> <span className="font-medium">{selectedRegion.currentTideStation?.name || 'Regional Coastal Benchmark'}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Station ID:</span> <span className="font-mono">{selectedRegion.currentTideStation?.stationId || 'UNESCO-IOC'}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Current Water Level:</span> <span className="font-mono text-emerald-300">{selectedRegion.currentTideStation?.waterLevelMeters ?? 0.52} m NAVD88</span></div>
            <div className="flex justify-between"><span className="text-slate-500">High Tide Peak:</span> <span className="font-mono text-slate-300">{selectedRegion.currentTideStation?.highTideMeters ?? 0.81} m</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Network Provider:</span> <span>{selectedRegion.country === 'United States' ? 'NOAA CO-OPS' : 'UNESCO-IOC / VLIZ'}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
};
