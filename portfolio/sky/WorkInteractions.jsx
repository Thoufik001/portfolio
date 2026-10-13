import { withSkyInk } from "./sky-ink";
import React, { useEffect, useLayoutEffect, useRef, useState, useId } from "react";
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
          <stop offset="0%" stopColor="color-mix(in oklab, #fff, #4285f4 calc(var(--theme-blend) * 100%))" />
          <stop offset="45%" stopColor="color-mix(in oklab, #fff, #7b72e9 calc(var(--theme-blend) * 100%))" />
          <stop offset="75%" stopColor="color-mix(in oklab, #fff, #b56ad5 calc(var(--theme-blend) * 100%))" />
          <stop offset="100%" stopColor="color-mix(in oklab, #fff, #d96570 calc(var(--theme-blend) * 100%))" />
        </linearGradient>
      </defs>
      <path
        fill={`url(#${gradientId})`}
        d="M2 12C7.523 12 12 7.523 12 2C12 7.523 16.477 12 22 12C16.477 12 12 16.477 12 22C12 16.477 7.523 12 2 12Z"
      />
    </svg>
  );
}

// Native letters keep the sentence baseline while resolving from a soft blur.
function PhraseArtwork({ phrase, index, reduced }) {
  const letters = Array.from(phrase);
  const variants = {
    hidden: { opacity: 0, filter: "blur(6px)" },
    visible: (i) => ({ opacity: 1, filter: "blur(0px)", transition: { duration: reduced ? 0 : 0.28, delay: reduced ? 0 : i * 0.018, ease: "easeOut" } }),
    exit: { opacity: 0, filter: reduced ? "none" : "blur(3px)", transition: { duration: reduced ? 0 : 0.12 } },
  };
  return (
    <span className="sky-phrase-artwork" aria-hidden="true">
      {letters.map((letter, i) => {
        const progress = i / Math.max(1, letters.length - 1);
        const from = progress < 0.52 ? "--sky-phrase-from" : "--sky-phrase-middle";
        const to = progress < 0.52 ? "--sky-phrase-middle" : "--sky-phrase-to";
        const mix = progress < 0.52 ? progress / 0.52 : (progress - 0.52) / 0.48;
        return <motion.span key={i} className="sky-phrase-letter" custom={i} variants={variants} style={{ "--sky-letter-ink": `color-mix(in srgb, var(${from}), var(${to}) ${mix * 100}%)` }}>{letter}</motion.span>;
      })}
      <motion.span className="sky-phrase-icon" custom={letters.length} variants={variants}>
        <PositioningIcon index={index} />
      </motion.span>
    </span>
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
            initial={reduced ? false : "hidden"}
            animate="visible"
            exit="exit"
            aria-hidden="true"
          >
            <PhraseArtwork phrase={phrases[index]} index={index} reduced={reduced} />
          </motion.span>
        </AnimatePresence>
      </button>
    </p>,
  );
}
export function StoryNote({ children, kind }) {
  const [open, setOpen] = useState(false),
    [expanded, setExpanded] = useState(false),
    [brand, setBrand] = useState(0),
    [noteLeft, setNoteLeft] = useState(0),
    [labelWidths, setLabelWidths] = useState({ hint: 0, full: 0 });
  const noteRoot = useRef(null);
  const hintMeasure = useRef(null);
  const fullMeasure = useRef(null);
  function reveal() {
    const left = noteRoot.current.getBoundingClientRect().left;
    setNoteLeft(
      Math.max(12 - left, Math.min(0, window.innerWidth - 236 - left)),
    );
    setOpen(true);
  }
  function close() {
    setOpen(false);
    setExpanded(false);
  }
  const reduced = useReducedMotion();
  const revealVisible = open || expanded;
  useLayoutEffect(() => {
    if (kind !== "ai") return;
    const measure = () => setLabelWidths({
      hint: hintMeasure.current?.getBoundingClientRect().width ?? 0,
      full: fullMeasure.current?.getBoundingClientRect().width ?? 0,
    });
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(hintMeasure.current);
    observer.observe(fullMeasure.current);
    return () => observer.disconnect();
  }, [kind]);
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
      onMouseLeave={close}
    >
      <button
        aria-expanded={kind === "ai" ? expanded : open}
        aria-label={
          kind === "ai"
            ? expanded
              ? "Super intelligence — collapse"
              : "AI — reveal super intelligence"
            : "Explore the design system"
        }
        onClick={kind === "ai" ? () => setExpanded((value) => !value) : reveal}
        onFocus={reveal}
        onBlur={close}
        onKeyDown={(event) => {
          if (event.key === "Escape") close();
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
                style={{ fontStyle: revealVisible ? "italic" : "normal" }}
                animate={{ opacity: revealVisible ? 0.55 : 1 }}
                transition={{ duration: reduced ? 0 : 0.15 }}
              >
                AI
                <motion.span
                  className="sky-ai-strike"
                  initial={false}
                  animate={{ scaleX: revealVisible ? 1 : 0 }}
                  transition={{ duration: reduced ? 0 : 0.18, ease: "easeOut" }}
                />
              </motion.em>
              <motion.span
                className="sky-ai-reveal"
                initial={false}
                animate={{
                  opacity: revealVisible ? 1 : 0,
                  width: revealVisible ? labelWidths[expanded ? "full" : "hint"] : 0,
                  marginLeft: revealVisible ? 5 : 0,
                }}
                transition={{
                  duration: reduced || !revealVisible ? 0 : 0.3,
                  ease: [0.2, 0, 0, 1],
                }}
              >
                <span className="sky-ai-reveal-sizer" aria-hidden="true">SI?</span>
                <span className="sky-ai-measure" ref={hintMeasure} aria-hidden="true">SI?</span>
                <span className="sky-ai-measure" ref={fullMeasure} aria-hidden="true">Super Intelligence</span>
                <motion.span
                  className="sky-ai-reveal-text"
                  initial={false}
                  animate={{ opacity: expanded ? 0 : 1, x: expanded ? -8 : 0, filter: reduced || !expanded ? "blur(0px)" : "blur(4px)" }}
                  transition={{ duration: reduced ? 0 : 0.24, ease: [0.2, 0, 0, 1] }}
                >SI?</motion.span>
                <motion.span
                  className="sky-ai-reveal-text"
                  initial={false}
                  animate={{ opacity: expanded ? 1 : 0, x: expanded ? 0 : 8, filter: reduced || expanded ? "blur(0px)" : "blur(4px)" }}
                  transition={{ duration: reduced ? 0 : 0.3, ease: [0.2, 0, 0, 1] }}
                >Super Intelligence</motion.span>
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
export function FlowingWords({ text, leading = "" }) {
  const root = useRef(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const words = [...root.current.querySelectorAll(".sky-flow-word")];
    const tag = root.current.closest("p")?.querySelector(".sky-inline-note button, .sky-clinical-link");
    if (!tag) return;
    let positions = words.map((word) => ({ x: word.offsetLeft, y: word.offsetTop, rect: word.getBoundingClientRect() }));
    const ghosts = new Set();
    let interacted = false;
    const markInteraction = () => { interacted = true; };
    const measure = () => {
      const next = words.map((word) => ({ x: word.offsetLeft, y: word.offsetTop, rect: word.getBoundingClientRect() }));
      const reflowed = words.some((word, index) => Math.abs(next[index].y - positions[index].y) > word.offsetHeight / 2);
      if (!reduced && interacted && reflowed) words.forEach((word, index) => {
        const from = positions[index];
        const to = next[index];
        const changedLine = Math.abs(to.y - from.y) > word.offsetHeight / 2;
        if (!changedLine && Math.abs(to.x - from.x) < 2) return;
        word.getAnimations().forEach((animation) => animation.cancel());
        if (changedLine) {
          const returning = to.y < from.y;
          const direction = returning ? -1 : 1;
          const style = getComputedStyle(word);
          const ghost = document.createElement("span");
          ghost.textContent = word.textContent;
          ghost.setAttribute("aria-hidden", "true");
          Object.assign(ghost.style, {
            position: "fixed", left: `${from.rect.left}px`, top: `${from.rect.top}px`,
            color: style.color, font: style.font, letterSpacing: style.letterSpacing,
            lineHeight: style.lineHeight, whiteSpace: "nowrap", pointerEvents: "none", zIndex: "30",
          });
          document.body.append(ghost);
          ghosts.add(ghost);
          ghost.animate([
            { opacity: 1, transform: "translateX(0)", filter: "blur(0px)" },
            { opacity: 0, transform: `translateX(${direction * 12}px)`, filter: "blur(5px)" },
          ], { duration: 240, easing: "cubic-bezier(0.2, 0, 0, 1)" }).finished.catch(() => {}).finally(() => { ghost.remove(); ghosts.delete(ghost); });
          word.animate([
            { opacity: 0, transform: `translateX(${-direction * 12}px)`, filter: "blur(5px)" },
            { opacity: 1, transform: "translateX(0)", filter: "blur(0px)" },
          ], { duration: 240, easing: "cubic-bezier(0.2, 0, 0, 1)" });
        } else {
          word.animate([
            { transform: `translateX(${from.x - to.x}px)` },
            { transform: "translateX(0)" },
          ], { duration: 280, easing: "cubic-bezier(0.2, 0, 0, 1)" });
        }
      });
      positions = next;
    };
    const observer = new ResizeObserver(measure);
    observer.observe(tag);
    tag.addEventListener("pointerenter", markInteraction);
    tag.addEventListener("focusin", markInteraction);
    const reset = () => {
      positions = words.map((word) => ({ x: word.offsetLeft, y: word.offsetTop, rect: word.getBoundingClientRect() }));
    };
    window.addEventListener("resize", reset);
    return () => {
      observer.disconnect();
      tag.removeEventListener("pointerenter", markInteraction);
      tag.removeEventListener("focusin", markInteraction);
      window.removeEventListener("resize", reset);
      words.forEach((word) => word.getAnimations().forEach((animation) => animation.cancel()));
      ghosts.forEach((ghost) => ghost.remove());
    };
  }, [reduced, text, leading]);

  return <span ref={root} className="sky-flow-words">{text.trim().split(/\s+/).map((word, index) =>
    <React.Fragment key={index}>{index > 0 && " "}<span className="sky-flow-word">{index === 0 ? leading : ""}{word}</span></React.Fragment>,
  )}</span>;
}
export function ProjectMark({ name }) {
  const favicon = {
    Tesseract: "/brands/tesseract-favicon.svg",
    "Tom Riddle’s Diary": "/brands/diary-favicon.png",
    "The Courage Computer": "/brands/courage-favicon.png",
  }[name];
  return (
    <span className="sky-project-mark" aria-hidden="true" data-brand={name} data-favicon={favicon ? "true" : undefined}>
      {favicon ? <img src={favicon} alt="" width="20" height="20" /> : name === "ZyephrOS" ? (
        <img src="/brands/zyephr.png" alt="" width="26" height="26" />
      ) : name === "Airtribe" ? (
        "a"
      ) : name === "Aceteroid" ? (
        "A"
      ) : (
        name === "The Courage Computer" ? "C" : name?.charAt(0) || "N"
      )}
    </span>
  );
}
