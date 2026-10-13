export const glassVertex = `varying vec2 vUv; void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}`;
export const glassFragment = `
precision highp float;
varying vec2 vUv;
uniform sampler2D skyTexture;
uniform vec2 viewport;
uniform vec4 shapeRect, tint, rim;
uniform float radius, bezel, press, ior, debugMode;
float sdf(vec2 p){vec2 q=abs(p-shapeRect.xy)-shapeRect.zw*.5+radius;return length(max(q,0.))+min(max(q.x,q.y),0.)-radius;}
vec3 linearize(vec3 c){return mix(c/12.92,pow((c+.055)/1.055,vec3(2.4)),step(vec3(.04045),c));}
vec3 encode(vec3 c){return mix(c*12.92,1.055*pow(max(c,0.),vec3(1./2.4))-.055,step(vec3(.0031308),c));}
vec2 bend(vec3 n,float index){return refract(vec3(0.,0.,-1.),n,1./index).xy*(32.+press*7.);}
void main(){
 vec2 p=vUv*viewport;float d=sdf(p);if(d>.8)discard;
 float t=clamp(-d/bezel,0.,1.);
 // Convex quartic-root profile. Its derivative reaches zero at the flat interior.
 // A 3px cap height spreads the curvature across the bezel instead of
 // concentrating almost all visible bending in its outermost pixel.
 float slope=pow(1.-t,3.)/pow(max(1.-pow(1.-t,4.),.004),.75)*12./bezel;
 vec2 gradient=vec2(sdf(p+vec2(.5,0.))-sdf(p-vec2(.5,0.)),sdf(p+vec2(0.,.5))-sdf(p-vec2(0.,.5)));
 vec3 normal=normalize(vec3(normalize(gradient+vec2(.00001))*slope,1.));
 vec2 offset=bend(normal,ior);vec2 uv=vUv+offset/viewport;
 vec3 sampleColor;
 sampleColor.r=texture2D(skyTexture,clamp(vUv+bend(normal,ior-.008)/viewport,0.,1.)).r;
 sampleColor.g=texture2D(skyTexture,clamp(uv,0.,1.)).g;
 sampleColor.b=texture2D(skyTexture,clamp(vUv+bend(normal,ior+.008)/viewport,0.,1.)).b;
 vec3 color=linearize(sampleColor);
 color=mix(color,linearize(tint.rgb),tint.a);
 float edge=1.-smoothstep(0.,bezel,-d);
 float fresnel=pow(1.-normal.z,3.);
 float highlight=pow(max(dot(normal,normalize(vec3(-.55,.65,.7))),0.),20.);
 float counter=pow(max(dot(normal,normalize(vec3(.5,-.6,.7))),0.),24.);
 color+=linearize(rim.rgb)*rim.a*(highlight*.28+counter*.09+fresnel*.13)*edge*(1.+press*.2);
 if(debugMode>.5){color=debugMode<1.5?normal*.5+.5:vec3(.5+offset.x/36.,.5+offset.y/36.,0.);gl_FragColor=vec4(color,1.);}
 else gl_FragColor=vec4(encode(color),1.-smoothstep(-.7,.7,d));
}`;
