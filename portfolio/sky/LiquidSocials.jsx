import React, { useEffect, useId, useState } from "react";
import { motion, useReducedMotion } from "motion/react";

// Blur + alpha threshold joins the surfaces; labels stay outside the filter.
// Technique: https://tympanus.net/codrops/2015/03/10/creative-gooey-effects/
export default function LiquidSocials({ open }) {
  const id = useId();
  const reduced = useReducedMotion();
  const [compact, setCompact] = useState(false);
  useEffect(() => {
    const query = window.matchMedia("(max-width: 560px)");
    const update = () => setCompact(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  return (
    <svg
      className="meadow-liquid"
      aria-hidden="true"
      focusable="false"
      width="372"
      height={compact ? 106 : 48}
    >
      <defs>
        <filter
          id={id}
          x="-20%"
          y="-60%"
          width="140%"
          height="220%"
          colorInterpolationFilters="sRGB"
        >
          <motion.feGaussianBlur
            in="SourceGraphic"
            stdDeviation="6"
            result="blur"
            initial={false}
            animate={{ stdDeviation: open ? [6, 6, 0] : 6 }}
            transition={{
              duration: reduced ? 0 : open ? 0.58 : 0.12,
              times: open ? [0, 0.65, 1] : undefined,
              ease: "easeOut",
            }}
          />
          <feColorMatrix
            in="blur"
            values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7"
            result="joined"
          />
          <feBlend in="SourceGraphic" in2="joined" />
        </filter>
      </defs>
      <g opacity=".2">
        <g filter={reduced ? undefined : `url(#${id})`} fill="white">
          <rect
            className="meadow-liquid-anchor"
            width="198"
            height="48"
            rx="24"
          />
          {[0, 1, 2].map((i) => (
            <motion.circle
              key={i}
              className="meadow-liquid-drop"
              data-index={i}
              initial={false}
              animate={{
                cx: open ? (compact ? 24 + i * 58 : 232 + i * 58) : 154,
                cy: open && compact ? 82 : 24,
                r: open ? 24 : 18,
              }}
              transition={{
                type: "spring",
                duration: reduced ? 0 : 0.42,
                bounce: 0,
                delay: reduced ? 0 : i * 0.04,
              }}
            />
          ))}
        </g>
      </g>
    </svg>
  );
}
