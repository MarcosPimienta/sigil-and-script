class AudioEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = true;
  private activeOscillators: { osc: OscillatorNode; gain: GainNode }[] = [];
  private loopInterval: any = null;

  init() {
    if (this.ctx) return;
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    this.ctx = new AudioContextClass();
  }

  setMute(muted: boolean) {
    this.isMuted = muted;
    if (muted) {
      this.stopAmbient();
    } else {
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      this.playAmbient();
    }
  }

  getMuted() {
    return this.isMuted;
  }

  playCrack() {
    this.init();
    if (this.isMuted || !this.ctx) return;

    const ctx = this.ctx;
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const duration = 0.25;
    const bufferSize = ctx.sampleRate * duration;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noiseNode = ctx.createBufferSource();
    noiseNode.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1000, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + duration);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.4, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

    noiseNode.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noiseNode.start();
    noiseNode.stop(ctx.currentTime + duration);

    const thud = ctx.createOscillator();
    const thudGain = ctx.createGain();
    thud.type = 'triangle';
    thud.frequency.setValueAtTime(120, ctx.currentTime);
    thud.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.15);

    thudGain.gain.setValueAtTime(0.6, ctx.currentTime);
    thudGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);

    thud.connect(thudGain);
    thudGain.connect(ctx.destination);

    thud.start();
    thud.stop(ctx.currentTime + 0.15);
  }

  playAmbient() {
    this.init();
    if (this.isMuted || !this.ctx) return;

    const ctx = this.ctx;
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    this.stopAmbient();

    const chords = [
      [220, 261.63, 329.63, 392.00], // Am7
      [146.83, 293.66, 349.23, 440.00], // Dm7
      [196.00, 246.94, 392.00, 493.88], // G7
      [261.63, 329.63, 392.00, 489.99], // Cmaj7
    ];

    let chordIndex = 0;

    const playChord = () => {
      if (this.isMuted || !this.ctx) return;
      const freqList = chords[chordIndex];
      const now = this.ctx.currentTime;
      const chordDuration = 5.0;

      freqList.forEach((freq) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.06, now + 2.0);
        gain.gain.setValueAtTime(0.06, now + 3.0);
        gain.gain.exponentialRampToValueAtTime(0.001, now + chordDuration);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + chordDuration);

        this.activeOscillators.push({ osc, gain });
      });

      chordIndex = (chordIndex + 1) % chords.length;
    };

    playChord();
    this.loopInterval = setInterval(playChord, 4500);
  }

  stopAmbient() {
    if (this.loopInterval) {
      clearInterval(this.loopInterval);
      this.loopInterval = null;
    }
    this.activeOscillators.forEach(({ osc }) => {
      try {
        osc.stop();
      } catch {
        // already stopped
      }
    });
    this.activeOscillators = [];
  }
}

export const audioEngine = new AudioEngine();
export type { AudioEngine };
