import React, { useEffect, useState } from 'react';
import { 
  APIProvider, 
  Map, 
  AdvancedMarker, 
  InfoWindow, 
  Circle, 
  Polyline, 
  useMap,
  ControlPosition 
} from '@vis.gl/react-google-maps';
import { Region, CriticalFacility, RouteResult, SimulationState } from '../types/index.ts';
import { MapLayerState } from './LeafletFallbackRenderer.tsx';

interface GoogleMapsRendererProps {
  apiKey: string;
  regions: Region[];
  selectedRegion: Region;
  onSelectRegion: (region: Region) => void;
  activeLayers: MapLayerState;
  simulationState?: SimulationState;
  routeResult?: RouteResult | null;
  onSelectFacility?: (facility: CriticalFacility) => void;
  selectedFacilityId?: string;
  showAllRegionsMarkers?: boolean;
  onAuthFailure?: () => void;
}

// Inner Camera Sync Handler
const MapCameraSync: React.FC<{ selectedRegion: Region }> = ({ selectedRegion }) => {
  const map = useMap('pelagix-google-map');

  useEffect(() => {
    if (!map) return;
    map.panTo({ lat: selectedRegion.coordinates[0], lng: selectedRegion.coordinates[1] });
    map.setZoom(selectedRegion.zoom);
  }, [map, selectedRegion.id, selectedRegion.coordinates, selectedRegion.zoom]);

  return null;
};

export const GoogleMapsRenderer: React.FC<GoogleMapsRendererProps> = ({
  apiKey,
  regions,
  selectedRegion,
  onSelectRegion,
  activeLayers,
  simulationState,
  routeResult,
  onSelectFacility,
  selectedFacilityId,
  showAllRegionsMarkers = true,
  onAuthFailure,
}) => {
  const [selectedFacilityForInfo, setSelectedFacilityForInfo] = useState<CriticalFacility | null>(null);
  const [selectedRegionForInfo, setSelectedRegionForInfo] = useState<Region | null>(null);

  // Catch auth failure events
  useEffect(() => {
    const handleAuthFailure = () => {
      if (onAuthFailure) onAuthFailure();
    };

    window.addEventListener('gmp-auth-failure', handleAuthFailure);
    (window as any).gm_authFailure = () => {
      window.dispatchEvent(new CustomEvent('gmp-auth-failure'));
      if (onAuthFailure) onAuthFailure();
    };

    return () => {
      window.removeEventListener('gmp-auth-failure', handleAuthFailure);
    };
  }, [onAuthFailure]);

  const nodeMap = new globalThis.Map(selectedRegion.roadNodes.map(n => [n.id, n]));
  const closedRoads = simulationState?.closedRoadIds || [];

  return (
    <APIProvider 
      apiKey={apiKey} 
      libraries={['marker', 'geometry']}
      onError={() => {
        if (onAuthFailure) onAuthFailure();
      }}
    >
      <div className="w-full h-full relative">
        <Map
          id="pelagix-google-map"
          mapId="DEMO_MAP_ID"
          defaultCenter={{ lat: 25.7617, lng: -80.1918 }}
          defaultZoom={12}
          mapTypeId="roadmap"
          mapTypeControl={true}
          mapTypeControlOptions={{
            position: ControlPosition.TOP_LEFT,
          }}
          zoomControl={true}
          zoomControlOptions={{
            position: ControlPosition.RIGHT_CENTER,
          }}
          fullscreenControl={true}
          streetViewControl={false}
          gestureHandling="greedy"
          internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
          className="w-full h-full"
        >
          <MapCameraSync selectedRegion={selectedRegion} />

          {/* 1. Worldwide Region Markers */}
          {showAllRegionsMarkers && regions.map(reg => {
            const isCurrent = reg.id === selectedRegion.id;
            const badgeColor = reg.dataCoverage === 'full' 
              ? 'bg-emerald-500' 
              : reg.dataCoverage === 'partial' 
              ? 'bg-amber-500' 
              : 'bg-rose-500';

            return (
              <AdvancedMarker
                key={reg.id}
                position={{ lat: reg.coordinates[0], lng: reg.coordinates[1] }}
                title={`${reg.name} (${reg.country}) - ${reg.dataCoverage.toUpperCase()}`}
                onClick={() => {
                  onSelectRegion(reg);
                  setSelectedRegionForInfo(reg);
                }}
              >
                <div className={`cursor-pointer rounded-full p-1 border-2 border-white shadow-xl flex items-center justify-center transition-transform hover:scale-125 ${badgeColor} ${
                  isCurrent ? 'ring-4 ring-cyan-400 scale-110' : ''
                }`}>
                  <span className="w-2.5 h-2.5 rounded-full bg-white block"></span>
                </div>
              </AdvancedMarker>
            );
          })}

          {/* Region InfoWindow */}
          {selectedRegionForInfo && (
            <InfoWindow
              position={{
                lat: selectedRegionForInfo.coordinates[0],
                lng: selectedRegionForInfo.coordinates[1],
              }}
              onCloseClick={() => setSelectedRegionForInfo(null)}
            >
              <div className="text-slate-900 p-1 text-xs max-w-xs font-sans">
                <div className="font-bold text-sm text-slate-950 flex items-center justify-between gap-2 border-b pb-1">
                  <span>{selectedRegionForInfo.name}</span>
                  <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold uppercase ${
                    selectedRegionForInfo.dataCoverage === 'full' 
                      ? 'bg-emerald-100 text-emerald-800' 
                      : selectedRegionForInfo.dataCoverage === 'partial' 
                      ? 'bg-amber-100 text-amber-800' 
                      : 'bg-rose-100 text-rose-800'
                  }`}>
                    {selectedRegionForInfo.dataCoverage}
                  </span>
                </div>
                <div className="mt-1 space-y-0.5 text-[11px] text-slate-700">
                  <div>Country: <strong>{selectedRegionForInfo.country}</strong></div>
                  <div>Mean Elevation: <strong>{selectedRegionForInfo.elevationSummary.meanMeters}m</strong> (Copernicus DEM)</div>
                  <div>Exposed Pop (&lt;2m): <strong>{selectedRegionForInfo.populationSummary.inSub2mZone.toLocaleString()}</strong></div>
                  <div>Mapped Facilities: <strong>{selectedRegionForInfo.facilities.length}</strong> (OSM)</div>
                </div>
              </div>
            </InfoWindow>
          )}

          {/* 2. Coastal Hazard & Inundation Screening Circles */}
          {activeLayers.hazard && selectedRegion.roadNodes
            .filter(n => n.elevationMeters <= 2.0)
            .map(node => (
              <Circle
                key={`hazard-${node.id}`}
                center={{ lat: node.coordinates[0], lng: node.coordinates[1] }}
                radius={1200}
                fillColor="#0891b2"
                fillOpacity={0.2}
                strokeColor="#06b6d4"
                strokeWeight={1.5}
              />
            ))}

          {/* 3. Copernicus DEM Elevation Layer */}
          {activeLayers.elevationDEM && (
            <Circle
              center={{ lat: selectedRegion.coordinates[0], lng: selectedRegion.coordinates[1] }}
              radius={3500}
              fillColor="#1d4ed8"
              fillOpacity={0.14}
              strokeColor="#3b82f6"
              strokeWeight={1.5}
            />
          )}

          {/* 4. WorldPop Population Density Heat Layer */}
          {activeLayers.population && (
            <Circle
              center={{ lat: selectedRegion.coordinates[0], lng: selectedRegion.coordinates[1] }}
              radius={2600}
              fillColor="#ea580c"
              fillOpacity={0.16}
              strokeColor="#f97316"
              strokeWeight={1.5}
            />
          )}

          {/* 5. Tide Gauge Stations */}
          {activeLayers.tideGauges && selectedRegion.currentTideStation && (
            <Circle
              center={{ lat: selectedRegion.coordinates[0], lng: selectedRegion.coordinates[1] }}
              radius={450}
              fillColor="#0ea5e9"
              fillOpacity={0.8}
              strokeColor="#ffffff"
              strokeWeight={2}
            />
          )}

          {/* 6. Road Network Polylines */}
          {activeLayers.roads && selectedRegion.roadEdges.map(edge => {
            const from = nodeMap.get(edge.fromNode);
            const to = nodeMap.get(edge.toNode);
            if (!from || !to) return null;

            const isClosed = edge.isBlocked || closedRoads.includes(edge.id);
            const isCauseway = edge.roadType === 'coastal_causeway';

            return (
              <Polyline
                key={`edge-${edge.id}`}
                path={[
                  { lat: from.coordinates[0], lng: from.coordinates[1] },
                  { lat: to.coordinates[0], lng: to.coordinates[1] },
                ]}
                strokeColor={isClosed ? '#ef4444' : isCauseway ? '#38bdf8' : '#64748b'}
                strokeWeight={isClosed ? 5 : isCauseway ? 4 : 3}
                strokeOpacity={0.85}
              />
            );
          })}

          {/* 7. Active Dijkstra Route Polyline */}
          {routeResult && routeResult.isAccessible && routeResult.coordinates.length > 1 && (
            <Polyline
              path={routeResult.coordinates.map(coord => ({ lat: coord[0], lng: coord[1] }))}
              strokeColor="#10b981"
              strokeWeight={6}
              strokeOpacity={0.95}
            />
          )}

          {/* 8. Critical Facilities (AdvancedMarker) */}
          {activeLayers.facilities && selectedRegion.facilities.map(facility => {
            const isSelected = selectedFacilityId === facility.id;
            const isHospital = facility.type === 'hospital';
            const isIsolated = facility.currentStatus === 'isolated';

            return (
              <AdvancedMarker
                key={facility.id}
                position={{ lat: facility.coordinates[0], lng: facility.coordinates[1] }}
                title={`${facility.name} (${facility.elevationMeters}m)`}
                onClick={() => {
                  if (onSelectFacility) onSelectFacility(facility);
                  setSelectedFacilityForInfo(facility);
                }}
              >
                <div
                  className={`flex items-center justify-center font-bold text-white shadow-2xl rounded-md cursor-pointer transition-transform hover:scale-125 border ${
                    isSelected ? 'w-8 h-8 text-sm ring-4 ring-cyan-400 border-white' : 'w-6 h-6 text-xs border-white/90'
                  } ${
                    isHospital 
                      ? (isIsolated ? 'bg-red-600' : 'bg-blue-600') 
                      : 'bg-emerald-600'
                  }`}
                >
                  {isHospital ? 'H' : 'S'}
                </div>
              </AdvancedMarker>
            );
          })}

          {/* Facility InfoWindow */}
          {selectedFacilityForInfo && (
            <InfoWindow
              position={{
                lat: selectedFacilityForInfo.coordinates[0],
                lng: selectedFacilityForInfo.coordinates[1],
              }}
              onCloseClick={() => setSelectedFacilityForInfo(null)}
            >
              <div className="text-slate-900 p-1 text-xs max-w-xs font-sans">
                <div className="font-bold text-sm text-slate-950 flex items-center justify-between border-b pb-1">
                  <span>{selectedFacilityForInfo.name}</span>
                  <span className={`text-[9px] uppercase px-1.5 py-0.5 rounded font-mono font-bold ${
                    selectedFacilityForInfo.currentStatus === 'isolated'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {selectedFacilityForInfo.currentStatus}
                  </span>
                </div>
                <div className="mt-1 space-y-0.5 text-[11px] text-slate-700">
                  <div>Type: <strong className="capitalize">{selectedFacilityForInfo.type.replace('_', ' ')}</strong></div>
                  <div>Ground Elevation: <strong>{selectedFacilityForInfo.elevationMeters}m</strong> (Copernicus DEM)</div>
                  <div>Capacity: <strong>{selectedFacilityForInfo.capacity || 'Standard Regional'}</strong></div>
                  <div>OSM Node/Way: <code className="text-[10px] text-slate-500">{selectedFacilityForInfo.osmId}</code></div>
                </div>
              </div>
            </InfoWindow>
          )}

          {/* 9. Simulated Event Hazard Halo */}
          {activeLayers.simulation && simulationState?.active && (
            <Circle
              center={{ lat: selectedRegion.coordinates[0], lng: selectedRegion.coordinates[1] }}
              radius={2200}
              fillColor="#d97706"
              fillOpacity={0.22}
              strokeColor="#f59e0b"
              strokeWeight={2}
            />
          )}
        </Map>
      </div>
    </APIProvider>
  );
};
