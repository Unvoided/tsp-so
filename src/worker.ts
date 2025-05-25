import * as fs from "node:fs";
import * as path from "node:path";
import { antColony } from "./ant.ts";
import { readTspFile } from "./loader.ts";
import { scatterSearch } from "./scatter.ts";
import { tabuSearch } from "./tabu.ts";
import { saveResultsToXLSX } from "./xlsx.ts"
import { parentPort, workerData } from "node:worker_threads";

const optimalFile = JSON.parse(
    fs.readFileSync(path.join("./assets", "optimal.json"), "utf-8")
);

/**
 * Run algorithm.
 */
async function runAlgorithm(
    fileNames: string[],
    algorithm: "ant" | "tabu" | "scatter",
    params: number[],
    exportResults: boolean = false
) {
    const results = [];

    for (const fileName of fileNames) {
        console.log(`[${algorithm}] Processing file: ${fileName}.tsp`);
        const file = await readTspFile(
            path.join("./assets/problems", fileName.concat(".tsp"))
        );
        const optimal = optimalFile[fileName];
        const algorithms = {
            ant: () => antColony(file, ...params), // e.g., [1000, 40, 1, 10, 0.3, 500]
            tabu: () => tabuSearch(file, ...params), // e.g., [100]
            scatter: () => scatterSearch(file, ...params), // e.g., [100, 5, 30]
        };
        const result = algorithms[algorithm]();

        results.push({
            file: file.name,
            optimal: Math.round(optimal),
            cost: Math.round(result.bestDistance),
            initialCost: Math.round(result.initialDistance),
            time: (result.performance / 1000).toFixed(1).concat("s"),
            deviation: (Math.abs((result.bestDistance - optimal) / optimal) * 100)
                .toFixed(2)
                .concat("%"),
            params,
        });
    }

    if (exportResults) saveResultsToXLSX(algorithm, results);
    if (parentPort) {
        parentPort.postMessage(results);
        parentPort.close();
    }
}

runAlgorithm(...(workerData as Parameters<typeof runAlgorithm>))

if (parentPort) {
    parentPort.on('error', (err) => {
        console.error('Worker received error:', err);
    });
}