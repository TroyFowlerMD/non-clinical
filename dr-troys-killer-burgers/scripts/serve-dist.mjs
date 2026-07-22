import http from "node:http";
import fs from "node:fs/promises";
import path from "node:path";

const root = path.join(process.cwd(), "dist");
const port = Number(process.env.PORT || 4173);

const contentTypes = new Map([
  [".html", "text/html; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".css", "text/css; charset=utf-8"],
  [".webmanifest", "application/manifest+json; charset=utf-8"],
  [".svg", "image/svg+xml"],
  [".png", "image/png"],
  [".jpg", "image/jpeg"],
  [".webp", "image/webp"],
  [".avif", "image/avif"]
]);

const server = http.createServer(async (request, response) => {
  const url = new URL(request.url || "/", `http://${request.headers.host}`);
  const safePath = path.normalize(decodeURIComponent(url.pathname)).replace(/^(\.\.[/\\])+/, "");
  const filePath = path.join(root, safePath === path.sep || safePath === "/" ? "index.html" : safePath);

  try {
    const stat = await fs.stat(filePath);
    const finalPath = stat.isDirectory() ? path.join(filePath, "index.html") : filePath;
    const body = await fs.readFile(finalPath);
    response.writeHead(200, {
      "Content-Type": contentTypes.get(path.extname(finalPath)) || "application/octet-stream"
    });
    response.end(body);
  } catch {
    const fallback = await fs.readFile(path.join(root, "index.html"));
    response.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    response.end(fallback);
  }
});

server.listen(port, "127.0.0.1", () => {
  console.log(`Serving dist at http://127.0.0.1:${port}`);
});
