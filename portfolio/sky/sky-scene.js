import * as THREE from "three";
import { createSkyContrast } from "./sky-contrast";
import { windDynamics } from "./ambient-dynamics";
// LIQUID GLASS BRIDGE: no target, copying or additional rendering without a registration.
import { liquidElements, LIQUID_WAKE } from './liquid-glass/registry';
import { createLiquidPass } from './liquid-glass/pass';
export function createSky(canvas, settings, paused, reduced = false, onLightning) {
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
  let liquidPass;
  let liquidSkyDirty = true;
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
    uSunX: { value: settings.sunX ?? .72 },
    uMoonLight: { value: settings.moonLight ?? 0 },
    uRain: { value: settings.rain },
    uWind: { value: settings.wind ?? 5 },
    uWindGust: { value: settings.windGust ?? settings.wind ?? 5 },
    uGust: { value: 0 },
    uLightning: { value: 0 },
    uBoltOrigin: { value: new THREE.Vector2(.5, .9) },
    uBoltSeed: { value: 0 },
    uBoltVisible: { value: 1 },
  };
  const material = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: `varying vec2 vUv; void main(){vUv=uv;gl_Position=vec4(position,1.0);}`,
    fragmentShader: `
    precision highp float;
    varying vec2 vUv;
    uniform float uTime,uAspect,uCloud,uLight,uSun,uSunX,uMoonLight,uRain,uWind,uWindGust,uGust,uLightning,uScrub,uWindX,uWindY,uLow,uMid,uHigh,uWarmth,uSeed,uBoltSeed,uBoltVisible;
    uniform vec2 uDrift,uBoltOrigin;
    uniform vec3 uTop,uBottom,uGlow;
    float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453123);}
    float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
    float fbm(vec2 p){float value=0.0,weight=.5;for(int i=0;i<5;i++){value+=weight*noise(p);p=mat2(.8,.6,-.6,.8)*p*2.02+vec2(2.7,9.2);weight*=.5;}return value;}
    float segmentDistance(vec2 p,vec2 a,vec2 b){vec2 edge=b-a;return length(p-a-edge*clamp(dot(p-a,edge)/dot(edge,edge),0.0,1.0));}
    void main(){
      vec2 uv=vUv;
      float elevation=smoothstep(0.0,1.0,uv.y);
      vec3 color=mix(uBottom,uTop,elevation);
      vec2 p=vec2(uv.x*uAspect,uv.y);
      float sunDistance=length((p-vec2(uAspect*uSunX,uSun*.7+.08))*vec2(.65,1.0));
      float halo=exp(-sunDistance*sunDistance*3.0)*.22*smoothstep(-.18,.12,uSun)*(1.0-uCloud*.7);
      color=mix(color,uGlow,halo);
      // Broad off-screen daylight bloom follows solar height and azimuth.
      float sunHeight=clamp(uSun/.85,0.0,1.0);
      vec2 incomingLight=normalize(vec2((uSunX-.5)*3.0,.2+sunHeight*1.5));
      float lightDistance=4.0*max(uAspect,1.0);
      vec2 lightOrigin=vec2(uAspect*.5,.5)+incomingLight*lightDistance;
      vec2 lightDelta=(p-lightOrigin)*vec2(.65,1.0);
      float sunshine=smoothstep(.08,.45,uSun)*(1.0-smoothstep(.2,.9,uCloud))*(1.0-uRain);
      float daylightBloom=(.25+.35*uv.y)*sunshine;
      color=mix(color,vec3(.96,.97,1.0),daylightBloom*.12);
      // Advect all layers in a continuous wind field; the time dial adds reversible travel.
      vec2 drift=uDrift+vec2(uScrub,0.0);
      float clearScale=1.0+.45*(1.0-smoothstep(.12,.4,uCloud));
      vec2 cp=vec2(p.x*2.8,p.y*4.2)*clearScale+vec2(uSeed, uSeed*.31);
      float shape=fbm(cp-drift+vec2(4.2,1.8));
      float detail=fbm(cp*2.8-drift*1.2+vec2(9.1,5.3));
      float density=shape+detail*.12;
      // Let sparse low clouds remain visible without changing dense cloud decks.
      float sparseAdjustment=1.0-smoothstep(.2,.7,uCloud);
      float threshold=.64-uCloud*.32+.01*sparseAdjustment;
      float lowPresence=mix(smoothstep(.005,.25,uLow),smoothstep(.005,.18,uLow),sparseAdjustment);
      float cumulus=smoothstep(threshold-.06,threshold+.14,density)*lowPresence;
      float sheet=smoothstep(.24,.7,fbm(cp*vec2(.55,1.4)-drift*.65+19.0))*uMid;
      float wisps=smoothstep(.52,.72,fbm(cp*vec2(.65,3.5)-drift*.4+32.0))*uHigh;
      float cover=1.0-(1.0-cumulus)*(1.0-sheet*.55)*(1.0-wisps*.3);
      float rainDeck=uRain*(.66+.16*noise(cp*vec2(.38,.32)-drift*.2+vec2(7.2,13.1)));
      cover=(1.0-(1.0-cover)*(1.0-rainDeck))*smoothstep(.02,.24,uv.y);
      float storm=clamp(uRain*.8+smoothstep(.7,1.0,uCloud)*.18,0.0,1.0);
      color*=mix(vec3(1.0),vec3(.75,.79,.86),uRain*.55);
      vec3 ambient=color;
      vec3 lit=mix(ambient,vec3(1.0),(.08+.48*uLight)*(1.0-.35*storm));
      vec2 lightDirection=normalize(lightOrigin-p+vec2(.0001));
      float facing=clamp((shape-fbm(cp-drift+vec2(4.2,1.8)+lightDirection*.09))*8.0,0.0,1.0);
      vec3 edgeLight=mix(vec3(1.0,.97,.9),vec3(.98,.99,1.0),smoothstep(.15,.5,uSun));
      lit=mix(lit,edgeLight,facing*sunshine*.14);
      // Low sunlight colors the cloud surface, with cooler shaded interiors.
      float sunsetLight=uWarmth*(1.0-uRain)*smoothstep(-.18,.02,uSun);
      vec3 sunsetEdge=mix(vec3(1.0,.62,.38),vec3(1.0,.78,.48),smoothstep(-.05,.12,uSun));
      lit=mix(lit,sunsetEdge,sunsetLight*(.35+facing*.5)*(.65+detail*.35));
      // Keep the original diffuse lighting, with a restrained night highlight.
      float daylight=smoothstep(.15,.5,uLight);
      vec3 nightCloud=mix(ambient*.7,ambient*1.55+vec3(.025,.035,.055)*(.4+uMoonLight*.6),clamp(.38+detail*.6,0.0,1.0));
      lit=mix(nightCloud,lit,daylight);
      vec3 cloudColor=mix(ambient,lit,mix(.95,clamp(.7+detail*.06,0.0,1.0),daylight));
      float cloudOpacity=mix(.72+uCloud*.23,.4+uCloud*.55,daylight);
      color=mix(color,cloudColor,cover*cloudOpacity);
      // Sample the same drifting cloud field toward the sun. Openings produce
      // a soft fan of shafts; cloud shadows interrupt them without a fixed stripe pattern.
      float transmission=1.0;
      float shafts=0.0;
      vec2 rayDirection=normalize(p-lightOrigin+vec2(.0001));
      for(int sampleIndex=0;sampleIndex<5;sampleIndex++) {
        float travel=.2+float(sampleIndex)*.12;
        vec2 samplePoint=p+incomingLight*travel;
        vec2 sampleCloud=vec2(samplePoint.x*2.8,samplePoint.y*4.2)*clearScale+vec2(uSeed,uSeed*.31);
        float sampleDensity=fbm(sampleCloud-drift+vec2(4.2,1.8));
        float obstruction=smoothstep(threshold-.06,threshold+.14,sampleDensity)*lowPresence;
        transmission*=1.0-obstruction*.85;
        shafts+=transmission/5.0;
      }
      // Angular variation makes separate soft shafts readable at portfolio scale.
      // Their apertures drift with the cloud field and remain attenuated by its shadows.
      vec2 acrossLight=vec2(incomingLight.y,-incomingLight.x);
      float transverse=dot(rayDirection,acrossLight)*lightDistance;
      // A continuous aperture field varies width, spacing and strength as clouds
      // travel; there is no fixed number of beams or repeating three-slot pattern.
      float lightField=noise(vec2(transverse*3.6+uSeed,drift.x*.65+uSeed*.3))*.7
        +noise(vec2(transverse*8.3+uSeed*.7,drift.y*.45+7.0))*.3;
      // Each angular opening has its own evolving lifetime, reach and softness.
      // Cloud travel (including dial travel) reshapes them instead of rotating
      // a uniform mask with an identical full-screen extent.
      float aperturePhase=uTime*.045+dot(drift,vec2(.32,.19));
      float life=noise(vec2(transverse*2.7+uSeed+41.0,aperturePhase+11.0));
      float reach=noise(vec2(transverse*4.1+uSeed+73.0,aperturePhase*.73+29.0));
      float softness=noise(vec2(transverse*5.8+uSeed,aperturePhase*.51+53.0));
      float rayMask=smoothstep(.34+softness*.1,.68+softness*.08,lightField)
        *smoothstep(.25,.68,life);
      // Distance from the frame's sun-facing edge, with different lengths per
      // opening. Soft tails avoid the straight edge of a rectangular overlay.
      float travelIntoSky=dot(p-vec2(uAspect*.5,1.0),-incomingLight);
      float rayLength=.25+reach*1.65;
      float lengthFade=1.0-smoothstep(rayLength*.35,rayLength,travelIntoSky);
      rayMask*=lengthFade;
      float brokenClouds=smoothstep(.02,.1,uCloud)*(1.0-smoothstep(.65,.94,uCloud));
      float shaftStrength=smoothstep(-.02,.1,uSun)*brokenClouds*(1.0-uRain)*(.27+uWarmth*.08);
      float shaftDistance=.55+.25*uv.y;
      vec3 shaftColor=mix(vec3(.94,.97,1.0),vec3(1.0,.86,.67),uWarmth);
      color=mix(color,shaftColor,rayMask*shafts*shaftStrength*shaftDistance*(1.0-cover*.7));
      // Broad gusts change the angle of whole curtains; nearer drops lean a little more.
      float gustEnvelope=uGust;
      float windLean=clamp(uWind*.009,0.0,.38);
      float gustLean=gustEnvelope*(.12+.11*min(uWind/30.0,1.0));
      float windSign=uWindX < -.08 ? -1.0 : 1.0;
      for(int layer=0;layer<2;layer++){
        float depth=float(layer);
        float sway=sin(uTime*.62+depth*.8+uSeed)*.028;
        float slant=clamp(windSign*(windLean*max(abs(uWindX),.38)+gustLean)+sway,-.48,.48);
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
      // In-cloud illumination carries the flash; a fine, irregular channel is
      // visible only on some strikes, mostly veiled by the illuminated cloud.
      if(uLightning>.001){
        vec2 local=vec2((uv.x-uBoltOrigin.x)*uAspect,uv.y-uBoltOrigin.y);
        float cloudFlash=exp(-length(local*vec2(.65,1.35)-vec2(0.0,-.08))*4.4);
        float cloudTexture=.62+.38*fbm(cp*1.15-drift*.7+uBoltSeed);
        color+=vec3(.54,.63,.83)*cloudFlash*cloudTexture*uLightning*(.16+.36*cover);
        float channel=10.0;
        vec2 previous=vec2(0.0,0.0);
        for(int i=1;i<=16;i++){
          float stepIndex=float(i);
          float bend=(hash(vec2(floor(stepIndex/3.0),uBoltSeed))-.5)*.085;
          float fine=(hash(vec2(stepIndex,uBoltSeed+17.0))-.5)*.022;
          vec2 next=vec2(bend+fine+stepIndex*.002*sin(uBoltSeed),-stepIndex*.021);
          channel=min(channel,segmentDistance(local,previous,next));
          if(i==7 || i==11){
            float direction=hash(vec2(uBoltSeed,stepIndex))>.5?1.0:-1.0;
            vec2 branch=next+vec2(direction*(.035+.045*hash(vec2(stepIndex,uBoltSeed+3.0))),-.045);
            channel=min(channel,segmentDistance(local,next,branch));
          }
          previous=next;
        }
        float fineCore=1.0-smoothstep(.0002,.0009,channel);
        float scattered=exp(-channel*120.0)*.08;
        float veil=(.22+.68*cover)*uBoltVisible*uLightning;
        color=mix(color,vec3(.87,.91,.99),clamp((fineCore*.42+scattered)*veil,0.0,1.0));
      }
      float darkness=1.0-smoothstep(.15,.5,uLight);
      vec2 starUV=p*135.0;
      vec2 starCell=floor(starUV);
      vec2 starPosition=vec2(hash(starCell+3.1),hash(starCell+9.7));
      float starDistance=length(fract(starUV)-starPosition);
      float star=step(.992,hash(starCell))*exp(-starDistance*starDistance*190.0);
      float twinkle=.7+.3*sin(uTime*.65+hash(starCell)*45.0);
      float starVisibility=(1.0-smoothstep(.12,.65,cover))*(1.0-smoothstep(.82,.98,uCloud));
      color+=vec3(.82,.9,1.0)*star*twinkle*darkness*starVisibility*1.25;
      color+=(hash(gl_FragCoord.xy)-.5)*.006;
      gl_FragColor=vec4(color,1.0);
    }`,
  });
  const geometry = new THREE.PlaneGeometry(2, 2);
  scene.add(new THREE.Mesh(geometry, material));
  const colorPairs = [["top", "uTop"], ["bottom", "uBottom"], ["glow", "uGlow"]];
  const numberPairs = [["moonLight", "uMoonLight"], ["windGust", "uWindGust"], ["sunX", "uSunX"], ["cloud", "uCloud"], ["light", "uLight"], ["sun", "uSun"], ["rain", "uRain"], ["wind", "uWind"], ["windX", "uWindX"], ["windY", "uWindY"], ["lowCloud", "uLow"], ["midCloud", "uMid"], ["highCloud", "uHigh"], ["warmth", "uWarmth"], ["seed", "uSeed"], ["scrub", "uScrub"]];
  const targets = {};
  let initialized = false, settling = false;
  let previousPreview = settings.hour, scrub = 0;
  let frame = 0, alive = true, isPaused = paused, isReduced = reduced, last = 0, time = 0;
  let cloudDirection = (settings.windX ?? 1) < 0 ? -1 : 1;
  // An uneven storm cadence: occasional pairs, with a long tail of quiet gaps.
  // The minimum gap lets the existing thunder recording finish between strikes.
  const lightningGap = () => Math.random() < .22
    ? 9 + Math.random() * 5
    : 12 + Math.min(58, -Math.log(1 - Math.random()) * 22);
  let stormTime = 0, nextFlash = 4 + Math.random() * 9, flashAt = -1;
  function chooseLightning() {
    uniforms.uBoltOrigin.value.set(.22 + Math.random() * .56, .82 + Math.random() * .13);
    uniforms.uBoltSeed.value = Math.random() * 1000;
    uniforms.uBoltVisible.value = Math.random() > .68 ? 1 : 0;
  }
  const flashPulse = (age, start, duration) =>
    age >= start && age < start + duration
      ? Math.sin(Math.PI * (age - start) / duration)
      : 0;
  function approach(dt) {
    const alpha = isReduced ? 1 : 1 - Math.exp(-dt / .65);
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
      const wind = windDynamics({ wind: uniforms.uWind.value, windGust: uniforms.uWindGust.value, seed: uniforms.uSeed.value });
      uniforms.uGust.value = wind.swell;
      // Keep a visible sideways drift even when the reported wind is north/south
      // (its east/west component can be zero). Retain direction near that boundary
      // rather than stopping or flickering between left and right.
      if (Math.abs(uniforms.uWindX.value) > .15) cloudDirection = Math.sign(uniforms.uWindX.value);
      const speed = .035 + Math.min(wind.speed, 80) * .0008;
      uniforms.uDrift.value.x += dt * speed * cloudDirection;
      if (uniforms.uRain.value > .55) {
        stormTime += dt;
        if (stormTime >= nextFlash) {
          flashAt = stormTime;
          nextFlash = stormTime + lightningGap();
          chooseLightning();
          onLightning?.();
        }
        const age = stormTime - flashAt;
        uniforms.uLightning.value = Math.max(
          flashPulse(age, 0, .12),
          flashPulse(age, .19, .15) * .5,
        );
      } else {
        if (stormTime > 0) nextFlash = 4 + Math.random() * 9;
        stormTime = 0;
        flashAt = -1;
        uniforms.uLightning.value = 0;
      }
    } else {
      uniforms.uLightning.value = 0;
    }
    const transitioning = settling;
    if (settling) approach(dt);
    uniforms.uTime.value = time;
    const themeTransitioning = adaptiveContrast.update(scene, timestamp, transitioning, uniforms.uSun.value);
    renderer.render(scene, camera);
    // LIQUID GLASS BRIDGE: same-context render target, sampled after the original sky draw.
    let liquidMoving = false;
    if (liquidElements.size) {
      liquidPass ??= createLiquidPass(renderer, canvas);
      liquidMoving = liquidPass.draw(scene, camera, timestamp, liquidSkyDirty || transitioning || (!isPaused && !isReduced), !isPaused && !isReduced);
      liquidSkyDirty = false;
    } else if (liquidPass) { liquidPass.dispose(); liquidPass = null; }
    if ((!isPaused && !isReduced || settling || themeTransitioning || liquidMoving) && !document.hidden) frame = requestAnimationFrame(draw);
  }
  function wake() {
    if (!frame && alive && !document.hidden) {
      last = 0;
      frame = requestAnimationFrame(draw);
    }
  }
  function update(next) {
    liquidSkyDirty = true;
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
    liquidSkyDirty = true;
    wake();
  });
  resize.observe(canvas);
  function visibility() {
    cancelAnimationFrame(frame);
    frame = 0;
    if (!document.hidden) wake();
  }
  document.addEventListener("visibilitychange", visibility);
  window.addEventListener(LIQUID_WAKE, wake);
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
      window.removeEventListener(LIQUID_WAKE, wake);
      liquidPass?.dispose();
      geometry.dispose();
      material.dispose();
      adaptiveContrast.dispose();
      renderer.dispose();
    },
  };
}
