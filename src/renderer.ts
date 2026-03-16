import {
  TILE_SIZE,
  MAZE_WIDTH,
  MAZE_HEIGHT,
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  COLORS,
  FRIGHTENED_FLASH_TIME,
  DYING_DURATION,
  MOUTH_ANGLE_MAX,
  MOUTH_ANIMATION_SPEED,
  getFruitForLevel,
} from "./config";
import { TileType, GhostState, GhostName, GamePhase, GameMode, Direction } from "./types";
import { GameState } from "./game-state";
import { getPlayerPixelPosition } from "./player";
import { getGhostPixelPosition, GhostData } from "./ghost";
import { formatTime, getBestTime } from "./speed-run";

const HUD_OFFSET_Y = MAZE_HEIGHT * TILE_SIZE;
const GHOST_COLORS: Record<string, string> = {
  [GhostName.SHADOW]: COLORS.ghostShadow,
  [GhostName.SPEEDY]: COLORS.ghostSpeedy,
  [GhostName.BASHFUL]: COLORS.ghostBashful,
  [GhostName.POKEY]: COLORS.ghostPokey,
};

/** Map direction to rotation angle for Pac-Man mouth facing. */
const DIRECTION_ANGLE: Record<Direction, number> = {
  [Direction.RIGHT]: 0,
  [Direction.DOWN]: Math.PI / 2,
  [Direction.LEFT]: Math.PI,
  [Direction.UP]: -Math.PI / 2,
};

export class Renderer {
  private ctx: CanvasRenderingContext2D;
  private canvas: HTMLCanvasElement;
  private powerPelletTimer = 0;
  private mouthTimer = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Failed to get 2D context");
    this.ctx = ctx;
  }

  render(state: GameState, interpolation: number): void {
    this.powerPelletTimer += 1 / 60;
    this.mouthTimer += 1 / 60;

    this.ctx.fillStyle = COLORS.background;
    this.ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    if (state.phase === GamePhase.TITLE_SCREEN) {
      this.renderTitleScreen(state);
      return;
    }

    this.renderMaze(state);
    this.renderPellets(state);

    if (
      state.phase === GamePhase.PLAYING ||
      state.phase === GamePhase.READY ||
      state.phase === GamePhase.PAUSED
    ) {
      this.renderPlayer(state, interpolation);
      this.renderGhosts(state, interpolation);
    } else if (state.phase === GamePhase.DYING) {
      this.renderDeathAnimation(state);
    }

    if (state.fruit.active) {
      this.renderFruit(state);
    }

    this.renderHUD(state);
    this.renderOverlays(state);
  }

  private isWall(state: GameState, x: number, y: number): boolean {
    if (x < 0 || x >= MAZE_WIDTH || y < 0 || y >= MAZE_HEIGHT) return true;
    return state.maze.getTile({ x, y }) === TileType.WALL;
  }

  private renderMaze(state: GameState): void {
    const ctx = this.ctx;
    const r = TILE_SIZE * 0.35; // corner radius

    ctx.strokeStyle = COLORS.wall;
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    for (let y = 0; y < MAZE_HEIGHT; y++) {
      for (let x = 0; x < MAZE_WIDTH; x++) {
        if (!this.isWall(state, x, y)) continue;

        const px = x * TILE_SIZE;
        const py = y * TILE_SIZE;
        const s = TILE_SIZE;

        // Check 4 cardinal neighbors
        const up = this.isWall(state, x, y - 1);
        const down = this.isWall(state, x, y + 1);
        const left = this.isWall(state, x - 1, y);
        const right = this.isWall(state, x + 1, y);

        // Check 4 diagonal neighbors for inner corners
        const upLeft = this.isWall(state, x - 1, y - 1);
        const upRight = this.isWall(state, x + 1, y - 1);
        const downLeft = this.isWall(state, x - 1, y + 1);
        const downRight = this.isWall(state, x + 1, y + 1);

        // Draw wall edges where wall meets non-wall
        // Each edge is a line along the wall boundary, with rounded corners

        // Draw rounded-rect fill with conditional corner rounding
        ctx.fillStyle = COLORS.wall;
        ctx.beginPath();

        // Top-left corner
        if (!up && !left) {
          ctx.moveTo(px + r, py);
        } else if (up && !left) {
          ctx.moveTo(px, py);
        } else if (!up && left) {
          ctx.moveTo(px + r, py);
          ctx.moveTo(px, py + r);
        } else {
          ctx.moveTo(px, py);
        }

        // Simplified: draw filled wall tile with rounded outer corners
        ctx.moveTo(px + ((!up && !left) ? r : 0), py);

        // Top edge -> top-right
        ctx.lineTo(px + s - ((!up && !right) ? r : 0), py);
        if (!up && !right) {
          ctx.quadraticCurveTo(px + s, py, px + s, py + r);
        } else {
          ctx.lineTo(px + s, py);
        }

        // Right edge -> bottom-right
        ctx.lineTo(px + s, py + s - ((!down && !right) ? r : 0));
        if (!down && !right) {
          ctx.quadraticCurveTo(px + s, py + s, px + s - r, py + s);
        } else {
          ctx.lineTo(px + s, py + s);
        }

        // Bottom edge -> bottom-left
        ctx.lineTo(px + ((!down && !left) ? r : 0), py + s);
        if (!down && !left) {
          ctx.quadraticCurveTo(px, py + s, px, py + s - r);
        } else {
          ctx.lineTo(px, py + s);
        }

        // Left edge -> top-left
        ctx.lineTo(px, py + ((!up && !left) ? r : 0));
        if (!up && !left) {
          ctx.quadraticCurveTo(px, py, px + r, py);
        } else {
          ctx.lineTo(px, py);
        }

        ctx.closePath();
        ctx.fill();

        // Draw inner corner cutouts where wall has both cardinal neighbors
        // but not the diagonal — creates the corridor rounding effect
        ctx.fillStyle = COLORS.background;
        if (up && left && !upLeft) {
          ctx.beginPath();
          ctx.moveTo(px, py);
          ctx.lineTo(px + r, py);
          ctx.quadraticCurveTo(px, py, px, py + r);
          ctx.closePath();
          ctx.fill();
        }
        if (up && right && !upRight) {
          ctx.beginPath();
          ctx.moveTo(px + s, py);
          ctx.lineTo(px + s - r, py);
          ctx.quadraticCurveTo(px + s, py, px + s, py + r);
          ctx.closePath();
          ctx.fill();
        }
        if (down && left && !downLeft) {
          ctx.beginPath();
          ctx.moveTo(px, py + s);
          ctx.lineTo(px + r, py + s);
          ctx.quadraticCurveTo(px, py + s, px, py + s - r);
          ctx.closePath();
          ctx.fill();
        }
        if (down && right && !downRight) {
          ctx.beginPath();
          ctx.moveTo(px + s, py + s);
          ctx.lineTo(px + s - r, py + s);
          ctx.quadraticCurveTo(px + s, py + s, px + s, py + s - r);
          ctx.closePath();
          ctx.fill();
        }
      }
    }

    // Draw ghost door
    ctx.fillStyle = "#FFB8FF";
    for (let y = 0; y < MAZE_HEIGHT; y++) {
      for (let x = 0; x < MAZE_WIDTH; x++) {
        const tile = state.maze.getTile({ x, y });
        if (tile === TileType.GHOST_DOOR) {
          ctx.fillRect(
            x * TILE_SIZE,
            y * TILE_SIZE + TILE_SIZE * 0.4,
            TILE_SIZE,
            TILE_SIZE * 0.2,
          );
        }
      }
    }
  }

  private renderPellets(state: GameState): void {
    const pelletRadius = TILE_SIZE * 0.15;
    const powerPelletBase = TILE_SIZE * 0.35;
    const pulseScale = 0.5 + 0.5 * Math.sin(this.powerPelletTimer * 4);
    const powerPelletRadius = powerPelletBase * (0.7 + 0.3 * pulseScale);

    for (let y = 0; y < MAZE_HEIGHT; y++) {
      for (let x = 0; x < MAZE_WIDTH; x++) {
        const tile = state.maze.getTile({ x, y });
        const cx = x * TILE_SIZE + TILE_SIZE / 2;
        const cy = y * TILE_SIZE + TILE_SIZE / 2;

        if (tile === TileType.PELLET) {
          this.ctx.fillStyle = COLORS.pellet;
          this.ctx.beginPath();
          this.ctx.arc(cx, cy, pelletRadius, 0, Math.PI * 2);
          this.ctx.fill();
        } else if (tile === TileType.POWER_PELLET) {
          this.ctx.fillStyle = COLORS.powerPellet;
          this.ctx.beginPath();
          this.ctx.arc(cx, cy, powerPelletRadius, 0, Math.PI * 2);
          this.ctx.fill();
        }
      }
    }
  }

  private renderPlayer(state: GameState, interpolation: number): void {
    const pos = getPlayerPixelPosition(state.player, interpolation);
    const cx = pos.x * TILE_SIZE + TILE_SIZE / 2;
    const cy = pos.y * TILE_SIZE + TILE_SIZE / 2;
    const radius = TILE_SIZE * 0.45;

    // Sinusoidal mouth animation: 0 to MOUTH_ANGLE_MAX and back
    const mouthAngle =
      MOUTH_ANGLE_MAX *
      Math.abs(Math.sin(this.mouthTimer * MOUTH_ANIMATION_SPEED));

    const facing = DIRECTION_ANGLE[state.player.direction];

    this.ctx.fillStyle = COLORS.player;
    this.ctx.beginPath();
    this.ctx.moveTo(cx, cy);
    this.ctx.arc(
      cx,
      cy,
      radius,
      facing + mouthAngle,
      facing + Math.PI * 2 - mouthAngle,
    );
    this.ctx.closePath();
    this.ctx.fill();
  }

  private renderDeathAnimation(state: GameState): void {
    const cx = state.player.tile.x * TILE_SIZE + TILE_SIZE / 2;
    const cy = state.player.tile.y * TILE_SIZE + TILE_SIZE / 2;
    const radius = TILE_SIZE * 0.45;

    // Progress: 1 at start of dying, 0 at end
    const progress = Math.max(0, state.phaseTimer / DYING_DURATION);
    // Pac-Man collapses: mouth opens wider as he shrinks
    const sweepAngle = Math.PI * 2 * progress;
    const shrinkRadius = radius * progress;

    if (shrinkRadius <= 0) return;

    const facing = DIRECTION_ANGLE[state.player.direction];
    const mouthAngle = Math.PI * (1 - progress);

    this.ctx.fillStyle = COLORS.player;
    this.ctx.beginPath();
    this.ctx.moveTo(cx, cy);
    this.ctx.arc(
      cx,
      cy,
      shrinkRadius,
      facing + mouthAngle,
      facing + Math.PI * 2 - mouthAngle,
    );
    this.ctx.closePath();
    this.ctx.fill();
  }

  private renderGhosts(state: GameState, interpolation: number): void {
    for (const ghost of state.ghosts) {
      this.renderGhost(ghost, interpolation);
    }
  }

  private renderGhost(ghost: GhostData, interpolation: number): void {
    const pos = getGhostPixelPosition(ghost, interpolation);
    const cx = pos.x * TILE_SIZE + TILE_SIZE / 2;
    const cy = pos.y * TILE_SIZE + TILE_SIZE / 2;
    const radius = TILE_SIZE * 0.45;

    if (ghost.state === GhostState.EATEN) {
      this.renderGhostEyes(cx, cy, radius, ghost.direction);
      return;
    }

    // Determine body color
    if (ghost.state === GhostState.FRIGHTENED) {
      const flashing =
        ghost.frightenedTimer <= FRIGHTENED_FLASH_TIME &&
        Math.floor(ghost.frightenedTimer * 6) % 2 === 0;
      this.ctx.fillStyle = flashing ? "#FFFFFF" : COLORS.ghostFrightened;
    } else {
      this.ctx.fillStyle = GHOST_COLORS[ghost.name] || COLORS.ghostShadow;
    }

    // Draw ghost body: dome top + scalloped bottom
    this.renderGhostBody(cx, cy, radius);

    // Eyes or frightened face
    if (ghost.state === GhostState.FRIGHTENED) {
      this.renderFrightenedFace(cx, cy, radius);
    } else {
      this.renderGhostEyes(cx, cy, radius, ghost.direction);
    }
  }

  private renderGhostBody(cx: number, cy: number, radius: number): void {
    const ctx = this.ctx;
    const top = cy - radius;
    const bottom = cy + radius;
    const left = cx - radius;
    const right = cx + radius;
    const scallops = 3;
    const scallopWidth = (radius * 2) / scallops;
    const scallopHeight = radius * 0.25;

    ctx.beginPath();
    // Dome top (semicircle)
    ctx.arc(cx, cy - radius * 0.1, radius, Math.PI, 0, false);
    // Right side down
    ctx.lineTo(right, bottom);
    // Scalloped bottom edge (3 bumps)
    for (let i = scallops - 1; i >= 0; i--) {
      const sx = left + i * scallopWidth;
      const midX = sx + scallopWidth / 2;
      ctx.quadraticCurveTo(midX, bottom + scallopHeight, sx, bottom);
    }
    // Left side up (closes back to dome)
    ctx.closePath();
    ctx.fill();
  }

  private renderGhostEyes(
    cx: number,
    cy: number,
    radius: number,
    direction: Direction,
  ): void {
    const ctx = this.ctx;
    const eyeW = radius * 0.3;
    const eyeH = radius * 0.35;
    const eyeOffsetX = radius * 0.3;
    const eyeY = cy - radius * 0.15;

    // Pupil offset based on direction
    let pdx = 0;
    let pdy = 0;
    const pupilShift = eyeW * 0.3;
    switch (direction) {
      case Direction.LEFT:
        pdx = -pupilShift;
        break;
      case Direction.RIGHT:
        pdx = pupilShift;
        break;
      case Direction.UP:
        pdy = -pupilShift;
        break;
      case Direction.DOWN:
        pdy = pupilShift;
        break;
    }

    // White eye ovals
    ctx.fillStyle = COLORS.ghostEyes;
    for (const sx of [-1, 1]) {
      ctx.beginPath();
      ctx.ellipse(cx + sx * eyeOffsetX, eyeY, eyeW, eyeH, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // Blue pupils
    const pupilW = eyeW * 0.5;
    const pupilH = eyeH * 0.5;
    ctx.fillStyle = "#0000FF";
    for (const sx of [-1, 1]) {
      ctx.beginPath();
      ctx.ellipse(
        cx + sx * eyeOffsetX + pdx,
        eyeY + pdy,
        pupilW,
        pupilH,
        0,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }
  }

  private renderFrightenedFace(
    cx: number,
    cy: number,
    radius: number,
  ): void {
    const ctx = this.ctx;

    // Small white eyes
    ctx.fillStyle = "#FFFFFF";
    const eyeR = radius * 0.12;
    const eyeOffX = radius * 0.3;
    const eyeY = cy - radius * 0.15;
    ctx.beginPath();
    ctx.arc(cx - eyeOffX, eyeY, eyeR, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx + eyeOffX, eyeY, eyeR, 0, Math.PI * 2);
    ctx.fill();

    // Squiggly mouth line
    ctx.strokeStyle = "#FFFFFF";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    const mouthY = cy + radius * 0.25;
    const mouthLeft = cx - radius * 0.5;
    const segments = 4;
    const segW = radius / segments;
    ctx.moveTo(mouthLeft, mouthY);
    for (let i = 0; i < segments; i++) {
      const x = mouthLeft + (i + 0.5) * segW;
      const y = mouthY + (i % 2 === 0 ? -radius * 0.12 : radius * 0.12);
      ctx.lineTo(x, y);
    }
    ctx.lineTo(mouthLeft + segments * segW, mouthY);
    ctx.stroke();
  }

  private renderHUD(state: GameState): void {
    const y = HUD_OFFSET_Y + TILE_SIZE;

    // Score
    this.ctx.fillStyle = COLORS.text;
    this.ctx.font = `${TILE_SIZE * 0.9}px monospace`;
    this.ctx.textAlign = "left";
    this.ctx.fillText(`SCORE: ${state.score.score}`, TILE_SIZE * 0.5, y);

    // Center column: timer (speed run) or lives text (classic)
    const livesX = CANVAS_WIDTH / 2;
    this.ctx.textAlign = "center";
    if (state.mode === GameMode.SPEED_RUN) {
      this.ctx.fillStyle = "#00FF00";
      this.ctx.fillText(formatTime(state.speedRunTimer.elapsed), livesX, y);
    } else {
      this.ctx.fillText(`LIVES: ${state.lives}`, livesX, y);
    }

    // Draw life icons (both modes)
    this.ctx.fillStyle = COLORS.player;
    for (let i = 0; i < state.lives; i++) {
      this.ctx.fillStyle = COLORS.player;
      this.ctx.beginPath();
      this.ctx.arc(
        livesX - TILE_SIZE * 2 + i * TILE_SIZE * 1.2,
        y + TILE_SIZE,
        TILE_SIZE * 0.35,
        0,
        Math.PI * 2,
      );
      this.ctx.fill();
    }

    // Level + fruit icon
    this.ctx.fillStyle = COLORS.text;
    this.ctx.textAlign = "right";
    this.ctx.fillText(
      `LEVEL: ${state.level}`,
      CANVAS_WIDTH - TILE_SIZE * 0.5,
      y,
    );

    // Fruit icon for current level
    const fruitType = getFruitForLevel(state.level);
    this.ctx.fillStyle = fruitType.color;
    this.ctx.beginPath();
    this.ctx.arc(
      CANVAS_WIDTH - TILE_SIZE * 1.5,
      y + TILE_SIZE,
      TILE_SIZE * 0.35,
      0,
      Math.PI * 2,
    );
    this.ctx.fill();
  }

  private renderFruit(state: GameState): void {
    if (!state.fruit.active || !state.fruit.type) return;
    const cx = state.fruit.tile.x * TILE_SIZE + TILE_SIZE / 2;
    const cy = state.fruit.tile.y * TILE_SIZE + TILE_SIZE / 2;
    const pulse = 0.85 + 0.15 * Math.sin(this.powerPelletTimer * 5);
    const radius = TILE_SIZE * 0.45 * pulse;

    this.ctx.fillStyle = state.fruit.type.color;
    this.ctx.beginPath();
    this.ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    this.ctx.fill();

    // White outline for visibility
    this.ctx.strokeStyle = "#FFFFFF";
    this.ctx.lineWidth = 1;
    this.ctx.stroke();
  }

  private renderOverlays(state: GameState): void {
    const cx = CANVAS_WIDTH / 2;
    const cy = (MAZE_HEIGHT * TILE_SIZE) / 2;

    this.ctx.textAlign = "center";

    switch (state.phase) {
      case GamePhase.READY:
        this.ctx.font = `bold ${TILE_SIZE * 1.2}px monospace`;
        this.ctx.fillStyle = COLORS.text;
        this.ctx.fillText("READY!", cx, cy);
        break;

      case GamePhase.PAUSED:
        // Semi-transparent backdrop
        this.ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
        this.ctx.fillRect(0, 0, CANVAS_WIDTH, MAZE_HEIGHT * TILE_SIZE);
        this.ctx.font = `bold ${TILE_SIZE * 1.5}px monospace`;
        this.ctx.fillStyle = COLORS.text;
        this.ctx.fillText("PAUSED", cx, cy);
        this.ctx.font = `${TILE_SIZE * 0.7}px monospace`;
        this.ctx.fillText("Press P to Resume", cx, cy + TILE_SIZE * 2);
        break;

      case GamePhase.GAME_OVER:
        this.renderGameOverScreen(state, cx, cy);
        break;

      case GamePhase.LEVEL_COMPLETE:
        this.ctx.font = `bold ${TILE_SIZE * 1.2}px monospace`;
        this.ctx.fillStyle = COLORS.text;
        this.ctx.fillText("LEVEL COMPLETE!", cx, cy);
        break;
    }
  }

  private renderTitleScreen(state: GameState): void {
    const cx = CANVAS_WIDTH / 2;
    const mazeH = MAZE_HEIGHT * TILE_SIZE;

    // Pulsing title
    const pulse = 0.85 + 0.15 * Math.sin(this.powerPelletTimer * 3);
    const titleSize = Math.round(TILE_SIZE * 2 * pulse);
    this.ctx.font = `bold ${titleSize}px monospace`;
    this.ctx.fillStyle = COLORS.player;
    this.ctx.textAlign = "center";
    this.ctx.fillText("PACMAN", cx, mazeH * 0.2);

    // Mode selection
    const promptAlpha = 0.5 + 0.5 * Math.sin(this.powerPelletTimer * 4);
    this.ctx.globalAlpha = promptAlpha;
    this.ctx.font = `${TILE_SIZE * 0.8}px monospace`;
    this.ctx.fillStyle = COLORS.text;
    this.ctx.fillText("ENTER \u2014 Classic", cx, mazeH * 0.32);
    this.ctx.fillText("S \u2014 Speed Run", cx, mazeH * 0.38);
    this.ctx.globalAlpha = 1;

    // Speed run best time
    const best = getBestTime(1);
    if (best !== null) {
      this.ctx.font = `${TILE_SIZE * 0.6}px monospace`;
      this.ctx.fillStyle = "#00FF00";
      this.ctx.fillText(`Best: ${formatTime(best)}`, cx, mazeH * 0.43);
    }

    // High score table
    this.ctx.font = `bold ${TILE_SIZE * 0.8}px monospace`;
    this.ctx.fillStyle = COLORS.player;
    this.ctx.fillText("HIGH SCORES", cx, mazeH * 0.48);

    this.ctx.font = `${TILE_SIZE * 0.7}px monospace`;
    this.ctx.fillStyle = COLORS.text;

    if (state.highScores.length === 0) {
      this.ctx.fillText("No scores yet", cx, mazeH * 0.55);
    } else {
      const startY = mazeH * 0.55;
      const lineH = TILE_SIZE * 1.2;
      for (let i = 0; i < state.highScores.length; i++) {
        const entry = state.highScores[i];
        const rank = `${i + 1}.`.padStart(3);
        const name = entry.name.padEnd(4);
        const score = String(entry.score).padStart(8);
        const lvl = `L${entry.level}`;
        this.ctx.fillText(
          `${rank} ${name} ${score}  ${lvl}`,
          cx,
          startY + i * lineH,
        );
      }
    }
  }

  private renderGameOverScreen(
    state: GameState,
    cx: number,
    cy: number,
  ): void {
    this.ctx.font = `bold ${TILE_SIZE * 1.5}px monospace`;
    this.ctx.fillStyle = "#FF0000";
    this.ctx.fillText("GAME OVER", cx, cy - TILE_SIZE * 2);

    if (state.mode === GameMode.SPEED_RUN) {
      this.renderSpeedRunResults(state, cx, cy);
      return;
    }

    this.ctx.font = `${TILE_SIZE * 0.8}px monospace`;
    this.ctx.fillStyle = COLORS.text;
    this.ctx.fillText(`SCORE: ${state.score.score}`, cx, cy);

    if (state.initialsEntry && !state.initialsEntry.confirmed) {
      this.renderInitialsEntry(state, cx, cy);
    } else {
      this.ctx.font = `${TILE_SIZE * 0.7}px monospace`;
      this.ctx.fillText("Press ENTER to restart", cx, cy + TILE_SIZE * 2.5);
      this.ctx.fillText("Press ESC for menu", cx, cy + TILE_SIZE * 4);
    }
  }

  private renderSpeedRunResults(
    state: GameState,
    cx: number,
    cy: number,
  ): void {
    const timer = state.speedRunTimer;

    // Total time
    this.ctx.font = `bold ${TILE_SIZE * 1}px monospace`;
    this.ctx.fillStyle = "#00FF00";
    this.ctx.fillText(`TIME: ${formatTime(timer.elapsed)}`, cx, cy);

    // New best indicator
    const levelsCompleted = timer.splits.length;
    const best = state.speedRunBestTime;
    if (best !== null && timer.elapsed <= best) {
      this.ctx.font = `bold ${TILE_SIZE * 0.9}px monospace`;
      this.ctx.fillStyle = COLORS.player;
      this.ctx.fillText("NEW BEST!", cx, cy + TILE_SIZE * 1.5);
    } else if (best !== null) {
      this.ctx.font = `${TILE_SIZE * 0.7}px monospace`;
      this.ctx.fillStyle = COLORS.text;
      this.ctx.fillText(`Best: ${formatTime(best)}`, cx, cy + TILE_SIZE * 1.5);
    }

    // Per-level splits
    if (levelsCompleted > 0) {
      this.ctx.font = `${TILE_SIZE * 0.6}px monospace`;
      this.ctx.fillStyle = COLORS.text;
      const splitsY = cy + TILE_SIZE * 3;
      const maxShow = Math.min(levelsCompleted, 6);
      for (let i = 0; i < maxShow; i++) {
        const splitTime = timer.splits[i];
        const levelTime =
          i === 0 ? splitTime : splitTime - timer.splits[i - 1];
        this.ctx.fillText(
          `L${i + 1}: ${formatTime(splitTime)}  (+${formatTime(levelTime)})`,
          cx,
          splitsY + i * TILE_SIZE * 1,
        );
      }
    }

    // Exit prompt
    this.ctx.font = `${TILE_SIZE * 0.6}px monospace`;
    this.ctx.fillStyle = COLORS.text;
    this.ctx.fillText(
      "Press ENTER or ESC",
      cx,
      cy + TILE_SIZE * 10,
    );
  }

  private renderInitialsEntry(
    state: GameState,
    cx: number,
    cy: number,
  ): void {
    const entry = state.initialsEntry!;

    this.ctx.font = `${TILE_SIZE * 0.8}px monospace`;
    this.ctx.fillStyle = COLORS.player;
    this.ctx.fillText("NEW HIGH SCORE!", cx, cy + TILE_SIZE * 2);

    this.ctx.font = `${TILE_SIZE * 0.7}px monospace`;
    this.ctx.fillStyle = COLORS.text;
    this.ctx.fillText("Enter your initials:", cx, cy + TILE_SIZE * 3.5);

    // Draw 3 character slots
    const charWidth = TILE_SIZE * 2;
    const startX = cx - charWidth;
    const charY = cy + TILE_SIZE * 5.5;

    this.ctx.font = `bold ${TILE_SIZE * 1.5}px monospace`;
    for (let i = 0; i < 3; i++) {
      const x = startX + i * charWidth;
      const isActive = i === entry.currentIndex;

      // Highlight active character
      if (isActive) {
        const flash = Math.floor(this.powerPelletTimer * 4) % 2 === 0;
        this.ctx.fillStyle = flash ? COLORS.player : COLORS.text;
      } else {
        this.ctx.fillStyle = COLORS.text;
      }

      this.ctx.fillText(entry.characters[i], x, charY);

      // Underline
      if (isActive) {
        this.ctx.fillRect(
          x - TILE_SIZE * 0.5,
          charY + TILE_SIZE * 0.3,
          TILE_SIZE,
          2,
        );
      }
    }

    this.ctx.font = `${TILE_SIZE * 0.6}px monospace`;
    this.ctx.fillStyle = COLORS.text;
    this.ctx.fillText(
      "Type letter or press ENTER",
      cx,
      cy + TILE_SIZE * 7.5,
    );
  }
}
