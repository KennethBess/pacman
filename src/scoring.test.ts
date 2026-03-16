import { describe, it, expect, beforeEach } from "vitest";
import {
  createScoreState,
  addPelletScore,
  addGhostScore,
  addFruitScore,
  checkExtraLife,
  resetGhostCombo,
  ScoreState,
} from "./scoring";
import { TileType } from "./types";
import { PELLET_SCORE, POWER_PELLET_SCORE, EXTRA_LIFE_SCORE } from "./config";

describe("Scoring", () => {
  let score: ScoreState;

  beforeEach(() => {
    score = createScoreState();
  });

  describe("pellet scoring", () => {
    it("awards points for regular pellets", () => {
      addPelletScore(score, TileType.PELLET);
      expect(score.score).toBe(PELLET_SCORE);
    });

    it("awards points for power pellets", () => {
      addPelletScore(score, TileType.POWER_PELLET);
      expect(score.score).toBe(POWER_PELLET_SCORE);
    });

    it("resets ghost combo on power pellet", () => {
      score.ghostComboIndex = 3;
      addPelletScore(score, TileType.POWER_PELLET);
      expect(score.ghostComboIndex).toBe(0);
    });
  });

  describe("ghost combo", () => {
    it("awards 200 for first ghost", () => {
      const points = addGhostScore(score);
      expect(points).toBe(200);
    });

    it("awards escalating points for consecutive ghosts", () => {
      const expected = [200, 400, 800, 1600];
      for (let i = 0; i < 4; i++) {
        const points = addGhostScore(score);
        expect(points).toBe(expected[i]);
      }
    });

    it("caps at max combo value", () => {
      for (let i = 0; i < 5; i++) {
        addGhostScore(score);
      }
      // 5th ghost should still get 1600 (capped)
      expect(score.score).toBe(200 + 400 + 800 + 1600 + 1600);
    });

    it("resets combo", () => {
      addGhostScore(score);
      addGhostScore(score);
      resetGhostCombo(score);
      const points = addGhostScore(score);
      expect(points).toBe(200);
    });
  });

  describe("extra life", () => {
    it("awards extra life at threshold", () => {
      score.score = EXTRA_LIFE_SCORE;
      const awarded = checkExtraLife(score);
      expect(awarded).toBe(true);
      expect(score.extraLifeAwarded).toBe(true);
    });

    it("only awards extra life once", () => {
      score.score = EXTRA_LIFE_SCORE;
      checkExtraLife(score);
      const second = checkExtraLife(score);
      expect(second).toBe(false);
    });

    it("does not award before threshold", () => {
      score.score = EXTRA_LIFE_SCORE - 1;
      expect(checkExtraLife(score)).toBe(false);
    });
  });

  describe("fruit scoring", () => {
    it("awards fruit points", () => {
      addFruitScore(score, 100);
      expect(score.score).toBe(100);
    });

    it("adds to existing score", () => {
      score.score = 500;
      addFruitScore(score, 300);
      expect(score.score).toBe(800);
    });
  });
});
