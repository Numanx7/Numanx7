
class SoundEngine {
  private ctx: AudioContext | null = null;

  private init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  jump() {
    this.playTone(150, 0.1, 'square');
  }

  score() {
    this.playTone(800, 0.1, 'sine');
    setTimeout(() => this.playTone(1000, 0.1, 'sine'), 100);
  }

  hit() {
    this.playTone(100, 0.3, 'sawtooth');
  }

  powerUp() {
    this.playTone(400, 0.1, 'sine');
    setTimeout(() => this.playTone(600, 0.1, 'sine'), 50);
    setTimeout(() => this.playTone(800, 0.1, 'sine'), 100);
  }

  private playTone(freq: number, duration: number, type: OscillatorType) {
    this.init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
    
    gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }
}

export const sounds = new SoundEngine();
