import { MAZE_WIDTH, MAZE_HEIGHT } from "./config";
import { TileType, Position, Direction, DIRECTION_VECTORS } from "./types";
import { MAZE_LAYOUT } from "./maze-data";

export class Maze {
  private grid: TileType[][];
  private initialGrid: TileType[][];
  private totalPellets: number;
  private remainingPellets: number;

  constructor(layout: number[][] = MAZE_LAYOUT) {
    this.initialGrid = layout.map((row) => [...row]) as TileType[][];
    this.grid = layout.map((row) => [...row]) as TileType[][];
    this.totalPellets = 0;
    this.remainingPellets = 0;
    this.countPellets();
  }

  private countPellets(): void {
    this.totalPellets = 0;
    for (let y = 0; y < this.grid.length; y++) {
      for (let x = 0; x < this.grid[y].length; x++) {
        if (
          this.grid[y][x] === TileType.PELLET ||
          this.grid[y][x] === TileType.POWER_PELLET
        ) {
          this.totalPellets++;
        }
      }
    }
    this.remainingPellets = this.totalPellets;
  }

  getTile(pos: Position): TileType {
    const { x, y } = pos;
    if (y < 0 || y >= MAZE_HEIGHT || x < 0 || x >= MAZE_WIDTH) {
      return TileType.WALL;
    }
    return this.grid[y][x];
  }

  isWalkable(pos: Position): boolean {
    const tile = this.getTile(pos);
    return tile !== TileType.WALL;
  }

  isWalkableForPlayer(pos: Position): boolean {
    const tile = this.getTile(pos);
    return (
      tile !== TileType.WALL &&
      tile !== TileType.GHOST_HOUSE &&
      tile !== TileType.GHOST_DOOR
    );
  }

  isWalkableForGhost(pos: Position): boolean {
    const tile = this.getTile(pos);
    return tile !== TileType.WALL;
  }

  consumePellet(pos: Position): TileType | null {
    const tile = this.getTile(pos);
    if (tile === TileType.PELLET || tile === TileType.POWER_PELLET) {
      this.grid[pos.y][pos.x] = TileType.PATH;
      this.remainingPellets--;
      return tile;
    }
    return null;
  }

  isLevelComplete(): boolean {
    return this.remainingPellets <= 0;
  }

  getRemainingPellets(): number {
    return this.remainingPellets;
  }

  getTotalPellets(): number {
    return this.totalPellets;
  }

  reset(): void {
    this.grid = this.initialGrid.map((row) => [...row]) as TileType[][];
    this.countPellets();
  }

  wrapTunnel(pos: Position): Position {
    if (pos.x < 0) {
      return { x: MAZE_WIDTH - 1, y: pos.y };
    }
    if (pos.x >= MAZE_WIDTH) {
      return { x: 0, y: pos.y };
    }
    return pos;
  }

  isTunnel(pos: Position): boolean {
    return this.getTile(pos) === TileType.TUNNEL;
  }

  getNeighbor(pos: Position, dir: Direction): Position {
    const vec = DIRECTION_VECTORS[dir];
    const next = { x: pos.x + vec.x, y: pos.y + vec.y };
    return this.wrapTunnel(next);
  }

  getRandomWalkableTile(): Position {
    const walkable: Position[] = [];
    for (let y = 0; y < MAZE_HEIGHT; y++) {
      for (let x = 0; x < MAZE_WIDTH; x++) {
        const tile = this.grid[y][x];
        if (
          tile !== TileType.WALL &&
          tile !== TileType.GHOST_HOUSE &&
          tile !== TileType.GHOST_DOOR &&
          tile !== TileType.TUNNEL
        ) {
          walkable.push({ x, y });
        }
      }
    }
    return walkable[Math.floor(Math.random() * walkable.length)];
  }

  getWalkableDirections(
    pos: Position,
    isPlayer: boolean,
  ): Direction[] {
    const dirs: Direction[] = [
      Direction.UP,
      Direction.DOWN,
      Direction.LEFT,
      Direction.RIGHT,
    ];
    const checkFn = isPlayer
      ? (p: Position) => this.isWalkableForPlayer(p)
      : (p: Position) => this.isWalkableForGhost(p);

    return dirs.filter((dir) => {
      const neighbor = this.getNeighbor(pos, dir);
      return checkFn(neighbor);
    });
  }
}
