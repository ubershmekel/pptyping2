# Character Companion

## Intent

The character companion is the player's avatar during typing. It is a small
character sprite that walks along the top edge of the current text line,
horizontally tracking the cursor position as the player types. This makes the
typing feel like an action — you are literally moving a character through the
level with each keystroke.

The companion serves as emotional feedback. Its state changes tell the player
how they're doing without requiring them to look away from the text.

## Character States

| State       | Trigger                                | Visual                                |
| ----------- | -------------------------------------- | ------------------------------------- |
| Idle        | No typing, at start of line            | Standing still, gentle breathing loop |
| Walking     | Active typing, cursor moving right     | Walking animation synced to movement  |
| Celebrating | Combo/streak milestone hit             | Bounce, sparkle, brief cheer pose     |
| Flinching   | Error keystroke                        | Quick recoil animation, brief pause   |
| Reset       | Line complete, returning to line start | Slide or jump back to left edge       |

## Movement Behavior

The companion's horizontal position maps directly to the cursor index in the
current line. As the cursor advances right, the companion moves right
proportionally across the text line's bounding box. The movement is not instant
— it uses a CSS transition (ease-out) on the `transform: translateX` property so
it smoothly glides to the new position rather than teleporting.

The walking animation is faked with CSS: a slight up/down oscillation (translate
Y) combined with a subtle lean (rotate) creates a bouncy walk feel without
requiring frame-by-frame sprite sheets. This can be upgraded later to full
sprite animation without changing the position logic.

On line complete, the companion plays a short transition back to the left edge
(x=0) before the new line appears.

## Per-Team Characters

Each team has its own character(s). The companion displayed depends on the
player's team:

- **Pokemon**: Pikachu (default), with sparks on correct keystrokes, thunder
  animation on level complete
- **MLP**: Pinkie Pie (default), with rainbow flashes on correct keystrokes,
  confetti on level complete

The companion module is team-aware: it loads the correct sprite assets based on
`gameState.team`.

## Implementation Note

Start simple: static PNG poses for each state, switched via CSS class. The
position logic (mapping cursor index to X coordinate) should be nailed first.
Animate the walk cycle after the core feel is right.

## Key Files

- `src/character/companion.ts` — manages the companion DOM element; subscribes
  to engine events (`correctKeystroke`, `errorKeystroke`, `comboMilestone`,
  `lineComplete`); translates events into state changes and position updates
- `src/character/spriteAnimator.ts` — handles the sprite state machine (idle →
  walking → celebrating → flinching); applies CSS classes and manages animation
  timing; knows nothing about the typing engine
