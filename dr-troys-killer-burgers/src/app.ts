import {
  CANONICAL_URL,
  COPY,
  type ChileOption,
  type CustomMode,
  type IngredientSection,
  type Language,
  type PrintMode,
  type ScaleMode,
  calculateScaleFactor,
  formatScaleLabel,
  formatYield,
  getScaledIngredientSections,
  getSeasoningSubstitute
} from "./recipe-data.js";

interface AppState {
  language: Language;
  scaleMode: ScaleMode;
  customMode: CustomMode;
  customBeefLb: number;
  customPatties: number;
  chile: ChileOption;
  printMode: PrintMode;
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

const STORAGE_KEY = "drTroyKillerBurgers:v1";

const DEFAULT_STATE: AppState = {
  language: "en",
  scaleMode: "full",
  customMode: "beef",
  customBeefLb: 5,
  customPatties: 36,
  chile: "canned",
  printMode: "en"
};

const UI_COPY = {
  en: {
    languageLabel: "Language",
    scaleLabel: "Scale",
    customByLabel: "Custom by",
    chileLabel: "Chile",
    printLabel: "Print",
    printButton: "Print / PDF",
    installText: "Install this recipe app for offline use.",
    installButton: "Install app",
    dismissButton: "Dismiss",
    summaryScaleLabel: "Scale",
    summaryYieldLabel: "Yield",
    summaryChileLabel: "Chile",
    scaleButtons: {
      full: "Full",
      half: "1/2",
      quarter: "1/4",
      custom: "Custom"
    },
    customModes: {
      beef: "Ground beef",
      patties: "Patties"
    },
    chileOptions: {
      canned: "Canned mild green chiles",
      fresh: "Fresh mild green peppers",
      jalapeno: "Jalapeño, smaller amount"
    },
    printModes: {
      en: "English",
      es: "Español",
      both: "Both"
    }
  },
  es: {
    languageLabel: "Idioma",
    scaleLabel: "Escala",
    customByLabel: "Personalizar por",
    chileLabel: "Chile",
    printLabel: "Imprimir",
    printButton: "Imprimir / PDF",
    installText: "Instale esta receta para usarla sin conexión.",
    installButton: "Instalar app",
    dismissButton: "Cerrar",
    summaryScaleLabel: "Escala",
    summaryYieldLabel: "Rendimiento",
    summaryChileLabel: "Chile",
    scaleButtons: {
      full: "Completa",
      half: "1/2",
      quarter: "1/4",
      custom: "Personal"
    },
    customModes: {
      beef: "Carne molida",
      patties: "Tortas"
    },
    chileOptions: {
      canned: "Chile verde suave enlatado",
      fresh: "Pimientos verdes suaves frescos",
      jalapeno: "Jalapeño, cantidad menor"
    },
    printModes: {
      en: "Inglés",
      es: "Español",
      both: "Ambos"
    }
  }
} as const;

const state: AppState = loadState();
let deferredInstallPrompt: BeforeInstallPromptEvent | null = null;

const elements = {
  title: required<HTMLHeadingElement>("#hero-title"),
  subtitle: required<HTMLElement>("#hero-subtitle"),
  kicker: required<HTMLElement>("#hero-kicker"),
  langButtons: Array.from(document.querySelectorAll<HTMLButtonElement>("[data-lang]")),
  scaleButtons: Array.from(document.querySelectorAll<HTMLButtonElement>("[data-scale]")),
  customControls: required<HTMLElement>("#custom-controls"),
  customMode: required<HTMLSelectElement>("[data-field='custom-mode']"),
  customValue: required<HTMLInputElement>("[data-field='custom-value']"),
  customUnit: required<HTMLElement>("#custom-unit"),
  chile: required<HTMLSelectElement>("[data-field='chile']"),
  printMode: required<HTMLSelectElement>("[data-field='print-mode']"),
  printButton: required<HTMLButtonElement>("#print-button"),
  ingredientsHeading: required<HTMLHeadingElement>("#ingredients-heading"),
  instructionsHeading: required<HTMLHeadingElement>("#instructions-heading"),
  doubleNote: required<HTMLElement>("#double-note"),
  summaryScale: required<HTMLElement>("[data-summary-scale]"),
  summaryYield: required<HTMLElement>("[data-summary-yield]"),
  summaryChile: required<HTMLElement>("[data-summary-chile]"),
  ingredients: required<HTMLElement>("#ingredients-root"),
  instructions: required<HTMLElement>("#instructions-root"),
  substitutions: required<HTMLElement>("#substitutions-root"),
  printRoot: required<HTMLElement>("#print-root"),
  installBanner: required<HTMLElement>("#install-banner"),
  installButton: required<HTMLButtonElement>("#install-button"),
  dismissInstall: required<HTMLButtonElement>("#dismiss-install"),
  uiText: Array.from(document.querySelectorAll<HTMLElement>("[data-ui]"))
};

function required<T extends Element>(selector: string): T {
  const element = document.querySelector<T>(selector);
  if (!element) throw new Error(`Missing element: ${selector}`);
  return element;
}

function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_STATE };
    const parsed = JSON.parse(raw) as Partial<AppState>;
    return {
      ...DEFAULT_STATE,
      ...parsed,
      customBeefLb: positiveNumber(parsed.customBeefLb, DEFAULT_STATE.customBeefLb),
      customPatties: positiveNumber(parsed.customPatties, DEFAULT_STATE.customPatties)
    };
  } catch {
    return { ...DEFAULT_STATE };
  }
}

function positiveNumber(value: unknown, fallback: number) {
  return typeof value === "number" && Number.isFinite(value) && value > 0 ? value : fallback;
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function currentCustomValue() {
  return state.customMode === "beef" ? state.customBeefLb : state.customPatties;
}

function currentScaleFactor() {
  return calculateScaleFactor({
    scaleMode: state.scaleMode,
    customMode: state.customMode,
    customValue: currentCustomValue()
  });
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function renderIngredientSections(sections: IngredientSection[]) {
  return sections
    .map(
      (section) => `
        <section class="recipe-section" aria-labelledby="${section.id}-heading">
          <h3 id="${section.id}-heading">${escapeHtml(section.title)}</h3>
          <ul class="ingredient-list">
            ${section.lines
              .map(
                (line) => `
                  <li>
                    <span class="amount">${escapeHtml(line.amount)}</span>
                    <span class="ingredient-name">${escapeHtml(line.name)}</span>
                    ${line.note ? `<span class="ingredient-note">${escapeHtml(line.note)}</span>` : ""}
                  </li>`
              )
              .join("")}
          </ul>
        </section>`
    )
    .join("");
}

function renderInstructions(language: Language) {
  return COPY[language].instructions
    .map(
      (step) => `
        <section class="recipe-section">
          <h3>${escapeHtml(step.title)}</h3>
          ${step.paragraphs.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("")}
        </section>`
    )
    .join("");
}

function renderSubstitutions(language: Language, scaleFactor: number) {
  const copy = COPY[language];
  return `
    <details>
      <summary>
        <span>${escapeHtml(copy.substitutionHeading)}</span>
        <small>${escapeHtml(copy.substitutionSummary)}</small>
      </summary>
      <div class="substitution-grid">
        <section>
          <h3>${escapeHtml(copy.crumbsTitle)}</h3>
          <ul class="plain-list">
            ${copy.crumbOptions.map((option) => `<li>${escapeHtml(option)}</li>`).join("")}
          </ul>
        </section>
        <section>
          <h3>${escapeHtml(copy.seasoningSubstituteTitle)}</h3>
          <ul class="ingredient-list compact">
            ${getSeasoningSubstitute(language, scaleFactor)
              .map(
                (line) => `
                  <li>
                    <span class="amount">${escapeHtml(line.amount)}</span>
                    <span class="ingredient-name">${escapeHtml(line.name)}</span>
                  </li>`
              )
              .join("")}
          </ul>
        </section>
      </div>
    </details>`;
}

function renderPrintRecipe(language: Language, scaleFactor: number) {
  const copy = COPY[language];
  const sections = getScaledIngredientSections(language, scaleFactor, state.chile);
  return `
    <article class="print-recipe" lang="${language}">
      <header class="print-header">
        <div>
          <p class="print-kicker">${escapeHtml(copy.kicker)}</p>
          <h1>${escapeHtml(copy.title)}</h1>
          <p>${escapeHtml(copy.subtitle)}</p>
        </div>
        <div class="print-qr">
          <img src="assets/qr-canonical.svg" width="76" height="76" alt="QR code for Dr. Troy's Killer Burgers">
          <span>${CANONICAL_URL}</span>
        </div>
      </header>
      <div class="print-meta">
        <span><strong>${escapeHtml(copy.scaleSummary)}:</strong> ${escapeHtml(formatScaleLabel(scaleFactor, language))}</span>
        <span><strong>${escapeHtml(copy.yieldLead)}:</strong> ${escapeHtml(formatYield(language, scaleFactor))}</span>
        <span><strong>${escapeHtml(copy.selectedChile)}:</strong> ${escapeHtml(copy.chileChoice[state.chile])}</span>
      </div>
      <p class="print-note">${escapeHtml(copy.doubleBurgerNote)}</p>
      <h2>${escapeHtml(copy.ingredientHeading)}</h2>
      ${renderIngredientSections(sections)}
      <h2>${escapeHtml(copy.instructionHeading)}</h2>
      ${renderInstructions(language)}
      <h2>${escapeHtml(copy.substitutionHeading)}</h2>
      ${renderIngredientSections([
        {
          id: `print-seasoning-${language}`,
          title: copy.seasoningSubstituteTitle,
          lines: getSeasoningSubstitute(language, scaleFactor)
        }
      ])}
    </article>`;
}

function renderPrintRoot(scaleFactor: number) {
  const languages: Language[] =
    state.printMode === "both" ? ["en", "es"] : [state.printMode];
  elements.printRoot.innerHTML = languages
    .map((language) => renderPrintRecipe(language, scaleFactor))
    .join("");
}

function render() {
  const copy = COPY[state.language];
  const ui = UI_COPY[state.language];
  const scaleFactor = currentScaleFactor();
  const sections = getScaledIngredientSections(state.language, scaleFactor, state.chile);

  document.documentElement.lang = state.language;
  document.title = copy.title;
  elements.title.textContent = copy.title;
  elements.subtitle.textContent = copy.subtitle;
  elements.kicker.textContent = copy.kicker;
  elements.ingredientsHeading.textContent = copy.ingredientHeading;
  elements.instructionsHeading.textContent = copy.instructionHeading;
  elements.doubleNote.textContent = copy.doubleBurgerNote;

  for (const element of elements.uiText) {
    const key = element.dataset.ui as keyof typeof ui;
    const value = ui[key];
    if (typeof value === "string") {
      element.textContent = value;
    }
  }

  for (const button of elements.langButtons) {
    const isActive = button.dataset.lang === state.language;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  }

  for (const button of elements.scaleButtons) {
    const isActive = button.dataset.scale === state.scaleMode;
    const scaleKey = button.dataset.scale as ScaleMode;
    button.textContent = ui.scaleButtons[scaleKey];
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  }

  elements.customControls.hidden = state.scaleMode !== "custom";
  for (const option of Array.from(elements.customMode.options)) {
    const optionKey = option.value as CustomMode;
    option.textContent = ui.customModes[optionKey];
  }
  for (const option of Array.from(elements.chile.options)) {
    const optionKey = option.value as ChileOption;
    option.textContent = ui.chileOptions[optionKey];
  }
  for (const option of Array.from(elements.printMode.options)) {
    const optionKey = option.value as PrintMode;
    option.textContent = ui.printModes[optionKey];
  }
  elements.customMode.value = state.customMode;
  elements.customValue.value = String(currentCustomValue());
  elements.customValue.min = state.customMode === "beef" ? "0.25" : "1";
  elements.customValue.step = state.customMode === "beef" ? "0.25" : "1";
  elements.customUnit.textContent =
    state.customMode === "beef"
      ? state.language === "en" ? "lb ground beef" : "lb de carne molida"
      : state.language === "en" ? "1/4 lb patties" : "tortas de 1/4 lb";

  elements.chile.value = state.chile;
  elements.printMode.value = state.printMode;
  elements.summaryScale.textContent = formatScaleLabel(scaleFactor, state.language);
  elements.summaryYield.textContent = formatYield(state.language, scaleFactor);
  elements.summaryChile.textContent = copy.chileChoice[state.chile];
  elements.ingredients.innerHTML = renderIngredientSections(sections);
  elements.instructions.innerHTML = renderInstructions(state.language);
  elements.substitutions.innerHTML = renderSubstitutions(state.language, scaleFactor);
  renderPrintRoot(scaleFactor);
}

for (const button of elements.langButtons) {
  button.addEventListener("click", () => {
    state.language = button.dataset.lang as Language;
    state.printMode = state.language;
    saveState();
    render();
  });
}

for (const button of elements.scaleButtons) {
  button.addEventListener("click", () => {
    state.scaleMode = button.dataset.scale as ScaleMode;
    saveState();
    render();
  });
}

elements.customMode.addEventListener("change", () => {
  state.customMode = elements.customMode.value as CustomMode;
  saveState();
  render();
});

elements.customValue.addEventListener("input", () => {
  const nextValue = Number(elements.customValue.value);
  if (!Number.isFinite(nextValue) || nextValue <= 0) return;
  if (state.customMode === "beef") {
    state.customBeefLb = nextValue;
  } else {
    state.customPatties = nextValue;
  }
  saveState();
  render();
});

elements.chile.addEventListener("change", () => {
  state.chile = elements.chile.value as ChileOption;
  saveState();
  render();
});

elements.printMode.addEventListener("change", () => {
  state.printMode = elements.printMode.value as PrintMode;
  saveState();
  render();
});

elements.printButton.addEventListener("click", () => {
  renderPrintRoot(currentScaleFactor());
  window.print();
});

function isStandalone() {
  return window.matchMedia("(display-mode: standalone)").matches || Boolean((navigator as Navigator & { standalone?: boolean }).standalone);
}

function hideInstallBanner() {
  elements.installBanner.hidden = true;
}

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js", { scope: "./" }).catch((error: unknown) => {
      console.warn("Service worker registration failed.", error);
    });
  });
}

window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  deferredInstallPrompt = event as BeforeInstallPromptEvent;
  if (!isStandalone()) {
    elements.installBanner.hidden = false;
  }
});

window.addEventListener("appinstalled", () => {
  deferredInstallPrompt = null;
  hideInstallBanner();
});

elements.installButton.addEventListener("click", async () => {
  if (!deferredInstallPrompt) return;
  await deferredInstallPrompt.prompt();
  await deferredInstallPrompt.userChoice;
  deferredInstallPrompt = null;
  hideInstallBanner();
});

elements.dismissInstall.addEventListener("click", hideInstallBanner);

if (isStandalone()) {
  hideInstallBanner();
}

render();
