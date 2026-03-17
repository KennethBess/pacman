## Approach

Each of the 7 lint errors is an unused variable flagged by `@typescript-eslint/no-unused-vars`. The fix strategy per error type:

1. **Unused imports** — remove the import specifier entirely (or the whole import statement if it was the only specifier)
2. **Unused local variables** — remove the assignment if the right-hand side has no side effects; otherwise prefix with `_` to signal intentional discard

## File-by-file Plan

### `src/ghost.test.ts`
- Line 3: `GhostData` imported but never referenced in tests → remove from import
- Line 15: `GhostName` imported but never referenced → remove from import

### `src/ghosts/pokey.ts`
- Line 2: `GHOST_START_POSITIONS` imported but unused → remove from import

### `src/maze.test.ts`
- Line 3: `Direction` imported but unused → remove from import

### `src/player.test.ts`
- Line 33: `startTile` assigned but never read → remove the variable declaration

### `src/renderer.ts`
- Line 293: `sweepAngle` assigned but never used → remove variable or inline if needed
- Line 355: `top` destructured but never used → replace with `_top` or omit from destructuring

## Testing

- Run `npm run lint` — expect 0 errors
- Run `npm test` — all 119 tests must still pass
- Run `npm run build` — must still compile cleanly
