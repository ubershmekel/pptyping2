# Typing Engine

## Intent

The typing engine is the core interaction loop of the game. It handles all
keystroke processing, manages the state of each letter in the current line,
computes real-time stats, and emits events that the rest of the UI reacts to.

The engine has no knowledge of visuals, sound, or particles — it is a pure logic
module. It emits typed events (correct keystroke, error, line complete, level
complete) that the level screen's orchestration layer handles by calling into
the character companion, audio manager, and particle manager.

## How It Works

### Line Management

At level start, the engine pulls words from the level's word list and builds a
sequence of lines. Each line is a string of space-separated words that fits
comfortably within one visible text row. Lines are pre-generated for the level
and presented one at a time.

When the player completes a line (types the last character correctly), the
engine advances to the next line. When all lines are exhausted, the level is
complete.

### Letter State

Each character in the current line is tracked with one of three states:

- **Done**: the player has typed this character (correct)
- **Current**: the next character to type (cursor position)
- **Pending**: not yet reached

The engine maintains a cursor index. On each keystroke:

- If the key matches the current character: advance cursor, mark letter as Done,
  emit `correctKeystroke` event
- If the key does not match: emit `errorKeystroke` event, increment error count
  (cursor does not advance — the player must type the correct character)
- Space advances past the current word boundary when the word is complete

Backspace is intentionally **not supported**. Players cannot go back. This is a
deliberate design choice to keep the flow forward-moving and match the
"cleansing the key" metaphor.

### Real-Time Stats

The engine tracks:

- **WPM**: calculated as `(characters typed correctly / 5) / elapsed minutes`.
  Updated every second.
- **Accuracy**: `(correct keystrokes / total keystrokes) * 100`. Updated on
  every keystroke.
- **Elapsed time**: starts on first keystroke, pauses when the pause overlay is
  active.

Stats are emitted continuously so the stats display (see `17-typing-engine-tech.md`)
can update without polling.

### Combo / Streak Tracking

The engine tracks consecutive correct keystrokes. At defined thresholds (e.g.,
10, 25, 50 in a row without error), it emits a `comboMilestone` event. The level
screen uses this to trigger the character companion's celebration animation and
a particle burst.

### Level Complete Logic

When all lines are typed, the engine emits `levelComplete` with the final stats
object: `{ wpm, accuracy, elapsedSeconds, totalErrors }`. The level screen
compares these against the difficulty thresholds (see `18-difficulty-system-tech.md`)
and transitions to the level complete screen.

## Key Files

- `src/typing/typingEngine.ts` — the main engine class; owns cursor state, line
  sequence, and stat computation; emits DOM custom events or calls registered
  callbacks
- `src/typing/lineManager.ts` — constructs the sequence of lines from the word
  list; handles word wrapping logic to ensure lines fit in one visual row
  without overflow
- `src/typing/stats.ts` — stat calculation utilities (WPM formula, accuracy
  formula); stateless functions that take raw counts and elapsed time
- `src/ui/letterSpan.ts` — creates and updates the `<span>` elements for each
  character; applies CSS classes for Done/Current/Pending states; the engine
  tells it which state to apply,
