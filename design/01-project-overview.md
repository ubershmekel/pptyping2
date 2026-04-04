# 01 - Project Overview

## Concept

PPTyping is a web-based typing tutor disguised as a branching story game. The
player picks a team - **Pokemon** or **My Little Pony (MLP)** - and progresses
through 14 typing levels that unlock a narrative in 6 arc-separated cutscenes.
The two storylines are completely independent in content and tone:

- **Pokemon arc**: adventure/rescue - Rowlet gets birdnapped by a pony, the team
  must cleanse the corrupted keyboard to save him.
- **MLP arc**: diplomacy/friendship - the ponies attempt to teach Pokemon what
  real friendship looks like.

The universal mechanic: the opposing team has corrupted the keys of the
keyboard. Your characters must restore them, one key at a time.

## Tech Stack Intent

| Tool                       | Why                                                                                                                     |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| **Vite + TypeScript**      | Fast dev loop, strict types across the entire data model, no framework overhead                                         |
| **Node test runner + tsx** | TypeScript-native repo checks and tests without a heavyweight test framework                                            |
| **Vanilla DOM**            | No React/Vue - screens are simple enough that direct DOM manipulation is cleaner and more performant for a game         |
| **tsparticles/slim**       | Ambient environmental particles and keystroke/victory feedback effects                                                  |
| **Howler.js**              | Cross-browser audio with ambient loop support and one-shot sound effects                                                |
| **CSS animations**         | Character reactions, letter state transitions, screen entry/exit - kept in CSS where possible to stay off the JS thread |
| **localStorage**           | All persistence; no backend, no login                                                                                   |
| **History API**            | URL-based navigation so every screen is bookmarkable/shareable without a router library                                 |
| **Pico.css (or custom)**   | Base reset and sensible form/button defaults - does not own the visual design                                           |

## Core UX Principles

These are non-negotiable constraints that every screen must satisfy:

1. **No scrolling, ever.** The entire game fits in the viewport at all times.
   This is a game, not a website.
2. **One line of text at a time.** The typing UI shows one line; on completion
   it is replaced. No walls of text.
3. **Story is told between levels, never during.** The level screen is
   minimalistic - zero narrative distraction.
4. **Every screen is linkable.** History API pushState keeps the URL in sync
   with the current screen and level.
5. **Everything is lowercase.** No shift key, no caps, ever. Reduces cognitive
   load for learners.

## Key Files

- `index.html` - single page shell; all screens are rendered into one root
  container
- `src/main.ts` - entry point; bootstraps the router, loads persisted state,
  renders the initial screen
- `vite.config.ts` - build configuration
- `src/types.ts` - canonical TypeScript types for the entire game (see
  `13-data-model-tech.md`)
- `test/` - TypeScript tests run through Node's built-in test runner via `tsx`
