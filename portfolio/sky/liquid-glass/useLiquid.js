import { useEffect } from 'react';
import { liquidElements, registerLiquid, wakeLiquid } from './registry';

export function useLiquid(ref, options = {}) {
  useEffect(() => {
    const element = ref.current;
    if (!element?.classList.contains('liquid')) return;
    const registration = registerLiquid(element, options);
    const host = element.closest('.sky-community-nav') || element;
    let cleanupTimer;
    const moved = () => {
      // Removing the opt-in class unregisters the shape completely.
      if (!element.classList.contains('liquid')) liquidElements.delete(registration.entry);
      else liquidElements.add(registration.entry);
      registration.entry.movingUntil = performance.now() + 500; wakeLiquid();
    };
    const press = () => { registration.entry.press = 1; moved(); };
    const release = () => { registration.entry.press = 0; moved(); };
    const resize = new ResizeObserver(moved);
    resize.observe(element);
    const intersection = new IntersectionObserver(([item]) => { registration.entry.visible = item.isIntersecting; wakeLiquid(); });
    intersection.observe(element);
    const observer = new MutationObserver(moved);
    observer.observe(host, { attributes: true, subtree: true, attributeFilter: ['style', 'class', 'aria-selected'] });
    host.addEventListener('pointerdown', press);
    window.addEventListener('pointerup', release);
    window.addEventListener('pointercancel', release);
    window.addEventListener('scroll', moved, { passive: true });
    window.addEventListener('resize', moved);
    const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
    const reducedTransparency = matchMedia('(prefers-reduced-transparency: reduce)');
    reducedMotion.addEventListener('change', moved);
    reducedTransparency.addEventListener('change', moved);
    // Also wake a paused sky when CSS theme variables change.
    let lastTheme = getComputedStyle(element).getPropertyValue('--theme-blend');
    const theme = new MutationObserver(() => {
      const nextTheme = getComputedStyle(element).getPropertyValue('--theme-blend');
      if (nextTheme === lastTheme) return;
      lastTheme = nextTheme;
      if (cleanupTimer) return;
      cleanupTimer = setTimeout(() => { cleanupTimer = null; wakeLiquid(); }, 100);
    });
    theme.observe(element.closest('.sky-app'), { attributes: true, attributeFilter: ['style'] });
    return () => {
      resize.disconnect(); intersection.disconnect(); observer.disconnect(); theme.disconnect();
      clearTimeout(cleanupTimer);
      host.removeEventListener('pointerdown', press);
      window.removeEventListener('pointerup', release); window.removeEventListener('pointercancel', release);
      window.removeEventListener('scroll', moved); window.removeEventListener('resize', moved);
      reducedMotion.removeEventListener('change', moved); reducedTransparency.removeEventListener('change', moved);
      registration.dispose();
    };
  }, [ref]);
}
