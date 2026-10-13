import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { PaperPlane } from "./PaperPlane";

export default function NoteFlight({ start, plane, onComplete }) {
  const stage = useRef(null);
  const aircraft = useRef(null);
  const complete = useRef(onComplete);
  complete.current = onComplete;

  useEffect(() => {
    if (!start) return;
    const height = window.innerHeight;
    stage.current.style.top = `${window.scrollY}px`;
    stage.current.style.height = `${height}px`;
    const drift = (Math.random() - 0.5) * Math.min(180, window.innerWidth * 0.2);
    const rise = start.y + 180;
    const began = performance.now();
    const duration = 1750;
    let frame;
    const draw = (now) => {
      const t = Math.min(1, (now - began) / duration);
      const eased = 1 - (1 - t) ** 3;
      const x = start.x + drift * eased;
      const y = start.y - rise * eased;
      const scale = 1 - 0.38 * eased;
      aircraft.current.style.transform = `translate(${x}px,${y}px) translate(-50%,-50%) rotate(${-18 + 12 * eased}deg) scale(${scale})`;
      aircraft.current.style.opacity = String(Math.min(1, (1 - t) * 3));
      if (t < 1) frame = requestAnimationFrame(draw);
      else complete.current?.();
    };
    frame = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frame);
  }, [start]);

  return createPortal(
    <div ref={stage} className="sky-note-flight" aria-hidden="true">
      <div ref={aircraft} className="sky-note-aircraft"><PaperPlane texture={plane?.src} /></div>
    </div>,
    document.body,
  );
}
