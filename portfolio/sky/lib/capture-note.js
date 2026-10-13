import { toCanvas } from 'html-to-image';

// Foreign-object snapshots cannot load external images inside generated pseudo styles.
// Materialize the existing computed pseudo layers in a temporary clone so the image
// library embeds the exact paper texture and handwritten rules, without repainting.
export async function captureNote(card) {
  await document.fonts.ready;
  const clone = card.cloneNode(true);
  const originals = [card, ...card.querySelectorAll('*')];
  const copies = [clone, ...clone.querySelectorAll('*')];
  originals.forEach((source, i) => {
    const target = copies[i];
    if ('value' in source) target.value = source.value;
    for (const pseudo of ['::before', '::after']) {
      const computed = getComputedStyle(source, pseudo);
      if (computed.content === 'none' || computed.content === 'normal') continue;
      const layer = document.createElement('span');
      for (const property of computed) layer.style.setProperty(property, computed.getPropertyValue(property));
      layer.setAttribute('aria-hidden', 'true');
      if (pseudo === '::before') target.prepend(layer); else target.append(layer);
    }
  });
  clone.classList.add('sky-paper-capture');
  Object.assign(clone.style, { position: 'relative', left: '0', top: '0', width: `${card.offsetWidth}px`,
    height: `${card.offsetHeight}px`, transform: 'none', rotate: 'none', visibility: 'visible', opacity: '1' });
  const suppress = document.createElement('style');
  suppress.textContent = '.sky-paper-capture::before,.sky-paper-capture::after,.sky-paper-capture *::before,.sky-paper-capture *::after{content:none!important}';
  document.head.append(suppress);
  const host = document.createElement('div');
  host.setAttribute('aria-hidden', 'true');
  Object.assign(host.style, { position: 'fixed', left: '-10000px', top: '0', pointerEvents: 'none' });
  host.append(clone);
  card.parentElement.append(host);
  try {
    return await toCanvas(clone, { pixelRatio: 2, width: card.offsetWidth, height: card.offsetHeight,
      style: { position: 'relative', left: '0', top: '0', transform: 'none', rotate: 'none', margin: '0' } });
  } finally { host.remove(); suppress.remove(); }
}
