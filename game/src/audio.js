// Synthesised WebAudio sounds: no audio files. Chopping, sizzling,
// plating dings, the order bell and a small background pluck loop.
export function createAudio() {
  let ctx = null;
  let master = null;
  let musicTimer = null;
  let musicOn = true;
  let sizzleNodes = null;

  function ensure() {
    if (ctx) return true;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return false;
      ctx = new AudioCtx();
      master = ctx.createGain();
      master.gain.value = 0.5;
      master.connect(ctx.destination);
    } catch {
      return false;
    }
    return true;
  }

  function tone(freq, dur, type, vol, when = 0, slideTo = null) {
    if (!ensure()) return;
    const t0 = ctx.currentTime + when;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
    gain.gain.setValueAtTime(0, t0);
    gain.gain.linearRampToValueAtTime(vol, t0 + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
    osc.connect(gain);
    gain.connect(master);
    osc.start(t0);
    osc.stop(t0 + dur + 0.05);
  }

  function noise(dur, vol, filterFreq, when = 0) {
    if (!ensure()) return;
    const t0 = ctx.currentTime + when;
    const len = Math.max(1, Math.floor(ctx.sampleRate * dur));
    const buffer = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < len; i += 1) data[i] = Math.random() * 2 - 1;
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = filterFreq;
    filter.Q.value = 0.8;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(vol, t0);
    gain.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
    source.connect(filter);
    filter.connect(gain);
    gain.connect(master);
    source.start(t0);
    source.stop(t0 + dur);
  }

  const api = {
    unlock() {
      if (ensure() && ctx.state === 'suspended') ctx.resume().catch(() => {});
    },
    chop() {
      noise(0.09, 0.5, 1800);
      tone(180, 0.07, 'square', 0.12, 0, 90);
    },
    pickup() { tone(520, 0.08, 'sine', 0.18, 0, 700); },
    place() { noise(0.12, 0.25, 900); tone(240, 0.1, 'triangle', 0.15); },
    sizzleStart() {
      if (!ensure() || sizzleNodes) return;
      const len = ctx.sampleRate;
      const buffer = ctx.createBuffer(1, len, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < len; i += 1) data[i] = Math.random() * 2 - 1;
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.loop = true;
      const filter = ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.value = 4000;
      const gain = ctx.createGain();
      gain.gain.value = 0.05;
      source.connect(filter);
      filter.connect(gain);
      gain.connect(master);
      source.start();
      sizzleNodes = { source, gain };
    },
    sizzleStop() {
      if (!sizzleNodes) return;
      try { sizzleNodes.source.stop(); } catch { /* already stopped */ }
      sizzleNodes = null;
    },
    ding() { tone(880, 0.25, 'sine', 0.25); tone(1318, 0.35, 'sine', 0.2, 0.09); },
    bell() { tone(1046, 0.4, 'triangle', 0.22); tone(1568, 0.5, 'triangle', 0.15, 0.12); },
    serve() {
      tone(660, 0.12, 'sine', 0.22);
      tone(880, 0.12, 'sine', 0.22, 0.1);
      tone(1320, 0.3, 'sine', 0.22, 0.2);
    },
    fail() { tone(220, 0.3, 'sawtooth', 0.14, 0, 110); },
    denied() { tone(160, 0.12, 'square', 0.14); tone(140, 0.14, 'square', 0.14, 0.1); },
    clear() { noise(0.15, 0.3, 500); },
    // Gentle pentatonic pluck loop, started on first user gesture.
    startMusic() {
      if (!ensure() || musicTimer || !musicOn) return;
      const scale = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 587.33, 659.25];
      let step = 0;
      musicTimer = window.setInterval(() => {
        if (!musicOn || !ctx) return;
        const note = scale[(step * 5 + 3) % scale.length];
        tone(note, 0.5, 'triangle', 0.05);
        if (step % 4 === 0) tone(note / 2, 0.8, 'sine', 0.05);
        step += 1;
      }, 420);
    },
    toggleMusic() {
      musicOn = !musicOn;
      if (musicOn) api.startMusic();
      else if (musicTimer) { window.clearInterval(musicTimer); musicTimer = null; }
      return musicOn;
    },
  };
  return api;
}
