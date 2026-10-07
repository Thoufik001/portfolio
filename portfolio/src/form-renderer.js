import {
  BufferGeometry,
  Float32BufferAttribute,
  ShaderMaterial,
  Points,
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
} from "three";

export function createFormRenderer(canvas, points) {
  const renderer = new WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    powerPreference: "low-power",
  });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  const scene = new Scene(),
    camera = new PerspectiveCamera(34, 1, 0.1, 100);
  camera.position.z = 12;
  const geometry = new BufferGeometry();
  geometry.setAttribute(
    "position",
    new Float32BufferAttribute(
      points.flatMap((p) => p.p),
      3,
    ),
  );
  geometry.setAttribute(
    "normal",
    new Float32BufferAttribute(
      points.flatMap((p) => p.n),
      3,
    ),
  );
  geometry.setAttribute(
    "aScatter",
    new Float32BufferAttribute(
      points.flatMap((p) => p.scatter),
      3,
    ),
  );
  const material = new ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: {
      uResolve: { value: 1 },
      uDark: { value: 0 },
      uDpr: { value: renderer.getPixelRatio() },
    },
    vertexShader: `
      uniform float uResolve;
      uniform float uDpr;
      attribute vec3 aScatter;
      varying float vShade;
      void main(){
        vec3 p=mix(aScatter,position,uResolve);
        vec3 n=normalize(normalMatrix*normal);
        vShade=clamp(dot(n,normalize(vec3(-0.4,0.7,1.0)))*0.5+0.5,0.0,1.0);
        vec4 mv=modelViewMatrix*vec4(p,1.0);
        gl_Position=projectionMatrix*mv;
        gl_PointSize=(1.25+1.5*(1.0-vShade))*uDpr*(11.0/-mv.z);
      }`,
    fragmentShader: `
      uniform float uDark;
      varying float vShade;
      void main(){
        float d=length(gl_PointCoord-vec2(0.5));
        float edge=1.0-smoothstep(0.30,0.50,d);
        vec3 ink=mix(vec3(0.075,0.082,0.09),vec3(0.90,0.91,0.92),uDark);
        gl_FragColor=vec4(ink,edge*(0.20+0.76*(1.0-vShade)));
      }`,
  });
  const object = new Points(geometry, material);
  scene.add(object);
  return {
    resize(w, h) {
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    },
    render({ clarity, rx, ry, dark }) {
      material.uniforms.uResolve.value = clarity;
      material.uniforms.uDark.value = dark ? 1 : 0;
      object.rotation.set(rx, ry, -0.15);
      renderer.render(scene, camera);
    },
    dispose() {
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    },
  };
}
