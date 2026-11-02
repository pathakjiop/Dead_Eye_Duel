// Web Audio API Synthesizer for EL DUELO
// Zero external files required; 100% low latency & reliable

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.windNode = null;
    this.windGain = null;
    this.heartbeatInterval = null;
  }

  init() {
    try {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
    } catch (e) {
      console.warn('AudioContext init error:', e);
    }
  }

  setMuted(muted) {
    this.muted = muted;
    if (muted) {
      this.stopWind();
      this.stopHeartbeat();
    }
  }

  vibrate(pattern) {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate(pattern);
      } catch {
        // Ignore haptics failure if unsupported
      }
    }
  }

  // --- WHITE NOISE BUFFER GENERATOR ---
  createNoiseBuffer(duration = 1.0) {
    if (!this.ctx) return null;
    try {
      const bufferSize = Math.max(1, Math.floor(this.ctx.sampleRate * duration));
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
      return buffer;
    } catch {
      return null;
    }
  }

  // --- 1. GUNSHOT (Noise crack + low-frequency gunpowder thump + tail) ---
  playGunshot() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const t = this.ctx.currentTime;

      // Noise crack
      const noiseBuffer = this.createNoiseBuffer(0.5);
      if (noiseBuffer) {
        const noise = this.ctx.createBufferSource();
        noise.buffer = noiseBuffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(4500, t);
        filter.frequency.exponentialRampToValueAtTime(300, t + 0.35);

        const noiseGain = this.ctx.createGain();
        noiseGain.gain.setValueAtTime(1.0, t);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);

        noise.connect(filter);
        filter.connect(noiseGain);
        noiseGain.connect(this.ctx.destination);

        noise.start(t);
        noise.stop(t + 0.45);
      }

      // Heavy low-end thump
      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(180, t);
      osc.frequency.exponentialRampToValueAtTime(32, t + 0.28);

      oscGain.gain.setValueAtTime(1.2, t);
      oscGain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

      osc.connect(oscGain);
      oscGain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.38);

      this.vibrate([60, 40, 90]);
    } catch (e) {
      console.warn('Gunshot audio error:', e);
    }
  }

  // --- 2. REVOLVER HAMMER COCK ("Click-clack") ---
  playHammerCock() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const playClick = (time, freq, gainVal) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        filter.type = 'bandpass';
        filter.frequency.value = freq;
        filter.Q.value = 8;

        osc.type = 'square';
        osc.frequency.setValueAtTime(freq, time);

        gain.gain.setValueAtTime(gainVal, time);
        gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.035);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(time);
        osc.stop(time + 0.04);
      };

      const t = this.ctx.currentTime;
      playClick(t, 2600, 0.4);
      playClick(t + 0.065, 3400, 0.6);

      this.vibrate(25);
    } catch {}
  }

  // --- 3. REVOLVER CYLINDER SPIN (Ratchet series) ---
  playCylinderSpin() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const t = this.ctx.currentTime;
      for (let i = 0; i < 6; i++) {
        const clickTime = t + i * 0.045;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(1800 + i * 100, clickTime);

        gain.gain.setValueAtTime(0.2, clickTime);
        gain.gain.exponentialRampToValueAtTime(0.001, clickTime + 0.02);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(clickTime);
        osc.stop(clickTime + 0.025);
      }
    } catch {}
  }

  // --- 4. HEARTBEAT ("Lub-dub" during countdown) ---
  playSingleHeartbeat() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const t = this.ctx.currentTime;
      const beat = (time, freq, vol) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, time);
        osc.frequency.exponentialRampToValueAtTime(35, time + 0.12);

        gain.gain.setValueAtTime(vol, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.14);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(time);
        osc.stop(time + 0.15);
      };

      beat(t, 75, 0.9);
      beat(t + 0.16, 65, 0.55);

      this.vibrate([40, 60, 30]);
    } catch {}
  }

  startHeartbeat(intervalMs = 900) {
    this.stopHeartbeat();
    this.playSingleHeartbeat();
    this.heartbeatInterval = setInterval(() => {
      this.playSingleHeartbeat();
    }, intervalMs);
  }

  stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  // --- 5. TRUMPET DRAW STINGER (¡FUEGO! Horn Blast) ---
  playTrumpetDraw() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const t = this.ctx.currentTime;
      const notes = [
        { f: 523.25, start: 0, dur: 0.12, vol: 0.4 },
        { f: 659.25, start: 0.09, dur: 0.12, vol: 0.45 },
        { f: 783.99, start: 0.18, dur: 0.45, vol: 0.65 },
      ];

      notes.forEach((n) => {
        const noteTime = t + n.start;
        const osc = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(1400, noteTime);
        filter.Q.value = 3.5;

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(n.f, noteTime);

        osc2.type = 'sawtooth';
        osc2.frequency.setValueAtTime(n.f * 1.004, noteTime);

        gain.gain.setValueAtTime(0.001, noteTime);
        gain.gain.linearRampToValueAtTime(n.vol, noteTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, noteTime + n.dur);

        osc.connect(filter);
        osc2.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(noteTime);
        osc2.start(noteTime);
        osc.stop(noteTime + n.dur + 0.05);
        osc2.stop(noteTime + n.dur + 0.05);
      });

      this.vibrate([100, 30, 100]);
    } catch {}
  }

  // --- 6. SPAGHETTI WESTERN MORRICONE WHISTLE ---
  playWesternWhistle() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const t = this.ctx.currentTime;
      const melody = [
        { f: 587.33, start: 0.0, dur: 0.28 },
        { f: 698.46, start: 0.28, dur: 0.32 },
        { f: 783.99, start: 0.60, dur: 0.25 },
        { f: 659.25, start: 0.85, dur: 0.5 },
      ];

      melody.forEach((note) => {
        const startT = t + note.start;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(note.f, startT);
        osc.frequency.linearRampToValueAtTime(note.f * 1.015, startT + note.dur * 0.7);

        const vib = this.ctx.createOscillator();
        const vibGain = this.ctx.createGain();
        vib.frequency.value = 5.5;
        vibGain.gain.value = 6.0;
        vib.connect(osc.frequency);
        vib.start(startT);
        vib.stop(startT + note.dur);

        gain.gain.setValueAtTime(0.001, startT);
        gain.gain.linearRampToValueAtTime(0.35, startT + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, startT + note.dur);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(startT);
        osc.stop(startT + note.dur + 0.05);
      });
    } catch {}
  }

  // --- 7. MARIACHI WIN FANFARE ---
  playMariachiWin() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const t = this.ctx.currentTime;
      const fanfare = [
        { f: 392.00, start: 0.0, dur: 0.12 },
        { f: 493.88, start: 0.12, dur: 0.12 },
        { f: 587.33, start: 0.24, dur: 0.15 },
        { f: 783.99, start: 0.39, dur: 0.28 },
        { f: 739.99, start: 0.67, dur: 0.12 },
        { f: 783.99, start: 0.79, dur: 0.65 },
      ];

      fanfare.forEach((n) => {
        const noteT = t + n.start;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        filter.type = 'bandpass';
        filter.frequency.value = 1600;
        filter.Q.value = 2.5;

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(n.f, noteT);

        gain.gain.setValueAtTime(0.001, noteT);
        gain.gain.linearRampToValueAtTime(0.4, noteT + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, noteT + n.dur);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(noteT);
        osc.stop(noteT + n.dur + 0.05);
      });
    } catch {}
  }

  // --- 8. RICOCHET / BULLET ZIP ---
  playRicochet() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(2600, t);
      osc.frequency.exponentialRampToValueAtTime(220, t + 0.28);

      gain.gain.setValueAtTime(0.4, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.32);
    } catch {}
  }

  // --- 9. FALSE START BUZZER ---
  playFalseStart() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(140, t);
      osc.frequency.setValueAtTime(110, t + 0.15);

      gain.gain.setValueAtTime(0.5, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.48);

      this.vibrate([200, 100, 200]);
    } catch {}
  }

  // --- 10. DESERT WIND AMBIENCE ---
  startDesertWind() {
    if (this.muted || this.windNode) return;
    this.init();
    if (!this.ctx) return;

    try {
      const bufferSize = this.ctx.sampleRate * 2;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        output[i] = (lastOut + 0.02 * white) / 1.02;
        lastOut = output[i];
        output[i] *= 3.5;
      }

      const node = this.ctx.createBufferSource();
      node.buffer = noiseBuffer;
      node.loop = true;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(380, this.ctx.currentTime);
      filter.Q.setValueAtTime(1.8, this.ctx.currentTime);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.001, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.18, this.ctx.currentTime + 1.2);

      node.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      node.start();
      this.windNode = node;
      this.windGain = gain;
    } catch (e) {
      console.warn('Wind audio error:', e);
      this.windNode = null;
    }
  }

  stopDesertWind() {
    this.stopWind();
  }

  stopWind() {
    if (this.windNode) {
      const node = this.windNode;
      const gain = this.windGain;
      this.windNode = null;
      this.windGain = null;

      try {
        if (gain && this.ctx) {
          gain.gain.linearRampToValueAtTime(0.0001, this.ctx.currentTime + 0.3);
        }
        setTimeout(() => {
          try {
            node.stop();
            node.disconnect();
          } catch {}
        }, 350);
      } catch {
        try { node.stop(); } catch {}
      }
    }
  }
}

export const soundEngine = new SoundEngine();
