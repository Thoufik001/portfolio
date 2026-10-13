import { withSkyInk } from "./sky-ink";
import React, { useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import "./community-switcher.css";

// In-place content tabs with a simple frosted-glass surface.
const destinations = [
  ["work", "Work"],
  ["play", "Playground"],
  ["about", "About"],
];

export default function SkyNavigation({ view, project, navigate }) {
  const reduced = useReducedMotion();
  const gesture = useRef(null);
  const suppressClick = useRef(false);
  const [dragIndex, setDragIndex] = useState(null);
  const active = project
    ? -1
    : destinations.findIndex(([item]) => item === view);
  const choose = (item) => navigate(item);
  return withSkyInk(
    <nav
      className="sky-community-nav"
      data-selected={active >= 0}
      style={{ "--switcher-index": Math.max(0, active) }}
      aria-label="Main navigation"
      role={project ? undefined : "tablist"}
      onPointerDown={event => {
        if (project || event.button !== 0) return;
        gesture.current = { x: event.clientX, y: event.clientY, moved: false, start: Math.max(0, active) };
      }}
      onPointerMove={event => {
        const drag = gesture.current;
        if (!drag) return;
        if (!drag.moved && Math.abs(event.clientY - drag.y) > Math.abs(event.clientX - drag.x) + 6) { gesture.current = null; return; }
        if (!drag.moved && Math.abs(event.clientX - drag.x) < 6) return;
        drag.moved = true;
        event.currentTarget.setPointerCapture(event.pointerId);
        const width = (event.currentTarget.getBoundingClientRect().width - 8) / 3;
        setDragIndex(Math.max(0, Math.min(2, drag.start + (event.clientX - drag.x) / width)));
      }}
      onPointerUp={event => {
        if (gesture.current?.moved) {
          const width = (event.currentTarget.getBoundingClientRect().width - 8) / 3;
          const next = Math.round(Math.max(0, Math.min(2, gesture.current.start + (event.clientX - gesture.current.x) / width)));
          choose(destinations[next][0]);
          event.currentTarget.querySelectorAll('[role="tab"]')[next]?.focus({ preventScroll: true });
          suppressClick.current = true;
          setTimeout(() => { suppressClick.current = false; }, 0);
        }
        gesture.current = null;
        setDragIndex(null);
      }}
      onPointerCancel={() => { gesture.current = null; setDragIndex(null); }}
      onClickCapture={event => {
        if (suppressClick.current) { event.preventDefault(); event.stopPropagation(); }
      }}
    >
      {active >= 0 && (
        <motion.span
          className="sky-community-selection"
          aria-hidden="true"
          initial={false}
          animate={{ x: `${(dragIndex ?? active) * 100}%` }}
          transition={{
            type: "spring",
            duration: reduced || dragIndex !== null ? 0 : 0.36,
            bounce: 0,
          }}
        />
      )}
      {destinations.map(([item, label], index) =>
        project ? (
          <a key={item} className="sky-community-option" href={`/sky/#${item}`}>
            <span>{label}</span>
          </a>
        ) : (
          <button
            key={item}
            type="button"
            className="sky-community-option"
            id={`sky-tab-${item}`}
            role="tab"
            aria-controls="sky-tab-panel"
            aria-selected={active === index}
            tabIndex={active === index ? 0 : -1}
            aria-current={active === index ? "page" : undefined}
            onClick={() => choose(item)}
            onKeyDown={(event) => {
              const offset =
                event.key === "ArrowRight"
                  ? 1
                  : event.key === "ArrowLeft"
                    ? -1
                    : 0;
              if (!offset && event.key !== "Home" && event.key !== "End")
                return;
              event.preventDefault();
              const next =
                event.key === "Home"
                  ? 0
                  : event.key === "End"
                    ? destinations.length - 1
                    : (index + offset + destinations.length) %
                      destinations.length;
              choose(destinations[next][0]);
              event.currentTarget.parentElement
                .querySelectorAll('[role="tab"]')
                [next].focus({ preventScroll: true });
            }}
          >
            <span>{label}</span>
          </button>
        ),
      )}
    </nav>,
  );
}
