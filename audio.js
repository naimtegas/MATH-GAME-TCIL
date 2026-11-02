/**
 * AUDIO.JS
 * Web Audio API retro 8-bit chiptune sound generator & BGM synthesizer
 * Zero external audio files required. All procedural 8-bit square/noise waves.
 */

const SoundEngine = (() => {
  let audioCtx = null;
  let bgmOsc = null;
  let bgmGain = null;
  let bgmInterval = null;
  let isMuted = false;
  let bgmEnabled = false;

  function initAudio() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  // Create simple noise buffer for hit / explosion effects
  function createNoiseBuffer(duration = 0.2) {
    if (!audioCtx) return null;
    const bufferSize = audioCtx.sampleRate * duration;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }

  // SOUND EFFECTS
  function playBlip() {
    if (isMuted) return;
    initAudio();
    if (!audioCtx) return;

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(600, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(900, audioCtx.currentTime + 0.05);

    gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.06);

    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.06);
  }

  function playFireball() {
    if (isMuted) return;
    initAudio();
    if (!audioCtx) return;

    // Pitch sweep downwards
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(550, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(110, audioCtx.currentTime + 0.28);

    gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);

    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.3);

    // Complementary noise crackle
    const noise = audioCtx.createBufferSource();
    noise.buffer = createNoiseBuffer(0.25);
    const noiseGain = audioCtx.createGain();
    noiseGain.gain.setValueAtTime(0.12, audioCtx.currentTime + 0.05);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.28);
    noise.connect(noiseGain);
    noiseGain.connect(audioCtx.destination);
    noise.start(audioCtx.currentTime + 0.05);
  }

  function playShield() {
    if (isMuted) return;
    initAudio();
    if (!audioCtx) return;

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(320, audioCtx.currentTime);
    osc.frequency.linearRampToValueAtTime(680, audioCtx.currentTime + 0.15);
    osc.frequency.linearRampToValueAtTime(900, audioCtx.currentTime + 0.3);

    gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.35);

    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.35);
  }

  function playLightning() {
    if (isMuted) return;
    initAudio();
    if (!audioCtx) return;

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(80, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(950, audioCtx.currentTime + 0.08);
    osc.frequency.exponentialRampToValueAtTime(60, audioCtx.currentTime + 0.35);

    gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.38);

    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.38);

    const noise = audioCtx.createBufferSource();
    noise.buffer = createNoiseBuffer(0.35);
    const noiseGain = audioCtx.createGain();
    noiseGain.gain.setValueAtTime(0.2, audioCtx.currentTime + 0.06);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.38);
    noise.connect(noiseGain);
    noiseGain.connect(audioCtx.destination);
    noise.start(audioCtx.currentTime + 0.06);
  }

  function playHit() {
    if (isMuted) return;
    initAudio();
    if (!audioCtx) return;

    const noise = audioCtx.createBufferSource();
    noise.buffer = createNoiseBuffer(0.2);
    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.2);

    noise.connect(gain);
    gain.connect(audioCtx.destination);
    noise.start();
  }

  function playCorrect() {
    if (isMuted) return;
    initAudio();
    if (!audioCtx) return;

    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime + idx * 0.06);

      gain.gain.setValueAtTime(0.1, audioCtx.currentTime + idx * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + idx * 0.06 + 0.12);

      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(audioCtx.currentTime + idx * 0.06);
      osc.stop(audioCtx.currentTime + idx * 0.06 + 0.12);
    });
  }

  function playWrong() {
    if (isMuted) return;
    initAudio();
    if (!audioCtx) return;

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, audioCtx.currentTime);
    osc.frequency.setValueAtTime(110, audioCtx.currentTime + 0.12);

    gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.25);

    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.25);
  }

  function playVictory() {
    if (isMuted) return;
    initAudio();
    if (!audioCtx) return;

    // Fanfare: C4, E4, G4, C5, E5, G5, C6
    const fanfare = [
      { f: 261.63, d: 0.12 },
      { f: 329.63, d: 0.12 },
      { f: 392.00, d: 0.12 },
      { f: 523.25, d: 0.25 },
      { f: 659.25, d: 0.20 },
      { f: 783.99, d: 0.20 },
      { f: 1046.50, d: 0.50 }
    ];

    let time = audioCtx.currentTime + 0.05;
    fanfare.forEach(note => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(note.f, time);

      gain.gain.setValueAtTime(0.15, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + note.d);

      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(time);
      osc.stop(time + note.d);
      time += note.d + 0.02;
    });
  }

  // RETRO 8-BIT BGM GENERATOR
  // Loops a driving cyber-RPG arpeggio bassline using Web Audio API
  function startBgm() {
    if (bgmInterval || isMuted) return;
    initAudio();
    if (!audioCtx) return;
    bgmEnabled = true;

    // Chiptune bass arpeggio sequence in A minor (A2, C3, E3, G3, A3...)
    const bassline = [110, 130.81, 164.81, 196.00, 220, 196.00, 164.81, 130.81];
    let step = 0;

    bgmInterval = setInterval(() => {
      if (!bgmEnabled || isMuted || !audioCtx) return;

      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(bassline[step % bassline.length], audioCtx.currentTime);

      gain.gain.setValueAtTime(0.03, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.14);

      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.15);

      step++;
    }, 160);
  }

  function stopBgm() {
    bgmEnabled = false;
    if (bgmInterval) {
      clearInterval(bgmInterval);
      bgmInterval = null;
    }
  }

  function toggleMute() {
    isMuted = !isMuted;
    if (isMuted) {
      stopBgm();
    }
    return isMuted;
  }

  return {
    init: initAudio,
    playBlip,
    playFireball,
    playShield,
    playLightning,
    playHit,
    playCorrect,
    playWrong,
    playVictory,
    startBgm,
    stopBgm,
    toggleMute,
    isMuted: () => isMuted
  };
})();

if (typeof window !== 'undefined') {
  window.SoundEngine = SoundEngine;
}
