import {
  CANONICAL_URL,
  COPY,
  calculateScaleFactor,
  formatYield,
  getScaledIngredientSections,
  getSeasoningSubstitute
} from "./recipe-data.js";

const STORAGE_KEY = "drTroyKillerBurgers:v1";
const CHILE_KEYS = ["canned", "fresh", "jalapeno"];
let applying = false;

function readState() {
  const fallback = {
    language: "en",
    scaleMode: "full",
    customMode: "beef",
    customBeefLb: 5,
    customPatties: 36,
    printMode: "en"
  };
  try {
    return { ...fallback, ...JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}") };
  } catch {
    return fallback;
  }
}

function scaleFactor(state) {
  return calculateScaleFactor({
    scaleMode: state.scaleMode,
    customMode: state.customMode,
    customValue: state.customMode === "beef" ? Number(state.customBeefLb) : Number(state.customPatties)
  });
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function amountText(line) {
  return `${line.name} — ${line.amount}${line.note ? `, ${line.note}` : ""}.`;
}

function allSections(language, factor) {
  const base = getScaledIngredientSections(language, factor, "canned");
  const chileLines = CHILE_KEYS.map((key) => {
    const section = getScaledIngredientSections(language, factor, key).find((item) => item.id === "chiles");
    return { key, line: section?.lines?.[0] };
  }).filter((entry) => entry.line);

  return base.map((section) => section.id === "chiles" ? { ...section, chileLines } : section);
}

function crumbDetails(language) {
  const copy = COPY[language];
  return `
    <details class="inline-substitution">
      <summary>${escapeHtml(copy.crumbsTitle)}</summary>
      <div class="substitution-body"><ul>${copy.crumbOptions.map((option) => `<li>${escapeHtml(option)}</li>`).join("")}</ul></div>
    </details>`;
}

function seasoningDetails(language, factor) {
  const copy = COPY[language];
  return `
    <details class="inline-substitution">
      <summary>${escapeHtml(copy.seasoningSubstituteTitle)}</summary>
      <div class="substitution-body"><ul>${getSeasoningSubstitute(language, factor).map((line) => `<li>${escapeHtml(amountText(line))}</li>`).join("")}</ul></div>
    </details>`;
}

function renderScreenIngredients() {
  if (applying) return;
  const root = document.querySelector("#ingredients-root");
  if (!root) return;
  applying = true;

  const state = readState();
  const language = state.language === "es" ? "es" : "en";
  const factor = scaleFactor(state);
  const sections = allSections(language, factor);
  const chooseOne = language === "es"
    ? "Elija UNA de las siguientes opciones de chile; no use las tres."
    : "Choose ONE chile option. Lines labeled as alternatives replace the first option.";
  const alternative = language === "es" ? "Alternativa" : "Alternative";

  root.innerHTML = sections.map((section) => {
    if (section.id === "chiles") {
      const lines = section.chileLines.map((entry, index) => {
        const prefix = index === 0 ? "" : `<strong>${alternative} ${index}:</strong> `;
        return `<li><span class="ingredient-line">${prefix}${escapeHtml(amountText(entry.line))}</span></li>`;
      }).join("");
      return `<section class="recipe-section"><h3>${escapeHtml(section.title)}</h3><p class="chile-choice-note">${escapeHtml(chooseOne)}</p><ul class="ingredient-list template-format">${lines}</ul></section>`;
    }

    const lines = section.lines.map((line) => {
      const lower = line.name.toLowerCase();
      let detail = "";
      if (lower.includes("montreal")) detail = seasoningDetails(language, factor);
      if (lower.includes("crumb") || lower.includes("miga") || lower.includes("pan o galleta")) detail = crumbDetails(language);
      return `<li><span class="ingredient-line">${escapeHtml(amountText(line))}</span>${detail}</li>`;
    }).join("");
    return `<section class="recipe-section"><h3>${escapeHtml(section.title)}</h3><ul class="ingredient-list template-format">${lines}</ul></section>`;
  }).join("");

  applying = false;
}

function renderInstructionSteps(language) {
  return COPY[language].instructions.map((step) => `
    <section class="template-step">
      <h3>${escapeHtml(step.title)}</h3>
      ${step.paragraphs.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("")}
    </section>`).join("");
}

function renderPrintIngredients(language, factor) {
  const sections = allSections(language, factor);
  const chooseOne = language === "es"
    ? "Elija UNA opción de chile. Las líneas marcadas como alternativas sustituyen la primera opción."
    : "Choose ONE chile option. Lines labeled as alternatives replace the first option.";
  const alternative = language === "es" ? "Alternativa" : "Alternative";

  return sections.map((section) => {
    if (section.id === "chiles") {
      const lines = section.chileLines.map((entry, index) => {
        const prefix = index === 0 ? "" : `<strong>${alternative} ${index}:</strong> `;
        return `<li>${prefix}${escapeHtml(amountText(entry.line))}</li>`;
      }).join("");
      return `<section class="template-print-section"><h3>${escapeHtml(section.title)}</h3><div class="template-chile-warning">${escapeHtml(chooseOne)}</div><ul class="template-print-list">${lines}</ul></section>`;
    }
    return `<section class="template-print-section"><h3>${escapeHtml(section.title)}</h3><ul class="template-print-list">${section.lines.map((line) => `<li>${escapeHtml(amountText(line))}</li>`).join("")}</ul></section>`;
  }).join("");
}

function renderPrintSubstitutions(language, factor) {
  const copy = COPY[language];
  return `
    <section class="template-substitutions">
      <h2>${escapeHtml(copy.substitutionHeading)}</h2>
      <section class="template-substitution">
        <h3>${escapeHtml(copy.crumbsTitle)}</h3>
        <ul class="template-print-list">${copy.crumbOptions.map((option) => `<li>${escapeHtml(option)}</li>`).join("")}</ul>
      </section>
      <section class="template-substitution">
        <h3>${escapeHtml(copy.seasoningSubstituteTitle)}</h3>
        <ul class="template-print-list">${getSeasoningSubstitute(language, factor).map((line) => `<li>${escapeHtml(amountText(line))}</li>`).join("")}</ul>
      </section>
    </section>`;
}

function renderPrintRecipe(language, factor) {
  const copy = COPY[language];
  const title = language === "en" ? "Doctor Troy’s Killer Burger Patties" : copy.title;
  const yieldLabel = language === "en" ? "Full recipe makes" : "La receta completa rinde";
  const scanText = language === "en" ? "Scan to view on phone" : "Escanee para ver en el teléfono";

  return `
    <article class="print-recipe" lang="${language}">
      <header class="template-print-header">
        <img src="assets/hero-1280.jpg" width="1280" height="548" alt="Dr. Troy presenting a double cheeseburger at a grill.">
        <h1 class="template-print-title">${escapeHtml(title)}</h1>
        <div class="template-yield-box"><strong>${escapeHtml(yieldLabel)}:</strong> ${escapeHtml(formatYield(language, factor))}</div>
      </header>
      <div class="template-print-columns">
        <section class="template-print-column">
          <h2>${escapeHtml(copy.ingredientHeading)}</h2>
          ${renderPrintIngredients(language, factor)}
          ${renderPrintSubstitutions(language, factor)}
        </section>
        <section class="template-print-column">
          <h2>${escapeHtml(copy.instructionHeading)}</h2>
          ${renderInstructionSteps(language)}
        </section>
      </div>
      <footer class="template-print-footer">
        <img src="assets/qr-canonical.png" width="64" height="64" alt="QR code for the live recipe app">
        <span>${escapeHtml(scanText)}<br>${escapeHtml(CANONICAL_URL)}</span>
      </footer>
    </article>`;
}

function renderPrintRoot() {
  const root = document.querySelector("#print-root");
  if (!root) return;
  const state = readState();
  const factor = scaleFactor(state);
  const languages = state.printMode === "both" ? ["en", "es"] : [state.printMode === "es" ? "es" : "en"];
  root.innerHTML = languages.map((language) => renderPrintRecipe(language, factor)).join("");
}

function refresh() {
  window.setTimeout(() => {
    renderScreenIngredients();
    renderPrintRoot();
  }, 0);
}

document.addEventListener("click", (event) => {
  if (event.target instanceof Element && event.target.closest("details.inline-substitution")) return;
  refresh();
}, true);
document.addEventListener("change", refresh, true);
document.addEventListener("input", refresh, true);
window.addEventListener("beforeprint", renderPrintRoot);

refresh();
