import React, { useState, useMemo } from 'react';
import { 
  Network, 
  Hospital, 
  Tent, 
  MapPin, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Route, 
  Layers, 
  Sliders, 
  Info,
  RotateCcw
} from 'lucide-react';
import { Region, CriticalFacility, SimulationState, RouteResult } from '../types/index.ts';
import { GlobalMap, MapLayerState } from '../components/GlobalMap.tsx';
import { calculateRouteAccessibility } from '../utils/routing.ts';

interface InfrastructureAccessibilityViewProps {
  regions: Region[];
  selectedRegion: Region;
  onSelectRegion: (r: Region) => void;
  simulationState: SimulationState;
  onToggleRoadClosure: (roadId: string) => void;
  onResetClosures: () => void;
}

export const InfrastructureAccessibilityView: React.FC<InfrastructureAccessibilityViewProps> = ({
  regions,
  selectedRegion,
  onSelectRegion,
  simulationState,
  onToggleRoadClosure,
  onResetClosures,
}) => {
  const [selectedFacilityId, setSelectedFacilityId] = useState<string>(
    selectedRegion.facilities[0]?.id || ''
  );

  const [activeLayers, setActiveLayers] = useState<MapLayerState>({
    hazard: true,
    elevationDEM: false,
    population: false,
    facilities: true,
    roads: true,
    tideGauges: false,
    simulation: true,
  });

  const selectedFacility = selectedRegion.facilities.find(f => f.id === selectedFacilityId) || selectedRegion.facilities[0];

  // Accurately map destination facility to the geographically closest road node
  const destNodeId = useMemo(() => {
    if (!selectedFacility || selectedRegion.roadNodes.length === 0) {
      return selectedRegion.roadNodes[0]?.id || '';
    }

    let closestNode = selectedRegion.roadNodes[0];
    let minDist = Infinity;

    for (const node of selectedRegion.roadNodes) {
      const d = Math.hypot(
        node.coordinates[0] - selectedFacility.coordinates[0],
        node.coordinates[1] - selectedFacility.coordinates[1]
      );
      if (d < minDist) {
        minDist = d;
        closestNode = node;
      }
    }

    return closestNode.id;
  }, [selectedFacility, selectedRegion]);

  const originNodeId = selectedRegion.originNodeId || selectedRegion.roadNodes[0]?.id;

  // Calculate live route with current closures
  const routeResult = useMemo<RouteResult>(() => {
    return calculateRouteAccessibility(
      originNodeId,
      destNodeId,
      selectedRegion.roadNodes,
      selectedRegion.roadEdges,
      simulationState.closedRoadIds
    );
  }, [originNodeId, destNodeId, selectedRegion, simulationState.closedRoadIds]);

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-900/80 p-4 rounded-xl border border-slate-800">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Network className="w-5 h-5 text-cyan-400" />
            <span>Infrastructure Network & Emergency Accessibility</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Graph-theoretical topological routing (Dijkstra) analyzing critical hospital and shelter transit disruption.
          </p>
        </div>

        {/* Region & Reset Buttons */}
        <div className="flex items-center gap-3">
          <select
            value={selectedRegion.id}
            onChange={e => {
              const r = regions.find(item => item.id === e.target.value);
              if (r) {
                onSelectRegion(r);
                setSelectedFacilityId(r.facilities[0]?.id || '');
              }
            }}
            className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-cyan-500"
          >
            {regions.map(r => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>

          {simulationState.closedRoadIds.length > 0 && (
            <button
              onClick={onResetClosures}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-950/80 hover:bg-amber-900 text-amber-300 border border-amber-800 text-xs font-mono transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset {simulationState.closedRoadIds.length} Closure(s)</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Grid: Map & Route Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Leaflet Network Map */}
        <div className="lg:col-span-2 space-y-4">
          {/* Active Route Telemetry Banner */}
          <div className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
            !routeResult.isAccessible
              ? 'bg-rose-950/40 border-rose-800/80 text-rose-200'
              : routeResult.deltaDistanceKm > 0
              ? 'bg-amber-950/40 border-amber-800/80 text-amber-200'
              : 'bg-emerald-950/40 border-emerald-800/80 text-emerald-200'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold ${
                !routeResult.isAccessible ? 'bg-rose-900 text-rose-100' :
                routeResult.deltaDistanceKm > 0 ? 'bg-amber-900 text-amber-100' : 'bg-emerald-900 text-emerald-100'
              }`}>
                <Route className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold flex items-center gap-2">
                  <span>Routing to: {selectedFacility?.name}</span>
                  {!routeResult.isAccessible ? (
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-rose-900 text-rose-100">
                      ACCESS SEVERED
                    </span>
                  ) : routeResult.deltaDistanceKm > 0 ? (
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-amber-900 text-amber-100">
                      DETOUR ACTIVE (+{routeResult.deltaDistanceKm} km)
                    </span>
                  ) : (
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-900 text-emerald-100">
                      OPTIMAL BASELINE
                    </span>
                  )}
                </div>
                <div className="text-xs opacity-80 mt-0.5">
                  Origin: {selectedRegion.roadNodes.find(n => n.id === originNodeId)?.name || 'Downtown Hub'}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs font-mono">
              <div>
                <span className="opacity-70 block text-[10px]">Route Distance</span>
                <span className="text-lg font-bold">
                  {routeResult.isAccessible ? `${routeResult.totalDistanceKm} km` : 'Unreachable'}
                </span>
              </div>
              <div>
                <span className="opacity-70 block text-[10px]">Baseline Path</span>
                <span className="text-lg font-bold">
                  {routeResult.baselineDistanceKm} km
                </span>
              </div>
            </div>
          </div>

          {/* Interactive Routing Map */}
          <GlobalMap
            regions={regions}
            selectedRegion={selectedRegion}
            onSelectRegion={onSelectRegion}
            activeLayers={activeLayers}
            simulationState={simulationState}
            routeResult={routeResult}
            selectedFacilityId={selectedFacility?.id}
            onSelectFacility={f => setSelectedFacilityId(f.id)}
            heightClassName="h-[480px]"
          />

          {/* Road Segment Closure Toggles (Interactive Demonstration) */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-xs font-bold uppercase font-mono text-slate-300 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                <span>Simulate Road Segment Disruptions / Inundation</span>
              </h3>
              <span className="text-[10px] font-mono text-slate-500">
                Click segment to toggle passage
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {selectedRegion.roadEdges.map(edge => {
                const isClosed = simulationState.closedRoadIds.includes(edge.id);
                return (
                  <button
                    key={edge.id}
                    onClick={() => onToggleRoadClosure(edge.id)}
                    className={`p-2.5 rounded-lg border text-left flex items-center justify-between transition-all ${
                      isClosed
                        ? 'bg-rose-950/80 border-rose-800 text-rose-200'
                        : 'bg-slate-950/70 border-slate-800/80 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="font-semibold text-xs flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${isClosed ? 'bg-rose-500' : 'bg-emerald-400'}`}></span>
                        <span>{edge.id.replace('edge-', '').replace('-', ' ').toUpperCase()}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                        {edge.roadType.replace('_', ' ')} • {edge.distanceKm} km
                      </div>
                    </div>

                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase font-bold ${
                      isClosed ? 'bg-rose-900 text-rose-100' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {isClosed ? 'CLOSED' : 'OPEN'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Col: Facility Selector & Topological Analysis */}
        <div className="space-y-4">
          {/* Destination Facility Picker */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-xs font-bold uppercase font-mono text-slate-300 flex items-center gap-1.5">
                <Hospital className="w-3.5 h-3.5 text-cyan-400" />
                <span>Target Critical Facility</span>
              </h3>
              <span className="text-[10px] font-mono text-slate-500">
                {selectedRegion.facilities.length} available
              </span>
            </div>

            <div className="space-y-1.5">
              {selectedRegion.facilities.map(fac => {
                const isSelected = fac.id === selectedFacilityId;
                const isHospital = fac.type === 'hospital';
                return (
                  <button
                    key={fac.id}
                    onClick={() => setSelectedFacilityId(fac.id)}
                    className={`w-full text-left p-3 rounded-lg border text-xs transition-all flex items-start gap-2.5 ${
                      isSelected
                        ? 'bg-cyan-950/80 border-cyan-800 text-cyan-200'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded flex items-center justify-center shrink-0 font-bold text-[11px] ${
                      isHospital ? 'bg-blue-600 text-white' : 'bg-emerald-600 text-white'
                    }`}>
                      {isHospital ? 'H' : 'S'}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-slate-200 truncate">{fac.name}</div>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono mt-0.5">
                        <span>Elevation: {fac.elevationMeters}m</span>
                        <span>•</span>
                        <span>Cap: {fac.capacity || 'Regional'}</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Routing Steps / Graph Path */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-3">
            <h4 className="text-xs font-bold uppercase font-mono text-slate-300">
              Graph Path Traversal Sequence
            </h4>

            {routeResult.isAccessible ? (
              <div className="space-y-2 text-xs">
                <div className="p-2.5 bg-slate-950/80 rounded border border-slate-800 space-y-1">
                  <div className="text-[10px] text-slate-500 font-mono">Dijkstra Node Sequence ({routeResult.path.length} nodes):</div>
                  <div className="font-mono text-xs text-cyan-300 space-y-1">
                    {routeResult.path.map((nodeId, idx) => {
                      const node = selectedRegion.roadNodes.find(n => n.id === nodeId);
                      return (
                        <div key={nodeId} className="flex items-center gap-2">
                          <span className="text-[10px] text-slate-500 w-4">{idx + 1}.</span>
                          <span className="truncate">{node?.name || nodeId}</span>
                          <span className="text-[10px] text-slate-500 ml-auto">({node?.elevationMeters}m)</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {routeResult.warningNotes && (
                  <div className="p-2.5 bg-amber-950/40 border border-amber-900/60 rounded text-[11px] text-amber-300">
                    {routeResult.warningNotes}
                  </div>
                )}
              </div>
            ) : (
              <div className="p-3 bg-rose-950/60 border border-rose-900 rounded-lg text-xs text-rose-200 space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold">
                  <XCircle className="w-4 h-4 text-rose-400" />
                  <span>Critical Facility Isolated</span>
                </div>
                <p className="text-[11px] text-rose-300/80 leading-relaxed">
                  Every primary and secondary road connecting the origin hub to this facility has been severed by simulated inundation or structural blockages. Emergency air or marine transport would be required.
                </p>
              </div>
            )}
          </div>

          {/* Assumptions & Integrity Note */}
          <div className="p-3 bg-slate-950/90 rounded-lg border border-slate-800 text-[11px] text-slate-400 space-y-1">
            <div className="flex items-center gap-1 text-slate-300 font-semibold">
              <Info className="w-3.5 h-3.5 text-cyan-400" />
              <span>Modeling Assumptions</span>
            </div>
            <p className="text-[10px] text-slate-400 leading-tight">
              Road closures in this tool represent user-controlled scenario tests or verified feeds. Sea-level rise projections alone do not automatically close roads without accounting for culverts, elevated embankments, and tidal barriers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
