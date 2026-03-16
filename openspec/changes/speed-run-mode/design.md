## Context

The game has a single play mode with score tracking and high scores. The game state machine manages phase transitions (TITLE_SCREEN → READY → PLAYING → etc). The title screen currently shows only "Press ENTER to Start". The HUD shows score, lives, and level. localStorage is already used for high score persistence.

## Goals / Non-Goals

**Goals:**
- Add a speed run mode with a running timer displayed on the HUD
- Track per-level split times and total elapsed time
- Persist best times in localStorage
- Add mode selection to the title screen
- Show speed run results on game completion

**Non-Goals:**
- Ghost pattern randomization for speed run fairness (same deterministic AI)
- Online leaderboards or cloud persistence
- Replay recording or ghost data
- Separate difficulty settings for speed run mode

## Decisions

### 1. GameMode enum added to GameState

Add a `GameMode` enum (`CLASSIC`, `SPEED_RUN`) stored on `GameState`. All existing behavior runs under `CLASSIC` by default. Speed run-specific logic is gated behind `state.mode === GameMode.SPEED_RUN`.

**Rationale**: Minimal intrusion on existing code. A single field controls the mode, and all timer logic is conditional on it.

### 2. SpeedRunTimer as a separate module

Create `src/speed-run.ts` with a `SpeedRunTimer` interface containing: `elapsed` (total gameplay seconds), `levelStart` (timestamp for current level), `splits` (array of per-level times), and `running` (whether timer is active). Pure functions manage start/pause/resume/split/reset.

**Rationale**: Keeps timer logic out of game-state.ts. The timer state is stored on GameState but managed by pure functions in its own module, following the project's separation principle.

### 3. Timer display on HUD

When in speed run mode, the timer replaces the "LIVES" display position in the HUD (lives still shown as icons below). Format: `MM:SS.mm` (minutes, seconds, centiseconds). The timer text pulses green on a new best split.

**Rationale**: The HUD already has three columns (score, lives, level). Replacing the lives text with the timer keeps the layout balanced. Lives icons are still visible below.

### 4. Best times persisted via localStorage

Best times stored under key `"pacman-speed-run-best"` as a JSON object mapping level count to total time. Uses the same try/catch pattern as the high scores module.

**Rationale**: Consistent with existing persistence approach. Keying by level count allows tracking best times for different run lengths.

### 5. Title screen mode selection

Title screen shows two options: "Press ENTER — Classic" and "Press S — Speed Run". Below the mode options, show the current speed run best time if one exists.

**Rationale**: Simple key-based selection avoids a complex menu system. The S key is mnemonic for Speed Run.

### 6. Speed run results screen

On game over in speed run mode, show a results screen with: total time, per-level splits, whether it's a new best time, and the previous best. This replaces the standard game-over/initials-entry flow (speed run doesn't use the score-based high score table).

**Rationale**: Speed run success is measured by time, not score. Showing splits gives players insight into which levels to improve.

## Risks / Trade-offs

- **HUD layout change**: Replacing lives text with timer in speed run mode could confuse players who expect to see lives count. Mitigated by keeping life icons visible.
- **localStorage key collision**: Using a distinct key (`"pacman-speed-run-best"`) avoids any collision with `"pacman-high-scores"`.
- **Timer precision**: Using `elapsed += dt` accumulates floating-point error over long runs. For a game session this is negligible (< 1ms drift per hour).
