const clamp = (n, low = 0, high = 1) => Math.max(low, Math.min(high, n));
const smooth = (a, b, n) => {
  const t = clamp((n - a) / (b - a));
  return t * t * (3 - 2 * t);
};
function hash(n) {
  const value = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return value - Math.floor(value);
}
function noise(time, seed) {
  const point = Math.floor(time), fraction = time - point;
  const blend = fraction * fraction * (3 - 2 * fraction);
  return hash(point + seed) * (1 - blend) + hash(point + 1 + seed) * blend;
}

// Forecast strength shapes an irregular, coherent wind field. Its exact gust
// timing is illustrative; the API supplies interval maxima, not live gust events.
export function windDynamics(settings, seconds = Date.now() / 1000) {
  const average = clamp(settings.wind ?? 5, 0, 100);
  const maximum = Math.max(average, clamp(settings.windGust ?? average, 0, 130));
  const activity = clamp((average + (maximum - average) * .55) / 45);
  const seed = settings.seed ?? 0;
  const time = seconds * (.018 + activity * .042);
  const field = noise(time, seed) * .6 + noise(time * 2.17, seed + 31) * .28 + noise(time * .43, seed + 71) * .12;
  const swell = smooth(.62 - activity * .32, .89 - activity * .12, field);
  return {
    swell,
    speed: average * (.45 + field * .55) + (maximum - average) * swell,
    breeze: Math.min(.075, clamp(average / 4) * (.035 + clamp(maximum / 45) * .04) * swell) * 1.1,
    rain: .7 + noise(seconds * .012, seed + 103) * .2 + swell * .1,
  };
}

export function wildlifeMix(settings) {
  const altitude = settings.solarAltitude ?? (settings.light < .3 ? -20 : 30);
  const night = altitude < -6;
  const cold = settings.polar || (settings.temperature ?? 20) < 8;
  const dawn = altitude >= -6 && altitude < 12 && settings.solarRising !== false;
  const sheltered = 1 - clamp((settings.wind ?? 5) / 55);
  return {
    birds: !night && !cold ? .14 * (1 - clamp(settings.cloud ?? 0) * .45) * sheltered : 0,
    night: night && !cold ? .12 * sheltered : 0,
    dawn,
  };
}
