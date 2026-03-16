import {
  PELLET_SCORE,
  POWER_PELLET_SCORE,
  GHOST_SCORE_SEQUENCE,
  EXTRA_LIFE_SCORE,
} from "./config";
import { TileType } from "./types";

export interface ScoreState {
  score: number;
  ghostComboIndex: number;
  extraLifeAwarded: boolean;
  livesAwarded: number;
}

export function createScoreState(): ScoreState {
  return {
    score: 0,
    ghostComboIndex: 0,
    extraLifeAwarded: false,
    livesAwarded: 0,
  };
}

export function addPelletScore(state: ScoreState, tile: TileType): void {
  if (tile === TileType.PELLET) {
    state.score += PELLET_SCORE;
  } else if (tile === TileType.POWER_PELLET) {
    state.score += POWER_PELLET_SCORE;
    state.ghostComboIndex = 0; // reset combo on new power pellet
  }
}

export function addGhostScore(state: ScoreState): number {
  const index = Math.min(
    state.ghostComboIndex,
    GHOST_SCORE_SEQUENCE.length - 1,
  );
  const points = GHOST_SCORE_SEQUENCE[index];
  state.score += points;
  state.ghostComboIndex++;
  return points;
}

export function addFruitScore(state: ScoreState, points: number): void {
  state.score += points;
}

export function resetGhostCombo(state: ScoreState): void {
  state.ghostComboIndex = 0;
}

export function checkExtraLife(state: ScoreState): boolean {
  if (!state.extraLifeAwarded && state.score >= EXTRA_LIFE_SCORE) {
    state.extraLifeAwarded = true;
    state.livesAwarded++;
    return true;
  }
  return false;
}

export function resetScore(state: ScoreState): void {
  state.score = 0;
  state.ghostComboIndex = 0;
  state.extraLifeAwarded = false;
  state.livesAwarded = 0;
}
