import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  AnimatePresence,
  MotionConfig,
  motion,
  useReducedMotion,
} from "motion/react";
import * as Dialog from "@radix-ui/react-dialog";
import {
  ArrowUpRight,
  ArrowRight,
  ArrowDown,
  Check,
  X,
  Sun,
  Moon,
  Sparkle,
  SquaresFour,
  Code,
  Cursor,
  ArrowCounterClockwise,
  Plus,
  CaretRight,
  Fingerprint,
  Stack,
  Play,
  Pause,
  Copy,
  EnvelopeSimple,
} from "@phosphor-icons/react";
import "./styles.css";
import "./art-direction.css";
import FormStudy from "./FormStudy.jsx";

const EMAIL = "thoufikabdullah3360@gmail.com";
const projects = [
  {
    id: "zyephr",
    name: "ZyephrOS",
    category: "AI products",
    tags: "Clinical AI · Enterprise SaaS",
    line: "Many roles. One connected system.",
    description:
      "Designing a hospital OS and the foundations to keep building it.",
    role: "Solo product designer",
    scope: "8 modules · Design system · Working prototype",
  },
  {
    id: "sap",
    name: "Aceteroid",
    category: "AI products",
    tags: "AI · Enterprise software",
    line: "Working through enterprise complexity.",
    description: "Product design for an AI-powered SAP product.",
    role: "Product designer",
    scope: "Decision architecture · Dashboard design",
  },
  {
    id: "learning",
    name: "Airtribe",
    category: "Learning",
    tags: "Learning · Product design",
    line: "A different kind of product problem.",
    description: "An earlier exploration of learning experiences.",
    role: "Product designer",
    scope: "Structured editor · Review workflow",
  },
];
const chapters = [
  {
    title: "Make AI output inspectable.",
    text: "Generated documentation can expose supporting transcript evidence. Proposed medicines remain separate from reviewed decisions.",
    caption: "AI-assisted review",
    icon: Sparkle,
  },
  {
    title: "Make responsibility visible.",
    text: "A flagged nurse assessment requests doctor review. Treatment moves forward through an explicit authorisation step.",
    caption: "Cross-role workflows",
    icon: Fingerprint,
  },
  {
    title: "Make the next module easier.",
    text: "Semantic tokens, shared components and Codex instructions establish reusable rules. A playground supports variant exploration.",
    caption: "Designing the delivery system",
    icon: Stack,
  },
];

function Icon({ as: Component, ...props }) {
  return <Component size={20} weight="regular" aria-hidden="true" {...props} />;
}

function ThemeButton() {
  const [theme, setTheme] = useState(
    document.documentElement.dataset.theme || "light",
  );
  function toggle() {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem("thoufik-theme", next);
    } catch {}
  }
  return (
    <button
      className="icon-button theme-button"
      aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
      onClick={toggle}
    >
      <Icon as={theme === "light" ? Moon : Sun} size={18} />
    </button>
  );
}

function ReviewExperiment({ compact = false }) {
  const [view, setView] = useState("Review");
  const [evidence, setEvidence] = useState(false);
  const [reviewed, setReviewed] = useState(false);
  const reduce = useReducedMotion();
  const views = ["Review", "Handoff", "System"];
  return (
    <div className={`workflow-study ${compact ? "compact" : ""}`}>
      <div
        className="study-tabs"
        role="group"
        aria-label="Explore the workflow study"
      >
        {views.map((v) => (
          <button key={v} onClick={() => setView(v)} aria-pressed={view === v}>
            {view === v && (
              <motion.span
                layoutId={`study-tab-${compact}`}
                className="tab-surface"
                transition={{ duration: reduce ? 0 : 0.18 }}
              />
            )}
            <span>{v}</span>
          </button>
        ))}
      </div>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          className="study-body"
          key={view}
          initial={{ opacity: 0, y: reduce ? 0 : 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: reduce ? 0 : -4 }}
          transition={{ duration: reduce ? 0 : 0.15 }}
        >
          {view === "Review" ? (
            <>
              <div className="study-topline">
                <span className="mini-avatar">
                  <Icon as={Sparkle} size={18} />
                </span>
                <span>
                  Consultation note<small>Generated draft</small>
                </span>
                <span className="draft-label">For review</span>
              </div>
              <div className="note-field">
                <span className="field-label">Presenting concern</span>
                <p>Recurring discomfort since the last visit.</p>
                <button
                  className="evidence-link"
                  onClick={() => setEvidence(!evidence)}
                  aria-expanded={evidence}
                >
                  <Icon as={Fingerprint} size={15} />
                  {evidence
                    ? "Hide supporting evidence"
                    : "View supporting evidence"}
                  <Icon as={CaretRight} size={13} />
                </button>
                {evidence && (
                  <div className="evidence-note">
                    “It’s been coming back since my last appointment.”
                    <small>Illustrative transcript excerpt</small>
                  </div>
                )}
              </div>
              <div className="study-footer">
                <span>
                  {reviewed ? "Review recorded" : "Your review comes first"}
                </span>
                <button
                  className={`mini-action ${reviewed ? "confirmed" : ""}`}
                  onClick={() => setReviewed(!reviewed)}
                >
                  <Icon as={reviewed ? Check : ArrowRight} size={14} />
                  {reviewed ? "Reviewed" : "Mark reviewed"}
                </button>
              </div>
            </>
          ) : view === "Handoff" ? (
            <>
              <div className="study-topline">
                <span className="mini-avatar">
                  <Icon as={Fingerprint} size={18} />
                </span>
                <span>
                  Treatment readiness<small>Assessment handoff</small>
                </span>
              </div>
              <div className="handoff-steps">
                <div>
                  <span className="step-check">
                    <Icon as={Check} size={13} />
                  </span>
                  <p>
                    Nurse assessment<small>Recorded and shared</small>
                  </p>
                </div>
                <div>
                  <span className="step-current">2</span>
                  <p>
                    Doctor review<small>Awaiting authorisation</small>
                  </p>
                </div>
                <div>
                  <span className="step-idle">3</span>
                  <p>
                    Treatment<small>Starts after approval</small>
                  </p>
                </div>
              </div>
              <div className="study-footer">
                <span>Next action belongs to</span>
                <strong>Doctor</strong>
              </div>
            </>
          ) : (
            <>
              <div className="study-topline">
                <span className="mini-avatar">
                  <Icon as={SquaresFour} size={18} />
                </span>
                <span>
                  A shared foundation<small>From rules to interfaces</small>
                </span>
              </div>
              <div className="system-chain">
                <span>Semantic tokens</span>
                <Icon as={ArrowDown} size={14} />
                <span>Shared components</span>
                <Icon as={ArrowDown} size={14} />
                <span>Role-specific workflows</span>
              </div>
              <div className="study-footer">
                <span>Design system + Codex</span>
                <Icon as={Code} size={17} />
              </div>
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function FocusExperiment({ hero = false }) {
  const [tasks, setTasks] = useState([
    { text: "Make something worth using", done: false },
    { text: "Get the details right", done: false },
    { text: "Leave room to explore", done: false },
  ]);
  const [selected, setSelected] = useState(0);
  const [started, setStarted] = useState(false);
  const remaining = tasks.filter((t) => !t.done).length;
  function finish() {
    setTasks(
      tasks.map((t, i) => (i === selected ? { ...t, done: !t.done } : t)),
    );
    setStarted(false);
  }
  return (
    <div
      className={`focus-experiment ${hero ? "hero-experiment" : ""} ${started ? "focus-active" : ""}`}
    >
      <div className="focus-title">
        <span className="focus-mark">
          <Icon as={Cursor} size={17} />
        </span>
        <span>
          One thing<small>A little focus experiment</small>
        </span>
        <button
          className="icon-button"
          onClick={() => {
            setTasks(tasks.map((t) => ({ ...t, done: false })));
            setStarted(false);
          }}
          aria-label="Reset focus experiment"
        >
          <Icon as={ArrowCounterClockwise} size={16} />
        </button>
      </div>
      <div className="focus-task">
        <span>
          {remaining === 0
            ? "All done. Take a breath."
            : started
              ? "A little less distraction."
              : "What gets your attention?"}
        </span>
        <AnimatePresence mode="wait" initial={false}>
          <motion.p
            key={`${selected}-${remaining}`}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.16 }}
          >
            {remaining === 0 ? "You made room for it." : tasks[selected].text}
          </motion.p>
        </AnimatePresence>
      </div>
      <div
        className="focus-options"
        role="group"
        aria-label="Choose a focus task"
      >
        {tasks.map((task, i) => (
          <button
            key={task.text}
            aria-label={`${i + 1}: ${task.text}${task.done ? ", completed" : ""}`}
            aria-pressed={selected === i}
            onClick={() => {
              setSelected(i);
              setStarted(false);
            }}
            className={`${selected === i ? "selected" : ""} ${task.done ? "done" : ""}`}
          >
            {task.done ? <Icon as={Check} size={14} /> : <span>{i + 1}</span>}
          </button>
        ))}
      </div>
      <div className="focus-bottom">
        <button
          className="focus-start"
          onClick={() => setStarted(!started)}
          disabled={remaining === 0 || tasks[selected].done}
        >
          <Icon as={started ? Pause : Play} size={14} weight="fill" />
          {started ? "Pause" : "Focus"}
        </button>
        <button
          className="focus-complete"
          onClick={finish}
          aria-label={
            tasks[selected].done
              ? "Reopen selected task"
              : "Complete selected task"
          }
        >
          <Icon as={Check} size={18} />
        </button>
      </div>
      <span className="sr-only" role="status">
        {remaining} tasks remaining. {started ? "Focus mode active." : ""}
      </span>
    </div>
  );
}

function ProjectDialog({ project, children }) {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>{children}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="dialog-overlay" />
        <Dialog.Content className="project-dialog">
          <Dialog.Close
            className="icon-button dialog-close"
            aria-label="Close project"
          >
            <Icon as={X} />
          </Dialog.Close>
          <p className="dialog-kicker">{project.tags}</p>
          <Dialog.Title>{project.name}</Dialog.Title>
          <Dialog.Description className="dialog-description">
            {project.description}
          </Dialog.Description>
          <a
            className="case-study-link"
            href={`/case-studies/?project=${project.id}`}
          >
            Read the full case study <Icon as={ArrowUpRight} size={17} />
          </a>
          <div className="project-facts">
            <div>
              <span>My role</span>
              <strong>{project.role}</strong>
            </div>
            <div>
              <span>Scope</span>
              <strong>{project.scope}</strong>
            </div>
          </div>
          {project.id === "zyephr" ? (
            <>
              <div className="dialog-study">
                <ReviewExperiment />
              </div>
              <p className="study-caption">
                Abstracted interaction study · synthetic content
              </p>
              <div className="decision-chapters">
                {chapters.map((ch) => (
                  <section key={ch.title}>
                    <Icon as={ch.icon} />
                    <h3>{ch.title}</h3>
                    <p>{ch.text}</p>
                  </section>
                ))}
              </div>
              <div className="case-status">
                <strong>A closer look at the decisions</strong>
                <p>
                  Read the full case study for workflow reconstructions, shared
                  patterns, trade-offs and the next questions to validate.
                </p>
              </div>
            </>
          ) : (
            <div className="case-status">
              <strong>Explore the design story.</strong>
              <p>
                The case study connects product outputs to information
                architecture, key decisions and trade-offs.
              </p>
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function ContactDialog({ children }) {
  const [copied, setCopied] = useState(false);
  const timeout = useRef();
  useEffect(() => () => clearTimeout(timeout.current), []);
  async function copy() {
    try {
      await navigator.clipboard.writeText(EMAIL);
      setCopied(true);
      clearTimeout(timeout.current);
      timeout.current = setTimeout(() => setCopied(false), 2400);
    } catch {
      setCopied(false);
    }
  }
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>{children}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="dialog-overlay" />
        <Dialog.Content className="contact-dialog">
          <Dialog.Close
            className="icon-button dialog-close"
            aria-label="Close contact"
          >
            <Icon as={X} />
          </Dialog.Close>
          <span className="contact-symbol">
            <Icon as={EnvelopeSimple} size={28} />
          </span>
          <Dialog.Title>Let’s make something useful.</Dialog.Title>
          <Dialog.Description>
            I’m interested in product design roles across AI, enterprise
            software and everyday tools.
          </Dialog.Description>
          <a className="email-link" href={`mailto:${EMAIL}`}>
            {EMAIL}
            <Icon as={ArrowUpRight} size={17} />
          </a>
          <button className="copy-email" onClick={copy}>
            <Icon as={copied ? Check : Copy} size={16} />
            <span role="status">{copied ? "Copied email" : "Copy email"}</span>
          </button>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function ProjectFolder({ project }) {
  const labels =
    project.id === "zyephr"
      ? ["Review", "Handoff", "System"]
      : project.id === "sap"
        ? ["Explore", "Compare", "Decide"]
        : ["Discover", "Practice", "Progress"];
  return (
    <ProjectDialog project={project}>
      <button
        className={`project-folder folder-${project.id}`}
        aria-label={`Open ${project.name} project`}
      >
        <span className="folder-object" aria-hidden="true">
          <span className="folder-back" />
          {labels.map((label, i) => (
            <span className={`folder-sheet sheet-${i}`} key={label}>
              <span className="sheet-heading">{label}</span>
              <span className="sheet-diagram">
                <i />
                <i />
                <i />
              </span>
              <span className="sheet-rule" />
              <span className="sheet-rule short" />
            </span>
          ))}
          <span className="folder-front">
            <span className="folder-emboss">
              {project.id === "zyephr"
                ? "+"
                : project.id === "sap"
                  ? "AI"
                  : "Aa"}
            </span>
            <span className="folder-tab-name">
              {project.id === "zyephr"
                ? "ZyephrOS"
                : project.id === "sap"
                  ? "SAP AI"
                  : "Learning"}
            </span>
          </span>
        </span>
        <span className="folder-caption">
          <strong>{project.name}</strong>
          <span>
            {project.id === "zyephr"
              ? "8 modules · Solo designer"
              : "Read the design story"}
          </span>
        </span>
      </button>
    </ProjectDialog>
  );
}
function App() {
  const [filter, setFilter] = useState("All work");
  return (
    <MotionConfig
      reducedMotion="user"
      transition={{ type: "spring", stiffness: 380, damping: 32 }}
    >
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <header className="site-header">
        <a className="wordmark" href="#top" aria-label="Thoufik home">
          Thoufik<span className="wordmark-period">.</span>
        </a>
        <nav aria-label="Main navigation">
          <a href="#work">Work</a>
          <a href="#play">Play</a>
          <a href="#about">About</a>
        </nav>
        <div className="header-actions">
          <ThemeButton />
          <ContactDialog>
            <button className="contact-nav">
              Contact
              <Icon as={ArrowUpRight} size={15} />
            </button>
          </ContactDialog>
        </div>
      </header>
      <main id="main">
        <section id="top" className="intent-hero">
          <div className="hero-introduction">
            <span>Thoufik Abdullah</span>
            <span>AI-native product designer</span>
          </div>
          <h1>
            Complexity,
            <br />
            made clear.
          </h1>
          <FormStudy />
          <div className="hero-colophon">
            <p>
              I work across AI products, enterprise software
              <br />
              and everyday tools. I design directly in code.
            </p>
            <a href="#work">
              Selected work
              <Icon as={ArrowDown} size={16} />
            </a>
          </div>
        </section>
        <section id="work" className="archive">
          <div className="archive-header">
            <div>
              <h2>Things I’ve worked on.</h2>
              <p>A few different problems. The same attention.</p>
            </div>
            <div
              className="archive-filters"
              role="group"
              aria-label="Filter selected work"
            >
              {["All work", "AI products", "Learning"].map((f) => (
                <button
                  key={f}
                  aria-pressed={filter === f}
                  onClick={() => setFilter(f)}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
          <div className="folder-gallery">
            {projects
              .filter((p) => filter === "All work" || p.category === filter)
              .map((project) => (
                <article className="project" key={project.id}>
                  <ProjectFolder project={project} />
                </article>
              ))}
          </div>
          <div className="featured-work">
            <div className="featured-copy">
              <span className="section-label">Currently building</span>
              <h2>
                A hospital is
                <br />a system of people.
              </h2>
              <p>
                As the solo designer on ZyephrOS, I’m connecting eight
                role-based modules and creating the shared foundations behind
                them.
              </p>
              <ProjectDialog project={projects[0]}>
                <button className="text-link">
                  Inside ZyephrOS
                  <Icon as={ArrowUpRight} size={17} />
                </button>
              </ProjectDialog>
            </div>
            <div className="featured-interaction">
              <ReviewExperiment />
              <p className="study-caption">
                Abstracted interaction · Synthetic data
              </p>
            </div>
          </div>
        </section>
        <section id="play" className="studio-play">
          <div className="studio-play-title">
            <span className="section-label">Made out of curiosity</span>
            <h2>
              A small idea.
              <br />
              Something you can feel.
            </h2>
            <p>
              One thing is a little experiment in focus, choice and finishing.
              Pick a task and try it.
            </p>
          </div>
          <div className="studio-play-object">
            <FocusExperiment />
            <span className="play-note">One thing · Portfolio experiment</span>
          </div>
        </section>
        <section id="about" className="about-section">
          <div className="about-title">
            <span className="section-label">The person behind the work</span>
            <h2>
              I think by
              <br />
              making.
            </h2>
          </div>
          <div className="about-copy">
            <p>
              I’m Thoufik. I like getting deep into a complicated product, then
              working through the small decisions that make it feel simple.
            </p>
            <p>
              Currently, I’m the solo designer on ZyephrOS. Previously, I worked
              on SAP AI and edtech products. I use AI to explore quickly, and
              code to get close to the real experience.
            </p>
            <p className="about-last">The details are part of the thinking.</p>
          </div>
        </section>
        <section id="contact" className="contact-section">
          <p>Have a good problem to work on?</p>
          <ContactDialog>
            <button className="contact-heading">
              Let’s talk.
              <Icon as={ArrowUpRight} size={48} weight="light" />
            </button>
          </ContactDialog>
          <span>AI products, enterprise software, everyday tools.</span>
        </section>
      </main>
      <footer>
        <span>Thoufik Abdullah</span>
        <a
          href="https://github.com/Thoufik001"
          target="_blank"
          rel="noreferrer"
        >
          GitHub
          <Icon as={ArrowUpRight} size={13} />
        </a>
        <a href={`mailto:${EMAIL}`}>
          Email
          <Icon as={ArrowUpRight} size={13} />
        </a>
      </footer>
    </MotionConfig>
  );
}
createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
