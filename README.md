# 🧻 `tsplib-js` Javascript library to read and extract contents from a `.tsp` file

TSPLIB is a library of sample instances for the TSP (and related problems) from various sources and of various types.

Originally based on [tsplib](http://comopt.ifi.uni-heidelberg.de/software/TSPLIB95/).

## Usage

```ts
import { readTspFile } from "./index.ts"

console.log(await readTspFile("./foobar.tsp"));
```
