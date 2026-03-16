import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import {
  createSpeedRunTimer,
  startTimer,
  pauseTimer,
  updateTimer,
  recordSplit,
  resetTimer,
  formatTime,
  saveBestTime,
  loadBestTimes,
  getBestTime,
} from "./speed-run";
import { SpeedRunTimer } from "./types";

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

beforeEach(() => {
  vi.stubGlobal("localStorage", createMockStorage());
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("speed-run timer", () => {
  let timer: SpeedRunTimer;

  beforeEach(() => {
    timer = createSpeedRunTimer();
  });

  it("creates timer with zero state", () => {
    expect(timer.elapsed).toBe(0);
    expect(timer.levelStart).toBe(0);
    expect(timer.splits).toEqual([]);
    expect(timer.running).toBe(false);
  });

  it("starts the timer", () => {
    startTimer(timer);
    expect(timer.running).toBe(true);
  });

  it("pauses the timer", () => {
    startTimer(timer);
    pauseTimer(timer);
    expect(timer.running).toBe(false);
  });

  it("advances elapsed when running", () => {
    startTimer(timer);
    updateTimer(timer, 1.5);
    expect(timer.elapsed).toBeCloseTo(1.5);
  });

  it("does not advance when paused", () => {
    updateTimer(timer, 1);
    expect(timer.elapsed).toBe(0);
  });

  it("resumes from paused elapsed", () => {
    startTimer(timer);
    updateTimer(timer, 2);
    pauseTimer(timer);
    updateTimer(timer, 5);
    startTimer(timer);
    updateTimer(timer, 1);
    expect(timer.elapsed).toBeCloseTo(3);
  });

  it("records a split", () => {
    startTimer(timer);
    updateTimer(timer, 10);
    recordSplit(timer, 1);
    expect(timer.splits[0]).toBeCloseTo(10);
    expect(timer.levelStart).toBeCloseTo(10);
  });

  it("records multiple splits", () => {
    startTimer(timer);
    updateTimer(timer, 10);
    recordSplit(timer, 1);
    updateTimer(timer, 8);
    recordSplit(timer, 2);
    expect(timer.splits).toHaveLength(2);
    expect(timer.splits[0]).toBeCloseTo(10);
    expect(timer.splits[1]).toBeCloseTo(18);
  });

  it("resets all state", () => {
    startTimer(timer);
    updateTimer(timer, 5);
    recordSplit(timer, 1);
    resetTimer(timer);
    expect(timer.elapsed).toBe(0);
    expect(timer.levelStart).toBe(0);
    expect(timer.splits).toEqual([]);
    expect(timer.running).toBe(false);
  });
});

describe("formatTime", () => {
  it("formats zero", () => {
    expect(formatTime(0)).toBe("00:00.00");
  });

  it("formats seconds and centiseconds", () => {
    expect(formatTime(5.25)).toBe("00:05.25");
  });

  it("formats minutes", () => {
    expect(formatTime(125.5)).toBe("02:05.50");
  });

  it("pads single digits", () => {
    expect(formatTime(3.05)).toBe("00:03.05");
  });
});

describe("best time persistence", () => {
  it("returns null when no best time exists", () => {
    expect(getBestTime(1)).toBeNull();
  });

  it("saves and loads best time", () => {
    saveBestTime(1, 45.5);
    expect(getBestTime(1)).toBeCloseTo(45.5);
  });

  it("only saves if better", () => {
    saveBestTime(1, 45.5);
    saveBestTime(1, 50);
    expect(getBestTime(1)).toBeCloseTo(45.5);
  });

  it("updates when time is better", () => {
    saveBestTime(1, 45.5);
    saveBestTime(1, 40);
    expect(getBestTime(1)).toBeCloseTo(40);
  });

  it("tracks different level counts independently", () => {
    saveBestTime(1, 10);
    saveBestTime(3, 30);
    expect(getBestTime(1)).toBeCloseTo(10);
    expect(getBestTime(3)).toBeCloseTo(30);
  });

  it("loads all best times", () => {
    saveBestTime(1, 10);
    saveBestTime(2, 25);
    const all = loadBestTimes();
    expect(Object.keys(all)).toHaveLength(2);
  });
});
