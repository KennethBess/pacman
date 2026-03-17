## Why

ESLint reports 7 unused-variable errors across 5 files. The build script runs `tsc --noEmit` but not the linter, so these don't block `npm run build` today — but they fail `npm run lint`, add noise to editor diagnostics, and will block CI if a lint gate is added.

## What Changes

### Remove unused imports and variables

- Remove unused type imports (`GhostData`, `GhostName`, `Direction`, `GHOST_START_POSITIONS`) from test files and production code
- Remove or use unused local variables (`startTile`, `sweepAngle`, `top`) in test and renderer files

### No behavioral changes

Every fix is a dead-code removal or destructuring adjustment. No logic, rendering, or test assertions change.

## Capabilities

### Modified Capabilities

- None — this is a housekeeping change with no feature impact

## Impact

- `src/ghost.test.ts` — remove unused `GhostData` and `GhostName` imports
- `src/ghosts/pokey.ts` — remove unused `GHOST_START_POSITIONS` import
- `src/maze.test.ts` — remove unused `Direction` import
- `src/player.test.ts` — remove or use unused `startTile` variable
- `src/renderer.ts` — remove or use unused `sweepAngle` and `top` variables
