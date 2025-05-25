import { Worker } from "node:worker_threads";

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


[
    { algorithm: "ant", params: [100, 75, 1, 5, 0.7, 100] },
    { algorithm: "tabu", params: [100] },
    { algorithm: "scatter", params: [100, 5, 30] }
].forEach(({ algorithm, params }) => {
    const worker = new Worker("./src/worker.ts", {
        workerData: [
            fileNames,
            algorithm,
            params,
            true // Export results to XLSX
        ]
    });

    worker.on("message", (results) => {
        console.table(results.map((r: any) => ({
            algorithm,
            ...r
        })));
    });

    worker.on("error", (error) => {
        console.error(`Error in ${algorithm} worker:`, error);
    });

    worker.on("exit", (code) => {
        if (code !== 0) {
            console.error(`Worker stopped with exit code ${code}`);
        }
    });
});