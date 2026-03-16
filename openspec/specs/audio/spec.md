## Purpose

Web Audio API sound effects and background audio for gameplay events, decoupled from game logic via a SoundManager interface.

## Requirements

### Requirement: SoundManager initialization
The system SHALL provide a SoundManager class that creates an AudioContext on first user interaction to comply with browser autoplay policy. The SoundManager MUST be initialized during the title screen "Press Enter" interaction.

#### Scenario: AudioContext creation
- **WHEN** the user presses Enter on the title screen for the first time
- **THEN** an AudioContext is created and resumed

#### Scenario: Subsequent interactions
- **WHEN** sounds are triggered after AudioContext is already created
- **THEN** the existing AudioContext is reused

### Requirement: Pellet eating sound
The system SHALL play a short "waka" tone when the player consumes a regular pellet. Each pellet consumption MUST trigger an individual sound.

#### Scenario: Regular pellet eaten
- **WHEN** the player moves onto a tile containing a regular pellet
- **THEN** a short oscillator-generated "waka" tone is played

### Requirement: Power pellet eating sound
The system SHALL play a distinct lower-pitched tone when the player consumes a power pellet. This tone MUST be distinguishable from the regular pellet sound.

#### Scenario: Power pellet eaten
- **WHEN** the player moves onto a tile containing a power pellet
- **THEN** a distinct lower-pitched tone is played

### Requirement: Ghost siren
The system SHALL play a continuous background siren during PLAYING phase. The siren pitch MUST change based on the number of remaining pellets (higher pitch as fewer pellets remain).

#### Scenario: Siren during gameplay
- **WHEN** the game transitions to PLAYING phase
- **THEN** a continuous siren tone begins playing

#### Scenario: Siren pitch changes
- **WHEN** pellets are consumed during gameplay
- **THEN** the siren pitch increases proportionally to pellets consumed

#### Scenario: Siren stops on phase change
- **WHEN** the game leaves PLAYING phase (death, pause, level complete)
- **THEN** the siren stops

### Requirement: Frightened mode sound
The system SHALL replace the siren with a distinct repeating tone during frightened state. The frightened sound MUST stop when frightened mode ends.

#### Scenario: Frightened sound replaces siren
- **WHEN** a power pellet is consumed and ghosts enter frightened mode
- **THEN** the siren is replaced with the frightened mode repeating tone

#### Scenario: Siren resumes after frightened
- **WHEN** frightened mode ends
- **THEN** the frightened sound stops and the siren resumes

### Requirement: Ghost eaten sound
The system SHALL play a rising tone when the player eats a frightened ghost.

#### Scenario: Ghost eaten
- **WHEN** the player collides with a frightened ghost
- **THEN** a rising oscillator tone is played

### Requirement: Death sound
The system SHALL play a descending tone sequence when the player dies.

#### Scenario: Player death
- **WHEN** the player is killed by a ghost
- **THEN** a descending tone sequence is played

### Requirement: Level complete sound
The system SHALL play an ascending celebratory tone when a level is completed.

#### Scenario: Level cleared
- **WHEN** all pellets on a level are consumed
- **THEN** an ascending tone sequence is played

### Requirement: Game start sound
The system SHALL play a brief jingle when transitioning from READY to PLAYING phase.

#### Scenario: Game begins
- **WHEN** the READY countdown finishes and game transitions to PLAYING
- **THEN** a brief start jingle is played

### Requirement: Audio event decoupling
Audio events SHALL be triggered via callback methods on a SoundManager instance, keeping game logic decoupled from audio. Game logic modules MUST NOT directly reference AudioContext or oscillator nodes.

#### Scenario: Game logic triggers sound
- **WHEN** a game event occurs (pellet eaten, ghost eaten, death, etc.)
- **THEN** the corresponding SoundManager method is called without game logic depending on Web Audio API

#### Scenario: Testing without audio
- **WHEN** game logic is tested without a SoundManager
- **THEN** all game logic tests pass without requiring AudioContext or audio mocking
