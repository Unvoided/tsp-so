import { calculateEuclideanDistance, calculateTourDistance, twoOptSwapWithBestImprovement } from "./common.ts";
import type { Node, TspFile } from "./loader.ts";
import { nearestNeighbour } from "./neighbour.ts";


/**
 * Selects the next node to visit in the Ant Colony Optimization algorithm based on pheromone levels and distances.
 * 
 * The probability of choosing a node is proportional to the pheromone level (raised to the power of `alpha`)
 * and the inverse of the distance (raised to the power of `beta`). If all probabilities are zero, the function
 * falls back to returning the first unvisited node.
 *
 * @param current - The index of the current node.
 * @param unvisited - A set of indices representing nodes that have not yet been visited.
 * @param pheromones - A 2D array representing the pheromone levels between nodes.
 * @param distances - A 2D array representing the distances between nodes.
 * @param alpha - The influence factor of pheromone trails (higher values give more importance to pheromones).
 * @param beta - The influence factor of heuristic information (higher values give more importance to shorter distances).
 * @returns The index of the next node to visit.
 *
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
 * Solves the Traveling Salesman Problem (TSP) using the Ant Colony Optimization (ACO) algorithm,
 * enhanced with 2-Opt local search applied to the global best path in each iteration.
 * 
 * - The algorithm initializes pheromone levels uniformly and updates them based on the best path found in each iteration.
 * - Each ant constructs a tour probabilistically, influenced by pheromone trails and heuristic information.
 * - After all ants have constructed their tours, pheromone evaporation and deposit are performed.
 * - The global best path is further optimized using the 2-Opt local search heuristic.
 * - Only the best path (after 2-Opt optimization) is used for pheromone deposit in each iteration.
 *
 * @param tsp - The TSP problem instance containing the nodes to visit.
 * @param iterations - Number of algorithm iterations to perform (higher values may yield better solutions but increase runtime). Default is 100.
 * @param ants - Number of ants (simulated agents) per iteration. Default is 20.
 * @param alpha - Relative importance of pheromone strength when choosing the next node (higher values make ants more influenced by pheromones). Default is 1.
 * @param beta - Relative importance of heuristic information (e.g., inverse distance) when choosing the next node (higher values make ants prefer shorter edges). Default is 5.
 * @param evaporation - Pheromone evaporation rate (how quickly old pheromones fade, range: 0–1). Default is 0.5.
 * @param Q - Pheromone deposit factor (amount of pheromone added by each ant based on tour quality). Default is 100.
 * @returns An object containing:
 *   - `bestPath`: The best tour found as an array of nodes.
 *   - `bestDistance`: The total distance of the best tour found.
 *   - `initialDistance`: The distance of the initial tour found by the nearest neighbour heuristic.
 *   - `performance`: The elapsed time (in milliseconds) taken to run the algorithm.
 *
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

    // 2-Opt is run only once per iteration on the best path found.
    const optimizedBestPath = twoOptSwapWithBestImprovement(bestPath);
    const optimizedBestDistance = calculateTourDistance(optimizedBestPath);

    // Update global best if the 2-Opt improved path is even better
    if (optimizedBestDistance < bestDistance) {
      bestDistance = optimizedBestDistance;
      bestPath = optimizedBestPath;
    }

    // --- Pheromone Deposit based ONLY on the (2-Opt optimized) bestPath ---
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
  }

  return {
    bestPath,
    bestDistance,
    initialDistance,
    performance: performance.now() - performanceBegin,
  };
}