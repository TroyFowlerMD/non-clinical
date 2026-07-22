import fs from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";
import puppeteer from "puppeteer-core";

const root = process.cwd();
const screenshotsDir = path.join(root, "verification");
await fs.mkdir(screenshotsDir, { recursive: true });

const port = 4173;
const server = spawn(process.execPath, ["scripts/serve-dist.mjs"], {
  cwd: root,
  stdio: ["ignore", "pipe", "pipe"],
  env: { ...process.env, PORT: String(port) }
});

let serverReady = false;
server.stdout.on("data", (chunk) => {
  const text = chunk.toString();
  process.stdout.write(text);
  if (text.includes("Serving dist")) {
    serverReady = true;
  }
});
server.stderr.on("data", (chunk) => process.stderr.write(chunk));

async function waitForServer() {
  for (let i = 0; i < 50; i += 1) {
    if (serverReady) return;
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error("Local server did not start.");
}

async function browserPath() {
  const candidates = [
    process.env.PUPPETEER_EXECUTABLE_PATH,
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe"
  ].filter(Boolean);

  for (const candidate of candidates) {
    try {
      await fs.stat(candidate);
      return candidate;
    } catch {
      // Try the next installed browser.
    }
  }

  throw new Error("No Chrome or Edge executable was found for browser verification.");
}

try {
  await waitForServer();
  const browser = await puppeteer.launch({
    executablePath: await browserPath(),
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  });

  const page = await browser.newPage();
  const viewports = [
    { name: "phone", width: 390, height: 844 },
    { name: "tablet", width: 820, height: 1180 },
    { name: "desktop", width: 1440, height: 960 }
  ];

  for (const viewport of viewports) {
    await page.setViewport(viewport);
    await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: "networkidle0" });
    await page.screenshot({
      path: path.join(screenshotsDir, `${viewport.name}.png`),
      fullPage: true
    });

    const metrics = await page.evaluate(() => {
      const hero = document.querySelector(".hero");
      const title = document.querySelector(".hero-copy");
      const recipe = document.querySelector(".recipe-card");
      const bodyWidth = document.documentElement.scrollWidth;
      const viewportWidth = window.innerWidth;
      const rect = hero?.getBoundingClientRect();
      const titleRect = title?.getBoundingClientRect();
      const recipeRect = recipe?.getBoundingClientRect();
      return {
        bodyWidth,
        viewportWidth,
        heroHeight: rect?.height || 0,
        titleRight: titleRect?.right || 0,
        recipeTop: recipeRect?.top || 0
      };
    });

    if (metrics.bodyWidth > metrics.viewportWidth + 1) {
      throw new Error(`${viewport.name} viewport has horizontal overflow.`);
    }
    if (metrics.heroHeight < 140 || metrics.heroHeight > 430) {
      throw new Error(`${viewport.name} hero height is outside compact expected range.`);
    }
    if (viewport.name === "phone" && metrics.recipeTop > 820) {
      throw new Error("Phone recipe content starts too low in the first viewport.");
    }
  }

  await page.setViewport({ width: 390, height: 844 });
  await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: "networkidle0" });
  await page.click("[data-lang='es']");
  await page.click("[data-scale='half']");
  await page.select("[data-field='chile']", "jalapeno");
  await page.reload({ waitUntil: "networkidle0" });

  const persisted = await page.evaluate(() => ({
    title: document.querySelector("h1")?.textContent || "",
    scale: document.querySelector("[data-summary-scale]")?.textContent || "",
    chile: document.querySelector("[data-field='chile']")?.value || ""
  }));

  if (!persisted.title.includes("Hamburguesas")) {
    throw new Error("Spanish language preference did not persist.");
  }
  if (!persisted.scale.includes("1/2")) {
    throw new Error("Half scale preference did not persist.");
  }
  if (persisted.chile !== "jalapeno") {
    throw new Error("Chile option did not persist.");
  }

  await page.emulateMediaType("print");
  const pdfPath = path.join(screenshotsDir, "print-both.pdf");
  await page.select("[data-field='print-mode']", "both");
  await page.pdf({
    path: pdfPath,
    format: "Letter",
    printBackground: false,
    margin: { top: "0.5in", right: "0.45in", bottom: "0.5in", left: "0.45in" }
  });

  const printText = await page.evaluate(() => document.querySelector("#print-root")?.textContent || "");
  if (!printText.includes("https://drtroyskillerburgers.vercel.app/")) {
    throw new Error("Print view is missing the canonical production URL.");
  }
  if (printText.includes("localhost") || printText.includes("127.0.0.1")) {
    throw new Error("Print view must never include local preview URLs.");
  }

  await page.emulateMediaType("screen");
  await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: "networkidle0" });
  await page.evaluate(async () => {
    const registration = await navigator.serviceWorker.ready;
    await registration.update();
  });
  await page.setOfflineMode(true);
  await page.reload({ waitUntil: "networkidle0" });
  const offlineTitle = await page.$eval("h1", (node) => node.textContent || "");
  if (!offlineTitle) {
    throw new Error("Offline reload did not render app content.");
  }

  await browser.close();
  console.log("Browser verification passed. Screenshots and PDF are in verification/.");
} finally {
  server.kill();
}
