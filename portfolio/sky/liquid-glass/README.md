# Liquid glass: selected hero pill prototype

This stage opts in only the Work / Playground / About selected pill. Review it before adding any other shape. It uses the existing Three.js sky context and fixed canvas: no new dependency, context, canvas, or independent render loop.

## Source files

Created here: `LiquidGlass.jsx`, `useLiquid.js`, `registry.js`, `pass.js`, `shader.js`, `liquid.css`, and this `README.md`.

Minimal marked integration edits:

- `portfolio/sky/SkyNavigation.jsx`: selected pill wrapper and `liquid` opt-in class.
- `portfolio/sky/sky-scene.js`: lazy same-context glass bridge, wake and disposal.
- `portfolio/sky/Sky.jsx`: rebuild the sky after context restoration; CSS fallback during loss.

Validation scripts: `work/liquid-glass-check.mjs`, `work/liquid-glass-math-check.mjs`, `work/liquid-glass-day-check.mjs`. Review images are `.impeccable/review/liquid-*.png`.

## Sampling and behavior

The original sky still renders at its original resolution. Only registered visible glass allocates a half-resolution render target. It is resampled when sky settings, animation or size change. While animated, scissoring limits the extra sky shading to the visible pill region plus a 40px displacement margin. A paused sky takes one complete capture, then reuses that texture through selection animation and dragging. No readback or canvas texture upload is used. All registered DOM rect reads are batched in the existing sky frame. Resize, intersection, scroll, press and Motion's inline transform changes wake the existing renderer.

The shader uses a rounded-rectangle SDF and a quartic-root convex bezel. The interior's height derivative is zero, hence zero refraction displacement. Snell refraction uses index 1.5 with small RGB dispersion. Tint and rim uniforms are read from `--liquid-tint` and `--liquid-rim`; CSS owns `--liquid-shadow`. Encoding and decoding are explicit because the existing sky shader writes display-encoded colors.

The selected pill now uses an 8px bezel with a 3px cap height and a 32px refraction travel scale (39px while pressed). Actual displacement depends on the surface normal and IOR; it remains below the source pass's 40px margin. This widens the visibly curved area compared with the initial 6px bezel/18px travel prototype. Only the sky is sampled: DOM text and other controls do not refract. On broad, soft cloud gradients the bending will still be less prominent than over sharp detail. The weather panel and all other buttons remain on their original CSS material pending this staged review.

The rail's old blur is disabled **only** while it contains a WebGL liquid pill, to avoid blurring the rim twice. Removing the class restores the original rail and selection. Labels remain accessible DOM above the render. Reduced motion disables shape stretch/scale. Reduced transparency uses the filled CSS fallback.

## Debug and verification

- `/sky/?liquidDebug#work`: surface normals.
- `/sky/?liquidDebug=displacement#work`: displacement. A neutral yellow interior is zero displacement; red/green changes at the rim show refraction.
- The sky canvas's `data-liquid-stats` reports visible shapes, target dimensions, source update count, mean CPU submission time, and GPU time when the browser exposes timer queries. CPU submission time is not complete GPU frame time.
- The renderer warns when more than eight shapes are visible.
- Both the sampling pass and glass drawing are scissored to the pill region. In a warmed local headless comparison, Chromium median frame intervals were 66.6ms with and without glass (p95 83.4ms versus 66.7ms); Playwright WebKit measured about 17ms with and without glass. The whole page already has a slower Chromium headless baseline. These are test-environment frame intervals, not guaranteed user-device performance. Recorded glass CPU submission means ranged approximately 0.1–0.9ms; GPU timing was unavailable.
- Chromium and Playwright WebKit rendered real WebGL without shader/page errors. Playwright WebKit is not the shipping Safari application; actual Safari hardware still requires a check.
- Context loss switches to CSS; restoration rebuilds and resumes WebGL. Removing `liquid` unregisters the shape and removes its GPU pass. No typecheck or lint command exists. `npm run build` is the configured build check.

## Remove the feature

For a reversible visual switch, remove `liquid` from the selected pill's class in `SkyNavigation.jsx`. The original appearance returns and the material unregisters.

For complete removal, restore the three integration files from the sibling backup, remove this directory, and optionally remove the three validation scripts and liquid review images. No package or dependency changes need undoing. From the project root:

```sh
cp ../i-m-thoufik-a-product-designer-backup-pre-liquid-glass/portfolio/sky/SkyNavigation.jsx portfolio/sky/SkyNavigation.jsx
cp ../i-m-thoufik-a-product-designer-backup-pre-liquid-glass/portfolio/sky/sky-scene.js portfolio/sky/sky-scene.js
cp ../i-m-thoufik-a-product-designer-backup-pre-liquid-glass/portfolio/sky/Sky.jsx portfolio/sky/Sky.jsx
rm -r portfolio/sky/liquid-glass
npm run build
```

These three-file restores preserve the separately authorized audio changes made after the original backup. To restore the **entire** project snapshot, stop the local server and run from the parent directory:

```sh
mv i-m-thoufik-a-product-designer i-m-thoufik-a-product-designer-before-restore
cp -R i-m-thoufik-a-product-designer-backup-pre-liquid-glass i-m-thoufik-a-product-designer
cd i-m-thoufik-a-product-designer
npm ci
```

The whole-folder backup includes hidden files, including `.env.local`, but excludes `node_modules`, `dist` and `build`. Instead of `npm ci`, dependencies can be moved back from the renamed working folder. Do not overwrite a previously existing `before-restore` folder.
