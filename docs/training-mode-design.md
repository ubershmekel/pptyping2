# Training Mode — Design Doc

## What is it?

A post-campaign (or skip-campaign) infinite improvement loop for players who already know all the keys.

Two phases repeat forever:

1. **Speed check** — type a full-alphabet text; the game measures per-key speed and error rate.
2. **Drill** — a short tailored exercise targeting the player's two weakest letters alongside fjal, with the finger guide always visible.

After the drill, loop back to the speed check.

## Entry Points

1. **Main Menu** — a second button below "Campaign" reads "Training Mode". Visible always (for players who want to skip the campaign).
2. **Level Select** — a dedicated card at the end of the grid, distinct from numbered levels.

---

## Phase 1 — Speed check

**Goal:** Measure the player's current per-key performance across the full alphabet.

### Level content

- Reuse the level-21 text.
- This gives every letter at least 2–3 repetitions and uses real words, keeping it readable.
- No threshold to pass — it always "succeeds" and feeds the data forward.

### What gets tracked

`LevelStats.charErrors` and `LevelStats.charAvgTimes` already capture exactly what we need.  
No schema change required for the stats themselves.

### UI

- Label: "SpeedCheck" (not a numbered level).
- Show the animated character portraits as usual.
- **Do not** show the finger guide during the speed check — it's a pure speed measurement.
- Same `LevelScreen.vue` component, just with a different framing/label.

## End of Speed Check Screen

Show a table with the columns: letter, average latency ms, error count

The table is sorted by the latency, we do not need to worry about the error count (the errors are likely going to be slow too).

A button to "retry" and a button to "drill the slowest letters". The top 2 letters from the table would be added to fjal in the next screen.

## Phase 2 — Drill

**Goal:** Focused repetition of the player's two weakest letters, anchored to the home row.

### Drill letter set

`fjal` (home-row anchors) + the two worst letters.  
Rationale: `fjal` gives a home-row anchoring while still allowing focus on the exact weak letters.

### Text generation

Dynamically generate a ~60-character drill string from the letter set.  
Pattern: pairs and triples of the target letters interleaved with anchor keys, similar to the existing learn levels.  
Example for worst letters `g` and `m`:

```
fgmj gmfj mjfg gfmj jgmf alfg lmaj fgml gjal mjaf gfal
```

Generation algorithm:

- Take all 4-6 letters, build groups of them separated by spaces.
- No fixed length limit — all groups are included, padded if too short.

### Finger guide

The `FingerGuide.vue` component is shown **inline and persistently** during the drill — unlike regular levels the keyboard diagram stays visible the entire time the player is typing.

### Scoring and drill end screen

The drill has no pass threshold, but the end screen shows the player their wpm and error rate as usual. There is a button to retry or go back to the speed check.

---

## Between-Phase Screen — "Diagnosis"

After the speed check completes, show a dedicated screen before launching the drill:

```
┌─────────────────────────────────────┐
│  Speed Check Complete               │
│  42 WPM  •  94% accuracy            │
│                                     │
│  Your weakest keys:                 │
│  ┌──────────────────────────────┐   │
│  │  g  — 320ms avg, 3 errors    │   │
│  │  m  — 290ms avg, 1 error     │   │
│  │  q  — 220ms avg, 1 error     │   │
│  │  z  — 210ms avg, 4 errors    │   │
│  │  ...                         │   │
│  │  w  — 120ms avg, 0 error     │   │
│  │  t  — 110ms avg, 0 errors    │   │
│  └──────────────────────────────┘   │
│                                     │
│  Today's drill: f j a l + g m       │
│                                     │
│  [Start Drill →]   [Retry]│
└─────────────────────────────────────┘
```

This is a new screen: `DrillIntro.vue`.  
It receives the speed check stats, computes the two weak letters, and passes them to the drill level.

---

## Data / State Changes

### New `AppScreen` variants (in `types.ts`)

```ts
| { id: "training-speedcheck" }
| { id: "drill-intro"; weakLetters: [string, string]; speedCheckStats: LevelStats }
| { id: "training-drill"; letters: string }  // e.g. "fjalgm"
```

### Profile storage

LevelStats can be reused.

### No new level in `LEVELS`

Training levels are ephemeral — they don't have level numbers, don't appear on the level select, and don't count toward `highestUnlockedLevel`. They're tracked separately via `trainingHistory`.

---

## Routing

Add two new routes in `router/index.ts`:

```
/training           → training-speedcheck screen
/training/drill     → training-drill screen (state passed via router state or store)
```

The "Training Mode" main-menu button navigates to `/training`.

---

## Screens to Build

| Screen           | File                      | Notes                                              |
| ---------------- | ------------------------- | -------------------------------------------------- |
| SpeedCheck level | Reuse `LevelScreen.vue`   |                                                    |
| Drill intro      | `DrillIntro.vue`          | New. Shows weak-key diagnosis and drill letter set |
| Drill level      | Reuse `LevelScreen.vue`   | Pass `alwaysShowFingerGuide: true` prop            |
| Drill complete   | Reuse `LevelComplete.vue` | "SpeedCheck again →" instead of "Next Level →"     |

---

## Out of Scope (for this release)

- Tracking WPM per letter over time (rolling average across cycles) — would require more storage design.
- Bigram analysis (e.g. "gm is slow together") — needs more data.
