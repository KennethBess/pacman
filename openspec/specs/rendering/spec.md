## Purpose

Canvas 2D renderer for maze, player, ghosts, pellets, HUD, and animations.

## Requirements

### Requirement: Canvas 2D rendering
All game visuals SHALL be rendered to an HTML5 Canvas using the 2D rendering context. The canvas MUST be cleared and fully redrawn each frame.

#### Scenario: Frame render
- **WHEN** the render function is called
- **THEN** the canvas is cleared and all visible entities, maze tiles, and HUD are drawn

#### Scenario: Title screen render
- **WHEN** the game is in TITLE_SCREEN phase
- **THEN** the title screen is rendered with game title, high score table, and start prompt

#### Scenario: Pause overlay render
- **WHEN** the game is in PAUSED phase
- **THEN** a semi-transparent overlay is drawn over the game area with pause text

#### Scenario: Game-over screen render
- **WHEN** the game is in GAME_OVER phase
- **THEN** the game-over screen is rendered with final score and navigation options

#### Scenario: Initials entry render
- **WHEN** the player is entering initials on the game-over screen
- **THEN** the current initials entry state is rendered with the active character highlighted

### Requirement: Maze rendering
Walls SHALL be rendered with rounded corridor-style edges using neighbor-based tile analysis. Wall corners where walls meet paths SHALL use quadratic curves for rounding. Pellets SHALL be rendered as small circles. Power pellets SHALL be rendered as larger circles with a pulsing animation.

#### Scenario: Rounded wall edges
- **WHEN** the maze is rendered
- **THEN** wall tiles are drawn with rounded corners where walls meet paths, using quadratic curves

#### Scenario: Corridor-style walls
- **WHEN** a wall tile is rendered
- **THEN** its neighboring tiles are checked to determine which edges and corners to round

#### Scenario: Power pellet animation
- **WHEN** a power pellet is rendered
- **THEN** it visually pulses (alternating size or opacity) to distinguish it from regular pellets

### Requirement: Entity rendering
The player SHALL be rendered as a wedge shape with an animated opening/closing mouth that faces the movement direction. Each ghost SHALL be rendered with a dome-top body, two vertical sides, and a scalloped bottom edge (3 bumps using quadratic curves). Ghost eyes SHALL be white ovals with colored pupils offset in the movement direction. Frightened ghosts MUST render with a blue body and squiggly mouth line. Eaten ghosts MUST render as eyes only.

#### Scenario: Pac-Man mouth animation
- **WHEN** the player is rendered
- **THEN** the player is drawn as a wedge with mouth angle oscillating between 0° and 45° on a continuous sinusoidal cycle

#### Scenario: Pac-Man faces movement direction
- **WHEN** the player changes direction
- **THEN** the mouth opening rotates to face the current movement direction

#### Scenario: Ghost body shape
- **WHEN** a ghost is rendered in normal state
- **THEN** it is drawn with a dome-top arc, two vertical sides, and a scalloped bottom edge with 3 bumps using quadratic curves

#### Scenario: Ghost color by personality
- **WHEN** ghosts are rendered in normal state
- **THEN** each ghost has a distinct identifying color (red, pink, cyan, orange)

#### Scenario: Ghost eye pupils track direction
- **WHEN** a ghost is moving in a direction
- **THEN** the eye pupils are offset toward that direction within the white eye ovals

#### Scenario: Frightened ghost appearance
- **WHEN** a ghost is in FRIGHTENED state
- **THEN** it is rendered with a blue body, the scalloped bottom, and a squiggly mouth line, with a flashing effect near timeout

#### Scenario: Eaten ghost appearance
- **WHEN** a ghost is in EATEN state
- **THEN** only the ghost's eyes are rendered (white ovals with directional pupils)

#### Scenario: Fruit rendering
- **WHEN** a fruit is active on the maze
- **THEN** it is rendered as a colored circle at its tile position with the fruit type's color

### Requirement: HUD rendering
The HUD SHALL display the current score, remaining lives, current level number, and the current level's fruit type. Lives MUST be shown as player-colored icons.

#### Scenario: HUD elements visible
- **WHEN** the game is in any active state
- **THEN** score, lives count, level number, and fruit icon are rendered on the canvas outside the maze area

#### Scenario: Fruit icon in HUD
- **WHEN** the HUD is rendered
- **THEN** the current level's fruit type is shown as a colored icon

### Requirement: Death animation
The player SHALL play a collapse/shrink animation when dying instead of disappearing immediately. The animation SHALL play over the DYING phase duration.

#### Scenario: Death animation plays
- **WHEN** the game transitions to DYING phase
- **THEN** the player visually shrinks/collapses over the dying duration

#### Scenario: Death animation completes
- **WHEN** the DYING phase timer expires
- **THEN** the death animation has fully completed and the player is no longer visible

### Requirement: Interpolated entity positions
Entity positions MUST be interpolated between the last update and current update using the render loop's interpolation factor, ensuring smooth movement independent of update rate.

#### Scenario: Smooth movement
- **WHEN** an entity is between two tiles during render
- **THEN** it is drawn at the interpolated pixel position, not snapped to tile boundaries
