import type { Node } from "./loader.ts";

/**
 * Calculates the Euclidean distance between two nodes.
 *
 * @param a - The first node with x and y coordinates.
 * @param b - The second node with x and y coordinates.
 * @returns The Euclidean distance between the two nodes.
 */
export function calculateEuclideanDistance(a: Node, b: Node): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

/**
 * Calculates the total distance of a tour represented as an array of nodes.
 * The tour is assumed to be a closed loop, meaning the last node connects back to the first.
 *
 * @param tour - An array of nodes representing the tour.
 * @returns The total distance of the tour.
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
 * Performs a 2-opt swap on a tour by reversing the segment between two indices.
 *
 * @param tour - The current tour represented as an array of nodes.
 * @param i - The starting index of the segment to reverse.
 * @param k - The ending index of the segment to reverse.
 * @returns A new tour with the specified segment reversed.
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
 * Applies the 2-opt algorithm to improve a given tour by finding the best
 * possible 2-opt swap that reduces the total distance of the tour.
 * This function iteratively checks all pairs of indices in the tour and
 * performs a swap if it results in a shorter tour.
 *
 * @param tour - The initial tour represented as an array of nodes.
 * @returns The improved tour after applying the best 2-opt swaps.
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
