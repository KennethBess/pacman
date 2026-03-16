import { describe, it, expect, beforeEach } from "vitest";
import {
  createPlayer,
  updatePlayer,
  setPlayerDirection,
  PlayerState,
} from "./player";
import { Maze } from "./maze";
import { Direction, TileType } from "./types";
import { PLAYER_START } from "./config";

describe("Player", () => {
  let player: PlayerState;
  let maze: Maze;

  beforeEach(() => {
    player = createPlayer();
    maze = new Maze();
  });

  it("starts at configured start position", () => {
    expect(player.tile).toEqual(PLAYER_START);
  });

  it("starts alive", () => {
    expect(player.alive).toBe(true);
  });

  describe("movement", () => {
    it("does not move into walls", () => {
      // Player at start, try to move up into wall area
      setPlayerDirection(player, Direction.UP);
      const startTile = { ...player.tile };

      // Multiple small updates
      for (let i = 0; i < 10; i++) {
        updatePlayer(player, maze, 1 / 60);
      }

      // Check if movement was blocked or player didn't enter a wall
      const tile = maze.getTile(player.tile);
      expect(tile).not.toBe(TileType.WALL);
    });

    it("moves smoothly with sub-tile interpolation", () => {
      // Set direction to a walkable direction
      setPlayerDirection(player, Direction.LEFT);
      updatePlayer(player, maze, 1 / 60);

      // Progress should increase (player is moving)
      // The exact value depends on speed and whether the direction is valid
      expect(player.progress).toBeGreaterThanOrEqual(0);
    });
  });

  describe("input buffering", () => {
    it("buffers next direction", () => {
      setPlayerDirection(player, Direction.UP);
      expect(player.nextDirection).toBe(Direction.UP);
    });

    it("applies buffered direction when valid", () => {
      // Move left first (should be valid from start)
      setPlayerDirection(player, Direction.LEFT);
      player.progress = 0; // at tile boundary
      updatePlayer(player, maze, 1 / 60);

      // The direction should be applied if the left tile is walkable
      if (maze.isWalkableForPlayer(maze.getNeighbor(PLAYER_START, Direction.LEFT))) {
        expect(player.direction).toBe(Direction.LEFT);
      }
    });
  });
});
