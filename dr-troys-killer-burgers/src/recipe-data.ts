export const CANONICAL_URL = "https://drtroyskillerburgers.vercel.app/";

export type Language = "en" | "es";
export type ScaleMode = "full" | "half" | "quarter" | "custom";
export type CustomMode = "beef" | "patties";
export type ChileOption = "canned" | "fresh" | "jalapeno";
export type PrintMode = Language | "both";

export interface ScaleRequest {
  scaleMode: ScaleMode;
  customMode: CustomMode;
  customValue: number;
}

export interface IngredientLine {
  amount: string;
  name: string;
  note?: string;
}

export interface IngredientSection {
  id: string;
  title: string;
  lines: IngredientLine[];
}

export interface RecipeCopy {
  title: string;
  kicker: string;
  subtitle: string;
  yieldLead: string;
  ingredientHeading: string;
  instructionHeading: string;
  substitutionHeading: string;
  substitutionSummary: string;
  seasoningSubstituteTitle: string;
  crumbsTitle: string;
  chileChoice: Record<ChileOption, string>;
  doubleBurgerNote: string;
  scaleSummary: string;
  selectedChile: string;
  instructions: { title: string; paragraphs: string[] }[];
  crumbOptions: string[];
}

export const BASE_RECIPE = {
  beefLb: 5,
  beefKg: 2.27,
  basePattiesMidpoint: 36,
  yieldPatties: [34, 38] as const,
  yieldBurgers: [17, 19] as const
};

export const COPY: Record<Language, RecipeCopy> = {
  en: {
    title: "Dr. Troy's Killer Burger Patties",
    kicker: "Large-batch recipe | U.S. and metric measurements",
    subtitle: "Rich, bacon-loaded patties cooked thin over high heat and served as double burgers.",
    yieldLead: "Estimated yield",
    ingredientHeading: "Ingredients",
    instructionHeading: "Instructions",
    substitutionHeading: "Substitutions",
    substitutionSummary: "Crumbs and Montreal-style seasoning alternatives",
    seasoningSubstituteTitle: "Montreal-style seasoning substitute",
    crumbsTitle: "Crumb options",
    chileChoice: {
      canned: "Mild canned green chiles",
      fresh: "Fresh mild green peppers",
      jalapeno: "Smaller jalapeño option"
    },
    doubleBurgerNote: "Two thin patties per burger are recommended.",
    scaleSummary: "Scale",
    selectedChile: "Chile choice",
    instructions: [
      {
        title: "1. Cook the bacon",
        paragraphs: [
          "Cut the bacon crosswise into approximately 1/2-inch / 1.25 cm pieces.",
          "Cook over medium heat until done but not quite crisp. Set the bacon aside to cool.",
          "Pour off the bacon fat and save enough to cook the onions and garlic."
        ]
      },
      {
        title: "2. Cook the onions and garlic",
        paragraphs: [
          "Cook the onions in the reserved bacon fat over medium heat until soft and translucent.",
          "Add the garlic during the final 1-2 minutes, stirring frequently. Remove from the heat and allow the mixture to cool."
        ]
      },
      {
        title: "3. Mix the patties",
        paragraphs: [
          "In a very large container, combine the ground beef, cooled bacon, cooled onions and garlic, selected chile option, eggs, Worcestershire sauce, and Montreal-style seasoning. Mix gently until evenly combined.",
          "Add the first portion of crumbs. Continue adding crumbs gradually only until the mixture is moist, slightly tacky, and firm enough to hold its shape without becoming dry or bread-heavy."
        ]
      },
      {
        title: "4. Form the patties",
        paragraphs: [
          "Divide the mixture into 1/4-pound / 113 g portions and form thin patties slightly wider than the buns. Keep cold until ready to cook."
        ]
      },
      {
        title: "5. Cook",
        paragraphs: [
          "Preheat a flat grill surface, griddle, or heavy skillet over high heat.",
          "Cook until deeply browned on the first side, then flip and brown the second side until done. Avoid repeatedly pressing down on the patties.",
          "Use two patties per bun for a double burger.",
          "Cheddar works especially well, but use any cheese, sauces, and toppings you prefer."
        ]
      }
    ],
    crumbOptions: [
      "plain dry breadcrumbs",
      "dried bread, finely crumbled or processed",
      "plain crackers, such as saltines",
      "buttery crackers, such as Ritz"
    ]
  },
  es: {
    title: "Hamburguesas Asesinas del Dr. Troy",
    kicker: "Receta grande | Medidas estadounidenses y métricas",
    subtitle: "Tortas con bastante tocino para cocinarse delgadas a fuego alto y servirse como hamburguesas dobles.",
    yieldLead: "Rendimiento aproximado",
    ingredientHeading: "Ingredientes",
    instructionHeading: "Preparación",
    substitutionHeading: "Sustituciones",
    substitutionSummary: "Opciones para las migas y el sazonador estilo Montreal",
    seasoningSubstituteTitle: "Sustituto para el sazonador estilo Montreal",
    crumbsTitle: "Opciones para las migas",
    chileChoice: {
      canned: "Chile verde suave enlatado",
      fresh: "Pimientos o chiles verdes suaves frescos",
      jalapeno: "Opción más pequeña con jalapeño"
    },
    doubleBurgerNote: "Se recomiendan dos tortas delgadas por hamburguesa.",
    scaleSummary: "Escala",
    selectedChile: "Opción de chile",
    instructions: [
      {
        title: "1. Cocinar el tocino",
        paragraphs: [
          "Corte el tocino transversalmente en pedazos de aproximadamente 1/2 pulgada / 1.25 cm.",
          "Cocínelo a fuego medio hasta que esté listo, pero no completamente crujiente. Déjelo a un lado para que se enfríe.",
          "Vierta la grasa del tocino y reserve suficiente para cocinar la cebolla y el ajo."
        ]
      },
      {
        title: "2. Cocinar la cebolla y el ajo",
        paragraphs: [
          "Cocine la cebolla en la grasa de tocino reservada a fuego medio hasta que esté blanda y translúcida.",
          "Agregue el ajo durante los últimos 1-2 minutos, revolviendo con frecuencia. Retire del fuego y deje enfriar."
        ]
      },
      {
        title: "3. Mezclar las tortas",
        paragraphs: [
          "En un recipiente muy grande, combine la carne molida, el tocino frío, la cebolla y el ajo fríos, la opción de chile elegida, los huevos, la salsa inglesa y el sazonador estilo Montreal. Mezcle suavemente hasta distribuir todo de manera uniforme.",
          "Agregue primero la porción inicial de migas. Continúe agregando más, poco a poco, solamente hasta que la mezcla quede húmeda, ligeramente pegajosa y lo suficientemente firme para mantener su forma, sin quedar seca ni con demasiado pan."
        ]
      },
      {
        title: "4. Formar las tortas",
        paragraphs: [
          "Divida la mezcla en porciones de 1/4 lb / 113 g y forme tortas delgadas, un poco más anchas que los panes. Manténgalas frías hasta el momento de cocinarlas."
        ]
      },
      {
        title: "5. Cocinar",
        paragraphs: [
          "Precaliente una plancha, parrilla plana o sartén pesada a fuego alto.",
          "Cocine hasta dorar bien el primer lado. Voltee y dore el segundo lado hasta que estén listas. Evite presionarlas repetidamente mientras se cocinan.",
          "Use dos tortas por pan para preparar una hamburguesa doble.",
          "El queso cheddar combina especialmente bien, pero puede usar cualquier queso, salsa o acompañamiento que prefiera."
        ]
      }
    ],
    crumbOptions: [
      "pan molido seco sin sazonar",
      "pan seco finamente desmenuzado o procesado",
      "galletas saladas, como saltines",
      "galletas con mantequilla, como Ritz"
    ]
  }
};

const UNIT_COPY = {
  en: {
    about: "about",
    medium: "medium",
    cans: "small 4 oz / 113 g cans",
    can: "small 4 oz / 113 g can",
    cup: "cup",
    cups: "cups",
    tablespoon: "tablespoon",
    tablespoons: "tablespoons",
    teaspoon: "teaspoon",
    teaspoons: "teaspoons",
    egg: "large egg",
    eggs: "large eggs",
    clove: "clove",
    cloves: "cloves",
    total: "total"
  },
  es: {
    about: "aprox.",
    medium: "mediana",
    cans: "latas pequeñas de 4 oz / 113 g",
    can: "lata pequeña de 4 oz / 113 g",
    cup: "taza",
    cups: "tazas",
    tablespoon: "cucharada",
    tablespoons: "cucharadas",
    teaspoon: "cucharadita",
    teaspoons: "cucharaditas",
    egg: "huevo grande",
    eggs: "huevos grandes",
    clove: "diente",
    cloves: "dientes",
    total: "total"
  }
} as const;

const FRACTIONS = [
  { value: 0, label: "" },
  { value: 1 / 8, label: "1/8" },
  { value: 1 / 6, label: "1/6" },
  { value: 1 / 4, label: "1/4" },
  { value: 1 / 3, label: "1/3" },
  { value: 1 / 2, label: "1/2" },
  { value: 2 / 3, label: "2/3" },
  { value: 3 / 4, label: "3/4" },
  { value: 7 / 8, label: "7/8" },
  { value: 1, label: "" }
];

function roundTo(value: number, step: number) {
  return Math.round(value / step) * step;
}

function trimDecimal(value: number, digits = 2) {
  const fixed = value.toFixed(digits);
  return fixed.replace(/\.0+$/, "").replace(/(\.\d*?)0+$/, "$1");
}

export function formatMixedNumber(value: number) {
  if (!Number.isFinite(value) || value <= 0) return "0";
  const whole = Math.floor(value);
  const fractional = value - whole;
  let best = FRACTIONS[0];
  let bestDelta = Number.POSITIVE_INFINITY;

  for (const fraction of FRACTIONS) {
    const delta = Math.abs(fractional - fraction.value);
    if (delta < bestDelta) {
      best = fraction;
      bestDelta = delta;
    }
  }

  if (!best) return trimDecimal(value, 2);
  if (best.value === 1) return String(whole + 1);
  if (best.value === 0) return String(whole);
  if (whole === 0) return best.label;
  return `${whole} ${best.label}`;
}

function plural(lang: Language, amount: number, singularKey: keyof typeof UNIT_COPY.en, pluralKey: keyof typeof UNIT_COPY.en) {
  const copy = UNIT_COPY[lang];
  return Math.abs(amount - 1) < 0.01 ? copy[singularKey] : copy[pluralKey];
}

function formatPounds(value: number) {
  return `${formatMixedNumber(roundTo(value, 0.25))} lb`;
}

function formatPoundRange(low: number, high: number) {
  return `${formatPounds(low)}-${formatPounds(high)}`;
}

function formatKg(value: number) {
  return `${trimDecimal(value, 2)} kg`;
}

function formatMetricGrams(value: number) {
  if (value >= 1000) return `${trimDecimal(value / 1000, 2)} kg`;
  const step = value >= 100 ? 5 : 1;
  return `${Math.max(1, Math.round(value / step) * step)} g`;
}

function formatOunces(value: number) {
  return `${formatMixedNumber(roundTo(value, 0.25))} oz`;
}

function formatCups(value: number, lang: Language) {
  if (value < 0.24) {
    return formatTablespoons(value * 16, lang);
  }
  const rounded = roundTo(value, 0.125);
  return `${formatMixedNumber(rounded)} ${plural(lang, rounded, "cup", "cups")}`;
}

function formatTablespoons(value: number, lang: Language) {
  if (value < 1) {
    return formatTeaspoons(value * 3, lang);
  }
  const rounded = roundTo(value, 0.25);
  return `${formatMixedNumber(rounded)} ${plural(lang, rounded, "tablespoon", "tablespoons")}`;
}

function formatTeaspoons(value: number, lang: Language) {
  const rounded = roundTo(value, 0.25);
  return `${formatMixedNumber(rounded)} ${plural(lang, rounded, "teaspoon", "teaspoons")}`;
}

function formatMl(value: number) {
  return `${Math.max(5, Math.round(value / 5) * 5)} mL`;
}

function formatCount(value: number, lang: Language, singular: keyof typeof UNIT_COPY.en, pluralKey: keyof typeof UNIT_COPY.en) {
  const rounded = roundTo(value, 0.5);
  return `${formatMixedNumber(rounded)} ${plural(lang, rounded, singular, pluralKey)}`;
}

function formatWholeCount(value: number, lang: Language, singular: keyof typeof UNIT_COPY.en, pluralKey: keyof typeof UNIT_COPY.en) {
  const rounded = Math.max(1, Math.round(value));
  const prefix = Math.abs(value - rounded) > 0.15 ? `${UNIT_COPY[lang].about} ` : "";
  return `${prefix}${rounded} ${plural(lang, rounded, singular, pluralKey)}`;
}

function formatMediumOnions(value: number, lang: Language) {
  const rounded = roundTo(value, 0.5);
  if (lang === "es") {
    return `${formatMixedNumber(rounded)} ${Math.abs(rounded - 1) < 0.01 ? "mediana" : "medianas"}`;
  }
  return `${formatMixedNumber(rounded)} medium`;
}

function formatRange(low: string, high: string) {
  return low === high ? low : `${low}-${high}`;
}

function formatCanCount(value: number, lang: Language) {
  const rounded = roundTo(value, 0.25);
  const unit = Math.abs(rounded - 1) < 0.01 ? UNIT_COPY[lang].can : UNIT_COPY[lang].cans;
  return `${formatMixedNumber(rounded)} ${unit}`;
}

export function calculateScaleFactor(request: ScaleRequest) {
  if (request.scaleMode === "full") return 1;
  if (request.scaleMode === "half") return 0.5;
  if (request.scaleMode === "quarter") return 0.25;

  const value = Number.isFinite(request.customValue) && request.customValue > 0 ? request.customValue : 1;
  if (request.customMode === "patties") {
    return value / BASE_RECIPE.basePattiesMidpoint;
  }
  return value / BASE_RECIPE.beefLb;
}

export function getScaledYield(scaleFactor: number) {
  const patties = BASE_RECIPE.yieldPatties.map((value) => Math.max(1, Math.round(value * scaleFactor))) as [number, number];
  const burgers = BASE_RECIPE.yieldBurgers.map((value) => Math.max(1, Math.round(value * scaleFactor))) as [number, number];
  return { patties, burgers };
}

export function formatYield(lang: Language, scaleFactor: number) {
  const { patties, burgers } = getScaledYield(scaleFactor);
  if (lang === "es") {
    return `${patties[0]}-${patties[1]} tortas de 1/4 lb / 113 g, o ${burgers[0]}-${burgers[1]} hamburguesas dobles`;
  }
  return `${patties[0]}-${patties[1]} patties at 1/4 lb / 113 g each, or ${burgers[0]}-${burgers[1]} double burgers`;
}

export function formatScaleLabel(scaleFactor: number, lang: Language = "en") {
  if (Math.abs(scaleFactor - 1) < 0.01) return lang === "es" ? "Completa" : "Full";
  if (Math.abs(scaleFactor - 0.5) < 0.01) return "1/2";
  if (Math.abs(scaleFactor - 0.25) < 0.01) return "1/4";
  return `${trimDecimal(scaleFactor, 2)}x`;
}

export function getScaledIngredientSections(lang: Language, scaleFactor: number, chile: ChileOption): IngredientSection[] {
  const t = lang === "en"
    ? {
        meat: "Meat and vegetables",
        chiles: "Chiles - choose one",
        binding: "Binding and seasoning",
        groundBeef: "ground beef, preferably 80/20",
        bacon: "bacon",
        onions: "white or yellow onions, finely diced",
        redOnion: "Red onion also works.",
        garlic: "garlic, minced",
        canned: "mild diced green chiles, well drained",
        fresh: "roasted mild green peppers, peeled, seeded, and finely diced",
        jalapeno: "fresh or canned jalapeño, seeded, finely diced, and well drained",
        jalapenoNote: "Use the smaller amount for mild burgers.",
        worcestershire: "Worcestershire sauce or salsa inglesa",
        montreal: "Montreal-style steak seasoning",
        crumbs: "dry bread or cracker crumbs, added gradually"
      }
    : {
        meat: "Carne y vegetales",
        chiles: "Chiles - elija uno",
        binding: "Para unir y sazonar",
        groundBeef: "de carne molida de res, preferiblemente 80/20",
        bacon: "de tocino",
        onions: "cebollas blancas o amarillas, finamente picadas",
        redOnion: "También se puede usar cebolla roja.",
        garlic: "de ajo, picados",
        canned: "de chile verde suave picado, bien escurrido",
        fresh: "de pimientos o chiles verdes suaves asados, pelados, sin semillas y finamente picados",
        jalapeno: "de jalapeño fresco o enlatado, sin semillas, finamente picado y bien escurrido",
        jalapenoNote: "Use la cantidad menor para hamburguesas suaves.",
        worcestershire: "de salsa inglesa",
        montreal: "de sazonador para carne estilo Montreal",
        crumbs: "de migas secas de pan o galleta, agregadas poco a poco"
      };

  const chileLines: IngredientLine[] = [];
  if (chile === "canned") {
    chileLines.push({
      amount: `${formatCanCount(2 * scaleFactor, lang)} (${formatOunces(8 * scaleFactor)} / ${formatMetricGrams(226 * scaleFactor)} ${UNIT_COPY[lang].total})`,
      name: t.canned
    });
  }
  if (chile === "fresh") {
    chileLines.push({
      amount: `${formatCups(1.5 * scaleFactor, lang)} / ${formatMetricGrams(225 * scaleFactor)}`,
      name: t.fresh
    });
  }
  if (chile === "jalapeno") {
    chileLines.push({
      amount: `${formatRange(formatCups(0.25 * scaleFactor, lang), formatCups(0.5 * scaleFactor, lang))} / ${formatMetricGrams(30 * scaleFactor)}-${formatMetricGrams(60 * scaleFactor)}`,
      name: t.jalapeno,
      note: t.jalapenoNote
    });
  }

  return [
    {
      id: "meat",
      title: t.meat,
      lines: [
        {
          amount: `${formatPounds(5 * scaleFactor)} / ${formatKg(2.27 * scaleFactor)}`,
          name: t.groundBeef
        },
        {
          amount: `${formatPoundRange(2 * scaleFactor, 3 * scaleFactor)} / ${formatKg(0.9 * scaleFactor)}-${formatKg(1.36 * scaleFactor)}`,
          name: t.bacon
        },
        {
          amount: formatMediumOnions(2 * scaleFactor, lang),
          name: t.onions,
          note: t.redOnion
        },
        {
          amount: formatWholeCount(8 * scaleFactor, lang, "clove", "cloves"),
          name: t.garlic
        }
      ]
    },
    {
      id: "chiles",
      title: t.chiles,
      lines: chileLines
    },
    {
      id: "binding",
      title: t.binding,
      lines: [
        {
          amount: formatWholeCount(4 * scaleFactor, lang, "egg", "eggs"),
          name: lang === "en" ? "" : ""
        },
        {
          amount: `${formatCups((1 / 3) * scaleFactor, lang)} / ${formatMl(80 * scaleFactor)}`,
          name: t.worcestershire
        },
        {
          amount: `${formatTablespoons(2 * scaleFactor, lang)} / ${formatMetricGrams(18 * scaleFactor)}`,
          name: t.montreal
        },
        {
          amount: `${formatRange(formatCups(1 * scaleFactor, lang), formatCups(2 * scaleFactor, lang))} / ${formatMetricGrams(110 * scaleFactor)}-${formatMetricGrams(220 * scaleFactor)}`,
          name: t.crumbs
        }
      ]
    }
  ];
}

export function getSeasoningSubstitute(lang: Language, scaleFactor: number): IngredientLine[] {
  const labels = lang === "en"
    ? [
        "coarsely ground black pepper",
        "garlic powder",
        "onion powder",
        "paprika",
        "ground coriander, optional",
        "salt"
      ]
    : [
        "de pimienta negra molida gruesa",
        "de ajo en polvo",
        "de cebolla en polvo",
        "de paprika o pimentón",
        "de cilantro molido, opcional",
        "de sal"
      ];

  const tspAmounts = [2, 2, 2, 2, 1, 1];
  return labels.map((label, index) => ({
    amount: formatTeaspoons((tspAmounts[index] ?? 1) * scaleFactor, lang),
    name: label
  }));
}
