import { calculateTourDistance } from './common.ts';
import type { Node, TspFile } from './loader.ts';

function shuffle<T>(array: T[]): T[] {
    const arr = [...array];

    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }

    return arr;
}

function twoOptImproved(tour: Node[]): Node[] {
    let best = [...tour];
    let improved = true;

    while (improved) {
        improved = false;

        for (let i = 1; i < best.length - 1; i++) {
            for (let k = i + 1; k < best.length; k++) {
                const newTour = [
                    ...best.slice(0, i),
                    ...best.slice(i, k + 1).reverse(),
                    ...best.slice(k + 1),
                ];

                if (calculateTourDistance(newTour) < calculateTourDistance(best)) {
                    best = newTour;
                    improved = true;
                }
            }
        }
    }

    return best;
}

function combineTours(t1: Node[], t2: Node[]): Node[] {
    const size = t1.length;
    const child: Node[] = new Array(size);
    const used = new Set<number>();
    const [start, end] = [
        Math.floor(Math.random() * size),
        Math.floor(Math.random() * size)
    ].sort((a, b) => a - b);

    for (let i = start; i <= end; i++) {
        child[i] = t1[i];
        used.add(t1[i].id);
    }

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
 * Performs a scatter search algorithm to solve the Traveling Salesman Problem (TSP).
 * 
 * The algorithm generates an initial candidate pool of tours, improves them using the 2-opt heuristic,
 * and iteratively combines and improves solutions to find an optimal or near-optimal tour.
 * 
 * @param tsp - The TSP file containing the nodes to visit.
 * @param maxIterations - The maximum number of iterations to perform (default is 100).
 * @param refSetSize - The size of the reference set used for combining solutions (default is 5).
 * @param candidateSize - The number of initial candidate solutions to generate (default is 30).
 * @returns A tuple containing:
 *   - The best tour found as an array of nodes.
 *   - The total distance of the best tour.
 *   - The distance of the initial best tour before iterations.
 */
export function scatterSearch(tsp: TspFile, maxIterations = 100, refSetSize = 5, candidateSize = 30): [Node[], number, number] {
    const candidatePool: Node[][] = [];

    for (let i = 0; i < candidateSize; i++) {
        const randomTour = shuffle(tsp.nodes);
        const improved = twoOptImproved(randomTour);
        candidatePool.push(improved);
    }

    candidatePool.sort((a, b) => calculateTourDistance(a) - calculateTourDistance(b));
    const initialDistance = calculateTourDistance(candidatePool[0]);
    let referenceSet = candidatePool.slice(0, refSetSize);

    for (let iter = 0; iter < maxIterations; iter++) {
        const newSolutions: Node[][] = [];

        for (let i = 0; i < referenceSet.length; i++) {
            for (let j = i + 1; j < referenceSet.length; j++) {
                const child = combineTours(referenceSet[i], referenceSet[j]);
                const improved = twoOptImproved(child);

                newSolutions.push(improved);
            }
        }

        referenceSet = [...referenceSet, ...newSolutions].sort((a, b) => calculateTourDistance(a) - calculateTourDistance(b))
    }

    return [referenceSet[0], calculateTourDistance(referenceSet[0]), initialDistance];
}
