## Purpose

Tile-based maze data structure, wall rendering, tunnel wrapping, pellet placement.

## Requirements

### Requirement: Tile-based maze structure
The maze SHALL be represented as a 2D grid of tiles. Each tile MUST have a type: wall, path, pellet, power-pellet, tunnel, ghost-house, or ghost-door.

#### Scenario: Tile lookup
- **WHEN** a position in tile coordinates is queried
- **THEN** the maze returns the tile type at that position

#### Scenario: Out-of-bounds query
- **WHEN** a position outside the grid is queried
- **THEN** the maze returns wall (impassable)

### Requirement: Pellet tracking
The maze SHALL track which pellet and power-pellet tiles have been consumed. It MUST report the total and remaining pellet counts.

#### Scenario: Pellet consumed
- **WHEN** the player occupies a pellet tile
- **THEN** that tile is marked as consumed and the remaining count decreases by one

#### Scenario: All pellets consumed
- **WHEN** the remaining pellet count reaches zero
- **THEN** the maze reports level complete

### Requirement: Tunnel wrapping
The maze SHALL have tunnel tiles on opposite edges. An entity moving through a tunnel MUST wrap to the corresponding tile on the other side.

#### Scenario: Player enters tunnel
- **WHEN** the player moves past the left tunnel entrance
- **THEN** the player appears at the right tunnel exit, continuing in the same direction

### Requirement: Original maze layout
The maze layout MUST be an original design, not a copy of any copyrighted maze. The layout SHALL be defined as a configuration data structure.

#### Scenario: Maze data loads
- **WHEN** the game initializes
- **THEN** the maze is populated from the layout configuration with walls, paths, pellets, ghost house, and tunnels
