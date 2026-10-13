import React, { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { ArrowRight } from "../SkyIcons";
import WorkProjects from "../WorkProjects";
import { stories, storyOrder } from "./content";
import { asset } from "./StoryElements";
import "./stories.css";

export function IndependentProjects() {
  useEffect(() => {
    if (location.hash === '#independent-projects') {
      const frame = requestAnimationFrame(() => document.getElementById('independent-projects')?.scrollIntoView());
      return () => cancelAnimationFrame(frame);
    }
  }, []);
  return <section className="independent-projects" id="independent-projects" aria-labelledby="independent-title">
    <div className="independent-intro"><h2 id="independent-title">Independent projects</h2><p>Exploring how we interact with technology—through space, stories, and a little curiosity.</p></div>
    <WorkProjects projects={storyOrder.map((id) => ({
      id,
      name: stories[id].name,
      caseTitle: {
        tesseract: "Explore video by moving through time.",
        diary: "Turn a conversation into a diary that writes back.",
        courage: "Step into Courage’s world. Talk to its computer.",
      }[id],
      domain: stories[id].type,
    }))} Preview={({ project }) => <img className="independent-cover" src={asset(`${project.id}-poster`)} alt={`${project.name} interactive experience`} loading="lazy" decoding="async" />} />
  </section>;
}

export function NotchPlayground() {
  const [parked, setParked] = useState(false);
  const [selected, setSelected] = useState('Notes');
  const reduced = useReducedMotion();
  return <article className="notch-playground">
    <div className="notch-playground-heading"><h2>NotchPark</h2><p>A small home for the window you’re not quite done with.</p></div>
    <div className="notch-desktop" data-parked={parked}>
      <button className="notch-slot" onClick={() => setParked(!parked)} aria-label={parked ? 'Restore parked window' : 'Park window in the notch'} aria-pressed={parked}>{parked ? <span>{selected}<ArrowRight size={12} /></span> : <span className="notch-camera" />}</button>
      <span className="notch-desktop-title" aria-hidden="true">A little breathing room.</span>
      <motion.div className="notch-window" initial={false} animate={{ y: parked ? -98 : 0, scale: parked ? .16 : 1, opacity: parked ? 0 : 1, filter: parked && !reduced ? 'blur(3px)' : 'blur(0px)' }} transition={{ duration: reduced ? 0 : .45, ease: [.22,1,.36,1] }} inert={parked}>
        <div className="notch-window-bar"><span /><span /><span /><strong>{selected}</strong></div><div className="notch-window-content"><h3>{selected === 'Notes' ? 'Keep this thought.' : 'A little inspiration.'}</h3><p>{selected === 'Notes' ? 'Make the small moments feel considered.' : 'Things worth coming back to.'}</p><div className="notch-sample-lines" aria-hidden="true"><i /><i /><i /></div></div>
      </motion.div>
    </div>
    <div className="notch-playground-controls"><div role="group" aria-label="Choose a sample window">{['Notes','Browser'].map((label) => <button aria-pressed={selected === label} key={label} onClick={() => { setSelected(label); setParked(false); }}>{label}</button>)}</div><button onClick={() => setParked(!parked)}>{parked ? 'Bring it back' : 'Park the window'}<ArrowRight size={16} /></button></div>
    <p className="notch-playground-note" aria-live="polite">{parked ? 'Parked. Tap the notch to bring it back.' : 'Interactive concept · try parking a window in the notch.'}</p>
  </article>;
}
