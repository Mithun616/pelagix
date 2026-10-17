import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Region, CriticalFacility, RouteResult, SimulationState } from '../types/index.ts';

export interface MapLayerState {
  hazard: boolean;
  elevationDEM: boolean;
  population: boolean;
  facilities: boolean;
  roads: boolean;
  tideGauges: boolean;
  simulation: boolean;
}

interface LeafletFallbackRendererProps {
  regions: Region[];
  selectedRegion: Region;
  onSelectRegion: (region: Region) => void;
  activeLayers: MapLayerState;
  simulationState?: SimulationState;
  routeResult?: RouteResult | null;
  onSelectFacility?: (facility: CriticalFacility) => void;
  selectedFacilityId?: string;
  showAllRegionsMarkers?: boolean;
}

export const LeafletFallbackRenderer: React.FC<LeafletFallbackRendererProps> = ({
  regions,
  selectedRegion,
  onSelectRegion,
  activeLayers,
  simulationState,
  routeResult,
  onSelectFacility,
  selectedFacilityId,
  showAllRegionsMarkers = true,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);

  // Initialize Map Once
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: selectedRegion.coordinates,
      zoom: selectedRegion.zoom,
      zoomControl: false,
      attributionControl: true,
    });

    // Dark scientific basemap (ESRI World Dark Gray Canvas - free, unmetered, no watermark)
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 16,
      attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, OpenStreetMap contributors',
    }).addTo(map);

    L.control.zoom({ position: 'topright' }).addTo(map);

    const layerGroup = L.layerGroup().addTo(map);
    layerGroupRef.current = layerGroup;
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Center and Zoom when selectedRegion changes
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.flyTo(selectedRegion.coordinates, selectedRegion.zoom, {
      duration: 1.2,
      easeLinearity: 0.25,
    });
  }, [selectedRegion.id, selectedRegion.coordinates, selectedRegion.zoom]);

  // Render Overlays according to activeLayers, regions, road network, facilities, routing
  useEffect(() => {
    if (!mapInstanceRef.current || !layerGroupRef.current) return;
    const group = layerGroupRef.current;
    group.clearLayers();

    // 1. Worldwide Region Markers
    if (showAllRegionsMarkers) {
      regions.forEach(reg => {
        const isCurrent = reg.id === selectedRegion.id;
        const color = reg.dataCoverage === 'full' ? '#10b981' : reg.dataCoverage === 'partial' ? '#f59e0b' : '#ef4444';
        
        const circle = L.circleMarker(reg.coordinates, {
          radius: isCurrent ? 9 : 6,
          fillColor: color,
          color: '#ffffff',
          weight: isCurrent ? 2 : 1,
          opacity: 0.9,
          fillOpacity: 0.75,
        });

        circle.bindTooltip(
          `<div style="font-family: monospace; font-size: 11px;">
            <strong>${reg.name}</strong><br/>
            <span>Country: ${reg.country}</span><br/>
            <span>Data Coverage: <b style="color:${color}">${reg.dataCoverage.toUpperCase()}</b></span>
          </div>`,
          { direction: 'top', offset: [0, -6] }
        );

        circle.on('click', () => {
          onSelectRegion(reg);
        });

        group.addLayer(circle);
      });
    }

    // 2. Coastal Hazard & Sea-Level Inundation Screening Layer
    if (activeLayers.hazard) {
      const lowNodes = selectedRegion.roadNodes.filter(n => n.elevationMeters <= 2.0);
      lowNodes.forEach(node => {
        const hazardCircle = L.circle(node.coordinates, {
          radius: 1200,
          color: '#06b6d4',
          fillColor: '#0891b2',
          fillOpacity: 0.18,
          weight: 1.2,
          dashArray: '4, 4',
        });
        hazardCircle.bindTooltip(
          `<div style="font-size: 11px;">
            <strong>Screened Low-Elevation Zone</strong><br/>
            Elevation: ~${node.elevationMeters.toFixed(1)}m Copernicus DEM<br/>
            <span style="color: #67e8f9;">Potential exposure under 2050-2100 IPCC rise</span>
          </div>`
        );
        group.addLayer(hazardCircle);
      });
    }

    // 3. Copernicus DEM Elevation Layer
    if (activeLayers.elevationDEM) {
      const demZone = L.circle(selectedRegion.coordinates, {
        radius: 3500,
        color: '#3b82f6',
        fillColor: '#1d4ed8',
        fillOpacity: 0.12,
        weight: 1,
      });
      demZone.bindTooltip(
        `<div style="font-size: 11px;">
          <strong>Copernicus DEM GLO-30 Screening</strong><br/>
          Area Mean: ${selectedRegion.elevationSummary.meanMeters}m<br/>
          Sub-2m Area: ${selectedRegion.elevationSummary.sub2mMetersPercent}%
        </div>`
      );
      group.addLayer(demZone);
    }

    // 4. WorldPop Population Density Heat Layer
    if (activeLayers.population) {
      const popCircle = L.circle(selectedRegion.coordinates, {
        radius: 2600,
        color: '#f97316',
        fillColor: '#ea580c',
        fillOpacity: 0.15,
        weight: 1,
      });
      popCircle.bindTooltip(
        `<div style="font-size: 11px;">
          <strong>WorldPop Modelled Distribution</strong><br/>
          Exposed Pop in &lt;2m zone: ~${selectedRegion.populationSummary.inSub2mZone.toLocaleString()} residents
        </div>`
      );
      group.addLayer(popCircle);
    }

    // 5. Road Network Layer
    if (activeLayers.roads) {
      const nodeMap = new Map(selectedRegion.roadNodes.map(n => [n.id, n]));
      const closedRoads = simulationState?.closedRoadIds || [];

      selectedRegion.roadEdges.forEach(edge => {
        const from = nodeMap.get(edge.fromNode);
        const to = nodeMap.get(edge.toNode);
        if (!from || !to) return;

        const isClosed = edge.isBlocked || closedRoads.includes(edge.id);
        const isCauseway = edge.roadType === 'coastal_causeway';

        const line = L.polyline([from.coordinates, to.coordinates], {
          color: isClosed ? '#ef4444' : isCauseway ? '#38bdf8' : '#64748b',
          weight: isClosed ? 4 : isCauseway ? 3.5 : 2.5,
          opacity: isClosed ? 0.95 : 0.75,
          dashArray: isClosed ? '6, 6' : undefined,
        });

        line.bindTooltip(
          `<div style="font-family: monospace; font-size: 11px;">
            <strong>Road Segment: ${edge.id}</strong><br/>
            Type: ${edge.roadType.replace('_', ' ')}<br/>
            Distance: ${edge.distanceKm} km<br/>
            Status: <b style="color:${isClosed ? '#f87171' : '#34d399'}">${isClosed ? 'BLOCKED / SEVERED' : 'PASSABLE'}</b>
            ${isClosed ? '<br/><span style="color:#fca5a5;">' + (edge.blockReason || 'SIMULATED CLOSURE') + '</span>' : ''}
          </div>`
        );

        group.addLayer(line);
      });

      // Render Road Nodes
      selectedRegion.roadNodes.forEach(node => {
        const isOrigin = node.id === selectedRegion.originNodeId;
        const nodeMarker = L.circleMarker(node.coordinates, {
          radius: isOrigin ? 6 : 4,
          fillColor: isOrigin ? '#38bdf8' : '#94a3b8',
          color: '#0f172a',
          weight: 1.5,
          fillOpacity: 0.9,
        });
        nodeMarker.bindTooltip(
          `<div style="font-size: 11px;"><strong>${node.name}</strong><br/>Elevation: ${node.elevationMeters}m</div>`
        );
        group.addLayer(nodeMarker);
      });
    }

    // 6. Active Dijkstra Route
    if (routeResult && routeResult.isAccessible && routeResult.coordinates.length > 1) {
      const routeLine = L.polyline(routeResult.coordinates, {
        color: '#10b981',
        weight: 6,
        opacity: 0.9,
        lineCap: 'round',
        lineJoin: 'round',
      });
      routeLine.bindTooltip(
        `<div style="font-family: monospace; font-size: 11px;">
          <strong style="color:#34d399;">Active Emergency Route</strong><br/>
          Total Distance: ${routeResult.totalDistanceKm} km<br/>
          ${routeResult.deltaDistanceKm > 0 ? `<span style="color:#fbbf24;">Detour Delta: +${routeResult.deltaDistanceKm} km</span>` : 'Optimal Baseline Path'}
        </div>`
      );
      group.addLayer(routeLine);
    }

    // 7. Critical Facilities
    if (activeLayers.facilities) {
      selectedRegion.facilities.forEach(facility => {
        const isSelected = selectedFacilityId === facility.id;
        const isHospital = facility.type === 'hospital';
        const isIsolated = facility.currentStatus === 'isolated';

        const customHtml = `
          <div style="
            width: ${isSelected ? '28px' : '22px'};
            height: ${isSelected ? '28px' : '22px'};
            border-radius: 6px;
            background: ${isHospital ? (isIsolated ? '#dc2626' : '#2563eb') : '#059669'};
            border: 2px solid ${isSelected ? '#38bdf8' : '#ffffff'};
            box-shadow: 0 0 10px rgba(0,0,0,0.6);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: ${isSelected ? '14px' : '11px'};
            cursor: pointer;
          ">
            ${isHospital ? 'H' : 'S'}
          </div>
        `;

        const icon = L.divIcon({
          html: customHtml,
          className: 'custom-facility-icon',
          iconSize: [isSelected ? 28 : 22, isSelected ? 28 : 22],
          iconAnchor: [isSelected ? 14 : 11, isSelected ? 14 : 11],
        });

        const marker = L.marker(facility.coordinates, { icon });
        marker.bindTooltip(
          `<div style="font-family: sans-serif; font-size: 11px;">
            <strong style="color:#e2e8f0;">${facility.name}</strong><br/>
            Type: <span style="text-transform: capitalize;">${facility.type.replace('_', ' ')}</span><br/>
            Ground Elevation: <b>${facility.elevationMeters}m</b><br/>
            Capacity: ${facility.capacity ? `${facility.capacity} beds/occupants` : 'Standard'}<br/>
            Status: <b style="color:${isIsolated ? '#f87171' : '#34d399'}">${facility.currentStatus.toUpperCase()}</b>
          </div>`,
          { offset: [0, -10] }
        );

        marker.on('click', () => {
          if (onSelectFacility) {
            onSelectFacility(facility);
          }
        });

        group.addLayer(marker);
      });
    }

    // 8. Tide Gauge Stations
    if (activeLayers.tideGauges && selectedRegion.currentTideStation) {
      const tideMarker = L.circleMarker(selectedRegion.coordinates, {
        radius: 8,
        fillColor: '#0ea5e9',
        color: '#ffffff',
        weight: 2,
        fillOpacity: 0.95,
      });

      tideMarker.bindTooltip(
        `<div style="font-size: 11px;">
          <strong>${selectedRegion.currentTideStation.name}</strong><br/>
          Water Level: <b>${selectedRegion.currentTideStation.waterLevelMeters} m</b><br/>
          High Tide Peak: ${selectedRegion.currentTideStation.highTideMeters} m<br/>
          Status: <span style="color:#38bdf8;">${selectedRegion.currentTideStation.status}</span>
        </div>`
      );

      group.addLayer(tideMarker);
    }

    // 9. Simulated Event Hazard Halo
    if (activeLayers.simulation && simulationState?.active) {
      const simHalo = L.circle(selectedRegion.coordinates, {
        radius: 2200,
        color: '#f59e0b',
        fillColor: '#d97706',
        fillOpacity: 0.22,
        weight: 2,
        dashArray: '6, 6',
      });
      simHalo.bindTooltip(
        `<div style="font-size: 11px;">
          <strong style="color:#fbbf24;">SIMULATED OPERATIONAL SCENARIO</strong><br/>
          Simulated Surge: +${simulationState.simulatedSeaLevelSurgeCm} cm<br/>
          Simulated Precipitation: ${simulationState.simulatedRainfallMm} mm/6h<br/>
          Closed Edges: ${simulationState.closedRoadIds.length}
        </div>`
      );
      group.addLayer(simHalo);
    }

  }, [
    regions,
    selectedRegion,
    activeLayers,
    simulationState,
    routeResult,
    selectedFacilityId,
    showAllRegionsMarkers,
  ]);

  return <div ref={mapContainerRef} className="w-full h-full z-0" />;
};
