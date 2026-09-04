/**
 * MeowTrail Sound Effects (Web Audio API)
 * 
 * Usage: <script is:inline src="/sfx.js"></script>
 * Then call: SFX.place(), SFX.error(), SFX.win(), SFX.toggle()
 * 
 * Default: muted. User must click sound button to enable.
 */

const SFX = (function() {
  let ctx = null;
  let muted = true;
  
  function getCtx() {
    if (!ctx) {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    return ctx;
  }
  
  function playTone(freq, duration, type, volume) {
    if (muted) return;
    try {
      const c = getCtx();
      const osc = c.createOscillator();
      const gain = c.createGain();
      osc.type = type || 'sine';
      osc.frequency.setValueAtTime(freq, c.currentTime);
      gain.gain.setValueAtTime(volume || 0.15, c.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration);
      osc.connect(gain);
      gain.connect(c.destination);
      osc.start(c.currentTime);
      osc.stop(c.currentTime + duration);
    } catch(e) {}
  }
  
  function playNoise(duration, volume) {
    if (muted) return;
    try {
      const c = getCtx();
      const bufferSize = c.sampleRate * duration;
      const buffer = c.createBuffer(1, bufferSize, c.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.5;
      }
      const source = c.createBufferSource();
      source.buffer = buffer;
      const gain = c.createGain();
      gain.gain.setValueAtTime(volume || 0.08, c.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration);
      const filter = c.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(3000, c.currentTime);
      source.connect(filter);
      filter.connect(gain);
      gain.connect(c.destination);
      source.start(c.currentTime);
    } catch(e) {}
  }
  
  return {
    get muted() { return muted; },
    
    toggle: function() {
      muted = !muted;
      if (!muted) {
        // Play a short confirmation sound
        playTone(880, 0.1, 'sine', 0.1);
        setTimeout(function() { playTone(1100, 0.15, 'sine', 0.1); }, 100);
      }
      return muted;
    },
    
    // Place a cat - soft pop
    place: function() {
      playTone(600, 0.08, 'sine', 0.12);
      setTimeout(function() { playTone(900, 0.06, 'sine', 0.08); }, 40);
    },
    
    // Remove a cat - soft click
    remove: function() {
      playTone(400, 0.06, 'sine', 0.08);
    },
    
    // Violation/error - short buzz
    error: function() {
      playTone(200, 0.15, 'square', 0.08);
      playNoise(0.1, 0.05);
    },
    
    // Win - celebration melody
    win: function() {
      var notes = [523, 659, 784, 1047]; // C5, E5, G5, C6
      notes.forEach(function(freq, i) {
        setTimeout(function() {
          playTone(freq, 0.3, 'sine', 0.12);
        }, i * 150);
      });
    },
    
    // Hint reveal - gentle chime
    hint: function() {
      playTone(880, 0.2, 'sine', 0.08);
      setTimeout(function() { playTone(1100, 0.25, 'sine', 0.06); }, 150);
    },
    
    // Mark/unmark X - soft tick
    mark: function() {
      playTone(500, 0.04, 'sine', 0.06);
    }
  };
})();
