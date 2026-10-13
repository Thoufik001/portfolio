import { windDynamics, wildlifeMix } from "./ambient-dynamics.js";
const MIX_LEVEL = 1.3;
// Opt-in weather ambience. Recordings load on demand and crossfade through gains.
// Thunder retains its separate flash-triggered mix.
export function createRainSound() {
  let context;
  let masterGain;
  let wildlifeGain;
  let thunderGain;
  let outputCompressor;
  let masterVolume = 1;
  let thunderBuffer;
  let active = false;
  let requestedRain = 0;
  const layers = new Map();
  const pending = new Set();
  let desired = {};
  let controller;
  let dynamicsTimer;
  let currentSettings = {};
  const wildlifeTimers = new Map();

  function silenceWildlife(name) {
    clearTimeout(wildlifeTimers.get(name));
    wildlifeTimers.delete(name);
    const layer = layers.get(name);
    if (!layer || !context) return;
    for (const shot of layer.shots) {
      shot.gain.gain.cancelAndHoldAtTime(context.currentTime);
      shot.gain.gain.setTargetAtTime(0, context.currentTime, .15);
      shot.source.stop(context.currentTime + .6);
    }
  }

  function scheduleWildlife(name) {
    const layer = layers.get(name);
    if (!layer || !active || !desired[name] || context?.state !== "running" || wildlifeTimers.has(name)) return;
    const dawn = wildlifeMix(currentSettings).dawn;
    const gap = layer.introPending ? .5 + Math.random()
      : name === "birds" ? (dawn ? 2 + Math.random() * 5 : 3 + Math.random() * 7) : 8 + Math.random() * 16;
    wildlifeTimers.set(name, setTimeout(() => {
      wildlifeTimers.delete(name);
      if (!active || !desired[name] || !context) return;
      if (context.state === "running") {
        layer.introPending = false;
        const duration = Math.min(layer.buffer.duration, name === "birds" ? 3 + Math.random() * 4 : 10 + Math.random() * 12);
        const phraseOffset = layer.phrases?.length ? layer.phrases[Math.floor(Math.random() * layer.phrases.length)] : null;
        const offset = phraseOffset === null ? Math.random() * Math.max(0, layer.buffer.duration - duration)
          : Math.min(phraseOffset, Math.max(0, layer.buffer.duration - duration));
        const gain = context.createGain();
        const source = context.createBufferSource();
        source.buffer = layer.buffer;
        source.connect(gain).connect(wildlifeGain);
        const now = context.currentTime;
        const volume = desired[name] * (.45 + Math.random() * .55) * (name === "night" ? .78 : 1);
        const fade = name === "birds" ? .5 : 3;
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(volume, now + fade);
        // Slow, uneven swells within each excerpt, below its chosen peak.
        let swellTime = fade + 1 + Math.random() * 2;
        while (swellTime < duration - fade) {
          gain.gain.linearRampToValueAtTime(volume * (.6 + Math.random() * .4), now + swellTime);
          swellTime += name === "night" ? 4 + Math.random() * 5 : 1.5 + Math.random() * 2.5;
        }
        gain.gain.linearRampToValueAtTime(volume * (.6 + Math.random() * .3), now + duration - fade);
        gain.gain.linearRampToValueAtTime(0, now + duration);
        const shot = { source, gain };
        layer.shots.add(shot);
        source.start(now, offset, duration);
        source.onended = () => { source.disconnect(); gain.disconnect(); layer.shots.delete(shot); };
        // Count the next quiet gap from the end of this passage.
        wildlifeTimers.set(name, setTimeout(() => { wildlifeTimers.delete(name); scheduleWildlife(name); }, duration * 1000));
      } else scheduleWildlife(name);
    }, gap * 1000));
  }

  function updateDynamics() {
    if (!context || !active) return;
    const nightBed = layers.get("night")?.bed;
    if (nightBed) nightBed.gain.gain.setTargetAtTime((desired.night || 0) * .22, context.currentTime, 3);
    for (const name of ["birds", "night"]) if (desired[name]) scheduleWildlife(name);
    const wind = windDynamics(currentSettings);
    for (const name of ["breeze", "rain"]) {
      const layer = layers.get(name);
      if (!layer) continue;
      const amount = !desired[name] ? 0 : name === "breeze" ? wind.breeze : desired.rain * wind.rain;
      layer.gain.gain.setTargetAtTime(amount, context.currentTime, name === "rain" ? 2 : 1.2);
    }
  }

  async function load(path) {
    const current = context;
    const response = await fetch(path, { signal: controller.signal });
    if (!response.ok) throw new Error(`Could not load ${path}`);
    return current.decodeAudioData(await response.arrayBuffer());
  }

  function makeSeamless(buffer) {
    // Overlap the recorded tail and beginning so the short ambient clip never clicks.
    const overlap = Math.min(Math.floor(buffer.sampleRate * .4), Math.floor(buffer.length / 8));
    const loop = context.createBuffer(buffer.numberOfChannels, buffer.length - overlap, buffer.sampleRate);
    for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
      const input = buffer.getChannelData(channel);
      const output = loop.getChannelData(channel);
      output.set(input.subarray(overlap, buffer.length));
      for (let i = 0; i < overlap; i++) {
        const blend = i / overlap;
        output[loop.length - overlap + i] = input[buffer.length - overlap + i] * (1 - blend) + input[i] * blend;
      }
    }
    return loop;
  }

  function start() {
    if (context) return true;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return false;
    context = new AudioContext();
    masterGain = context.createGain();
    masterGain.gain.value = masterVolume * MIX_LEVEL;
    wildlifeGain = context.createGain();
    wildlifeGain.gain.value = (masterVolume > 1 ? 1 + (masterVolume - 1) * 2 : masterVolume) * MIX_LEVEL;
    thunderGain = context.createGain();
    thunderGain.gain.value = Math.min(1, masterVolume) * MIX_LEVEL;
    outputCompressor = context.createDynamicsCompressor();
    outputCompressor.threshold.value = -3;
    outputCompressor.knee.value = 0;
    outputCompressor.ratio.value = 20;
    outputCompressor.attack.value = .003;
    outputCompressor.release.value = .25;
    masterGain.connect(outputCompressor);
    wildlifeGain.connect(outputCompressor);
    thunderGain.connect(outputCompressor);
    outputCompressor.connect(context.destination);
    active = true;
    context.resume().catch(() => {});
    controller = new AbortController();
    dynamicsTimer = setInterval(updateDynamics, 250);
    return true;
  }

  function resume() {
    if (active && context?.state === "suspended") context.resume().catch(() => {});
  }

  function ensureLayer(name) {
    if (layers.has(name) || pending.has(name) || !active) return;
    pending.add(name);
    const current = context;
    const path = name === "rain" ? "/sky/rain-ambience.mp3" : `/sky/${name}-ambience.mp3`;
    load(path).then((buffer) => {
      if (!active || context !== current) return;
      if (name === "birds" || name === "night") {
        let bed;
        if (name === "night") {
          const gain = current.createGain();
          gain.gain.value = 0;
          const source = current.createBufferSource();
          source.buffer = makeSeamless(buffer);
          source.loop = true;
          source.connect(gain).connect(wildlifeGain);
          source.start(0, Math.random() * source.buffer.duration);
          bed = { source, gain };
        }
        let phrases;
        if (name === "birds") {
          // Select audible passages rather than landing randomly in recorded silence.
          const samples = buffer.getChannelData(0), windows = [];
          for (let second = 0; second < buffer.duration - 2; second += .5) {
            let energy = 0, count = 0;
            for (let i = Math.floor(second * buffer.sampleRate); i < Math.min(samples.length, (second + 2) * buffer.sampleRate); i += 64) { energy += samples[i] ** 2; count++; }
            windows.push({ second, energy: energy / Math.max(1, count) });
          }
          const peak = Math.max(0, ...windows.map(window => window.energy));
          phrases = windows.filter(window => window.energy >= peak * .3).map(window => window.second);
        }
        layers.set(name, { buffer, bed, phrases, shots: new Set(), introPending: true });
        updateDynamics();
        scheduleWildlife(name);
      } else {
        const gain = current.createGain();
        gain.gain.value = 0;
        gain.connect(masterGain);
        const source = current.createBufferSource();
        source.buffer = makeSeamless(buffer);
        source.loop = true;
        source.connect(gain);
        source.start(0, Math.random() * source.buffer.duration);
        layers.set(name, { source, gain });
        updateDynamics();
      }
    }).catch(() => {}).finally(() => pending.delete(name));
    if (name === "rain" && !thunderBuffer) {
      load("/sky/thunder-rumble.mp3").then((buffer) => {
        if (active && context === current) thunderBuffer = buffer;
      }).catch(() => {});
    }
  }

  function setWeather(settings, audible = true) {
    currentSettings = settings;
    requestedRain = Math.max(0, Math.min(1, settings.rain || 0));
    const wildlife = wildlifeMix(settings);
    const previous = desired;
    desired = !audible ? {} : requestedRain > 0 ? { rain: requestedRain * .34125,
      birds: requestedRain < .35 ? wildlife.birds * (1 - requestedRain * 2) : 0 } : {
      breeze: Math.max(settings.wind ?? 5, settings.windGust ?? 0) > 0 ? 1 : 0,
      birds: wildlife.birds,
      night: wildlife.night,
    };
    if (!context || !active) return;
    for (const [name, volume] of Object.entries(desired)) if (volume > 0) ensureLayer(name);
    for (const name of ["birds", "night"]) {
      if (desired[name]) {
        if (!previous[name] && layers.has(name)) layers.get(name).introPending = true;
        scheduleWildlife(name);
      }
      else silenceWildlife(name);
    }
    updateDynamics();
  }

  function setRain(amount) {
    setWeather({ rain: amount }, amount > 0);
  }

  function thunder() {
    if (!active || !thunderBuffer || context.state !== "running") return;
    const now = context.currentTime;
    const source = context.createBufferSource();
    const filter = context.createBiquadFilter();
    const gain = context.createGain();
    source.buffer = thunderBuffer;
    // The field recording contains rainfall. Keep its low thunder body and
    // remove most of the extra rain hiss before layering it over the rain bed.
    filter.type = "lowpass";
    filter.frequency.value = 720;
    gain.gain.setValueAtTime(.001, now);
    gain.gain.linearRampToValueAtTime(1.35, now + .12);
    gain.gain.setValueAtTime(1.35, now + 3);
    gain.gain.exponentialRampToValueAtTime(.001, now + Math.min(8.8, thunderBuffer.duration));
    source.connect(filter).connect(gain).connect(thunderGain);
    source.start(now);
    source.onended = () => { source.disconnect(); filter.disconnect(); gain.disconnect(); };
  }

  function stop() {
    active = false;
    clearInterval(dynamicsTimer);
    for (const timer of wildlifeTimers.values()) clearTimeout(timer);
    wildlifeTimers.clear();
    if (!context) return;
    controller?.abort();
    for (const layer of layers.values()) {
      if (layer.bed) { layer.bed.source.stop(); layer.bed.source.disconnect(); layer.bed.gain.disconnect(); }
      if (layer.source) { layer.source.stop(); layer.source.disconnect(); layer.gain.disconnect(); }
      for (const shot of layer.shots || []) { shot.source.stop(); shot.source.disconnect(); shot.gain.disconnect(); }
    }
    layers.clear();
    pending.clear();
    thunderBuffer = null;
    context.close();
    context = null;
    masterGain = wildlifeGain = thunderGain = outputCompressor = null;
  }

  function setVolume(value) {
    masterVolume = Math.max(0, Math.min(2, value));
    if (context && masterGain) {
      masterGain.gain.setTargetAtTime(masterVolume * MIX_LEVEL, context.currentTime, .08);
      wildlifeGain.gain.setTargetAtTime((masterVolume > 1 ? 1 + (masterVolume - 1) * 2 : masterVolume) * MIX_LEVEL, context.currentTime, .08);
      thunderGain.gain.setTargetAtTime(Math.min(1, masterVolume) * MIX_LEVEL, context.currentTime, .08);
    }
  }
  return { start, resume, setRain, setWeather, setVolume, thunder, stop };
}
