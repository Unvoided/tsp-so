import {
  calculateTourDistance,
  twoOptSwapWithBestImprovement,
} from "./common.ts";
import type { Node, TspFile } from "./loader.ts";
import { nearestNeighbour } from "./neighbour.ts";

/**
 * Combines two tours using a crossover-like strategy.
 * Preserves a segment from the first parent and fills in the rest from the second.
 */
function combineToursWithCrossover(tour1: Node[], tour2: Node[]): Node[] {
  const size = tour1.length;
  const child = new Array(size);
  const used = new Set<number>();

  // Random segment [start, end] from the first tour.
  const [start, end] = [
    Math.floor(Math.random() * size),
    Math.floor(Math.random() * size),
  ].sort((a, b) => a - b);

  // Copy the segment from the first parent.
  for (let i = start; i <= end; i++) {
    child[i] = tour1[i];
    used.add(tour1[i].id);
  }

  // Fill remaining positions with nodes from the second parent.
  let idx = 0;
  for (let i = 0; i < size; i++) {
    const node = tour2[i];

    if (!used.has(node.id)) {
      while (child[idx]) idx++;
      child[idx] = node;
      used.add(node.id);
    }
  }

  return child;
}

/**
 * Scatter cearch algorithm.
 *
 * Fase inicial ————————————————————————————————————————————————————
 * Step 0: Método de geração de soluções diversificadas
 * Step 1: Método de melhoramento (2-opt swap improved).
 * Step 2: Método de atualização do conjunto de referência (& slice elit solutions).
 *
 * Fase de pesquisa por dispersão ——————————————————————————————————
 * While (existirem novas soluções no conjunto de referência)
 * Step 0: Método de geração de subconjuntos (crossover + 2-opt swap improved + slice elite solutions).
 * Step 1: Método de combinação de soluções (crossover).
 * Step 2: Método de melhoramento (2-opt swap improved).
 * Step 3: Método de atualização do conjunto de referência (slice elit solutions).
 */
export function scatterSearch(
  tsp: TspFile, // The TSP problem instance.
  maxIterations = 100, // Maximum number of iterations.
  eliteSolutionsSize = 5, // Size of elit solutions.
  populationSize = 30 // Size of the initial population.
) {
  const performanceBegin = performance.now();

  // Fase inicial ———————————————————————————————————————

  // Step 0: Método de geração de soluções siversificadas.

  // Nearest Neighbor Heuristic to get an initial solution.
  const initialSolution = nearestNeighbour(tsp.nodes);

  const population = Array.from({ length: populationSize }, () =>
    // Step 1: Método de melhoramento (2-opt swap improved).
    twoOptSwapWithBestImprovement(initialSolution)
  );
  // Step 2: Método de atualização do conjunto de referência.
  let referenceSet = population
    .sort((a, b) => calculateTourDistance(a) - calculateTourDistance(b))
    .slice(0, eliteSolutionsSize);

  // Fase de pesquisa por dispersão ————————————————————————

  // Step 0: Método de geração de subconjuntos (crossover + 2-opt swap improved + slice elite solutions).
  for (let iter = 0; iter < maxIterations; iter++) {
    const newSolutions: Node[][] = [];

    for (let i = 0; i < referenceSet.length; i++) {
      for (let k = i + 1; k < referenceSet.length; k++) {
        // Step 1: Método de combinação de soluções (crossover).
        const combined = combineToursWithCrossover(
          referenceSet[i],
          referenceSet[k]
        );
        // Step 2: Método de melhoramento (2-opt swap improved).
        const improved = twoOptSwapWithBestImprovement(combined);

        newSolutions.push(improved);
      }
    }

    // Step 3: Método de atualização do conjunto de referência (slice elit solutions).
    for (const solution of newSolutions) {
      if (
        !referenceSet.some((tour) => {
          return calculateTourDistance(tour) <= calculateTourDistance(solution);
        })
      ) {
        referenceSet.push(solution);
        referenceSet.sort(
          (a, b) => calculateTourDistance(a) - calculateTourDistance(b)
        );
        referenceSet = referenceSet.slice(0, eliteSolutionsSize);
      }
    }
  }

  return {
    bestTour: referenceSet[0],
    bestDistance: calculateTourDistance(referenceSet[0]),
    initialDistance: calculateTourDistance(initialSolution),
    performance: performance.now() - performanceBegin,
  };
}
