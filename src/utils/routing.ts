import type { RoadNode, RoadEdge, RouteResult } from '../types/index.ts';

interface AdjacencyEdge {
  targetNodeId: string;
  distanceKm: number;
  edgeId: string;
}

export function buildAdjacencyList(
  nodes: RoadNode[],
  edges: RoadEdge[],
  closedEdgeIds: string[] = []
): Map<string, AdjacencyEdge[]> {
  const adj = new Map<string, AdjacencyEdge[]>();

  for (const node of nodes) {
    adj.set(node.id, []);
  }

  for (const edge of edges) {
    const isClosed = edge.isBlocked || closedEdgeIds.includes(edge.id);
    if (isClosed) {
      continue;
    }

    if (adj.has(edge.fromNode)) {
      adj.get(edge.fromNode)!.push({
        targetNodeId: edge.toNode,
        distanceKm: edge.distanceKm,
        edgeId: edge.id,
      });
    }

    // Bidirectional road network by default
    if (adj.has(edge.toNode)) {
      adj.get(edge.toNode)!.push({
        targetNodeId: edge.fromNode,
        distanceKm: edge.distanceKm,
        edgeId: edge.id,
      });
    }
  }

  return adj;
}

export function dijkstra(
  startNodeId: string,
  endNodeId: string,
  nodes: RoadNode[],
  edges: RoadEdge[],
  closedEdgeIds: string[] = []
): { path: string[]; distanceKm: number } | null {
  const nodeMap = new Map(nodes.map(n => [n.id, n]));
  if (!nodeMap.has(startNodeId) || !nodeMap.has(endNodeId)) {
    return null;
  }

  if (startNodeId === endNodeId) {
    return { path: [startNodeId], distanceKm: 0 };
  }

  const adj = buildAdjacencyList(nodes, edges, closedEdgeIds);
  const distances = new Map<string, number>();
  const previous = new Map<string, string | null>();
  const visited = new Set<string>();

  for (const node of nodes) {
    distances.set(node.id, Infinity);
    previous.set(node.id, null);
  }

  distances.set(startNodeId, 0);

  while (visited.size < nodes.length) {
    let closestNode: string | null = null;
    let shortestDist = Infinity;

    for (const [nodeId, dist] of distances.entries()) {
      if (!visited.has(nodeId) && dist < shortestDist) {
        shortestDist = dist;
        closestNode = nodeId;
      }
    }

    if (!closestNode || shortestDist === Infinity) {
      break;
    }

    if (closestNode === endNodeId) {
      break;
    }

    visited.add(closestNode);

    const neighbors = adj.get(closestNode) || [];
    for (const neighbor of neighbors) {
      if (visited.has(neighbor.targetNodeId)) continue;

      const alt = shortestDist + neighbor.distanceKm;
      if (alt < distances.get(neighbor.targetNodeId)!) {
        distances.set(neighbor.targetNodeId, alt);
        previous.set(neighbor.targetNodeId, closestNode);
      }
    }
  }

  const destDist = distances.get(endNodeId);
  if (!destDist || destDist === Infinity) {
    return null;
  }

  // Reconstruct path
  const path: string[] = [];
  let curr: string | null = endNodeId;
  while (curr) {
    path.unshift(curr);
    curr = previous.get(curr) || null;
  }

  return { path, distanceKm: destDist };
}

export function calculateRouteAccessibility(
  startNodeId: string,
  endNodeId: string,
  nodes: RoadNode[],
  edges: RoadEdge[],
  closedEdgeIds: string[] = []
): RouteResult {
  const nodeMap = new Map(nodes.map(n => [n.id, n]));

  // 1. Calculate baseline without closures
  const baseline = dijkstra(startNodeId, endNodeId, nodes, edges, []);
  const baselineDist = baseline ? baseline.distanceKm : 0;

  // 2. Calculate current route with closures
  const current = dijkstra(startNodeId, endNodeId, nodes, edges, closedEdgeIds);

  if (!current) {
    return {
      path: [],
      coordinates: [],
      totalDistanceKm: Infinity,
      baselineDistanceKm: baselineDist,
      deltaDistanceKm: Infinity,
      isAccessible: false,
      alternateRoutesCount: 0,
      warningNotes: 'ACCESS SEVERED: No viable alternate road path found to facility under current closures.',
    };
  }

  const coordinates: [number, number][] = current.path
    .map(id => nodeMap.get(id)?.coordinates)
    .filter((c): c is [number, number] => Boolean(c));

  const delta = current.distanceKm - baselineDist;
  const isDetour = delta > 0.05;

  return {
    path: current.path,
    coordinates,
    totalDistanceKm: Math.round(current.distanceKm * 100) / 100,
    baselineDistanceKm: Math.round(baselineDist * 100) / 100,
    deltaDistanceKm: Math.round(delta * 100) / 100,
    isAccessible: true,
    alternateRoutesCount: isDetour ? 1 : 2,
    warningNotes: isDetour
      ? `DETOUR REQUIRED: Route lengthened by +${(delta).toFixed(1)} km due to road closures.`
      : undefined,
  };
}
