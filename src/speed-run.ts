import { SpeedRunTimer } from "./types";

const STORAGE_KEY = "pacman-speed-run-best";

export function createSpeedRunTimer(): SpeedRunTimer {
  return {
    elapsed: 0,
    levelStart: 0,
    splits: [],
    running: false,
  };
}

export function startTimer(timer: SpeedRunTimer): void {
  timer.running = true;
}

export function pauseTimer(timer: SpeedRunTimer): void {
  timer.running = false;
}

export function updateTimer(timer: SpeedRunTimer, dt: number): void {
  if (timer.running) {
    timer.elapsed += dt;
  }
}

export function recordSplit(timer: SpeedRunTimer, level: number): void {
  timer.splits[level - 1] = timer.elapsed;
  timer.levelStart = timer.elapsed;
}

export function resetTimer(timer: SpeedRunTimer): void {
  timer.elapsed = 0;
  timer.levelStart = 0;
  timer.splits = [];
  timer.running = false;
}

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const centis = Math.floor((seconds * 100) % 100);
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}.${String(centis).padStart(2, "0")}`;
}

export interface BestTimes {
  [levelCount: string]: number;
}

export function loadBestTimes(): BestTimes {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as BestTimes;
  } catch {
    return {};
  }
}

export function saveBestTime(levelCount: number, time: number): void {
  try {
    const best = loadBestTimes();
    const key = String(levelCount);
    if (!(key in best) || time < best[key]) {
      best[key] = time;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(best));
    }
  } catch {
    // localStorage unavailable
  }
}

export function getBestTime(levelCount: number): number | null {
  const best = loadBestTimes();
  const key = String(levelCount);
  return key in best ? best[key] : null;
}
