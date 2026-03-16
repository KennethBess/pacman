## Purpose

High score persistence, ranking, and display for the game.

## Requirements

### Requirement: High score persistence
The game SHALL persist high scores to localStorage. Scores MUST be stored as a JSON array under a consistent key. The system MUST handle localStorage being unavailable gracefully.

#### Scenario: Save high score
- **WHEN** a player's score qualifies for the top 10 and initials are entered
- **THEN** the score entry is saved to localStorage

#### Scenario: Load high scores
- **WHEN** the high score table is displayed
- **THEN** scores are loaded from localStorage and displayed in descending order

#### Scenario: localStorage unavailable
- **WHEN** localStorage is not available (e.g., private browsing restrictions)
- **THEN** the game operates normally with an empty high score table and no save errors

### Requirement: High score ranking
The high score table SHALL maintain a maximum of 10 entries, sorted by score in descending order. A new score MUST qualify if it exceeds the lowest score in a full table or if the table has fewer than 10 entries.

#### Scenario: Score qualifies for table
- **WHEN** the player's score is higher than the 10th entry (or fewer than 10 entries exist)
- **THEN** the score qualifies for the high score table

#### Scenario: Table full and score too low
- **WHEN** the table has 10 entries and the player's score is not higher than any
- **THEN** the score does not qualify and no initials entry is shown

### Requirement: High score display
The high score table SHALL be visible on the title screen. Each entry MUST show rank, initials, score, and level reached.

#### Scenario: High score table on title screen
- **WHEN** the title screen is displayed
- **THEN** the high score table is rendered showing up to 10 entries

#### Scenario: Empty high score table
- **WHEN** the title screen is displayed and no scores exist
- **THEN** the high score table area shows a placeholder message
