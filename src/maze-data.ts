import { TileType } from "./types";

const W = TileType.WALL;
const P = TileType.PATH;
const D = TileType.PELLET;
const O = TileType.POWER_PELLET;
const T = TileType.TUNNEL;
const H = TileType.GHOST_HOUSE;
const G = TileType.GHOST_DOOR;

// Original 28x31 maze layout
// prettier-ignore
export const MAZE_LAYOUT: number[][] = [
  // Row 0
  [W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W],
  // Row 1
  [W,D,D,D,D,D,D,D,D,D,D,D,D,W,W,D,D,D,D,D,D,D,D,D,D,D,D,W],
  // Row 2
  [W,D,W,W,W,W,D,W,W,W,W,W,D,W,W,D,W,W,W,W,W,D,W,W,W,W,D,W],
  // Row 3
  [W,O,W,W,W,W,D,W,W,W,W,W,D,W,W,D,W,W,W,W,W,D,W,W,W,W,O,W],
  // Row 4
  [W,D,W,W,W,W,D,W,W,W,W,W,D,W,W,D,W,W,W,W,W,D,W,W,W,W,D,W],
  // Row 5
  [W,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,W],
  // Row 6
  [W,D,W,W,W,W,D,W,W,D,W,W,W,W,W,W,W,W,D,W,W,D,W,W,W,W,D,W],
  // Row 7
  [W,D,W,W,W,W,D,W,W,D,W,W,W,W,W,W,W,W,D,W,W,D,W,W,W,W,D,W],
  // Row 8
  [W,D,D,D,D,D,D,W,W,D,D,D,D,W,W,D,D,D,D,W,W,D,D,D,D,D,D,W],
  // Row 9
  [W,W,W,W,W,W,D,W,W,W,W,W,P,W,W,P,W,W,W,W,W,D,W,W,W,W,W,W],
  // Row 10
  [W,W,W,W,W,W,D,W,W,W,W,W,P,W,W,P,W,W,W,W,W,D,W,W,W,W,W,W],
  // Row 11
  [W,W,W,W,W,W,D,W,W,P,P,P,P,P,P,P,P,P,P,W,W,D,W,W,W,W,W,W],
  // Row 12
  [W,W,W,W,W,W,D,W,W,P,W,W,W,G,G,W,W,W,P,W,W,D,W,W,W,W,W,W],
  // Row 13
  [W,W,W,W,W,W,D,P,P,P,W,H,H,H,H,H,H,W,P,P,P,D,W,W,W,W,W,W],
  // Row 14
  [T,T,T,T,T,T,D,W,W,P,W,H,H,H,H,H,H,W,P,W,W,D,T,T,T,T,T,T],
  // Row 15
  [W,W,W,W,W,W,D,W,W,P,W,H,H,H,H,H,H,W,P,W,W,D,W,W,W,W,W,W],
  // Row 16
  [W,W,W,W,W,W,D,W,W,P,W,W,W,W,W,W,W,W,P,W,W,D,W,W,W,W,W,W],
  // Row 17
  [W,W,W,W,W,W,D,W,W,P,P,P,P,P,P,P,P,P,P,W,W,D,W,W,W,W,W,W],
  // Row 18
  [W,W,W,W,W,W,D,W,W,P,W,W,W,W,W,W,W,W,P,W,W,D,W,W,W,W,W,W],
  // Row 19
  [W,D,D,D,D,D,D,D,D,D,D,D,D,W,W,D,D,D,D,D,D,D,D,D,D,D,D,W],
  // Row 20
  [W,D,W,W,W,W,D,W,W,W,W,W,D,W,W,D,W,W,W,W,W,D,W,W,W,W,D,W],
  // Row 21
  [W,D,W,W,W,W,D,W,W,W,W,W,D,W,W,D,W,W,W,W,W,D,W,W,W,W,D,W],
  // Row 22
  [W,O,D,D,W,W,D,D,D,D,D,D,D,P,P,D,D,D,D,D,D,D,W,W,D,D,O,W],
  // Row 23
  [W,W,W,D,W,W,D,W,W,D,W,W,W,W,W,W,W,W,D,W,W,D,W,W,D,W,W,W],
  // Row 24
  [W,W,W,D,W,W,D,W,W,D,W,W,W,W,W,W,W,W,D,W,W,D,W,W,D,W,W,W],
  // Row 25
  [W,D,D,D,D,D,D,W,W,D,D,D,D,W,W,D,D,D,D,W,W,D,D,D,D,D,D,W],
  // Row 26
  [W,D,W,W,W,W,W,W,W,W,W,W,D,W,W,D,W,W,W,W,W,W,W,W,W,W,D,W],
  // Row 27
  [W,D,W,W,W,W,W,W,W,W,W,W,D,W,W,D,W,W,W,W,W,W,W,W,W,W,D,W],
  // Row 28
  [W,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,W],
  // Row 29
  [W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W],
  // Row 30
  [W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W],
];
