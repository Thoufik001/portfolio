import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";

// An original sampled trefoil surface, not a stock image or a particle background.
// The points keep their identity as the form resolves, making the transformation readable.
const TAU = Math.PI * 2;
const centre = (t) => [
  (2 + Math.cos(3 * t)) * Math.cos(2 * t),
  (2 + Math.cos(3 * t)) * Math.sin(2 * t),
  Math.sin(3 * t),
];
const normalise = (v) => {
  const l = Math.hypot(...v);
  return v.map((n) => n / l);
};
const cross = (a, b) => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];
const points = Array.from({ length: 8400 }, (_, i) => {
  const t = (TAU * (i % 280)) / 280,
    a = (TAU * Math.floor(i / 280)) / 30;
  const c = centre(t),
    d = centre(t + 0.001),
    tangent = normalise(d.map((v, j) => v - c[j]));
  const n = normalise(cross(tangent, [0, 0, 1])),
    b = cross(tangent, n);
  const wave = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  const seed = wave - Math.floor(wave);
  const offset = n.map((v, j) => 0.48 * (Math.cos(a) * v + Math.sin(a) * b[j]));
  return {
    p: c.map((v, j) => v + offset[j]),
    n: offset,
    scatter: [
      Math.sin(i * 3.17) * 5.6,
      Math.cos(i * 7.73) * 3.4,
      Math.sin(i * 1.71) * 4,
    ],
    seed,
  };
});

export default function FormStudy() {
  const canvas = useRef(null),
    gpuCanvas = useRef(null),
    range = useRef(null),
    engine = useRef(null);
  const [scattered, setScattered] = useState(false);
  const reduced = useReducedMotion();
  useEffect(() => {
    const el = canvas.current,
      ctx = el.getContext("2d");
    if (!ctx) return;
    let raf,
      gl,
      width = 600,
      height = 380,
      active = true,
      current = reduced ? 1 : 0.2,
      target = 1;
    let rx = -0.46,
      ry = 0.26,
      tx = rx,
      ty = ry;
    let dark = document.documentElement.dataset.theme === "dark";
    const rotate = (p) => {
      const c = Math.cos(rx),
        s = Math.sin(rx),
        c2 = Math.cos(ry),
        s2 = Math.sin(ry);
      const y = p[1] * c - p[2] * s,
        z = p[1] * s + p[2] * c;
      return [p[0] * c2 + z * s2, y, -p[0] * s2 + z * c2];
    };
    function draw() {
      if (!active) return;
      current += (target - current) * (reduced ? 1 : 0.085);
      rx += (tx - rx) * 0.07;
      ry += (ty - ry) * 0.07;
      if (gl) {
        gl.render({ clarity: current, rx, ry, dark });
      } else {
        ctx.clearRect(0, 0, width, height);
        const scale = Math.min(width / 9.8, height / 7.2);
        const prepared = points
          .map((point) => {
            const p = point.p.map(
              (v, j) => v * current + point.scatter[j] * (1 - current),
            );
            const r = rotate(p),
              n = rotate(point.n),
              perspective = 12 / (12 - r[2]);
            return {
              x: width / 2 + r[0] * scale * perspective,
              y: height / 2 + r[1] * scale * perspective,
              z: r[2],
              shade: (n[0] * -0.3 + n[1] * -0.5 + n[2] * 0.8) / 0.48,
              seed: point.seed,
            };
          })
          .sort((a, b) => a.z - b.z);
        for (const p of prepared) {
          const light = Math.max(0, Math.min(1, (p.shade + 1) / 2));
          const size = (0.42 + (1 - light) * 0.74) * (width < 450 ? 0.86 : 1);
          const opacity = 0.23 + (1 - light) * 0.66;
          ctx.fillStyle = dark
            ? `rgba(225,227,229,${opacity})`
            : `rgba(23,25,28,${opacity})`;
          ctx.fillRect(p.x, p.y, size, size);
        }
      }
      if (
        Math.abs(current - target) > 0.0005 ||
        Math.abs(tx - rx) > 0.0002 ||
        Math.abs(ty - ry) > 0.0002
      )
        raf = requestAnimationFrame(draw);
      else raf = null;
    }
    function wake() {
      if (!raf) raf = requestAnimationFrame(draw);
    }
    const resize = new ResizeObserver(([entry]) => {
      width = entry.contentRect.width;
      height = entry.contentRect.height;
      const dpr = Math.min(devicePixelRatio, 2);
      el.width = width * dpr;
      el.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      gl?.resize(width, height);
      wake();
    });
    resize.observe(el);
    const theme = new MutationObserver(() => {
      dark = document.documentElement.dataset.theme === "dark";
      wake();
    });
    theme.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    function move(e) {
      if (reduced || e.pointerType === "touch") return;
      const rect = el.getBoundingClientRect();
      tx =
        -0.46 + ((e.clientY - rect.top - rect.height / 2) / rect.height) * 0.3;
      ty = 0.26 + ((e.clientX - rect.left - rect.width / 2) / rect.width) * 0.5;
      wake();
    }
    function leave() {
      tx = -0.46;
      ty = 0.26;
      wake();
    }
    const surface = el.parentElement;
    surface.addEventListener("pointermove", move);
    surface.addEventListener("pointerleave", leave);
    import("./form-renderer.js").then((module) => {
      if (!active) return;
      try {
        gl = module.createFormRenderer(gpuCanvas.current, points);
        gl.resize(width, height);
        gpuCanvas.current.style.opacity = "1";
        el.style.visibility = "hidden";
        wake();
      } catch {
        gl = null;
      }
    });
    engine.current = {
      setClarity(value) {
        target = value;
        wake();
      },
    };
    wake();
    return () => {
      active = false;
      cancelAnimationFrame(raf);
      gl?.dispose();
      resize.disconnect();
      theme.disconnect();
      surface.removeEventListener("pointermove", move);
      surface.removeEventListener("pointerleave", leave);
      engine.current = null;
    };
  }, [reduced]);
  function change(e) {
    const v = Number(e.target.value) / 100;
    engine.current?.setClarity(v);
    setScattered(v < 0.5);
  }
  function toggle() {
    const next = scattered ? 100 : 0;
    range.current.value = next;
    engine.current?.setClarity(next / 100);
    setScattered(!scattered);
  }
  return (
    <div className="form-study">
      <div
        className="form-canvas"
        role="img"
        aria-label="An original stippled knot that transforms between scattered points and a coherent form."
      >
        <canvas ref={canvas} aria-hidden="true" />
        <canvas ref={gpuCanvas} className="gpu-canvas" aria-hidden="true" />
      </div>
      <div className="form-controls">
        <button onClick={toggle}>
          {scattered ? "Bring it together" : "Take it apart"}
          <span aria-hidden="true">{scattered ? "↗" : "↙"}</span>
        </button>
        <input
          ref={range}
          type="range"
          min="0"
          max="100"
          defaultValue="100"
          onChange={change}
          aria-label="Resolve the scattered points into a clear form"
        />
        <span className="form-end-label">Clarity</span>
      </div>
    </div>
  );
}
