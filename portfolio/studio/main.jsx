import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import * as Dialog from "@radix-ui/react-dialog";
import {
  ArrowUpRight,
  ArrowLeft,
  Sun,
  X,
  ArrowRight,
  Check,
} from "@phosphor-icons/react";
import "./studio.css";

const stories = {
  work: {
    title: "Connected systems. Everyday tools.",
    intro:
      "My work spans AI products, enterprise software and learning. Here’s where I’ve been spending my attention.",
  },
  play: {
    title: "A small space to try things.",
    intro:
      "I use code to get beyond the still image. Change a choice, feel the response, then refine it.",
  },
  about: {
    title: "I think by making.",
    intro:
      "I’m Thoufik, a product designer. I’m currently the sole designer on ZyephrOS, connecting eight hospital modules through a shared design system. I use AI and code to explore variants and work toward production-quality interfaces.",
  },
};
function Studio() {
  const [mode, setMode] = useState("studio"),
    [open, setOpen] = useState(null),
    [anchors, setAnchors] = useState({}),
    [ready, setReady] = useState(false),
    [failed, setFailed] = useState(false),
    [active, setActive] = useState(0),
    [done, setDone] = useState(false);
  const canvas = useRef(null),
    restore = useRef(null);
  useEffect(() => {
    if (mode !== "studio") return;
    let dispose,
      alive = true;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    import("./scene.js")
      .then((m) => {
        if (!alive) return;
        try {
          dispose = m.createStudio(canvas.current, setAnchors, reduced);
          setReady(true);
        } catch {
          setFailed(true);
        }
      })
      .catch(() => setFailed(true));
    return () => {
      alive = false;
      dispose?.();
    };
  }, [mode]);
  function show(key, e) {
    restore.current = e.currentTarget;
    setOpen(key);
  }
  return (
    <>
      <a className="skip" href="#studio-content">
        Skip to content
      </a>
      <header>
        <a className="identity" href="/studio/">
          Thoufik<span>Product designer</span>
        </a>
        <nav className="mode-switch" aria-label="Portfolio view">
          <button
            aria-pressed={mode === "studio"}
            onClick={() => setMode("studio")}
          >
            Studio
          </button>
          <button
            aria-pressed={mode === "work"}
            onClick={() => setMode("work")}
          >
            Work
          </button>
        </nav>
        <a className="contact" href="mailto:thoufikabdullah3360@gmail.com">
          Say hello <ArrowUpRight size={16} />
        </a>
      </header>
      <main id="studio-content">
        <div className="introduction">
          <p>Come in. Take a look around.</p>
          <h1>
            A place to work
            <br />
            things out.
          </h1>
          <p className="positioning">
            AI products, connected systems
            <br />
            and useful little things.
          </p>
        </div>
        {mode === "studio" ? (
          <section className="studio-space" aria-label="Interactive studio">
            <div className="scene-wrapper">
              <canvas ref={canvas} aria-hidden="true" />
              {!ready && !failed && (
                <p className="loading" role="status">
                  Opening the studio…
                </p>
              )}
              {failed && (
                <div className="fallback">
                  <h2>The door’s open.</h2>
                  <p>
                    Explore the work, experiments and person behind them below.
                  </p>
                </div>
              )}
              <div className="scene-hotspots">
                {[
                  ["work", "Selected work"],
                  ["play", "Small experiments"],
                  ["about", "About me"],
                ].map(([key, label]) => (
                  <button
                    key={key}
                    className={`hotspot ${key}`}
                    style={anchors[key] && !failed ? anchors[key] : undefined}
                    onClick={(e) => show(key, e)}
                  >
                    <span className="hotspot-dot" />
                    {label}
                    <ArrowUpRight size={13} />
                  </button>
                ))}
              </div>
            </div>
            <div className="scene-caption">
              <span>
                <Sun size={15} /> A little room for big problems.
              </span>
              <span>Choose an object to explore</span>
            </div>
          </section>
        ) : (
          <section className="work-reading" aria-label="Selected projects">
            <h2>Selected work</h2>
            <ProjectList show={show} />
          </section>
        )}
        <div className="under-scene">
          <p>
            I design directly in code.
            <br />
            Ideas become something you can actually try.
          </p>
          <button onClick={(e) => show("about", e)}>
            The person behind the work <ArrowRight size={17} />
          </button>
        </div>
      </main>
      <footer>
        <a href="/">
          <ArrowLeft size={14} /> Original portfolio
        </a>
        <span>Thoufik Abdullah</span>
        <a href="mailto:thoufikabdullah3360@gmail.com">
          Email <ArrowUpRight size={14} />
        </a>
      </footer>
      <Dialog.Root
        open={!!open}
        onOpenChange={(v) => {
          if (!v) setOpen(null);
        }}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="overlay" />
          <Dialog.Content
            className="sheet"
            onCloseAutoFocus={(e) => {
              e.preventDefault();
              restore.current?.focus();
            }}
          >
            <Dialog.Close className="close" aria-label="Close panel">
              <X size={22} />
            </Dialog.Close>
            <p className="sheet-context">From the studio</p>
            <Dialog.Title>{stories[open]?.title}</Dialog.Title>
            <Dialog.Description>{stories[open]?.intro}</Dialog.Description>
            {open === "work" && <ProjectList show={show} />}
            {open === "play" && (
              <div className="experiment">
                <p>Pick something to give your attention.</p>
                <div className="task-tabs">
                  {["An idea", "A detail", "A rough edge"].map((t, i) => (
                    <button
                      key={t}
                      aria-pressed={i === active}
                      onClick={() => {
                        setActive(i);
                        setDone(false);
                      }}
                    >
                      {t}
                    </button>
                  ))}
                </div>
                <div className="task-paper">
                  <span>
                    {done
                      ? "Made a little progress."
                      : [
                          "Make the idea tangible.",
                          "Get the detail right.",
                          "Make it easier to use.",
                        ][active]}
                  </span>
                  <button
                    aria-label="Mark experiment task complete"
                    onClick={() => setDone(!done)}
                    aria-pressed={done}
                  >
                    <Check size={22} />
                  </button>
                </div>
                <p role="status">
                  {done
                    ? "Task complete. Pick another when you’re ready."
                    : "A portfolio experiment in choice and feedback."}
                </p>
              </div>
            )}
            {open === "about" && (
              <>
                <div className="about-note">
                  <h3>Eight modules. One shared foundation.</h3>
                  <p>
                    Doctor CDS, nursing, reception, pharmacy, dialysis, lab,
                    HRMS and management. My attention goes to the connections
                    between them, the decisions people need to make, and a
                    system that can keep growing.
                  </p>
                  <h3>From exploration to interface.</h3>
                  <p>
                    I use a design system and a variant playground with Codex to
                    explore and refine the product. Earlier work includes SAP AI
                    and an edtech project.
                  </p>
                </div>
                <a
                  className="email-link"
                  href="mailto:thoufikabdullah3360@gmail.com"
                >
                  Let’s talk <ArrowUpRight size={18} />
                </a>
              </>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
function ProjectList() {
  return (
    <div className="project-list">
      {[
        [
          "ZyephrOS",
          "A shared foundation for hospital workflows",
          "Eight modules · Sole product designer",
          "An operating system for hospitals and clinics, starting with nephrology. I’m connecting role-based workflows and building the design system behind them.",
          "zyephr",
        ],
        [
          "Aceteroid",
          "Working with intelligence inside enterprise software",
          "AI product",
          "Explore the product architecture, selected interface work and design trade-offs.",
          "sap",
        ],
        [
          "Airtribe",
          "Making room for learning",
          "Learning product",
          "Explore the product architecture, selected interface work and design trade-offs.",
          "edtech",
        ],
      ].map(([title, subtitle, meta, description, key]) => (
        <details key={key} className={`project-summary ${key}`}>
          <summary>
            <span className="project-symbol" aria-hidden="true">
              {key === "zyephr" ? "+" : key === "sap" ? "ai" : "Aa"}
            </span>
            <span>
              <strong>{title}</strong>
              <span>{subtitle}</span>
              <small>{meta}</small>
            </span>
            <span className="expand" aria-hidden="true">
              +
            </span>
          </summary>
          <div className="project-detail">
            <p>{description}</p>
            <a
              className="case-study-link"
              href={`/case-studies/?project=${key === "edtech" ? "learning" : key}`}
            >
              Read the full case study <ArrowUpRight size={16} />
            </a>
            {key === "zyephr" && (
              <>
                <h3>Inside the case study</h3>
                <p>
                  How shared patterns support different roles, how review and
                  handoff states communicate responsibility, and how a
                  code-based design process supports iteration across modules.
                </p>
                <p className="content-note">
                  Confidential work. The story uses abstracted interfaces and
                  selected prototype behaviour. Measured outcomes are
                  distinguished from the design outputs.
                </p>
              </>
            )}
          </div>
        </details>
      ))}
    </div>
  );
}

createRoot(document.getElementById("root")).render(<Studio />);
