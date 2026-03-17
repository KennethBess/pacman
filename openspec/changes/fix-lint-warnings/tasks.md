## 1. Fix Unused Imports

- [x] 1.1 Remove unused `GhostData` and `GhostName` imports from `src/ghost.test.ts`
- [x] 1.2 Remove unused `GHOST_START_POSITIONS` import from `src/ghosts/pokey.ts`
- [x] 1.3 Remove unused `Direction` import from `src/maze.test.ts`

## 2. Fix Unused Variables

- [x] 2.1 Remove unused `startTile` variable in `src/player.test.ts`
- [x] 2.2 Remove unused `sweepAngle` variable in `src/renderer.ts`
- [x] 2.3 Remove unused `top` variable in `src/renderer.ts`

## 3. Verify

- [x] 3.1 Run `npm run lint` — 0 errors
- [x] 3.2 Run `npm test` — all 119 tests pass
- [x] 3.3 Run `npm run build` — clean compile
