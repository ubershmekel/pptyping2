# PPTyping — Quick Start

## Run the game

```bash
npm install
npm run dev
```

Then open http://localhost:5173 in your browser.

## What's built (MVP)

- **Team Select** — full-screen split with CSS/SVG Pikachu and Pinkie Pie
- **Cutscene** — narrative story screen with CSS art and particle effects
- **Level 1** — speed test (two full-keyboard sentences, establishes WPM baseline)
- **Level 2** — f + j homerow drill
- **Cutscene 2** — arc 1 closing scene
- **Level Complete** — stats display with WPM/accuracy bars, pass/fail, difficulty switcher
- All 14 level definitions stubbed in (content ready to play through)
- localStorage save/load with JSON export/import hooks

## Extending to full game

All 14 levels have text in `src/data/wordLists.ts` and story blurbs in `src/data/stories.ts`.
The navigation logic in `src/data/levels.ts` handles all arc transitions automatically.
Just add real art assets to `public/art/` and update the `artClass` fields in `stories.ts`.

## File structure

```
src/
  types.ts            — all TypeScript types
  app.ts              — screen router (team → cutscene → level → complete)
  main.ts             — entry point
  data/
    levels.ts         — 14 level definitions + navigation logic
    stories.ts        — all story text (Pokemon + MLP, 6 cutscenes each)
    wordLists.ts      — typing text per level
  state/
    gameState.ts      — localStorage profile management
  components/
    character.ts      — CSS/SVG Pikachu & Pinkie Pie + walking animation
  screens/
    teamSelect.ts     — team selection UI
    cutscene.ts       — cutscene display with art reveal
    levelScreen.ts    — typing engine + character companion + live stats
    levelComplete.ts  — stats + difficulty switcher
  styles/
    main.css          — all visual design (themes, animations, environments)
```
