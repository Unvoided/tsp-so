import type { TspFile, Node } from "./loader.ts";
import { calculateTourDistance } from "./common.ts";

/**
 * Performs the Tabu Search algorithm to find an optimized solution for the Traveling Salesman Problem (TSP).
 *
 * @param tsp - An object representing the TSP problem, containing the nodes to visit.
 * @param maxIterations - The maximum number of iterations to perform (default is 500).
 * @param tabuTenure - The number of iterations a move remains in the tabu list (default is 20).
 * @returns A tuple containing:
 *   - The best solution found as an array of nodes.
 *   - The total distance of the best solution.
 *   - The initial distance of the starting solution.
 *
 * The algorithm iteratively improves the solution by exploring neighbors and avoiding revisiting
 * recently explored moves using a tabu list. It also allows moves that improve the best solution
 * even if they are in the tabu list.
 */
export function tabuSearch(tsp: TspFile, maxIterations = 500, tabuTenure = 20) {
  const performanceBegin = performance.now();
  let currentSolution = [...tsp.nodes];
  let bestSolution = [...currentSolution];
  let bestDistance = calculateTourDistance(currentSolution);

  const initialDistance = bestDistance;

  const tabuList: Set<string> = new Set();
  const tabuQueue: string[] = [];

  for (let iter = 0; iter < maxIterations; iter++) {
    let bestNeighbor: Node[] | null = null;
    let bestNeighborDistance = Infinity;
    let moveMade = "";

    for (let i = 1; i < currentSolution.length - 1; i++) {
      for (let k = i + 1; k < currentSolution.length; k++) {
        const currentNeighbor = [
          ...currentSolution.slice(0, i),
          ...currentSolution.slice(i, k + 1).reverse(),
          ...currentSolution.slice(k + 1),
        ];

        const idA = currentSolution[i].id;
        const idB = currentSolution[k].id;
        const moveKey = `${Math.min(idA, idB)}-${Math.max(idA, idB)}`;

        const currentDistance = calculateTourDistance(currentNeighbor);

        if (!tabuList.has(moveKey) || currentDistance < bestDistance) {
          if (currentDistance < bestNeighborDistance) {
            bestNeighbor = currentNeighbor;
            bestNeighborDistance = currentDistance;
            moveMade = moveKey;
          }
        }
      }
    }

    if (!bestNeighbor) continue;

    currentSolution = bestNeighbor;

    if (bestNeighborDistance < bestDistance) {
      bestDistance = bestNeighborDistance;
      bestSolution = bestNeighbor;
    }

    tabuList.add(moveMade);
    tabuQueue.push(moveMade);
    if (tabuQueue.length > tabuTenure) {
      const removed = tabuQueue.shift();
      if (removed) tabuList.delete(removed);
    }
  }

  const performanceEnd = performance.now();

  return {
    bestSolution,
    bestDistance,
    initialDistance,
    performance: Math.round((performanceEnd - performanceBegin) / 1000),
  };
}
