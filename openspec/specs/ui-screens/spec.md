## Purpose

Title screen, pause overlay, and screen flow management for the game UI.

## Requirements

### Requirement: Title screen
The game SHALL display a title screen on initial load. The title screen MUST show the game title, a "Press Enter to Start" prompt, and an animated element. The game MUST NOT begin gameplay until the player presses Enter.

#### Scenario: Title screen on load
- **WHEN** the game first loads
- **THEN** the title screen is displayed with the game title and start prompt

#### Scenario: Start game from title
- **WHEN** the player presses Enter on the title screen
- **THEN** the game transitions to the READY phase and gameplay begins

#### Scenario: Animated title element
- **WHEN** the title screen is displayed
- **THEN** an animated element (pulsing text or moving entity) is visible to indicate the game is active

### Requirement: Pause overlay
The pause screen SHALL display a semi-transparent backdrop over the game area with "PAUSED" text and a "Press P to Resume" prompt.

#### Scenario: Pause overlay appearance
- **WHEN** the game is in PAUSED phase
- **THEN** a semi-transparent dark overlay covers the maze area with centered pause text

#### Scenario: Resume prompt visible
- **WHEN** the game is paused
- **THEN** a "Press P to Resume" prompt is displayed below the pause text

### Requirement: Game-over screen
The game-over screen SHALL display "GAME OVER", the player's final score, and options to return to the title screen or restart. If the score qualifies for the high score table, initials entry MUST be shown first.

#### Scenario: Game-over with high score
- **WHEN** the game ends and the score qualifies for the high score table
- **THEN** an initials entry prompt is displayed before showing restart options

#### Scenario: Game-over without high score
- **WHEN** the game ends and the score does not qualify for the high score table
- **THEN** the game-over screen shows final score with restart and menu options

#### Scenario: Return to title from game-over
- **WHEN** the player presses Escape on the game-over screen
- **THEN** the game returns to the title screen

### Requirement: Initials entry
The initials entry system SHALL allow the player to enter 3 characters for the high score table. Each character position MUST cycle through A-Z using up/down arrows or direct letter key input. Enter MUST confirm each character.

#### Scenario: Letter cycling
- **WHEN** the player presses up/down arrow during initials entry
- **THEN** the current character position cycles through A-Z

#### Scenario: Direct letter input
- **WHEN** the player presses a letter key during initials entry
- **THEN** the current character is set to that letter and advances to the next position

#### Scenario: Confirm initials
- **WHEN** the player has entered 3 characters and presses Enter
- **THEN** the initials are saved with the score to the high score table
