export type DataStatus = 
  | 'LIVE' 
  | 'DELAYED' 
  | 'HISTORICAL' 
  | 'PROJECTED' 
  | 'ESTIMATED' 
  | 'SIMULATED' 
  | 'UNAVAILABLE';

export type IPCCScenario = 'SSP1-1.9' | 'SSP1-2.6' | 'SSP2-4.5' | 'SSP3-7.0' | 'SSP5-8.5';
export type ProjectionYear = 2030 | 2050 | 2075 | 2100;

export interface IPCCProjection {
  scenario: IPCCScenario;
  year: ProjectionYear;
  medianCm: number;
  p17Cm: number;
  p83Cm: number;
  p05Cm: number;
  p95Cm: number;
  source: string;
}

export interface HistoricalObsPoint {
  year: number;
  satelliteGMSL_mm: number;
  localTideGauge_mm?: number;
  trend_mm_per_year: number;
}

export interface CriticalFacility {
  id: string;
  name: string;
  type: 'hospital' | 'emergency_shelter' | 'fire_station' | 'power_substation';
  coordinates: [number, number]; // [lat, lng]
  elevationMeters: number;
  capacity?: number;
  currentStatus: 'normal' | 'at_risk' | 'isolated' | 'simulated_strained';
  osmId: string;
}

export interface RoadNode {
  id: string;
  name: string;
  coordinates: [number, number]; // [lat, lng]
  elevationMeters: number;
}

export interface RoadEdge {
  id: string;
  fromNode: string;
  toNode: string;
  distanceKm: number;
  roadType: 'primary' | 'secondary' | 'coastal_causeway' | 'bridge';
  isBlocked: boolean;
  blockReason?: string;
  isSimulatedClosure?: boolean;
}

export interface RouteResult {
  path: string[];
  coordinates: [number, number][];
  totalDistanceKm: number;
  baselineDistanceKm: number;
  deltaDistanceKm: number;
  isAccessible: boolean;
  alternateRoutesCount: number;
  warningNotes?: string;
}

export interface Region {
  id: string;
  name: string;
  country: string;
  coordinates: [number, number];
  zoom: number;
  dataCoverage: 'full' | 'partial' | 'screening_only';
  missingDataNotice?: string;
  baselineYear: string;
  elevationSummary: {
    meanMeters: number;
    sub2mMetersPercent: number;
    sub1mMetersPercent: number;
    copernicusVersion: string;
  };
  populationSummary: {
    totalEstimated: number;
    inSub2mZone: number;
    worldPopYear: number;
  };
  infrastructureSummary: {
    hospitals: number;
    shelters: number;
    roadKm: number;
    bridgeTunnels: number;
  };
  currentTideStation?: {
    stationId: string;
    name: string;
    waterLevelMeters: number;
    highTideMeters: number;
    lowTideMeters: number;
    timestamp: string;
    status: DataStatus;
  };
  recentRainfall?: {
    gpmImergMm24h: number;
    timestamp: string;
    anomaly: 'normal' | 'moderate' | 'extreme';
  };
  projections: IPCCProjection[];
  historicalObs: HistoricalObsPoint[];
  facilities: CriticalFacility[];
  roadNodes: RoadNode[];
  roadEdges: RoadEdge[];
  originNodeId: string;
}

export interface RiskWeights {
  exposureWeight: number; // default 0.40
  populationWeight: number; // default 0.30
  accessWeight: number; // default 0.30
}

export interface RiskScoreBreakdown {
  totalScore: number;
  exposureScore: number;
  populationScore: number;
  accessScore: number;
  confidenceScore: number;
  isComplete: boolean;
  contributingFactors: {
    factor: string;
    impact: 'High' | 'Medium' | 'Low';
    description: string;
  }[];
  missingFactors: string[];
}

export interface DataSourceItem {
  id: string;
  name: string;
  provider: string;
  category: 'Observations' | 'Projections' | 'Elevation' | 'Population' | 'Roads & Infrastructure' | 'Precipitation' | 'Tides & Water Levels';
  officialDocUrl: string;
  productUsed: string;
  coverage: string;
  updateFrequency: string;
  lastRetrievalTime: string;
  observationTime: string;
  status: DataStatus;
  units: string;
  resolution: string;
  license: string;
  missingDataNotice?: string;
}

export interface LiveEvent {
  id: string;
  title: string;
  regionId: string;
  regionName: string;
  eventType: 'tide_surge' | 'precipitation' | 'road_impact' | 'simulated_closure' | 'buoy_anomaly';
  timestamp: string;
  source: string;
  status: DataStatus;
  details: string;
  affectedFacilityCount?: number;
  severity: 'info' | 'warning' | 'critical';
}

export interface SimulationState {
  active: boolean;
  simulatedRainfallMm: number;
  closedRoadIds: string[];
  selectedHospitalTarget: string;
  shelterOccupancyPercent: number;
  simulatedSeaLevelSurgeCm: number;
}
