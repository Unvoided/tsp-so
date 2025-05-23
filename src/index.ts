import * as fs from "node:fs";
import * as path from "node:path";
import { antColony } from "./ant.ts";
import { readTspFile } from "./loader.ts";
import { scatterSearch } from "./scatter.ts";
import { tabuSearch } from "./tabu.ts";

/**
 * Files.
 */
const fileNames = [
  "a280",
  "bier127",
  "ch130",
  "ch150",
  "d198",
  "eil101",
  "gil262",
  "kroA100",
  "kroA150",
  "kroA200",
  "kroB100",
  "kroB150",
  "kroB200",
  "kroC100",
  "kroD100",
  "kroE100",
  "lin105",
  "pr107",
  "pr124",
  "pr136",
  "pr144",
  "pr152",
  "pr226",
  "pr264",
  "pr299",
  "rat195",
  "rd100",
  "ts225",
  "tsp225",
  "u159",
];
const optimalFile = JSON.parse(
  fs.readFileSync(path.join("./assets", "optimal.json"), "utf-8")
);

/**
 * Run algorithm.
 */
async function runAlgorithm(
  fileNames: string[],
  algorithm: "ant" | "tabu" | "scatter",
  params: number[]
) {
  const results = [];

  for (const fileName of fileNames) {
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
      time: (result.performance / 1000).toFixed(1).concat("s"),
      deviation: (Math.abs((result.bestDistance - optimal) / optimal) * 100)
        .toFixed(2)
        .concat("%"),
      params,
    });
  }

  console.table(results);
}

//runAlgorithm(fileNames, "ant", [1000, 40, 1, 10, 0.3, 500]);
//runAlgorithm(["kroA100", "kroA150", "kroA200", "kroB100", "kroB150"], "tabu", [500]);
//runAlgorithm(
//  ["pr107", "pr124", "pr136", "pr144", "pr152", "pr226", "pr264", "pr299"],
//  "tabu",
//  [500]
//);
runAlgorithm(
  ["pr107", "pr124", "pr136", "pr144", "pr152", "pr226", "pr264", "pr299"],
  "scatter",
  [100, 5, 30]
);
