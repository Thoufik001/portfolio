import SkyButton from "../SkyButton";
import React, { useEffect, useId, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { ArrowLeft, ArrowRight } from "../SkyIcons";

export const asset = (name) => `/stories/${name}.jpg`;

export function StoryVideo({ id, name }) {
  const video = useRef(null);
  const [started, setStarted] = useState(false);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    const el = video.current;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) el?.pause();
    }, { threshold: .05 });
    if (el) observer.observe(el);
    const pause = () => { if (document.hidden) el?.pause(); };
    document.addEventListener("visibilitychange", pause);
    return () => { observer.disconnect(); document.removeEventListener("visibilitychange", pause); };
  }, []);
  const play = () => {
    setStarted(true);
    const el = video.current;
    if (!el.getAttribute("src")) { el.src = `/stories/${id}.mp4?v=original-audio`; el.load(); }
    el.play().catch(() => { setFailed(true); });
  };
  return <figure className="story-film">
    <div className="story-film-frame">
      <video ref={video} poster={asset(`${id}-poster`)} controls={started} playsInline preload="none" aria-label={`${name} interaction recording`} onError={() => setFailed(true)} />
      {!started && <SkyButton className="story-film-play" onClick={play}><svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="m8 5 11 7-11 7Z" fill="currentColor" /></svg> Watch the experience</SkyButton>}
    </div>
    <figcaption>{failed ? <a href={`/stories/${id}.mp4?v=original-audio`}>Open the recording</a> : "Original interaction recording · play to explore"}<span>{id === 'tesseract' ? 'Silent source recording' : 'Original sound'}</span></figcaption>
  </figure>;
}

export function EvidenceSequence({ items, label }) {
  const [active, setActive] = useState(0);
  const id = useId();
  const reduced = useReducedMotion();
  const item = items[active];
  return <div className="story-sequence">
    <div className="story-sequence-image">
      {items.map((it, i) => <motion.img key={it.image} src={asset(it.image)} alt={i === active ? `${it.label}: ${it.title}` : ""} aria-hidden={i !== active} loading="lazy" initial={false} animate={{ opacity: i === active ? 1 : 0, scale: i === active ? 1 : 1.025 }} transition={{ duration: reduced ? 0 : .38, ease: [.22,1,.36,1] }} />)}
    </div>
    <div className="story-sequence-controls" role="group" aria-label={label}>
      {items.map((it, i) => <SkyButton key={it.image} aria-pressed={i === active} aria-controls={id} onClick={() => setActive(i)}><span>{i + 1}</span>{it.label}</SkyButton>)}
    </div>
    <div className="story-sequence-caption" id={id} aria-live="polite">
      <div><h3>{item.title}</h3><p>{item.body}</p></div>
      <div className="story-step-arrows"><SkyButton aria-label="Previous version" disabled={active === 0} onClick={() => setActive(active - 1)}><ArrowLeft size={18} /></SkyButton><SkyButton aria-label="Next version" disabled={active === items.length - 1} onClick={() => setActive(active + 1)}><ArrowRight size={18} /></SkyButton></div>
    </div>
  </div>;
}

export function InkStudy() {
  const [auto, setAuto] = useState(true);
  const [phase, setPhase] = useState("ready");
  const [run, setRun] = useState(0);
  const reduced = useReducedMotion();
  useEffect(() => {
    if (!run) return;
    setPhase("writing");
    const timers = [setTimeout(() => setPhase("reply"), reduced ? 0 : 2100)];
    if (auto) timers.push(setTimeout(() => setPhase("gone"), reduced ? 2800 : 5700));
    return () => timers.forEach(clearTimeout);
  }, [run, auto, reduced]);
  return <div className="story-ink-study">
    <div className="story-ink-controls"><span>Reading pace</span><SkyButton role="switch" aria-checked={auto} onClick={() => { setAuto(!auto); setRun(0); setPhase("ready"); }}>Auto fade <strong>{auto ? "on" : "off"}</strong><span className="story-switch" aria-hidden="true"><i /></span></SkyButton></div>
    <div className="story-paper" data-phase={phase}>
      <span className="story-paper-folio" aria-hidden="true">A moment on the page</span>
      <motion.div className="story-ink-message" initial={false} animate={{ opacity: phase === "gone" ? 0 : 1, filter: phase === "gone" && !reduced ? "blur(7px)" : "blur(0px)" }} transition={{ duration: reduced ? 0 : 1.2 }}>
        {phase === "writing" ? <p>Are you still there?</p> : <p>Some memories are patient.<br />Take your time. I am listening.</p>}
      </motion.div>
      <div className="story-ink-feedback" aria-live="polite">{phase === "ready" ? "Try the reading rhythm below." : phase === "writing" ? "Your words become part of the page…" : phase === "gone" ? "The ink has faded. Ready for another turn." : auto ? "The reply will fade automatically." : "The reply stays until you choose to clear it."}</div>
    </div>
    <div className="story-demo-actions"><SkyButton className="story-action" onClick={() => setRun(run + 1)}>{run ? "Replay the exchange" : "Try an exchange"}<ArrowRight size={16} /></SkyButton>{!auto && phase === "reply" && <SkyButton className="story-text-button" onClick={() => setPhase("gone")}>Clear the ink</SkyButton>}</div>
    <p className="story-caption">Retrospective timing demonstration with sample text. No AI request; illustrative timing.</p>
  </div>;
}

export function SpatialStudy() {
  const [depth, setDepth] = useState(55);
  const [frame, setFrame] = useState(4);
  const [rotation, setRotation] = useState(-28);
  const drag = useRef(null);
  const reduced = useReducedMotion();
  return <div className="story-spatial-study">
    <div className="story-volume-viewport" onPointerDown={(e) => { if (e.pointerType === 'touch') return; drag.current = { x: e.clientX, rotation }; e.currentTarget.setPointerCapture(e.pointerId); }} onPointerMove={(e) => { if (drag.current) setRotation(Math.max(-65, Math.min(20, drag.current.rotation + (e.clientX - drag.current.x) * .2))); }} onPointerUp={() => { drag.current = null; }} onPointerCancel={() => { drag.current = null; }}>
      <div className="story-volume" style={{ transform: `rotateX(-9deg) rotateY(${rotation}deg)` }}>
        {Array.from({ length: 9 }, (_, i) => <motion.img key={i} src={asset(`volume-${i}`)} alt={i === frame ? `Selected video frame ${i + 1} of 9` : ""} loading="lazy" initial={false} animate={{ opacity: i === frame ? 1 : .12, z: (i - 4) * depth * .8 }} transition={{ duration: reduced ? 0 : .18 }} style={{ outline: i === frame ? '2px solid #b9def3' : '1px solid #ffffff35' }} />)}
      </div>
      <span className="story-volume-label">{depth === 0 ? "One flat moment" : "Time becomes depth"}</span>
    </div>
    <div className="story-volume-controls">
      <label>Temporal depth <output>{depth}%</output><input type="range" min="0" max="100" value={depth} onChange={(e) => setDepth(+e.target.value)} /></label>
      <label>Current frame <output>{frame + 1} / 9</output><input type="range" min="0" max="8" value={frame} onChange={(e) => setFrame(+e.target.value)} /></label>
      <label>View angle <output>{rotation.toFixed(0)}°</output><input type="range" min="-65" max="20" value={rotation} onChange={(e) => setRotation(+e.target.value)} /></label>
    </div>
    <p className="story-caption">Try separating the frames, then move through them. Retrospective explanation using nine frames from the project’s demo video.</p>
  </div>;
}

export function RoomStudy() {
  const scenes = [
    ["room", "Look around", "A room before a conversation.", "The chair and monitor invite the next action. Looking around lets visitors discover the setting before sitting down."],
    ["seated", "Take a seat", "Now the screen has your attention.", "The seated view brings the CRT and keyboard forward. The conversation becomes the focus of the room."],
    ["lamp", "Switch the lamp", "A small action, a visible response.", "Lighting is part of the environment you can affect. It helps the room feel available to explore."],
    ["off", "Power down", "Even leaving can stay in character.", "The power control changes the CRT’s state. The hardware participates in the experience."],
  ];
  const [active, setActive] = useState(0);
  const reduced = useReducedMotion();
  return <div className="story-room-study">
    <div className="story-room-image">{scenes.map(([key], i) => <motion.img key={key} src={asset(`courage-${key}`)} alt={active === i ? scenes[i][2] : ''} aria-hidden={active !== i} loading="lazy" initial={false} animate={{ opacity: active === i ? 1 : 0 }} transition={{ duration: reduced ? 0 : .5 }} />)}</div>
    <div className="story-room-buttons" role="group" aria-label="Explore room states">{scenes.map(([key, label], i) => <SkyButton key={key} aria-pressed={active === i} onClick={() => setActive(i)}>{label}</SkyButton>)}</div>
    <div className="story-room-description" aria-live="polite"><h3>{scenes[active][2]}</h3><p>{scenes[active][3]}</p></div>
    <p className="story-caption">Explore saved product captures. This sequence explains the room’s states; the live experience animates between them.</p>
  </div>;
}
