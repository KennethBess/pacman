import { PLAYER_SPEED, PLAYER_START } from "./config";
import {
  Direction,
  Position,
  DIRECTION_VECTORS,
  TileType,
} from "./types";
import { Maze } from "./maze";

export interface PlayerState {
  tile: Position;
  prevTile: Position;
  progress: number;
  direction: Direction;
  nextDirection: Direction | null;
  speed: number;
  alive: boolean;
}

export function createPlayer(speedMultiplier = 1): PlayerState {
  return {
    tile: { ...PLAYER_START },
    prevTile: { ...PLAYER_START },
    progress: 0,
    direction: Direction.LEFT,
    nextDirection: null,
    speed: PLAYER_SPEED * speedMultiplier,
    alive: true,
  };
}

export function resetPlayer(player: PlayerState, speedMultiplier = 1): void {
  player.tile = { ...PLAYER_START };
  player.prevTile = { ...PLAYER_START };
  player.progress = 0;
  player.direction = Direction.LEFT;
  player.nextDirection = null;
  player.speed = PLAYER_SPEED * speedMultiplier;
  player.alive = true;
}

export function setPlayerDirection(
  player: PlayerState,
  direction: Direction,
): void {
  player.nextDirection = direction;
}

export interface PlayerUpdateResult {
  consumedPellet: TileType | null;
}

export function updatePlayer(
  player: PlayerState,
  maze: Maze,
  dt: number,
): PlayerUpdateResult {
  if (!player.alive) return { consumedPellet: null };

  let consumedPellet: TileType | null = null;

  // Try to turn at current tile if queued direction is valid
  if (player.nextDirection !== null && player.progress === 0) {
    const vec = DIRECTION_VECTORS[player.nextDirection];
    const nextTile = maze.wrapTunnel({
      x: player.tile.x + vec.x,
      y: player.tile.y + vec.y,
    });
    if (maze.isWalkableForPlayer(nextTile)) {
      player.direction = player.nextDirection;
      player.nextDirection = null;
    }
  }

  // Move in current direction
  const vec = DIRECTION_VECTORS[player.direction];
  const targetTile = maze.wrapTunnel({
    x: player.tile.x + vec.x,
    y: player.tile.y + vec.y,
  });

  if (!maze.isWalkableForPlayer(targetTile) && player.progress === 0) {
    // Can't move, stay put
    return { consumedPellet: null };
  }

  if (maze.isWalkableForPlayer(targetTile) || player.progress > 0) {
    player.progress += player.speed * dt;

    if (player.progress >= 1) {
      player.progress = 0;
      player.prevTile = { ...player.tile };

      // If we were moving toward target, snap to it
      if (maze.isWalkableForPlayer(targetTile)) {
        player.tile = { ...targetTile };
      }

      // Consume pellet at new tile
      consumedPellet = maze.consumePellet(player.tile);

      // Try to turn at new tile
      if (player.nextDirection !== null) {
        const nextVec = DIRECTION_VECTORS[player.nextDirection];
        const nextTarget = maze.wrapTunnel({
          x: player.tile.x + nextVec.x,
          y: player.tile.y + nextVec.y,
        });
        if (maze.isWalkableForPlayer(nextTarget)) {
          player.direction = player.nextDirection;
          player.nextDirection = null;
        }
      }
    }
  }

  player.prevTile = player.progress === 0 ? { ...player.tile } : player.prevTile;

  return { consumedPellet };
}

export function getPlayerPixelPosition(
  player: PlayerState,
  interpolation: number,
): Position {
  const effectiveProgress = player.progress + player.speed * (1 / 60) * interpolation;
  const clampedProgress = Math.min(effectiveProgress, 1);
  const vec = DIRECTION_VECTORS[player.direction];

  return {
    x: player.tile.x + vec.x * clampedProgress,
    y: player.tile.y + vec.y * clampedProgress,
  };
}
