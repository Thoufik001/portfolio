/**
 * paper-fold.js
 * Folds a flat note into a paper dart in real 3D, then throws it into the sky.
 * Renders on a transparent, click-through WebGL canvas laid over the whole viewport,
 * so the DOM form stays real HTML and the sky photo behind it is untouched.
 *
 * Tested with three@0.128.0 (pin this version, light units changed in later releases).
 *
 *   import * as THREE from 'three';
 *   import { createPaperFold, paintNote } from './paper-fold.js';
 *
 *   const fold = createPaperFold(THREE, { zIndex: 40, speed: 1.2 });
 *   await fold.play({
 *     rect: cardEl.getBoundingClientRect(),   // where the note sits on screen
 *     rotationDeg: 2,                         // the card's CSS rotation, if any
 *     front: someCanvasOrImage,               // pixel snapshot of the note, or omit and pass fields
 *     fields: { title, name, email, message },
 *     onLaunch: () => showThankYouText(),     // plane leaves the hand
 *   });
 */

export function createPaperFold(THREE, options = {}) {
  const V3 = THREE.Vector3;
  const PI = Math.PI;
  const PW = 210, HW = 105, GAP = 0.35, EPS = 1e-4;
  const ALPHA = PI / 8, BETA = PI / 16;

  const cfg = Object.assign({
    container: document.body,
    zIndex: 40,
    speed: 1.5,            // fold speed multiplier
    fov: 32,
    power: 7.5,            // throw speed in sim metres per second
    angle: 0.3,            // throw climb angle, radians
    heading: 'auto',       // yaw of the throw in radians (positive flies left), or 'auto' to steer toward screen centre
    breeze: 0.9,           // updraft, keeps the dart aloft
    slowmo: 0.3,           // flight runs in slow motion so it reads on screen
    kScale: 800,           // pixels per sim metre, multiplied by the sheet scale
    verticalScale: 0.4,    // 1 = true height gain, lower keeps the dart inside the frame
    flightSeconds: 3.6,
    fadeSeconds: 1.0,
    dropShadow: 'drop-shadow(0 10px 14px rgba(20, 40, 70, 0.22))',
    tilt: [0.3, -0.34],    // 3/4 view while folding: [pitch back, yaw]
    sideView: [0.42, -0.95] // view while the dart stands up and opens its wings
  }, options);

  /* ---------- stage (created once, reused) ---------- */
  let renderer = null, canvasEl = null, scene = null, camera = null, hemi = null, key = null;
  let run = null;       // state of the current play()
  let raf = 0;

  function ensureStage() {
    if (renderer) return;
    canvasEl = document.createElement('canvas');
    Object.assign(canvasEl.style, {
      position: 'fixed', left: '0', top: '0', width: '100%', height: '100%',
      pointerEvents: 'none', zIndex: String(cfg.zIndex), display: 'none', filter: cfg.dropShadow || 'none'
    });
    canvasEl.setAttribute('aria-hidden', 'true');
    cfg.container.appendChild(canvasEl);
    renderer = new THREE.WebGLRenderer({ canvas: canvasEl, alpha: true, antialias: true, logarithmicDepthBuffer: true });
    renderer.setClearColor(0x000000, 0);
    renderer.outputEncoding = THREE.sRGBEncoding;
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(cfg.fov, 1, 1, 100000);
    hemi = new THREE.HemisphereLight(0xffffff, 0xa5a9b3, cfg.ambientIntensity ?? 0.62);
    key = new THREE.DirectionalLight(0xffffff, cfg.keyIntensity ?? 0.42);
    key.position.set(-0.4, 0.7, 1).normalize();
    scene.add(hemi); scene.add(key);
    const fill = new THREE.DirectionalLight(0xffffff, cfg.fillIntensity ?? 0);
    fill.position.set(.8, -.2, -.6).normalize();
    scene.add(fill);
  }
  function resizeStage() {
    const w = window.innerWidth, h = window.innerHeight;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    const d = (h / 2) / Math.tan(THREE.MathUtils.degToRad(cfg.fov / 2));
    camera.near = d * 0.05; camera.far = d * 80;
    camera.position.set(0, 0, d);
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
    return { w, h, d };
  }

  /* ---------- small helpers ---------- */
  const smooth = (t) => { t = Math.max(0, Math.min(1, t)); return t * t * (3 - 2 * t); };
  const ease = (t) => { t = Math.max(0, Math.min(1, t)); return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
  function rot(v, a, th) {
    const c = Math.cos(th), s = Math.sin(th), d = a[0] * v[0] + a[1] * v[1] + a[2] * v[2], k = 1 - c;
    return [
      v[0] * c + (a[1] * v[2] - a[2] * v[1]) * s + a[0] * d * k,
      v[1] * c + (a[2] * v[0] - a[0] * v[2]) * s + a[1] * d * k,
      v[2] * c + (a[0] * v[1] - a[1] * v[0]) * s + a[2] * d * k
    ];
  }
  const lerpN = (a, b, s) => a.map((x, i) => x + (b[i] - x) * s);

  /* ---------- fold steps (millimetres, sheet is 210 wide, HL is half the height) ---------- */
  function buildSteps(HL) {
    const S22 = Math.sin(ALPHA), C22 = Math.cos(ALPHA), SB = Math.sin(BETA), CB = Math.cos(BETA), r = Math.SQRT1_2;
    const tail = 2 * HL * Math.tan(BETA), len = Math.hypot(2 * HL, tail);
    const wingAxis = [0, -2 * HL / len, tail / len];
    return [
      { dur: 0.6, ops: () => [{ type: 'flat', A: [0, 0], d: [0, 1], side: -1, dir: 1, pinch: true }] },
      { dur: 0.6, ops: () => [
        { type: 'flat', A: [0, HL], d: [r, -r], side: 1, dir: 1 },
        { type: 'flat', A: [0, HL], d: [-r, -r], side: -1, dir: 1 }] },
      { dur: 0.6, ops: () => [
        { type: 'flat', A: [0, HL], d: [S22, -C22], side: 1, dir: 1 },
        { type: 'flat', A: [0, HL], d: [-S22, -C22], side: -1, dir: 1 }] },
      { dur: 0.7, ops: () => [{ type: 'flat', A: [0, 0], d: [0, 1], side: -1, dir: -1 }] },
      { dur: 0.6, ops: () => [
        { type: 'flat', A: [0, HL], d: [-SB, -CB], side: -1, dir: 1, layer: 'L', mark: 'L' },
        { type: 'flat', A: [0, HL], d: [-SB, -CB], side: -1, dir: -1, layer: 'R', mark: 'R' }] },
      { dur: 0.55, ops: () => [{ type: 'rigid', A: [0, 0, 0], a: [0, 1, 0], angle: PI / 2, select: () => true }] },
      { dur: 0.55, ops: () => {
        const ang = (90 + 10) * PI / 180;
        return [
          { type: 'rigid', A: [0, HL, 0], a: wingAxis, angle: ang, select: (t) => t.marks.wing === 'L' },
          { type: 'rigid', A: [0, HL, 0], a: wingAxis, angle: -ang, select: (t) => t.marks.wing === 'R' }];
      } }
    ];
  }

  /* ---------- the sheet: a triangle mesh that is cut along every crease ---------- */
  function createSheet(PL, tex) {
    const HL = PL / 2;
    const S = { PL, HL, tris: [], creases: [], ops: [], pos: new Float32Array(0), geo: null };
    const mk = (p, uv, marks) => ({ p, uv, marks: Object.assign({}, marks || {}), op: -1 });
    const uvOf = (x, y) => [(x + HW) / PW, (y + HL) / PL];
    const c = [[-HW, -HL, 0], [HW, -HL, 0], [HW, HL, 0], [-HW, HL, 0]], u = c.map((q) => uvOf(q[0], q[1]));
    S.tris = [mk([c[0], c[1], c[2]], [u[0], u[1], u[2]]), mk([c[0], c[2], c[3]], [u[0], u[2], u[3]])];
    const layerOf = (t) => ((t.uv[0][0] + t.uv[1][0] + t.uv[2][0]) / 3 < 0.5 ? 'L' : 'R');

    S.rebuild = function (meshes) {
      const n = S.tris.length, uvs = new Float32Array(n * 6);
      S.pos = new Float32Array(n * 9);
      for (let i = 0; i < n; i++) for (let j = 0; j < 3; j++) { uvs[i * 6 + j * 2] = S.tris[i].uv[j][0]; uvs[i * 6 + j * 2 + 1] = S.tris[i].uv[j][1]; }
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.BufferAttribute(S.pos, 3));
      g.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
      meshes.forEach((m) => { m.geometry = g; });
      if (S.geo) S.geo.dispose();
      S.geo = g;
    };
    S.writeRest = function () {
      let i = 0;
      for (const t of S.tris) for (let j = 0; j < 3; j++) { const p = t.p[j]; S.pos[i++] = p[0]; S.pos[i++] = p[1]; S.pos[i++] = p[2]; }
      S.geo.attributes.position.needsUpdate = true; S.geo.computeVertexNormals();
    };
    // cut every triangle along a line so the crease sits on mesh edges
    S.splitAll = function (A, d) {
      const n = [-d[1], d[0]], out = [];
      for (const t of S.tris) {
        const dist = t.p.map((p) => (p[0] - A[0]) * n[0] + (p[1] - A[1]) * n[1]);
        const onl = []; dist.forEach((x, i) => { if (Math.abs(x) <= EPS) onl.push(i); });
        if (dist.every((x) => x >= -EPS) || dist.every((x) => x <= EPS)) {
          if (onl.length >= 2) S.creases.push([t.uv[onl[0]], t.uv[onl[1]]]);
          out.push(t); continue;
        }
        const P = [], N = [];
        for (let i = 0; i < 3; i++) {
          const j = (i + 1) % 3, vi = { p: t.p[i], uv: t.uv[i], d: dist[i] }, vj = { p: t.p[j], uv: t.uv[j], d: dist[j] };
          if (Math.abs(vi.d) <= EPS) { P.push(vi); N.push(vi); } else (vi.d > 0 ? P : N).push(vi);
          if ((vi.d > EPS && vj.d < -EPS) || (vi.d < -EPS && vj.d > EPS)) {
            const s = vi.d / (vi.d - vj.d), m = { p: lerpN(vi.p, vj.p, s), uv: lerpN(vi.uv, vj.uv, s), d: 0 };
            P.push(m); N.push(m);
          }
        }
        const lp = P.filter((v) => Math.abs(v.d) <= EPS);
        if (lp.length >= 2) S.creases.push([lp[0].uv, lp[1].uv]);
        [P, N].forEach((poly) => {
          for (let k = 1; k + 1 < poly.length; k++) out.push(mk([poly[0].p, poly[k].p, poly[k + 1].p], [poly[0].uv, poly[k].uv, poly[k + 1].uv], t.marks));
        });
      }
      S.tris = out;
    };
    S.prepare = function (step) {
      S.ops = [];
      step.ops().forEach((s) => {
        if (s.type === 'flat') {
          S.splitAll(s.A, s.d);
          const a = s.side > 0 ? [s.d[0], s.d[1], 0] : [-s.d[0], -s.d[1], 0], n = [-s.d[1], s.d[0]];
          S.ops.push({
            A: [s.A[0], s.A[1], 0], a, angle: s.dir * PI, flip: true, pinch: !!s.pinch, dz: 0, mark: s.mark, dir: s.dir,
            match: (t) => {
              const cx = (t.p[0][0] + t.p[1][0] + t.p[2][0]) / 3, cy = (t.p[0][1] + t.p[1][1] + t.p[2][1]) / 3;
              const cd = (cx - s.A[0]) * n[0] + (cy - s.A[1]) * n[1];
              return Math.abs(cd) > EPS && (cd > 0 ? 1 : -1) === s.side && (!s.layer || layerOf(t) === s.layer);
            }
          });
        } else {
          S.ops.push({ A: s.A, a: s.a, angle: s.angle, flip: false, pinch: false, dz: 0, match: s.select, dir: 0 });
        }
      });
      tex.redraw(S.creases);
      S.rebuild(tex.meshes);
      S.tris.forEach((t) => { t.op = -1; for (let k = 0; k < S.ops.length; k++) if (S.ops[k].match(t)) { t.op = k; break; } });
      // stacking: a flipped group lands just above (or below) whatever stays put
      let zmaxF = 0, zminF = 0, any = false;
      S.tris.forEach((t) => { if (t.op < 0) t.p.forEach((p) => { zmaxF = any ? Math.max(zmaxF, p[2]) : p[2]; zminF = any ? Math.min(zminF, p[2]) : p[2]; any = true; }); });
      S.ops.forEach((o, k) => {
        if (!o.flip) return;
        let mx = -1e9, mn = 1e9;
        S.tris.forEach((t) => { if (t.op === k) t.p.forEach((p) => { mx = Math.max(mx, p[2]); mn = Math.min(mn, p[2]); }); });
        if (mx < -1e8) return;
        o.dz = o.dir > 0 ? zmaxF + mx + GAP : zminF + mn - GAP;
      });
      S.tris.forEach((t) => { if (t.op >= 0 && S.ops[t.op].mark) t.marks.wing = S.ops[t.op].mark; });
    };
    function transformed(t, j, f) {
      const p = t.p[j];
      if (t.op < 0) return p;
      const o = S.ops[t.op], th = o.pinch ? o.angle * Math.sin(PI * f) : o.angle * f;
      const r = rot([p[0] - o.A[0], p[1] - o.A[1], p[2] - o.A[2]], o.a, th);
      return [o.A[0] + r[0], o.A[1] + r[1], o.A[2] + r[2] + (o.flip ? o.dz * Math.abs(th) / PI : 0)];
    }
    S.apply = function (f) {
      let i = 0;
      for (const t of S.tris) for (let j = 0; j < 3; j++) { const p = transformed(t, j, f); S.pos[i++] = p[0]; S.pos[i++] = p[1]; S.pos[i++] = p[2]; }
      S.geo.attributes.position.needsUpdate = true; S.geo.computeVertexNormals();
    };
    S.commit = function () {
      S.tris.forEach((t) => { t.p = [0, 1, 2].map((j) => transformed(t, j, 1)); t.op = -1; });
      S.ops = []; S.writeRest();
    };
    S.centroid = function () {
      let cx = 0, cy = 0, cz = 0, area = 0;
      S.tris.forEach((t) => {
        const a = t.p[0], b = t.p[1], c2 = t.p[2];
        const ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2], vx = c2[0] - a[0], vy = c2[1] - a[1], vz = c2[2] - a[2];
        const ar = 0.5 * Math.hypot(uy * vz - uz * vy, uz * vx - ux * vz, ux * vy - uy * vx);
        cx += ar * (a[0] + b[0] + c2[0]) / 3; cy += ar * (a[1] + b[1] + c2[1]) / 3; cz += ar * (a[2] + b[2] + c2[2]) / 3; area += ar;
      });
      return new V3(cx / area, cy / area, cz / area);
    };
    S.dispose = function () { if (S.geo) S.geo.dispose(); };
    return S;
  }

  /* ---------- textures: your note on the front, blank paper on the back, creases on both ---------- */
  function createTextures(frontBase, backBase, cw, ch) {
    const mkTex = () => {
      const c = document.createElement('canvas'); c.width = cw; c.height = ch;
      const t = new THREE.CanvasTexture(c);
      if ('colorSpace' in t) t.colorSpace = THREE.SRGBColorSpace; else t.encoding = THREE.sRGBEncoding;
      t.anisotropy = renderer.capabilities.getMaxAnisotropy();
      return { c, t };
    };
    const F = mkTex(), B = mkTex();
    const px = (uv) => [uv[0] * cw, (1 - uv[1]) * ch];
    function paint(target, base, creases) {
      const g = target.c.getContext('2d');
      g.globalAlpha = 1; g.drawImage(base, 0, 0, cw, ch);
      g.lineCap = 'round';
      for (const seg of cfg.creaseLines === false ? [] : creases) {
        const p0 = px(seg[0]), p1 = px(seg[1]), k = cw / 1024;
        g.strokeStyle = 'rgba(255,255,255,0.4)'; g.lineWidth = 4.5 * k;
        g.beginPath(); g.moveTo(p0[0] + 1.5 * k, p0[1] + 1.5 * k); g.lineTo(p1[0] + 1.5 * k, p1[1] + 1.5 * k); g.stroke();
        g.strokeStyle = 'rgba(70,55,30,0.34)'; g.lineWidth = 2.2 * k;
        g.beginPath(); g.moveTo(p0[0], p0[1]); g.lineTo(p1[0], p1[1]); g.stroke();
      }
      g.strokeStyle = 'rgba(70,55,30,0.38)'; g.lineWidth = 4 * (cw / 1024); g.strokeRect(0, 0, cw, ch);
      target.t.needsUpdate = true;
    }
    const api = {
      front: F.t, back: B.t, meshes: [],
      redraw(creases) { paint(F, frontBase, creases); paint(B, backBase, creases); },
      dispose() { F.t.dispose(); B.t.dispose(); }
    };
    api.redraw([]);
    return api;
  }

  /* ---------- glider: lift, drag and gravity, with a breeze ---------- */
  const G = 9.81, VT = 5.2, LD = 7;
  function Glider(v, gam, psi0, breeze) { this.p = new V3(); this.v = v; this.gam = gam; this.psi = psi0; this.psi0 = psi0; this.phi = 0; this.t = 0; this.b = breeze; this.aoa = 0.1; }
  Glider.prototype.step = function (dt) {
    const L = G * (this.v / VT) * (this.v / VT), D = L / LD;
    const phiT = Math.max(-0.4, Math.min(0.4, -1.1 * (this.psi - this.psi0) + 0.22 * Math.sin(0.55 * this.t + 0.4) + 0.05));
    this.phi += (phiT - this.phi) * Math.min(1, 2.2 * dt);
    this.v = Math.max(2.2, this.v + (-D - G * Math.sin(this.gam)) * dt);
    this.gam += ((L * Math.cos(this.phi) - G * Math.cos(this.gam)) / this.v) * dt;
    this.gam = Math.max(-1.3, Math.min(1.3, this.gam));
    this.psi += (L * Math.sin(this.phi) / (this.v * Math.max(0.2, Math.cos(this.gam)))) * dt;
    this.aoa = 0.1 + Math.max(-0.12, Math.min(0.2, 0.14 * (L / G - 1)));
    const cg = Math.cos(this.gam), b = this.b, t = this.t;
    const wx = b * 0.5 * Math.sin(0.35 * t + 0.5), wy = b * (0.85 + 0.35 * Math.sin(0.9 * t + 1) + 0.2 * Math.sin(2.3 * t + 2)), wz = -b * 1.2;
    this.p.x += (-Math.sin(this.psi) * cg * this.v + wx) * dt;
    this.p.y += (Math.sin(this.gam) * this.v + wy) * dt;
    this.p.z += (-Math.cos(this.psi) * cg * this.v + wz) * dt;
    this.t += dt;
  };

  /* ---------- play ---------- */
  function play(params) {
    cancel();
    ensureStage();
    return new Promise((resolve) => {
      const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduce) { params.onLaunch && params.onLaunch(); params.onGone && params.onGone(); resolve(); return; }
      const { w, h, d } = resizeStage();
      const rect = params.rect, cx = rect.left + rect.width / 2, cy = rect.top + rect.height / 2;
      const s = rect.width / PW;                                   // pixels per millimetre
      const ratio = Math.max(1.25, Math.min(1.7, rect.height / rect.width));
      const PL = PW * ratio, HL = PL / 2;

      // textures
      const cw = Math.round(Math.max(512, Math.min(1400, rect.width * Math.min(window.devicePixelRatio || 1, 2) * 1.2))), ch = Math.round(cw * ratio);
      const frontBase = document.createElement('canvas'); frontBase.width = cw; frontBase.height = ch;
      const fg = frontBase.getContext('2d');
      if (params.front) fg.drawImage(params.front, 0, 0, cw, ch);
      else fg.drawImage(paintNote(params.fields || {}, { width: cw, height: ch, paper: params.paperColor }), 0, 0);
      const backBase = paintBack(cw, ch, params.backColor || params.paperColor);
      const tex = createTextures(frontBase, backBase, cw, ch);

      // objects: root (pose) > spin (turns the card back to level) > paperGroup (sheet space to scene space)
      const root = new THREE.Group(); root.rotation.order = 'YXZ';
      const spin = new THREE.Group();
      const paperGroup = new THREE.Group(); paperGroup.scale.setScalar(s); paperGroup.rotation.x = -PI / 2;
      root.add(spin); spin.add(paperGroup);
      const mats = [
        new THREE.MeshStandardMaterial({ map: tex.front, roughness: 0.92, metalness: 0, side: THREE.FrontSide }),
        new THREE.MeshStandardMaterial({ map: tex.back, roughness: 0.92, metalness: 0, side: THREE.BackSide })
      ];
      const front = new THREE.Mesh(new THREE.BufferGeometry(), mats[0]), back = new THREE.Mesh(new THREE.BufferGeometry(), mats[1]);
      front.frustumCulled = back.frustumCulled = false;
      paperGroup.add(front); paperGroup.add(back);
      tex.meshes = [front, back];
      scene.add(root);
      root.position.set(cx - w / 2, -(cy - h / 2), 0);

      const sheet = createSheet(PL, tex);
      sheet.rebuild(tex.meshes); sheet.writeRest();
      let steps = buildSteps(HL).map((step, index) => ({ ...step, originalIndex: index }));
      if (cfg.skipCenterCrease) steps = steps.slice(1);
      if (cfg.mergeFinalFolds) {
        const stand = steps.splice(steps.length - 2, 1)[0];
        steps[steps.length - 1] = { ...steps[steps.length - 1], stand, dur: .8 };
      }
      const spd = cfg.speed;
      const rotRad = ((params.rotationDeg || 0) * PI) / 180;
      const heading = cfg.heading === 'auto' ? Math.max(-0.35, Math.min(0.35, ((cx - w / 2) / (w / 2)) * 0.4)) : cfg.heading;
      const view = { p: 0, y: 0, tp: 0, ty: 0 };

      // timeline
      const segs = [{ k: 'hold', dur: 0.14 / spd }];
      steps.forEach((st, i) => { segs.push({ k: 'step', i, dur: st.dur / spd }); segs.push({ k: 'gap', dur: 0.04 / spd }); });
      segs.push({ k: 'launch', dur: 0.7 / spd * 1.1 });
      segs.push({ k: 'flight', dur: cfg.flightSeconds });
      const st = { segs, si: 0, t: 0, total: 0, entered: -1, glider: null, launch: null, K: cfg.kScale * s, flightT: 0, launched: false };

      const finish = () => {
        cancelAnimationFrame(raf);
        scene.remove(root); sheet.dispose(); tex.dispose(); mats.forEach((m) => m.dispose());
        canvasEl.style.display = 'none';
        canvasEl.style.filter = cfg.dropShadow || 'none';
        run = null;
        params.onGone && params.onGone();
        resolve();
      };
      run = { finish, resolve };
      // Render the exact initial pose before the DOM sheet relinquishes its surface.
      root.rotation.set(PI / 2, 0, 0);
      spin.rotation.y = -rotRad;
      renderer.render(scene, camera);
      canvasEl.style.display = 'block';
      params.onReady && params.onReady();

      let last = performance.now();
      const onResize = () => { /* keep the plane aligned if the window changes mid-flight */ resizeStage(); };
      window.addEventListener('resize', onResize);
      const prevFinish = finish;
      run.finish = () => { window.removeEventListener('resize', onResize); prevFinish(); };

      function enter(seg) {
        if (seg.k === 'step') {
          const step = steps[seg.i];
          if (step.stand) {
            sheet.prepare(step.stand); sheet.apply(1); sheet.commit();
            paperGroup.rotation.y = -PI / 2;
          }
          sheet.prepare(steps[seg.i]);
          const v = step.originalIndex >= 5 ? cfg.sideView : cfg.tilt; view.tp = v[0]; view.ty = v[1];
        }
        if (seg.k === 'launch') beginLaunch();
        if (seg.k === 'flight') beginFlight();
      }
      function beginLaunch() {
        root.updateMatrixWorld(true);
        const c = sheet.centroid();
        const cw0 = paperGroup.localToWorld(c.clone());
        const cp = c.clone().applyMatrix4(paperGroup.matrix);
        paperGroup.position.sub(cp);            // pivot at the middle of the folded dart
        root.position.copy(cw0);
        const v0 = cfg.power, g0 = cfg.angle, psi0 = heading, T = st.segs[st.si].dur, vs = cfg.verticalScale;
        const dir = new V3(-Math.sin(psi0) * Math.cos(g0), Math.sin(g0), -Math.cos(psi0) * Math.cos(g0));
        const m1 = dir.clone().multiplyScalar(v0 * cfg.slowmo * st.K); m1.y *= vs;
        const p0 = root.position.clone();
        const p1 = p0.clone().addScaledVector(m1, T * 0.5);
        st.launch = { p0, p1, m1, T, g0, psi0, pitch0: root.rotation.x, yaw0: root.rotation.y };
        if (!st.launched) { st.launched = true; params.onLaunch && params.onLaunch(); }
        mats.forEach((m) => { m.transparent = true; m.needsUpdate = true; });
      }
      function beginFlight() {
        st.glider = new Glider(cfg.power, cfg.angle, heading, cfg.breeze);
        st.flightP0 = st.launch.p1.clone();
        st.flightRotation = root.quaternion.clone();
      }
      function hermite(l, sNorm) {
        const s2 = sNorm * sNorm, s3 = s2 * sNorm, h01 = -2 * s3 + 3 * s2, h11 = s3 - s2;
        return new V3().copy(l.p0).multiplyScalar(2 * s3 - 3 * s2 + 1).addScaledVector(l.p1, h01).addScaledVector(l.m1, h11 * l.T);
      }

      function tick(now) {
        const dt = Math.min(0.05, (now - last) / 1000); last = now;
        st.total += dt;
        // card eases back to level, camera tilts to a 3/4 view
        const vk = 1 - Math.exp(-4 * dt);
        view.p += (view.tp - view.p) * vk; view.y += (view.ty - view.y) * vk;
        spin.rotation.y = -rotRad * (1 - smooth(st.total / 0.6));
        let seg = st.segs[st.si];
        if (st.entered !== st.si) { st.entered = st.si; enter(seg); }
        st.t += dt;
        const tn = Math.min(1, st.t / seg.dur);

        if (seg.k === 'hold' || seg.k === 'gap' || seg.k === 'step') {
          root.rotation.set(PI / 2 - view.p, view.y, 0);
          if (seg.k === 'step') {
            sheet.apply(ease(tn));
            if (steps[seg.i].stand) paperGroup.rotation.y = -PI / 2 * (1 - ease(tn));
          }
        } else if (seg.k === 'launch') {
          const l = st.launch, k = smooth(tn);
          root.position.copy(hermite(l, tn));
          root.rotation.set(l.pitch0 + (l.g0 + 0.1 - l.pitch0) * k, l.yaw0 + (l.psi0 - l.yaw0) * k, 0);
        } else if (seg.k === 'flight') {
          const g = st.glider;
          const n = 4; for (let i = 0; i < n; i++) g.step((dt * cfg.slowmo) / n);
          st.flightT += dt;
          root.position.set(st.flightP0.x + g.p.x * st.K, st.flightP0.y + g.p.y * st.K * cfg.verticalScale, st.flightP0.z + g.p.z * st.K);
          root.rotation.set(g.gam + g.aoa + 0.012 * Math.sin(9 * g.t), g.psi, g.phi + 0.025 * Math.sin(6.3 * g.t + 1), 'YXZ');
          root.quaternion.slerpQuaternions(st.flightRotation, root.quaternion.clone(), smooth(st.flightT / .7));
          const fadeProgress = Math.max(0, Math.min(1, (st.flightT - (cfg.flightSeconds - cfg.fadeSeconds)) / cfg.fadeSeconds));
          const fade = 1 - smooth(fadeProgress);
          const distanceFade = fadeProgress * fadeProgress;
          root.scale.setScalar(1 - .975 * distanceFade);
          canvasEl.style.filter = `${cfg.dropShadow || ''} blur(${(cfg.flightBlur || 0) * distanceFade}px)`.trim();
          mats.forEach((m) => { m.opacity = fade; });
        }
        renderer.render(scene, camera);

        if (st.t >= seg.dur) {
          if (seg.k === 'step') sheet.commit();
          st.si++; st.t = 0;
          if (st.si >= st.segs.length) { run.finish(); return; }
        }
        raf = requestAnimationFrame(tick);
      }
      raf = requestAnimationFrame((now) => { last = now; tick(now); });
    });
  }
  function cancel() { if (run) { const r = run; run = null; cancelAnimationFrame(raf); r.finish(); } }
  function dispose() { cancel(); if (renderer) { renderer.dispose(); canvasEl.remove(); renderer = null; } }
  return { play, cancel, dispose };
}

/**
 * Measures a note element for play(). getBoundingClientRect() on a rotated card returns the
 * bigger axis-aligned box, so this rebuilds the true size from offsetWidth/offsetHeight and
 * reads the CSS rotation and scale from the computed transform.
 */
export function measureNote(el) {
  const r = el.getBoundingClientRect(), cs = getComputedStyle(el).transform;
  const m = new DOMMatrixReadOnly(cs === 'none' ? undefined : cs);
  const sc = Math.hypot(m.a, m.b) || 1, w = el.offsetWidth * sc, h = el.offsetHeight * sc;
  const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
  return { rect: { left: cx - w / 2, top: cy - h / 2, width: w, height: h }, rotationDeg: (Math.atan2(m.b, m.a) * 180) / Math.PI };
}

/* ---------- default paper painters (use when you do not pass a DOM snapshot) ---------- */
function rng(seed) { return function () { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

export function paintBack(w, h, color) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const g = c.getContext('2d'), r = rng(11);
  g.fillStyle = color || '#f1e8d2'; g.fillRect(0, 0, w, h);
  g.fillStyle = 'rgba(0,0,0,0.045)'; g.fillRect(0, 0, w, h);
  g.lineWidth = 1;
  for (let i = 0; i < 2200; i++) {
    const x = r() * w, y = r() * h, l = 3 + r() * 9, a = r() * 6.28;
    g.globalAlpha = 0.03 + r() * 0.04; g.strokeStyle = r() > 0.5 ? '#000' : '#fff';
    g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke();
  }
  return c;
}

/**
 * Paints the note face: crumpled cream paper, handwritten title and fields, a strip of tape.
 * opts: { width, height, paper, ink, label, font } where font is a loaded handwriting family.
 */
export function paintNote(fields, opts = {}) {
  const w = opts.width || 900, h = opts.height || Math.round(w * 1.38);
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const g = c.getContext('2d'), r = rng(7);
  const paper = opts.paper || '#f3ead3', ink = opts.ink || '#1f2f6b', label = opts.label || '#6d6350';
  const font = opts.font || 'Caveat, "Segoe Print", "Bradley Hand", cursive';
  g.fillStyle = paper; g.fillRect(0, 0, w, h);
  // soft crumple light
  for (let i = 0; i < 9; i++) {
    const x = r() * w, y = r() * h, gr = g.createLinearGradient(x, y, x + w * 0.3 * (r() - 0.5), y + h * 0.3);
    gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(0.5, 'rgba(255,255,255,0.22)'); gr.addColorStop(1, 'rgba(120,100,60,0.06)');
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
  }
  for (let i = 0; i < 3000; i++) {
    const x = r() * w, y = r() * h, l = 2 + r() * 7, a = r() * 6.28;
    g.globalAlpha = 0.03 + r() * 0.04; g.strokeStyle = r() > 0.5 ? '#000' : '#fff';
    g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke();
  }
  g.globalAlpha = 1;
  const px = (f) => Math.round(w * f), left = px(0.085), right = w - px(0.085);
  g.fillStyle = ink; g.textBaseline = 'alphabetic';
  g.font = '700 ' + px(0.08) + 'px ' + font; g.fillText(fields.title || 'Let’s talk.', left, px(0.135));
  // close mark
  g.strokeStyle = '#3a3a3a'; g.lineWidth = Math.max(2, w * 0.004);
  const cxm = w - px(0.1), cym = px(0.11), m = px(0.018);
  g.beginPath(); g.moveTo(cxm - m, cym - m); g.lineTo(cxm + m, cym + m); g.moveTo(cxm + m, cym - m); g.lineTo(cxm - m, cym + m); g.stroke();
  const rows = [['Your name', fields.name, 1], ['Your email', fields.email, 1], ['Your message', fields.message, 3]];
  let y = px(0.26);
  rows.forEach((row) => {
    g.fillStyle = label; g.font = '500 ' + px(0.04) + 'px ' + font; g.fillText(row[0], left, y);
    g.fillStyle = ink; g.font = '500 ' + px(0.062) + 'px ' + font;
    const words = String(row[1] || '').split(/\s+/), lines = []; let cur = '';
    words.forEach((wd) => { const t = cur ? cur + ' ' + wd : wd; if (g.measureText(t).width > right - left && cur) { lines.push(cur); cur = wd; } else cur = t; });
    if (cur) lines.push(cur);
    const lh = px(0.075);
    for (let i = 0; i < row[2]; i++) {
      const by = y + lh * (i + 1);
      if (lines[i]) g.fillText(lines[i], left, by - px(0.008));
      g.strokeStyle = 'rgba(40,40,40,0.35)'; g.lineWidth = Math.max(1.5, w * 0.002);
      g.beginPath(); g.moveTo(left, by); g.lineTo(right, by); g.stroke();
    }
    y += lh * (row[2] + 1) + px(0.07);
  });
  // tape with the button label
  const tw = px(0.46), th = px(0.095), tx = (w - tw) / 2 + px(0.02), ty = h - px(0.17);
  g.save(); g.translate(tx + tw / 2, ty + th / 2); g.rotate(-0.03);
  g.fillStyle = 'rgba(214,190,128,0.92)'; g.fillRect(-tw / 2, -th / 2, tw, th);
  g.fillStyle = '#3a3220'; g.font = '600 ' + px(0.052) + 'px ' + font; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillText(opts.button || 'Send message', 0, 0);
  g.restore();
  return c;
}
