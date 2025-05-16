import { readTspFile } from "./loader.ts";
import { scatterSearch } from "./scatter.ts";
import { tabuSearch } from "./tabu.ts";
import { antColonyOptimization } from "./ant.ts";
import * as path from "node:path";
import * as fs from "node:fs";
import * as XLSX from "xlsx";


const tspFile = await readTspFile(path.join("./assets/tsp", "a280.tsp"));

const [bestPath, bestLength] = antColonyOptimization(tspFile)

console.log(bestPath.length, bestLength, 'ant')

/*
const files = fs.readdirSync(path.join("./assets/tsp"));
const optimal = JSON.parse(fs.readFileSync(path.join("./assets", "optimal.json"), "utf-8"));

const results = await Promise.all(
    files.map(async (file) => {
        const tspFile = await readTspFile(path.join("./assets/tsp", file));
        console.log("Processing TSP instance:", tspFile.name);
        const optimalFile = optimal[tspFile.name!];

        const n = tspFile.nodes.length;
        const maxTabuIterations = n;
        const tabuTenure = Math.max(5, Math.floor(Math.sqrt(n)));
        const tabuBegin = performance.now();
        const [, tabuResult, tabuInitial] = tabuSearch(tspFile, maxTabuIterations, tabuTenure);
        const tabuTime = ((performance.now() - tabuBegin) / 1000).toFixed(1) + "s";


        const scatterBegin = performance.now();
        const [, scatterResult, scatterInitial] = scatterSearch(tspFile, 100, 5, 30);
        const scatterTime = ((performance.now() - scatterBegin) / 1000).toFixed(1) + "s";


        const result = {
            file: tspFile.name,
            optimal: optimalFile,
            tabuInitial: Math.round(tabuInitial),
            tabuResult: Math.round(tabuResult),
            tabuTime,
            tabuDeviation: (
                Math.abs((Math.round(tabuResult) - optimalFile) / optimalFile) * 100
            ).toFixed(2) + "%",
            scatterInitial: Math.round(scatterInitial),
            scatterResult: Math.round(scatterResult),
            scatterTime,
            scatterDeviation: (
                Math.abs((Math.round(scatterResult) - optimalFile) / optimalFile) * 100
            ).toFixed(2) + "%",
        };

        console.table([result]);

        return result;
    })
);

const sheetData = [
    [
        "File",
        "Optimal",
        "Tabu Initial",
        "Tabu Result",
        "Tabu Time",
        "Tabu Deviation",
        "Scatter Initial",
        "Scatter Result",
        "Scatter Time",
        "Scatter Deviation"
    ],
    ...results.map((r) => [
        r.file,
        r.optimal,
        r.tabuInitial,
        r.tabuResult,
        r.tabuTime,
        r.tabuDeviation,
        r.scatterInitial,
        r.scatterResult,
        r.scatterTime,
        r.scatterDeviation
    ])
];

const workbook = XLSX.utils.book_new();
const worksheet = XLSX.utils.aoa_to_sheet(sheetData);
XLSX.utils.book_append_sheet(workbook, worksheet, "TSP Results");

const outputDir = path.join(".", "output");
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
}
const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
fs.writeFileSync(path.join(outputDir, "tsp_results.xlsx"), buffer);

console.log("Results saved to output/tsp_results.xlsx");
*/
