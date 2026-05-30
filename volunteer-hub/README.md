# volunteer-hub

Single-page static site listing 12 vetted volunteer opportunities for a solo 15-year-old in Buncombe County, NC (Arden reference point). Three views (cards, Leaflet map, comparison table), warm mountain palette, light/dark mode.

Deployed (Perplexity Computer): https://www.perplexity.ai/computer/a/where-you-can-help-rsTkUfrWQnSiJW7vxjpXsg

## Files
- `index.html` — page shell, hero with three-status legend, view switcher, filter chips, detail drawer.
- `styles.css` — design tokens (cream / forest / terracotta), solo-status badges, drawer, table, map list.
- `app.js` — renders cards / map / table views, drawer, Leaflet map with custom numbered pins, theme toggle.
- `data.js` — the 12 opportunities with `soloStatus` (`verified` / `verify` / `posted-16`) and `soloNote` rationale per entry.

## Solo-status classification
- **Verified solo (6)**: Mission Junior Vol, Buncombe Teen Court, YMCA Leaders Club, WNC Young Curator, NC Arboretum EXPLOREcorps, RANT and RAVE.
- **Call to verify (5)**: Skyland Library, Children First/CIS, GreenWorks, WNC Young Naturalist, Hands On Asheville portal.
- **Posted 16+ (1)**: America Cares Arden warehouse — ask if a waiver is possible.

## Tech
Vanilla HTML/CSS/JS. Leaflet 1.9.4 via CDN. Fraunces + Inter via Google Fonts. No build step. Open `index.html` directly or serve the folder.
