import * as T from "three";

export function createStudio(canvas, onAnchors, reduced) {
  const renderer = new T.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: "low-power",
  });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.7));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = T.PCFShadowMap;
  renderer.outputColorSpace = T.SRGBColorSpace;
  renderer.setClearColor(0x000000, 0);
  const scene = new T.Scene();
  const camera = new T.OrthographicCamera(-6, 6, 4, -4, 0.1, 100);
  camera.position.set(10, 9, 12);
  camera.lookAt(0, 1, 0);
  scene.add(new T.HemisphereLight(0xf7fbff, 0x889297, 2.1));
  const sun = new T.DirectionalLight(0xfff4df, 3.2);
  sun.position.set(-5, 9, 5);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.left = -7;
  sun.shadow.camera.right = 7;
  sun.shadow.camera.top = 7;
  sun.shadow.camera.bottom = -7;
  sun.shadow.normalBias = 0.025;
  sun.shadow.bias = -0.0003;
  scene.add(sun);
  const room = new T.Group();
  scene.add(room);
  const mats = new Map();
  function mat(color, roughness = 0.8) {
    const key = color + ":" + roughness;
    if (!mats.has(key))
      mats.set(key, new T.MeshStandardMaterial({ color, roughness }));
    return mats.get(key);
  }
  function box(w, h, d, color, x, y, z, parent = room) {
    const m = new T.Mesh(new T.BoxGeometry(w, h, d), mat(color));
    m.position.set(x, y, z);
    m.castShadow = true;
    m.receiveShadow = true;
    parent.add(m);
    return m;
  }
  function cyl(r, h, color, x, y, z, parent = room, rt = r) {
    const m = new T.Mesh(new T.CylinderGeometry(rt, r, h, 32), mat(color));
    m.position.set(x, y, z);
    m.castShadow = true;
    m.receiveShadow = true;
    parent.add(m);
    return m;
  }
  function sphere(r, color, x, y, z, parent = room) {
    const m = new T.Mesh(new T.SphereGeometry(r, 24, 16), mat(color));
    m.position.set(x, y, z);
    m.castShadow = true;
    parent.add(m);
    return m;
  }
  function line(a, b, r, color) {
    const av = new T.Vector3(...a),
      bv = new T.Vector3(...b),
      v = bv.clone().sub(av);
    const m = cyl(r, v.length(), color, 0, 0, 0);
    m.position.copy(av.add(bv).multiplyScalar(0.5));
    m.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), v.normalize());
    return m;
  }
  function label(text, w, h, bg, ink, size = 46) {
    const c = document.createElement("canvas");
    c.width = 768;
    c.height = 512;
    const ctx = c.getContext("2d");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, c.width, c.height);
    ctx.fillStyle = ink;
    ctx.font = `500 ${size}px Arial`;
    const lines = text.split("\n");
    lines.forEach((s, i) => ctx.fillText(s, 55, 90 + i * 65));
    const texture = new T.CanvasTexture(c);
    texture.colorSpace = T.SRGBColorSpace;
    const m = new T.Mesh(
      new T.PlaneGeometry(w, h),
      new T.MeshBasicMaterial({ map: texture }),
    );
    room.add(m);
    return m;
  }
  // A cutaway studio: all modelling and graphic assets are original and code-generated.
  box(8, 0.18, 5.7, 0xdce1df, 0, -0.08, 0);
  box(8, 4, 0.16, 0xc9dce6, 0, 2, -2.78);
  box(0.16, 4, 5.7, 0xe4e9e6, -3.94, 2, 0);
  box(8, 0.1, 0.09, 0xb6c5c7, 0, 0.12, -2.66);
  box(0.09, 0.1, 5.5, 0xb6c5c7, -3.84, 0.12, 0);
  // Bright recessed window, frame and shutters.
  box(0.06, 2.3, 2.6, 0xf7faf7, -3.83, 2.65, -0.55);
  [-1.85, 0.75].forEach((z) => box(0.12, 2.5, 0.08, 0xe9eeeb, -3.77, 2.65, z));
  [1.4, 3.9].forEach((y) => box(0.12, 0.08, 2.7, 0xe9eeeb, -3.77, y, -0.55));
  box(0.13, 2.4, 0.055, 0xd2dcda, -3.75, 2.65, -0.55);
  box(0.13, 0.055, 2.6, 0xd2dcda, -3.75, 2.65, -0.55);
  box(0.48, 0.1, 2.95, 0xf0f1ea, -3.65, 1.37, -0.55);
  // Pinboard: useful studies rather than decorative dashboard cards.
  box(2.45, 1.65, 0.08, 0x9badae, 1.5, 2.95, -2.64);
  const p1 = label(
    "One system.\nMany people.",
    1.18,
    0.89,
    "#f8f8f2",
    "#303a40",
    52,
  );
  p1.position.set(1.05, 3.08, -2.57);
  p1.rotation.z = 0.06;
  const p2 = label(
    "Explore\nBuild\nRefine",
    0.65,
    0.87,
    "#a7c9e9",
    "#26394b",
    58,
  );
  p2.position.set(2.08, 2.82, -2.56);
  p2.rotation.z = -0.09;
  sphere(0.035, 0x526472, 0.99, 3.48, -2.52);
  sphere(0.035, 0x526472, 2.1, 3.18, -2.52);
  // Desk with visible structure, bent metal legs and an under-desk drawer.
  box(5.55, 0.17, 2.1, 0x48515a, 0, 1.58, -0.72);
  for (const x of [-2.5, 2.5]) {
    box(0.09, 1.5, 0.1, 0x68727b, x, 0.77, -1.55);
    box(0.09, 1.5, 0.1, 0x68727b, x, 0.77, 0.1);
    box(0.09, 0.09, 1.95, 0x68727b, x, 0.12, -0.72);
  }
  box(1.03, 0.5, 1.6, 0x818c93, -1.91, 1.25, -0.72);
  box(0.65, 0.045, 0.04, 0x36434e, -1.91, 1.25, 0.09);
  // Monitor with a deliberately composed product-work graphic.
  box(2.1, 1.36, 0.13, 0x242d34, -0.15, 2.43, -1.26);
  box(0.22, 0.44, 0.15, 0x535f67, -0.15, 1.93, -1.3);
  box(0.88, 0.06, 0.54, 0x69757b, -0.15, 1.7, -1.21);
  const display = label(
    "Thoufik\nSelected work\nZyephrOS / SAP AI / Edtech",
    1.94,
    1.16,
    "#eaf0ef",
    "#263d4d",
    40,
  );
  display.position.set(-0.15, 2.43, -1.181);
  // Keyboard, individual keys and mouse. Objects share the same material language.
  box(1.43, 0.08, 0.48, 0xdfe4df, -0.15, 1.72, -0.28);
  for (let r = 0; r < 4; r++)
    for (let c = 0; c < 13; c++)
      box(
        0.08,
        0.035,
        0.065,
        0xf5f5ef,
        -0.74 + c * 0.098,
        1.78,
        -0.43 + r * 0.1,
      );
  const mouse = sphere(0.15, 0xe9ece6, 1, 1.77, -0.28);
  mouse.scale.set(0.7, 0.38, 1);
  box(0.66, 0.018, 0.75, 0x859099, 1, 1.68, -0.25);
  // Paper prototype and bound sketchbook.
  const notes = new T.Group();
  room.add(notes);
  notes.position.set(-1.75, 1.72, -0.48);
  notes.rotation.y = 0.13;
  box(1.1, 0.11, 0.77, 0x86a9c2, 0, 0, 0, notes);
  box(1.04, 0.07, 0.74, 0xf3f1e9, 0.025, 0.06, 0, notes);
  const paper = label(
    "Small ideas.\nReal things.",
    0.96,
    0.69,
    "#f3f1e9",
    "#47545c",
    56,
  );
  paper.rotation.x = -Math.PI / 2;
  paper.rotation.z = 0.13;
  paper.position.set(-1.73, 1.82, -0.48);
  const pencil = cyl(0.023, 0.85, 0x3b5d77, -2, 1.85, -0.4);
  pencil.rotation.z = Math.PI / 2;
  pencil.rotation.y = 0.2;
  // Coffee cup and task lamp.
  cyl(0.15, 0.29, 0xe7e9dd, 1.88, 1.82, -0.32, room, 0.17);
  cyl(0.13, 0.008, 0x48382e, 1.88, 1.97, -0.32);
  const handle = new T.Mesh(
    new T.TorusGeometry(0.1, 0.026, 10, 24),
    mat(0xe7e9dd),
  );
  handle.position.set(2.04, 1.85, -0.32);
  room.add(handle);
  cyl(0.25, 0.055, 0x324b5c, 2.2, 1.7, -1.38);
  line([2.2, 1.74, -1.38], [2.2, 2.6, -1.38], 0.033, 0x324b5c);
  line([2.2, 2.6, -1.38], [1.65, 2.83, -1.27], 0.034, 0x324b5c);
  const shade = cyl(0.27, 0.22, 0x324b5c, 1.65, 2.78, -1.27, room, 0.1);
  shade.rotation.z = -0.2;
  // Chair, pale textile rug and a planted corner.
  box(2.9, 0.025, 2.2, 0xc5d0d1, 0.35, 0.04, 1.17);
  for (let i = 0; i < 18; i++)
    box(0.018, 0.005, 2.15, 0xd3ddda, -1.02 + i * 0.16, 0.055, 1.17);
  const chair = new T.Group();
  room.add(chair);
  chair.position.set(0.2, 0, 1.03);
  chair.rotation.y = -0.3;
  box(1.12, 0.17, 1.02, 0x738f9f, 0, 0.89, 0, chair);
  box(1.12, 0.67, 0.12, 0x738f9f, 0, 1.43, 0.45, chair);
  cyl(0.05, 0.75, 0x68737a, 0, 0.46, 0, chair);
  for (let i = 0; i < 5; i++) {
    const a = (i * Math.PI * 2) / 5;
    const foot = box(
      0.07,
      0.06,
      0.65,
      0x68737a,
      Math.sin(a) * 0.27,
      0.12,
      Math.cos(a) * 0.27,
      chair,
    );
    foot.rotation.y = a;
    cyl(
      0.06,
      0.06,
      0x3a4650,
      Math.sin(a) * 0.56,
      0.06,
      Math.cos(a) * 0.56,
      chair,
    );
  }
  cyl(0.32, 0.54, 0xc4cbc1, 3.15, 0.31, -1.88, room, 0.39);
  cyl(0.34, 0.02, 0x64594b, 3.15, 0.59, -1.88);
  for (let i = 0; i < 7; i++) {
    const a = i * 2.4,
      x = 3.15 + Math.cos(a) * 0.35,
      z = -1.88 + Math.sin(a) * 0.3,
      y = 1.15 + (i % 3) * 0.32;
    line([3.15, 0.58, -1.88], [x, y, z], 0.018, 0x698170);
    const leaf = sphere(0.24, 0x91a79a, x, y, z);
    leaf.scale.set(0.55, 1.7, 0.18);
    leaf.rotation.z = Math.cos(a) * 0.7;
    leaf.rotation.y = a;
  }
  const anchors = [
    ["work", [-0.15, 2.98, -1.15]],
    ["play", [-1.8, 1.87, 0.15]],
    ["about", [1.6, 3.65, -2.45]],
  ];
  let width = 900,
    height = 560,
    raf = null,
    alive = true,
    tx = 0,
    ty = 0,
    rx = 0,
    ry = 0;
  function draw() {
    if (!alive) return;
    rx += (tx - rx) * 0.075;
    ry += (ty - ry) * 0.075;
    room.rotation.y = rx;
    room.rotation.x = ry;
    renderer.render(scene, camera);
    const out = {};
    for (const [key, xyz] of anchors) {
      const v = new T.Vector3(...xyz)
        .applyMatrix4(room.matrixWorld)
        .project(camera);
      out[key] = {
        left: Math.max(80, Math.min(width - 80, ((v.x + 1) * width) / 2)),
        top: ((1 - v.y) * height) / 2,
      };
    }
    onAnchors(out);
    if (Math.abs(tx - rx) + Math.abs(ty - ry) > 0.0001)
      raf = requestAnimationFrame(draw);
    else raf = null;
  }
  function wake() {
    if (!raf) raf = requestAnimationFrame(draw);
  }
  const resize = new ResizeObserver(([entry]) => {
    width = entry.contentRect.width;
    height = entry.contentRect.height;
    const aspect = width / height,
      view = Math.max(4.25, 5.8 / aspect);
    camera.left = -view * aspect;
    camera.right = view * aspect;
    camera.top = view;
    camera.bottom = -view;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
    wake();
  });
  resize.observe(canvas);
  const move = (e) => {
    if (reduced || e.pointerType === "touch") return;
    const r = canvas.getBoundingClientRect();
    tx = ((e.clientX - r.left) / r.width - 0.5) * 0.1;
    ty = ((e.clientY - r.top) / r.height - 0.5) * 0.025;
    wake();
  };
  const leave = () => {
    tx = ty = 0;
    wake();
  };
  canvas.addEventListener("pointermove", move);
  canvas.addEventListener("pointerleave", leave);
  wake();
  return () => {
    alive = false;
    cancelAnimationFrame(raf);
    resize.disconnect();
    canvas.removeEventListener("pointermove", move);
    canvas.removeEventListener("pointerleave", leave);
    scene.traverse((o) => {
      o.geometry?.dispose();
      if (o.material) {
        for (const m of Array.isArray(o.material) ? o.material : [o.material]) {
          m.map?.dispose();
          m.dispose();
        }
      }
    });
    renderer.dispose();
  };
}
