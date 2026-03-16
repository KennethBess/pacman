import { Position, Direction, GhostName } from "../types";
import { createGhost, GhostData } from "../ghost";

function getChaseTarget(
  playerTile: Position,
  _playerDir: Direction,
  _shadowTile: Position,
): Position {
  return { ...playerTile };
}

export function createShadow(): GhostData {
  return createGhost(GhostName.SHADOW, getChaseTarget);
}
