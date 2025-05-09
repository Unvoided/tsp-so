import { readTspFile } from "./loader.ts"
import { scatterSearch } from "./scatter.ts";
import { tabuSearch } from "./tabu.ts";
import * as path from "node:path";

const tspFile = await readTspFile(path.join("./assets", process.env.TSP_FILE!));

const tabuBegin = performance.now()
console.log('tabu', tabuSearch(tspFile, 10, 20)[1], performance.now() - tabuBegin)

const scatterBegin = performance.now()
console.log('scatter', scatterSearch(tspFile, 10, 20, 1)[1], performance.now() - scatterBegin)