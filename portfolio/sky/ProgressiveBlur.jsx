import React, { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";
import "./progressive-blur.css";

// Stacked masked backdrop filters, inspired by SmoothUI's progressive blur.
// Keep opacity on each filter layer: an opacity ancestor creates a backdrop root.
export default function ProgressiveBlur() {
  const overlay = useRef(null);
  const reduced = useReducedMotion();
  useEffect(() => {
    if (reduced) return;
    const footer = document.getElementById("footer");
    if (!footer) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const distance = footer.getBoundingClientRect().top - window.innerHeight;
      const fade = Math.max(0, Math.min(1, distance / 180));
      overlay.current?.style.setProperty("--edge-blur-opacity", String(fade));
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    const observer = new ResizeObserver(schedule);
    observer.observe(footer);
    observer.observe(document.body);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [reduced]);
  if (reduced) return null;
  return (
    <div ref={overlay} className="sky-progressive-blur" aria-hidden="true">
      {[0.5, 1, 2, 4, 8].map((blur, index) => (
        <span
          key={blur}
          style={{
            "--edge-blur-radius": `${blur}px`,
            "--edge-blur-start": `${index * 16}%`,
            "--edge-blur-end": `${32 + index * 16}%`,
          }}
        />
      ))}
    </div>
  );
}
