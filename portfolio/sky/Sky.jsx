import React, { useEffect, useRef } from "react";
export default function Sky({ settings, paused, reduced, onLightning }) {
  const canvas = useRef(null),
    api = useRef(null),
    latest = useRef({ settings, paused, reduced, onLightning });
  latest.current = { settings, paused, reduced, onLightning };
  useEffect(() => {
    let stopped = false,
      scene;
    const element = canvas.current;
    const lost = () => {
      scene?.dispose();
      scene = null;
      api.current = null;
      element.style.visibility = "hidden";
    };
    element.addEventListener("webglcontextlost", lost);
    // LIQUID GLASS recovery: preserve CSS fallback on loss and rebuild on restoration.
    const initialize = () => import("./sky-scene").then(({ createSky }) => {
      if (stopped) return;
      try {
        scene = createSky(
          element,
          latest.current.settings,
          latest.current.paused,
          latest.current.reduced,
          () => latest.current.onLightning?.(),
        );
        api.current = scene;
        element.style.visibility = "";
      } catch {
        element.style.visibility = "hidden";
      }
    }).catch(() => {
      if (!stopped) element.style.visibility = "hidden";
    });
    const restored = () => initialize();
    const allowRestore = event => event.preventDefault();
    element.addEventListener("webglcontextlost", allowRestore);
    element.addEventListener("webglcontextrestored", restored);
    initialize();
    return () => {
      stopped = true;
      element.removeEventListener("webglcontextlost", lost);
      element.removeEventListener("webglcontextlost", allowRestore);
      element.removeEventListener("webglcontextrestored", restored);
      scene?.dispose();
      api.current = null;
    };
  }, []);
  useEffect(() => {
    api.current?.update(settings);
  }, [settings]);
  useEffect(() => {
    api.current?.pause(paused, reduced);
  }, [paused, reduced]);
  return (
    <div
      className="living-sky"
      style={{
        "--sky-fallback-top": settings.top,
        "--sky-fallback-bottom": settings.bottom,
      }}
      aria-hidden="true"
    >
      <canvas ref={canvas} />
    </div>
  );
}
