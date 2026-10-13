import React, { useEffect, useRef } from "react";
import "./progressive-blur.css";

// Keep fade opacity on each filter: an opacity ancestor creates a backdrop root.
export default function ProgressiveBlur() {
  const overlay = useRef(null);
  useEffect(() => {
    const footer = document.getElementById("footer");
    if (!footer) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const viewport = window.visualViewport;
      const viewportBottom = viewport ? viewport.height + viewport.offsetTop : window.innerHeight;
      const distance = footer.getBoundingClientRect().top - viewportBottom;
      const progress = Math.max(0, Math.min(1, distance / 240));
      const fade = progress * progress * (3 - 2 * progress);
      overlay.current?.style.setProperty("--edge-blur-opacity", String(fade));
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    window.visualViewport?.addEventListener("resize", schedule);
    window.visualViewport?.addEventListener("scroll", schedule);
    const observer = new ResizeObserver(schedule);
    observer.observe(footer);
    observer.observe(document.body);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      window.visualViewport?.removeEventListener("resize", schedule);
      window.visualViewport?.removeEventListener("scroll", schedule);
    };
  }, []);
  return (
    <div ref={overlay} className="sky-progressive-blur" aria-hidden="true">
      {[0.5, 1, 2, 4, 8, 12].map((blur, index) => (
        <span
          key={blur}
          style={{
            "--edge-blur-radius": `${blur}px`,
            "--edge-blur-start": index * .1,
            "--edge-blur-end": .45 + index * .09,
          }}
        />
      ))}
    </div>
  );
}
