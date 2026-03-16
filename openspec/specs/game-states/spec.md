## Purpose

State machine for game phases (title-screen, ready, playing, dying, paused, game-over, level-complete) with transitions.

## Requirements

### Requirement: Game state machine
The game SHALL manage phases via an explicit state machine with states: TITLE_SCREEN, READY, PLAYING, DYING, PAUSED, GAME_OVER, LEVEL_COMPLETE. Only valid transitions MUST be allowed.

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

#### Scenario: Title screen to ready
- **WHEN** the player presses Enter during TITLE_SCREEN
- **THEN** the state transitions to READY with a new game initialized

#### Scenario: Game-over to title screen
- **WHEN** the player presses Escape during GAME_OVER (after optional high score entry)
- **THEN** the state transitions to TITLE_SCREEN

### Requirement: Lives system
The player SHALL start with a configurable number of lives (default: 3). One life is lost on each death. The game MUST end when lives reach zero.

#### Scenario: Life lost
- **WHEN** the player dies
- **THEN** the life count decreases by one

#### Scenario: No lives remaining
- **WHEN** the player dies with zero remaining lives
- **THEN** the state transitions to GAME_OVER

### Requirement: Level progression
When a level is completed, the game SHALL advance to the next level with the maze reset (all pellets restored, entities at start positions). Ghost speed and behavior timing SHOULD increase with level number.

#### Scenario: Level advance
- **WHEN** LEVEL_COMPLETE animation finishes
- **THEN** the level counter increments, the maze resets, and the state transitions to READY

#### Scenario: Difficulty increase
- **WHEN** a higher level begins
- **THEN** ghost speed and frightened duration are adjusted per the level configuration
