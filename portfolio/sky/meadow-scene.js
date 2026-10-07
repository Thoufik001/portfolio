import * as THREE from "three";

// Blade shape and root/mid/tip wind weighting informed by James Smyth’s MIT
// three-grass-demo. Lighting approach studied from al-ro’s instanced grass demo.
// Original procedural surface shading; no third-party textures are used.
export function createMeadow(
  canvas,
  settings,
  paused = false,
  reduced = false,
) {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: "low-power",
  });
  renderer.setPixelRatio(1);
  renderer.setClearColor(0x000000, 0);
  const scene = new THREE.Scene();
  const targets = {
    light: settings.light * (1 - settings.cloud * 0.28 - settings.rain * 0.12),
    tint: new THREE.Color(settings.glow),
    haze: new THREE.Color(settings.bottom),
    wind: settings.wind ?? 5,
  };
  const environment = {
    uLight: { value: targets.light },
    uTint: { value: targets.tint.clone() },
    uHaze: { value: targets.haze.clone() },
  };
  const camera = new THREE.PerspectiveCamera(44, 1, 0.1, 80);
  camera.position.set(0, 3.3, 8);
  camera.lookAt(0, 0.2, -9);
  const terrain = (x, z) =>
    0.34 * Math.sin(x * 0.24 + z * 0.15) + 0.22 * Math.cos(z * 0.3 - x * 0.12);
  const groundGeometry = new THREE.PlaneGeometry(76, 70, 80, 80);
  groundGeometry.rotateX(-Math.PI / 2);
  const gp = groundGeometry.attributes.position;
  for (let i = 0; i < gp.count; i++)
    gp.setY(i, terrain(gp.getX(i), gp.getZ(i) - 23) - 0.03);
  gp.needsUpdate = true;
  groundGeometry.computeVertexNormals();
  const groundMaterial = new THREE.ShaderMaterial({
    transparent: true,
    uniforms: environment,
    vertexShader: `varying float vDepth; varying vec3 vWorld; void main(){vWorld=position;vec4 view=modelViewMatrix*vec4(position,1.);vDepth=-view.z;gl_Position=projectionMatrix*view;}`,
    fragmentShader: `uniform float uLight;uniform vec3 uTint;uniform vec3 uHaze;varying float vDepth;varying vec3 vWorld;void main(){float pattern=.5+.5*sin(vWorld.x*.7+sin(vWorld.z*.4));vec3 color=mix(vec3(.18,.27,.09),vec3(.29,.36,.14),pattern);color*=mix(.16,1.2,uLight);color*=mix(vec3(.65,.8,1.),uTint*.35+vec3(.8),uLight);float fog=smoothstep(10.,36.,vDepth);gl_FragColor=vec4(mix(color,uHaze,fog*.5),1.-fog);}`,
  });
  const ground = new THREE.Mesh(groundGeometry, groundMaterial);
  ground.position.z = -23;
  scene.add(ground);

  const blade = new THREE.InstancedBufferGeometry();
  const vertices = [],
    indices = [];
  const segments = 5;
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const width = 0.014 * Math.pow(1 - t, 0.85);
    vertices.push(-width, t, 0, width, t, 0);
    if (i < segments) {
      const j = i * 2;
      indices.push(j, j + 1, j + 2, j + 1, j + 3, j + 2);
    }
  }
  blade.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
  blade.setIndex(indices);
  const mobile = canvas.clientWidth < 600;
  const count = mobile ? 70000 : 140000,
    offsets = new Float32Array(count * 3),
    traits = new Float32Array(count * 3);
  let seed = 429;
  const random = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  for (let i = 0; i < count; i++) {
    const x = (random() - 0.5) * (mobile ? 24 : 42),
      z = 5 - random() * 42;
    offsets.set([x, terrain(x, z), z], i * 3);
    traits.set(
      [0.28 + random() * 0.36, random() * Math.PI * 2, random()],
      i * 3,
    );
  }
  blade.setAttribute("aRoot", new THREE.InstancedBufferAttribute(offsets, 3));
  blade.setAttribute("aTraits", new THREE.InstancedBufferAttribute(traits, 3));
  blade.instanceCount = count;
  const uniforms = {
    ...environment,
    uTime: { value: 0 },
    uPointer: { value: new THREE.Vector2(0, -12) },
    uForce: { value: 0 },
    uGust: { value: 0 },
  };
  const material = new THREE.ShaderMaterial({
    side: THREE.DoubleSide,
    transparent: true,
    uniforms,
    vertexShader: `attribute vec3 aRoot; attribute vec3 aTraits; uniform float uTime; uniform vec2 uPointer; uniform float uForce; uniform float uGust; varying float vHeight; varying float vSeed; varying float vDistance; varying vec3 vNormal; varying vec3 vWorld;
    void main(){float t=position.y;float angle=aTraits.y;vec3 p=vec3(position.x*cos(angle),t*aTraits.x,position.x*sin(angle));
    float wave=sin(aRoot.x*.57+aRoot.z*.39-uTime*1.5)+.45*sin(aRoot.z*.93+uTime*.7+aTraits.z*5.);
    vec2 delta=aRoot.xz-uPointer;float dist=length(delta);float influence=exp(-dist*dist*.12)*uForce;
    float gust=sin(dist*1.1-uTime*4.)*exp(-dist*.12)*uGust;
    vec2 bend=vec2(.025+wave*.035,wave*.016)+vec2(sin(angle),cos(angle))*.045*aTraits.z+normalize(delta+vec2(.001))*(influence*.19+gust*.075);
    p.xz+=bend*t*t; p.y-=length(bend)*.08*t*t;
    vec4 view=modelViewMatrix*vec4(p+aRoot,1.); gl_Position=projectionMatrix*view;vDistance=-view.z;vHeight=t;vSeed=aTraits.z;vWorld=p+aRoot;vNormal=normalize(vec3(-sin(angle),.15+t*.45,cos(angle)));}`,
    fragmentShader: `uniform float uLight; uniform vec3 uTint; uniform vec3 uHaze;
    varying float vHeight; varying float vSeed; varying float vDistance; varying vec3 vNormal; varying vec3 vWorld;
    void main(){
      vec3 normal=normalize(vNormal)*(gl_FrontFacing?1.:-1.);
      vec3 lightDir=normalize(vec3(-.65,.75,.3));
      vec3 viewDir=normalize(cameraPosition-vWorld);
      float diffuse=max(dot(normal,lightDir),0.);
      float transmission=max(dot(-normal,lightDir),0.)*.45;
      float sheen=pow(max(dot(normal,normalize(lightDir+viewDir)),0.),36.)*.14;
      vec3 leaf=mix(vec3(.10,.23,.025),vec3(.30,.39,.06),vSeed*vSeed);
      float rootShade=mix(.18,1.,smoothstep(0.,.75,vHeight));
      float clouds=.55+uLight*.45;
      vec3 illumination=vec3(.30)+uTint*(diffuse*.7+transmission+sheen)*clouds;
      vec3 color=leaf*illumination*rootShade*mix(.10,1.55,uLight);
      color=pow(color,vec3(.65));
      float fog=smoothstep(17.,42.,vDistance);
      gl_FragColor=vec4(mix(color,uHaze,fog*.3),1.-fog);
    }`,
  });
  const grass = new THREE.Mesh(blade, material);
  grass.frustumCulled = false;
  scene.add(grass);
  let frame = 0,
    alive = true,
    visible = false,
    isPaused = paused,
    isReduced = reduced,
    last = 0,
    time = 0,
    force = 0,
    gust = 0;
  const pointer = new THREE.Vector2(0, -12),
    ray = new THREE.Raycaster(),
    plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0),
    point = new THREE.Vector3();
  function draw(stamp) {
    frame = 0;
    if (!alive) return;
    const dt = last ? Math.min((stamp - last) / 1000, 0.05) : 0.016;
    last = stamp;
    const alpha = isReduced ? 1 : 1 - Math.exp(-dt / 0.24);
    environment.uLight.value +=
      (targets.light - environment.uLight.value) * alpha;
    environment.uTint.value.lerp(targets.tint, alpha);
    environment.uHaze.value.lerp(targets.haze, alpha);
    if (!isPaused && !isReduced) {
      time += dt * (0.65 + Math.min(targets.wind, 25) * 0.035);
      uniforms.uPointer.value.lerp(pointer, 1 - Math.exp(-dt * 7));
      uniforms.uForce.value +=
        (force - uniforms.uForce.value) * (1 - Math.exp(-dt * 5));
      gust *= Math.exp(-dt * 1.25);
    }
    uniforms.uTime.value = time;
    uniforms.uGust.value = isReduced ? 0 : gust;
    renderer.render(scene, camera);
    const settling =
      Math.abs(targets.light - environment.uLight.value) > 0.001 ||
      Math.abs(environment.uTint.value.r - targets.tint.r) +
        Math.abs(environment.uTint.value.g - targets.tint.g) +
        Math.abs(environment.uTint.value.b - targets.tint.b) >
        0.001 ||
      Math.abs(environment.uHaze.value.r - targets.haze.r) +
        Math.abs(environment.uHaze.value.g - targets.haze.g) +
        Math.abs(environment.uHaze.value.b - targets.haze.b) >
        0.001;
    if (visible && !document.hidden && ((!isPaused && !isReduced) || settling))
      frame = requestAnimationFrame(draw);
  }
  function wake() {
    if (alive && visible && !document.hidden && !frame) {
      last = 0;
      frame = requestAnimationFrame(draw);
    }
  }
  function stop() {
    cancelAnimationFrame(frame);
    frame = 0;
  }
  const resize = new ResizeObserver(() => {
    const rect = canvas.getBoundingClientRect();
    const scale = Math.min(1, 1400 / rect.width);
    renderer.setSize(rect.width * scale, rect.height * scale, false);
    camera.aspect = rect.width / rect.height;
    camera.updateProjectionMatrix();
    wake();
  });
  resize.observe(canvas);
  const observer = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible) wake();
    else stop();
  });
  observer.observe(canvas);
  function visibility() {
    stop();
    wake();
  }
  document.addEventListener("visibilitychange", visibility);
  return {
    update(next) {
      targets.light = next.light * (1 - next.cloud * 0.28 - next.rain * 0.12);
      targets.tint.set(next.glow);
      targets.haze.set(next.bottom);
      targets.wind = next.wind ?? 5;
      wake();
    },
    move(x, y) {
      if (isReduced || isPaused) return;
      ray.setFromCamera(new THREE.Vector2(x * 2 - 1, 1 - y * 2), camera);
      if (ray.ray.intersectPlane(plane, point)) {
        pointer.set(point.x, point.z);
        force = 1;
        wake();
      }
    },
    leave() {
      force = 0;
    },
    gust() {
      if (isPaused || isReduced) return;
      pointer.set(0, -4);
      force = 0;
      gust = 2;
      wake();
    },
    pause(value, motion) {
      isPaused = value;
      isReduced = motion;
      if (motion) {
        uniforms.uForce.value = 0;
        uniforms.uGust.value = 0;
      }
      stop();
      wake();
    },
    dispose() {
      alive = false;
      stop();
      resize.disconnect();
      observer.disconnect();
      document.removeEventListener("visibilitychange", visibility);
      blade.dispose();
      material.dispose();
      groundGeometry.dispose();
      groundMaterial.dispose();
      renderer.dispose();
    },
  };
}
