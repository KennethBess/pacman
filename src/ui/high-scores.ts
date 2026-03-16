const STORAGE_KEY = "pacman-high-scores";
const MAX_ENTRIES = 10;

export interface HighScoreEntry {
  name: string;
  score: number;
  level: number;
}

export function loadHighScores(): HighScoreEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as HighScoreEntry[];
    return parsed
      .sort((a, b) => b.score - a.score)
      .slice(0, MAX_ENTRIES);
  } catch {
    return [];
  }
}

export function saveHighScores(entries: HighScoreEntry[]): void {
  try {
    const sorted = entries
      .sort((a, b) => b.score - a.score)
      .slice(0, MAX_ENTRIES);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sorted));
  } catch {
    // localStorage unavailable — silently ignore
  }
}

export function addHighScore(
  entries: HighScoreEntry[],
  entry: HighScoreEntry,
): HighScoreEntry[] {
  const updated = [...entries, entry]
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_ENTRIES);
  saveHighScores(updated);
  return updated;
}

export function scoreQualifies(
  entries: HighScoreEntry[],
  score: number,
): boolean {
  if (score <= 0) return false;
  if (entries.length < MAX_ENTRIES) return true;
  const sorted = [...entries].sort((a, b) => b.score - a.score);
  return score > sorted[sorted.length - 1].score;
}
