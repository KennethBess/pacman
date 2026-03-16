## Purpose

Fixed-timestep game loop with `requestAnimationFrame`, state/render separation.

## Requirements

### Requirement: Fixed-timestep update loop
The game SHALL run updates at a fixed timestep (60 Hz) independent of the display refresh rate. The update function MUST receive a constant `dt` value.

#### Scenario: Consistent updates across frame rates
- **WHEN** the game runs on a 144 Hz display
- **THEN** the game logic updates exactly 60 times per second, with rendering interpolated between states

#### Scenario: Slow frame recovery
- **WHEN** a frame takes longer than expected (e.g., tab backgrounded)
- **THEN** the loop caps accumulated time to prevent spiral-of-death (max 10 updates per frame)

### Requirement: State and render separation
The update step SHALL modify game state only. The render step SHALL read game state and draw to canvas without mutating state.

#### Scenario: Render is pure read
- **WHEN** the render function executes
- **THEN** no game state values are changed

### Requirement: Loop lifecycle
The game loop SHALL support pause and resume without losing or duplicating game state.

#### Scenario: Pause and resume
- **WHEN** the game is paused and then resumed
- **THEN** the game continues from exactly where it left off with no extra updates applied
