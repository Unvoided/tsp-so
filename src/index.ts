import * as fs from "node:fs";
import * as path from "node:path";
import { antColonyOptimization } from "./ant.ts";
import { readTspFile } from "./loader.ts";
import { scatterSearch } from "./scatter.ts";
import { tabuSearch } from "./tabu.ts";

/**
 * Files.
 */
const fileNames = [
  "a280",
  "bier127",
  "brazil58",
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
 * Loop.
 */
for (const fileName of fileNames) {
  const file = await readTspFile(
    path.join("./assets/tsp", fileName.concat(".tsp"))
  );
  const optimal = optimalFile[fileName];
  const [ant, tabu, scatter] = await Promise.all([
    antColonyOptimization(file, 1000, 40, 1, 10, 0.3, 500),
    tabuSearch(file, 500, 20),
    scatterSearch(file, 100, 5, 30),
  ]);

  console.table([
    {
      file: file.name,
      optimal,
      antCost: ant.bestDistance,
      antTime: ant.performance,
      antDeviation: Math.abs((ant.bestDistance - optimal) / optimal) * 100,
      tabuCost: tabu.bestDistance,
      tabuTime: tabu.performance,
      tabuDeviation: Math.abs((tabu.bestDistance - optimal) / optimal) * 100,
      scatterCost: scatter.bestDistance,
      scatterTime: scatter.performance,
      scatterDeviation:
        Math.abs((scatter.bestDistance - optimal) / optimal) * 100,
    },
  ]);
}
