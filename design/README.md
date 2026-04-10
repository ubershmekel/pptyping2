# Design Docs

This folder holds the project's design source of truth. `known-drift.md` tracks
any intentional or unresolved gaps between these docs and the current
implementation.

- [`project-overview.md`](./project-overview.md) - High-level concept, core UX
  principles, stack choices, and the main project constraints.
- [`teaching-touch-typing.md`](./teaching-touch-typing.md) - The typing
  curriculum, finger assignments, and how letters unlock across the game.
- [`teaching-level-flow.md`](./teaching-level-flow.md) - The sequence of
  screens from level start to finish, with the rationale for each step.
- [`main-menu.md`](./main-menu.md) - Entry-screen goals, layout, and actions.
- [`team-select.md`](./team-select.md) - Team choice flow, messaging, and
  expected outcomes of selection.
- [`level-select.md`](./level-select.md) - World-map style level selection,
  locking rules, and progression cues.
- [`finger-guide-screen.md`](./finger-guide-screen.md) - Pre-level explainer for
  newly introduced letters and their finger positions.
- [`level-screen.md`](./level-screen.md) - Core typing gameplay screen, HUD, and
  pause behavior.
- [`cutscene-screen.md`](./cutscene-screen.md) - Story presentation between
  gameplay segments, including pacing and controls.
- [`level-complete.md`](./level-complete.md) - Pass/fail summary, rewards, and
  post-level progression messaging.
- [`pause-overlay.md`](./pause-overlay.md) - In-level pause menu behavior and
  resume/exit flows.
- [`settings.md`](./settings.md) - Player settings, data management, and support
  UI expected outside active gameplay.
- [`character-companion.md`](./character-companion.md) - Companion character
  behavior, expressions, and presentation rules across the UI.
- [`environments.md`](./environments.md) - Environment metadata and how visual
  and audio mood changes are selected.
- [`particles.md`](./particles.md) - Particle-effect rules for ambience and
  feedback moments.
- [`data-model.md`](./data-model.md) - Canonical game data structures and type
  contracts.
- [`routing.md`](./routing.md) - URL structure, navigation rules, and screen
  transition expectations.
- [`vue-migration.md`](./vue-migration.md) - Planned migration from the
  hand-rolled screen system to Vue and Vue Router.
- [`persistence.md`](./persistence.md) - Save format, local persistence, and
  import/export behavior.
- [`game-content.md`](./game-content.md) - How levels, stories, and other static
  content are organized in code.
- [`typing-engine.md`](./typing-engine.md) - Line generation, input evaluation,
  and runtime typing metrics.
- [`difficulty-system.md`](./difficulty-system.md) - How pass/fail thresholds
  and difficulty tuning are defined.
- [`assets.md`](./assets.md) - Asset inventory, naming conventions, and media
  organization.
- [`audio.md`](./audio.md) - Sound-effect and ambient-audio rules.
- [`content-integrity-tests.md`](./content-integrity-tests.md) - Static-content
  tests that protect level and word-list correctness.
- [`known-drift.md`](./known-drift.md) - Explicit record of current mismatches
  between the design docs and implementation.
