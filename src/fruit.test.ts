import { describe, it, expect, beforeEach } from "vitest";
import {
  FruitState,
  createFruitState,
  updateFruit,
  collectFruit,
} from "./fruit";
import {
  FRUIT_DESPAWN_DURATION,
  FRUIT_SPAWN_INTERVAL_MAX,
} from "./config";
import { Maze } from "./maze";

describe("fruit", () => {
  let fruit: FruitState;
  let maze: Maze;

  beforeEach(() => {
    fruit = createFruitState();
    maze = new Maze();
  });

  describe("createFruitState", () => {
    it("starts inactive with a spawn cooldown", () => {
      expect(fruit.active).toBe(false);
      expect(fruit.spawnCooldown).toBeGreaterThan(0);
    });
  });

  describe("updateFruit", () => {
    it("spawns fruit when cooldown expires", () => {
      fruit.spawnCooldown = 1;
      updateFruit(fruit, 1.1, 1, maze);
      expect(fruit.active).toBe(true);
      expect(fruit.type!.name).toBe("Cherry");
    });

    it("does not spawn before cooldown expires", () => {
      fruit.spawnCooldown = 10;
      updateFruit(fruit, 5, 1, maze);
      expect(fruit.active).toBe(false);
    });

    it("despawns fruit after despawn timer expires", () => {
      fruit.spawnCooldown = 0.1;
      updateFruit(fruit, 0.2, 1, maze);
      expect(fruit.active).toBe(true);

      updateFruit(fruit, FRUIT_DESPAWN_DURATION + 0.1, 1, maze);
      expect(fruit.active).toBe(false);
    });

    it("resets cooldown after despawn", () => {
      fruit.spawnCooldown = 0.1;
      updateFruit(fruit, 0.2, 1, maze);
      updateFruit(fruit, FRUIT_DESPAWN_DURATION + 0.1, 1, maze);
      expect(fruit.active).toBe(false);
      expect(fruit.spawnCooldown).toBeGreaterThan(0);
    });

    it("spawns again after cooldown resets", () => {
      // First spawn
      fruit.spawnCooldown = 0.1;
      updateFruit(fruit, 0.2, 1, maze);
      expect(fruit.active).toBe(true);

      // Despawn
      updateFruit(fruit, FRUIT_DESPAWN_DURATION + 0.1, 1, maze);
      expect(fruit.active).toBe(false);

      // Second spawn
      updateFruit(fruit, FRUIT_SPAWN_INTERVAL_MAX + 1, 1, maze);
      expect(fruit.active).toBe(true);
    });

    it("uses level-specific fruit type", () => {
      fruit.spawnCooldown = 0.1;
      updateFruit(fruit, 0.2, 3, maze);
      expect(fruit.type!.name).toBe("Orange");
      expect(fruit.type!.points).toBe(500);
    });

    it("spawns at a walkable tile", () => {
      fruit.spawnCooldown = 0.1;
      updateFruit(fruit, 0.2, 1, maze);
      expect(maze.isWalkableForPlayer(fruit.tile)).toBe(true);
    });
  });

  describe("collectFruit", () => {
    it("returns points and deactivates fruit", () => {
      fruit.spawnCooldown = 0.1;
      updateFruit(fruit, 0.2, 1, maze);
      const points = collectFruit(fruit);
      expect(points).toBe(100);
      expect(fruit.active).toBe(false);
    });

    it("returns 0 when no active fruit", () => {
      expect(collectFruit(fruit)).toBe(0);
    });

    it("resets cooldown after collection", () => {
      fruit.spawnCooldown = 0.1;
      updateFruit(fruit, 0.2, 1, maze);
      collectFruit(fruit);
      expect(fruit.spawnCooldown).toBeGreaterThan(0);
    });
  });
});
