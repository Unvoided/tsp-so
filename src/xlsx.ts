/*
import * as XLSX from "xlsx";

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
