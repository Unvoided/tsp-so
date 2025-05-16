import { readTspFile } from "./loader.ts";
import { scatterSearch } from "./scatter.ts";
import { tabuSearch } from "./tabu.ts";
import { antColonyOptimization } from "./ant.ts";
import * as path from "node:path";
import * as fs from "node:fs";

/**
 * Files.
 */
const optimalFile = JSON.parse(
  fs.readFileSync(path.join("./assets", "optimal.json"), "utf-8")
);
const tspFile = await readTspFile(path.join("./assets/tsp", "a280.tsp"));

/**
 * Optimal solution.
 */
const optimal = optimalFile[tspFile.name!];

/**
 * Ant Colony Optimization.
 */
console.time("Ant Colony Optimization");

const antBegin = performance.now();
const [, antResult] = antColonyOptimization(tspFile, 100, 20, 1, 5, 0.5, 100);
const antTime = (performance.now() - antBegin) / 1000;
const antDeviation =
  Math.abs((Math.round(antResult) - optimal) / optimal) * 100;

console.timeEnd("Ant Colony Optimization");
console.table([
  {
    'File': tspFile.name,
    'Optimal (s)': optimal,
    'Time (s)': Math.round(antTime),
    'Cost': Math.round(antResult),
    'Deviation (%)': Math.round(antDeviation),
  },
]);

/**
 * Tabu Search.
 */
console.time("Tabu Search");

const tabuBegin = performance.now();
const [, tabuResult, tabuInitial] = tabuSearch(
  tspFile,
  tspFile.nodes.length,
  Math.max(5, Math.floor(Math.sqrt(tspFile.nodes.length)))
);
const tabuTime = (performance.now() - tabuBegin) / 1000;
const tabuDeviation =
  Math.abs((Math.round(tabuResult) - optimal) / optimal) * 100;

console.timeEnd("Tabu Search");
console.table([
  {
    'File': tspFile.name,
    'Optimal (s)': optimal,
    'Initial Cost': Math.round(tabuInitial),
    'Cost': Math.round(tabuResult),
    'Duration (s)': Math.round(tabuTime),
    'Deviation (%)': Math.round(tabuDeviation),
  },
]);

/**
 * Scatter Search.
 */
console.time("Scatter Search");

const scatterBegin = performance.now();
const [, scatterResult, scatterInitial] = scatterSearch(tspFile, 100, 5, 30);
const scatterTime = (performance.now() - scatterBegin) / 1000;
const scatterDeviation =
  Math.abs((Math.round(scatterResult) - optimal) / optimal) * 100;

console.timeEnd("Scatter Search");
console.table([
  {
    'File': tspFile.name,
    'Optimal (s)': optimal,
    'Initial Cost': Math.round(scatterInitial),
    'Cost': Math.round(scatterResult),
    'Duration (s)': Math.round(scatterTime),
    'Deviation (%)': Math.round(scatterDeviation),
  },
]);
