import * as THREE from "three";
import { LOGO_PATH } from "../components/brand/Logo";

// Sample the original stroke, rather than approximating the personal mark.
function particles() {
  const context = document.createElement("canvas").getContext("2d");
  context.lineWidth = 5.39494;
  const path = new Path2D(LOGO_PATH);
  const positions = [], dust = [], sizes = [], delays = [];
  let seed = 731;
  const random = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  for (let y = 45; y < 151; y += 1.3) {
    for (let x = 35; x < 161; x += 1.3) {
      if (!context.isPointInStroke(path, x, y)) continue;
      positions.push((x - 97.578) / 40, (97.7405 - y) / 40, (random() - 0.5) * 0.025);
      const angle = random() * Math.PI * 2;
      const radius = 0.8 + random() * 1.9;
      dust.push(Math.cos(angle) * radius, Math.sin(angle) * radius * 0.72, (random() - 0.5) * 2.4);
      sizes.push(1.4 + random() * 0.7);
      delays.push(random() * 0.18);
    }
  }
  return { positions, dust, sizes, delays };
}

export function createLogoScene(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: "low-power" });
  const ratio = Math.min(devicePixelRatio, 1.5);
  renderer.setPixelRatio(ratio);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
  camera.position.z = 7.8;
  const data = particles();
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(data.positions, 3));
  geometry.setAttribute("aDust", new THREE.Float32BufferAttribute(data.dust, 3));
  geometry.setAttribute("aSize", new THREE.Float32BufferAttribute(data.sizes, 1));
  geometry.setAttribute("aDelay", new THREE.Float32BufferAttribute(data.delays, 1));
  const material = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false,
    uniforms: { uForm: { value: 0 }, uColor: { value: new THREE.Color() }, uRatio: { value: ratio } },
    vertexShader: `
      attribute vec3 aDust;
      attribute float aSize;
      attribute float aDelay;
      uniform float uForm;
      uniform float uRatio;
      varying float vOpacity;
      void main() {
        float formed = smoothstep(aDelay, 1.0, uForm);
        vec3 p = mix(aDust, position, formed);
        vec4 view = modelViewMatrix * vec4(p, 1.0);
        gl_Position = projectionMatrix * view;
        gl_PointSize = aSize * uRatio * (7.8 / -view.z);
        vOpacity = mix(0.24, 0.95, formed);
      }`,
    fragmentShader: `
      uniform vec3 uColor;
      varying float vOpacity;
      void main() {
        float distanceToCenter = length(gl_PointCoord - 0.5);
        float alpha = 1.0 - smoothstep(0.32, 0.5, distanceToCenter);
        gl_FragColor = vec4(uColor, alpha * vOpacity);
      }`,
  });
  const points = new THREE.Points(geometry, material);
  points.frustumCulled = false;
  scene.add(points);
  let frame = 0, alive = true, visible = true, targetX = -0.08, targetY = -0.18, targetForm = 1, lastTime = 0;
  points.rotation.set(targetX, targetY, 0);
  function draw(time) {
    frame = 0;
    if (!alive || !visible) return;
    const delta = lastTime ? Math.min((time - lastTime) / 1000, 0.05) : 1 / 60;
    lastTime = time;
    const follow = 1 - Math.exp(-8 * delta);
    points.rotation.x += (targetX - points.rotation.x) * follow;
    points.rotation.y += (targetY - points.rotation.y) * follow;
    material.uniforms.uForm.value += (targetForm - material.uniforms.uForm.value) * (1 - Math.exp(-4.5 * delta));
    renderer.render(scene, camera);
    if (Math.abs(targetX - points.rotation.x) + Math.abs(targetY - points.rotation.y) + Math.abs(targetForm - material.uniforms.uForm.value) > 0.0005) wake();
    else lastTime = 0;
  }
  function wake() {
    if (!frame && alive && visible) frame = requestAnimationFrame(draw);
  }
  const resize = new ResizeObserver(() => {
    const r = canvas.getBoundingClientRect();
    if (!r.width || !r.height) return;
    renderer.setSize(r.width, r.height, false);
    camera.aspect = r.width / r.height;
    camera.updateProjectionMatrix();
    wake();
  });
  resize.observe(canvas);
  const observer = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    lastTime = 0;
    if (visible) wake();
    else { cancelAnimationFrame(frame); frame = 0; }
  });
  observer.observe(canvas);
  function theme() {
    material.uniforms.uColor.value.set(getComputedStyle(canvas).getPropertyValue("--color-logo-particle").trim()).convertLinearToSRGB();
    wake();
  }
  const themeObserver = new MutationObserver(theme);
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  theme();
  const move = (event) => {
    if (event.pointerType === "touch") return;
    const r = canvas.getBoundingClientRect();
    targetY = -0.18 + ((event.clientX - r.left) / r.width - 0.5) * 1.6;
    targetX = -0.08 + ((event.clientY - r.top) / r.height - 0.5) * 1.0;
    wake();
  };
  const leave = () => { targetX = -0.08; targetY = -0.18; wake(); };
  canvas.addEventListener("pointermove", move);
  canvas.addEventListener("pointerleave", leave);
  return {
    scatter(value) { targetForm = value ? 0 : 1; wake(); },
    dispose() {
      alive = false;
      cancelAnimationFrame(frame);
      resize.disconnect(); observer.disconnect(); themeObserver.disconnect();
      canvas.removeEventListener("pointermove", move);
      canvas.removeEventListener("pointerleave", leave);
      geometry.dispose(); material.dispose(); renderer.dispose();
    },
  };
}
