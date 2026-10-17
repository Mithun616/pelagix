import React, { useState } from 'react';
import { 
  Map as MapIcon, 
  Layers, 
  Filter, 
  Info, 
  Building2, 
  Activity, 
  TrendingUp, 
  AlertTriangle, 
  ChevronRight,
  ShieldAlert,
  Droplets,
  Network
} from 'lucide-react';
import { Region, IPCCScenario, ProjectionYear, CriticalFacility, SimulationState } from '../types/index.ts';
import { GlobalMap, MapLayerState } from '../components/GlobalMap.tsx';

interface CoastalRiskMapViewProps {
  regions: Region[];
  selectedRegion: Region;
  onSelectRegion: (r: Region) => void;
  selectedScenario: IPCCScenario;
  onChangeScenario: (s: IPCCScenario) => void;
  selectedYear: ProjectionYear;
  onChangeYear: (y: ProjectionYear) => void;
  simulationState: SimulationState;
}

export const CoastalRiskMapView: React.FC<CoastalRiskMapViewProps> = ({
  regions,
  selectedRegion,
  onSelectRegion,
  selectedScenario,
  onChangeScenario,
  selectedYear,
  onChangeYear,
  simulationState,
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

  const [selectedFacility, setSelectedFacility] = useState<CriticalFacility | null>(
    selectedRegion.facilities[0] || null
  );

  const [facilityFilter, setFacilityFilter] = useState<'all' | 'hospital' | 'emergency_shelter'>('all');
  const [elevationThreshold, setElevationThreshold] = useState<number>(2.0);

  const currentProj = selectedRegion.projections.find(
    p => p.scenario === selectedScenario && p.year === selectedYear
  ) || selectedRegion.projections[0];

  const filteredFacilities = selectedRegion.facilities.filter(f => {
    if (facilityFilter !== 'all' && f.type !== facilityFilter) return false;
    return f.elevationMeters <= elevationThreshold + 1.5;
  });

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
      {/* Workspace Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-900/80 p-4 rounded-xl border border-slate-800">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <MapIcon className="w-5 h-5 text-cyan-400" />
            <span>Coastal Spatial Analyst Workspace</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Multilayer geospatial intersection of elevation terrain, demography, and infrastructure networks.
          </p>
        </div>

        {/* Global Basin Picker & Scenario Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 text-xs">
            <span className="text-slate-500 uppercase font-mono text-[10px]">Basin</span>
            <select
              value={selectedRegion.id}
              onChange={e => {
                const r = regions.find(item => item.id === e.target.value);
                if (r) {
                  onSelectRegion(r);
                  setSelectedFacility(r.facilities[0] || null);
                }
              }}
              className="bg-transparent text-slate-200 font-medium focus:outline-none"
            >
              {regions.map(r => (
                <option key={r.id} value={r.id} className="bg-slate-900">
                  {r.name} ({r.dataCoverage})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 text-xs font-mono">
            <span className="text-slate-500 uppercase text-[10px]">Model</span>
            <select
              value={selectedScenario}
              onChange={e => onChangeScenario(e.target.value as IPCCScenario)}
              className="bg-transparent text-cyan-300 font-medium focus:outline-none"
            >
              <option value="SSP1-1.9" className="bg-slate-900">SSP1-1.9 (1.5°C Paris)</option>
              <option value="SSP1-2.6" className="bg-slate-900">SSP1-2.6 (Low Emissions)</option>
              <option value="SSP2-4.5" className="bg-slate-900">SSP2-4.5 (Middle of the Road)</option>
              <option value="SSP3-7.0" className="bg-slate-900">SSP3-7.0 (High Emissions)</option>
              <option value="SSP5-8.5" className="bg-slate-900">SSP5-8.5 (Fossil-Fueled)</option>
            </select>
            <select
              value={selectedYear}
              onChange={e => onChangeYear(Number(e.target.value) as ProjectionYear)}
              className="bg-transparent text-blue-300 font-medium focus:outline-none"
            >
              <option value={2030} className="bg-slate-900">2030</option>
              <option value={2050} className="bg-slate-900">2050</option>
              <option value={2075} className="bg-slate-900">2075</option>
              <option value={2100} className="bg-slate-900">2100</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Controls & Map, Right Inspection Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Interactive Map & Layer Controls */}
        <div className="lg:col-span-2 space-y-4">
          {/* Layer Checkboxes Bar */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span className="font-semibold text-slate-300">Active Map Layers</span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {[
                { key: 'hazard', label: 'Hazard SLR' },
                { key: 'elevationDEM', label: 'Copernicus DEM' },
                { key: 'population', label: 'WorldPop' },
                { key: 'roads', label: 'OSM Roads' },
                { key: 'facilities', label: 'Facilities' },
                { key: 'tideGauges', label: 'Tide Gauges' },
              ].map(({ key, label }) => {
                const isActive = activeLayers[key as keyof MapLayerState];
                return (
                  <label
                    key={key}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded cursor-pointer transition-colors border ${
                      isActive 
                        ? 'bg-slate-800 text-cyan-300 border-cyan-800/80' 
                        : 'bg-slate-950 text-slate-500 border-slate-800'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={() =>
                        setActiveLayers(prev => ({
                          ...prev,
                          [key]: !prev[key as keyof MapLayerState],
                        }))
                      }
                      className="accent-cyan-500 w-3 h-3 rounded"
                    />
                    <span>{label}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Interactive Map */}
          <GlobalMap
            regions={regions}
            selectedRegion={selectedRegion}
            onSelectRegion={onSelectRegion}
            activeLayers={activeLayers}
            simulationState={simulationState}
            onSelectFacility={f => setSelectedFacility(f)}
            selectedFacilityId={selectedFacility?.id}
            heightClassName="h-[520px]"
          />

          {/* Screening Filter Controls */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-3">
              <Filter className="w-4 h-4 text-cyan-400" />
              <span className="font-medium text-slate-300">Elevation Threshold Screening:</span>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="0.5"
                  max="5.0"
                  step="0.5"
                  value={elevationThreshold}
                  onChange={e => setElevationThreshold(parseFloat(e.target.value))}
                  className="accent-cyan-500 w-28"
                />
                <span className="font-mono text-cyan-300 font-bold">&le; {elevationThreshold}m</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-400">Facility Filter:</span>
              <select
                value={facilityFilter}
                onChange={e => setFacilityFilter(e.target.value as any)}
                className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-slate-200"
              >
                <option value="all">All Facilities ({selectedRegion.facilities.length})</option>
                <option value="hospital">Hospitals Only</option>
                <option value="emergency_shelter">Emergency Shelters</option>
              </select>
            </div>
          </div>
        </div>

        {/* Right Col: Detailed Regional & Facility Analytical Drawer */}
        <div className="space-y-4">
          {/* Selected Region Profile */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div>
                <h3 className="font-bold text-slate-100 text-sm">{selectedRegion.name}</h3>
                <span className="text-[11px] text-slate-400">{selectedRegion.country}</span>
              </div>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase font-semibold ${
                selectedRegion.dataCoverage === 'full' 
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                  : selectedRegion.dataCoverage === 'partial'
                  ? 'bg-amber-950 text-amber-300 border border-amber-800'
                  : 'bg-rose-950 text-rose-300 border border-rose-800'
              }`}>
                {selectedRegion.dataCoverage}
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Projected Rise ({selectedYear}):</span>
                <span className="font-mono font-bold text-cyan-300">+{currentProj?.medianCm || 0} cm</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Copernicus DEM Sub-2m Area:</span>
                <span className="font-mono text-slate-200">{selectedRegion.elevationSummary.sub2mMetersPercent}%</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Exposed Population:</span>
                <span className="font-mono text-amber-300">{selectedRegion.populationSummary.inSub2mZone.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Current Tide Telemetry:</span>
                <span className="font-mono text-emerald-300">
                  {selectedRegion.currentTideStation 
                    ? `+${selectedRegion.currentTideStation.waterLevelMeters}m (${selectedRegion.currentTideStation.status})` 
                    : 'Station Absent'}
                </span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-400">24-Hr Precipitation (GPM):</span>
                <span className="font-mono text-slate-300">
                  {selectedRegion.recentRainfall ? `${selectedRegion.recentRainfall.gpmImergMm24h} mm` : 'No Gauge Stream'}
                </span>
              </div>
            </div>

            {selectedRegion.missingDataNotice && (
              <div className="p-2.5 rounded bg-rose-950/40 border border-rose-900/60 text-[11px] text-rose-300 space-y-1">
                <div className="flex items-center gap-1 font-semibold">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Coverage Gap Flagged</span>
                </div>
                <p className="text-[10px] text-rose-200/80 leading-tight">
                  {selectedRegion.missingDataNotice}
                </p>
              </div>
            )}
          </div>

          {/* Facility Inspector Panel */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h4 className="text-xs font-bold uppercase font-mono text-slate-300 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>Selected Critical Facility</span>
              </h4>
              <span className="text-[10px] text-slate-500 font-mono">
                {filteredFacilities.length} in range
              </span>
            </div>

            {selectedFacility ? (
              <div className="space-y-3 text-xs">
                <div>
                  <div className="font-bold text-slate-100 text-sm">{selectedFacility.name}</div>
                  <div className="text-[11px] text-slate-400 capitalize">{selectedFacility.type.replace('_', ' ')}</div>
                </div>

                <div className="p-3 bg-slate-950/80 rounded-lg border border-slate-800 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Ground Elevation:</span>
                    <span className="font-mono font-bold text-cyan-300">{selectedFacility.elevationMeters.toFixed(1)} m</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Capacity:</span>
                    <span className="font-mono text-slate-200">{selectedFacility.capacity ? `${selectedFacility.capacity} beds/occupants` : 'Regional Hub'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Operational State:</span>
                    <span className={`font-mono font-semibold uppercase ${
                      selectedFacility.currentStatus === 'isolated' ? 'text-rose-400' :
                      selectedFacility.currentStatus === 'at_risk' ? 'text-amber-400' : 'text-emerald-400'
                    }`}>
                      {selectedFacility.currentStatus}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">OSM Tag Reference:</span>
                    <span className="font-mono text-slate-500 text-[10px]">{selectedFacility.osmId}</span>
                  </div>
                </div>

                <div className="text-[11px] text-slate-400 leading-tight">
                  {selectedFacility.elevationMeters <= (currentProj?.medianCm || 0) / 100 ? (
                    <span className="text-amber-300 flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      Ground elevation is below or near projected coastal sea level for {selectedYear}. Local defense barriers must be evaluated.
                    </span>
                  ) : (
                    <span className="text-slate-400">
                      Topographical elevation exceeds nominal projected sea-level rise; primary risk is access road inundation and compound rainfall drainage backflow.
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-500 italic py-4 text-center">
                Select a facility marker on the map to inspect elevation and access attributes.
              </div>
            )}

            {/* Quick Facility List */}
            <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
              <span className="text-[10px] font-mono uppercase text-slate-400 block">Nearby Mapped Facilities</span>
              <div className="max-h-40 overflow-y-auto space-y-1 pr-1">
                {selectedRegion.facilities.map(fac => (
                  <button
                    key={fac.id}
                    onClick={() => setSelectedFacility(fac)}
                    className={`w-full text-left px-2.5 py-1.5 rounded text-xs flex items-center justify-between transition-colors ${
                      selectedFacility?.id === fac.id 
                        ? 'bg-cyan-950 text-cyan-200 border border-cyan-800' 
                        : 'bg-slate-950/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                    }`}
                  >
                    <span className="truncate max-w-44">{fac.name}</span>
                    <span className="font-mono text-[10px] text-slate-500">{fac.elevationMeters}m</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
