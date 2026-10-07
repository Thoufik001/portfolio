import { withSkyInk } from "./sky-ink";
import React, { useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { MotionConfig, useReducedMotion } from "motion/react";
import Logo from "../components/brand/Logo";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Check,
  Moon,
  Sun,
} from "./SkyIcons";
import {
  PaletteStudy,
  RevealStudy,
  TaskStudy,
  ToolbarStudy,
} from "../components/playground/Interactions";
import { studies } from "../case-studies/content";
import { Positioning, StoryNote, ProjectMark } from "./WorkInteractions";
import Sky from "./Sky";
import MeadowFooter from "./MeadowFooter";
import ProgressiveBlur from "./ProgressiveBlur";
import SkyNavigation from "./SkyNavigation";
import WorkProjects from "./WorkProjects";
import ExperienceSection from "./ExperienceSection";
import SkyControls from "./WeatherControls";
import useVisitorLocation from "./useVisitorLocation";
import { useWeather, liveAtmosphere, weatherAtHour } from "./weather";
import "../styles/base.css";
import "./style.css";
const projects = [
  {
    id: "zyephr",
    name: "ZyephrOS",
    title: "Care is connected. Its software should be, too.",
    description:
      "A hospital OS across eight roles, with a design system that lets one designer keep building.",
    category: "Clinical AI / Enterprise software",
    role: "Solo product designer",
    year: "2026",
  },
  {
    id: "sap",
    name: "Aceteroid",
    title: "A complex migration. A clearer decision.",
    description:
      "Helping teams navigate SAP migration through connected views of risk, dependencies and planning.",
    category: "Enterprise AI",
    role: "Product designer",
    image: "/work/aceteroid.png",
  },
  {
    id: "learning",
    name: "Airtribe",
    title: "Give a small team more room to build.",
    description:
      "An editing workspace that brings program pages, reusable sections and publishing into one place.",
    category: "Education / Internal tools",
    role: "Product designer",
    image: "/work/airtribe.png",
  },
  {
    id: "notch",
    name: "NotchPark",
    category: "Window utility · Independent concept",
    image: "/project-worlds/notchpark-pixel.jpg",
  },
];
const workProjects = [projects[0], projects[2], projects[1], projects[3]];
workProjects.forEach((project) => {
  project.caseTitle =
    studies[project.id]?.title.replace(/\n/g, " ") ||
    "A home for windows around the notch";
});
const experience = [
  {
    company: "Zyephr",
    role: "Product Designer",
    dates: "Jun 2026 — Present",
    detail: "Clinical workflows and a shared design system for ZyephrOS.",
  },
  {
    company: "ERPROOTS",
    role: "Product Designer",
    dates: "Jan 2024 — May 2026",
    detail: "Enterprise AI and SAP modernization through Aceteroid.",
  },
  {
    company: "SecuQR India",
    role: "Design & Strategy · Part-time",
    dates: "Aug 2024 — Aug 2025",
    detail: "QR verification, onboarding and brand analytics.",
  },
  {
    company: "Independent",
    role: "Freelance Product & Brand Designer",
    dates: "May 2020 — Present",
    detail: "Brand identities, websites and interactive experiences.",
  },
  {
    company: "Kollywood Designer",
    role: "UI/UX Design Intern",
    dates: "Aug — Dec 2022",
    detail: "Navigation, product discovery and checkout for a fashion brand.",
  },
];
function ClinicalPreview() {
  return (
    <div
      className="sky-clinical"
      aria-label="Reconstructed hospital workspace with synthetic content"
    >
      <aside>
        <ProjectMark name="ZyephrOS" />
        <span>Overview</span>
        <strong>Worklist</strong>
        <span>Patients</span>
        <span>Sessions</span>
        <span>Team</span>
      </aside>
      <div className="clinical-main">
        <div className="clinical-top">
          Dialysis workspace <span>Branch A</span>
        </div>
        <div className="clinical-heading">
          <div>
            <small>Today’s worklist</small>
            <h3>Care, in the right order.</h3>
          </div>
          <span className="clinical-avatar">A</span>
        </div>
        <div className="clinical-metrics">
          <div>
            <small>Scheduled</small>
            <strong>12</strong>
          </div>
          <div>
            <small>In progress</small>
            <strong>4</strong>
          </div>
          <div>
            <small>Needs review</small>
            <strong>2</strong>
          </div>
        </div>
        <div className="clinical-row table-head">
          <span>Session</span>
          <span>Current state</span>
          <span>Next owner</span>
        </div>
        {[
          ["Patient A", "Assessment recorded", "Doctor"],
          ["Patient B", "Treatment in progress", "Nurse"],
          ["Patient C", "Ready for assessment", "Nurse"],
        ].map(([name, state, owner]) => (
          <div className="clinical-row" key={name}>
            <span>
              <i />
              {name}
              <small>Illustrative session</small>
            </span>
            <span className="clinical-state">{state}</span>
            <span>{owner}</span>
          </div>
        ))}
        <div className="clinical-note">
          <span>
            <Check size={14} /> The next responsible role stays visible.
          </span>
          <span>
            View session <ArrowRight size={14} />
          </span>
        </div>
      </div>
    </div>
  );
}
function Preview({ project }) {
  if (project.id === "notch")
    return (
      <div
        className="sky-notch-preview"
        aria-label="NotchPark concept illustration"
      >
        <img src={project.image} alt="" loading="lazy" />
        <div className="sky-notch-shelf">
          <span>NotchPark</span>
          <small>Parked windows</small>
          <div>
            <span>Notes</span>
            <span>Browser</span>
          </div>
        </div>
        <small className="sky-notch-label">
          Independent concept · Interface illustration
        </small>
      </div>
    );
  return project.image ? (
    <img
      className="sky-product-image"
      src={project.image}
      alt={`${project.name} product interface from the visual archive`}
      loading="lazy"
    />
  ) : (
    <ClinicalPreview />
  );
}
function Home({ view, navigate }) {
  return withSkyInk(
    <div className="sky-work" id="work">
      <section className="sky-intro" aria-labelledby="sky-intro-title">
        <Logo size={48} className="sky-hero-logo" />
        <h1 id="sky-intro-title">Hi, I’m Thoufik.</h1>
        <Positioning />
        <div className="sky-story">
          <p>
            I design complex products until they feel simple. I use{" "}
            <StoryNote kind="ai">AI</StoryNote> to prototype
            <br className="sky-ideas-break" /> ideas quickly, then obsess over
            the interactions and small details that make the product feel right
            and a joy to use.
          </p>
          <p>
            Right now at{" "}
            <a
              className="sky-inline-brand sky-clinical-link"
              href="/sky/?project=zyephr"
              aria-label="ZyephrOS — Clinical AI OS case study"
            >
              <ProjectMark name="ZyephrOS" />
              <span className="sky-clinical-name" aria-hidden="true">
                <span>ZyephrOS</span>
              </span>
              <span className="sky-clinical-hint" aria-hidden="true">
                <span>
                  Clinical AI OS <ArrowUpRight size={16} />
                </span>
              </span>
            </a>
            , I’m designing for trust in AI where critical decisions shape both
            patient care and hospital operations.
          </p>
        </div>
        <div className="sky-story-links">
          <SkyNavigation view={view} navigate={navigate} />
        </div>
      </section>
      <div
        id="sky-tab-panel"
        role="tabpanel"
        aria-labelledby={`sky-tab-${view}`}
        tabIndex={0}
      >
        {view === "work" ? <Work /> : view === "play" ? <Play /> : <About />}
      </div>
    </div>,
  );
}
function Work() {
  return withSkyInk(
    <>
      <section
        className="sky-selected-work"
        id="selected-work"
        aria-labelledby="sky-work-title"
      >
        <header className="sky-work-introduction">
          <h2 id="sky-work-title">A few things I’ve designed.</h2>
        </header>
        <WorkProjects projects={workProjects} Preview={Preview} />
      </section>
      <ExperienceSection items={experience} placement="work" />
    </>,
  );
}
const experiments = [
  ["A palette with a memory", "Pin a color. Shuffle the rest.", PaletteStudy],
  ["A window between moods", "Slide between quiet and vivid.", RevealStudy],
  ["Room to breathe", "Clear the stack, one thought at a time.", TaskStudy],
  [
    "A different lens",
    "Switch tools. Watch the same idea change.",
    ToolbarStudy,
  ],
];
function Play() {
  return withSkyInk(
    <section className="sky-play" id="play" aria-labelledby="sky-play-title">
      <div className="sky-section-intro">
        <h1 id="sky-play-title">
          A little room
          <br />
          for curiosity.
        </h1>
        <p>
          Working ideas, small interactions, and things made for the fun of it.
        </p>
      </div>
      <div className="sky-studies">
        {experiments.map(([title, text, Component]) => (
          <article key={title}>
            <div className="sky-study-scene">
              <Component />
            </div>
            <h2>{title}</h2>
            <p>{text}</p>
          </article>
        ))}
      </div>
      <p className="sky-study-credit">
        Interaction studies inspired by{" "}
        <a href="https://bencho.dev/" target="_blank" rel="noreferrer">
          Bencho
        </a>
        .
      </p>
      <div className="sky-archive">
        <h2>Another kind of storytelling.</h2>
        <p>Brand identities and presentations from my visual archive.</p>
        <div>
          {[
            ["A2A Point", "identity-1.png"],
            ["SecuQR", "identity-2.png"],
          ].map(([name, image]) => (
            <a
              key={name}
              href={`/playground/${image}`}
              target="_blank"
              rel="noreferrer"
            >
              <img
                src={`/playground/${image}`}
                alt={`${name} brand presentation`}
              />
              <span>
                {name}
                <ArrowUpRight size={16} />
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>,
  );
}
function About() {
  return withSkyInk(
    <section className="sky-about" id="about" aria-labelledby="sky-about-title">
      <div className="sky-section-intro">
        <Logo size={64} />
        <h1 id="sky-about-title">
          I like the hard problems.
          <br />
          And the small details.
        </h1>
      </div>
      <div className="sky-reading-surface">
        <p>
          I’m Thoufik, a product designer who builds in code. I use AI to
          explore possibilities quickly, then make the calls that shape the
          product.
        </p>
        <p>
          Currently, I’m the solo designer on ZyephrOS: an operating system for
          hospitals and clinics. My work spans eight role-based modules, a
          design system, and a playground for trying variants.
        </p>
        <p>
          I’ve also worked on enterprise AI and education software. Outside
          work, I make productivity tools and explore how a small interaction
          can change the feel of a whole experience.
        </p>
        <a className="sky-pill" href="mailto:thoufikabdullah3360@gmail.com">
          Let’s talk <ArrowUpRight size={18} />
        </a>
      </div>
      <ExperienceSection items={experience} />
    </section>,
  );
}
const indexSections = [
  ["overview", "Overview"],
  ["problem", "The problem"],
  ["approach", "The approach"],
  ["building", "Building it"],
  ["impact", "Impact"],
  ["takeaways", "Takeaways"],
];
function CaseStudy({ id }) {
  const study = studies[id],
    project = projects.find((p) => p.id === id);
  if (id === "notch")
    return withSkyInk(
      <main className="sky-about" id="sky-content">
        <div className="sky-section-intro">
          <p>Independent concept</p>
          <h1>NotchPark</h1>
          <p>
            A secondary window, tucked into the Mac’s notch. An exploration of
            focus and window behaviour.
          </p>
        </div>
        <div className="sky-notch-art">
          <Preview project={project} />
        </div>
        <CaseNavigation id={id} />
      </main>,
    );
  if (!study || !project) return <Work />;
  return withSkyInk(
    <main className="sky-case" id="sky-content">
      <nav className="sky-case-index" aria-label="Case study index">
        <a href="/sky/">
          <ArrowLeft size={16} />
          Index
        </a>
        {indexSections.map(([key, label]) => (
          <a key={key} href={`#${key}`}>
            {label}
          </a>
        ))}
      </nav>
      <article className="sky-case-sheet">
        <header id="overview">
          <p>
            {study.name} · {study.subtitle}
          </p>
          <h1>{study.title}</h1>
          <p className="case-intro">{study.intro}</p>
          <dl>
            <div>
              <dt>My role</dt>
              <dd>{study.role}</dd>
            </div>
            <div>
              <dt>Scope</dt>
              <dd>{study.scope}</dd>
            </div>
          </dl>
          <div className="sky-case-visual">
            <Preview project={project} />
          </div>
          {!project.image && (
            <small>
              Reconstructed interface with synthetic content. Confidential
              details withheld.
            </small>
          )}
        </header>
        <section id="problem">
          <h2>{study.problem}</h2>
          <p>{study.context}</p>
          <p>{study.constraint}</p>
        </section>
        <section id="approach">
          <h2>The decisions behind the interface.</h2>
          <p>{study.takeaway}</p>
          {study.chapters.slice(0, 2).map((chapter) => (
            <div className="sky-decision" key={chapter.id}>
              <h3>{chapter.title}</h3>
              <p>{chapter.lead}</p>
              <p>{chapter.body}</p>
              <p>{chapter.consequence}</p>
              <p className="sky-tradeoff">
                <strong>The trade-off.</strong> {chapter.tradeoff}
              </p>
            </div>
          ))}
        </section>
        <section id="building">
          <h2>Building it.</h2>
          {study.chapters.slice(2).length ? (
            study.chapters.slice(2).map((chapter) => (
              <div className="sky-decision" key={chapter.id}>
                <h3>{chapter.title}</h3>
                <p>{chapter.body}</p>
                <p>{chapter.tradeoff}</p>
                <small>{chapter.caption}</small>
              </div>
            ))
          ) : (
            <p>{study.chapters[0]?.body}</p>
          )}
        </section>
        <section id="impact">
          <h2>What the work supports.</h2>
          <p>{study.outcome}</p>
          <p>{study.limit}</p>
          {study.measures?.map(([title, text]) => (
            <div className="sky-measure" key={title}>
              <h3>{title}</h3>
              <p>{text}</p>
            </div>
          ))}
        </section>
        <section id="takeaways">
          <h2>What I’m taking forward.</h2>
          <p>{study.reflection}</p>
          <CaseNavigation id={id} />
        </section>
      </article>
    </main>,
  );
}
function CaseNavigation({ id }) {
  const index = workProjects.findIndex((item) => item.id === id);
  if (index < 0) return null;
  const next = workProjects[(index + 1) % workProjects.length];
  return withSkyInk(
    <nav className="sky-case-navigation" aria-label="Project navigation">
      <a
        className="sky-pill"
        href="/sky/#selected-work"
        aria-label="Back to selected work"
      >
        <ArrowLeft size={18} /> Back
      </a>
      <a
        className="sky-pill"
        href={`/sky/?project=${next.id}`}
        aria-label={`Next project: ${next.name}`}
      >
        Next <ArrowRight size={18} />
      </a>
    </nav>,
  );
}
function App() {
  const { region, setRegion, locationStatus, locate } = useVisitorLocation();
  const [preview, setPreview] = useState("live"),
    [previewHour, setPreviewHour] = useState(null),
    [paused, setPaused] = useState(false);
  const [view, setView] = useState(
    location.hash === "#play"
      ? "play"
      : location.hash === "#about"
        ? "about"
        : "work",
  );
  const reduced = useReducedMotion();
  const { weather, status, now, refresh } = useWeather(region);
  const resolvedRegion = useMemo(
    () => ({ ...region, zone: weather?.zone || region.zone }),
    [region, weather?.zone],
  );
  const selectedWeather = useMemo(
    () => weatherAtHour(weather, previewHour, resolvedRegion),
    [weather, previewHour, resolvedRegion],
  );
  const settings = useMemo(() => {
    const next = liveAtmosphere(
      now,
      resolvedRegion,
      selectedWeather,
      previewHour,
    );
    if (preview === "clear")
      return {
        ...next,
        cloud: 0.02,
        lowCloud: 0,
        midCloud: 0,
        highCloud: 0.04,
        rain: 0,
      };
    if (preview === "cloud")
      return {
        ...next,
        cloud: 0.8,
        lowCloud: 0.65,
        midCloud: 0.6,
        highCloud: 0.3,
        rain: 0,
      };
    if (preview === "rain")
      return {
        ...next,
        cloud: 0.94,
        lowCloud: 0.94,
        midCloud: 0.85,
        highCloud: 0.6,
        rain: 0.7,
      };
    return next;
  }, [now, resolvedRegion, selectedWeather, preview, previewHour]);
  const project = new URLSearchParams(location.search).get("project");
  const isDark = settings.light < 0.4;
  function navigate(next) {
    setView(next);
    history.replaceState(null, "", `/sky/#${next}`);
  }
  return withSkyInk(
    <div className="sky-app" data-dark={isDark}>
      <Sky settings={settings} paused={paused} reduced={reduced} />
      <a className="sky-skip" href="#sky-content">
        Skip to content
      </a>
      {project && (
        <header className="sky-header">
          <SkyNavigation view={view} project={project} navigate={navigate} />
        </header>
      )}
      {project ? (
        <CaseStudy id={project} />
      ) : (
        <main id="sky-content">
          <Home view={view} navigate={navigate} />
        </main>
      )}
      <MeadowFooter reduced={reduced} paused={paused} settings={settings} />
      <ProgressiveBlur />
      <SkyControls
        {...{
          region: resolvedRegion,
          setRegion,
          locationStatus,
          locate,
          preview,
          setPreview,
          previewHour,
          setPreviewHour,
          refresh,
          weather: selectedWeather,
          status,
          now,
          paused,
          setPaused,
          reduced,
        }}
      />
    </div>,
  );
}
createRoot(document.getElementById("root")).render(
  <MotionConfig reducedMotion="user">
    <App />
  </MotionConfig>,
);
