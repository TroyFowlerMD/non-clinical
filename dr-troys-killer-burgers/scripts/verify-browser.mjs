import fs from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";
import puppeteer from "puppeteer-core";

const root = process.cwd();
const screenshotsDir = path.join(root, "verification");
await fs.mkdir(screenshotsDir, { recursive: true });
const pause = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

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

  await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: "networkidle0" });
  await page.evaluate(() => localStorage.clear());

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
  await page.reload({ waitUntil: "networkidle0" });

  const persisted = await page.evaluate(() => ({
    title: document.querySelector("h1")?.textContent || "",
    scale: document.querySelector("[data-summary-scale]")?.textContent || "",
    chileVisible: (() => {
      const node = document.querySelector("[data-field='chile']");
      return Boolean(node && getComputedStyle(node.closest(".control-group") || node).display !== "none" && node.getClientRects().length);
    })()
  }));

  if (!persisted.title.includes("Hamburguesas")) {
    throw new Error("Spanish language preference did not persist.");
  }
  if (!persisted.scale.includes("1/2")) {
    throw new Error("Half scale preference did not persist.");
  }
  if (persisted.chileVisible) {
    throw new Error("Chile selector is still visible on the webpage.");
  }

  const substitutionCount = await page.evaluate(() => document.querySelectorAll("#ingredients-root details.inline-substitution").length);
  if (substitutionCount !== 2) {
    throw new Error("Expected exactly two substitution cards.");
  }
  const initialCards = await page.evaluate(() => [...document.querySelectorAll("#ingredients-root details.inline-substitution")].map((card) => card.open));
  if (initialCards.some(Boolean)) {
    throw new Error("Substitution cards must be collapsed by default.");
  }
  const substitutionSummaries = await page.$$("#ingredients-root details.inline-substitution summary");
  await substitutionSummaries[0].click();
  const firstOpen = await page.evaluate(() => document.querySelector("#ingredients-root details.inline-substitution")?.open === true);
  if (!firstOpen) {
    throw new Error("Montreal seasoning substitution card did not expand.");
  }
  await substitutionSummaries[1].click();
  const cardsOpen = await page.evaluate(() => [...document.querySelectorAll("#ingredients-root details.inline-substitution")].map((card) => card.open));
  if (!cardsOpen.every(Boolean)) {
    throw new Error("Crumb substitution card did not expand.");
  }

  await page.evaluate(() => localStorage.setItem("drTroyKillerBurgers:v1", JSON.stringify({
    language: "en",
    scaleMode: "full",
    customMode: "beef",
    customBeefLb: 5,
    customPatties: 36,
    printMode: "en"
  })));
  await page.reload({ waitUntil: "networkidle0" });
  await pause(250);
  await page.emulateMediaType("print");
  const pdfPath = path.join(screenshotsDir, "english-full.pdf");
  await page.select("[data-field='print-mode']", "en");
  await pause(250);
  await page.pdf({
    path: pdfPath,
    format: "Letter",
    printBackground: true,
    margin: { top: "0.5in", right: "0.45in", bottom: "0.5in", left: "0.45in" }
  });

  await page.screenshot({
    path: path.join(screenshotsDir, "english-full.png"),
    fullPage: true
  });

  const printText = await page.evaluate(() => document.querySelector("#print-root")?.textContent || "");
  if (!printText.includes("https://drtroyskillerburgers.vercel.app/")) {
    throw new Error("Print view is missing the canonical production URL.");
  }
  if (printText.includes("localhost") || printText.includes("127.0.0.1")) {
    throw new Error("Print view must never include local preview URLs.");
  }
  for (const expected of [
    "Doctor Troy’s Killer Burger Patties",
    "Full recipe makes",
    "Ingredients",
    "Instructions",
    "Substitutions",
    "Choose ONE chile option",
    "Alternative 1",
    "Alternative 2",
    "Crumb options",
    "Montreal-style seasoning substitute"
  ]) {
    if (!printText.includes(expected)) {
      throw new Error(`Print view is missing expected content: ${expected}`);
    }
  }

  const printLayout = await page.evaluate(() => {
    const article = document.querySelector(".print-recipe");
    const header = document.querySelector(".template-print-header");
    const image = document.querySelector(".template-print-header img");
    const columns = document.querySelector(".template-print-columns");
    const substitution = document.querySelector(".template-substitutions");
    return {
      articleCount: document.querySelectorAll(".print-recipe").length,
      headerHeight: header?.getBoundingClientRect().height || 0,
      imageLoaded: Boolean(image && image.complete && image.naturalWidth > 0),
      imageObjectFit: image ? getComputedStyle(image).objectFit : "",
      imageRenderedWidth: image?.getBoundingClientRect().width || 0,
      imageRenderedHeight: image?.getBoundingClientRect().height || 0,
      imageNaturalRatio: image && image.naturalWidth ? image.naturalHeight / image.naturalWidth : 0,
      columns: columns ? getComputedStyle(columns).gridTemplateColumns : "",
      substitutionColumn: substitution?.closest(".template-print-column") === document.querySelector(".template-print-column"),
      articleHeight: article?.getBoundingClientRect().height || 0,
      pageHeight: 11 * 96
    };
  });
  if (printLayout.articleCount !== 1) throw new Error("English full-batch print should be one page.");
  if (!printLayout.imageLoaded || printLayout.imageObjectFit !== "contain") {
    throw new Error("Print header image is missing or configured to crop.");
  }
  if (Math.abs(printLayout.imageRenderedHeight / printLayout.imageRenderedWidth - printLayout.imageNaturalRatio) > 0.01) {
    throw new Error("Print header image is not rendered at its full aspect ratio.");
  }
  if (!printLayout.columns || !printLayout.substitutionColumn) {
    throw new Error("Print columns or left-column substitutions are incorrect.");
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
