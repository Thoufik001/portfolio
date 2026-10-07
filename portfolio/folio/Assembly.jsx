import React, { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import { ArrowCounterClockwise } from "../components/ui/Icon";
import Logo from "../components/brand/Logo";
export default function Assembly() {
  const canvas = useRef(null),
    api = useRef(null);
  const [ready, setReady] = useState(false),
    [apart, setApart] = useState(false);
  const reduced = useReducedMotion();
  useEffect(() => {
    setReady(false);
    setApart(false);
    if (reduced) return;
    let stopped = false,
      scene;
    const el = canvas.current;
    const lost = (e) => {
      e.preventDefault();
      setReady(false);
      scene?.dispose();
      scene = null;
      api.current = null;
    };
    el.addEventListener("webglcontextlost", lost);
    import("./logo-scene")
      .then(({ createLogoScene }) => {
        if (stopped) return;
        try {
          scene = createLogoScene(canvas.current);
          api.current = scene;
          setReady(true);
        } catch {
          setReady(false);
        }
      })
      .catch(() => setReady(false));
    const toggle = () => {
    api.current?.scatter(!apart);
    setApart(!apart);
  };
  return () => {
      stopped = true;
      el.removeEventListener("webglcontextlost", lost);
      scene?.dispose();
      api.current = null;
    };
  }, [reduced]);
  const toggle = () => {
    api.current?.scatter(!apart);
    setApart(!apart);
  };
  return (
    <div className="assembly">
      <div
        className="logo-stage"
        role="img"
        aria-label="Thoufik’s personal logo formed from teal particles, with an interactive 3D perspective"
      >
        {!ready && <Logo size="100%" className="logo-fallback" />}
        <canvas
          ref={canvas}
          onClick={ready ? toggle : undefined}
          aria-hidden="true"
          style={{ visibility: ready ? "visible" : "hidden" }}
        />
      </div>
      {ready && (
        <button
          className="assembly-control"
          aria-pressed={apart}
          onClick={toggle}
        >
          <ArrowCounterClockwise size={16} />
          {apart ? "Bring it together" : "Take it apart"}
        </button>
      )}
    </div>
  );
}
