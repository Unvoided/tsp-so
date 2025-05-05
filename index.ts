import * as fs from "node:fs";
import * as readline from "node:readline";

/**
 * Represents a node in the TSP file.
 */
interface Node {
  id: number;
  x: number;
  y: number;
}

/**
 * Represents a TSP file.
 */
interface TspFile {
  name?: string;
  comment?: string;
  type?: string;
  dimension?: number;
  edgeWeightType?: string;
  nodes: Node[];
}

/**
 * Reads a TSP file and extracts its contents.
 */
export const readTspFile = async (filePath: string): Promise<TspFile> => {
  const fileStream = fs.createReadStream(filePath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });
  let parsingNodes = false;
  let name: string | undefined;
  let comment: string | undefined;
  let type: string | undefined;
  let dimension: number | undefined;
  let edgeWeightType: string | undefined;
  const nodes: Array<Node> = [];

  for await (const line of rl) {
    const trimmed = line.trim();

    if (!trimmed || trimmed === "EOF") continue;
    if (trimmed === "NODE_COORD_SECTION") {
      parsingNodes = true;
      continue;
    }

    if (parsingNodes) {
      const [idStr, xStr, yStr] = trimmed.split(/\s+/);
      nodes.push({
        id: parseInt(idStr),
        x: parseFloat(xStr),
        y: parseFloat(yStr),
      });
    } else {
      const [key, ...rest] = trimmed.split(":");
      const value = rest.join(":").trim();

      switch (key.trim()) {
        case "NAME":
          name = value;
          break;
        case "COMMENT":
          comment = value;
          break;
        case "TYPE":
          type = value;
          break;
        case "DIMENSION":
          dimension = parseInt(value);
          break;
        case "EDGE_WEIGHT_TYPE":
          edgeWeightType = value;
          break;
      }
    }
  }

  return {
    name,
    comment,
    type,
    dimension,
    edgeWeightType,
    nodes,
  };
};
