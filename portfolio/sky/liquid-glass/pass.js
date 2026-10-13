import * as THREE from 'three';
import { liquidElements } from './registry';
import { glassVertex, glassFragment } from './shader';

function rgba(value, fallback) {
  const numbers = value.match(/[\d.]+/g)?.map(Number);
  return numbers?.length >= 3 ? new THREE.Vector4(numbers[0] / 255, numbers[1] / 255, numbers[2] / 255, numbers[3] ?? 1) : fallback;
}
export function createLiquidPass(renderer, canvas) {
  const target = new THREE.WebGLRenderTarget(1, 1, { depthBuffer: false, stencilBuffer: false, minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter });
  target.texture.colorSpace = THREE.NoColorSpace;
  const uniforms = {
    skyTexture: { value: target.texture }, viewport: { value: new THREE.Vector2() },
    shapeRect: { value: new THREE.Vector4() }, radius: { value: 20 }, bezel: { value: 6 },
    press: { value: 0 }, ior: { value: 1.5 }, tint: { value: new THREE.Vector4(1, 1, 1, .045) },
    rim: { value: new THREE.Vector4(1, 1, 1, .75) },
    debugMode: { value: new URLSearchParams(location.search).has('liquidDebug') ? (new URLSearchParams(location.search).get('liquidDebug') === 'displacement' ? 2 : 1) : 0 },
  };
  const material = new THREE.ShaderMaterial({ uniforms, vertexShader: glassVertex, fragmentShader: glassFragment, transparent: true, depthTest: false, depthWrite: false, toneMapped: false });
  const geometry = new THREE.PlaneGeometry(2, 2), scene = new THREE.Scene();
  scene.add(new THREE.Mesh(geometry, material));
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const opaque = matchMedia('(prefers-reduced-transparency: reduce)');
  const times = [];
  const gl = renderer.getContext();
  const timer = gl.getExtension('EXT_disjoint_timer_query_webgl2');
  const gpuTimes = [];
  let pendingQuery;
  let validTexture = false, fullTexture = false, last = 0, textureUpdates = 0, warned = false;
  return {
    draw(skyScene, skyCamera, timestamp, skyChanged, skyAnimated) {
      const started = performance.now();
      const entries = [...liquidElements].filter(entry => entry.visible && entry.element.isConnected && entry.element.classList.contains('liquid'));
      // All DOM reads are batched before any style/data writes or rendering.
      const screen = canvas.getBoundingClientRect();
      const rows = entries.map(entry => ({ entry, rect: entry.element.getBoundingClientRect(), style: getComputedStyle(entry.element) }));
      const dt = Math.min(.05, last ? (timestamp - last) / 1000 : 1 / 60); last = timestamp;
      const visible = rows.filter(({ rect }) => rect.bottom > 0 && rect.top < screen.height && rect.width > 0);
      if (visible.length > 8 && !warned) { warned = true; console.warn('Liquid glass: more than eight visible shapes; review frame cost.'); }
      if (!visible.length || opaque.matches || document.hidden) {
        for (const { entry } of rows) entry.element.dataset.liquidMode = 'fallback';
        return false;
      }
      const size = renderer.getDrawingBufferSize(new THREE.Vector2());
      if (pendingQuery && gl.getQueryParameter(pendingQuery, gl.QUERY_RESULT_AVAILABLE)) {
        if (!gl.getParameter(timer.GPU_DISJOINT_EXT)) gpuTimes.push(gl.getQueryParameter(pendingQuery, gl.QUERY_RESULT) / 1e6);
        if (gpuTimes.length > 120) gpuTimes.shift();
        gl.deleteQuery(pendingQuery); pendingQuery = null;
      }
      const query = timer && !pendingQuery ? gl.createQuery() : null;
      if (query) gl.beginQuery(timer.TIME_ELAPSED_EXT, query);
      const width = Math.max(1, Math.ceil(size.x / 2)), height = Math.max(1, Math.ceil(size.y / 2));
      if (target.width !== width || target.height !== height) { target.setSize(width, height); validTexture = false; fullTexture = false; }
      if (!validTexture || skyChanged || (!skyAnimated && !fullTexture)) {
        renderer.setRenderTarget(target);
        if (skyAnimated) {
          // Only shade the source pixels a visible rim can sample, plus a generous
          // displacement margin. A paused sky gets one full capture for later dragging.
          const left = Math.max(0, Math.min(...visible.map(row => row.rect.left - screen.left)) - 40);
          const right = Math.min(screen.width, Math.max(...visible.map(row => row.rect.right - screen.left)) + 40);
          const top = Math.max(0, Math.min(...visible.map(row => row.rect.top - screen.top)) - 40);
          const bottom = Math.min(screen.height, Math.max(...visible.map(row => row.rect.bottom - screen.top)) + 40);
          renderer.setScissor(Math.floor(left / screen.width * width), Math.floor((screen.height - bottom) / screen.height * height), Math.ceil((right - left) / screen.width * width), Math.ceil((bottom - top) / screen.height * height));
          renderer.setScissorTest(true);
        }
        renderer.render(skyScene, skyCamera);
        renderer.setScissorTest(false);
        renderer.setRenderTarget(null);
        fullTexture = !skyAnimated;
        validTexture = true; textureUpdates++;
      }
      uniforms.viewport.value.set(screen.width, screen.height);
      const autoClear = renderer.autoClear;
      renderer.autoClear = false;
      let moving = false;
      for (const { entry, rect, style } of visible) {
        const center = rect.left + rect.width / 2;
        const speed = entry.lastRect ? Math.abs(center - entry.lastRect) / Math.max(dt, .001) : 0;
        const stretchTarget = reduced.matches ? 1 : 1 + Math.min(.08, speed / 5000);
        entry.stretch += (stretchTarget - entry.stretch) * (1 - Math.exp(-dt / .07));
        entry.velocity += (entry.press - entry.velocity) * (1 - Math.exp(-dt / .06));
        const pressScale = reduced.matches ? 1 : 1 - entry.velocity * .025;
        entry.lastRect = center;
        uniforms.shapeRect.value.set(center - screen.left, screen.height - (rect.top - screen.top + rect.height / 2), rect.width * entry.stretch * pressScale, rect.height / entry.stretch * pressScale);
        uniforms.radius.value = Math.min(parseFloat(style.borderRadius) || 20, rect.height / 2);
        uniforms.bezel.value = entry.options.bezel ?? 6;
        uniforms.ior.value = entry.options.ior ?? 1.5;
        uniforms.press.value = entry.velocity;
        uniforms.tint.value.copy(rgba(style.getPropertyValue('--liquid-tint'), new THREE.Vector4(1, 1, 1, .045)));
        uniforms.rim.value.copy(rgba(style.getPropertyValue('--liquid-rim'), new THREE.Vector4(1, 1, 1, .75)));
        // The shader is a viewport-aligned plane, but only shade this pill's pixels.
        const shape = uniforms.shapeRect.value, ratio = renderer.getPixelRatio();
        const sx = size.x / screen.width / ratio, sy = size.y / screen.height / ratio;
        renderer.setScissor(Math.floor((shape.x - shape.z / 2 - 2) * sx), Math.floor((shape.y - shape.w / 2 - 2) * sy), Math.ceil((shape.z + 4) * sx), Math.ceil((shape.w + 4) * sy));
        renderer.setScissorTest(true);
        renderer.render(scene, camera);
        if (entry.element.dataset.liquidMode !== 'webgl') entry.element.dataset.liquidMode = 'webgl';
        moving ||= timestamp < (entry.movingUntil ?? 0) || Math.abs(entry.stretch - 1) > .001 || Math.abs(entry.velocity - entry.press) > .001;
      }
      renderer.setScissorTest(false);
      renderer.autoClear = autoClear;
      if (query) { gl.endQuery(timer.TIME_ELAPSED_EXT); pendingQuery = query; }
      times.push(performance.now() - started); if (times.length > 120) times.shift();
      canvas.dataset.liquidStats = JSON.stringify({ shapes: visible.length, texture: [width, height], textureUpdates,
        cpuMs: times.reduce((a, b) => a + b, 0) / times.length,
        gpuMs: gpuTimes.length ? gpuTimes.reduce((a, b) => a + b, 0) / gpuTimes.length : null });
      return moving;
    },
    dispose() {
      for (const entry of liquidElements) entry.element.dataset.liquidMode = 'fallback';
      target.dispose(); geometry.dispose(); material.dispose(); delete canvas.dataset.liquidStats;
      if (pendingQuery) gl.deleteQuery(pendingQuery);
    },
  };
}
