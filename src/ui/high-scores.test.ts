import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import {
  loadHighScores,
  saveHighScores,
  addHighScore,
  scoreQualifies,
  HighScoreEntry,
} from "./high-scores";

// Minimal localStorage polyfill for Node test environment
function createMockStorage(): Storage {
  const store = new Map<string, string>();
  return {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => store.set(key, value),
    removeItem: (key: string) => store.delete(key),
    clear: () => store.clear(),
    get length() {
      return store.size;
    },
    key: (index: number) => [...store.keys()][index] ?? null,
  };
}

let mockStorage: Storage;

beforeEach(() => {
  mockStorage = createMockStorage();
  vi.stubGlobal("localStorage", mockStorage);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("high-scores", () => {
  describe("loadHighScores", () => {
    it("returns empty array when no scores saved", () => {
      expect(loadHighScores()).toEqual([]);
    });

    it("loads and sorts saved scores", () => {
      const scores: HighScoreEntry[] = [
        { name: "BBB", score: 100, level: 1 },
        { name: "AAA", score: 500, level: 3 },
      ];
      localStorage.setItem("pacman-high-scores", JSON.stringify(scores));
      const loaded = loadHighScores();
      expect(loaded[0].name).toBe("AAA");
      expect(loaded[1].name).toBe("BBB");
    });

    it("returns empty array on invalid JSON", () => {
      localStorage.setItem("pacman-high-scores", "not-json");
      expect(loadHighScores()).toEqual([]);
    });
  });

  describe("saveHighScores", () => {
    it("saves scores to localStorage", () => {
      const scores: HighScoreEntry[] = [
        { name: "AAA", score: 500, level: 3 },
      ];
      saveHighScores(scores);
      const raw = localStorage.getItem("pacman-high-scores");
      expect(raw).not.toBeNull();
      expect(JSON.parse(raw!)).toEqual(scores);
    });

    it("caps at 10 entries", () => {
      const scores: HighScoreEntry[] = Array.from({ length: 15 }, (_, i) => ({
        name: "TST",
        score: (i + 1) * 100,
        level: 1,
      }));
      saveHighScores(scores);
      const loaded = loadHighScores();
      expect(loaded.length).toBe(10);
      expect(loaded[0].score).toBe(1500);
    });
  });

  describe("addHighScore", () => {
    it("adds entry and returns sorted list", () => {
      const existing: HighScoreEntry[] = [
        { name: "AAA", score: 500, level: 3 },
      ];
      const result = addHighScore(existing, {
        name: "BBB",
        score: 1000,
        level: 5,
      });
      expect(result[0].name).toBe("BBB");
      expect(result[1].name).toBe("AAA");
    });

    it("persists to localStorage", () => {
      addHighScore([], { name: "AAA", score: 100, level: 1 });
      const loaded = loadHighScores();
      expect(loaded.length).toBe(1);
    });
  });

  describe("scoreQualifies", () => {
    it("qualifies when table has fewer than 10 entries", () => {
      expect(scoreQualifies([], 100)).toBe(true);
    });

    it("does not qualify with zero score", () => {
      expect(scoreQualifies([], 0)).toBe(false);
    });

    it("qualifies when score beats lowest in full table", () => {
      const full: HighScoreEntry[] = Array.from({ length: 10 }, (_, i) => ({
        name: "TST",
        score: (i + 1) * 100,
        level: 1,
      }));
      expect(scoreQualifies(full, 150)).toBe(true);
    });

    it("does not qualify when score is below lowest in full table", () => {
      const full: HighScoreEntry[] = Array.from({ length: 10 }, (_, i) => ({
        name: "TST",
        score: (i + 1) * 100,
        level: 1,
      }));
      expect(scoreQualifies(full, 50)).toBe(false);
    });
  });

  describe("localStorage unavailable", () => {
    it("loadHighScores returns empty array", () => {
      vi.stubGlobal("localStorage", {
        getItem: () => {
          throw new Error("disabled");
        },
        setItem: () => {
          throw new Error("disabled");
        },
        removeItem: () => {},
        clear: () => {},
        length: 0,
        key: () => null,
      });
      expect(loadHighScores()).toEqual([]);
    });

    it("saveHighScores does not throw", () => {
      vi.stubGlobal("localStorage", {
        getItem: () => null,
        setItem: () => {
          throw new Error("disabled");
        },
        removeItem: () => {},
        clear: () => {},
        length: 0,
        key: () => null,
      });
      expect(() =>
        saveHighScores([{ name: "AAA", score: 100, level: 1 }]),
      ).not.toThrow();
    });
  });
});
