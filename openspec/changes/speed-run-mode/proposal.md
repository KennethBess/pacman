## Why

The game currently has a single play mode with no time-based challenge. Adding a speed run / time attack mode gives experienced players a competitive goal — clear levels as fast as possible with a persistent best-time leaderboard. This adds replayability and a skill ceiling beyond just score chasing.

## What Changes

### Speed run mode
- Add a **mode selection** to the title screen: "Classic" (current behavior) or "Speed Run"
- In speed run mode, display a **running timer** (mm:ss.ms) on the HUD during gameplay
- Timer starts when PLAYING phase begins and pauses during DYING/READY phases (only gameplay counts)
- On level complete, show the **level split time** briefly before advancing
- On game over or all-levels-clear, show **total time** and **per-level splits** on the results screen
- Persist **best times** per level count in localStorage alongside existing high scores
- Speed run mode uses the same maze, ghosts, and mechanics — no rule changes

### Title screen update
- Replace single "Press ENTER to Start" with a mode selector (ENTER for Classic, S for Speed Run)
- Show speed run best time on title screen if one exists

## Capabilities

### New Capabilities
- `speed-run`: Timer tracking, split times, best-time persistence, and speed run results screen

### Modified Capabilities
- `ui-screens`: Title screen adds mode selection; game-over screen shows speed run results when in speed run mode
- `game-states`: GameState tracks current game mode and timer data; phase transitions account for timer pause/resume

## Impact

- `src/types.ts` — add GameMode enum, speed run timer types
- `src/game-state.ts` — add mode field, timer tracking logic, timer pause/resume on phase transitions
- `src/renderer.ts` — title screen mode selection, HUD timer display, speed run results screen
- `src/input.ts` — add speed run mode start key (S)
- `src/main.ts` — pass mode selection through to game state
- New file: `src/speed-run.ts` — timer logic, split tracking, best-time persistence
- `src/config.ts` — add speed run display constants
