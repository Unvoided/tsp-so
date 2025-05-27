import {
  calculateTourDistance,
  twoOptSwapWithBestImprovement,
} from "./common.ts";
import type { Node, TspFile } from "./loader.ts";
import { nearestNeighbour } from "./neighbour.ts";


/**
 * Combines two tours using a crossover operation to produce a new child tour.
 *
 * This function implements a genetic algorithm crossover technique, where a random segment
 * from the first parent tour (`tour1`) is copied into the child, and the remaining positions
 * are filled with nodes from the second parent tour (`tour2`) in their original order,
 * skipping any nodes already present in the child.
 *
 * @param tour1 - The first parent tour, represented as an array of `Node` objects.
 * @param tour2 - The second parent tour, represented as an array of `Node` objects.
 * @returns A new tour (array of `Node` objects) resulting from the crossover of `tour1` and `tour2`.
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
 * Implements the Scatter Search metaheuristic for the Traveling Salesman Problem (TSP).
 *
 * The algorithm works as follows:
 * 1. Generates an initial population of solutions using the nearest neighbour heuristic,
 *    each improved by the 2-opt local search.
 * 2. Selects an elite set of solutions (reference set) based on tour distance.
 * 3. Iteratively combines pairs of elite solutions using a crossover-like operator,
 *    followed by 2-opt improvement, to generate new candidate solutions.
 * 4. Updates the reference set by including new solutions if they are better than
 *    the current elite members, maintaining the elite set size.
 * 5. Returns the best tour found, its distance, the initial solution's distance,
 *    and the total computation time.
 *
 * @param tsp - The TSP problem instance containing the nodes to visit.
 * @param maxIterations - Maximum number of scatter search iterations (default: 100).
 * @param eliteSolutionsSize - Number of elite solutions to maintain in the reference set (default: 5).
 * @param populationSize - Number of initial solutions to generate (default: 30).
 * @returns An object containing:
 *   - `bestTour`: The best tour found (array of nodes).
 *   - `bestDistance`: The total distance of the best tour.
 *   - `initialDistance`: The distance of the initial solution.
 *   - `performance`: The elapsed computation time in milliseconds.
 */
export function scatterSearch(
  tsp: TspFile, // The TSP problem instance.
  maxIterations = 100, // Maximum number of iterations.
  eliteSolutionsSize = 5, // Size of elite solutions.
  populationSize = 30 // Size of the initial population.
) {
  const performanceBegin = performance.now();

  // Generate an initial solution using the nearest neighbour heuristic.
  const initialSolution = nearestNeighbour(tsp.nodes);

  // Create the initial population by applying 2-opt improvement to the initial solution.
  const population = Array.from({ length: populationSize }, () =>
    twoOptSwapWithBestImprovement(initialSolution)
  );

  // Select the best solutions to form the reference (elite) set.
  let referenceSet = population
    .sort((a, b) => calculateTourDistance(a) - calculateTourDistance(b))
    .slice(0, eliteSolutionsSize);

  for (let iter = 0; iter < maxIterations; iter++) {
    const newSolutions: Node[][] = [];

    // Combine each pair of elite solutions to generate new candidates.
    for (let i = 0; i < referenceSet.length; i++) {
      for (let k = i + 1; k < referenceSet.length; k++) {

        // Combine two tours using the crossover operator.
        const combined = combineToursWithCrossover(
          referenceSet[i],
          referenceSet[k]
        );

        // Improve the combined tour using 2-opt.
        const improved = twoOptSwapWithBestImprovement(combined);

        newSolutions.push(improved);
      }
    }

    // Update the reference set if new solutions are better than current elite members.
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
