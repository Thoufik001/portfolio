import { withSkyInk } from "./sky-ink";
import React, { useEffect, useRef, useState, useId } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Layers as Stack, PositioningIcon } from "./SkyIcons";

import { HugeiconsIcon } from "@hugeicons/react";
import { ChatGptIcon, ClaudeIcon } from "@hugeicons/core-free-icons";

const aiTools = [
  { name: "claude", icon: ClaudeIcon },
  { name: "chatgpt", icon: ChatGptIcon },
  { name: "gemini" },
];

function GeminiMark() {
  const gradientId = useId();
  return (
    <svg width="20" height="20" viewBox="1 1 22 22" aria-hidden="true">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" stopColor="#4285f4" />
          <stop offset="45%" stopColor="#7b72e9" />
          <stop offset="75%" stopColor="#b56ad5" />
          <stop offset="100%" stopColor="#d96570" />
        </linearGradient>
      </defs>
      <path
        fill={`url(#${gradientId})`}
        d="M2 12C7.523 12 12 7.523 12 2C12 7.523 16.477 12 22 12C16.477 12 12 16.477 12 22C12 16.477 7.523 12 2 12Z"
      />
    </svg>
  );
}

// Text and icon form one mask over one gradient, so the color never restarts.
function PhraseArtwork({ phrase, index }) {
  const id = useId();
  const text = useRef(null);
  const [textWidth, setTextWidth] = useState(phrase.length * 10);
  const iconSize = 20;
  const width = textWidth + 7 + iconSize;
  useEffect(() => {
    let alive = true;
    const measure = () => {
      if (!alive || !text.current) return;
      let length = text.current.getComputedTextLength();
      if (!length) {
        const font = getComputedStyle(text.current);
        const context = document.createElement("canvas").getContext("2d");
        if (context) {
          context.font = `${font.fontWeight} ${font.fontSize} ${font.fontFamily}`;
          length = context.measureText(phrase).width;
        }
      }
      if (length) setTextWidth(Math.ceil(length));
    };
    measure();
    document.fonts.ready.then(measure);
    window.addEventListener("resize", measure);
    return () => {
      alive = false;
      window.removeEventListener("resize", measure);
    };
  }, [phrase]);
  return (
    <svg
      className="sky-phrase-artwork"
      width={width}
      height="1.6em"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={`${id}-paint`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="var(--sky-phrase-from)" />
          <stop offset=".52" stopColor="var(--sky-phrase-middle)" />
          <stop offset="1" stopColor="var(--sky-phrase-to)" />
        </linearGradient>
        <mask
          id={`${id}-shape`}
          maskUnits="userSpaceOnUse"
          x="0"
          y="0"
          width={width}
          height="1.6em"
        >
          <text ref={text} x="0" y="1.2em" fill="white">
            {phrase}
          </text>
          <g
            transform={`translate(${textWidth + 7}, ${(32 - iconSize) / 2})`}
            style={{ color: "white" }}
          >
            <PositioningIcon index={index} />
          </g>
        </mask>
      </defs>
      <rect
        width={width}
        height="1.6em"
        fill={`url(#${id}-paint)`}
        mask={`url(#${id}-shape)`}
      />
    </svg>
  );
}

const phrases = ["builds in code", "thinks in systems", "crafts with taste"];
export function Positioning() {
  const [index, setIndex] = useState(0),
    [paused, setPaused] = useState(false);
  const reduced = useReducedMotion();
  useEffect(() => {
    if (reduced || paused) return;
    const timer = setInterval(
      () => setIndex((i) => (i + 1) % phrases.length),
      4500,
    );
    return () => clearInterval(timer);
  }, [paused, reduced]);
  return withSkyInk(
    <p className="sky-positioning">
      A product designer who{" "}
      <button
        className="sky-changing-phrase"
        data-phrase={index}
        aria-label={`${phrases[index]} Show next phrase`}
        onClick={() => setIndex((i) => (i + 1) % phrases.length)}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocus={() => setPaused(true)}
        onBlur={() => setPaused(false)}
      >
        <AnimatePresence initial={false}>
          <motion.span
            key={index}
            initial={{
              opacity: 0,
              y: reduced ? 0 : 2,
              filter: reduced ? "none" : "blur(3px)",
            }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{
              opacity: 0,
              y: reduced ? 0 : -2,
              filter: reduced ? "none" : "blur(3px)",
            }}
            transition={{ duration: reduced ? 0 : 0.22, ease: "easeOut" }}
            aria-hidden="true"
          >
            <PhraseArtwork phrase={phrases[index]} index={index} />
          </motion.span>
        </AnimatePresence>
      </button>
    </p>,
  );
}
export function StoryNote({ children, kind }) {
  const [open, setOpen] = useState(false),
    [brand, setBrand] = useState(0),
    [noteLeft, setNoteLeft] = useState(0);
  const noteRoot = useRef(null);
  function reveal() {
    const left = noteRoot.current.getBoundingClientRect().left;
    setNoteLeft(
      Math.max(12 - left, Math.min(0, window.innerWidth - 236 - left)),
    );
    setOpen(true);
  }
  const reduced = useReducedMotion();
  useEffect(() => {
    if (kind !== "ai" || reduced) return;
    const timer = setInterval(
      () => setBrand((value) => (value + 1) % aiTools.length),
      1500,
    );
    return () => clearInterval(timer);
  }, [kind, reduced]);
  return withSkyInk(
    <span
      ref={noteRoot}
      className="sky-inline-note"
      onMouseEnter={reveal}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        aria-expanded={open}
        aria-label={
          kind === "ai"
            ? open
              ? "AI, SI?"
              : "AI — reveal SI?"
            : "Explore the design system"
        }
        onClick={reveal}
        onFocus={reveal}
        onBlur={() => setOpen(false)}
        onKeyDown={(event) => {
          if (event.key === "Escape") setOpen(false);
        }}
      >
        {kind === "ai" ? (
          <span
            className="sky-ai-brand"
            data-tool={aiTools[brand].name}
            aria-hidden="true"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={brand}
                initial={{ opacity: 0, filter: reduced ? "none" : "blur(4px)" }}
                animate={{ opacity: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0 }}
                transition={{ duration: reduced ? 0 : 0.2 }}
              >
                {aiTools[brand].name === "gemini" ? (
                  <GeminiMark />
                ) : (
                  <HugeiconsIcon
                    icon={aiTools[brand].icon}
                    size={16}
                    strokeWidth={1.5}
                  />
                )}
              </motion.span>
            </AnimatePresence>
          </span>
        ) : (
          <Stack size={16} />
        )}
        {kind === "ai" ? (
          <span className="sky-ai-label">
            <span className="sky-ai-shorthand" aria-hidden="true">
              <motion.em
                style={{ fontStyle: open ? "italic" : "normal" }}
                animate={{ opacity: open ? 0.55 : 1 }}
                transition={{ duration: reduced ? 0 : 0.15 }}
              >
                AI
                <motion.span
                  className="sky-ai-strike"
                  initial={false}
                  animate={{ scaleX: open ? 1 : 0 }}
                  transition={{ duration: reduced ? 0 : 0.18, ease: "easeOut" }}
                />
              </motion.em>
              <motion.span
                className="sky-ai-reveal"
                initial={false}
                animate={{
                  opacity: open ? 1 : 0,
                  width: open ? "auto" : 0,
                  marginLeft: open ? 5 : 0,
                  filter: reduced || open ? "blur(0px)" : "blur(4px)",
                }}
                transition={{
                  duration: reduced ? 0 : 0.24,
                  delay: open && !reduced ? 0.08 : 0,
                  ease: "easeOut",
                }}
              >
                SI?
              </motion.span>
            </span>
          </span>
        ) : (
          children
        )}
      </button>
      <AnimatePresence initial={false}>
        {open && kind !== "ai" && (
          <motion.span
            className="sky-note-preview"
            role="note"
            style={{ left: noteLeft }}
            initial={{ opacity: 0, y: reduced ? 0 : 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: reduced ? 0 : 2 }}
            transition={{ duration: reduced ? 0 : 0.15 }}
          >
            <>
              <span className="sky-system-sample" aria-hidden="true">
                <i />
                <i />
                <i />
                <i />
              </span>
              <strong>Connected decisions.</strong>
              <small>Type, space, color, interaction.</small>
            </>
          </motion.span>
        )}
      </AnimatePresence>
    </span>,
  );
}
export function ProjectMark({ name }) {
  return (
    <span className="sky-project-mark" aria-hidden="true" data-brand={name}>
      {name === "ZyephrOS" ? (
        <img src="/brands/zyephr.png" alt="" width="26" height="26" />
      ) : name === "Airtribe" ? (
        "a"
      ) : name === "Aceteroid" ? (
        "A"
      ) : (
        "N"
      )}
    </span>
  );
}
