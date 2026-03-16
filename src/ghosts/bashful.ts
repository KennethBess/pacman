import { Position, Direction, GhostName, DIRECTION_VECTORS } from "../types";
import { createGhost, GhostData } from "../ghost";

function getChaseTarget(
  playerTile: Position,
  playerDir: Direction,
  shadowTile: Position,
): Position {
  const vec = DIRECTION_VECTORS[playerDir];
  const pivot = {
    x: playerTile.x + vec.x * 2,
    y: playerTile.y + vec.y * 2,
  };
  return {
    x: pivot.x + (pivot.x - shadowTile.x),
    y: pivot.y + (pivot.y - shadowTile.y),
  };
}

export function createBashful(): GhostData {
  return createGhost(GhostName.BASHFUL, getChaseTarget);
}
