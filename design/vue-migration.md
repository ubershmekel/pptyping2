# Vue Migration Plan

## Intent

The current screen system is doing too much work by hand:

- `app.ts` owns routing, guards, screen construction, teardown, and navigation
  callback wiring.
- Screen modules export DOM factory functions, so navigation is passed around as
  injected callbacks instead of being declared where the UI lives.
- Direct navigation and component relationships are harder to follow in the IDE
  than they should be.

The migration goal is to replace the hand-rolled screen/rendering layer with
Vue and Vue Router while preserving the game logic, data model, content, and
visual design.

## Decision

Screen UI files should become `.vue` single-file components.

We should not try to keep screen UIs as `.ts` render factories while "using
Vue". That would keep most of the current indirection and would miss the main
benefits of Vue:

- template-based component structure
- local declarative event handling
- direct component imports and IDE navigation
- route-driven screen composition

Plain `.ts` should remain for:

- routing configuration
- composables and shared view logic
- state and persistence helpers
- data/content modules
- utility functions

## Target Architecture

- `src/App.vue` becomes the app shell.
- Vue Router owns canonical routes and guard redirects.
- Screen files move from `src/screens/*.ts` to `src/screens/*.vue`.
- Shared logic that is not presentation stays in `.ts`.
- Existing CSS files can be kept initially, then folded into Vue components only
  where that improves ownership.
- The current game state helpers in `src/state/` stay in TypeScript at first.

## Pre-Migration Guardrail

Before migrating screens, keep a browser smoke test that directly visits a
reasonable route set and verifies the app renders or redirects correctly.

The initial smoke suite should cover:

- `/`
- `/team-select`
- `/settings`
- `/debug-particles`
- `/level-select` with no save, asserting the team-select guard
- `/level-select` with a seeded save
- `/cutscene/0` with a seeded save
- `/level/1` with a seeded save

This protects the routing surface while the renderer is replaced underneath it.

## Migration Phases

### Phase 1: Tooling

- Add Vue and `@vitejs/plugin-vue`.
- Add Vue Router.
- Keep the current TypeScript data/state modules in place.
- Keep the Playwright smoke suite green throughout the migration.

### Phase 2: App Shell

- Create `src/App.vue`.
- Move top-level app bootstrapping from `src/app.ts` into Vue.
- Replace the custom screen mount orchestration with Vue component mounting.

### Phase 3: Routing

- Replace the custom `Router` class with Vue Router configuration in a `.ts`
  file.
- Recreate current guards in router navigation guards:
  no-team redirects, locked-level redirects, unknown-route fallback.
- Keep canonical URLs the same unless there is an explicit design decision to
  change them.

### Phase 4: First Vertical Slice

- Convert the main menu first.
- Prove the pattern for:
  route entry, local event handlers, navigation, and cleanup.
- Use this slice to settle file layout and shared conventions before converting
  the rest.

### Phase 5: Screen Conversion

Convert screens one at a time, in this order:

1. Main menu
2. Team select
3. Settings
4. Level select
5. Cutscene
6. Intro/finger-guide screens
7. Level complete
8. Level screen
9. Debug particles

This order migrates the least stateful screens first and leaves the typing
engine for later.

### Phase 6: Shared Logic Cleanup

- Replace callback injection with router navigation inside components.
- Extract reusable view logic into composables where it clarifies ownership.
- Shrink or remove `src/app.ts` once it is no longer the central orchestrator.
- Delete obsolete screen-mount infrastructure only after all screens are off it.

## Non-Goals

- Rewriting the typing engine up front
- Changing the data model during the first migration pass
- Redesigning the routes during the first migration pass
- Mixing two long-term UI systems indefinitely

## Definition of Done

The migration is complete when:

- screen UIs are Vue SFCs
- Vue Router owns navigation and guards
- Playwright route smoke tests pass
- existing TypeScript tests still pass
- the old DOM screen-mount system is removed
