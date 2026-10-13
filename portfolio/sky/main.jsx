import { withSkyInk } from "./sky-ink";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { AnimatePresence, MotionConfig, motion, useReducedMotion } from "motion/react";
import MetallicLogo from "./MetallicLogo";
import GradualBlur from "./GradualBlur";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Check,
  Moon,
  Sun,
} from "./SkyIcons";
import ArchiveGallery from "./ArchiveGallery";
import CaseIndex from "./CaseIndex";
import { studies } from "../case-studies/content";
import { Positioning, StoryNote, FlowingWords, ProjectMark } from "./WorkInteractions";
import Sky from "./Sky";
import AuroraCurtain from "./AuroraCurtain";
import MeadowFooter from "./MeadowFooter";
import SkyNavigation from "./SkyNavigation";
import WorkProjects from "./WorkProjects";
import IndependentStory from "./stories/IndependentStory";
import { IndependentProjects, NotchPlayground } from "./stories/IndependentProjects";
import { stories } from "./stories/content";
import "./stories/stories.css";
import ExperienceSection from "./ExperienceSection";
import SkyControls from "./WeatherControls";
import useVisitorLocation from "./useVisitorLocation";
import { recordActivity, startActivityTracking } from "../hooks/activity";
import { useWeather, liveAtmosphere, weatherAtHour } from "./weather";
import { createRainSound } from "./rain-sound";
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
    domain: "Healthcare / Clinical AI",
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
    domain: "Enterprise AI / SAP",
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
    image: "/work/airtribe-optimized.webp",
  },
  {
    id: "notch",
    name: "NotchPark",
    category: "Window utility · Independent concept",
    image: "/project-worlds/notchpark-pixel-optimized.webp",
  },
];
const workProjects = [projects[0], projects[2], projects[1]];
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
        <img src={project.image} alt="" loading="lazy" decoding="async" />
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
      loading={project.id === "learning" ? "eager" : "lazy"}
      decoding="async"
    />
  ) : (
    <ClinicalPreview />
  );
}
function Home({ view, navigate, paused, reduced }) {
  return withSkyInk(
    <div className="sky-work" id="work">
      <section className="sky-intro" aria-labelledby="sky-intro-title">
        <MetallicLogo paused={paused} />
        <h1 id="sky-intro-title">Hi, I’m Thoufik.</h1>
        <Positioning />
        <div className="sky-story">
          <p>
            I design complex products until they feel simple. I use{" "}
            <StoryNote kind="ai">AI</StoryNote>{" "}
            <FlowingWords text="to prototype ideas quickly, then obsess over the interactions and small details that make the product feel right and a joy to use." />
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
            <FlowingWords leading=", " text="I’m designing for trust in AI where critical decisions shape both patient care and hospital operations." />
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
        <AnimatePresence initial={false} mode="wait">
          <motion.div
            key={view}
            initial={reduced ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduced ? { opacity: 1, y: 0 } : { opacity: 0, y: -4 }}
            transition={{ duration: reduced ? 0 : 0.16, ease: "easeOut" }}
          >
            {view === "work" ? <Work /> : view === "play" ? <Play /> : <About />}
          </motion.div>
        </AnimatePresence>
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
        aria-label="Selected work"
      >
        <WorkProjects projects={workProjects} Preview={Preview} />
      </section>
      <IndependentProjects />
    </>,
  );
}
function Play() {
  return withSkyInk(
    <section className="sky-play sky-tab-section" id="play" aria-label="Playground artwork">
      <NotchPlayground />
      <ArchiveGallery />
    </section>,
  );
}
function About() {
  return withSkyInk(
    <section className="sky-about sky-tab-section" id="about" aria-labelledby="sky-about-title">
      <div className="sky-section-intro">
        <h1 id="sky-about-title">
          I like the hard problems. And the small details.
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
      <main className="sky-about sky-case-concept" id="sky-content">
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
      <CaseIndex sections={indexSections} />
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
  useEffect(() => startActivityTracking(), []);
  const { region, setRegion, locationStatus, locate } = useVisitorLocation();
  const [preview, setPreview] = useState("live"),
    [previewHour, setPreviewHour] = useState(null),
    [paused, setPaused] = useState(false),
    [soundOn, setSoundOn] = useState(true);
  const [soundVolume, setSoundVolume] = useState(() => {
    try { const saved = localStorage.getItem("sky-nature-volume-v2"); return saved === null ? .5 : Math.max(.1, Math.min(1, Number(saved) || .5)); }
    catch { return .5; }
  });
  const rainAudio = useRef(null);
  const [footerBlurLevel, setFooterBlurLevel] = useState(1);
  useEffect(() => {
    const paragraph = document.querySelector("#footer .meadow-closing > p");
    if (!paragraph) return undefined;
    let frame = 0;
    const update = () => {
      frame = 0;
      const viewport = window.innerHeight;
      // Fade while the footer message enters the lower viewport, before the
      // meadow image reaches the bottom blur band.
      const start = viewport * 1.02;
      const end = viewport * 0.72;
      const level = Math.max(0, Math.min(1, (paragraph.getBoundingClientRect().bottom - end) / (start - end)));
      setFooterBlurLevel((previous) =>
        level !== 0 && level !== 1 && Math.abs(previous - level) < 0.01
          ? previous
          : level,
      );
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, []);
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
    () => weatherAtHour(weather, previewHour, resolvedRegion, now),
    [weather, previewHour, resolvedRegion, now],
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
        cloud: 0.12,
        lowCloud: 0.12,
        midCloud: 0,
        highCloud: 0.04,
        rain: 0,
        aurora: Math.abs(resolvedRegion.lat) >= 65 && next.name === "Night",
      };
    if (preview === "cloud")
      return {
        ...next,
        cloud: 0.8,
        lowCloud: 0.65,
        midCloud: 0.6,
        highCloud: 0.3,
        rain: 0,
        aurora: false,
      };
    if (preview === "rain")
      return {
        ...next,
        cloud: 0.94,
        lowCloud: 0.94,
        midCloud: 0.85,
        highCloud: 0.6,
        rain: 0.7,
        aurora: false,
      };
    return next;
  }, [now, resolvedRegion, selectedWeather, preview, previewHour]);
  useEffect(() => {
    if (!soundOn) {
      rainAudio.current?.setWeather(settings, false);
      return;
    }
    if (!rainAudio.current) {
      rainAudio.current = createRainSound();
      rainAudio.current.start();
    }
    const updateVolume = () => rainAudio.current?.setWeather(settings, !paused && !document.hidden);
    const unlockAudio = () => rainAudio.current?.resume();
    updateVolume();
    document.addEventListener("visibilitychange", updateVolume);
    // Browsers may suspend autoplay until the visitor first interacts.
    window.addEventListener("pointerdown", unlockAudio, { passive: true });
    window.addEventListener("keydown", unlockAudio);
    return () => {
      document.removeEventListener("visibilitychange", updateVolume);
      window.removeEventListener("pointerdown", unlockAudio);
      window.removeEventListener("keydown", unlockAudio);
    };
  }, [soundOn, paused, settings]);
  useEffect(() => {
    rainAudio.current?.setVolume(soundVolume * 2);
    try { localStorage.setItem("sky-nature-volume-v2", String(soundVolume)); } catch {}
  }, [soundVolume, soundOn]);
  useEffect(() => () => rainAudio.current?.stop(), []);
  function toggleRainSound() {
    if (soundOn) {
      rainAudio.current?.stop();
      rainAudio.current = null;
      setSoundOn(false);
      return;
    }
    rainAudio.current = createRainSound();
    if (rainAudio.current.start()) setSoundOn(true);
  }
  const project = new URLSearchParams(location.search).get("project");
  function navigate(next) {
    setView(next);
    history.replaceState(null, "", `/sky/#${next}`);
    window.dispatchEvent(new Event("hashchange"));
  }
  const initialTheme = useRef({ "--daylight": settings.light < .4 ? 0 : 1, "--theme-blend": settings.light < .4 ? 0 : 1 });
  return withSkyInk(
    <div className="sky-app" style={initialTheme.current}>
      <Sky settings={settings} paused={paused} reduced={reduced} onLightning={() => {
        if (soundOn && !paused && !document.hidden) rainAudio.current?.thunder();
      }} />
      {settings.aurora && <AuroraCurtain paused={paused || reduced} />}
      <a className="sky-skip" href="#sky-content">
        Skip to content
      </a>
      {project ? (
        stories[project] ? <IndependentStory id={project} /> : <CaseStudy id={project} />
      ) : (
        <main id="sky-content">
          <Home view={view} navigate={navigate} paused={paused} reduced={reduced} />
        </main>
      )}
      <MeadowFooter reduced={reduced} paused={paused} settings={settings} onActivity={recordActivity} />
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
          skyRain: settings.rain,
          skyCloud: settings.cloud,
          skyAurora: settings.aurora,
          status,
          now,
          paused,
          setPaused,
          soundOn,
          soundVolume,
          setSoundVolume,
          toggleRainSound,
          reduced,
          onActivity: recordActivity,
        }}
      />
      {!stories[project] && <GradualBlur
        target="page"
        position="bottom"
        height="var(--sky-bottom-blur-height)"
        strength={1.15}
        divCount={7}
        curve="bezier"
        exponential
        opacity={1}
        layerOpacity={footerBlurLevel}
        zIndex={18}
        className="sky-bottom-blur"
      />}
    </div>,
  );
}
createRoot(document.getElementById("root")).render(
  <MotionConfig reducedMotion="user">
    <App />
  </MotionConfig>,
);
