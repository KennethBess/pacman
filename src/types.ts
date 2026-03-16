export enum Direction {
  UP = "UP",
  DOWN = "DOWN",
  LEFT = "LEFT",
  RIGHT = "RIGHT",
}

export enum TileType {
  WALL = 0,
  PATH = 1,
  PELLET = 2,
  POWER_PELLET = 3,
  TUNNEL = 4,
  GHOST_HOUSE = 5,
  GHOST_DOOR = 6,
}

export interface Position {
  x: number;
  y: number;
}

export enum GhostState {
  IN_HOUSE = "IN_HOUSE",
  LEAVING_HOUSE = "LEAVING_HOUSE",
  SCATTER = "SCATTER",
  CHASE = "CHASE",
  FRIGHTENED = "FRIGHTENED",
  EATEN = "EATEN",
}

export enum GamePhase {
  TITLE_SCREEN = "TITLE_SCREEN",
  READY = "READY",
  PLAYING = "PLAYING",
  DYING = "DYING",
  PAUSED = "PAUSED",
  GAME_OVER = "GAME_OVER",
  LEVEL_COMPLETE = "LEVEL_COMPLETE",
}

export enum GhostName {
  SHADOW = "SHADOW",
  SPEEDY = "SPEEDY",
  BASHFUL = "BASHFUL",
  POKEY = "POKEY",
}

export interface Entity {
  tile: Position;
  targetTile: Position;
  progress: number;
  direction: Direction;
  speed: number;
}

export enum GameMode {
  CLASSIC = "CLASSIC",
  SPEED_RUN = "SPEED_RUN",
}

export interface SpeedRunTimer {
  elapsed: number;
  levelStart: number;
  splits: number[];
  running: boolean;
}

export interface InitialsEntry {
  currentIndex: number;
  characters: string[];
  confirmed: boolean;
}

export const DIRECTION_VECTORS: Record<Direction, Position> = {
  [Direction.UP]: { x: 0, y: -1 },
  [Direction.DOWN]: { x: 0, y: 1 },
  [Direction.LEFT]: { x: -1, y: 0 },
  [Direction.RIGHT]: { x: 1, y: 0 },
};

export const OPPOSITE_DIRECTION: Record<Direction, Direction> = {
  [Direction.UP]: Direction.DOWN,
  [Direction.DOWN]: Direction.UP,
  [Direction.LEFT]: Direction.RIGHT,
  [Direction.RIGHT]: Direction.LEFT,
};
