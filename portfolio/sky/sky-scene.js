import * as THREE from "three";
import { createSkyContrast } from "./sky-contrast";
export function createSky(canvas, settings, paused, reduced = false) {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: false,
    antialias: false,
    powerPreference: "low-power",
  });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1));
  const scene = new THREE.Scene(),
    camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const adaptiveContrast = createSkyContrast(renderer, camera, canvas);
  const uniforms = {
    uTime: { value: 0 },
    uDrift: { value: new THREE.Vector2() },
    uScrub: { value: 0 },
    uWindX: { value: 1 },
    uWindY: { value: 0 },
    uLow: { value: .35 },
    uMid: { value: .2 },
    uHigh: { value: .15 },
    uWarmth: { value: 0 },
    uSeed: { value: 0 },
    uAspect: { value: 1 },
    uTop: { value: new THREE.Color() },
    uBottom: { value: new THREE.Color() },
    uGlow: { value: new THREE.Color() },
    uCloud: { value: settings.cloud },
    uLight: { value: settings.light },
    uSun: { value: settings.sun },
    uRain: { value: settings.rain },
    uWind: { value: settings.wind ?? 5 },
  };
  const material = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: `varying vec2 vUv; void main(){vUv=uv;gl_Position=vec4(position,1.0);}`,
    fragmentShader: `
    precision highp float;
    varying vec2 vUv;
    uniform float uTime,uAspect,uCloud,uLight,uSun,uRain,uWind,uScrub,uWindX,uWindY,uLow,uMid,uHigh,uWarmth,uSeed;
    uniform vec2 uDrift;
    uniform vec3 uTop,uBottom,uGlow;
    float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453123);}
    float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
    float fbm(vec2 p){float value=0.0,weight=.5;for(int i=0;i<5;i++){value+=weight*noise(p);p=mat2(.8,.6,-.6,.8)*p*2.02+vec2(2.7,9.2);weight*=.5;}return value;}
    void main(){
      vec2 uv=vUv;
      float elevation=smoothstep(0.0,1.0,uv.y);
      vec3 color=mix(uBottom,uTop,elevation);
      vec2 p=vec2(uv.x*uAspect,uv.y);
      float sunDistance=length((p-vec2(uAspect*.72,uSun*.7+.08))*vec2(.65,1.0));
      float halo=exp(-sunDistance*sunDistance*3.0)*.22;
      color=mix(color,uGlow,halo);
      // Advect all layers in a continuous wind field; the time dial adds reversible travel.
      vec2 drift=uDrift+vec2(uScrub,0.0);
      vec2 cp=vec2(p.x*2.8,p.y*4.2)+vec2(uSeed, uSeed*.31);
      float shape=fbm(cp-drift+vec2(4.2,1.8));
      float detail=fbm(cp*2.8-drift*1.2+vec2(9.1,5.3));
      float density=shape+detail*.12;
      float threshold=.73-uCloud*.30;
      float cumulus=smoothstep(threshold,threshold+.13,density)*smoothstep(.005,.25,uLow);
      float sheet= smoothstep(.24,.7,fbm(cp*vec2(.55,1.4)-drift*.65+19.0))*uMid;
      float wisps=smoothstep(.52,.72,fbm(cp*vec2(.65,3.5)-drift*.4+32.0))*uHigh;
      float cover=clamp(cumulus+sheet*.65+wisps*.35,0.0,1.0)*smoothstep(.03,.3,uv.y);
      float edge=smoothstep(threshold+.01,threshold+.1,density);
      float storm=clamp(uRain*.85+smoothstep(.7,1.0,uCloud)*.35,0.0,1.0);
      vec3 shade=mix(vec3(.085,.12,.21),vec3(.63,.71,.80),uLight);
      vec3 lit=mix(vec3(.23,.29,.43),vec3(.98,.99,1.0),uLight);
      float warm=uWarmth*(1.0-storm*.9);
      shade=mix(shade,vec3(.53,.35,.48),warm*.7);
      lit=mix(lit,vec3(1.0,.67,.43),warm*.82);
      shade=mix(shade,vec3(.18,.23,.29)*(.3+uLight*.7),storm*.8);
      lit=mix(lit,vec3(.54,.59,.64)*(.3+uLight*.7),storm*.78);
      vec3 cloudColor=mix(shade,lit,edge*.65+detail*.2);
      color=mix(color,cloudColor,cover*(.6+uCloud*.35));
      color=mix(color,vec3(.34,.41,.47)*(.3+uLight*.7),uRain*.36);
      // Stable columns and per-drop phase: elongated streaks actually travel downward.
      for(int layer=0;layer<2;layer++){
        float depth=float(layer);
        float slant=uWindX*min(uWind*.004,.16);
        vec2 rp=vec2((p.x-p.y*slant)*(105.0+depth*62.0),p.y*(7.0+depth*4.0));
        float column=floor(rp.x);
        float speed=2.5+hash(vec2(column,depth+7.0))*2.5;
        float phase=fract(rp.y+uTime*speed+hash(vec2(column,depth)));
        float center=.2+hash(vec2(column,depth+3.0))*.6;
        float width=.025+depth*.018;
        float streak=(1.0-smoothstep(width,width*2.0,abs(fract(rp.x)-center)));
        streak*=smoothstep(.0,.025,phase)*(1.0-smoothstep(.12,.25,phase));
        streak*=step(hash(vec2(column,depth+11.0)),uRain*.8);
        color=mix(color,vec3(.72,.80,.87),streak*uRain*(.23+depth*.15));
      }
      float darkness=1.0-smoothstep(.15,.5,uLight);
      vec2 starUV=p*135.0;
      vec2 starCell=floor(starUV);
      vec2 starPosition=vec2(hash(starCell+3.1),hash(starCell+9.7));
      float starDistance=length(fract(starUV)-starPosition);
      float star=step(.992,hash(starCell))*exp(-starDistance*starDistance*190.0);
      float twinkle=.7+.3*sin(uTime*.65+hash(starCell)*45.0);
      color+=vec3(.82,.9,1.0)*star*twinkle*darkness*(1.0-cover*.95)*(1.0-uCloud*.6)*1.25;
      color+=(hash(gl_FragCoord.xy)-.5)*.006;
      gl_FragColor=vec4(color,1.0);
    }`,
  });
  const geometry = new THREE.PlaneGeometry(2, 2);
  scene.add(new THREE.Mesh(geometry, material));
  const colorPairs = [["top", "uTop"], ["bottom", "uBottom"], ["glow", "uGlow"]];
  const numberPairs = [["cloud", "uCloud"], ["light", "uLight"], ["sun", "uSun"], ["rain", "uRain"], ["wind", "uWind"], ["windX", "uWindX"], ["windY", "uWindY"], ["lowCloud", "uLow"], ["midCloud", "uMid"], ["highCloud", "uHigh"], ["warmth", "uWarmth"], ["seed", "uSeed"], ["scrub", "uScrub"]];
  const targets = {};
  let initialized = false, settling = false;
  let previousPreview = settings.hour, scrub = 0;
  let frame = 0, alive = true, isPaused = paused, isReduced = reduced, last = 0, time = 0;
  function approach(dt) {
    const alpha = isReduced ? 1 : 1 - Math.exp(-dt / .24);
    let difference = 0;
    for (const [, name] of colorPairs) {
      const current = uniforms[name].value, target = targets[name];
      current.lerp(target, alpha);
      difference = Math.max(difference, Math.abs(current.r - target.r), Math.abs(current.g - target.g), Math.abs(current.b - target.b));
    }
    for (const [, name] of numberPairs) {
      const current = uniforms[name].value, target = targets[name];
      uniforms[name].value = current + (target - current) * alpha;
      difference = Math.max(difference, Math.abs(uniforms[name].value - target));
    }
    settling = difference > .001;
    if (!settling) {
      for (const [, name] of colorPairs) uniforms[name].value.copy(targets[name]);
      for (const [, name] of numberPairs) uniforms[name].value = targets[name];
    }
  }
  function draw(timestamp) {
    frame = 0;
    if (!alive) return;
    const dt = last ? Math.min((timestamp - last) / 1000, .1) : 1 / 60;
    last = timestamp;
    if (!isPaused && !isReduced) {
      time += dt;
      const speed = .012 + Math.min(uniforms.uWind.value, 60) * .0007;
      uniforms.uDrift.value.x += dt * speed * uniforms.uWindX.value;
      uniforms.uDrift.value.y += dt * speed * uniforms.uWindY.value;
    }
    const transitioning = settling;
    if (settling) approach(dt);
    uniforms.uTime.value = time;
    adaptiveContrast.update(scene, timestamp, transitioning);
    renderer.render(scene, camera);
    if ((!isPaused && !isReduced || settling) && !document.hidden) frame = requestAnimationFrame(draw);
  }
  function wake() {
    if (!frame && alive && !document.hidden) {
      last = 0;
      frame = requestAnimationFrame(draw);
    }
  }
  function update(next) {
    if (next.previewHour != null && previousPreview != null && !isPaused && !isReduced) {
      let delta = next.previewHour - previousPreview;
      if (delta > 12) delta -= 24;
      if (delta < -12) delta += 24;
      scrub += delta * .14;
    }
    previousPreview = next.hour;
    next = { ...next, scrub };
    for (const [prop, name] of colorPairs) {
      targets[name] = new THREE.Color(next[prop]).convertLinearToSRGB();
      if (!initialized || isReduced) uniforms[name].value.copy(targets[name]);
    }
    for (const [prop, name] of numberPairs) {
      targets[name] = next[prop] ?? 0;
      if (!initialized || isReduced) uniforms[name].value = targets[name];
    }
    settling = initialized && !isReduced;
    initialized = true;
    wake();
  }
  const resize = new ResizeObserver(() => {
    const box = canvas.getBoundingClientRect();
    const scale = Math.min(1, 1280 / box.width);
    renderer.setSize(box.width * scale, box.height * scale, false);
    uniforms.uAspect.value = box.width / box.height;
    wake();
  });
  resize.observe(canvas);
  function visibility() {
    cancelAnimationFrame(frame);
    frame = 0;
    if (!document.hidden) wake();
  }
  document.addEventListener("visibilitychange", visibility);
  update(settings);
  return {
    update,
    pause(value, reducedMotion = false) {
      isPaused = value;
      isReduced = reducedMotion;
      cancelAnimationFrame(frame);
      frame = 0;
      wake();
    },
    dispose() {
      alive = false;
      cancelAnimationFrame(frame);
      resize.disconnect();
      document.removeEventListener("visibilitychange", visibility);
      geometry.dispose();
      material.dispose();
      adaptiveContrast.dispose();
      renderer.dispose();
    },
  };
}
