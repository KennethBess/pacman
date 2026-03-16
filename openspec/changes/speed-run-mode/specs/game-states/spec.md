## MODIFIED Requirements

### Requirement: Game state machine
The game SHALL manage phases via an explicit state machine with states: TITLE_SCREEN, READY, PLAYING, DYING, PAUSED, GAME_OVER, LEVEL_COMPLETE. Only valid transitions MUST be allowed. The game state SHALL track the current game mode (CLASSIC or SPEED_RUN) and, when in speed run mode, manage the speed run timer state across phase transitions.

#### Scenario: Game start sequence
- **WHEN** the game initializes or a new life begins
- **THEN** the state is READY, entities are placed at starting positions, and a brief countdown occurs before transitioning to PLAYING

#### Scenario: Player death
- **WHEN** the player collides with a ghost in normal state during PLAYING
- **THEN** the state transitions to DYING, a death animation plays, and then either READY (if lives remain) or GAME_OVER

#### Scenario: Level complete
- **WHEN** all pellets are consumed during PLAYING
- **THEN** the state transitions to LEVEL_COMPLETE, a brief animation plays, and the next level loads

#### Scenario: Pause toggle
- **WHEN** the player presses the pause key during PLAYING
- **THEN** the state transitions to PAUSED and the game loop stops updating

#### Scenario: Resume from pause
- **WHEN** the player presses the pause key during PAUSED
- **THEN** the state transitions back to PLAYING

#### Scenario: Title screen initial state
- **WHEN** the game first loads
- **THEN** the state is TITLE_SCREEN and no gameplay occurs

#### Scenario: Title screen to ready (classic)
- **WHEN** the player presses Enter during TITLE_SCREEN
- **THEN** the state transitions to READY with a new game initialized in classic mode

#### Scenario: Title screen to ready (speed run)
- **WHEN** the player presses S during TITLE_SCREEN
- **THEN** the state transitions to READY with a new game initialized in speed run mode with timer reset to zero

#### Scenario: Game-over to title screen
- **WHEN** the player presses Escape during GAME_OVER (after optional high score entry or speed run results)
- **THEN** the state transitions to TITLE_SCREEN

#### Scenario: Speed run timer tracks gameplay
- **WHEN** the game is in speed run mode and transitions to PLAYING
- **THEN** the speed run timer begins or resumes advancing

#### Scenario: Speed run timer pauses on non-gameplay
- **WHEN** the game is in speed run mode and transitions away from PLAYING
- **THEN** the speed run timer stops advancing

#### Scenario: Speed run split on level complete
- **WHEN** a level is completed in speed run mode
- **THEN** the current elapsed time is recorded as a split for that level
