import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  ArrowCounterClockwise,
  ArrowRight,
  Check,
  Command,
  Cursor,
  Stack,
} from "../ui/Icon";
import "./interactions.css";

const palettes = [
  ["#1e4d48", "#779e86", "#d9d7bf", "#f1eade", "#dc9b79"],
  ["#36365a", "#838cb7", "#bbc9da", "#f3e5d5", "#c27e73"],
  ["#22485b", "#76a5b3", "#d4e1d8", "#f0d4a4", "#b76d51"],
  ["#554b41", "#ad9478", "#d9c8ad", "#efeee7", "#879d92"],
];
export function PaletteStudy() {
  const [round, setRound] = useState(0);
  const [colors, setColors] = useState(palettes[0]);
  const [pinned, setPinned] = useState([]);
  return (
    <div className="interaction-study palette-study">
      <span className="study-eyebrow">A little color therapy</span>
      <div
        className="swatch-fan"
        role="group"
        aria-label="Palette colors, press to pin"
      >
        {colors.map((color, i) => (
          <button
            key={i}
            className="swatch"
            style={{
              "--swatch": color,
              "--angle": `${(i - 2) * 12}deg`,
              "--offset": `${(i - 2) * 42}px`,
            }}
            aria-label={`${color}, ${pinned.includes(i) ? "unpin" : "pin"} color`}
            aria-pressed={pinned.includes(i)}
            onClick={() =>
              setPinned(
                pinned.includes(i)
                  ? pinned.filter((x) => x !== i)
                  : [...pinned, i],
              )
            }
          >
            <span className="swatch-pin">
              {pinned.includes(i) ? <Check size={16} /> : null}
            </span>
            <span className="swatch-code">{color.slice(1).toUpperCase()}</span>
          </button>
        ))}
      </div>
      <button
        className="study-action"
        onClick={() => {
          const next = (round + 1) % palettes.length;
          setRound(next);
          setColors(
            colors.map((color, i) =>
              pinned.includes(i) ? color : palettes[next][i],
            ),
          );
        }}
      >
        <ArrowCounterClockwise size={16} /> Shuffle palette
      </button>
      <span className="study-hint">Tap a swatch to keep it.</span>
    </div>
  );
}

export function RevealStudy() {
  const [amount, setAmount] = useState(52);
  return (
    <div className="interaction-study reveal-study">
      <div className="reveal-window" style={{ "--reveal": `${amount}%` }}>
        <img
          src="/project-worlds/zyephr-surreal.jpg"
          alt="Surreal floating gardens, gradually revealed in color"
          loading="lazy"
        />
        <div className="reveal-monochrome" aria-hidden="true">
          <img src="/project-worlds/zyephr-surreal.jpg" alt="" loading="lazy" />
        </div>
        <span className="reveal-tag mono-tag">Quiet</span>
        <span className="reveal-tag color-tag">Vivid</span>
        <span className="reveal-line" aria-hidden="true">
          <span>
            <ArrowRight size={16} />
          </span>
        </span>
        <input
          className="reveal-input"
          type="range"
          min="0"
          max="100"
          value={amount}
          aria-label="Reveal image color"
          aria-valuetext={`${amount}% color revealed`}
          onChange={(e) => setAmount(Number(e.target.value))}
        />
      </div>
      <span className="study-hint">Slide between two moods.</span>
    </div>
  );
}

const tasks = [
  "Find the interesting problem",
  "Make the small things work",
  "Leave room for a little surprise",
];
export function TaskStudy() {
  const [done, setDone] = useState([]);
  const reduced = useReducedMotion();
  const taskRefs = useRef({});
  const resetRef = useRef(null);
  const restoreFocus = useRef(false);
  useEffect(() => {
    if (!restoreFocus.current) return;
    restoreFocus.current = false;
    const next = tasks.find((task) => !done.includes(task));
    (next ? taskRefs.current[next] : resetRef.current)?.focus({
      preventScroll: true,
    });
  }, [done]);
  return (
    <div className="interaction-study task-study">
      <span className="study-eyebrow">Less, but better.</span>
      <div className="task-stack">
        <AnimatePresence initial={false}>
          {tasks
            .filter((t) => !done.includes(t))
            .map((task, i) => (
              <motion.button
                key={task}
                ref={el => { taskRefs.current[task] = el; }}
                className="task-slip"
                style={{ zIndex: 3 - i }}
                initial={false}
                animate={{
                  y: i * 14,
                  rotate: reduced ? 0 : (i - 1) * 3,
                  opacity: 1,
                }}
                exit={{
                  y: reduced ? 0 : -24,
                  opacity: 0,
                  scale: reduced ? 1 : 0.96,
                }}
                transition={{ duration: reduced ? 0 : 0.3, ease: "easeOut" }}
                onClick={() => {
                  restoreFocus.current = true;
                  setDone([...done, task]);
                }}
                aria-label={`Complete: ${task}`}
              >
                <span className="task-circle">
                  <Check size={14} />
                </span>
                <span>{task}</span>
              </motion.button>
            ))}
        </AnimatePresence>
        {done.length === tasks.length && (
          <div className="tasks-finished">
            <span className="finished-check">
              <Check size={24} />
            </span>
            <p>Room to breathe.</p>
          </div>
        )}
      </div>
      <span className="study-hint" role="status">
        {done.length} of 3 cleared
      </span>
      <button
        className="study-action"
        ref={resetRef}
        onClick={() => {
          restoreFocus.current = true;
          setDone([]);
        }}
        disabled={!done.length}
      >
        <ArrowCounterClockwise size={16} /> Start again
      </button>
    </div>
  );
}

const tools = [
  { name: "Move", icon: Cursor },
  { name: "Layers", icon: Stack },
  { name: "Code", icon: Command },
];
export function ToolbarStudy() {
  const [tool, setTool] = useState("Move");
  const reduced = useReducedMotion();
  return (
    <div className="interaction-study toolbar-study">
      <div
        className={`tool-canvas tool-${tool.toLowerCase()}`}
        aria-hidden="true"
      >
        {tool === "Code" ? (
          <div className="code-sample">
            <span>const idea =</span>
            <strong>makeSomethingGood();</strong>
            <span>return curiosity;</span>
          </div>
        ) : (
          <div className="canvas-object">
            <div />
            <div />
            <div />
            <span>something good</span>
          </div>
        )}
      </div>
      <div className="pocket-toolbar" role="group" aria-label="Canvas tools">
        {tools.map(({ name, icon: Icon }) => (
          <button
            key={name}
            aria-pressed={tool === name}
            onClick={() => setTool(name)}
          >
            {tool === name && (
              <motion.span
                className="tool-highlight"
                layoutId="pocket-tool"
                transition={{
                  type: "spring",
                  duration: reduced ? 0 : 0.3,
                  bounce: 0,
                }}
              />
            )}
            <Icon size={18} />
            <span>{name}</span>
          </button>
        ))}
      </div>
      <span className="study-hint">Same idea. A different lens.</span>
    </div>
  );
}
