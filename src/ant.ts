import { calculateEuclideanDistance, calculateTourDistance } from "./common.ts";
import type { Node, TspFile } from "./loader.ts";

/**
 * Initializes a pheromone matrix with default value of 1.
 */
function initializePheromones(n: number): number[][] {
  const pheromones = Array.from({ length: n }, () => Array(n).fill(1));
  return pheromones;
}

/**
 * Chooses the next node to visit based on pheromone levels and heuristic desirability.
 */
function chooseNextNode(
  current: number,
  unvisited: Set<number>,
  pheromones: number[][],
  distances: number[][],
  alpha: number,
  beta: number
): number {
  const probabilities: number[] = [];
  let sum = 0;

  for (const node of unvisited) {
    const tau = Math.pow(pheromones[current][node], alpha);
    const eta = Math.pow(1 / distances[current][node], beta);
    const prob = tau * eta;
    probabilities.push(prob);
    sum += prob;
  }

  const normalized = probabilities.map((p) => p / sum);
  let r = Math.random();
  let cumulative = 0;
  let index = 0;

  for (const node of unvisited) {
    cumulative += normalized[index++];

    if (r <= cumulative) return node;
  }

  return [...unvisited][0]; // Fallback
}

/**
 * Solves the Traveling Salesman Problem using Ant Colony Optimization.
 */
export function antColonyOptimization(
  tsp: TspFile,
  iterations = 100,
  ants = 20,
  alpha = 1,
  beta = 5,
  evaporation = 0.5,
  Q = 100
): [Node[], number] {
  const n = tsp.nodes.length;
  const distances = Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) =>
      calculateEuclideanDistance(tsp.nodes[i], tsp.nodes[j])
    )
  );
  const pheromones = initializePheromones(n);

  let bestPath: Node[] = [];
  let bestLength = Infinity;

  for (let iter = 0; iter < iterations; iter++) {
    const allPaths: number[][] = [];
    const allLengths: number[] = [];

    for (let k = 0; k < ants; k++) {
      const path: number[] = [];
      const unvisited = new Set<number>(Array.from({ length: n }, (_, i) => i));
      let current = Math.floor(Math.random() * n);
      path.push(current);
      unvisited.delete(current);

      while (unvisited.size > 0) {
        const next = chooseNextNode(
          current,
          unvisited,
          pheromones,
          distances,
          alpha,
          beta
        );
        path.push(next);
        unvisited.delete(next);
        current = next;
      }

      const len = calculateTourDistance(path.map((i) => tsp.nodes[i]));
      allPaths.push(path);
      allLengths.push(len);

      if (len < bestLength) {
        bestLength = len;
        bestPath = path.map((i) => tsp.nodes[i]);
      }
    }

    // Evaporate pheromones.
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        pheromones[i][j] *= 1 - evaporation;
      }
    }

    // Add new pheromones.
    for (let k = 0; k < ants; k++) {
      const path = allPaths[k];
      const len = allLengths[k];
      const deposit = Q / len;
      for (let i = 0; i < path.length; i++) {
        const from = path[i];
        const to = path[(i + 1) % path.length];
        pheromones[from][to] += deposit;
        pheromones[to][from] += deposit;
      }
    }
  }

  return [bestPath, bestLength];
}
