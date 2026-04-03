# Cutscene Screen

## Intent

Cutscenes are the emotional reward moments of the game — the payoff for
completing an arc of levels. They deliver the story narrative and reveal the
AI-generated illustration for that arc's chapter. This screen should feel
cinematic and unhurried.

Cutscenes play automatically after an arc is completed. They can also be
replayed from the level select screen by clicking a completed cutscene node.

## Content

Each cutscene has two components:

1. **Narrative text** — 1–3 paragraphs of story from `stories.ts`, served for
   the player's chosen team. This advances the Pokemon adventure/rescue arc or
   the MLP diplomacy/friendship arc.
2. **AI-generated illustration** — a pre-generated image representing the story
   moment. One per arc per team (6 per team, 12 total assets). The image is
   revealed with a particle effect materializing animation.

## Presentation Sequence

1. Screen fades in from black
2. Narrative text fades in line by line (or paragraph by paragraph), paced with
   a short delay between each block
3. A "Continue" prompt appears once all text has been shown (or immediately if
   the player clicks anywhere, to accommodate players who have already read it)
4. The player presses Continue (or clicks/taps anywhere)
5. The AI illustration materializes from particles — particles coalesce into the
   image shape, revealing the full illustration over ~2 seconds
6. A second "Continue" prompt appears below the image
7. The player continues to the next level (or the main menu if it's the finale
   cutscene)

The particle reveal for the image is the signature visual moment of cutscenes.
The intent is that completing a hard arc and then watching the image literally
emerge from sparkles feels genuinely rewarding.

## Environment Continuity

The arc's environment (background, ambient particles, ambient sound) carries
over into the cutscene screen. The world doesn't abruptly change — the cutscene
feels like a moment within the same place the player just escaped from.

## Key Files

- `src/screens/cutsceneScreen.ts` — renders the narrative text animation,
  manages the Continue interaction, triggers the particle image reveal, reads
  content from `stories.ts` and the arc's `CutsceneDefinition`, navigates
  forward on completion
