// Registration is additive. No GPU target or glass pass exists without a member.
export const liquidElements = new Set();
export const LIQUID_WAKE = 'sky-liquid-wake';
export const wakeLiquid = () => window.dispatchEvent(new Event(LIQUID_WAKE));
export function registerLiquid(element, options) {
  const entry = { element, options, visible: true, press: 0, velocity: 0, lastRect: null, stretch: 1 };
  liquidElements.add(entry);
  wakeLiquid();
  return { entry, dispose() { liquidElements.delete(entry); delete element.dataset.liquidMode; wakeLiquid(); } };
}
