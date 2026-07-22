import fs from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const canonicalUrl = "https://drtroyskillerburgers.vercel.app/";

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

const manifestPath = path.join(root, "src", "manifest.webmanifest");
const manifest = JSON.parse(await fs.readFile(manifestPath, "utf8"));
const serviceWorker = await fs.readFile(path.join(root, "src", "sw.js"), "utf8");
const html = await fs.readFile(path.join(root, "src", "index.html"), "utf8");
const app = await fs.readFile(path.join(root, "src", "app.ts"), "utf8");

assert(manifest.name === "Dr. Troy's Killer Burgers", "Manifest name is incorrect.");
assert(manifest.id === canonicalUrl, "Manifest id must use the canonical production URL.");
assert(manifest.start_url === "./", "Manifest start_url should stay scoped to the deployed app root.");
assert(manifest.scope === "./", "Manifest scope should stay scoped to the deployed app root.");
assert(manifest.display === "standalone", "Manifest display must be standalone.");
assert(manifest.prefer_related_applications === false, "Manifest must not prefer related apps.");
assert(
  manifest.icons.some((icon) => icon.sizes === "192x192" && icon.purpose.includes("maskable")),
  "Manifest needs a 192x192 maskable icon."
);
assert(
  manifest.icons.some((icon) => icon.sizes === "512x512" && icon.purpose.includes("maskable")),
  "Manifest needs a 512x512 maskable icon."
);
assert(serviceWorker.includes("addEventListener(\"fetch\""), "Service worker needs a fetch handler.");
assert(serviceWorker.includes("dr-troys-killer-burgers-v1"), "Service worker cache name must be app-specific.");
assert(html.includes("<link rel=\"manifest\" href=\"manifest.webmanifest\">"), "HTML must link the manifest.");
assert(html.includes("<meta name=\"apple-mobile-web-app-capable\" content=\"yes\">"), "Missing Apple standalone metadata.");
assert(app.includes("beforeinstallprompt"), "App must handle beforeinstallprompt.");
assert(app.includes("appinstalled"), "App must handle appinstalled.");
assert(app.includes("localStorage"), "App state must persist locally.");
assert(app.includes("qr-canonical.svg"), "Print view must use the generated canonical QR code.");

console.log("Static lint checks passed.");
