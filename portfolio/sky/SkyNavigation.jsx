import { withSkyInk } from "./sky-ink";
import React from "react";
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
    >
      {active >= 0 && (
        <motion.span
          className="sky-community-selection"
          aria-hidden="true"
          initial={false}
          animate={{ x: `${active * 100}%` }}
          transition={{
            type: "spring",
            duration: reduced ? 0 : 0.36,
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
