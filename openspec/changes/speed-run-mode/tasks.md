## 1. Types and Configuration

- [x] 1.1 Add `GameMode` enum (`CLASSIC`, `SPEED_RUN`) to `src/types.ts`
- [x] 1.2 Add `SpeedRunTimer` interface to `src/types.ts` (elapsed, levelStart, splits array, running flag)

## 2. Speed Run Timer Module

- [x] 2.1 Create `src/speed-run.ts` with `createSpeedRunTimer()`, `startTimer()`, `pauseTimer()`, `updateTimer(dt)`, `recordSplit(level)`, `resetTimer()` pure functions
- [x] 2.2 Add `loadBestTime()` and `saveBestTime()` localStorage persistence functions (key: `"pacman-speed-run-best"`)
- [x] 2.3 Add `formatTime(seconds)` utility that returns `MM:SS.mm` string
- [x] 2.4 Write tests for speed run timer logic (start, pause, resume, split recording, best time persistence)

## 3. Game State Integration

- [x] 3.1 Add `mode: GameMode` and `speedRunTimer: SpeedRunTimer` fields to `GameState` interface
- [x] 3.2 Update `createGameState()` and `initNewGame()` to accept game mode parameter and initialize timer
- [x] 3.3 Add timer update in PLAYING phase (`updateTimer(dt)` when in speed run mode)
- [x] 3.4 Pause timer on PLAYING → DYING/PAUSED/LEVEL_COMPLETE transitions
- [x] 3.5 Record split time on level complete in speed run mode
- [x] 3.6 Save best time on game over if new best in speed run mode

## 4. Input Updates

- [x] 4.1 Add `speedRunRequested` field and `consumeSpeedRunRequest()` to `InputHandler` (S key)
- [x] 4.2 Pass speed run request through `main.ts` update function to game state

## 5. Title Screen Update

- [x] 5.1 Update title screen rendering to show mode selection ("ENTER — Classic" / "S — Speed Run")
- [x] 5.2 Display speed run best time on title screen if one exists
- [x] 5.3 Handle S key in TITLE_SCREEN phase to start speed run mode

## 6. HUD and Results

- [x] 6.1 Display running timer on HUD during speed run gameplay (replace lives text position)
- [x] 6.2 Render speed run results screen on game over in speed run mode (total time, splits, new best indicator)
- [x] 6.3 Handle exit from speed run results (Enter/Escape returns to title)

## 7. Testing

- [x] 7.1 Update existing game-state tests to pass `GameMode.CLASSIC` where needed
- [x] 7.2 Add game-state tests for speed run mode (timer starts/pauses, splits recorded, best time saved)
- [x] 7.3 Verify all existing tests still pass
