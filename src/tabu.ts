import type { TspFile, Node } from "./loader.ts";
import { calculateEuclideanDistance, calculateTourDistance } from "./common.ts";

/**
 * Performs the Tabu Search algorithm to find an optimized solution for the Traveling Salesman Problem (TSP).
 *
 * The algorithm iteratively improves the solution by exploring neighbors and avoiding revisiting
 * recently explored moves using a tabu list. It also allows moves that improve the best solution
 * even if they are in the tabu list.
 */
export function tabuSearch(
  tsp: TspFile, // The TSP problem instance.
  maxIterations = 100 // Maximum number of iterations the algorithm will run (stopping criterion).
) {
  const performanceBegin = performance.now();

  // Initialize current and best solutions.
  let currentSolution = [...tsp.nodes];
  let bestSolution = currentSolution;
  let bestDistance = calculateTourDistance(currentSolution);
  const initialDistance = bestDistance;
  const tabuList: Node[][] = [];

  // Main loop: iterate through potential improvements.
  for (let iter = 0; iter < maxIterations; iter++) {
    let bestNeighbor: Node[] | null = null;
    let bestNeighborDistance = Infinity;
    let bestMove: Node[] = [];

    // Generate neighbors using 2-opt swaps.
    for (let i = 1; i < currentSolution.length - 1; i++) {
      for (let k = i + 1; k < currentSolution.length; k++) {
        // Create a new neighbor by reversing the segment [i, k].
        const currentNeighbor = [
          ...currentSolution.slice(0, i),
          ...currentSolution.slice(i, k + 1).reverse(),
          ...currentSolution.slice(k + 1),
        ];

        const move = [currentSolution[i], currentSolution[k]];
        const currentTourDistance = calculateTourDistance(currentNeighbor);

        // Check if move is allowed (not in tabu list or leads to improvement).
        if (!tabuList.includes(move) || currentTourDistance < bestDistance) {
          // Track the best neighbor found in this iteration.
          if (currentTourDistance < bestNeighborDistance) {
            bestNeighbor = currentNeighbor;
            bestNeighborDistance = currentTourDistance;
            bestMove = move;
          }
        }
      }
    }

    // Skip if no valid neighbor was found.
    if (!bestNeighbor) continue;

    // Move to the best neighbor found.
    currentSolution = bestNeighbor;

    // Update best known solution if improvement was found.
    if (bestNeighborDistance < bestDistance) {
      bestDistance = bestNeighborDistance;
      bestSolution = bestNeighbor;
    }
  }

  return {
    bestSolution,
    bestDistance,
    initialDistance,
    performance: performance.now() - performanceBegin,
  };
}
