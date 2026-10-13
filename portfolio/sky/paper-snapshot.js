import { toPng } from 'html-to-image';

// Capture computed styles, pseudo-elements, fonts and current input values.
// Only the sheet's pose is removed; the mesh takes over that same rotation.
export async function paperSnapshot(note) {
  await document.fonts.ready;
  const width = note.offsetWidth, height = note.offsetHeight;
  const src = await toPng(note, {
    width, height, pixelRatio: 2,
    style: { transform: 'none', rotate: 'none', margin: '0' },
    filter: (node) => !node.classList?.contains('sky-note-folds'),
  });
  return { src, width, height };
}
