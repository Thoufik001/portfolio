import React, { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { ArrowLeft } from "./SkyIcons";
import "./case-index.css";

export default function CaseIndex({ sections }) {
  const [hovered, setHovered] = useState(null);
  const [focused, setFocused] = useState(null);
  const [current, setCurrent] = useState(sections[0]?.[0]);
  useEffect(() => {
    const targets = sections.map(([key]) => document.getElementById(key)).filter(Boolean);
    let frame = 0;
    const update = () => {
      frame = 0;
      const readingLine = Math.min(160, window.innerHeight * 0.2);
      let active = targets[0];
      for (const target of targets) {
        if (target.getBoundingClientRect().top <= readingLine) active = target;
      }
      if (active) setCurrent(active.id);
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    const observer = new ResizeObserver(schedule);
    targets.forEach((target) => observer.observe(target));
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    update();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [sections]);
  const reduced = useReducedMotion();
  const highlighted = hovered ?? focused;
  return (
    <nav className="sky-case-index" aria-label="Case study index">
      <a className="sky-pill sky-case-return" href="/sky/#work" aria-label="Back to home">
        <ArrowLeft size={18} /> Home
      </a>
      <div className="sky-case-index-items" onPointerLeave={() => setHovered(null)}>
        {sections.map(([key, label], index) => (
          <a key={key} href={`#${key}`} className="sky-case-index-link"
            data-highlighted={highlighted === index}
            aria-current={current === key ? "location" : undefined}
            onPointerEnter={(event) => { if (event.pointerType !== "touch") setHovered(index); }}
            onFocus={() => setFocused(index)} onBlur={() => setFocused(null)}>
            <motion.span initial={false}
              animate={{ x: reduced || highlighted === null ? 0 : highlighted === index ? 12 : 0 }}
              transition={{ type: "spring", duration: reduced ? 0 : 0.3, bounce: 0 }}>
              {label}
            </motion.span>
          </a>
        ))}
      </div>
    </nav>
  );
}
