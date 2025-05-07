import { readTspFile } from "./loader.ts"
import { tabuSearch } from "./tabu.ts";
import * as path from "node:path";

const tspFile = await readTspFile(path.join("./assets", "a280.tsp"));

console.log('tspFile.nodes', tspFile.nodes)
console.log('tabu2', tabuSearch(tspFile, 500, 50))