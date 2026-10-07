import * as THREE from "three";

const foregrounds = {
  dark: { ink: '#162332', secondary: '#344353', rgb: [22, 35, 50] },
  light: { ink: '#f6f8fd', secondary: '#e3e8f1', rgb: [246, 248, 253] },
};
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
export function chooseTone(samples, previous) {
  const score = tone => Math.min(...samples.map(sample => contrast(foregrounds[tone].rgb, sample)));
  const dark = score('dark'), light = score('light');
  const best = dark >= light ? 'dark' : 'light';
  // Prevent flickering at the crossover while clouds move.
  return previous && score(previous) >= score(best) - .1 ? previous : best;
}

const selector = [
  '.sky-hero-logo', '.sky-intro h1', '.sky-positioning', '.sky-story p',
  '.sky-work-introduction', '.sky-project-caption', '.sky-section-intro',
  '.sky-reading-surface > p', '.sky-experience', '.sky-studies > article > h2',
  '.sky-studies > article > p', '.sky-study-credit', '.sky-archive',
  '.sky-work-experience > h2', '.sky-work-experience-item', '.sky-case-index', '.sky-case-sheet > header > h1', '.sky-case-sheet > header > p',
  '.sky-case-sheet > section', '.sky-case-navigation', '.meadow-footer',
  '.sky-settings-panel', '.sky-community-nav', '.sky-weather-chip',
].join(',');
export function createSkyContrast(renderer, camera, canvas) {
  const width = 32, height = 24;
  const buffer = new THREE.WebGLRenderTarget(width, height, { depthBuffer: false, stencilBuffer: false });
  const pixels = new Uint8Array(width * height * 4);
  const root = canvas.closest('.sky-app');
  const original = new Map();
  const wipes = new Map();
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  let targets = [], dirty = true, last = -Infinity;
  const collect = () => { targets = [...root.querySelectorAll(selector)]; dirty = true; };
  collect();
  const observer = new MutationObserver(collect);
  observer.observe(root, { childList: true, subtree: true });
  const markDirty = () => { dirty = true; };
  const motionChanged = () => {
    if (reduced.matches) { for (const wipe of wipes.values()) wipe.cancel(); wipes.clear(); }
  };
  reduced.addEventListener('change', motionChanged);
  window.addEventListener('scroll', markDirty, { passive: true, capture: true });
  const properties = ['--sky-ink', '--sky-secondary', '--sky-nav-ink', '--sky-old-ink'];
  return {
    update(scene, timestamp, transitioning = false) {
      if (!dirty && timestamp - last < (transitioning ? 32 : 500)) return;
      dirty = false; last = timestamp;
      renderer.setRenderTarget(buffer);
      renderer.render(scene, camera);
      renderer.readRenderTargetPixels(buffer, 0, 0, width, height, pixels);
      renderer.setRenderTarget(null);
      const screen = canvas.getBoundingClientRect();
      for (const target of targets) {
        const rect = target.getBoundingClientRect();
        if (!rect.width || !rect.height || rect.bottom < 0 || rect.top > screen.height) continue;
        const surface = target.matches('.sky-settings-panel,.sky-community-nav,.sky-weather-chip');
        const channels = surface ? getComputedStyle(target).backgroundColor.match(/[\d.]+/g)?.map(Number) : null;
        const alpha = channels?.length === 4 ? channels[3] : surface ? 1 : 0;
        const samples = [.2, .5, .8].map(fraction => {
          const x = Math.max(0, Math.min(width - 1, Math.floor((rect.left - screen.left + rect.width * fraction) / screen.width * width)));
          const y = Math.max(0, Math.min(height - 1, Math.floor((1 - (rect.top - screen.top + Math.min(rect.height, 160) * .5) / screen.height) * height)));
          const index = (y * width + x) * 4;
          return [0, 1, 2].map(channel => pixels[index + channel] * (1 - alpha) + (channels?.[channel] ?? 255) * alpha);
        });
        const tone = chooseTone(samples, target.dataset.skyTextTone);
        if (!original.has(target)) original.set(target, properties.map(property => target.style.getPropertyValue(property)));
        const colors = foregrounds[tone];
        // Secondary labels use primary ink if their sampled contrast is weaker than 4.5.
        const secondaryRgb = tone === 'dark' ? [52, 67, 83] : [227, 232, 241];
        const secondary = Math.min(...samples.map(sample => contrast(secondaryRgb, sample))) >= 4.5 ? colors.secondary : colors.ink;
        if (tone === target.dataset.skyTextTone && target.style.getPropertyValue('--sky-secondary') === secondary) continue;
        const previousTone = target.dataset.skyTextTone;
        const previousInk = getComputedStyle(target).color;
        wipes.get(target)?.cancel();
        target.style.setProperty('--sky-old-ink', previousInk || colors.ink);
        target.style.setProperty('--sky-ink', colors.ink);
        target.style.setProperty('--sky-secondary', secondary);
        target.style.setProperty('--sky-nav-ink', colors.ink);
        target.dataset.skyTextTone = tone;
        if (previousTone && previousTone !== tone && !reduced.matches) {
          const wipe = target.animate([
            { '--sky-ink-wipe': '-45%' },
            { '--sky-ink-wipe': '145%' },
          ], { duration: 420, easing: 'cubic-bezier(.2, 0, .2, 1)' });
          wipes.set(target, wipe);
          wipe.onfinish = () => { if (wipes.get(target) === wipe) wipes.delete(target); };
        }
      }
    },
    dispose() {
      for (const wipe of wipes.values()) wipe.cancel();
      wipes.clear();
      reduced.removeEventListener('change', motionChanged);
      observer.disconnect(); window.removeEventListener('scroll', markDirty, true);
      for (const [target, values] of original) {
        properties.forEach((property, i) => values[i] ? target.style.setProperty(property, values[i]) : target.style.removeProperty(property));
        delete target.dataset.skyTextTone;
      }
      buffer.dispose();
    },
  };
}
