import { FIXED_DT, MAX_UPDATES_PER_FRAME } from "./config";

export type UpdateFn = (dt: number) => void;
export type RenderFn = (interpolation: number) => void;

export class GameLoop {
  private updateFn: UpdateFn;
  private renderFn: RenderFn;
  private accumulator = 0;
  private lastTime = 0;
  private rafId = 0;
  private running = false;

  constructor(updateFn: UpdateFn, renderFn: RenderFn) {
    this.updateFn = updateFn;
    this.renderFn = renderFn;
  }

  start(): void {
    if (this.running) return;
    this.running = true;
    this.lastTime = performance.now();
    this.accumulator = 0;
    this.rafId = requestAnimationFrame((t) => this.tick(t));
  }

  stop(): void {
    this.running = false;
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = 0;
    }
  }

  pause(): void {
    this.stop();
  }

  resume(): void {
    if (this.running) return;
    this.running = true;
    this.lastTime = performance.now();
    this.accumulator = 0;
    this.rafId = requestAnimationFrame((t) => this.tick(t));
  }

  isRunning(): boolean {
    return this.running;
  }

  private tick(currentTime: number): void {
    if (!this.running) return;

    const frameTime = (currentTime - this.lastTime) / 1000;
    this.lastTime = currentTime;

    // Cap accumulated time to prevent spiral of death
    this.accumulator += Math.min(frameTime, MAX_UPDATES_PER_FRAME * FIXED_DT);

    let updates = 0;
    while (this.accumulator >= FIXED_DT && updates < MAX_UPDATES_PER_FRAME) {
      this.updateFn(FIXED_DT);
      this.accumulator -= FIXED_DT;
      updates++;
    }

    const interpolation = this.accumulator / FIXED_DT;
    this.renderFn(interpolation);

    this.rafId = requestAnimationFrame((t) => this.tick(t));
  }
}
