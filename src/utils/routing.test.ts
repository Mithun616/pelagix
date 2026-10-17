import test from 'node:test';
import assert from 'node:assert/strict';
import { dijkstra, calculateRouteAccessibility } from './routing.ts';
import type { RoadNode, RoadEdge } from '../types/index.ts';

const mockNodes: RoadNode[] = [
  { id: 'origin', name: 'Downtown Center', coordinates: [25.7617, -80.1918], elevationMeters: 1.8 },
  { id: 'junction_a', name: 'Bay Way Junction', coordinates: [25.7700, -80.1900], elevationMeters: 1.2 },
  { id: 'junction_b', name: 'Inland Parkway', coordinates: [25.7650, -80.2050], elevationMeters: 3.5 },
  { id: 'hospital_main', name: 'Memorial Hospital', coordinates: [25.7800, -80.1950], elevationMeters: 2.1 },
];

const mockEdges: RoadEdge[] = [
  { id: 'e1', fromNode: 'origin', toNode: 'junction_a', distanceKm: 2.0, roadType: 'coastal_causeway', isBlocked: false },
  { id: 'e2', fromNode: 'junction_a', toNode: 'hospital_main', distanceKm: 1.5, roadType: 'primary', isBlocked: false },
  { id: 'e3', fromNode: 'origin', toNode: 'junction_b', distanceKm: 3.0, roadType: 'primary', isBlocked: false },
  { id: 'e4', fromNode: 'junction_b', toNode: 'hospital_main', distanceKm: 2.5, roadType: 'primary', isBlocked: false },
];

test('dijkstra finds shortest path when all roads open', () => {
  const result = dijkstra('origin', 'hospital_main', mockNodes, mockEdges, []);
  assert.ok(result);
  assert.equal(result.distanceKm, 3.5); // via junction_a: 2.0 + 1.5
  assert.deepEqual(result.path, ['origin', 'junction_a', 'hospital_main']);
});

test('dijkstra detours inland when coastal causeway is blocked', () => {
  // Block e1 (coastal causeway)
  const result = dijkstra('origin', 'hospital_main', mockNodes, mockEdges, ['e1']);
  assert.ok(result);
  assert.equal(result.distanceKm, 5.5); // via junction_b: 3.0 + 2.5
  assert.deepEqual(result.path, ['origin', 'junction_b', 'hospital_main']);
});

test('calculateRouteAccessibility flags isolation when all paths severed', () => {
  // Block both e1 and e3
  const route = calculateRouteAccessibility('origin', 'hospital_main', mockNodes, mockEdges, ['e1', 'e3']);
  assert.equal(route.isAccessible, false);
  assert.equal(route.totalDistanceKm, Infinity);
  assert.ok(route.warningNotes?.includes('ACCESS SEVERED'));
});

test('calculateRouteAccessibility detects detour delta correctly', () => {
  const route = calculateRouteAccessibility('origin', 'hospital_main', mockNodes, mockEdges, ['e1']);
  assert.equal(route.isAccessible, true);
  assert.equal(route.totalDistanceKm, 5.5);
  assert.equal(route.baselineDistanceKm, 3.5);
  assert.equal(route.deltaDistanceKm, 2.0);
  assert.ok(route.warningNotes?.includes('DETOUR REQUIRED'));
});
