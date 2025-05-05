import { readTspFile } from "./loader.ts"
import { TabuSearch } from "./tabu.ts";
import * as path from "node:path";

const tspFile = await readTspFile(path.join("./assets", "a280.tsp"));

const ts = new TabuSearch() 

console.log(ts.solve(tspFile.nodes));