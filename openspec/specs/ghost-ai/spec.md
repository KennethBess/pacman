## Purpose

Four ghosts with unique chase targeting, scatter/frightened/respawn state machines, release timing.

## Requirements

### Requirement: Ghost state machine
Each ghost SHALL have a finite state machine with states: IN_HOUSE, LEAVING_HOUSE, SCATTER, CHASE, FRIGHTENED, EATEN. Transitions MUST be driven by game events and timers.

#### Scenario: Scatter-chase wave transitions
- **WHEN** the scatter timer expires
- **THEN** all non-frightened, non-eaten ghosts transition from SCATTER to CHASE

#### Scenario: Power pellet triggers frightened
- **WHEN** the player consumes a power pellet
- **THEN** all ghosts in SCATTER or CHASE state transition to FRIGHTENED and reverse direction

#### Scenario: Frightened timer expires
- **WHEN** the frightened duration elapses
- **THEN** frightened ghosts return to the current wave state (SCATTER or CHASE)

#### Scenario: Ghost eaten
- **WHEN** the player collides with a FRIGHTENED ghost
- **THEN** that ghost transitions to EATEN and moves toward the ghost house

#### Scenario: Ghost reaches house while eaten
- **WHEN** an EATEN ghost reaches the ghost house entrance
- **THEN** the ghost transitions to IN_HOUSE and begins the respawn sequence

### Requirement: Unique chase targeting
Each of the four ghosts MUST have a distinct targeting algorithm during CHASE state.

#### Scenario: Shadow targets player directly
- **WHEN** Shadow (red) is in CHASE state
- **THEN** Shadow's target tile is the player's current tile

#### Scenario: Speedy targets ahead of player
- **WHEN** Speedy (pink) is in CHASE state
- **THEN** Speedy's target tile is 4 tiles ahead of the player's facing direction

#### Scenario: Bashful uses vector doubling
- **WHEN** Bashful (blue) is in CHASE state
- **THEN** Bashful's target tile is computed by doubling the vector from Shadow's position to 2 tiles ahead of the player

#### Scenario: Pokey switches between chase and scatter
- **WHEN** Pokey (orange) is in CHASE state and more than 8 tiles from the player
- **THEN** Pokey targets the player's current tile
- **WHEN** Pokey is in CHASE state and within 8 tiles of the player
- **THEN** Pokey targets its scatter corner instead

### Requirement: Ghost pathfinding
Ghosts SHALL choose direction at each intersection by selecting the option that minimizes straight-line distance to their target tile. Ghosts MUST NOT reverse direction except when transitioning to FRIGHTENED state.

#### Scenario: Intersection decision
- **WHEN** a ghost reaches an intersection with multiple valid paths
- **THEN** the ghost chooses the direction whose next tile is closest to its target tile

#### Scenario: No reversal rule
- **WHEN** a ghost reaches an intersection
- **THEN** the ghost does not consider the direction it came from as a valid option

### Requirement: Ghost release timing
Ghosts SHALL be released from the ghost house on a timed schedule. The release order and timing MUST be configurable.

#### Scenario: Staggered release
- **WHEN** a new level or life begins
- **THEN** ghosts are released from the house one at a time according to configured delays

### Requirement: Ghost speed variation
Ghost speed SHALL vary by state. FRIGHTENED ghosts MUST move slower than normal. EATEN ghosts MUST move faster. Tunnel tiles MUST reduce ghost speed.

#### Scenario: Frightened speed reduction
- **WHEN** a ghost is in FRIGHTENED state
- **THEN** the ghost moves at a reduced speed (configurable percentage of normal)

#### Scenario: Tunnel speed reduction
- **WHEN** a ghost is on a tunnel tile
- **THEN** the ghost moves at a reduced speed
