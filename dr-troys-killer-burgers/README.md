# Dr. Troy's Killer Burgers

Build a compact, bilingual recipe PWA for **Dr. Troy’s Killer Burger Patties**.

## Source files

- `recipe-content.md`: approved English and Spanish recipe copy and base quantities.
- `../docs/pwa-installable-web-app-pattern.md`: canonical PWA requirements. Do not duplicate or replace that shared guidance.
- Hero artwork supplied with the Codex task: wide graphite-style grillmaster images with a selectively colored burger.

## Product requirements

- Mobile-first, responsive interface with efficient use of screen space.
- English/Spanish toggle; show one language at a time and persist the choice locally.
- Traditional recipe-card layout for core content, with expandable substitution notes.
- Scaling presets: full, half, quarter, and custom.
- Custom scaling by either ground-beef amount or desired number of ¼ lb / 113 g patties.
- Display U.S. and metric units together with practical kitchen rounding.
- Preserve ingredient ranges when scaling.
- Note that two thin patties per burger are recommended.
- Default chile choice: canned mild green chiles. Also support fresh mild green peppers and a smaller jalapeño option.
- Estimated base yield: about 34–38 quarter-pound patties, or 17–19 double burgers.
- Store language, scale, custom input, and chile selection locally.

## Hero artwork

Use the supplied wide hero image as a prominent but space-efficient header.

- Preserve the image's wide banner composition and left-side negative space.
- Place the recipe title and short subtitle over the open left side, not over the face or burger.
- Keep text readable with a subtle gradient or translucent backing only when needed.
- Preserve the subject and burger on the right; do not stretch or distort the image.
- Use deliberate cropping and object positioning so the face and burger remain visible.
- On desktop, show the full cinematic banner at approximately a 21:9 ratio.
- On phones, use a shallower crop or art-directed mobile crop that keeps the face, burger, and enough title space visible.
- Keep the hero compact enough that scaling controls and recipe content begin near the first viewport.
- Avoid parallax, autoplay animation, or heavy visual effects.
- Optimize the final image into AVIF or WebP with an appropriate fallback.
- Include explicit dimensions or an aspect-ratio container to prevent layout shift.
- Use responsive `srcset`/`sizes` or the framework image component.
- Do not embed title text into the image; render the title and language-aware subtitle as accessible HTML.
- Use concise alt text describing Dr. Troy presenting a double cheeseburger at a grill.
- Do not show the full hero in the main printed recipe. A small monochrome crop may be used in print only if it improves the document without crowding the recipe.

### Burger depicted in the artwork

The visible burger stack must remain, from top to bottom:

1. Top bun
2. Lettuce
3. Tomato
4. Onion
5. Cheese
6. Thin patty
7. Cheese
8. Thin patty
9. Bottom bun

Do not alter the supplied artwork or generate replacement imagery unless specifically requested.

## Print requirements

Provide a dedicated print view that looks like a professionally formatted Word recipe sheet rather than a browser screenshot.

- Print options: English, Spanish, or both.
- Reflect the selected scale and chile option.
- Optimize for U.S. Letter and remain usable on A4.
- Use polished typography, margins, section rules, controlled page breaks, and ink-conscious print CSS.
- Hide all app controls in print.
- Include a locally generated QR code linking to the canonical production URL, with the URL printed below it.
- Never encode localhost or a temporary preview URL.

## Hosting

- Deploy through Vercel.
- Preferred project slug: `drtroyskillerburgers`.
- Preferred production URL: `https://drtroyskillerburgers.vercel.app` if available.
- Keep the canonical URL configurable so metadata and the print QR code use the stable production URL.

## Implementation notes

- Vercel project root should be this folder: `dr-troys-killer-burgers/`.
- Canonical URL is centralized as `https://drtroyskillerburgers.vercel.app/` in the app metadata, print QR code generation, and recipe code.
- Local commands:
  - `npm install`
  - `npm run check`
  - `npm run verify:browser`
  - `npm run serve`
- Generated deployment output is `dist/`; source files and generated app assets are committed outside `dist/`.

## Out of scope

No accounts, backend, analytics, nutrition data, ratings, timers, notifications, freezing instructions, test-patty step, or food-temperature guidance.

## Completion checks

Verify scaling calculations, language persistence, responsive layouts, hero cropping at phone/tablet/desktop widths, offline behavior, installability, print output, QR code behavior, lint, type checking, production build, and browser functionality.
