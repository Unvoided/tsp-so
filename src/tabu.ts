import type { TspFile, Node } from "./loader.ts";
import { calculateTourDistance } from "./common.ts";

/**
 * Performs the Tabu Search algorithm to find an optimized solution for the Traveling Salesman Problem (TSP).
 *
 * The algorithm iteratively improves the solution by exploring neighbors and avoiding revisiting
 * recently explored moves using a tabu list. It also allows moves that improve the best solution
 * even if they are in the tabu list.
 */
export function tabuSearch(
  tsp: TspFile, // The TSP problem instance.
  maxIterations = 100, // Maximum number of iterations the algorithm will run (stopping criterion).
  tabuTenure = 20 // Number of iterations a move remains in the tabu list (tabu duration).
) {
  const performanceBegin = performance.now();

  // Initialize current and best solutions.
  let currentSolution = [...tsp.nodes];
  let bestSolution = [...currentSolution];
  let bestDistance = calculateTourDistance(currentSolution);
  const initialDistance = bestDistance;

  // Tabu structures to track recently used moves.
  const tabuList: Set<string> = new Set(); // Fast lookup for tabu moves.
  const tabuQueue: string[] = []; // FIFO queue to maintain tabu tenure.

  // Main loop: iterate through potential improvements.
  for (let iter = 0; iter < maxIterations; iter++) {
    let bestNeighbor: Node[] | null = null;
    let bestNeighborDistance = Infinity;
    let moveMade = ""; // Store the move that generated the best neighbor.

    // Generate neighbors using 2-opt swaps
    for (let i = 1; i < currentSolution.length - 1; i++) {
      for (let k = i + 1; k < currentSolution.length; k++) {
        // Create a new neighbor by reversing the segment [i, k].
        const currentNeighbor = [
          ...currentSolution.slice(0, i),
          ...currentSolution.slice(i, k + 1).reverse(),
          ...currentSolution.slice(k + 1),
        ];

        // Create a unique key for the move.
        const idA = currentSolution[i].id;
        const idB = currentSolution[k].id;
        const moveKey = `${Math.min(idA, idB)}-${Math.max(idA, idB)}`;

        const currentDistance = calculateTourDistance(currentNeighbor);

        // Check if move is allowed (not in tabu list or leads to improvement).
        if (!tabuList.has(moveKey) || currentDistance < bestDistance) {
          // Track the best neighbor found in this iteration
          if (currentDistance < bestNeighborDistance) {
            bestNeighbor = currentNeighbor;
            bestNeighborDistance = currentDistance;
            moveMade = moveKey;
          }
        }
      }
    }

    if (!bestNeighbor) continue; // Skip if no valid neighbor was found.

    // Move to the best neighbor found.
    currentSolution = bestNeighbor;

    // Update best known solution if improvement was found.
    if (bestNeighborDistance < bestDistance) {
      bestDistance = bestNeighborDistance;
      bestSolution = bestNeighbor;
    }

    // Add move to tabu list and maintain its tenure.
    tabuList.add(moveMade);
    tabuQueue.push(moveMade);

    if (tabuQueue.length > tabuTenure) {
      const removed = tabuQueue.shift();

      if (removed) tabuList.delete(removed); // Remove oldest move when over tenure.
    }
  }

  return {
    bestSolution,
    bestDistance,
    initialDistance,
    performance: performance.now() - performanceBegin,
  };
}
