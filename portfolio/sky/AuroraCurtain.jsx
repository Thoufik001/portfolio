import { useEffect, useRef } from "react";

// Displaced curtain geometry and color layering adapted from CK42BB's
// procedural-weather-threejs aurora (MIT; see licenses/procedural-weather.txt).
const vertexShader = `
  uniform float uTime;
  uniform float uLayer;
  varying vec2 vUv;
  varying float vFold;

  void main() {
    vUv = uv;
    vec3 pos = position;
    float stream = pos.x * 0.024 - uTime * 0.22 + uLayer * 1.7;
    float sweep = sin(stream) * 13.0
      + sin(pos.x * 0.061 - uTime * 0.31 + uLayer) * 5.0
      + sin(pos.x * 0.112 - uTime * 0.18) * 2.2;
    pos.y += sweep * (0.40 + 0.60 * uv.y);
    pos.z += sin(stream * 1.45 + uv.y * 1.8) * (7.0 + uv.y * 9.0);
    pos.x += sin(stream * 2.0 + uv.y * 2.5) * uv.y * 3.2;
    vFold = 0.5 + 0.5 * sin(stream * 1.45 + uv.y * 1.8);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const fragmentShader = `
  precision highp float;
  varying vec2 vUv;
  varying float vFold;
  uniform float uTime;
  uniform float uLayer;

  float hash(float n) { return fract(sin(n * 127.1 + 19.7) * 43758.5453); }
  float noise(float x) {
    float cell = floor(x);
    float f = fract(x);
    f = f * f * (3.0 - 2.0 * f);
    return mix(hash(cell), hash(cell + 1.0), f);
  }

  void main() {
    float flow = vUv.x + uTime * 0.0015;
    float broad = noise(flow * 4.0 + 2.7);
    float fold = noise(flow * 11.0 + 5.0);
    float opening = 0.76 + 0.24 * smoothstep(0.12, 0.86, broad);
    float shimmer = 0.90 + 0.10 * smoothstep(0.18, 0.85, fold);

    // The bright lip and its descending rays belong to the same folded sheet.
    float crest = 0.68 + sin(flow * 8.0 - uTime * 0.12) * 0.055
      + (broad - 0.5) * 0.10;
    float lip = exp(-pow((vUv.y - crest) / 0.085, 2.0));
    float curtain = smoothstep(0.08, crest - 0.03, vUv.y)
      * (1.0 - smoothstep(crest - 0.08, crest + 0.09, vUv.y));
    float upperHaze = exp(-pow((vUv.y - crest - 0.13) / 0.20, 2.0));
    float shape = (lip * 0.27 + curtain * 0.12 + upperHaze * 0.075)
      * opening * shimmer * (0.90 + 0.10 * vFold);
    shape *= smoothstep(0.0, 0.09, vUv.x) * (1.0 - smoothstep(0.91, 1.0, vUv.x));

    vec3 green = vec3(0.12, 0.93, 0.53);
    vec3 cyan = vec3(0.13, 0.78, 0.89);
    vec3 violet = vec3(0.56, 0.38, 0.91);
    vec3 pink = vec3(0.91, 0.42, 0.75);
    float colorZone = noise(flow * 2.4 + uLayer * 2.0 + 8.0);
    float cycle = mod(uTime / 16.0 + uLayer * 0.12, 3.0);
    float phase = smoothstep(0.0, 1.0, fract(cycle));
    vec3 paletteA = mix(green, cyan, 0.28 + colorZone * 0.24);
    vec3 paletteB = mix(violet, pink, 0.16 + colorZone * 0.38);
    vec3 paletteC = mix(cyan, violet, 0.30 + colorZone * 0.25);
    vec3 color = cycle < 1.0 ? mix(paletteA, paletteB, phase)
      : cycle < 2.0 ? mix(paletteB, paletteC, phase)
      : mix(paletteC, paletteA, phase);
    gl_FragColor = vec4(color, min(shape, 0.25));
  }
`;

export default function AuroraCurtain({ paused }) {
  const canvasRef = useRef(null);
  const pausedRef = useRef(paused);
  const controllerRef = useRef(null);

  useEffect(() => {
    pausedRef.current = paused;
    controllerRef.current?.sync();
  }, [paused]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    let disposed = false;
    let cleanup = () => {};

    import("three").then((THREE) => {
      if (disposed) return;
      let renderer;
      try {
        renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false, powerPreference: "low-power" });
      } catch { return; }
      renderer.setClearColor(0x000000, 0);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, window.innerWidth < 700 ? 0.75 : 0.9));
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(52, 1, 0.1, 500);
      const geometry = new THREE.PlaneGeometry(320, 118, 180, 48);
      const curtains = [0].map((layer) => {
        const uniforms = { uTime: { value: 0 }, uLayer: { value: layer } };
        const material = new THREE.ShaderMaterial({
          uniforms,
          vertexShader,
          fragmentShader,
          transparent: true,
          depthWrite: false,
          side: THREE.DoubleSide,
          blending: THREE.AdditiveBlending,
        });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(0, 38, -135);
        mesh.rotation.x = -0.17;
        scene.add(mesh);
        return { material, uniforms };
      });

      let frame = 0;
      let elapsed = 0;
      let lastTime = 0;
      let lastDraw = 0;
      const render = () => {
        curtains.forEach(({ uniforms }) => { uniforms.uTime.value = elapsed; });
        renderer.render(scene, camera);
      };
      const tick = (now) => {
        frame = 0;
        if (document.hidden || pausedRef.current) return;
        if (lastTime) elapsed += Math.min(now - lastTime, 100) / 1000;
        lastTime = now;
        if (now - lastDraw >= 33) { render(); lastDraw = now; }
        frame = requestAnimationFrame(tick);
      };
      const sync = () => {
        if (pausedRef.current || document.hidden) {
          cancelAnimationFrame(frame);
          frame = 0;
          lastTime = 0;
          if (!document.hidden) render();
        } else if (!frame) frame = requestAnimationFrame(tick);
      };
      const resize = () => {
        const width = Math.max(1, canvas.clientWidth);
        const height = Math.max(1, canvas.clientHeight);
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        render();
      };
      const resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(canvas);
      document.addEventListener("visibilitychange", sync);
      resize();
      controllerRef.current = { sync };
      sync();

      cleanup = () => {
        cancelAnimationFrame(frame);
        resizeObserver.disconnect();
        document.removeEventListener("visibilitychange", sync);
        controllerRef.current = null;
        geometry.dispose();
        curtains.forEach(({ material }) => material.dispose());
        renderer.dispose();
      };
    }).catch(() => {});

    return () => { disposed = true; cleanup(); };
  }, []);

  return <canvas ref={canvasRef} className="sky-polar-aurora" aria-hidden="true" />;
}
