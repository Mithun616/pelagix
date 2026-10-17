import type { Region, RiskWeights, RiskScoreBreakdown, IPCCScenario, ProjectionYear } from '../types/index.ts';

export const DEFAULT_RISK_WEIGHTS: RiskWeights = {
  exposureWeight: 0.40,
  populationWeight: 0.30,
  accessWeight: 0.30,
};

export function calculateRiskScore(
  region: Region,
  scenario: IPCCScenario = 'SSP2-4.5',
  year: ProjectionYear = 2050,
  weights: RiskWeights = DEFAULT_RISK_WEIGHTS,
  simulatedClosedEdgesCount: number = 0,
  simulatedSurgeCm: number = 0
): RiskScoreBreakdown {
  const missingFactors: string[] = [];

  // 1. Data Completeness Check
  if (region.dataCoverage === 'screening_only') {
    missingFactors.push('Detailed high-resolution road and critical facility telemetry unavailable');
  }

  const proj = region.projections.find(p => p.scenario === scenario && p.year === year);
  if (!proj) {
    missingFactors.push(`IPCC AR6 projection missing for scenario ${scenario} in year ${year}`);
  }

  // Calculate Exposure Component (0 - 100)
  // Factors: Projected SLR (cm) + Elevation vulnerability (fraction below 2m)
  const medianSLRCm = proj ? (proj.medianCm + simulatedSurgeCm) : 0;
  const sub2mPercent = region.elevationSummary.sub2mMetersPercent;
  
  // Normalized exposure: e.g. 50cm SLR on a terrain with 40% sub-2m land gives high exposure
  // Scale: 100cm SLR is max scale baseline, combined with elevation factor
  const slrFactor = Math.min(100, (medianSLRCm / 100) * 100);
  const elevationFactor = Math.min(100, sub2mPercent * 1.5);
  const exposureScore = Math.round(slrFactor * 0.5 + elevationFactor * 0.5);

  // Calculate Population Vulnerability Component (0 - 100)
  // Factors: Gridded population within low-elevation coastal zone
  const popInZone = region.populationSummary.inSub2mZone;
  // Normalized against major coastal urban centers (e.g., 2,500,000 exposed is ~100 scale)
  const popFactor = Math.min(100, (popInZone / 2500000) * 100);
  const populationScore = Math.round(Math.max(10, popFactor));

  // Calculate Essential Service Access Risk Component (0 - 100)
  // Baseline access + closure impacts
  const totalEdges = region.roadEdges.length;
  const closedEdges = region.roadEdges.filter(e => e.isBlocked).length + simulatedClosedEdgesCount;
  const roadSeveranceRatio = totalEdges > 0 ? (closedEdges / totalEdges) : 0;
  
  // Ratio of hospitals located in low elevation zones
  const vulnerableHospitals = region.facilities.filter(
    f => f.type === 'hospital' && (f.elevationMeters < 2.0 || f.currentStatus === 'isolated')
  ).length;
  const totalHospitals = region.facilities.filter(f => f.type === 'hospital').length || 1;
  const facilityVulnerabilityRatio = vulnerableHospitals / totalHospitals;

  const accessScore = Math.min(
    100,
    Math.round(facilityVulnerabilityRatio * 50 + roadSeveranceRatio * 50 + (closedEdges > 0 ? 25 : 0))
  );

  // Normalize user weights
  const sumWeights = weights.exposureWeight + weights.populationWeight + weights.accessWeight;
  const wExp = sumWeights > 0 ? weights.exposureWeight / sumWeights : 0.4;
  const wPop = sumWeights > 0 ? weights.populationWeight / sumWeights : 0.3;
  const wAcc = sumWeights > 0 ? weights.accessWeight / sumWeights : 0.3;

  const totalScore = Math.min(
    100,
    Math.round(exposureScore * wExp + populationScore * wPop + accessScore * wAcc)
  );

  // Confidence assessment based on data sources
  let confidenceScore = 90;
  if (region.dataCoverage === 'partial') confidenceScore = 65;
  if (region.dataCoverage === 'screening_only') confidenceScore = 40;
  if (!region.currentTideStation) confidenceScore -= 10;
  if (missingFactors.length > 0) confidenceScore -= 15;

  const isComplete = region.dataCoverage !== 'screening_only' && missingFactors.length === 0;

  // Contributing factors explanations for decision makers
  const contributingFactors: {
    factor: string;
    impact: 'High' | 'Medium' | 'Low';
    description: string;
  }[] = [];

  if (exposureScore > 65) {
    contributingFactors.push({
      factor: 'High Projected Coastal Sea-Level Rise',
      impact: 'High',
      description: `Median projected rise of +${medianSLRCm.toFixed(1)} cm under ${scenario} (${year}) intersects ${sub2mPercent}% of land area under 2m Copernicus DEM elevation.`,
    });
  } else {
    contributingFactors.push({
      factor: 'Moderate Coastal Exposure Profile',
      impact: 'Medium',
      description: `Projected rise of +${medianSLRCm.toFixed(1)} cm with ${sub2mPercent}% sub-2m topography.`,
    });
  }

  if (popInZone > 500000) {
    contributingFactors.push({
      factor: 'Dense Population in Low-Elevation Coastal Zone',
      impact: 'High',
      description: `Estimated ${(popInZone).toLocaleString()} residents residing in sub-2m elevation grid cells (WorldPop ${region.populationSummary.worldPopYear}).`,
    });
  } else {
    contributingFactors.push({
      factor: 'Moderate LECZ Population Exposure',
      impact: 'Low',
      description: `Estimated ${(popInZone).toLocaleString()} residents in immediate low-lying coastal zone.`,
    });
  }

  if (closedEdges > 0 || accessScore > 50) {
    contributingFactors.push({
      factor: 'Critical Infrastructure & Access Bottlenecks',
      impact: 'High',
      description: `${closedEdges} road segment(s) disrupted/blocked, increasing transit distances and isolating emergency facility hubs.`,
    });
  } else {
    contributingFactors.push({
      factor: 'Redundant Road Access to Facilities',
      impact: 'Low',
      description: `Primary arterial roads currently passable to all ${region.facilities.length} mapped facilities.`,
    });
  }

  return {
    totalScore,
    exposureScore,
    populationScore,
    accessScore,
    confidenceScore: Math.max(10, Math.min(100, confidenceScore)),
    isComplete,
    contributingFactors,
    missingFactors,
  };
}
