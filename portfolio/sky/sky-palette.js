// Artistic zenith / horizon anchors from the supplied solar-elevation reference.
// Rising and setting tracks intentionally differ at the same elevation.
const rising = [
  [-24, '#071026', '#16223D', '#263650', .06],
  [-15, '#0A153A', '#4D2C58', '#77516F', .1],
  [-9, '#132758', '#AD6675', '#D18F92', .25],
  [-5, '#1E477C', '#B6BBDD', '#D9C4D8', .45],
  [0, '#367EB1', '#FFB377', '#FFD6A7', .7],
  [18, '#2877BF', '#D2EAF9', '#F1F7FF', 1],
  [65, '#1762B3', '#C4E6F8', '#F1F7FF', 1],
];
const setting = [
  [-24, '#071026', '#16223D', '#263650', .06],
  [-12, '#0A153A', '#302C50', '#65546E', .1],
  [-5, '#23345F', '#CB829E', '#E9A5B3', .3],
  [-1, '#3C4A84', '#EF927A', '#FFB28C', .5],
  [5, '#436E9E', '#F8B775', '#FFD3A0', .8],
  [25, '#347AB6', '#DBE7E8', '#F5F1DF', 1],
  [65, '#1762B3', '#C4E6F8', '#F1F7FF', 1],
];
function blend(a, b, t) {
  return `#${[1, 3, 5].map(i => Math.round(parseInt(a.slice(i, i + 2), 16) * (1 - t) + parseInt(b.slice(i, i + 2), 16) * t).toString(16).padStart(2, '0')).join('')}`;
}
export function solarPalette(altitude, isRising, moonLight = 0) {
  const stops = isRising ? rising : setting;
  let a = stops[0], b = a, t = 0;
  if (altitude >= stops.at(-1)[0]) a = b = stops.at(-1);
  else for (let i = 1; i < stops.length; i++) {
    if (altitude <= stops[i][0]) {
      a = stops[i - 1]; b = stops[i];
      const f = Math.max(0, (altitude - a[0]) / (b[0] - a[0]));
      t = f * f * (3 - 2 * f);
      break;
    }
  }
  // Moonlit night is illumination-dependent, rather than another clock preset.
  const moon = Math.max(0, Math.min(1, moonLight)) * Math.max(0, Math.min(1, (-altitude - 8) / 8));
  const palette = {
    top: blend(blend(a[1], b[1], t), '#091834', moon),
    bottom: blend(blend(a[2], b[2], t), '#29486D', moon),
    glow: blend(a[3], b[3], t),
    light: a[4] * (1 - t) + b[4] * t,
  };
  // Restore 85% of the earlier, softly luminous night. Fade this correction
  // entirely out before twilight so the approved daytime/dusk tracks stay intact.
  const nightFraction = Math.max(0, Math.min(1, (-altitude - 12) / 6));
  const night = .85 * nightFraction * nightFraction * (3 - 2 * nightFraction);
  return {
    top: blend(palette.top, '#172340', night),
    bottom: blend(palette.bottom, '#2B3B56', night),
    glow: blend(palette.glow, '#3A4B68', night),
    light: palette.light * (1 - night) + .1 * night,
  };
}
