import type { TspFile, Node } from "./loader.ts";

function distance(a: Node, b: Node): number {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
}

function totalDistance(tour: Node[]): number {
    let dist = 0;
    for (let i = 0; i < tour.length - 1; i++) {
        const d = distance(tour[i], tour[i + 1]);
        dist += d;
    }
    const lastLeg = distance(tour[tour.length - 1], tour[0]);
    dist += lastLeg;
    return dist;
}

function twoOptSwap(route: Node[], i: number, k: number): Node[] {
    return [
        ...route.slice(0, i),
        ...route.slice(i, k + 1).reverse(),
        ...route.slice(k + 1),
    ];
}

export function tabuSearch(tsp: TspFile, maxIterations = 500, tabuTenure = 20): [Node[], number] {
    let currentSolution = [...tsp.nodes];
    let bestSolution = [...currentSolution];
    let bestDistance = totalDistance(bestSolution);

    const tabuList: Set<string> = new Set();
    const tabuQueue: string[] = [];

    for (let iter = 0; iter < maxIterations; iter++) {
        let bestNeighbor: Node[] | null = null;
        let bestNeighborDistance = Infinity;
        let moveMade = "";

        for (let i = 1; i < currentSolution.length - 1; i++) {
            for (let k = i + 1; k < currentSolution.length; k++) {
                const neighbor = twoOptSwap(currentSolution, i, k);
                const moveKey = `${currentSolution[i].id}-${currentSolution[k].id}`;
                const dist = totalDistance(neighbor);

                if (!tabuList.has(moveKey) || dist < bestDistance) {
                    if (dist < bestNeighborDistance) {
                        bestNeighbor = neighbor;
                        bestNeighborDistance = dist;
                        moveMade = moveKey;
                    }
                }
            }
        }

        if (bestNeighbor) {
            currentSolution = bestNeighbor;
            if (bestNeighborDistance < bestDistance) {
                bestDistance = bestNeighborDistance;
                bestSolution = [...bestNeighbor];
            }

            tabuList.add(moveMade);
            tabuQueue.push(moveMade);
            if (tabuQueue.length > tabuTenure) {
                const removed = tabuQueue.shift();
                if (removed) tabuList.delete(removed);
            }
        }
    }

    return [bestSolution, bestDistance];
}
