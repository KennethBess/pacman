import { Direction } from "./types";

export class InputHandler {
  private bufferedDirection: Direction | null = null;
  private pauseRequested = false;
  private startRequested = false;
  private escapeRequested = false;
  private letterInput: string | null = null;
  private speedRunRequested = false;

  constructor(canvas: HTMLCanvasElement) {
    this.setupKeyboard();
    this.setupTouch(canvas);
  }

  private setupKeyboard(): void {
    window.addEventListener("keydown", (e) => {
      switch (e.key) {
        case "ArrowUp":
        case "w":
        case "W":
          this.bufferedDirection = Direction.UP;
          e.preventDefault();
          break;
        case "ArrowDown":
          this.bufferedDirection = Direction.DOWN;
          e.preventDefault();
          break;
        case "s":
        case "S":
          this.bufferedDirection = Direction.DOWN;
          this.speedRunRequested = true;
          e.preventDefault();
          break;
        case "ArrowLeft":
        case "a":
        case "A":
          this.bufferedDirection = Direction.LEFT;
          e.preventDefault();
          break;
        case "ArrowRight":
        case "d":
        case "D":
          this.bufferedDirection = Direction.RIGHT;
          e.preventDefault();
          break;
        case "p":
        case "P":
          this.pauseRequested = true;
          e.preventDefault();
          break;
        case "Escape":
          this.escapeRequested = true;
          e.preventDefault();
          break;
        case "Enter":
          this.startRequested = true;
          e.preventDefault();
          break;
        default:
          if (e.key.length === 1 && /^[a-zA-Z]$/.test(e.key)) {
            this.letterInput = e.key.toUpperCase();
          }
          break;
      }
    });
  }

  private setupTouch(canvas: HTMLCanvasElement): void {
    let startX = 0;
    let startY = 0;

    canvas.addEventListener(
      "touchstart",
      (e) => {
        const touch = e.touches[0];
        startX = touch.clientX;
        startY = touch.clientY;
        e.preventDefault();
      },
      { passive: false },
    );

    canvas.addEventListener(
      "touchend",
      (e) => {
        const touch = e.changedTouches[0];
        const dx = touch.clientX - startX;
        const dy = touch.clientY - startY;
        const minSwipe = 30;

        if (Math.abs(dx) < minSwipe && Math.abs(dy) < minSwipe) return;

        if (Math.abs(dx) > Math.abs(dy)) {
          this.bufferedDirection =
            dx > 0 ? Direction.RIGHT : Direction.LEFT;
        } else {
          this.bufferedDirection =
            dy > 0 ? Direction.DOWN : Direction.UP;
        }
        e.preventDefault();
      },
      { passive: false },
    );
  }

  getBufferedDirection(): Direction | null {
    return this.bufferedDirection;
  }

  consumeBufferedDirection(): Direction | null {
    const dir = this.bufferedDirection;
    this.bufferedDirection = null;
    return dir;
  }

  consumePauseRequest(): boolean {
    const val = this.pauseRequested;
    this.pauseRequested = false;
    return val;
  }

  consumeStartRequest(): boolean {
    const val = this.startRequested;
    this.startRequested = false;
    return val;
  }

  consumeEscapeRequest(): boolean {
    const val = this.escapeRequested;
    this.escapeRequested = false;
    return val;
  }

  consumeLetterInput(): string | null {
    const val = this.letterInput;
    this.letterInput = null;
    return val;
  }

  consumeSpeedRunRequest(): boolean {
    const val = this.speedRunRequested;
    this.speedRunRequested = false;
    return val;
  }
}
