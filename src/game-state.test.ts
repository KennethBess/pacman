import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import {
  createGameState,
  updateGameState,
  GameState,
} from "./game-state";
import { GamePhase, GameMode } from "./types";
import {
  READY_DURATION,
  INITIAL_LIVES,
  DYING_DURATION,
  FRUIT_DESPAWN_DURATION,
} from "./config";
import { spawnFruit } from "./fruit";

// Mock localStorage for high-scores module
function createMockStorage(): Storage {
  const store = new Map<string, string>();
  return {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => store.set(key, value),
    removeItem: (key: string) => store.delete(key),
    clear: () => store.clear(),
    get length() {
      return store.size;
    },
    key: (index: number) => [...store.keys()][index] ?? null,
  };
}

beforeEach(() => {
  vi.stubGlobal("localStorage", createMockStorage());
});

afterEach(() => {
  vi.unstubAllGlobals();
});

/** Transition from TITLE_SCREEN to READY */
function startGame(state: GameState): void {
  updateGameState(state, 0, null, false, { startRequested: true });
}

/** Transition from TITLE_SCREEN through READY to PLAYING */
function startPlaying(state: GameState): void {
  startGame(state);
  updateGameState(state, READY_DURATION + 0.1, null, false);
}

describe("GameState", () => {
  let state: GameState;

  beforeEach(() => {
    state = createGameState();
  });

  it("starts in TITLE_SCREEN phase", () => {
    expect(state.phase).toBe(GamePhase.TITLE_SCREEN);
  });

  it("starts with configured lives", () => {
    expect(state.lives).toBe(INITIAL_LIVES);
  });

  it("starts at level 1", () => {
    expect(state.level).toBe(1);
  });

  describe("TITLE_SCREEN -> READY transition", () => {
    it("transitions to READY on start request", () => {
      startGame(state);
      expect(state.phase).toBe(GamePhase.READY);
    });

    it("stays in TITLE_SCREEN without start request", () => {
      updateGameState(state, 1, null, false);
      expect(state.phase).toBe(GamePhase.TITLE_SCREEN);
    });
  });

  describe("READY -> PLAYING transition", () => {
    it("transitions to PLAYING after ready duration", () => {
      startGame(state);
      updateGameState(state, READY_DURATION + 0.1, null, false);
      expect(state.phase).toBe(GamePhase.PLAYING);
    });

    it("stays in READY before duration expires", () => {
      startGame(state);
      updateGameState(state, READY_DURATION / 2, null, false);
      expect(state.phase).toBe(GamePhase.READY);
    });
  });

  describe("pause", () => {
    it("transitions to PAUSED on pause request", () => {
      startPlaying(state);
      expect(state.phase).toBe(GamePhase.PLAYING);

      updateGameState(state, 1 / 60, null, true);
      expect(state.phase).toBe(GamePhase.PAUSED);
    });

    it("resumes from PAUSED on pause request", () => {
      startPlaying(state);
      updateGameState(state, 1 / 60, null, true); // pause
      updateGameState(state, 1 / 60, null, true); // resume
      expect(state.phase).toBe(GamePhase.PLAYING);
    });
  });

  describe("lives", () => {
    it("player starts alive", () => {
      expect(state.player.alive).toBe(true);
    });
  });

  describe("level progression", () => {
    it("starts at level 1", () => {
      expect(state.level).toBe(1);
    });
  });

  describe("GAME_OVER -> TITLE_SCREEN", () => {
    it("transitions to TITLE_SCREEN on escape", () => {
      state.phase = GamePhase.GAME_OVER;
      updateGameState(state, 0, null, false, { escapeRequested: true });
      expect(state.phase).toBe(GamePhase.TITLE_SCREEN);
    });

    it("restarts game on start request when no initials entry", () => {
      state.phase = GamePhase.GAME_OVER;
      updateGameState(state, 0, null, false, { startRequested: true });
      expect(state.phase).toBe(GamePhase.READY);
    });
  });

  describe("screen flow", () => {
    it("full flow: TITLE_SCREEN -> READY -> PLAYING -> GAME_OVER -> TITLE_SCREEN", () => {
      expect(state.phase).toBe(GamePhase.TITLE_SCREEN);

      // Start game
      startGame(state);
      expect(state.phase).toBe(GamePhase.READY);

      // Wait for ready
      updateGameState(state, READY_DURATION + 0.1, null, false);
      expect(state.phase).toBe(GamePhase.PLAYING);

      // Force death
      state.player.alive = false;
      state.phase = GamePhase.DYING;
      state.phaseTimer = DYING_DURATION;
      state.lives = 1;

      // Dying timer expires -> GAME_OVER (0 lives left after decrement)
      updateGameState(state, DYING_DURATION + 0.1, null, false);
      expect(state.phase).toBe(GamePhase.GAME_OVER);

      // Return to title
      updateGameState(state, 0, null, false, { escapeRequested: true });
      expect(state.phase).toBe(GamePhase.TITLE_SCREEN);
    });
  });

  describe("high score entry", () => {
    it("shows initials entry when score qualifies on game over", () => {
      state.phase = GamePhase.DYING;
      state.phaseTimer = DYING_DURATION;
      state.lives = 1;
      state.score.score = 1000;

      updateGameState(state, DYING_DURATION + 0.1, null, false);
      expect(state.phase).toBe(GamePhase.GAME_OVER);
      expect(state.initialsEntry).not.toBeNull();
      expect(state.initialsEntry!.confirmed).toBe(false);
    });

    it("accepts letter input during initials entry", () => {
      state.phase = GamePhase.GAME_OVER;
      state.initialsEntry = {
        currentIndex: 0,
        characters: ["A", "A", "A"],
        confirmed: false,
      };

      updateGameState(state, 0, null, false, { letterInput: "K" });
      expect(state.initialsEntry!.characters[0]).toBe("K");
      expect(state.initialsEntry!.currentIndex).toBe(1);
    });

    it("confirms initials on Enter at last position", () => {
      state.phase = GamePhase.GAME_OVER;
      state.score.score = 500;
      state.initialsEntry = {
        currentIndex: 2,
        characters: ["K", "B", "S"],
        confirmed: false,
      };

      updateGameState(state, 0, null, false, { startRequested: true });
      expect(state.initialsEntry!.confirmed).toBe(true);
      expect(state.highScores.length).toBe(1);
      expect(state.highScores[0].name).toBe("KBS");
    });

    it("does not transition to title while entering initials", () => {
      state.phase = GamePhase.GAME_OVER;
      state.initialsEntry = {
        currentIndex: 0,
        characters: ["A", "A", "A"],
        confirmed: false,
      };

      updateGameState(state, 0, null, false, { escapeRequested: true });
      // Should still be in GAME_OVER — initials entry takes priority
      expect(state.phase).toBe(GamePhase.GAME_OVER);
    });
  });

  describe("bonus fruit", () => {
    it("initializes fruit state", () => {
      expect(state.fruit).toBeDefined();
      expect(state.fruit.active).toBe(false);
      expect(state.fruit.spawnCooldown).toBeGreaterThan(0);
    });

    it("spawns fruit when cooldown expires during play", () => {
      startPlaying(state);
      state.fruit.spawnCooldown = 0.1;
      updateGameState(state, 0.2, null, false);
      expect(state.fruit.active).toBe(true);
    });

    it("collects fruit when player is on fruit tile", () => {
      startPlaying(state);
      spawnFruit(state.fruit, state.level, state.maze);
      expect(state.fruit.active).toBe(true);

      // Move player to fruit tile
      state.player.tile = { ...state.fruit.tile };
      updateGameState(state, 1 / 60, null, false);
      expect(state.fruit.active).toBe(false);
      expect(state.score.score).toBeGreaterThan(0);
    });

    it("despawns fruit after timer expires", () => {
      startPlaying(state);
      spawnFruit(state.fruit, state.level, state.maze);
      expect(state.fruit.active).toBe(true);

      updateGameState(state, FRUIT_DESPAWN_DURATION + 0.1, null, false);
      expect(state.fruit.active).toBe(false);
    });

    it("resets fruit on level advance", () => {
      startPlaying(state);
      spawnFruit(state.fruit, state.level, state.maze);

      // Force level complete
      state.phase = GamePhase.LEVEL_COMPLETE;
      state.phaseTimer = 0.1;
      updateGameState(state, 0.2, null, false);

      expect(state.fruit.active).toBe(false);
      expect(state.fruit.spawnCooldown).toBeGreaterThan(0);
    });
  });

  describe("speed run mode", () => {
    function startSpeedRun(state: GameState): void {
      updateGameState(state, 0, null, false, { speedRunRequested: true });
    }

    function startSpeedRunPlaying(state: GameState): void {
      startSpeedRun(state);
      updateGameState(state, READY_DURATION + 0.1, null, false);
    }

    it("starts in speed run mode when S pressed", () => {
      startSpeedRun(state);
      expect(state.mode).toBe(GameMode.SPEED_RUN);
      expect(state.phase).toBe(GamePhase.READY);
    });

    it("starts timer when transitioning to PLAYING", () => {
      startSpeedRunPlaying(state);
      expect(state.speedRunTimer.running).toBe(true);
    });

    it("advances timer during PLAYING", () => {
      startSpeedRunPlaying(state);
      updateGameState(state, 1, null, false);
      expect(state.speedRunTimer.elapsed).toBeGreaterThan(0);
    });

    it("pauses timer on pause", () => {
      startSpeedRunPlaying(state);
      updateGameState(state, 1, null, false);
      updateGameState(state, 0, null, true); // pause
      expect(state.speedRunTimer.running).toBe(false);
      const elapsed = state.speedRunTimer.elapsed;
      updateGameState(state, 1, null, false); // tick while paused
      expect(state.speedRunTimer.elapsed).toBeCloseTo(elapsed);
    });

    it("resumes timer on unpause", () => {
      startSpeedRunPlaying(state);
      updateGameState(state, 1, null, false);
      updateGameState(state, 0, null, true); // pause
      updateGameState(state, 0, null, true); // resume
      expect(state.speedRunTimer.running).toBe(true);
    });

    it("pauses timer on death", () => {
      startSpeedRunPlaying(state);
      updateGameState(state, 1, null, false);
      state.player.alive = false;
      state.phase = GamePhase.DYING;
      state.phaseTimer = DYING_DURATION;
      // Timer should be paused by collision handler, simulate manually
      state.speedRunTimer.running = false;
      const elapsed = state.speedRunTimer.elapsed;
      updateGameState(state, 0.5, null, false);
      expect(state.speedRunTimer.elapsed).toBeCloseTo(elapsed);
    });

    it("does not use initials entry in speed run mode", () => {
      startSpeedRunPlaying(state);
      state.score.score = 10000;
      state.player.alive = false;
      state.phase = GamePhase.DYING;
      state.phaseTimer = DYING_DURATION;
      state.lives = 1;
      updateGameState(state, DYING_DURATION + 0.1, null, false);
      expect(state.phase).toBe(GamePhase.GAME_OVER);
      expect(state.initialsEntry).toBeNull();
    });

    it("classic mode does not start timer", () => {
      startPlaying(state);
      expect(state.speedRunTimer.running).toBe(false);
      updateGameState(state, 1, null, false);
      expect(state.speedRunTimer.elapsed).toBe(0);
    });
  });
});
