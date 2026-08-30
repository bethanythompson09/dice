# Dice Roller

An offline-first PWA for rolling 1–6 six-sided dice, each with its own color. Built as a
foundation for custom dice faces later.

## Install on your Android phone (e.g. Pixel 7)

1. Open the hosted URL in Chrome (see "Hosting" below for the link once GitHub Pages is enabled).
2. Tap the Chrome menu (⋮) → **Add to Home screen** → **Install**.
3. Launch it from your home screen icon like any other app. After the first visit, it works
   with no internet connection — a service worker caches the app.

## Local development

No build step. Any static file server works:

```bash
python3 -m http.server 8123
```

Then open `http://localhost:8123`.

## Hosting on GitHub Pages

1. Push this repo to GitHub.
2. In the repo settings, go to **Pages** → set **Source** to the `main` branch, root folder.
3. GitHub will publish it at `https://bethanythompson09.github.io/dice/`.

## Project structure

- `index.html` — markup and dice tray
- `styles.css` — dark theme, layout, tumble animation
- `app.js` — dice state, SVG pip rendering, color swatches, roll logic
- `manifest.json` — PWA metadata (name, icon, theme)
- `service-worker.js` — offline caching
- `icons/icon.svg` — app icon

## Roadmap

- Custom dice faces (SVG-based, user-defined)
