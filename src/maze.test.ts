import { describe, it, expect, beforeEach } from "vitest";
import { Maze } from "./maze";
import { TileType, Direction } from "./types";
import { MAZE_LAYOUT } from "./maze-data";

describe("Maze", () => {
  let maze: Maze;

  beforeEach(() => {
    maze = new Maze();
  });

  describe("getTile", () => {
    it("returns WALL for border tiles", () => {
      expect(maze.getTile({ x: 0, y: 0 })).toBe(TileType.WALL);
    });

    it("returns WALL for out-of-bounds positions", () => {
      expect(maze.getTile({ x: -1, y: 0 })).toBe(TileType.WALL);
      expect(maze.getTile({ x: 0, y: -1 })).toBe(TileType.WALL);
      expect(maze.getTile({ x: 28, y: 0 })).toBe(TileType.WALL);
      expect(maze.getTile({ x: 0, y: 31 })).toBe(TileType.WALL);
    });

    it("returns PELLET for pellet tiles", () => {
      expect(maze.getTile({ x: 1, y: 1 })).toBe(TileType.PELLET);
    });
  });

  describe("pellet tracking", () => {
    it("counts total pellets correctly", () => {
      expect(maze.getTotalPellets()).toBeGreaterThan(0);
    });

    it("consumes a pellet and decreases remaining count", () => {
      const initial = maze.getRemainingPellets();
      const result = maze.consumePellet({ x: 1, y: 1 });
      expect(result).toBe(TileType.PELLET);
      expect(maze.getRemainingPellets()).toBe(initial - 1);
    });

    it("returns null when consuming from empty tile", () => {
      expect(maze.consumePellet({ x: 0, y: 0 })).toBeNull();
    });

    it("cannot consume same pellet twice", () => {
      maze.consumePellet({ x: 1, y: 1 });
      expect(maze.consumePellet({ x: 1, y: 1 })).toBeNull();
    });

    it("detects level complete when all pellets consumed", () => {
      expect(maze.isLevelComplete()).toBe(false);
      // Consume all pellets
      for (let y = 0; y < MAZE_LAYOUT.length; y++) {
        for (let x = 0; x < MAZE_LAYOUT[y].length; x++) {
          maze.consumePellet({ x, y });
        }
      }
      expect(maze.isLevelComplete()).toBe(true);
    });
  });

  describe("tunnel wrapping", () => {
    it("wraps left to right", () => {
      const wrapped = maze.wrapTunnel({ x: -1, y: 14 });
      expect(wrapped.x).toBe(27);
      expect(wrapped.y).toBe(14);
    });

    it("wraps right to left", () => {
      const wrapped = maze.wrapTunnel({ x: 28, y: 14 });
      expect(wrapped.x).toBe(0);
      expect(wrapped.y).toBe(14);
    });

    it("does not wrap positions within bounds", () => {
      const pos = { x: 5, y: 5 };
      const wrapped = maze.wrapTunnel(pos);
      expect(wrapped).toEqual(pos);
    });
  });

  describe("walkable queries", () => {
    it("walls are not walkable for player", () => {
      expect(maze.isWalkableForPlayer({ x: 0, y: 0 })).toBe(false);
    });

    it("pellet tiles are walkable for player", () => {
      expect(maze.isWalkableForPlayer({ x: 1, y: 1 })).toBe(true);
    });

    it("ghost house is not walkable for player", () => {
      expect(maze.isWalkableForPlayer({ x: 13, y: 14 })).toBe(false);
    });
  });

  describe("reset", () => {
    it("restores all pellets after reset", () => {
      const initial = maze.getRemainingPellets();
      maze.consumePellet({ x: 1, y: 1 });
      maze.reset();
      expect(maze.getRemainingPellets()).toBe(initial);
    });
  });
});
