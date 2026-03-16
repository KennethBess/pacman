## Purpose

Grid-aligned player movement, input handling (keyboard/touch), collision with walls.

## Requirements

### Requirement: Grid-aligned movement
The player SHALL move tile-to-tile on the maze grid. Movement between tiles MUST be smooth (sub-tile interpolation) at a configurable speed.

#### Scenario: Move to adjacent tile
- **WHEN** the player presses a direction key and the adjacent tile in that direction is a path
- **THEN** the player moves smoothly to that tile

#### Scenario: Wall collision
- **WHEN** the player attempts to move into a wall tile
- **THEN** the player stops at the current tile and does not enter the wall

### Requirement: Input buffering
The player input system SHALL buffer the most recent direction input. When the player reaches a tile where the buffered direction is valid, it MUST turn automatically.

#### Scenario: Pre-turn buffering
- **WHEN** the player presses UP while moving RIGHT, and the next intersection allows UP
- **THEN** the player turns UP at that intersection without requiring precise timing

### Requirement: Keyboard input
The game SHALL accept arrow keys and WASD for directional input.

#### Scenario: Arrow key movement
- **WHEN** the user presses the right arrow key
- **THEN** the player's buffered direction is set to RIGHT

### Requirement: Touch input
The game SHALL accept swipe gestures for directional input on touch devices.

#### Scenario: Swipe to move
- **WHEN** the user swipes left on the canvas
- **THEN** the player's buffered direction is set to LEFT

### Requirement: Player collision with ghosts
The player SHALL detect overlap with ghost entities each update tick.

#### Scenario: Ghost collision while normal
- **WHEN** the player occupies the same tile as a ghost in CHASE or SCATTER state
- **THEN** a player death event is triggered

#### Scenario: Ghost collision while frightened
- **WHEN** the player occupies the same tile as a ghost in FRIGHTENED state
- **THEN** the ghost is eaten and a ghost-eaten event is triggered
