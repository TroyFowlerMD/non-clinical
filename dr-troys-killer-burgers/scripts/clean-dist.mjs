import fs from "node:fs/promises";
import path from "node:path";

await fs.rm(path.join(process.cwd(), "dist"), { recursive: true, force: true });
await fs.mkdir(path.join(process.cwd(), "dist"), { recursive: true });
