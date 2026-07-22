import assert from "node:assert/strict";
import {
  BASE_RECIPE,
  calculateScaleFactor,
  getScaledIngredientSections,
  getScaledYield
} from "../dist/recipe-data.js";

const full = { scaleMode: "full", customMode: "beef", customValue: 5 };
const half = { scaleMode: "half", customMode: "beef", customValue: 5 };
const quarter = { scaleMode: "quarter", customMode: "beef", customValue: 5 };
const customBeef = { scaleMode: "custom", customMode: "beef", customValue: 2.5 };
const customPatties = { scaleMode: "custom", customMode: "patties", customValue: 18 };

assert.equal(calculateScaleFactor(full), 1);
assert.equal(calculateScaleFactor(half), 0.5);
assert.equal(calculateScaleFactor(quarter), 0.25);
assert.equal(calculateScaleFactor(customBeef), 0.5);
assert.equal(calculateScaleFactor(customPatties), 0.5);

assert.deepEqual(getScaledYield(1), {
  patties: [34, 38],
  burgers: [17, 19]
});
assert.deepEqual(getScaledYield(0.5), {
  patties: [17, 19],
  burgers: [9, 10]
});

const sections = getScaledIngredientSections("en", 0.5, "canned");
const meatSection = sections.find((section) => section.id === "meat");
assert.ok(meatSection, "Missing meat section.");
assert.ok(
  meatSection.lines.some((line) => line.amount.includes("2 1/2 lb") && line.amount.includes("1.14 kg")),
  "Half batch should show 2 1/2 lb / 1.14 kg ground beef."
);

const chileSection = sections.find((section) => section.id === "chiles");
assert.ok(chileSection, "Missing chile section.");
assert.equal(chileSection.lines.length, 1, "Only the selected chile option should be listed.");
assert.ok(chileSection.lines[0].amount.includes("1 small 4 oz"), "Half batch canned chiles should be one can.");

assert.equal(BASE_RECIPE.basePattiesMidpoint, 36);

console.log("Scaling calculation checks passed.");
