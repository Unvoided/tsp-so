import { type Node } from "./loader.ts";

export class TabuSearch {

    constructor() {}

    solve(nodes: Node[]) {
        const matrix = this.generateNeighbours(nodes);
        const intialSolution = this.generateInitialSolution(matrix);
        return this.calculateTourCost(intialSolution, matrix);
    }

    private calculateEuclideanDistance(a: Node, b: Node): number {
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        return Math.round(Math.sqrt(dx * dx + dy * dy));
    }

    private generateNeighbours(nodes: Node[]): number[][] {
        const n = nodes.length;
        const matrix: number[][] = Array.from({ length: n }, () => Array(n).fill(0));

        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n; j++) {
                if (i !== j) {
                    matrix[i][j] = this.calculateEuclideanDistance(nodes[i], nodes[j]);
                }
            }
        }

        return matrix;
    }

    private calculateTourCost(tour: number[], matrix: number[][]): number {
        let cost = 0;
        const n = tour.length;
        for (let i = 0; i < n - 1; i++) {
          cost += matrix[tour[i]][tour[i + 1]];
        }
        // Return to start
        cost += matrix[tour[n - 1]][tour[0]];
        return cost;
      }
      

    private generateInitialSolution(matrix: number[][]): number[] {
        const n = matrix.length;
        const visited = Array(n).fill(false);
        const tour: number[] = [];
      
        let current = 0;
        tour.push(current);
        visited[current] = true;
      
        for (let step = 1; step < n; step++) {
          let nearest = -1;
          let minDist = Infinity;
      
          for (let j = 0; j < n; j++) {
            if (!visited[j] && matrix[current][j] < minDist) {
              minDist = matrix[current][j];
              nearest = j;
            }
          }
      
          if (nearest !== -1) {
            tour.push(nearest);
            visited[nearest] = true;
            current = nearest;
          }
        }
      
        return tour;
      }
      
}