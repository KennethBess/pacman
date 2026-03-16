## Purpose

Bonus fruit items that appear during gameplay for extra points, with level-specific types, random placement, and timed despawn.

## Requirements

### Requirement: Fruit spawning
A bonus fruit SHALL appear at a random walkable tile after a random cooldown interval (default: 15-30 seconds). Fruit MUST continue to spawn throughout the level — after each despawn or collection, a new cooldown begins.

#### Scenario: Fruit spawns after cooldown
- **WHEN** the spawn cooldown timer expires during gameplay
- **THEN** a fruit item appears at a random walkable tile in the maze

#### Scenario: No fruit when already active
- **WHEN** a fruit is already present on the maze
- **THEN** no additional fruit is spawned until the current one despawns or is collected

#### Scenario: Random placement
- **WHEN** a fruit spawns
- **THEN** it appears at a random walkable tile (not a wall, ghost house, ghost door, or tunnel)

### Requirement: Fruit collection
The player SHALL collect a fruit by occupying the same tile as the fruit. Collecting a fruit MUST award points based on the fruit type and remove the fruit from the maze.

#### Scenario: Player collects fruit
- **WHEN** the player occupies the fruit tile while a fruit is active
- **THEN** the fruit is removed and the fruit's point value is added to the score

#### Scenario: New cooldown after collection
- **WHEN** the player collects a fruit
- **THEN** a new random spawn cooldown begins

### Requirement: Fruit despawn timer
An uncollected fruit SHALL disappear after a configurable duration (default: 10 seconds). A new spawn cooldown MUST begin after despawn.

#### Scenario: Fruit times out
- **WHEN** a fruit has been on the maze for the configured despawn duration without being collected
- **THEN** the fruit is removed from the maze with no score awarded and a new spawn cooldown begins

### Requirement: Level-specific fruit types
Each level SHALL have a specific fruit type with a distinct point value. The fruit type MUST be determined by the current level number.

#### Scenario: Level 1 fruit
- **WHEN** a fruit spawns on level 1
- **THEN** the fruit is a cherry worth 100 points

#### Scenario: Level 3 fruit
- **WHEN** a fruit spawns on level 3
- **THEN** the fruit is an orange worth 500 points

#### Scenario: Levels beyond fruit table
- **WHEN** a fruit spawns on a level beyond the last defined fruit type
- **THEN** the last fruit type in the table is used
