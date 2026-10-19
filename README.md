# LAST STATION: EARTH

**آخرین ایستگاه زمین** — a cinematic browser-game intro for Oqthera.

A dark, atmospheric opening sequence set in 2089, after the collapse of civilization. The player awakens as the last energy engineer, hears from ARIA, and begins to question the story behind the world's silence.

## Current scope

- Animated Three.js environment with a ruined skyline, broken transmission tower, drifting ash, fog, and atmospheric lighting
- Cinematic title screen and responsive layout
- Persian story intro presented in four chapters
- ARIA transmission panel and interactive intro controls
- No gameplay systems yet; this repository currently contains the intro experience only

## Run locally

Because the page uses JavaScript modules, serve it over HTTP instead of opening `index.html` directly.

```bash
python -m http.server 8080
```

Then open http://localhost:8080.

Three.js is loaded from jsDelivr, and fonts are loaded from Google Fonts, so an internet connection is needed.

## GitHub Pages

In the repository settings, open **Pages**, select **Deploy from a branch**, choose `main` and `/(root)`, then save.

## Project

- Repository: https://github.com/Japharzadeh/Oqthera
- Title: LAST STATION: EARTH
- Tagline: Civilization did not end. It went dark.


## Cinematic narration

The intro includes timed English narration for its four story chapters, plus a separate ARIA voice for transmissions. The on-screen story text remains visible as subtitles. Players can pause/resume, replay, skip the current voice playback, and adjust volume.

Voice playback uses the browser's built-in Speech Synthesis API, so available voices and how closely they match the intended low cinematic narrator / distinct ARIA voice depend on the user's browser and operating system. Speech starts after an interaction with the page, and narration requires a browser that supports Speech Synthesis.
