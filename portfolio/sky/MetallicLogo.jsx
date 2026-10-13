import { useCallback, useEffect, useId, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import { LOGO_PATH } from "../components/brand/Logo";
import MetallicPaint from "./MetallicPaint";
import logoImage from "./logo-metallic.svg";
import logoSvg from "./logo-metallic.svg?raw";

// Keep the tuned sweep/flip available for a later experiment.
const AUTO_ROTATION_ENABLED = false;

// The supplied continuous logo path becomes a round metal tube, rather than
// multiple offset SVG strokes that read as a stack of outlines.
export default function MetallicLogo({ paused = false }) {
  const reducedMotion = useReducedMotion();
  const rootRef = useRef(null);
  const canvasRef = useRef(null);
  const metallicCanvasRef = useRef(null);
  const metallicFrameRef = useRef(false);
  const onMetalFrame = useCallback(() => { metallicFrameRef.current = true; }, []);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const fallbackGradient = useId();

  useEffect(() => {
    if (paused || reducedMotion) return;
    const root = rootRef.current;
    const canvas = canvasRef.current;
    if (!root || !canvas) return;
    let disposed = false;
    let cleanup = () => {};

    Promise.all([
      import("three"),
      import("three/addons/loaders/SVGLoader.js"),
      import("three/addons/environments/RoomEnvironment.js"),
    ]).then(([THREE, { SVGLoader }, { RoomEnvironment }]) => {
      if (disposed) return;
      let renderer;
      try {
        renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: "low-power" });
      } catch { setFailed(true); return; }
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(64, 64, false);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 0.85;

      const environmentScene = new RoomEnvironment();
      const generator = new THREE.PMREMGenerator(renderer);
      const environment = generator.fromScene(environmentScene).texture;
      const scene = new THREE.Scene();
      scene.environment = environment;
      const camera = new THREE.OrthographicCamera(-80, 80, 80, -80, 1, 500);
      camera.position.set(0, 0, 240);
      camera.lookAt(0, 0, 0);

      const parsed = new SVGLoader().parse(logoSvg);
      const outline = parsed.paths[0]?.subPaths[0];
      if (!outline) { renderer.dispose(); environment.dispose(); generator.dispose(); environmentScene.dispose(); setFailed(true); return; }
      const points = outline.getPoints(12);
      if (points[0].distanceTo(points.at(-1)) < 0.01) points.pop();
      const centerline = new THREE.CatmullRomCurve3(
        points.map((point) => new THREE.Vector3(point.x - 97.5, 97.5 - point.y, 0)),
        true,
        "centripetal",
      );
      const geometry = new THREE.TubeGeometry(centerline, 640, 3.2, 12, true);
      const uvs = geometry.getAttribute("uv");
      for (let i = 0; i <= 640; i++) {
        const point = centerline.getPointAt(i / 640);
        const u = (point.x + 97.5 - 30) / 135;
        const v = (point.y + 67.5) / 135;
        for (let j = 0; j <= 12; j++) uvs.setXY(i * 13 + j, u, v);
      }
      uvs.needsUpdate = true;

      const chrome = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        metalness: 1,
        roughness: 0.075,
        anisotropy: 0.55,
        envMapIntensity: 1.35,
        side: THREE.DoubleSide,
      });
      const mark = new THREE.Mesh(geometry, chrome);
      scene.add(mark);
      const rimLight = new THREE.DirectionalLight(0xffffff, 1.2);
      rimLight.position.set(-70, 90, 120);
      scene.add(rimLight);
      const coolLight = new THREE.DirectionalLight(0xbcd9ff, 0.7);
      coolLight.position.set(80, -30, 40);
      scene.add(coolLight);
      const warmLight = new THREE.DirectionalLight(0xffd6e9, 0.55);
      warmLight.position.set(40, 80, -70);
      scene.add(warmLight);

      let metallicTexture = null;
      let lastTextureTime = 0;
      let revealed = false;

      let frame = 0;
      let lastTime = 0;
      let yaw = 0;
      let pitch = 0;
      let idleRevolution = 0;
      let idleAge = 2500;
      let targetYaw = 0;
      let targetPitch = 0;
      let nearby = false;
      let dragging = false;
      let activePointerId = null;
      let suppressPointerFollow = false;
      let keyboardUntil = 0;
      let lastX = 0;
      let lastY = 0;
      let visible = true;
      const animate = (time) => {
        const delta = Math.min(time - (lastTime || time), 40);
        lastTime = time;
        const followsInput = dragging || nearby || time < keyboardUntil;
        if (!followsInput && AUTO_ROTATION_ENABLED) idleAge += delta;
        if (idleAge >= 5800) { idleAge -= 5800; idleRevolution += 360; }
        const flipping = idleAge > 5000;
        const flipProgress = Math.max(0, (idleAge - 5000) / 800);
        const flipEase = flipProgress < .5 ? 4 * flipProgress ** 3 : 1 - (-2 * flipProgress + 2) ** 3 / 2;
        // Linger over the readable front arc; pass the rear in a quick return turn.
        const idleYaw = idleRevolution + (flipping ? 22.5 + 315 * flipEase : -22.5 + 45 * idleAge / 5000);
        const idlePitch = Math.sin(time * 0.00062 + 0.8) * 5;
        const ease = dragging ? 0.32 : 1 - Math.exp(-delta / (!followsInput && flipping ? 45 : 260));
        if (followsInput) yaw += (targetYaw - yaw) * ease;
        else if (AUTO_ROTATION_ENABLED) yaw = idleYaw;
        if (followsInput || AUTO_ROTATION_ENABLED) pitch += ((followsInput ? targetPitch : idlePitch) - pitch) * ease;
        mark.rotation.set(THREE.MathUtils.degToRad(pitch), THREE.MathUtils.degToRad(yaw), 0);
        if (metallicFrameRef.current && time - lastTextureTime > 80 && metallicCanvasRef.current) {
          if (!metallicTexture) {
            metallicTexture = new THREE.CanvasTexture(metallicCanvasRef.current);
            metallicTexture.colorSpace = THREE.SRGBColorSpace;
            chrome.map = metallicTexture;
            chrome.needsUpdate = true;
          } else metallicTexture.needsUpdate = true;
          metallicFrameRef.current = false;
          lastTextureTime = time;
        }
        renderer.render(scene, camera);
        if (metallicTexture && !revealed) { revealed = true; setReady(true); }
        frame = visible ? requestAnimationFrame(animate) : 0;
      };
      const onPointerMove = (event) => {
        if (dragging) {
          if (event.pointerId !== activePointerId) return;
          targetYaw += (event.clientX - lastX) * 0.7;
          targetPitch += (event.clientY - lastY) * 0.7;
          lastX = event.clientX;
          lastY = event.clientY;
          return;
        }
        const bounds = root.getBoundingClientRect();
        const dx = event.clientX - (bounds.left + bounds.width / 2);
        const dy = event.clientY - (bounds.top + bounds.height / 2);
        const isNear = Math.hypot(dx, dy) < 175;
        if (suppressPointerFollow) {
          if (!isNear) suppressPointerFollow = false;
          nearby = false;
          return;
        }
        if (isNear) {
          if (!nearby) {
            idleRevolution = Math.round(yaw / 360) * 360;
            idleAge = 2500;
          }
          targetYaw = idleRevolution + THREE.MathUtils.clamp(dx * 0.2, -30, 30);
          targetPitch = THREE.MathUtils.clamp(dy * 0.17, -23, 23);
        } else if (nearby) {
          // Resume the front sweep from the cursor-facing pose, never a paused rear flip.
          idleAge = THREE.MathUtils.clamp((yaw - idleRevolution + 22.5) / 45, 0, 1) * 5000;
        }
        nearby = isNear;
      };
      const onPointerDown = (event) => {
        if (!event.isPrimary || (event.pointerType === "mouse" && event.button !== 0)) return;
        dragging = true;
        activePointerId = event.pointerId;
        suppressPointerFollow = false;
        nearby = false;
        targetYaw = yaw;
        targetPitch = pitch;
        lastX = event.clientX;
        lastY = event.clientY;
        root.setPointerCapture(event.pointerId);
      };
      const onPointerUp = (event) => {
        if (!dragging || event.pointerId !== activePointerId) return;
        dragging = false;
        activePointerId = null;
        suppressPointerFollow = true;
        idleRevolution = Math.round(yaw / 360) * 360;
        idleAge = 2500;
        nearby = false;
        if (root.hasPointerCapture(event.pointerId)) root.releasePointerCapture(event.pointerId);
      };
      const onKeyDown = (event) => {
        if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Escape"].includes(event.key)) return;
        event.preventDefault();
        if (event.key === "Escape") { idleRevolution = Math.round(yaw / 360) * 360; idleAge = 2500; targetPitch = 0; nearby = false; keyboardUntil = 0; return; }
        targetYaw = yaw + (event.key === "ArrowRight" ? 18 : event.key === "ArrowLeft" ? -18 : 0);
        targetPitch = pitch + (event.key === "ArrowDown" ? 18 : event.key === "ArrowUp" ? -18 : 0);
        keyboardUntil = performance.now() + 900;
      };
      const onBlur = () => { nearby = false; keyboardUntil = 0; idleRevolution = Math.round(yaw / 360) * 360; idleAge = 2500; };
      const observer = new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting;
        if (visible && !frame) frame = requestAnimationFrame(animate);
        if (!visible && frame) { cancelAnimationFrame(frame); frame = 0; lastTime = 0; }
      });
      observer.observe(root);
      window.addEventListener("pointermove", onPointerMove);
      root.addEventListener("pointerenter", onPointerMove);
      root.addEventListener("pointerdown", onPointerDown);
      root.addEventListener("pointerup", onPointerUp);
      root.addEventListener("pointercancel", onPointerUp);
      root.addEventListener("lostpointercapture", onPointerUp);
      window.addEventListener("pointerup", onPointerUp);
      window.addEventListener("pointercancel", onPointerUp);
      root.addEventListener("keydown", onKeyDown);
      root.addEventListener("blur", onBlur);
      renderer.render(scene, camera);
      frame = requestAnimationFrame(animate);
      cleanup = () => {
        cancelAnimationFrame(frame);
        observer.disconnect();
        window.removeEventListener("pointermove", onPointerMove);
        root.removeEventListener("pointerenter", onPointerMove);
        root.removeEventListener("pointerdown", onPointerDown);
        root.removeEventListener("pointerup", onPointerUp);
        root.removeEventListener("pointercancel", onPointerUp);
        root.removeEventListener("lostpointercapture", onPointerUp);
        window.removeEventListener("pointerup", onPointerUp);
        window.removeEventListener("pointercancel", onPointerUp);
        root.removeEventListener("keydown", onKeyDown);
        root.removeEventListener("blur", onBlur);
        geometry.dispose();
        metallicTexture?.dispose();
        chrome.dispose();
        environment.dispose();
        generator.dispose();
        environmentScene.dispose();
        renderer.dispose();
      };
    }).catch(() => { if (!disposed) setFailed(true); });

    return () => { disposed = true; cleanup(); };
  }, [paused, reducedMotion]);

  return (
    <span className="sky-hero-logo" ref={rootRef} role="button" aria-label="Rotate Thoufik logo with drag or arrow keys" tabIndex={paused || reducedMotion || failed ? -1 : 0} data-ready={ready && !reducedMotion && !failed}>
      {(reducedMotion || failed) && <svg className="sky-hero-logo-fallback" viewBox="30 30 135 135" aria-hidden="true" focusable="false">
        <defs><linearGradient id={fallbackGradient} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#e6f7ff" /><stop offset=".35" stopColor="#fff" /><stop offset=".68" stopColor="#c9a3e8" /><stop offset="1" stopColor="#f6fbff" /></linearGradient></defs>
        <path d={LOGO_PATH} fill="none" stroke={`url(#${fallbackGradient})`} strokeWidth="6.2" strokeLinejoin="round" />
      </svg>}
      <canvas className="sky-hero-logo-canvas" ref={canvasRef} width="64" height="64" aria-hidden="true" style={{ opacity: ready ? 1 : 0 }} />
      {!paused && !reducedMotion && <span className="sky-hero-logo-metal-source" aria-hidden="true">
        <MetallicPaint imageSrc={logoImage} outputCanvasRef={metallicCanvasRef} onFrame={onMetalFrame}
          seed={42} scale={4} patternSharpness={1} noiseScale={0.5} speed={0.3}
          liquid={0.75} mouseAnimation={false} brightness={2} contrast={0.5}
          refraction={0.01} blur={0.015} chromaticSpread={2} fresnel={1}
          angle={0} waveAmplitude={1} distortion={1} contour={0.2}
          lightColor="#ffffff" darkColor="#000000" tintColor="#feb3ff" />
      </span>}
    </span>
  );
}
