import { Position, Direction, GhostName } from "../types";
import { GHOST_SCATTER_TARGETS, GHOST_START_POSITIONS } from "../config";
import { createGhost, GhostData } from "../ghost";

export function createPokey(): GhostData {
  const ghost = createGhost(
    GhostName.POKEY,
    // placeholder — overridden below with closure over ghost
    (_p, _d, _s) => ({ ...GHOST_SCATTER_TARGETS.POKEY }),
  );

  ghost.getChaseTarget = (
    playerTile: Position,
    _playerDir: Direction,
    _shadowTile: Position,
  ): Position => {
    const dx = playerTile.x - ghost.tile.x;
    const dy = playerTile.y - ghost.tile.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist > 8) {
      return { ...playerTile };
    }
    return { ...GHOST_SCATTER_TARGETS.POKEY };
  };

  return ghost;
}
