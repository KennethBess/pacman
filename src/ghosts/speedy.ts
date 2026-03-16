import { Position, Direction, GhostName, DIRECTION_VECTORS } from "../types";
import { createGhost, GhostData } from "../ghost";

function getChaseTarget(
  playerTile: Position,
  playerDir: Direction,
  _shadowTile: Position,
): Position {
  const vec = DIRECTION_VECTORS[playerDir];
  return {
    x: playerTile.x + vec.x * 4,
    y: playerTile.y + vec.y * 4,
  };
}

export function createSpeedy(): GhostData {
  return createGhost(GhostName.SPEEDY, getChaseTarget);
}
