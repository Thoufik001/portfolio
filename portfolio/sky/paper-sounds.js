let audio;
let noise;
let paper;
let paperLoading;
const recording = typeof window === "undefined" ? null : fetch("/sky/paper-crumple.mp3")
  .then(response => response.ok ? response.arrayBuffer() : null)
  .catch(() => null);

export const PAPER_THROW_DELAY = .55;

export function preparePaperSound() {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return;
  try {
    audio ||= new AudioContext();
    if (audio.state === "suspended") audio.resume().catch(() => {});
    if (!paperLoading) paperLoading = recording?.then(data => data && audio.decodeAudioData(data.slice(0)))
      .then(buffer => { paper = buffer; })
      .catch(() => {});
  } catch { /* Sound is optional when audio is unavailable. */ }
}

function noiseBuffer() {
  if (noise) return noise;
  const sampleRate = audio.sampleRate;
  noise = audio.createBuffer(1, Math.ceil(sampleRate * 1.6), sampleRate);
  const samples = noise.getChannelData(0);
  for (let i = 0; i < samples.length; i++) samples[i] = Math.random() * 2 - 1;
  return noise;
}

export function playPaperCloseSound() {
  if (!audio || audio.state !== "running") return;
  const at = audio.currentTime + .01;
  const buffer = noiseBuffer();

  if (paper) {
    const crush = audio.createBufferSource();
    const paperVolume = audio.createGain();
    crush.buffer = paper;
    paperVolume.gain.setValueAtTime(.001, at);
    paperVolume.gain.linearRampToValueAtTime(.3, at + .035);
    paperVolume.gain.setValueAtTime(.3, at + .38);
    paperVolume.gain.exponentialRampToValueAtTime(.001, at + .49);
    crush.connect(paperVolume).connect(audio.destination);
    crush.start(at);
    crush.stop(at + .5);
  }

  const wind = audio.createBufferSource();
  const windFilter = audio.createBiquadFilter();
  const windVolume = audio.createGain();
  const flight = at + PAPER_THROW_DELAY;
  wind.buffer = buffer;
  windFilter.type = "lowpass";
  windFilter.frequency.setValueAtTime(450, flight);
  windFilter.frequency.exponentialRampToValueAtTime(1250, flight + .45);
  windFilter.frequency.exponentialRampToValueAtTime(350, flight + 1.1);
  windVolume.gain.setValueAtTime(.001, flight);
  windVolume.gain.linearRampToValueAtTime(.035, flight + .2);
  windVolume.gain.exponentialRampToValueAtTime(.001, flight + 1.1);
  wind.connect(windFilter).connect(windVolume).connect(audio.destination);
  wind.start(flight);
  wind.stop(flight + 1.1);
}
