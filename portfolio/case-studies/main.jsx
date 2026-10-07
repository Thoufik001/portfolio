import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { studies } from "./content";
import {
  ReviewOutput,
  HandoffOutput,
  SharedPatterns,
  Deliverables,
} from "./Outputs";
import "../styles/base.css";
import { ArrowUpRight } from "../components/ui/Icon";
import ProjectWorld from "../components/project/ProjectWorld";
import Logo from "../components/brand/Logo";
import CaseIndex from "../components/navigation/CaseIndex";
import "./study.css";
const modules = {
  Doctor: "Clinical review and consultation",
  Nursing: "Intake and assessment",
  Reception: "Appointments and operational coordination",
  Pharmacy: "Medicine and dispensing workflows",
  Dialysis: "Assessment, authorisation and treatment",
  Laboratory: "Collection, testing and release",
  HRMS: "Workforce and coverage",
  Management: "Network, operational and financial views",
};
function Scope() {
  const [role, setRole] = useState("Doctor");
  return (
    <figure className="scope-figure">
      <div className="scope-title">
        <span className="os-symbol" aria-hidden="true">
          +
        </span>
        <div>
          <strong>Different work. Shared foundations.</strong>
          <p>Choose a module to see its focus.</p>
        </div>
      </div>
      <div
        className="module-buttons"
        role="group"
        aria-label="Hospital modules"
      >
        {Object.keys(modules).map((m) => (
          <button key={m} aria-pressed={role === m} onClick={() => setRole(m)}>
            {m}
          </button>
        ))}
      </div>
      <div className="module-readout" aria-live="polite">
        <span>{role}</span>
        <strong>{modules[role]}</strong>
      </div>
      <figcaption>
        Abstracted scope map. These modules do not imply that every workflow is
        connected to live shared data.
      </figcaption>
    </figure>
  );
}
function Review() {
  const [open, setOpen] = useState(false),
    [done, setDone] = useState(false);
  return (
    <div className="review-demo">
      <div className="demo-toolbar">
        <strong>Consultation note</strong>
        <span>{done ? "Review recorded" : "Generated draft"}</span>
      </div>
      <div className="demo-note">
        <span>Presenting concern</span>
        <p>Discomfort has returned since the previous visit.</p>
        <button
          aria-expanded={open}
          aria-controls="transcript-evidence"
          onClick={() => setOpen(!open)}
        >
          {open ? "Hide" : "View"} supporting transcript
        </button>
        {open && (
          <blockquote id="transcript-evidence">
            “It has come back since my last appointment.”
            <small>Synthetic transcript excerpt</small>
          </blockquote>
        )}
      </div>
      <div className="demo-bottom">
        <span aria-live="polite">
          {done
            ? "This demonstration records a review state."
            : "Generated content remains a draft."}
        </span>
        <button onClick={() => setDone(!done)}>
          {done ? "Reset demonstration" : "Mark reviewed"}
        </button>
      </div>
    </div>
  );
}
function Handoff() {
  const [step, setStep] = useState(0);
  const states = [
    ["Assessment recorded", "Nurse", "Submit for doctor review"],
    ["Awaiting authorisation", "Doctor", "Review the assessment"],
    [
      "Authorisation recorded",
      "Treatment team",
      "Prepare the next treatment step",
    ],
  ];
  return (
    <div className="handoff-demo">
      <div className="state-track">
        {["Assessment", "Doctor review", "Treatment"].map((s, i) => (
          <button key={s} aria-pressed={step === i} onClick={() => setStep(i)}>
            <span>{i + 1}</span>
            {s}
          </button>
        ))}
      </div>
      <div className="state-detail" aria-live="polite">
        <p>{states[step][0]}</p>
        <dl>
          <div>
            <dt>Next owner</dt>
            <dd>{states[step][1]}</dd>
          </div>
          <div>
            <dt>Next action</dt>
            <dd>{states[step][2]}</dd>
          </div>
        </dl>
      </div>
      <button className="demo-reset" onClick={() => setStep((step + 1) % 3)}>
        {step === 2 ? "Restart walkthrough" : "Show next state"}
      </button>
    </div>
  );
}
function System() {
  const [active, setActive] = useState(0);
  const layers = [
    [
      "Semantic tokens",
      "Names describe a purpose: surface, text, action, status. The same role can resolve appropriately across themes.",
    ],
    [
      "Shared components",
      "Explicit variants carry appearance and interaction behaviour into reusable controls.",
    ],
    [
      "Codex instructions",
      "Existing variables and components guide implementation. Generated output still needs design review.",
    ],
    [
      "Role-specific workflows",
      "Compose the foundation around the task. Clinical workspaces and operational workbenches can differ.",
    ],
  ];
  return (
    <div className="system-demo">
      <div
        className="system-stack"
        role="group"
        aria-label="Explore implementation layers"
      >
        {layers.map(([name], i) => (
          <button
            key={name}
            aria-pressed={active === i}
            onClick={() => setActive(i)}
          >
            {name}
            <span aria-hidden="true">{active === i ? "−" : "+"}</span>
          </button>
        ))}
      </div>
      <p aria-live="polite">{layers[active][1]}</p>
    </div>
  );
}
function Layers() {
  const [active, setActive] = useState(0);
  const ls = [
    ["Executive Overview", "What needs attention?"],
    ["Risk & Strategy", "What could affect the migration?"],
    ["Dependency Intelligence", "Which parts are connected?"],
    ["Wave Planning", "How should work be sequenced?"],
    ["Migration BOM", "What work belongs in the plan?"],
  ];
  return (
    <div className="layer-demo">
      <div role="group" aria-label="Migration decision layers">
        {ls.map(([name], i) => (
          <button
            key={name}
            aria-pressed={active === i}
            onClick={() => setActive(i)}
          >
            {name}
          </button>
        ))}
      </div>
      <p aria-live="polite">{ls[active][1]}</p>
    </div>
  );
}
function Structure() {
  return (
    <div className="structure-demo">
      {[
        ["Hero", "Heading, description, calls to action"],
        ["Program overview", "Duration, cohort date, learning outcomes"],
        ["Curriculum", "Phases, topics and tags"],
        ["Mentors", "Repeatable profiles"],
      ].map(([name, fields]) => (
        <div key={name}>
          <strong>{name}</strong>
          <span aria-hidden="true">↔</span>
          <p>{fields}</p>
        </div>
      ))}
    </div>
  );
}
function Editor() {
  const [heading, setHeading] = useState("A new chapter in your career"),
    [narrow, setNarrow] = useState(false);
  return (
    <div className="editor-demo">
      <div className="editor-fields">
        <label htmlFor="program-heading">Program heading</label>
        <input
          id="program-heading"
          value={heading}
          maxLength={65}
          onChange={(e) => setHeading(e.target.value)}
        />
        <p>{heading.length}/65 characters</p>
        <button aria-pressed={narrow} onClick={() => setNarrow(!narrow)}>
          {narrow ? "Use wide preview" : "Use narrow preview"}
        </button>
        <small>Layout and type remain fixed.</small>
      </div>
      <div className={`editor-output ${narrow ? "narrow" : ""}`}>
        <span>Program preview</span>
        <h3>{heading || "Your heading appears here"}</h3>
        <p>Live sessions. Practical work. A cohort to learn with.</p>
        <span className="preview-cta">Explore the program</span>
      </div>
    </div>
  );
}
const demos = {
  review: Review,
  handoff: Handoff,
  system: System,
  layers: Layers,
  structure: Structure,
  editor: Editor,
};
function Study() {
  const raw = new URLSearchParams(location.search).get("project");
  const key = studies[raw] ? raw : "zyephr";
  const s = studies[key];
  const [dark, setDark] = useState(
    document.documentElement.dataset.theme === "dark",
  );
  useEffect(() => {
    document.title = `${s.name} — Product design by Thoufik Abdullah`;
  }, [s]);
  const links = [
    ["overview", "Overview"],
    ["context", "The problem"],
    [s.chapters[0].id, "The approach"],
    [s.chapters[Math.min(2, s.chapters.length - 1)].id, "Building it"],
    ["outcome", "Impact"],
    ["reflection", "Takeaways"],
  ];
  return (
    <div className="case-site">
      <a className="skip-link" href="#case-content">
        Skip to case study
      </a>
      <header className="case-header">
        <a href="/" className="case-wordmark">
          <Logo size={28} /> Thoufik.
        </a>
        <nav aria-label="Case studies">
          {Object.entries(studies).map(([id, p]) => (
            <a
              key={id}
              href={`?project=${id}`}
              aria-current={key === id ? "page" : undefined}
            >
              {p.name}
            </a>
          ))}
        </nav>
        <button
          className="case-theme"
          aria-label={`Switch to ${dark ? "light" : "dark"} mode`}
          onClick={() => {
            const next = !dark;
            setDark(next);
            document.documentElement.dataset.theme = next ? "dark" : "light";
            try {
              localStorage.setItem("thoufik-theme", next ? "dark" : "light");
            } catch {}
          }}
        >
          {dark ? "Light" : "Dark"}
        </button>
      </header>
      <main id="case-content">
        <div className="case-layout">
          <CaseIndex links={links} />
          <article className="case-article">
            <section className="case-hero" id="overview">
              <p className="case-category">
                {s.name} / {s.subtitle}
              </p>
              <h1>
                {s.title.split("\n").map((line, i) => (
                  <React.Fragment key={line}>
                    {i > 0 && (
                      <>
                        {" "}
                        <br />
                      </>
                    )}
                    {line}
                  </React.Fragment>
                ))}
              </h1>
              <p className="case-intro">{s.intro}</p>
              <dl className="case-facts">
                {[
                  ["My role", s.role],
                  ["Scope", s.scope],
                  ["Stage", s.stage],
                  ["Time", s.period],
                ].map(([name, value]) => (
                  <div key={name}>
                    <dt>{name}</dt>
                    <dd>{value}</dd>
                  </div>
                ))}
              </dl>
              <ProjectWorld project={key} className="project-world--case">
                {key === "zyephr" ? (
                  <Scope />
                ) : (
                  <figure className="project-figure">
                    <img
                      src={s.image}
                      alt={s.alt}
                      width={key === "sap" ? 1919 : 1790}
                      height={key === "sap" ? 1315 : 1332}
                      fetchPriority="high"
                    />
                    <figcaption>
                      Existing public portfolio image. Sample figures and
                      content are not measured project outcomes.
                    </figcaption>
                  </figure>
                )}
              </ProjectWorld>
            </section>

            <div className="case-takeaway">
              <p>{s.takeaway}</p>
            </div>
            <section id="context" className="case-chapter">
              <h2>{s.problem}</h2>
              <p>{s.context}</p>
              <p>{s.constraint}</p>
            </section>
            {s.chapters.map((c) => {
              const Demo = demos[c.demo];
              return (
                <section className="case-chapter" id={c.id} key={c.id}>
                  <h2>{c.title}</h2>
                  <p className="chapter-lead">{c.lead}</p>
                  <p>{c.body}</p>
                  {key === "zyephr" && c.id === "review" && <ReviewOutput />}
                  {key === "zyephr" && c.id === "handoff" && <HandoffOutput />}
                  {key === "zyephr" && c.id === "system" && <SharedPatterns />}
                  {Demo &&
                    !(
                      key === "zyephr" &&
                      ["review", "handoff", "system"].includes(c.id)
                    ) && (
                      <figure className="decision-figure">
                        <Demo />
                        <figcaption>{c.caption}</figcaption>
                      </figure>
                    )}
                  <p>{c.consequence}</p>
                  <div className="case-tradeoff">
                    <h3>The trade-off</h3>
                    <p>{c.tradeoff}</p>
                  </div>
                  {!Demo && c.caption && (
                    <p className="case-note">{c.caption}</p>
                  )}
                </section>
              );
            })}
            <section className="case-chapter" id="outcome">
              <h2>What exists. What still needs evidence.</h2>
              <p>{s.outcome}</p>
              <Deliverables project={key} />
              <div className="case-limit">
                <h3>Where the evidence stops</h3>
                <p>{s.limit}</p>
              </div>
              <h3 className="measure-title">The next questions to test</h3>
              <dl className="measure-list">
                {s.measures.map(([label, question]) => (
                  <div key={label}>
                    <dt>{label}</dt>
                    <dd>{question}</dd>
                  </div>
                ))}
              </dl>
            </section>
            <section className="case-chapter" id="reflection">
              <h2>The next thing I’d improve.</h2>
              <p>{s.reflection}</p>
              <details className="source-note">
                <summary>About the evidence in this story</summary>
                <p>{s.source}</p>
                <p>
                  The alternatives discussed as trade-offs are not presented as
                  rejected explorations unless the earlier source documents that
                  choice. Illustrative portfolio interactions are labelled
                  separately from original product evidence.
                </p>
              </details>
            </section>
          </article>
        </div>
        <section className="next-studies">
          <h2>Different problems. The same attention.</h2>
          {Object.entries(studies)
            .filter(([id]) => id !== key)
            .map(([id, p]) => (
              <a key={id} href={`?project=${id}`}>
                <span>{p.name}</span>
                <strong>{p.title.replace("\n", " ")}</strong>
                <ArrowUpRight size={18} />
              </a>
            ))}
        </section>
      </main>
      <footer className="case-footer">
        <p>Thoufik Abdullah / Product designer, working in code.</p>
        <a href="mailto:thoufikabdullah3360@gmail.com">
          Let’s talk about the work <ArrowUpRight size={16} />
        </a>
      </footer>
    </div>
  );
}
createRoot(document.getElementById("root")).render(<Study />);
