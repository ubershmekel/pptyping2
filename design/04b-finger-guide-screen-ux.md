# Finger Guide Screen (Pre-Level Explainer)

## Intent

Every level from level 2 onward begins with a dedicated explainer screen. Its
job is to show the player which fingers to use and deliver one focused teaching
tip before live typing starts. It is not optional. The teaching reminder is
part of the curriculum, not polish.

Level 1 (the speed test) uses a different intro screen — see
`01b-teaching-touch-typing.md`. The finger guide is never shown for level 1.

See `01b-teaching-touch-typing.md` for the curriculum contract this screen
enforces.

## Placement in flow

```
cutscene        → finger guide → level   (levels 2+)
level select    → finger guide → level   (levels 2+)
retry           → finger guide → level   (levels 2+)
continue (menu) → finger guide → level   (levels 2+)

level select    → speed test intro → level 1
retry           → speed test intro → level 1
```

The finger guide sits at `/level/<N>` (no separate URL). The level screen
itself is reached only via the finger guide's Start button or Enter key.

## Layout

The screen has five stacked regions inside a centered column (max 860 px):

1. **Header** — level number + role tag, title "Before you type…"
2. **Teaching tip** — one prominent tip, large text, for this level
3. **Keyboard + hands section** — the main visual aid
4. **Legend** — color swatches for every finger active in this level
5. **Actions** — primary "Start Level →" button, secondary "← Level Select"

## Teaching tip

Each level shows exactly **one** teaching tip, displayed prominently (not as a
small chip — this is the headline of the screen). The tip rotates across levels
following the schedule in `01b-teaching-touch-typing.md`.

Level 2 also shows a secondary note beneath the main tip:

> Thumbs press Space between words

This supplement appears only on level 2 and is not part of the rotation.

## Keyboard visual aid

The full US keyboard SVG (`KB_United_States.svg`) is rendered inline and
colored at runtime:

| Key state                       | Cap fill      | Stroke          |
| ------------------------------- | ------------- | --------------- |
| Not yet unlocked for this level | `#e8e4de` dim | —               |
| Active — regular key            | finger color  | `#888` 1px      |
| Active — new key this level     | finger color  | `#4b2f18` 2.2px |
| Active — anchor (`F` or `J`)    | finger color  | `#4b2f18` 2.8px |

Finger colors are shared with the hand diagram (see below).

For the speed-test level (level 1) all keys are active; "new key" emphasis is
suppressed because every key is equally new.

For finale / review levels the "new key" emphasis is also suppressed — all
unlocked keys share the same weight.

## Hand diagram

Two instances of `right-hand.svg` are rendered below the keyboard:

- **Right hand** — normal orientation (thumb on left of the SVG = left of the
  hand as seen from above)
- **Left hand** — same SVG, mirrored via `transform: scaleX(-1)` on the
  container

Each SVG has named paths for `#Pinky`, `#Ring`, `#Middle`, `#Index`, and
`#Thumb`. At render time each finger path is recolored:

| Condition                         | Fill                  | Opacity |
| --------------------------------- | --------------------- | ------- |
| Finger has active keys this level | `FINGER_COLORS[name]` | 1       |
| Finger has no active keys         | `#b0a898` (neutral)   | 0.3     |
| Thumb (no keyboard assignment)    | neutral               | 0.3     |

The background rect in the SVG (`<rect width="208">`) is hidden so the dark
screen background shows through.

The palm path (`#Hand`) dims to 0.3 opacity when no fingers on that hand are
active.

`#Thumb` is always shown in neutral grey (`#d8d4ce`, 0.85 opacity) on both
hands — it has no keyboard-finger color assignment because it is the space bar
thumb, not a letter finger.

## Finger color palette

These colors are shared between the keyboard keys and the hand finger paths:

| Finger       | Color     |
| ------------ | --------- |
| Left pinky   | `#f3b6a5` |
| Left ring    | `#f6c98f` |
| Left middle  | `#f4de7f` |
| Left index   | `#b8d98b` |
| Right index  | `#8ed6b8` |
| Right middle | `#93c7ef` |
| Right ring   | `#b6b7ef` |
| Right pinky  | `#dbb0e8` |

## Legend

Below the keyboard+hands section, one chip per finger that has at least one
active key this level. Each chip shows the color swatch and the finger name.
Fingers with no active keys are omitted entirely to keep the legend small.

## Level tag

The pill at the top of the header varies by level type:

- Speed test: "Level 1 — Speed Test"
- New-key level: "Level N — New keys: E T" (keys rendered as `<kbd>` chips
  using the team primary color)
- Finale / review: "Level N — Review"

## Interactive key preview

While on the finger guide screen the keyboard and hand diagram are interactive:

- Pressing a key on the physical keyboard, or clicking a key cap in the SVG,
  momentarily highlights that key and lights up the corresponding finger in the
  hand diagram.
- On press: the key cap darkens and the finger turns white with a colored glow.
- On release: the key cap and finger return to their normal level-coloring state.
- The space bar triggers both thumbs simultaneously.
- Keys that are not yet unlocked for the current level still respond — showing
  which finger owns them is the whole point of the screen.

This lets players explore the finger map before typing begins without any
consequence.

## Actions

- **Start Level →** (primary, team-primary color) — proceeds to the level
- **← Level Select** (secondary, ghost) — goes back to level select

Pressing **Enter** at any time triggers Start. This allows players to quickly
skip through the screen on retries without reaching for the mouse.

## Implementation surface

| File                                       | Role                                    |
| ------------------------------------------ | --------------------------------------- |
| `src/screens/fingerGuide.ts`               | Screen renderer, SVG coloring logic     |
| `src/screens/fingerGuide.css`              | Layout and visual styling               |
| `src/assets/keyboard/KB_United_States.svg` | Keyboard source SVG                     |
| `src/assets/hand/right-hand.svg`           | Hand source SVG (used for both hands)   |
| `src/types.ts`                             | `finger-guide` AppScreen variant        |
| `src/app.ts`                               | Routes `/level/<N>` through this screen |
