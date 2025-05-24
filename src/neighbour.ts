import type { Node } from "./loader.ts";
import { calculateEuclideanDistance } from "./common.ts"; // Assumindo que calculateDistance está em common.ts

/**
 * Nearest Neighbor algorithm for solving the Traveling Salesman Problem.
 * This function constructs a tour by starting from a random node and repeatedly
 * visiting the nearest unvisited node until all nodes are visited.
 *
 * @param nodes - An array of nodes representing the cities to visit.
 * @returns An array of nodes representing the tour.
 */
export function nearestNeighbor(nodes: Node[]): Node[] {
    // Start from a random node
    const startNode = nodes[Math.floor(Math.random() * nodes.length)];
    const tour: Node[] = [startNode];
    const visited = new Set<number>([startNode.id]);

    // While there are still unvisited nodes, find the nearest one
    while (tour.length < nodes.length) {
        let nearestNode: Node | null = null;
        let minDistance = Infinity;

        // Iterate through all nodes to find the nearest unvisited node
        for (const node of nodes) {
            if (!visited.has(node.id)) {
                const distance = calculateEuclideanDistance(tour[tour.length - 1], node);
                if (distance < minDistance) {
                    minDistance = distance;
                    nearestNode = node;
                }
            }
        }

        if (nearestNode) {
            tour.push(nearestNode);
            visited.add(nearestNode.id);
        }
    }

    return tour;
}