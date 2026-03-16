import {
  FruitType,
  getFruitForLevel,
  FRUIT_DESPAWN_DURATION,
  FRUIT_SPAWN_INTERVAL_MIN,
  FRUIT_SPAWN_INTERVAL_MAX,
} from "./config";
import { Position } from "./types";
import { Maze } from "./maze";

export interface FruitState {
  active: boolean;
  type: FruitType | null;
  tile: Position;
  despawnTimer: number;
  spawnCooldown: number;
}

function randomSpawnCooldown(): number {
  return (
    FRUIT_SPAWN_INTERVAL_MIN +
    Math.random() * (FRUIT_SPAWN_INTERVAL_MAX - FRUIT_SPAWN_INTERVAL_MIN)
  );
}

export function createFruitState(): FruitState {
  return {
    active: false,
    type: null,
    tile: { x: 0, y: 0 },
    despawnTimer: 0,
    spawnCooldown: randomSpawnCooldown(),
  };
}

export function updateFruit(
  fruit: FruitState,
  dt: number,
  level: number,
  maze: Maze,
): void {
  if (fruit.active) {
    fruit.despawnTimer -= dt;
    if (fruit.despawnTimer <= 0) {
      fruit.active = false;
      fruit.type = null;
      fruit.despawnTimer = 0;
      fruit.spawnCooldown = randomSpawnCooldown();
    }
  } else {
    fruit.spawnCooldown -= dt;
    if (fruit.spawnCooldown <= 0) {
      spawnFruit(fruit, level, maze);
    }
  }
}

export function spawnFruit(
  fruit: FruitState,
  level: number,
  maze: Maze,
): void {
  fruit.active = true;
  fruit.type = getFruitForLevel(level);
  fruit.tile = maze.getRandomWalkableTile();
  fruit.despawnTimer = FRUIT_DESPAWN_DURATION;
}

export function collectFruit(fruit: FruitState): number {
  if (!fruit.active || !fruit.type) return 0;
  const points = fruit.type.points;
  fruit.active = false;
  fruit.type = null;
  fruit.despawnTimer = 0;
  fruit.spawnCooldown = randomSpawnCooldown();
  return points;
}
