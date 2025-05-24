import type { TspFile, Node } from "./loader.ts";
import { calculateTourDistance, twoOptSwap } from "./common.ts";

/**
 * Tabu search algorithm.
 *
 * The algorithm iteratively improves the solution by exploring neighbors and avoiding revisiting
 * recently explored moves using a tabu list. It also allows moves that improve the best solution
 * even if they are in the tabu list.
 *
 * Fase inicial ——————————————————————————————————
 * Step 0: Inicializar a solução corrente, a melhor solução encontrada e lista tabu.
 *
 * Fase de pesquisa ——————————————————————————————
 * For each iteration:
 * Step 0: Método de melhoramento (2-opt swap).
 * Step 1: Método de avaliação da nova solução (critério de aspiração).
 * Step 2: Atualizar a solução corrente.
 */
export function tabuSearch(
  tsp: TspFile, // The TSP problem instance.
  maxIterations = 100 // Maximum number of iterations.
) {
  const performanceBegin = performance.now();

  // Fase inicial ———————————————————————————————————————
  // Step 0: Inicializar a solução corrente, a melhor solução encontrada e lista tabu.
  let current = [...tsp.nodes];
  let bestSolution = [...current];
  let bestDistance = calculateTourDistance(current);
  const tabuList: { from: number; to: number }[] = [];

  // Fase de pesquisa ——————————————————————————————
  for (let iter = 0; iter < maxIterations; iter++) {
    let bestNeighbor: Node[] = [];
    let bestNeighborCost = Infinity;
    let bestMove: { from: number; to: number } = { from: -1, to: -1 };

    for (let i = 1; i < current.length - 1; i++) {
      for (let k = i + 1; k < current.length; k++) {
        // Step 0: Método de melhoramento (2-opt swap).
        const neighbor = twoOptSwap(current, i, k);
        const distance = calculateTourDistance(neighbor);

        // Step 1: Método de avaliação da nova solução (critério de aspiração).
        const hasTabuMove = tabuList.some(
          (move) => move.from === i && move.to === k
        );
        if (
          // If the move is not tabu or improves the best solution ever found.
          (!hasTabuMove || distance < bestDistance) &&
          // And if the neighbor is better than the current best neighbor.
          distance < bestNeighborCost
        ) {
          bestNeighbor = neighbor;
          bestNeighborCost = distance;
          bestMove = { from: i, to: k };
        }
      }
    }

    // Step 2: Atualizar a solução corrente.
    if (bestNeighbor.length > 0) {
      current = bestNeighbor;
      tabuList.push(bestMove);

      if (bestNeighborCost < bestDistance) {
        bestSolution = bestNeighbor;
        bestDistance = bestNeighborCost;
      }
    }
  }

  return {
    bestSolution,
    bestDistance,
    performance: performance.now() - performanceBegin,
  };
}
