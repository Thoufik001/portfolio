import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import { AnimatePresence, MotionConfig, motion } from "motion/react";
import * as Dialog from "@radix-ui/react-dialog";
import {
  ArrowUpRight,
  ArrowUp,
  ArrowRight,
  Moon,
  Sun,
  X,
  Check,
  Command,
  Stack,
  Cursor,
} from "../components/ui/Icon";
import "../styles/base.css";
import ProjectWorld from "../components/project/ProjectWorld";
import Logo from "../components/brand/Logo";
import Assembly from "./Assembly.jsx";
import {
  PaletteStudy,
  RevealStudy,
  TaskStudy,
  ToolbarStudy,
} from "../components/playground/Interactions";
import "./style.css";
const EMAIL = "thoufikabdullah3360@gmail.com";
const iconProps = { size: 18, weight: "regular", "aria-hidden": true };

function Theme() {
  const [dark, setDark] = useState(
    document.documentElement.dataset.theme === "dark",
  );
  return (
    <button
      className="icon-button"
      aria-label={`Switch to ${dark ? "light" : "dark"} mode`}
      onClick={() => {
        const next = !dark;
        document.documentElement.classList.add("theme-changing");
        document.documentElement.dataset.theme = next ? "dark" : "light";
        setDark(next);
        try {
          localStorage.setItem("thoufik-theme", next ? "dark" : "light");
        } catch {}
        requestAnimationFrame(() =>
          requestAnimationFrame(() =>
            document.documentElement.classList.remove("theme-changing"),
          ),
        );
      }}
    >
      {dark ? <Sun {...iconProps} /> : <Moon {...iconProps} />}
    </button>
  );
}
function About() {
  return (
    <Dialog.Root>
      <Dialog.Trigger className="nav-about">About</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="dialog-overlay" />
        <Dialog.Content className="about-dialog">
          <Dialog.Close
            className="icon-button close-dialog"
            aria-label="Close about"
          >
            <X {...iconProps} />
          </Dialog.Close>
          <span className="section-label">A little about me</span>
          <Dialog.Title>Thoufik Abdullah.</Dialog.Title>
          <Dialog.Description>
            I’m a product designer who likes getting close to how things
            actually work.
          </Dialog.Description>
          <p>
            Currently, I’m the solo designer on ZyephrOS: a clinical AI and EMR
            system spanning eight hospital modules. Before that, I worked on AI
            for SAP migration and tools for education.
          </p>
          <p>
            I design directly in code, using AI to explore possibilities and a
            design system to keep the details consistent. My side projects are
            where I try smaller, stranger ideas.
          </p>
          <a className="text-link" href={`mailto:${EMAIL}`}>
            Email me <ArrowUpRight {...iconProps} />
          </a>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
function CaseLink({ id, name }) {
  return (
    <a className="case-link" href={`/case-studies/?project=${id}`}>
      Read {name} case study <ArrowUpRight {...iconProps} />
    </a>
  );
}

function ZyephrPreview() {
  const [stage, setStage] = useState(0);
  const steps = [
    "Assessment recorded",
    "Doctor review requested",
    "Authorisation recorded",
  ];
  return (
    <div className="clinical-preview">
      <div className="clinical-app">
        <aside aria-hidden="true">
          <span className="app-logo">Z</span>
          <span className="active-rail">
            <Stack size={18} />
          </span>
          <span>
            <Cursor size={18} />
          </span>
          <span>
            <Command size={18} />
          </span>
        </aside>
        <div className="clinical-main">
          <div className="clinical-title">
            <span>Dialysis / Session overview</span>
            <span className="avatar">A</span>
          </div>
          <div className="clinical-header">
            <div>
              <small>Patient A · Illustrative session</small>
              <strong>Before treatment</strong>
            </div>
            <span className="review-state">
              {stage === 2 ? "Reviewed" : "Needs review"}
            </span>
          </div>
          <div className="clinical-grid">
            <div className="assessment">
              <span className="small-heading">Nurse assessment</span>
              {[
                "Identity check",
                "Access assessment",
                "Session preparation",
              ].map((t) => (
                <div key={t}>
                  <span>{t}</span>
                  <Check size={16} aria-hidden="true" />
                </div>
              ))}
              <div className="note-summary">
                Assessment requires doctor review before proceeding.
              </div>
            </div>
            <div className="decision">
              <span className="small-heading">Next responsible role</span>
              <div className="role-avatar">D</div>
              <strong>Doctor</strong>
              <p>
                Review the assessment.
                <br />
                Record the decision.
              </p>
            </div>
          </div>
          <div className="clinical-bottom">
            <span role="status">{steps[stage]}</span>
            <button onClick={() => setStage((stage + 1) % 3)}>
              {stage === 0
                ? "Request review"
                : stage === 1
                  ? "Record authorisation"
                  : "Reset example"}
              <ArrowRight size={14} aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
      <span className="preview-caption">
        Abstracted workflow · synthetic content
      </span>
    </div>
  );
}
function Work() {
  return (
    <div className="work-content">
      <h2 className="sr-only">Selected work</h2>
      <div className="work-gallery">
        <article className="gallery-project">
          <ProjectWorld
            project="zyephr"
            className="gallery-preview gallery-clinical"
          >
            <ZyephrPreview />
          </ProjectWorld>
          <h3>
            <a href="/case-studies/?project=zyephr">
              How do we connect care across eight hospital modules?
              <ArrowUpRight {...iconProps} />
            </a>
          </h3>
          <span className="gallery-meta">
            ZyephrOS · Clinical AI / Enterprise SaaS
          </span>
        </article>
        <article className="gallery-project">
          <ProjectWorld
            as="a"
            project="sap"
            className="gallery-preview gallery-image"
            href="/case-studies/?project=sap"
            aria-label="Explore Aceteroid case study"
          >
            <span className="cover-screen">
              {" "}
              <img
                src="/work/aceteroid.png"
                alt="Aceteroid migration risk and strategy presentation"
                loading="lazy"
                width="1280"
                height="720"
              />
            </span>
          </ProjectWorld>
          <h3>
            <a href="/case-studies/?project=sap">
              How can SAP migration decisions become easier to navigate?
              <ArrowUpRight {...iconProps} />
            </a>
          </h3>
          <span className="gallery-meta">Aceteroid · Enterprise AI</span>
        </article>
        <article className="gallery-project">
          <ProjectWorld
            as="a"
            project="learning"
            className="gallery-preview gallery-image"
            href="/case-studies/?project=learning"
            aria-label="Explore Airtribe case study"
          >
            <span className="cover-screen">
              {" "}
              <img
                src="/work/airtribe.png"
                alt="Airtribe program page preview and editing interface"
                loading="lazy"
                width="1280"
                height="720"
              />
            </span>
          </ProjectWorld>
          <h3>
            <a href="/case-studies/?project=learning">
              How can teams publish program pages with fewer moving parts?
              <ArrowUpRight {...iconProps} />
            </a>
          </h3>
          <span className="gallery-meta">
            Airtribe · Education / Internal tools
          </span>
        </article>
        <article className="gallery-project">
          <ProjectWorld
            project="notch"
            className="gallery-preview gallery-notch"
          >
            <NotchDemo />
          </ProjectWorld>
          <h3>A second window, without a second distraction.</h3>
          <span className="gallery-meta">NotchPark · Independent concept</span>
        </article>
      </div>
    </div>
  );
}
function NotchDemo() {
  const [peek, setPeek] = useState(false);
  return (
    <div className="notch-demo">
      <div className="desktop-menu">
        <span>Finder</span>
        <span>File &nbsp; Edit &nbsp; View</span>
      </div>
      <button
        className={`notch ${peek ? "peek" : ""}`}
        aria-expanded={peek}
        onClick={() => setPeek(!peek)}
        aria-label={peek ? "Collapse parked window" : "Peek at parked window"}
      >
        <span className="notch-lip" />
        {peek ? (
          <div className="parked-note">
            <span>Quick note</span>
            <strong>
              Keep the thought.
              <br />
              Keep your focus.
            </strong>
            <small>Select again to tuck away.</small>
          </div>
        ) : (
          <span className="notch-handle" />
        )}
      </button>
      <div className="desktop-document">
        <span>One thing at a time.</span>
        <div />
        <div />
        <div className="short-line" />
      </div>
      <span className="notch-caption">Select the notch to peek</span>
    </div>
  );
}
function NotchFeature() {
  return (
    <article className="side-feature">
      <NotchDemo />
      <div>
        <span className="project-context">On my workbench · Concept</span>
        <h3>NotchPark</h3>
        <p>
          A secondary window, tucked into the Mac’s notch. Peek, interact, and
          get back to what you were doing.
        </p>
        <span className="side-note">
          An independent exploration of focus and window behaviour.
        </span>
      </div>
    </article>
  );
}
const workbench = [
  [
    "Tessaract",
    "Interactive prototype",
    "Exploring video as a volume, with slices through time and space.",
  ],
  [
    "SketchLoom",
    "Canvas prototype",
    "Collecting references, connecting ideas, and shaping a presentable concept.",
  ],
  [
    "ContextOS",
    "Product exploration",
    "Structuring approved company claims and the evidence behind them for AI tools.",
  ],
  [
    "Doomhigh",
    "Concept",
    "Making scrolling tangible through progress toward recognizable landmarks.",
  ],
  [
    "TrackMagic",
    "Feasibility exploration",
    "Investigating a phone-as-trackpad interaction with deliberate presses and haptics.",
  ],
  [
    "Haniya",
    "Personal browser game",
    "Exploring character reactions, layered scenes, and playful voice interaction.",
  ],
];
const collection = [
  {
    id: "notch",
    title: "NotchPark",
    category: "Builds",
    label: "Window utility · Concept",
    text: "Exploring how a parked window can reveal itself without interrupting your focus.",
    type: "notch",
  },
  {
    id: "proto",
    title: "Protospace",
    category: "Builds",
    label: "AI playground · Concept",
    text: "A space to explore new product features using the actual design system and codebase.",
    type: "proto",
  },
  {
    id: "motion",
    title: "A mark with depth",
    category: "Interactions",
    label: "Interaction study",
    text: "Teal particles assemble into my mark. Move over it to tilt the view; click to scatter and bring it back together.",
    type: "assembly",
  },
  {
    id: "palette",
    title: "Keep a color. Change the mood.",
    category: "Interactions",
    label: "Press · Color study",
    type: "palette",
    text: "A palette with a little memory. Pin the colors you like, then shuffle everything around them.",
  },
  {
    id: "reveal",
    title: "A window between two moods.",
    category: "Interactions",
    label: "Slide · Image study",
    type: "reveal",
    text: "One scene, two readings. Drag the seam to find the moment where quiet becomes vivid.",
  },
  {
    id: "tasks",
    title: "A little less on your mind.",
    category: "Interactions",
    label: "Press · Motion study",
    type: "tasks",
    text: "A small stack that makes clearing a task feel tangible. Click the top card and make some room.",
  },
  {
    id: "toolbar",
    title: "Tools that follow your thinking.",
    category: "Interactions",
    label: "Select · Toolbar study",
    type: "toolbar",
    text: "Switch between moving, arranging, and building. The canvas responds; the controls stay familiar.",
  },
  {
    id: "identity",
    title: "A2A Point",
    category: "Brand & decks",
    label: "Visual archive · Brand presentation",
    text: "A visual presentation from my earlier portfolio. A different scale of storytelling.",
    image: "/playground/identity-1.png",
  },
  {
    id: "deck",
    title: "SecuQR",
    category: "Brand & decks",
    label: "Visual archive · Presentation design",
    text: "A selected slide explaining a product’s value proposition through a visual narrative.",
    image: "/playground/identity-2.png",
  },
  {
    id: "illustration",
    title: "A familiar landmark",
    category: "Brand & decks",
    label: "Visual archive · Illustration",
    text: "A geometric illustration of Government College of Technology, Coimbatore.",
    image: "/playground/deck-1.png",
  },
];
function ProtoDemo() {
  const [view, setView] = useState("Comfortable");
  return (
    <div className="proto-demo">
      <div className="proto-top">
        <span>Protospace</span>
        <span>Concept preview</span>
      </div>
      <div className="proto-toolbar">
        Explore a worklist{" "}
        <span>
          Design system attached <Check size={12} aria-hidden="true" />
        </span>
      </div>
      <div className={`proto-list ${view === "Compact" ? "dense" : ""}`}>
        {[
          "Review a proposed feature",
          "Compare the alternatives",
          "Keep the system consistent",
        ].map((t, i) => (
          <div key={t}>
            <span className="list-check">
              {i === 0 ? <Check size={13} aria-hidden="true" /> : null}
            </span>
            {t}
          </div>
        ))}
      </div>
      <div
        className="proto-toggle"
        role="group"
        aria-label="Preview worklist density"
      >
        {["Comfortable", "Compact"].map((t) => (
          <button aria-pressed={view === t} key={t} onClick={() => setView(t)}>
            {t}
          </button>
        ))}
      </div>
    </div>
  );
}
function Playground() {
  const [filter, setFilter] = useState("All");
  const visible = collection.filter(
    (x) => filter === "All" || x.category === filter,
  );
  return (
    <div className="playground-content">
      <h2 className="section-title">Playground</h2>
      <p className="collection-intro">
        Small tools, curious interactions, and another side of my visual work.
      </p>
      <div className="filters" role="group" aria-label="Filter playground">
        {["All", "Builds", "Interactions", "Brand & decks"].map((t) => (
          <button
            aria-pressed={filter === t}
            onClick={() => setFilter(t)}
            key={t}
          >
            {t}
          </button>
        ))}
      </div>
      <div className="play-grid">
        {visible.map((item) => (
          <article className="play-item" key={item.id}>
            <div
              className={`play-visual ${item.image ? "archive-visual" : ""}`}
            >
              {item.image ? (
                <Dialog.Root>
                  <Dialog.Trigger
                    className="image-trigger"
                    aria-label={`Expand ${item.title}`}
                  >
                    <img
                      src={item.image}
                      alt={
                        item.title === "A2A Point"
                          ? "A2A Point brand presentation for a real estate platform"
                          : item.title === "SecuQR"
                            ? "SecuQR slide presenting five product value propositions"
                            : "Geometric illustration of a clock tower and college facade"
                      }
                      loading="lazy"
                    />
                    <span className="expand-label">
                      View image <ArrowUpRight size={16} aria-hidden="true" />
                    </span>
                  </Dialog.Trigger>
                  <Dialog.Portal>
                    <Dialog.Overlay className="dialog-overlay" />
                    <Dialog.Content className="image-dialog">
                      <Dialog.Title className="sr-only">
                        {item.title}
                      </Dialog.Title>
                      <Dialog.Description className="sr-only">
                        {item.text}
                      </Dialog.Description>
                      <Dialog.Close
                        className="icon-button close-dialog"
                        aria-label="Close image"
                      >
                        <X {...iconProps} />
                      </Dialog.Close>
                      <img
                        src={item.image}
                        alt={`${item.title} from the visual archive`}
                      />
                      <p>{item.label}</p>
                    </Dialog.Content>
                  </Dialog.Portal>
                </Dialog.Root>
              ) : item.type === "notch" ? (
                <NotchDemo />
              ) : item.type === "proto" ? (
                <ProtoDemo />
              ) : item.type === "palette" ? (
                <PaletteStudy />
              ) : item.type === "reveal" ? (
                <RevealStudy />
              ) : item.type === "tasks" ? (
                <TaskStudy />
              ) : item.type === "toolbar" ? (
                <ToolbarStudy />
              ) : (
                <Assembly />
              )}
            </div>
            <span className="project-context">{item.label}</span>
            <h3>{item.title}</h3>
            <p>{item.text}</p>
          </article>
        ))}
      </div>
      <p className="interaction-credit">
        The new interaction studies take inspiration from{" "}
        <a href="https://bencho.dev/" target="_blank" rel="noreferrer">
          Bencho
        </a>
        , reworked for this playground.
      </p>
      <div className="workbench">
        <h3>Also on the workbench</h3>
        <p>
          Ongoing ideas and prototypes. Open one for a quick look at the
          question behind it.
        </p>
        <div className="workbench-grid">
          {workbench.map(([name, status, description]) => (
            <details key={name}>
              <summary>
                <span>
                  {name}
                  <small>{status}</small>
                </span>
                <ArrowRight size={16} aria-hidden="true" />
              </summary>
              <p>{description}</p>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
}
function App() {
  const [section, setSection] = useState(
    location.hash === "#playground" || location.hash === "#play"
      ? "playground"
      : "work",
  );
  function select(next) {
    setSection(next);
    history.replaceState(null, "", `#${next}`);
    document.getElementById("explore")?.scrollIntoView({
      behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
    });
  }
  return (
    <MotionConfig reducedMotion="user">
      <a href="#explore" className="skip-link">
        Skip to work
      </a>
      <header className="site-header">
        <a className="wordmark" href="/" aria-label="Thoufik Abdullah home">
          <Logo size={28} />{" "}
          <span>
            thoufik<span className="wordmark-end">.</span>
          </span>
        </a>
        <nav aria-label="Main navigation">
          <button
            aria-current={section === "work" ? "page" : undefined}
            onClick={() => select("work")}
          >
            Work
          </button>
          <button
            aria-current={section === "playground" ? "page" : undefined}
            onClick={() => select("playground")}
          >
            Playground
          </button>
          <About />
          <a className="nav-contact" href={`mailto:${EMAIL}`}>
            Email me <ArrowUpRight size={15} aria-hidden="true" />
          </a>
          <Theme />
        </nav>
      </header>
      <main>
        <section className="hero" aria-labelledby="intro">
          <div className="hero-copy">
            <span className="intro-label">
              Thoufik Abdullah · AI-native product designer
            </span>
            <h1 id="intro">
              I design the system.
              <br />
              <span>And the small things.</span>
            </h1>
            <p>
              I design in code, using AI to explore and build—from complex
              enterprise software to everyday tools.
            </p>
            <a className="hero-link" href="#explore">
              Explore my work <ArrowRight {...iconProps} />
            </a>
          </div>
          <Assembly />
        </section>
        <section id="explore" className="explore">
          <AnimatePresence initial={false} mode="wait">
            <motion.div
              key={section}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
            >
              {section === "work" ? <Work /> : <Playground />}
            </motion.div>
          </AnimatePresence>
        </section>
        <section className="about-strip" aria-labelledby="about-heading">
          <h2 id="about-heading">
            Thinking in systems.
            <br />
            <span>Making room for curiosity.</span>
          </h2>
          <div>
            <p>
              Currently the solo product designer on ZyephrOS. Beyond work, I
              build little tools, explore interactions, and keep finding things
              to improve.
            </p>
            <p className="muted">
              Design systems give my work a foundation. Code lets me feel
              whether it actually works.
            </p>
          </div>
        </section>
      </main>
      <footer>
        <span>Have a complex problem—or a small, good idea?</span>
        <a href={`mailto:${EMAIL}`}>
          Email me <ArrowUpRight {...iconProps} />
        </a>
        <div className="footer-bottom">
          <span>Thoufik Abdullah</span>
          <span>Designed and built in code.</span>
          <a href="#intro">
            Back to top <ArrowUp size={16} />
          </a>
        </div>
      </footer>
    </MotionConfig>
  );
}
createRoot(document.getElementById("root")).render(<App />);
