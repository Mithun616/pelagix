import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateRiskScore, DEFAULT_RISK_WEIGHTS } from './riskScoring.ts';
import type { Region } from '../types/index.ts';

const mockRegion: Region = {
  id: 'test-city',
  name: 'Test Coastal City',
  country: 'Oceania',
  coordinates: [10.0, 100.0],
  zoom: 12,
  dataCoverage: 'full',
  baselineYear: '1995-2014',
  elevationSummary: {
    meanMeters: 1.8,
    sub2mMetersPercent: 45,
    sub1mMetersPercent: 20,
    copernicusVersion: 'GLO-30',
  },
  populationSummary: {
    totalEstimated: 1200000,
    inSub2mZone: 600000,
    worldPopYear: 2025,
  },
  infrastructureSummary: {
    hospitals: 5,
    shelters: 8,
    roadKm: 420,
    bridgeTunnels: 6,
  },
  projections: [
    {
      scenario: 'SSP2-4.5',
      year: 2050,
      medianCm: 28,
      p17Cm: 20,
      p83Cm: 38,
      p05Cm: 15,
      p95Cm: 45,
      source: 'NASA IPCC AR6 Sea Level Projection Tool',
    },
  ],
  historicalObs: [
    { year: 2020, satelliteGMSL_mm: 98.2, trend_mm_per_year: 3.7 },
  ],
  facilities: [
    {
      id: 'h1',
      name: 'Coastal Hospital',
      type: 'hospital',
      coordinates: [10.01, 100.01],
      elevationMeters: 1.1,
      currentStatus: 'normal',
      osmId: 'osm-1',
    },
  ],
  roadNodes: [
    { id: 'n1', name: 'Node 1', coordinates: [10.0, 100.0], elevationMeters: 1.5 },
    { id: 'n2', name: 'Node 2', coordinates: [10.01, 100.01], elevationMeters: 1.1 },
  ],
  roadEdges: [
    { id: 'e1', fromNode: 'n1', toNode: 'n2', distanceKm: 2, roadType: 'primary', isBlocked: false },
  ],
  originNodeId: 'n1',
};

test('risk scoring returns bounded 0-100 total score and breakdown', () => {
  const result = calculateRiskScore(mockRegion, 'SSP2-4.5', 2050, DEFAULT_RISK_WEIGHTS, 0, 0);
  assert.ok(result.totalScore >= 0 && result.totalScore <= 100);
  assert.ok(result.exposureScore >= 0 && result.exposureScore <= 100);
  assert.ok(result.populationScore >= 0 && result.populationScore <= 100);
  assert.ok(result.accessScore >= 0 && result.accessScore <= 100);
  assert.equal(result.isComplete, true);
  assert.ok(result.contributingFactors.length > 0);
});

test('simulating road closure increases access risk and overall priority score', () => {
  const baseline = calculateRiskScore(mockRegion, 'SSP2-4.5', 2050, DEFAULT_RISK_WEIGHTS, 0, 0);
  const severed = calculateRiskScore(mockRegion, 'SSP2-4.5', 2050, DEFAULT_RISK_WEIGHTS, 1, 0);
  assert.ok(severed.accessScore > baseline.accessScore);
  assert.ok(severed.totalScore >= baseline.totalScore);
});

test('screening-only coverage flags incomplete assessment', () => {
  const partialRegion: Region = {
    ...mockRegion,
    dataCoverage: 'screening_only',
  };
  const result = calculateRiskScore(partialRegion, 'SSP2-4.5', 2050, DEFAULT_RISK_WEIGHTS, 0, 0);
  assert.equal(result.isComplete, false);
  assert.ok(result.missingFactors.length > 0);
  assert.ok(result.confidenceScore < 60);
});
