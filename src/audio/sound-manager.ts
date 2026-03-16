/**
 * SoundManager — Web Audio API sound effects using oscillator-generated tones.
 * All sounds are original (no audio files). AudioContext is created/resumed
 * on first user interaction to comply with browser autoplay policy.
 */
export class SoundManager {
  private ctx: AudioContext | null = null;
  private sirenOsc: OscillatorNode | null = null;
  private sirenGain: GainNode | null = null;
  private frightenedOsc: OscillatorNode | null = null;
  private frightenedGain: GainNode | null = null;
  private wakaToggle = false;

  /** Initialize or resume the AudioContext. Call on first user interaction. */
  init(): void {
    if (!this.ctx) {
      this.ctx = new AudioContext();
    }
    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  private ensureContext(): AudioContext | null {
    if (!this.ctx) return null;
    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }
    return this.ctx;
  }

  /** Short "waka" tone for regular pellet consumption. */
  playPelletEat(): void {
    const ctx = this.ensureContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    // Alternate between two pitches for the waka-waka effect
    this.wakaToggle = !this.wakaToggle;
    osc.frequency.value = this.wakaToggle ? 440 : 392;
    osc.type = "square";
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.07);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.07);
  }

  /** Distinct lower-pitched tone for power pellet consumption. */
  playPowerPelletEat(): void {
    const ctx = this.ensureContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.frequency.value = 220;
    osc.type = "square";
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(110, ctx.currentTime + 0.2);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.3);
  }

  /** Start the continuous ghost siren. */
  startSiren(pelletRatio = 1): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    this.stopSiren();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    // Higher pitch as fewer pellets remain
    const baseFreq = 200 + (1 - pelletRatio) * 300;
    osc.frequency.value = baseFreq;
    osc.type = "sawtooth";
    gain.gain.value = 0.04;

    // Modulate frequency for siren effect
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.connect(lfoGain);
    lfoGain.connect(osc.frequency);
    lfo.frequency.value = 4 + (1 - pelletRatio) * 4;
    lfoGain.gain.value = 50 + (1 - pelletRatio) * 100;

    lfo.start();
    osc.start();

    this.sirenOsc = osc;
    this.sirenGain = gain;
    // Store lfo reference on the osc for cleanup
    (osc as OscillatorNode & { _lfo?: OscillatorNode })._lfo = lfo;
  }

  /** Update siren pitch based on remaining pellet ratio (1 = full, 0 = empty). */
  updateSirenPitch(pelletRatio: number): void {
    if (!this.sirenOsc) return;
    const baseFreq = 200 + (1 - pelletRatio) * 300;
    this.sirenOsc.frequency.value = baseFreq;
  }

  /** Stop the siren. */
  stopSiren(): void {
    if (this.sirenOsc) {
      const lfo = (this.sirenOsc as OscillatorNode & { _lfo?: OscillatorNode })
        ._lfo;
      try {
        this.sirenOsc.stop();
      } catch {
        /* already stopped */
      }
      if (lfo) {
        try {
          lfo.stop();
        } catch {
          /* already stopped */
        }
      }
      this.sirenOsc = null;
      this.sirenGain = null;
    }
  }

  /** Start frightened mode repeating tone (replaces siren). */
  startFrightenedSound(): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    this.stopFrightenedSound();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.frequency.value = 300;
    osc.type = "triangle";
    gain.gain.value = 0.06;

    // Pulsing effect
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.connect(lfoGain);
    lfoGain.connect(gain.gain);
    lfo.frequency.value = 8;
    lfoGain.gain.value = 0.04;

    lfo.start();
    osc.start();

    this.frightenedOsc = osc;
    this.frightenedGain = gain;
    (osc as OscillatorNode & { _lfo?: OscillatorNode })._lfo = lfo;
  }

  /** Stop frightened mode sound. */
  stopFrightenedSound(): void {
    if (this.frightenedOsc) {
      const lfo = (
        this.frightenedOsc as OscillatorNode & { _lfo?: OscillatorNode }
      )._lfo;
      try {
        this.frightenedOsc.stop();
      } catch {
        /* already stopped */
      }
      if (lfo) {
        try {
          lfo.stop();
        } catch {
          /* already stopped */
        }
      }
      this.frightenedOsc = null;
      this.frightenedGain = null;
    }
  }

  /** Rising tone when eating a frightened ghost. */
  playGhostEaten(): void {
    const ctx = this.ensureContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.frequency.value = 300;
    osc.frequency.exponentialRampToValueAtTime(900, ctx.currentTime + 0.3);
    osc.type = "square";
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.4);
  }

  /** Descending tone sequence on player death. */
  playDeath(): void {
    const ctx = this.ensureContext();
    if (!ctx) return;

    const notes = [523, 494, 440, 392, 349, 330, 294, 262, 220, 180, 140];
    const noteLen = 0.1;

    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.frequency.value = freq;
      osc.type = "triangle";
      const start = ctx.currentTime + i * noteLen;
      gain.gain.setValueAtTime(0.1, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + noteLen * 0.9);

      osc.start(start);
      osc.stop(start + noteLen);
    });
  }

  /** Ascending celebratory tone on level completion. */
  playLevelComplete(): void {
    const ctx = this.ensureContext();
    if (!ctx) return;

    const notes = [262, 330, 392, 523, 659, 784];
    const noteLen = 0.12;

    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.frequency.value = freq;
      osc.type = "square";
      const start = ctx.currentTime + i * noteLen;
      gain.gain.setValueAtTime(0.08, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + noteLen * 0.9);

      osc.start(start);
      osc.stop(start + noteLen);
    });
  }

  /** Brief jingle on game start (READY → PLAYING). */
  playGameStart(): void {
    const ctx = this.ensureContext();
    if (!ctx) return;

    const notes = [392, 523, 659, 784];
    const noteLen = 0.08;

    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.frequency.value = freq;
      osc.type = "triangle";
      const start = ctx.currentTime + i * noteLen;
      gain.gain.setValueAtTime(0.1, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + noteLen * 0.9);

      osc.start(start);
      osc.stop(start + noteLen);
    });
  }

  /** Stop all continuous sounds. */
  stopAll(): void {
    this.stopSiren();
    this.stopFrightenedSound();
  }
}
