# Known Drift

This file tracks design-doc and implementation gaps that are known and not yet
resolved.

## Remaining Implementation Gaps

### Curriculum feedback

- `teaching-touch-typing.md`: cumulative-review failure feedback that
  recommends a refresher level based on the player's weakest character is
  specified but not yet implemented

### Activity log

- `data-model.md`: `ActivityLogEntry` type and
  `activityLog: ActivityLogEntry[]` on `PlayerProfile` do not exist yet in
  `src/types.ts`
- `src/state/gameState.ts` `applyLevelResult` does not append an
  `ActivityLogEntry` on level 2+ completions
- `settings.md`: the settings screen (`src/screens/settings.ts`) has no
  activity log section — currently it only shows About and Keyboard Shortcuts

### Settings screen completeness

- `settings.md`: audio controls (master volume, SFX, ambient music) are
  not implemented anywhere
- `settings.md`: data export/import (JSON copy-paste) is not implemented
- `settings.md`: team indicator and "Try the other team" flow are not in
  the settings screen

### Level complete screen

- `level-complete.md`: personal best WPM and accuracy comparison is not
  shown (the `LevelRecord` exists but is not passed to `renderLevelComplete`)
- `level-complete.md`: story blurb from `stories.ts` is not shown; the
  screen shows a static hardcoded feedback message instead
- `level-complete.md`: reward image (`public/images/rewards/`) is not
  shown on pass — the image assets do not exist yet either

### Reward images

- `assets.md`: the 36 level reward images
  (`public/images/rewards/{team}/{level}.webp`) have not been generated or added
  to the project
