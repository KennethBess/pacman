import {
  GHOST_NORMAL_SPEED,
  GHOST_FRIGHTENED_SPEED,
  GHOST_TUNNEL_SPEED,
  GHOST_EATEN_SPEED,
  GHOST_HOUSE_EXIT,
  GHOST_HOUSE_CENTER,
  GHOST_SCATTER_TARGETS,
  GHOST_START_POSITIONS,
  GHOST_RELEASE_DELAYS,
  SCATTER_CHASE_WAVES,
  FRIGHTENED_DURATION,
} from "./config";
import {
  Direction,
  Position,
  GhostState,
  GhostName,
  DIRECTION_VECTORS,
  OPPOSITE_DIRECTION,
} from "./types";
import { Maze } from "./maze";

export interface GhostData {
  name: GhostName;
  state: GhostState;
  tile: Position;
  prevTile: Position;
  progress: number;
  direction: Direction;
  speed: number;
  scatterTarget: Position;
  releaseDelay: number;
  releaseTimer: number;
  frightenedTimer: number;
  getChaseTarget: (
    playerTile: Position,
    playerDir: Direction,
    shadowTile: Position,
  ) => Position;
}

export function createGhost(
  name: GhostName,
  getChaseTarget: GhostData["getChaseTarget"],
): GhostData {
  const startPos = GHOST_START_POSITIONS[name];
  return {
    name,
    state: name === GhostName.SHADOW ? GhostState.SCATTER : GhostState.IN_HOUSE,
    tile: { ...startPos },
    prevTile: { ...startPos },
    progress: 0,
    direction: Direction.UP,
    speed: GHOST_NORMAL_SPEED,
    scatterTarget: { ...GHOST_SCATTER_TARGETS[name] },
    releaseDelay: GHOST_RELEASE_DELAYS[name],
    releaseTimer: 0,
    frightenedTimer: 0,
    getChaseTarget,
  };
}

export function resetGhost(ghost: GhostData): void {
  const startPos = GHOST_START_POSITIONS[ghost.name];
  ghost.state =
    ghost.name === GhostName.SHADOW ? GhostState.SCATTER : GhostState.IN_HOUSE;
  ghost.tile = { ...startPos };
  ghost.prevTile = { ...startPos };
  ghost.progress = 0;
  ghost.direction = Direction.UP;
  ghost.speed = GHOST_NORMAL_SPEED;
  ghost.releaseTimer = 0;
  ghost.frightenedTimer = 0;
}

// Wave timer management
export interface WaveTimer {
  waveIndex: number;
  timer: number;
  isScatter: boolean;
}

export function createWaveTimer(): WaveTimer {
  return {
    waveIndex: 0,
    timer: 0,
    isScatter: true,
  };
}

export function updateWaveTimer(wave: WaveTimer, dt: number): boolean {
  wave.timer += dt;
  const waves = SCATTER_CHASE_WAVES;
  if (wave.waveIndex >= waves.length) return false;

  const currentDuration = wave.isScatter
    ? waves[wave.waveIndex][0]
    : waves[wave.waveIndex][1];

  if (wave.timer >= currentDuration) {
    wave.timer = 0;
    if (wave.isScatter) {
      wave.isScatter = false;
    } else {
      wave.isScatter = true;
      wave.waveIndex++;
    }
    return true; // wave changed
  }
  return false;
}

export function getGhostSpeed(
  ghost: GhostData,
  maze: Maze,
  speedMultiplier: number,
): number {
  switch (ghost.state) {
    case GhostState.FRIGHTENED:
      return GHOST_FRIGHTENED_SPEED * speedMultiplier;
    case GhostState.EATEN:
      return GHOST_EATEN_SPEED;
    case GhostState.IN_HOUSE:
    case GhostState.LEAVING_HOUSE:
      return GHOST_NORMAL_SPEED * 0.5;
    default:
      if (maze.isTunnel(ghost.tile)) {
        return GHOST_TUNNEL_SPEED * speedMultiplier;
      }
      return GHOST_NORMAL_SPEED * speedMultiplier;
  }
}

function tileDistance(a: Position, b: Position): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

export function getGhostTarget(
  ghost: GhostData,
  playerTile: Position,
  playerDir: Direction,
  shadowTile: Position,
): Position {
  switch (ghost.state) {
    case GhostState.SCATTER:
      return ghost.scatterTarget;
    case GhostState.CHASE:
      return ghost.getChaseTarget(playerTile, playerDir, shadowTile);
    case GhostState.FRIGHTENED:
      // Random-ish target — just return a far corner to create erratic movement
      return { x: Math.random() > 0.5 ? 0 : 27, y: Math.random() > 0.5 ? 0 : 30 };
    case GhostState.EATEN:
      return { ...GHOST_HOUSE_EXIT };
    case GhostState.LEAVING_HOUSE:
      return { ...GHOST_HOUSE_EXIT };
    case GhostState.IN_HOUSE:
      return { ...GHOST_HOUSE_CENTER };
    default:
      return ghost.scatterTarget;
  }
}

export function chooseGhostDirection(
  ghost: GhostData,
  maze: Maze,
  target: Position,
): Direction {
  const available = maze.getWalkableDirections(ghost.tile, false);
  const opposite = OPPOSITE_DIRECTION[ghost.direction];

  // Filter out reverse direction (except when frightened entry already handled)
  const candidates = available.filter((d) => d !== opposite);
  const choices = candidates.length > 0 ? candidates : available;

  if (ghost.state === GhostState.FRIGHTENED) {
    // Random direction for frightened
    return choices[Math.floor(Math.random() * choices.length)];
  }

  // Choose direction minimizing distance to target
  let bestDir = choices[0];
  let bestDist = Infinity;

  for (const dir of choices) {
    const vec = DIRECTION_VECTORS[dir];
    const nextTile = maze.wrapTunnel({
      x: ghost.tile.x + vec.x,
      y: ghost.tile.y + vec.y,
    });
    const dist = tileDistance(nextTile, target);
    if (dist < bestDist) {
      bestDist = dist;
      bestDir = dir;
    }
  }

  return bestDir;
}

export function enterFrightened(
  ghost: GhostData,
  frightenedDuration: number = FRIGHTENED_DURATION,
): void {
  if (
    ghost.state === GhostState.SCATTER ||
    ghost.state === GhostState.CHASE
  ) {
    ghost.state = GhostState.FRIGHTENED;
    ghost.frightenedTimer = frightenedDuration;
    ghost.direction = OPPOSITE_DIRECTION[ghost.direction];
    ghost.progress = Math.max(0, 1 - ghost.progress);
  }
}

export function updateGhost(
  ghost: GhostData,
  maze: Maze,
  playerTile: Position,
  playerDir: Direction,
  shadowTile: Position,
  dt: number,
  waveIsScatter: boolean,
  speedMultiplier: number,
): void {
  // Handle release timing
  if (ghost.state === GhostState.IN_HOUSE) {
    ghost.releaseTimer += dt;
    if (ghost.releaseTimer >= ghost.releaseDelay) {
      ghost.state = GhostState.LEAVING_HOUSE;
    }
    return;
  }

  // Handle leaving house
  if (ghost.state === GhostState.LEAVING_HOUSE) {
    // Move toward exit
    if (
      ghost.tile.x === GHOST_HOUSE_EXIT.x &&
      ghost.tile.y === GHOST_HOUSE_EXIT.y
    ) {
      ghost.state = waveIsScatter ? GhostState.SCATTER : GhostState.CHASE;
      ghost.progress = 0;
    } else {
      // Simple move toward exit
      if (ghost.tile.y > GHOST_HOUSE_EXIT.y) {
        ghost.direction = Direction.UP;
      } else if (ghost.tile.x < GHOST_HOUSE_EXIT.x) {
        ghost.direction = Direction.RIGHT;
      } else if (ghost.tile.x > GHOST_HOUSE_EXIT.x) {
        ghost.direction = Direction.LEFT;
      }

      ghost.speed = getGhostSpeed(ghost, maze, speedMultiplier);
      ghost.progress += ghost.speed * dt;
      if (ghost.progress >= 1) {
        ghost.progress = 0;
        const vec = DIRECTION_VECTORS[ghost.direction];
        ghost.prevTile = { ...ghost.tile };
        ghost.tile = {
          x: ghost.tile.x + vec.x,
          y: ghost.tile.y + vec.y,
        };
      }
    }
    return;
  }

  // Handle frightened timer
  if (ghost.state === GhostState.FRIGHTENED) {
    ghost.frightenedTimer -= dt;
    if (ghost.frightenedTimer <= 0) {
      ghost.state = waveIsScatter ? GhostState.SCATTER : GhostState.CHASE;
      ghost.frightenedTimer = 0;
    }
  }

  // Handle eaten ghost reaching house
  if (ghost.state === GhostState.EATEN) {
    if (
      ghost.tile.x === GHOST_HOUSE_EXIT.x &&
      ghost.tile.y === GHOST_HOUSE_EXIT.y
    ) {
      ghost.state = GhostState.LEAVING_HOUSE;
      ghost.tile = { ...GHOST_HOUSE_CENTER };
      ghost.prevTile = { ...ghost.tile };
      ghost.progress = 0;
      return;
    }
  }

  // Movement
  ghost.speed = getGhostSpeed(ghost, maze, speedMultiplier);
  ghost.progress += ghost.speed * dt;

  if (ghost.progress >= 1) {
    ghost.progress = 0;
    ghost.prevTile = { ...ghost.tile };
    const vec = DIRECTION_VECTORS[ghost.direction];
    ghost.tile = maze.wrapTunnel({
      x: ghost.tile.x + vec.x,
      y: ghost.tile.y + vec.y,
    });

    // Choose new direction at new tile
    const target = getGhostTarget(ghost, playerTile, playerDir, shadowTile);
    ghost.direction = chooseGhostDirection(ghost, maze, target);
  }
}

export function getGhostPixelPosition(
  ghost: GhostData,
  interpolation: number,
): Position {
  const effectiveProgress =
    ghost.progress + ghost.speed * (1 / 60) * interpolation;
  const clampedProgress = Math.min(effectiveProgress, 1);
  const vec = DIRECTION_VECTORS[ghost.direction];

  return {
    x: ghost.tile.x + vec.x * clampedProgress,
    y: ghost.tile.y + vec.y * clampedProgress,
  };
}
