# Paddy Focus — Rice Study Timer

A study timer where a pixel-art rice farmer harvests a paddy field as your session counts down.

## Project structure

```
rice-app-build/
├── index.html              Main entry point
├── css/
│   └── style.css           All styles (design tokens, layout, animations)
├── js/
│   ├── data.js              Fallback text content + text-file loader
│   └── app.js               React app logic (timer, field, farmer, dialog)
├── content/
│   ├── farmer_lines.txt     Farmer's harsh motivational lines (one per line)
│   └── rice_facts.txt       Rice/rice-farming facts (one per line)
└── assets/images/
    ├── field_bg.jpg              Pixel-art rice farmland background (open dirt field for sprites)
    ├── rice_cluster.png          Dense rice stalk cluster sprite (transparent)
    ├── rice_bundle.png           Harvested rice bundle icon (transparent)
    ├── farmer_walk_sheet.png     4-frame walk-cycle sprite sheet (transparent, used by CSS animation)
    └── farmer_walk_0-3.png      Individual walk-cycle frames (kept for reference)
```

## How it works

- Pick a study duration on the setup screen — the field grid scales up for longer sessions.
- Rice patches harvest in strict row-by-row order (snake path), each patch shrinking to a stub as it's cut.
- The farmer is rendered as a `div` with the walk-cycle sprite sheet as its `background-image`; a CSS `steps()` animation cycles through the 4 frames continuously while running, and flips direction (`scaleX(-1)`) at the end of each row.
- Once every 30-90 seconds, exactly ONE message appears — either a harsh farmer speech bubble anchored above him, or a rice fact ticker along the bottom. The two types alternate so you never get the same kind twice in a row.
- Harvested rice piles up as bundle icons in the corner, growing as you progress.

## Editing the content

Just edit `content/farmer_lines.txt` or `content/rice_facts.txt` — one line per entry, loaded at runtime via `fetch()`. If fetch fails (e.g. opening via `file://`), the app falls back to the same lists baked into `js/data.js`.

## Running locally

Because the app loads text files and images via `fetch()`/`<img>`, serve it over HTTP rather than opening `index.html` directly with `file://`:

```
python3 -m http.server 8000
```

Then visit `http://localhost:8000`.
