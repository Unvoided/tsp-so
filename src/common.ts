import type { Node } from "./loader.ts";

/**
 * Calculates the Euclidean distance between two nodes.
 *
 * @param a - The first node, containing x and y coordinates.
 * @param b - The second node, containing x and y coordinates.
 * @returns The Euclidean distance between node `a` and node `b`.
 */
export function calculateEuclideanDistance(a: Node, b: Node): number {
    return Math.hypot(a.x - b.x, a.y - b.y);
}

/**
 * Calculates the total distance of a given tour by summing up the distances
 * between consecutive nodes in the tour, including the distance from the last
 * node back to the first node to complete the loop.
 *
 * @param tour - An array of `Node` objects representing the tour.
 * @returns The total distance of the tour as a number.
 */
export function calculateTourDistance(tour: Node[]): number {
    let dist = 0;

    for (let i = 0; i < tour.length - 1; i++) {
        dist += calculateEuclideanDistance(tour[i], tour[i + 1]);
    }

    dist += calculateEuclideanDistance(tour[tour.length - 1], tour[0]);

    return dist;
}
