import { describe, it, expect, beforeEach } from "vitest";
import {
  createWaveTimer,
  updateWaveTimer,
  enterFrightened,
  chooseGhostDirection,
  resetGhost,
} from "./ghost";
import { createShadow } from "./ghosts/shadow";
import { createSpeedy } from "./ghosts/speedy";
import { createBashful } from "./ghosts/bashful";
import { createPokey } from "./ghosts/pokey";
import { Maze } from "./maze";
import { GhostState, Direction } from "./types";

describe("Ghost AI", () => {
  let maze: Maze;

  beforeEach(() => {
    maze = new Maze();
  });

  describe("targeting", () => {
    it("Shadow targets player tile directly", () => {
      const shadow = createShadow();
      const playerTile = { x: 5, y: 5 };
      const target = shadow.getChaseTarget(
        playerTile,
        Direction.LEFT,
        shadow.tile,
      );
      expect(target).toEqual(playerTile);
    });

    it("Speedy targets 4 tiles ahead of player", () => {
      const speedy = createSpeedy();
      const playerTile = { x: 10, y: 10 };
      const target = speedy.getChaseTarget(
        playerTile,
        Direction.RIGHT,
        { x: 0, y: 0 },
      );
      expect(target).toEqual({ x: 14, y: 10 });
    });

    it("Bashful uses vector doubling", () => {
      const bashful = createBashful();
      const playerTile = { x: 10, y: 10 };
      const shadowTile = { x: 8, y: 10 };
      const target = bashful.getChaseTarget(
        playerTile,
        Direction.RIGHT,
        shadowTile,
      );
      // Pivot = (12, 10), vector from shadow to pivot = (4, 0), doubled = (16, 10)
      expect(target).toEqual({ x: 16, y: 10 });
    });

    it("Pokey targets player when far away", () => {
      const pokey = createPokey();
      // Move pokey far from player
      pokey.tile = { x: 1, y: 1 };
      const playerTile = { x: 20, y: 20 };
      const target = pokey.getChaseTarget(
        playerTile,
        Direction.LEFT,
        { x: 0, y: 0 },
      );
      expect(target).toEqual(playerTile);
    });
  });

  describe("state machine", () => {
    it("Shadow starts in SCATTER state", () => {
      const shadow = createShadow();
      expect(shadow.state).toBe(GhostState.SCATTER);
    });

    it("other ghosts start in IN_HOUSE state", () => {
      const speedy = createSpeedy();
      expect(speedy.state).toBe(GhostState.IN_HOUSE);
    });

    it("enters FRIGHTENED state and reverses direction", () => {
      const shadow = createShadow();
      shadow.state = GhostState.CHASE;
      shadow.direction = Direction.RIGHT;
      enterFrightened(shadow);
      expect(shadow.state).toBe(GhostState.FRIGHTENED);
      expect(shadow.direction).toBe(Direction.LEFT);
    });

    it("does not frighten eaten ghosts", () => {
      const shadow = createShadow();
      shadow.state = GhostState.EATEN;
      enterFrightened(shadow);
      expect(shadow.state).toBe(GhostState.EATEN);
    });

    it("resets ghost to initial state", () => {
      const shadow = createShadow();
      shadow.state = GhostState.FRIGHTENED;
      shadow.tile = { x: 5, y: 5 };
      resetGhost(shadow);
      expect(shadow.state).toBe(GhostState.SCATTER);
    });
  });

  describe("wave timer", () => {
    it("starts in scatter mode", () => {
      const wave = createWaveTimer();
      expect(wave.isScatter).toBe(true);
    });

    it("transitions from scatter to chase", () => {
      const wave = createWaveTimer();
      // Advance past first scatter duration (7s)
      for (let i = 0; i < 8 * 60; i++) {
        updateWaveTimer(wave, 1 / 60);
      }
      expect(wave.isScatter).toBe(false);
    });
  });

  describe("pathfinding", () => {
    it("does not reverse direction at intersections", () => {
      const shadow = createShadow();
      // Place ghost at a walkable intersection
      shadow.tile = { x: 6, y: 1 };
      shadow.direction = Direction.RIGHT;

      const dir = chooseGhostDirection(shadow, maze, { x: 1, y: 1 });
      expect(dir).not.toBe(Direction.LEFT); // should not reverse
    });
  });
});
