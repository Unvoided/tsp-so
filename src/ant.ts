import { calculateEuclideanDistance, calculateTourDistance, twoOptSwapWithBestImprovement } from "./common.ts";
import type { Node, TspFile } from "./loader.ts";
import { nearestNeighbour } from "./neighbour.ts";

/**
 * Chooses the next node to visit based on pheromone levels and heuristic desirability.
 */
function chooseNextNode(
  current: number,
  unvisited: Set<number>,
  pheromones: number[][],
  distances: number[][],
  alpha: number,
  beta: number
): number {
  const probabilities: number[] = [];
  let sum = 0;

  for (const node of unvisited) {
    // Skip if distance is 0 to avoid division by zero (shouldn't happen for distinct nodes but as safety)
    if (distances[current][node] === 0) continue;

    const tau = Math.pow(pheromones[current][node], alpha);
    const eta = Math.pow(1 / distances[current][node], beta);
    const prob = tau * eta;

    probabilities.push(prob);
    sum += prob;
  }

  // Handle cases where sum might be 0 (e.g., if all unvisited nodes had 0 distance, though unlikely for TSP)
  if (sum === 0) {
    // Fallback: return any unvisited node, or the first one
    return [...unvisited][0];
  }

  const normalized = probabilities.map((p) => p / sum);
  let r = Math.random();
  let cumulative = 0;
  let index = 0; // Use an index to iterate through the normalized probabilities

  for (const node of unvisited) { // Iterate through unvisited nodes to match original order
    cumulative += normalized[index++];
    if (r <= cumulative) return node;
  }

  // Fallback in case of rounding errors: return the first unvisited node.
  return [...unvisited][0];
}

/**
 * Ant Colony Optimization.
 */
export function antColony(
  tsp: TspFile, // The TSP problem instance.
  iterations = 100, // Number of algorithm iterations (higher means better solutions but longer runtime).
  ants = 20, // Number of ants (simulated agents) per iteration.
  alpha = 1, // Importance of pheromone strength when choosing next node (higher = more influenced by pheromones).
  beta = 5, // Importance of heuristic (e.g., inverse distance) when choosing next node (higher = prefers shorter edges).
  evaporation = 0.5, // Pheromone evaporation rate (how quickly old pheromones fade, range: 0–1).
  Q = 100 // Pheromone deposit factor (amount of pheromone added by each ant based on tour quality).
) {
  const performanceBegin = performance.now();
  const n = tsp.nodes.length;

  // Compute distance matrix between all nodes.
  const distances = Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) =>
      calculateEuclideanDistance(tsp.nodes[i], tsp.nodes[j])
    )
  );

  // Nearest neighbour for initial best path
  const initialTour = nearestNeighbour(tsp.nodes);
  const initialDistance = calculateTourDistance(initialTour);

  // Initialize pheromone levels between all node pairs uniformly.
  const pheromones = Array.from({ length: n }, () => Array(n).fill(1)); // All roads start with 1 unit of pheromone

  let bestPath: Node[] = [...initialTour]; // Initialize best path with a copy of Nearest Neighbor tour
  let bestDistance = initialDistance;

  // Main loop over number of iterations.
  for (let iter = 0; iter < iterations; iter++) {
    // In this strategy, we don't store all ant paths, only potentially update the global best.
    // const allPaths: number[][] = [];
    // const allLengths: number[] = [];

    // Simulate each ant's tour.
    for (let k = 0; k < ants; k++) {
      const currentAntPathIndices: number[] = []; // Ant's path as indices
      const unvisited = new Set<number>(Array.from({ length: n }, (_, i) => i));
      let currentIdx = Math.floor(Math.random() * n); // Start from a random node index

      currentAntPathIndices.push(currentIdx);
      unvisited.delete(currentIdx);

      // Construct a tour by moving to unvisited nodes.
      while (unvisited.size > 0) {
        const nextIdx = chooseNextNode(
          currentIdx,
          unvisited,
          pheromones,
          distances,
          alpha,
          beta
        );
        currentAntPathIndices.push(nextIdx);
        unvisited.delete(nextIdx);
        currentIdx = nextIdx;
      }

      // Convert the ant's raw tour indices to Node objects for distance calculation
      const currentAntTourNodes: Node[] = currentAntPathIndices.map((idx) => tsp.nodes[idx]);
      const currentAntTourLength = calculateTourDistance(currentAntTourNodes);

      // Only update the global best if this ant found a shorter *raw* path
      if (currentAntTourLength < bestDistance) {
        bestDistance = currentAntTourLength;
        bestPath = currentAntTourNodes; // Store the Node[] version
      }
    } // End of ants loop

    // --- Pheromone Evaporation ---
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        pheromones[i][j] *= 1 - evaporation;
      }
    }

    // --- Apply 2-Opt to the GLOBAL BEST PATH (bestPath) ---
    // This is the main performance optimization: 2-Opt is run only once per iteration on the best path found.
    const optimizedBestPath = twoOptSwapWithBestImprovement(bestPath);
    const optimizedBestDistance = calculateTourDistance(optimizedBestPath);

    // Update global best if the 2-Opt improved path is even better
    if (optimizedBestDistance < bestDistance) {
      bestDistance = optimizedBestDistance;
      bestPath = optimizedBestPath;
    }

    // --- Pheromone Deposit based ONLY on the (2-Opt optimized) bestPath ---
    // This strategy is common in ACS/MMAS, where only the global best deposits pheromone
    // to provide stronger, high-quality guidance.
    const depositAmount = Q / bestDistance;
    for (let i = 0; i < bestPath.length; i++) {
      const fromNode = bestPath[i];
      const toNode = bestPath[(i + 1) % bestPath.length];
      const fromIdx = tsp.nodes.indexOf(fromNode); // Get index from Node object
      const toIdx = tsp.nodes.indexOf(toNode); // Get index from Node object

      if (fromIdx !== -1 && toIdx !== -1) { // Safety check, should always be true
        pheromones[fromIdx][toIdx] += depositAmount;
        pheromones[toIdx][fromIdx] += depositAmount;
      }
    }
  } // End of iterations loop

  return {
    bestPath,
    bestDistance,
    initialDistance,
    performance: performance.now() - performanceBegin,
  };
}