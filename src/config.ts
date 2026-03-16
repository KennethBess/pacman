export const TILE_SIZE = 16;
export const MAZE_WIDTH = 28;
export const MAZE_HEIGHT = 31;

export const CANVAS_WIDTH = MAZE_WIDTH * TILE_SIZE;
export const CANVAS_HEIGHT = (MAZE_HEIGHT + 3) * TILE_SIZE; // extra rows for HUD

export const UPDATES_PER_SECOND = 60;
export const FIXED_DT = 1 / UPDATES_PER_SECOND;
export const MAX_UPDATES_PER_FRAME = 10;

// Player
export const PLAYER_SPEED = 5; // tiles per second
export const PLAYER_START: { x: number; y: number } = { x: 14, y: 22 };
export const INITIAL_LIVES = 3;

// Pellets
export const PELLET_SCORE = 10;
export const POWER_PELLET_SCORE = 50;

// Ghost scoring
export const GHOST_SCORE_SEQUENCE = [200, 400, 800, 1600];

// Extra life
export const EXTRA_LIFE_SCORE = 10_000;

// Ghost speeds (tiles per second)
export const GHOST_NORMAL_SPEED = 4.5;
export const GHOST_FRIGHTENED_SPEED = 2.5;
export const GHOST_TUNNEL_SPEED = 2.0;
export const GHOST_EATEN_SPEED = 10;

// Ghost house
export const GHOST_HOUSE_CENTER: { x: number; y: number } = { x: 14, y: 14 };
export const GHOST_HOUSE_EXIT: { x: number; y: number } = { x: 14, y: 11 };

// Ghost release delays (seconds from level/life start)
export const GHOST_RELEASE_DELAYS: Record<string, number> = {
  SHADOW: 0,
  SPEEDY: 3,
  BASHFUL: 7,
  POKEY: 12,
};

// Ghost scatter corners
export const GHOST_SCATTER_TARGETS: Record<
  string,
  { x: number; y: number }
> = {
  SHADOW: { x: 25, y: 0 },
  SPEEDY: { x: 2, y: 0 },
  BASHFUL: { x: 27, y: 30 },
  POKEY: { x: 0, y: 30 },
};

// Ghost start positions (inside ghost house)
export const GHOST_START_POSITIONS: Record<
  string,
  { x: number; y: number }
> = {
  SHADOW: { x: 14, y: 11 },
  SPEEDY: { x: 14, y: 14 },
  BASHFUL: { x: 12, y: 14 },
  POKEY: { x: 16, y: 14 },
};

// Scatter/chase wave timings (seconds) — pairs of [scatter, chase]
export const SCATTER_CHASE_WAVES: [number, number][] = [
  [7, 20],
  [7, 20],
  [5, 20],
  [5, Infinity], // final chase never ends
];

// Frightened mode
export const FRIGHTENED_DURATION = 6; // seconds
export const FRIGHTENED_FLASH_TIME = 2; // seconds before end to start flashing

// Pac-Man mouth animation
export const MOUTH_ANGLE_MAX = Math.PI / 4; // 45 degrees max opening
export const MOUTH_ANIMATION_SPEED = 8; // cycles per second

// Ready countdown
export const READY_DURATION = 2; // seconds
export const DYING_DURATION = 1.5; // seconds
export const LEVEL_COMPLETE_DURATION = 2; // seconds

// Level difficulty scaling
export interface LevelConfig {
  ghostSpeedMultiplier: number;
  frightenedDuration: number;
  playerSpeedMultiplier: number;
}

export function getLevelConfig(level: number): LevelConfig {
  const cappedLevel = Math.min(level, 21);
  return {
    ghostSpeedMultiplier: 1 + (cappedLevel - 1) * 0.05,
    frightenedDuration: Math.max(1, FRIGHTENED_DURATION - (cappedLevel - 1) * 0.5),
    playerSpeedMultiplier: 1 + (cappedLevel - 1) * 0.02,
  };
}

// Bonus fruit
export interface FruitType {
  name: string;
  points: number;
  color: string;
}

export const FRUIT_TABLE: FruitType[] = [
  { name: "Cherry", points: 100, color: "#FF0000" },
  { name: "Strawberry", points: 300, color: "#FF3366" },
  { name: "Orange", points: 500, color: "#FF8800" },
  { name: "Apple", points: 700, color: "#00FF00" },
  { name: "Grape", points: 1000, color: "#AA00FF" },
  { name: "Bell", points: 3000, color: "#FFDD00" },
  { name: "Key", points: 5000, color: "#00DDFF" },
];

export const FRUIT_DESPAWN_DURATION = 10; // seconds
export const FRUIT_SPAWN_INTERVAL_MIN = 15; // minimum seconds between spawns
export const FRUIT_SPAWN_INTERVAL_MAX = 30; // maximum seconds between spawns

export function getFruitForLevel(level: number): FruitType {
  const index = Math.min(level - 1, FRUIT_TABLE.length - 1);
  return FRUIT_TABLE[index];
}

// Colors
export const COLORS = {
  background: "#000000",
  wall: "#2121DE",
  pellet: "#FFB8AE",
  powerPellet: "#FFB8AE",
  player: "#FFFF00",
  ghostShadow: "#FF0000",
  ghostSpeedy: "#FFB8FF",
  ghostBashful: "#00FFFF",
  ghostPokey: "#FFB852",
  ghostFrightened: "#2121FF",
  ghostEyes: "#FFFFFF",
  text: "#FFFFFF",
  hudBackground: "#000000",
};
