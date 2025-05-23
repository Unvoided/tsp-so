import { calculateTourDistance } from "./common.ts";
import type { Node, TspFile } from "./loader.ts";

/**
 * Randomly shuffles an array using the Fisher-Yates algorithm.
 */
function shuffle<T>(array: T[]): T[] {
  const arr = [...array];

  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }

  return arr;
}

/**
 * Improves a TSP tour using the 2-opt algorithm.
 * It iteratively replaces two edges with two different ones to shorten the tour.
 */
function twoOptImproved(tour: Node[], maxLoops = 100): Node[] {
  let best = [...tour];
  let bestDistance = calculateTourDistance(best);
  let improved = true;
  let loops = 0;

  while (improved && loops < maxLoops) {
    improved = false;
    loops++;

    for (let i = 1; i < best.length - 1; i++) {
      for (let k = i + 1; k < best.length; k++) {
        // Generate a new tour by reversing a segment between i and k
        const newTour = [
          ...best.slice(0, i),
          ...best.slice(i, k + 1).reverse(),
          ...best.slice(k + 1),
        ];
        const newDistance = calculateTourDistance(newTour);

        // If the new tour is better, accept it
        if (newDistance < bestDistance) {
          best = newTour;
          bestDistance = newDistance;
          improved = true;
        }
      }
    }
  }

  return best;
}

/**
 * Combines two tours using a crossover-like strategy.
 * Preserves a segment from the first parent and fills in the rest from the second.
 */
function combineTours(t1: Node[], t2: Node[]): Node[] {
  const size = t1.length;
  const child: Node[] = new Array(size);
  const used = new Set<number>();

  // Random segment [start, end] from the first tour
  const [start, end] = [
    Math.floor(Math.random() * size),
    Math.floor(Math.random() * size),
  ].sort((a, b) => a - b);

  // Copy the segment from the first parent
  for (let i = start; i <= end; i++) {
    child[i] = t1[i];
    used.add(t1[i].id);
  }

  // Fill remaining positions with nodes from the second parent
  let idx = 0;
  for (let i = 0; i < size; i++) {
    const node = t2[i];
    if (!used.has(node.id)) {
      while (child[idx]) idx++;
      child[idx] = node;
      used.add(node.id);
    }
  }

  return child;
}

/**
 * Main Scatter Search algorithm for solving the TSP.
 */
export function scatterSearch(
  tsp: TspFile, // The TSP problem instance.
  maxIterations = 100, // Maximum number of iterations
  refSetSize = 5, // Size of the reference set (elite solutions)
  candidateSize = 30 // Number of initial random candidate solutions
) {
  const performanceBegin = performance.now(); // Start timer
  const candidatePool: Node[][] = [];

  // Step 1: Generate and improve candidate solutions
  for (let i = 0; i < candidateSize; i++) {
    const randomTour = shuffle(tsp.nodes);
    const improved = twoOptImproved(randomTour);
    candidatePool.push(improved);
  }

  // Step 2: Select the best candidates to form the initial reference set
  candidatePool.sort(
    (a, b) => calculateTourDistance(a) - calculateTourDistance(b)
  );
  let referenceSet = candidatePool.slice(0, refSetSize);
  let bestTour = referenceSet[0];
  let bestDistance = calculateTourDistance(bestTour);
  const initialDistance = bestDistance;

  // Step 3: Iteratively combine reference solutions and improve them
  for (let iter = 0; iter < maxIterations; iter++) {
    const newSolutions: Node[][] = [];

    // Combine each pair of solutions in the reference set
    for (let i = 0; i < referenceSet.length; i++) {
      for (let j = i + 1; j < referenceSet.length; j++) {
        const child = combineTours(referenceSet[i], referenceSet[j]);
        const improved = twoOptImproved(child);

        newSolutions.push(improved);
      }
    }

    // Step 4: Update reference set with the best combined solutions
    const combined = [...referenceSet, ...newSolutions];
    combined.sort(
      (a, b) => calculateTourDistance(a) - calculateTourDistance(b)
    );
    const newBest = combined[0];
    const newBestDistance = calculateTourDistance(newBest);

    // If no improvement, stop early
    if (newBestDistance >= bestDistance) break;

    bestTour = newBest;
    bestDistance = newBestDistance;
    referenceSet = combined.slice(0, refSetSize);
  }

  return {
    bestTour,
    bestDistance,
    initialDistance,
    performance: performance.now() - performanceBegin,
  };
}
