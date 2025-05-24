
import * as XLSX from "xlsx";
import * as fs from "fs";
import * as path from "path";

interface Result {
    file: string | undefined;
    optimal: number;
    cost: number;
    initialCost: number;
    time: string;
    deviation: string;
    params: number[];
}

/**
 * Saves the results of the TSP algorithms to an XLSX file.
 * @param algorithm - The name of the algorithm used (e.g., "ant", "tabu", "scatter").
 * @param results - An array of results containing file name, optimal cost, result cost, time, deviation, and parameters.
 */
export function saveResultsToXLSX(
    algorithm: "ant" | "tabu" | "scatter",
    results: Result[]
) {
    const sheetData = [
        [
            "File",
            "Optimal",
            "Result Cost",
            "Initial Cost (Nearest Neighbor)",
            "Time",
            "Deviation",
            "Parameters",
        ],
        ...results.map((r) => [
            r.file,
            r.optimal,
            r.cost,
            r.initialCost,
            r.time,
            r.deviation,
            JSON.stringify(r.params)
        ])
    ];

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet(sheetData);
    XLSX.utils.book_append_sheet(workbook, worksheet, `${algorithm}_results`);

    const outputDir = "assets/results";
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir);
    }
    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
    fs.writeFileSync(path.join(outputDir, `${algorithm}_results.xlsx`), buffer);

    console.log(`Results saved to assets/results/${algorithm}_results.xlsx`);
}