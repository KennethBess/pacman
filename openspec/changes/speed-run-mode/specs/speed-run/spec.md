## ADDED Requirements

### Requirement: Speed run timer
The system SHALL track elapsed gameplay time during speed run mode. The timer MUST only advance during the PLAYING phase (not during READY, DYING, PAUSED, or other non-gameplay phases). The timer SHALL display in MM:SS.mm format.

#### Scenario: Timer starts on play
- **WHEN** the game transitions from READY to PLAYING in speed run mode
- **THEN** the timer begins counting up from 0:00.00 (first level) or resumes from previous elapsed time

#### Scenario: Timer pauses during non-gameplay
- **WHEN** the game transitions out of PLAYING phase (death, pause, level complete)
- **THEN** the timer stops advancing

#### Scenario: Timer resumes after death
- **WHEN** the player respawns and transitions back to PLAYING after dying
- **THEN** the timer resumes from where it paused

### Requirement: Level split times
The system SHALL record a split time for each level completed in speed run mode. The split time is the elapsed time at the moment of level completion.

#### Scenario: Split recorded on level complete
- **WHEN** a level is completed in speed run mode
- **THEN** the elapsed time is recorded as the split for that level

#### Scenario: Splits accumulate across levels
- **WHEN** multiple levels are completed
- **THEN** each split represents the total elapsed time at that level's completion

### Requirement: Best time persistence
The system SHALL persist the best total time for speed runs in localStorage. Best times SHALL be keyed by the number of levels completed.

#### Scenario: New best time saved
- **WHEN** the speed run ends and the total time is lower than the stored best time for that level count
- **THEN** the new time is saved to localStorage

#### Scenario: Best time loaded on startup
- **WHEN** the game loads
- **THEN** the best speed run time is loaded from localStorage if available

#### Scenario: No existing best time
- **WHEN** there is no stored best time
- **THEN** the system treats any completed run as a new best

### Requirement: Speed run results screen
The system SHALL display a results screen when a speed run ends (game over or all levels cleared). The screen MUST show total elapsed time, per-level split times, and whether it is a new best time.

#### Scenario: Results on game over
- **WHEN** the game transitions to GAME_OVER in speed run mode
- **THEN** a speed run results screen is shown with total time, splits, and best time comparison

#### Scenario: New best time highlight
- **WHEN** the completed run is a new best time
- **THEN** the results screen highlights "NEW BEST!" prominently

#### Scenario: Exit from results
- **WHEN** the player presses Enter or Escape on the speed run results screen
- **THEN** the game returns to the title screen

### Requirement: Speed run HUD
The system SHALL display the running timer on the HUD during speed run gameplay. The timer MUST be visible in the HUD area and update every frame.

#### Scenario: Timer visible during gameplay
- **WHEN** the game is in PLAYING phase in speed run mode
- **THEN** the running timer is displayed on the HUD in MM:SS.mm format

#### Scenario: Timer paused indicator
- **WHEN** the game is paused in speed run mode
- **THEN** the timer display is frozen at the current elapsed time
