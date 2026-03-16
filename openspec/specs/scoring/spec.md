## Purpose

Pellet points, power pellet points, ghost combo multiplier, score tracking and display.

## Requirements

### Requirement: Pellet scoring
The game SHALL award points for pellet collection. Regular pellets and power pellets MUST have configurable point values.

#### Scenario: Regular pellet collected
- **WHEN** the player consumes a regular pellet
- **THEN** the score increases by the configured pellet value (default: 10)

#### Scenario: Power pellet collected
- **WHEN** the player consumes a power pellet
- **THEN** the score increases by the configured power pellet value (default: 50)

#### Scenario: Fruit collected
- **WHEN** the player collects a bonus fruit
- **THEN** the score increases by the fruit type's configured point value

### Requirement: Ghost combo multiplier
Eating consecutive ghosts during a single frightened period SHALL award escalating points: 200, 400, 800, 1600. The multiplier MUST reset when the frightened period ends.

#### Scenario: First ghost eaten
- **WHEN** the player eats the first ghost during a frightened period
- **THEN** the score increases by 200

#### Scenario: Consecutive ghost eaten
- **WHEN** the player eats the third ghost in the same frightened period
- **THEN** the score increases by 800

#### Scenario: Multiplier resets
- **WHEN** a new power pellet is consumed (starting a new frightened period)
- **THEN** the ghost combo multiplier resets to the first tier (200)

### Requirement: Extra life by score
The game SHALL award an extra life when the score reaches a configurable threshold (default: 10,000).

#### Scenario: Extra life awarded
- **WHEN** the score crosses the extra life threshold for the first time
- **THEN** the player gains one additional life

### Requirement: Score display
The current score MUST be displayed on screen at all times during gameplay.

#### Scenario: Score visible during play
- **WHEN** the game is in playing state
- **THEN** the current score is rendered on the canvas HUD
