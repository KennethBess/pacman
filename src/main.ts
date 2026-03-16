import { GameLoop } from "./game-loop";
import { InputHandler } from "./input";
import { Renderer } from "./renderer";
import {
  createGameState,
  updateGameState,
  AudioCallbacks,
} from "./game-state";
import { SoundManager } from "./audio/sound-manager";

function main(): void {
  const canvas = document.getElementById("game-canvas") as HTMLCanvasElement;
  if (!canvas) throw new Error("Canvas element not found");

  const renderer = new Renderer(canvas);
  const input = new InputHandler(canvas);
  const state = createGameState();
  const sound = new SoundManager();

  const audio: AudioCallbacks = {
    onPelletEat: () => sound.playPelletEat(),
    onPowerPelletEat: () => sound.playPowerPelletEat(),
    onGhostEaten: () => sound.playGhostEaten(),
    onDeath: () => sound.playDeath(),
    onLevelComplete: () => sound.playLevelComplete(),
    onGameStart: () => sound.playGameStart(),
    onStartSiren: (ratio) => sound.startSiren(ratio),
    onStopSiren: () => sound.stopSiren(),
    onStartFrightened: () => sound.startFrightenedSound(),
    onStopFrightened: () => sound.stopFrightenedSound(),
    onPauseAudio: () => sound.stopAll(),
    onResumeAudio: (ratio) => sound.startSiren(ratio),
  };

  function update(dt: number): void {
    const dir = input.getBufferedDirection();
    const pause = input.consumePauseRequest();
    const start = input.consumeStartRequest();
    const escape = input.consumeEscapeRequest();
    const letter = input.consumeLetterInput();
    const speedRun = input.consumeSpeedRunRequest();

    // Initialize audio on first user interaction (Enter or S to start)
    if (start || speedRun) {
      sound.init();
    }

    updateGameState(
      state,
      dt,
      dir,
      pause,
      {
        startRequested: start,
        escapeRequested: escape,
        letterInput: letter,
        speedRunRequested: speedRun,
      },
      audio,
    );
  }

  function render(interpolation: number): void {
    renderer.render(state, interpolation);
  }

  const loop = new GameLoop(update, render);
  loop.start();
}

main();
