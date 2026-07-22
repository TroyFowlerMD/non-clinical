# Dr. Troy's Killer Burgers

Build a compact, bilingual recipe PWA for **Dr. Troy’s Killer Burger Patties**.

## Source files

- `recipe-content.md`: approved English and Spanish recipe copy and base quantities.
- `../docs/pwa-installable-web-app-pattern.md`: canonical PWA requirements. Do not duplicate or replace that shared guidance.

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

## Out of scope

No accounts, backend, analytics, nutrition data, ratings, timers, notifications, freezing instructions, test-patty step, or food-temperature guidance.

## Completion checks

Verify scaling calculations, language persistence, responsive layouts, offline behavior, installability, print output, QR code behavior, lint, type checking, production build, and browser functionality.