import type { TspFile, Node } from "./loader.ts";
import { calculateTourDistance } from "./common.ts";

/**
 * Performs the Tabu Search algorithm to solve the Traveling Salesman Problem (TSP).
 *
 * @param tsp - An object representing the TSP problem, containing the nodes to visit.
 * @param maxIterations - The maximum number of iterations to perform (default is 500).
 * @param tabuTenure - The number of iterations a move remains in the tabu list (default is 20).
 * @returns A tuple containing the best solution found (array of nodes) and its total distance.
 *
 * The algorithm starts with an initial solution and iteratively improves it by exploring
 * neighboring solutions generated using the 2-opt swap method. A tabu list is maintained
 * to prevent revisiting recently explored solutions, while allowing exceptions for solutions
 * that improve the best-known distance.
 *
 * The tabu list is implemented as a set, and a queue is used to manage the tenure of moves.
 * If the queue exceeds the specified tabu tenure, the oldest move is removed from the tabu list.
 */
export function tabuSearch(tsp: TspFile, maxIterations = 500, tabuTenure = 20) {
  let currentSolution = [...tsp.nodes];
  let bestSolution = [...currentSolution];
  let bestDistance = Infinity;

  const tabuList: Set<string> = new Set();
  const tabuQueue: string[] = [];

  for (let iter = 0; iter < maxIterations; iter++) {
    let bestNeighbor: Node[] = [];
    let bestNeighborDistance = Infinity;
    let moveMade = "";

    for (let i = 1; i < currentSolution.length - 1; i++) {
      for (let k = i + 1; k < currentSolution.length; k++) {
        const currentNeighbor = [
          ...currentSolution.slice(0, i),
          ...currentSolution.slice(i, k + 1).reverse(),
          ...currentSolution.slice(k + 1),
        ]
        const moveKey = `${currentSolution[i].id}-${currentSolution[k].id}`;
        const currentDistance = calculateTourDistance(currentNeighbor);

        if (!tabuList.has(moveKey) || currentDistance < bestNeighborDistance) {
          bestNeighbor = currentNeighbor;
          bestNeighborDistance = currentDistance;
          moveMade = moveKey;
        }
      }
    }

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

  return [bestSolution, bestDistance];
}
