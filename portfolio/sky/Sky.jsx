import React, { useEffect, useRef } from "react";
export default function Sky({ settings, paused, reduced }) {
  const canvas = useRef(null),
    api = useRef(null),
    latest = useRef({ settings, paused, reduced });
  latest.current = { settings, paused, reduced };
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
    import("./sky-scene").then(({ createSky }) => {
      if (stopped) return;
      try {
        scene = createSky(
          element,
          latest.current.settings,
          latest.current.paused,
          latest.current.reduced,
        );
        api.current = scene;
      } catch {
        element.style.visibility = "hidden";
      }
    }).catch(() => {
      if (!stopped) element.style.visibility = "hidden";
    });
    return () => {
      stopped = true;
      element.removeEventListener("webglcontextlost", lost);
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
