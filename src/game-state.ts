import {
  INITIAL_LIVES,
  READY_DURATION,
  DYING_DURATION,
  LEVEL_COMPLETE_DURATION,
  getLevelConfig,
} from "./config";
import {
  GamePhase,
  GameMode,
  GhostName,
  GhostState,
  TileType,
  Direction,
  InitialsEntry,
  SpeedRunTimer,
} from "./types";
import { Maze } from "./maze";
import {
  PlayerState,
  createPlayer,
  resetPlayer,
  updatePlayer,
  setPlayerDirection,
} from "./player";
import {
  GhostData,
  resetGhost,
  updateGhost,
  enterFrightened,
  createWaveTimer,
  updateWaveTimer,
  WaveTimer,
} from "./ghost";
import {
  ScoreState,
  createScoreState,
  addPelletScore,
  addGhostScore,
  checkExtraLife,
  resetGhostCombo,
} from "./scoring";
import {
  HighScoreEntry,
  loadHighScores,
  addHighScore,
  scoreQualifies,
} from "./ui/high-scores";
import {
  FruitState,
  createFruitState,
  updateFruit,
  collectFruit,
} from "./fruit";
import { addFruitScore } from "./scoring";
import { createShadow } from "./ghosts/shadow";
import { createSpeedy } from "./ghosts/speedy";
import { createBashful } from "./ghosts/bashful";
import { createPokey } from "./ghosts/pokey";
import {
  createSpeedRunTimer,
  startTimer,
  pauseTimer,
  updateTimer,
  recordSplit,
  resetTimer,
  saveBestTime,
  getBestTime,
} from "./speed-run";

export interface GameState {
  phase: GamePhase;
  phaseTimer: number;
  level: number;
  lives: number;
  mode: GameMode;
  maze: Maze;
  player: PlayerState;
  ghosts: GhostData[];
  score: ScoreState;
  waveTimer: WaveTimer;
  fruit: FruitState;
  highScores: HighScoreEntry[];
  initialsEntry: InitialsEntry | null;
  speedRunTimer: SpeedRunTimer;
  speedRunBestTime: number | null;
}

export function createGameState(): GameState {
  return {
    phase: GamePhase.TITLE_SCREEN,
    phaseTimer: 0,
    level: 1,
    lives: INITIAL_LIVES,
    mode: GameMode.CLASSIC,
    maze: new Maze(),
    player: createPlayer(getLevelConfig(1).playerSpeedMultiplier),
    ghosts: [createShadow(), createSpeedy(), createBashful(), createPokey()],
    score: createScoreState(),
    waveTimer: createWaveTimer(),
    fruit: createFruitState(),
    highScores: loadHighScores(),
    initialsEntry: null,
    speedRunTimer: createSpeedRunTimer(),
    speedRunBestTime: null,
  };
}

function initNewGame(state: GameState, mode: GameMode = GameMode.CLASSIC): void {
  const levelConfig = getLevelConfig(1);
  state.phase = GamePhase.READY;
  state.phaseTimer = READY_DURATION;
  state.level = 1;
  state.lives = INITIAL_LIVES;
  state.mode = mode;
  state.maze = new Maze();
  state.player = createPlayer(levelConfig.playerSpeedMultiplier);
  state.ghosts = [createShadow(), createSpeedy(), createBashful(), createPokey()];
  state.score = createScoreState();
  state.waveTimer = createWaveTimer();
  state.fruit = createFruitState();
  state.initialsEntry = null;
  resetTimer(state.speedRunTimer);
  state.speedRunBestTime = mode === GameMode.SPEED_RUN ? getBestTime(1) : null;
}

function createInitialsEntry(): InitialsEntry {
  return { currentIndex: 0, characters: ["A", "A", "A"], confirmed: false };
}

function resetEntities(state: GameState): void {
  const levelConfig = getLevelConfig(state.level);
  resetPlayer(state.player, levelConfig.playerSpeedMultiplier);
  for (const ghost of state.ghosts) {
    resetGhost(ghost);
  }
  state.waveTimer = createWaveTimer();
  state.fruit = createFruitState();
}

function getShadowTile(state: GameState) {
  const shadow = state.ghosts.find((g) => g.name === GhostName.SHADOW);
  return shadow ? shadow.tile : state.player.tile;
}

function checkPlayerGhostCollision(
  state: GameState,
  audio?: AudioCallbacks,
): void {
  for (const ghost of state.ghosts) {
    if (
      ghost.state === GhostState.IN_HOUSE ||
      ghost.state === GhostState.LEAVING_HOUSE ||
      ghost.state === GhostState.EATEN
    ) {
      continue;
    }

    if (
      ghost.tile.x === state.player.tile.x &&
      ghost.tile.y === state.player.tile.y
    ) {
      if (ghost.state === GhostState.FRIGHTENED) {
        // Eat the ghost
        ghost.state = GhostState.EATEN;
        addGhostScore(state.score);
        audio?.onGhostEaten?.();
      } else {
        // Player dies
        state.player.alive = false;
        state.phase = GamePhase.DYING;
        state.phaseTimer = DYING_DURATION;
        if (state.mode === GameMode.SPEED_RUN) {
          pauseTimer(state.speedRunTimer);
        }
        audio?.onStopSiren?.();
        audio?.onStopFrightened?.();
        audio?.onDeath?.();
      }
    }
  }
}

function handleInitialsInput(
  state: GameState,
  letterInput: string | null,
  confirmRequested: boolean,
): void {
  const entry = state.initialsEntry;
  if (!entry || entry.confirmed) return;

  if (letterInput) {
    entry.characters[entry.currentIndex] = letterInput.toUpperCase();
    if (entry.currentIndex < 2) {
      entry.currentIndex++;
    }
  } else if (confirmRequested) {
    if (entry.currentIndex < 2) {
      entry.currentIndex++;
    } else {
      entry.confirmed = true;
      state.highScores = addHighScore(state.highScores, {
        name: entry.characters.join(""),
        score: state.score.score,
        level: state.level,
      });
    }
  }
}

export interface AudioCallbacks {
  onPelletEat?: () => void;
  onPowerPelletEat?: () => void;
  onGhostEaten?: () => void;
  onDeath?: () => void;
  onLevelComplete?: () => void;
  onGameStart?: () => void;
  onStartSiren?: (pelletRatio: number) => void;
  onStopSiren?: () => void;
  onStartFrightened?: () => void;
  onStopFrightened?: () => void;
  onPauseAudio?: () => void;
  onResumeAudio?: (pelletRatio: number) => void;
}

export interface GameInput {
  direction: Direction | null;
  pauseRequested: boolean;
  startRequested: boolean;
  escapeRequested: boolean;
  letterInput: string | null;
  speedRunRequested: boolean;
}

function getPelletRatio(maze: Maze): number {
  const total = maze.getTotalPellets();
  if (total === 0) return 0;
  return maze.getRemainingPellets() / total;
}

export function updateGameState(
  state: GameState,
  dt: number,
  inputDirection: Direction | null,
  pauseRequested: boolean,
  extra?: Partial<Pick<GameInput, "startRequested" | "escapeRequested" | "letterInput" | "speedRunRequested">>,
  audio?: AudioCallbacks,
): void {
  const startRequested = extra?.startRequested ?? false;
  const escapeRequested = extra?.escapeRequested ?? false;
  const letterInput = extra?.letterInput ?? null;
  const speedRunRequested = extra?.speedRunRequested ?? false;

  switch (state.phase) {
    case GamePhase.TITLE_SCREEN: {
      if (startRequested) {
        initNewGame(state, GameMode.CLASSIC);
      } else if (speedRunRequested) {
        initNewGame(state, GameMode.SPEED_RUN);
      }
      break;
    }

    case GamePhase.READY: {
      state.phaseTimer -= dt;
      if (state.phaseTimer <= 0) {
        state.phase = GamePhase.PLAYING;
        if (state.mode === GameMode.SPEED_RUN) {
          startTimer(state.speedRunTimer);
        }
        audio?.onGameStart?.();
        audio?.onStartSiren?.(getPelletRatio(state.maze));
      }
      break;
    }

    case GamePhase.PLAYING: {
      if (pauseRequested) {
        state.phase = GamePhase.PAUSED;
        if (state.mode === GameMode.SPEED_RUN) {
          pauseTimer(state.speedRunTimer);
        }
        audio?.onPauseAudio?.();
        return;
      }

      // Update speed run timer
      if (state.mode === GameMode.SPEED_RUN) {
        updateTimer(state.speedRunTimer, dt);
      }

      // Handle input
      if (inputDirection !== null) {
        setPlayerDirection(state.player, inputDirection);
      }

      // Update wave timer
      const waveChanged = updateWaveTimer(state.waveTimer, dt);
      if (waveChanged) {
        for (const ghost of state.ghosts) {
          if (
            ghost.state === GhostState.SCATTER ||
            ghost.state === GhostState.CHASE
          ) {
            ghost.state = state.waveTimer.isScatter
              ? GhostState.SCATTER
              : GhostState.CHASE;
            ghost.direction =
              ghost.direction === Direction.UP
                ? Direction.UP
                : ghost.direction;
          }
        }
      }

      // Track if any ghost was frightened before this frame
      const hadFrightened = state.ghosts.some(
        (g) => g.state === GhostState.FRIGHTENED,
      );

      // Update player
      const result = updatePlayer(state.player, state.maze, dt);

      // Handle pellet consumption
      if (result.consumedPellet !== null) {
        addPelletScore(state.score, result.consumedPellet);

        if (result.consumedPellet === TileType.POWER_PELLET) {
          audio?.onPowerPelletEat?.();
          const levelConfig = getLevelConfig(state.level);
          resetGhostCombo(state.score);
          for (const ghost of state.ghosts) {
            enterFrightened(ghost, levelConfig.frightenedDuration);
          }
          // Switch siren to frightened sound
          audio?.onStopSiren?.();
          audio?.onStartFrightened?.();
        } else {
          audio?.onPelletEat?.();
        }

        // Check extra life
        if (checkExtraLife(state.score)) {
          state.lives++;
        }

        // Check level complete
        if (state.maze.isLevelComplete()) {
          state.phase = GamePhase.LEVEL_COMPLETE;
          state.phaseTimer = LEVEL_COMPLETE_DURATION;
          if (state.mode === GameMode.SPEED_RUN) {
            pauseTimer(state.speedRunTimer);
            recordSplit(state.speedRunTimer, state.level);
          }
          audio?.onStopSiren?.();
          audio?.onStopFrightened?.();
          audio?.onLevelComplete?.();
          return;
        }
      }

      // Update fruit (spawn cooldown / despawn timer)
      updateFruit(state.fruit, dt, state.level, state.maze);

      // Check player-fruit collision
      if (
        state.fruit.active &&
        state.player.tile.x === state.fruit.tile.x &&
        state.player.tile.y === state.fruit.tile.y
      ) {
        const fruitPoints = collectFruit(state.fruit);
        if (fruitPoints > 0) {
          addFruitScore(state.score, fruitPoints);
          if (checkExtraLife(state.score)) {
            state.lives++;
          }
        }
      }

      // Update ghosts
      const shadowTile = getShadowTile(state);
      const levelConfig = getLevelConfig(state.level);
      for (const ghost of state.ghosts) {
        updateGhost(
          ghost,
          state.maze,
          state.player.tile,
          state.player.direction,
          shadowTile,
          dt,
          state.waveTimer.isScatter,
          levelConfig.ghostSpeedMultiplier,
        );
      }

      // Check if frightened mode just ended (all ghosts no longer frightened)
      const hasFrightened = state.ghosts.some(
        (g) => g.state === GhostState.FRIGHTENED,
      );
      if (hadFrightened && !hasFrightened) {
        audio?.onStopFrightened?.();
        audio?.onStartSiren?.(getPelletRatio(state.maze));
      }

      // Check collisions
      checkPlayerGhostCollision(state, audio);
      break;
    }

    case GamePhase.DYING: {
      state.phaseTimer -= dt;
      if (state.phaseTimer <= 0) {
        state.lives--;
        if (state.lives <= 0) {
          state.phase = GamePhase.GAME_OVER;
          if (state.mode === GameMode.SPEED_RUN) {
            saveBestTime(
              state.speedRunTimer.splits.length,
              state.speedRunTimer.elapsed,
            );
            state.speedRunBestTime = getBestTime(
              state.speedRunTimer.splits.length,
            );
          } else if (scoreQualifies(state.highScores, state.score.score)) {
            state.initialsEntry = createInitialsEntry();
          }
        } else {
          resetEntities(state);
          state.phase = GamePhase.READY;
          state.phaseTimer = READY_DURATION;
        }
      }
      break;
    }

    case GamePhase.PAUSED: {
      if (pauseRequested) {
        state.phase = GamePhase.PLAYING;
        if (state.mode === GameMode.SPEED_RUN) {
          startTimer(state.speedRunTimer);
        }
        audio?.onResumeAudio?.(getPelletRatio(state.maze));
      }
      break;
    }

    case GamePhase.LEVEL_COMPLETE: {
      state.phaseTimer -= dt;
      if (state.phaseTimer <= 0) {
        state.level++;
        state.maze.reset();
        resetEntities(state);
        state.phase = GamePhase.READY;
        state.phaseTimer = READY_DURATION;
      }
      break;
    }

    case GamePhase.GAME_OVER: {
      if (state.initialsEntry && !state.initialsEntry.confirmed) {
        handleInitialsInput(state, letterInput, startRequested);
      } else if (escapeRequested || startRequested) {
        if (startRequested) {
          initNewGame(state);
        } else {
          state.phase = GamePhase.TITLE_SCREEN;
          state.initialsEntry = null;
          state.highScores = loadHighScores();
        }
      }
      break;
    }
  }
}
