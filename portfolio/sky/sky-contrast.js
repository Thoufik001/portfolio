import * as THREE from "three";

export function luminance(rgb) {
  const channels = rgb.map(value => {
    const s = value / 255;
    return s <= .04045 ? s / 12.92 : ((s + .055) / 1.055) ** 2.4;
  });
  return channels[0] * .2126 + channels[1] * .7152 + channels[2] * .0722;
}
export function contrast(a, b) {
  const x = luminance(a), y = luminance(b);
  return (Math.max(x, y) + .05) / (Math.min(x, y) + .05);
}
// A single rendered-lighting signal owns every themed region.
export function createSkyContrast(renderer, camera, canvas) {
  const width = 64, height = 48;
  const buffer = new THREE.WebGLRenderTarget(width, height, { depthBuffer: false, stencilBuffer: false });
  const pixels = new Uint8Array(width * height * 4);
  const root = canvas.closest('.sky-app');
  let daylight = null, last = null, auditAt = 0;
  let polarity = null, blend = null, transitionStart = 0, transitionFrom = 0;
  const smoothstep = (a, b, value) => {
    const t = Math.max(0, Math.min(1, (value - a) / (b - a)));
    return t * t * (3 - 2 * t);
  };
  return {
    update(scene, timestamp, _transitioning, solarHeight = 1) {
      renderer.setRenderTarget(buffer);
      renderer.render(scene, camera);
      renderer.readRenderTargetPixels(buffer, 0, 0, width, height, pixels);
      renderer.setRenderTarget(null);
      // Fixed sky coordinates: scrolling and panel placement cannot change the theme.
      let brightness = 0, count = 0;
      for (let y = 20; y < height; y += 2) for (let x = 2; x < width - 2; x += 2) {
        const i = (y * width + x) * 4;
        brightness += luminance([pixels[i], pixels[i + 1], pixels[i + 2]]); count++;
      }
      brightness /= count;
      const target = Math.max(0, Math.min(1, (brightness - .045) / .255));
      const dt = last === null ? 0 : Math.min(.1, (timestamp - last) / 1000);
      last = timestamp;
      daylight = daylight === null ? target : daylight + (target - daylight) * (1 - Math.exp(-dt / .18));
      // Stable polarity at rest; blending is temporal, never a permanent dusk color.
      // Sunset palettes can stay bright after the sun has set. Switch to evening
      // ink from solar position instead of waiting for the pink sky to darken.
      const nextPolarity = solarHeight < -.025 ? 0 : polarity === null ? (target >= .43 ? 1 : 0)
        : polarity === 1 ? (target < .40 ? 0 : 1) : (target > .46 ? 1 : 0);
      if (polarity === null) { polarity = nextPolarity; blend = polarity; }
      if (nextPolarity !== polarity) {
        transitionFrom = blend;
        transitionStart = timestamp;
        polarity = nextPolarity;
      }
      const progress = Math.min(1, (timestamp - transitionStart) / 300);
      blend = transitionFrom + (polarity - transitionFrom) * smoothstep(0, 1, progress);
      if (progress >= 1) blend = polarity;
      root.style.setProperty('--daylight', daylight.toFixed(6));
      root.style.setProperty('--theme-blend', blend.toFixed(6));
      root.style.setProperty('--theme-midpoint', (4 * blend * (1 - blend)).toFixed(6));
      if (import.meta.env.DEV && timestamp - auditAt > 80) {
        auditAt = timestamp;
        const screen = canvas.getBoundingClientRect();
        const regions = {};
        for (const [name, selector] of Object.entries({ heading: '.sky-intro h1', body: '.sky-story > p', picker: '.sky-community-option[aria-selected="true"]', card: '#sky-weather-panel' })) {
          const node = root.querySelector(selector);
          if (!node) continue;
          const rect = node.getBoundingClientRect();
          const surface = name === 'picker' ? root.querySelector('.sky-community-selection') : name === 'card' ? node : null;
          const samples = [.2, .5, .8].flatMap(xf => [.2, .5, .8].map(yf => {
            const x = Math.max(0, Math.min(width - 1, Math.floor((rect.left - screen.left + rect.width * xf) / screen.width * width)));
            const y = Math.max(0, Math.min(height - 1, Math.floor((1 - (rect.top - screen.top + Math.min(rect.height, 180) * yf) / screen.height) * height)));
            const i = (y * width + x) * 4;
            return [pixels[i], pixels[i + 1], pixels[i + 2]];
          }));
          regions[name] = { color: getComputedStyle(node).color, surface: surface ? getComputedStyle(surface).backgroundColor : null,
            track: name === 'picker' ? getComputedStyle(root.querySelector('.sky-community-nav')).backgroundColor : null, samples };
        }
        root.dataset.themeAudit = JSON.stringify({ daylight, blend, brightness, regions });
      }
      return Math.abs(blend - polarity) > .0001;
    },
    dispose() {
      ['--daylight', '--theme-blend', '--theme-midpoint'].forEach(key => root.style.removeProperty(key));
      delete root.dataset.themeAudit;
      buffer.dispose();
    },
  };
}
