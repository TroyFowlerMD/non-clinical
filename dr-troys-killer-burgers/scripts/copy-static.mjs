import fs from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const dist = path.join(root, "dist");

async function copyFile(from, to) {
  await fs.mkdir(path.dirname(to), { recursive: true });
  await fs.copyFile(from, to);
}

for (const file of ["index.html", "styles.css", "sw.js", "manifest.webmanifest"]) {
  await copyFile(path.join(root, "src", file), path.join(dist, file));
}

await fs.cp(path.join(root, "assets", "generated"), path.join(dist, "assets"), {
  recursive: true
});

console.log("Copied static app files into dist/.");
