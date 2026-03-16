## MODIFIED Requirements

### Requirement: Title screen
The game SHALL display a title screen on initial load. The title screen MUST show the game title, a mode selection with "Press ENTER — Classic" and "Press S — Speed Run", and an animated element. If a speed run best time exists, it MUST be displayed on the title screen. The game MUST NOT begin gameplay until the player selects a mode.

#### Scenario: Title screen on load
- **WHEN** the game first loads
- **THEN** the title screen is displayed with the game title and mode selection

#### Scenario: Start classic mode from title
- **WHEN** the player presses Enter on the title screen
- **THEN** the game transitions to the READY phase in classic mode

#### Scenario: Start speed run from title
- **WHEN** the player presses S on the title screen
- **THEN** the game transitions to the READY phase in speed run mode

#### Scenario: Animated title element
- **WHEN** the title screen is displayed
- **THEN** an animated element (pulsing text or moving entity) is visible to indicate the game is active

#### Scenario: Best time shown on title
- **WHEN** a speed run best time exists in localStorage
- **THEN** the best time is displayed on the title screen

### Requirement: Game-over screen
The game-over screen SHALL display "GAME OVER", the player's final score, and options to return to the title screen or restart. If the score qualifies for the high score table, initials entry MUST be shown first. In speed run mode, the game-over screen SHALL instead show speed run results (total time, splits, best time comparison) without initials entry.

#### Scenario: Game-over with high score (classic)
- **WHEN** the game ends in classic mode and the score qualifies for the high score table
- **THEN** an initials entry prompt is displayed before showing restart options

#### Scenario: Game-over without high score (classic)
- **WHEN** the game ends in classic mode and the score does not qualify for the high score table
- **THEN** the game-over screen shows final score with restart and menu options

#### Scenario: Game-over in speed run mode
- **WHEN** the game ends in speed run mode
- **THEN** speed run results are shown (total time, per-level splits, new best indicator)

#### Scenario: Return to title from game-over
- **WHEN** the player presses Escape on the game-over screen
- **THEN** the game returns to the title screen
