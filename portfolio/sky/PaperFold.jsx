import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { PaperPlane } from "./PaperPlane";

// Keep each half of the captured note intact while it folds around a shared
// central hinge. The final silhouette uses the same plane as the flight.
export default function PaperFold({ snapshot, onComplete }) {
  const host = useRef(null);
  const plane = useRef(null);
  const complete = useRef(onComplete);
  complete.current = onComplete;
  useEffect(() => {
    const { width, height, src } = snapshot;
    let renderer, frame = 0, disposed = false, texture;
    try { renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true }); }
    catch { complete.current?.(null); return; }
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    host.current.appendChild(renderer.domElement);
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-width / 2, width / 2, height / 2, -height / 2, 1, 2000);
    camera.position.z = 1000;
    const sheet = new THREE.Group();
    scene.add(sheet);
    const hinge = new THREE.Group();
    sheet.add(hinge);
    const geometry = new THREE.PlaneGeometry(width / 2, height);
    const materials = [];
    new THREE.TextureLoader().load(src, map => {
      texture = map;
      if (disposed) { map.dispose(); return; }
      map.colorSpace = THREE.SRGBColorSpace;
      const leftMap = map.clone(), rightMap = map.clone();
      [leftMap, rightMap].forEach((part, index) => {
        part.colorSpace = THREE.SRGBColorSpace;
        part.repeat.set(.5, 1);
        part.offset.x = index * .5;
        part.needsUpdate = true;
      });
      materials.push(leftMap, rightMap);
      const left = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ map: leftMap, side: THREE.DoubleSide, transparent: true }));
      const right = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ map: rightMap, side: THREE.DoubleSide, transparent: true }));
      left.position.x = -width / 4;
      right.position.x = width / 4;
      hinge.add(left);
      sheet.add(right);
      const started = performance.now();
      const ease = t => t * t * (3 - 2 * t);
      const draw = now => {
        if (disposed) return;
        const t = Math.min(1, (now - started) / 1280);
        const centerFold = ease(Math.min(1, t / .43));
        hinge.rotation.y = -Math.PI * centerFold;
        const gather = ease(Math.max(0, Math.min(1, (t - .38) / .44)));
        sheet.rotation.x = Math.PI * .42 * gather;
        sheet.rotation.z = -.38 * gather;
        sheet.scale.setScalar(1 - .57 * gather);
        sheet.position.x = -width * .12 * gather;
        const reveal = ease(Math.max(0, Math.min(1, (t - .58) / .34)));
        left.material.opacity = 1 - reveal;
        right.material.opacity = 1 - reveal;
        if (plane.current) {
          plane.current.style.opacity = String(reveal);
          plane.current.style.transform = `translate(-50%, -50%) scale(${.7 + .3 * reveal})`;
        }
        renderer.render(scene, camera);
        if (t < 1) frame = requestAnimationFrame(draw);
        else complete.current?.(snapshot);
      };
      frame = requestAnimationFrame(draw);
      // Texture clones are disposed with the component below.
    }, undefined, () => { if (!disposed) complete.current?.(null); });
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      sheet.traverse(object => object.material?.dispose());
      materials.forEach(material => material.dispose());
      texture?.dispose();
      geometry.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [snapshot]);
  return <div className="sky-paper-fold-scene" aria-hidden="true">
    <div ref={host} className="sky-paper-fold-render" />
    <div ref={plane} className="sky-paper-fold-plane"><PaperPlane texture={snapshot.src} /></div>
  </div>;
}
