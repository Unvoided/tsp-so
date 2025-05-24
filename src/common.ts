import type { Node } from "./loader.ts";

/**
 * Calculates the Euclidean distance between two nodes.
 */
export function calculateEuclideanDistance(a: Node, b: Node): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

/**
 * Calculates the total distance of a given tour by summing up the distances
 * between consecutive nodes in the tour, including the distance from the last
 * node back to the first node to complete the loop.
 */
export function calculateTourDistance(tour: Node[]): number {
  let dist = 0;

  for (let i = 0; i < tour.length - 1; i++) {
    dist += calculateEuclideanDistance(tour[i], tour[i + 1]);
  }

  dist += calculateEuclideanDistance(tour[tour.length - 1], tour[0]);

  return dist;
}

/**
 * Performs a 2-opt swap on a given tour.
 */
export function twoOptSwap(tour: Node[], i: number, k: number): Node[] {
  // Create a new tour by reversing the segment between i and k.
  const newTour = [
    ...tour.slice(0, i),
    ...tour.slice(i, k + 1).reverse(),
    ...tour.slice(k + 1),
  ];

  return newTour;
}

/**
 * Two-opt swap algorithm to improve a given tour.
 *
 * Removes two edges from the tour and reconnects
 * the two paths in the opposite direction,
 * effectively reversing a segment of the tour.
 */
export function twoOptSwapWithBestImprovement(tour: Node[]): Node[] {
  let best = [...tour];
  let bestDistance = calculateTourDistance(best);
  let improved = true;

  while (improved) {
    improved = false;

    for (let i = 1; i < best.length - 1; i++) {
      for (let k = i + 1; k < best.length; k++) {
        // Generate a new tour by reversing a segment between i and k.
        const newTour = twoOptSwap(best, i, k);
        const newDistance = calculateTourDistance(newTour);

        // If the new tour is better, accept it.
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
