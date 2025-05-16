import { calculateTourDistance } from "./common.ts";
import type { Node, TspFile } from "./loader.ts";

function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

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
        const newTour = [
          ...best.slice(0, i),
          ...best.slice(i, k + 1).reverse(),
          ...best.slice(k + 1),
        ];
        const newDistance = calculateTourDistance(newTour);

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

function combineTours(t1: Node[], t2: Node[]): Node[] {
  const size = t1.length;
  const child: Node[] = new Array(size);
  const used = new Set<number>();
  const [start, end] = [
    Math.floor(Math.random() * size),
    Math.floor(Math.random() * size),
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

export function scatterSearch(
  tsp: TspFile,
  maxIterations = 100,
  refSetSize = 5,
  candidateSize = 30
) {
  const performanceBegin = performance.now();
  const candidatePool: Node[][] = [];

  for (let i = 0; i < candidateSize; i++) {
    const randomTour = shuffle(tsp.nodes);
    const improved = twoOptImproved(randomTour);
    candidatePool.push(improved);
  }

  candidatePool.sort(
    (a, b) => calculateTourDistance(a) - calculateTourDistance(b)
  );
  let referenceSet = candidatePool.slice(0, refSetSize);
  let bestTour = referenceSet[0];
  let bestDistance = calculateTourDistance(bestTour);
  const initialDistance = bestDistance;

  for (let iter = 0; iter < maxIterations; iter++) {
    const newSolutions: Node[][] = [];

    for (let i = 0; i < referenceSet.length; i++) {
      for (let j = i + 1; j < referenceSet.length; j++) {
        const child = combineTours(referenceSet[i], referenceSet[j]);
        const improved = twoOptImproved(child);
        newSolutions.push(improved);
      }
    }

    const combined = [...referenceSet, ...newSolutions];
    combined.sort(
      (a, b) => calculateTourDistance(a) - calculateTourDistance(b)
    );
    const newBest = combined[0];
    const newBestDistance = calculateTourDistance(newBest);

    if (newBestDistance >= bestDistance) break;

    bestTour = newBest;
    bestDistance = newBestDistance;
    referenceSet = combined.slice(0, refSetSize);
  }

  const performanceEnd = performance.now();

  return {
    bestTour,
    bestDistance,
    initialDistance,
    performance: Math.round((performanceEnd - performanceBegin) / 1000),
  };
}
