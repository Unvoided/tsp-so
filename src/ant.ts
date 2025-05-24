import { calculateEuclideanDistance, calculateTourDistance } from "./common.ts";
import type { Node, TspFile } from "./loader.ts";

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

  // Calculate the probability for each unvisited node
  for (const node of unvisited) {
    const tau = Math.pow(pheromones[current][node], alpha);
    const eta = Math.pow(1 / distances[current][node], beta);
    const prob = tau * eta;

    probabilities.push(prob);

    sum += prob;
  }

  // Normalize the probabilities so they sum to 1.
  const normalized = probabilities.map((p) => p / sum);
  let r = Math.random();
  let cumulative = 0;
  let index = 0;

  // Traverse through unvisited nodes in order to find selected node.
  for (const node of unvisited) {
    cumulative += normalized[index++];

    // Return the node where cumulative probability exceeds random threshold.
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
  // Initialize pheromone levels between all node pairs.
  const pheromones = Array.from({ length: n }, () => Array(n).fill(1));
  let bestPath: Node[] = [];
  let bestDistance = Infinity;

  // Main loop over number of iterations.
  for (let iter = 0; iter < iterations; iter++) {
    const allPaths: number[][] = [];
    const allLengths: number[] = [];

    // Simulate each ant's tour.
    for (let k = 0; k < ants; k++) {
      const path: number[] = [];
      const unvisited = new Set<number>(Array.from({ length: n }, (_, i) => i));
      let current = Math.floor(Math.random() * n);

      path.push(current);
      unvisited.delete(current);

      // Construct a tour by moving to unvisited nodes.
      while (unvisited.size > 0) {
        const next = chooseNextNode(
          current,
          unvisited,
          pheromones,
          distances,
          alpha,
          beta
        );
        path.push(next);
        unvisited.delete(next);
        current = next;
      }

      // Calculate length of this tour.
      const len = calculateTourDistance(path.map((i) => tsp.nodes[i]));
      allPaths.push(path);
      allLengths.push(len);

      // Update best path if this one is shorter.
      if (len < bestDistance) {
        bestDistance = len;
        bestPath = path.map((i) => tsp.nodes[i]);
      }
    }

    // Evaporate pheromones on all edges.
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        pheromones[i][j] *= 1 - evaporation;
      }
    }

    // Add pheromones based on paths taken by ants.
    for (let k = 0; k < ants; k++) {
      const path = allPaths[k];
      const len = allLengths[k];
      const deposit = Q / len;

      for (let i = 0; i < path.length; i++) {
        const from = path[i];
        const to = path[(i + 1) % path.length];

        pheromones[from][to] += deposit;
        pheromones[to][from] += deposit;
      }
    }
  }

  return {
    bestPath,
    bestDistance,
    initialDistance: calculateTourDistance(tsp.nodes), // temp
    performance: performance.now() - performanceBegin,
  };
}
