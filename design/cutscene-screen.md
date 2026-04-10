# Cutscene Screen

## Intent

Cutscenes are the emotional reward moments of the game - the payoff for
completing an arc of levels. They deliver the story narrative and reveal the
illustration for that arc's chapter. This screen should feel cinematic and
unhurried.

Cutscenes play automatically after an arc is completed. They can also be
replayed from the level select screen by clicking a completed cutscene node.

## Content

Each cutscene has two components:

1. **Narrative text** - 1-3 paragraphs of story from `stories.ts`, served for
   the player's chosen team. This advances the Pokemon adventure/rescue arc or
   the MLP diplomacy/friendship arc.
2. **Illustration** - an image representing the story moment. One per arc per
   team (6 per team, 12 total assets). The image is revealed with a particle
   effect materializing animation.

## Presentation Sequence

1. Screen fades in from black
2. The chapter label, title, and narrative paragraphs fade in with staggered
   timing so the story still feels paced and cinematic
3. The illustration begins its reveal immediately as the art overlay fades away
4. The cutscene's one-shot burst particles fire on their configured schedule,
   centered on the illustration instead of the full screen
5. The Continue and Level Select actions stay visible beneath the story so the
   player can advance or leave at any point
6. After the art is visible, clicking the illustration instantly replays the
   cutscene's burst particles for that chapter with no additional delay
7. The player continues to the next level (or the main menu if it is the
   finale cutscene)

The particle reveal for the image is the signature visual moment of cutscenes.
The intent is that completing a hard arc and then watching the image literally
emerge from sparkles feels genuinely rewarding.

## Environment Continuity

The arc's environment (background, ambient particles, ambient sound) carries
over into the cutscene screen. The world does not abruptly change - the
cutscene feels like a moment within the same place the player just escaped
from.

## Key Files

- `src/screens/Cutscene.vue` - renders the narrative text animation, manages the
  Continue and Level Select interactions, triggers the particle image reveal,
  replays burst particles when the art is clicked, reads content from
  `stories.ts`, and navigates forward on completion
