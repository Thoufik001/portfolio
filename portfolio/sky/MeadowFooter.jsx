import { withSkyInk } from "./sky-ink";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import SocialMark from "./SocialMark";
import { Liquid } from "liquid-gooey";
import { Plus, PenLine } from "./SkyIcons";
import "./meadow-footer.css";
import PaperContact from "./PaperContact";

// Paint glass after the opaque goo mask, so translucent fills don't weaken
// the liquid connection. The edge and shadow follow the merged silhouette.
const liquidGlassFilter = `
  <feGaussianBlur in="SourceAlpha" stdDeviation="5" result="blur" />
  <feColorMatrix in="blur" type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 18 -7" result="shape" />
  <feFlood style="flood-color:var(--sky-weather-glass)" result="tint" />
  <feComposite in="tint" in2="shape" operator="in" result="glass" />
  <feMorphology in="shape" operator="erode" radius="0.65" result="inside" />
  <feComposite in="shape" in2="inside" operator="out" result="edge" />
  <feFlood flood-color="white" flood-opacity="0.16" result="edgeTint" />
  <feComposite in="edgeTint" in2="edge" operator="in" result="border" />
  <feOffset in="shape" dy="1" result="lower" />
  <feComposite in="shape" in2="lower" operator="out" result="top" />
  <feFlood flood-color="white" flood-opacity="0.22" result="light" />
  <feComposite in="light" in2="top" operator="in" result="highlight" />
  <feMerge><feMergeNode in="glass" /><feMergeNode in="border" /><feMergeNode in="highlight" /></feMerge>`;

export default function MeadowFooter({ settings, onActivity }) {
  const [hoveredButton, setHoveredButton] = useState(null);
  const [pressedButton, setPressedButton] = useState(null);
  const [socialOpen, setSocialOpen] = useState(false);
  const returningFocus = useRef(false);
  const closeContact = useCallback(() => {
    setContactOpen(false);
    setSocialOpen(false);
    returningFocus.current = true;
    document.querySelector(".meadow-contact")?.focus({ preventScroll: true });
    returningFocus.current = false;
  }, []);
  const [messageSent, setMessageSent] = useState(false);
  const sent = useCallback(() => {
    setMessageFields({ name: "", email: "", message: "" });
    setContactOpen(false);
    setSocialOpen(false);
  }, []);
  const [contactOpen, setContactOpen] = useState(false);
  const paperRevealRef = useRef(null);
  const reduced = useReducedMotion();
  const buttonScale = (id) => reduced ? 1 : pressedButton === id ? 0.96 : hoveredButton === id ? 1.025 : 1;
  const buttonGestures = (id) => ({
    onPointerEnter: (event) => event.pointerType === "mouse" && setHoveredButton(id),
    onPointerLeave: () => { setHoveredButton(null); setPressedButton(null); },
    onPointerDown: () => setPressedButton(id),
    onPointerUp: () => setPressedButton(null),
    onPointerCancel: () => setPressedButton(null),
  });
  const [mobile, setMobile] = useState(
    () => window.matchMedia("(max-width: 560px)").matches,
  );
  useEffect(() => {
    const query = window.matchMedia("(max-width: 560px)");
    const update = () => setMobile(query.matches);
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  const [socialReady, setSocialReady] = useState(false);
  useEffect(() => {
    setSocialReady(false);
    if (!socialOpen) return;
    if (reduced) {
      setSocialReady(true);
      return;
    }
    const timer = setTimeout(() => setSocialReady(true), 580);
    return () => clearTimeout(timer);
  }, [socialOpen, reduced]);
  const [messageFields, setMessageFields] = useState({
    name: "",
    email: "",
    message: "",
  });
  const illumination =
    settings.light * (1 - settings.cloud * 0.1 - settings.rain * 0.12);
  const night = Math.max(0, Math.min(1, (0.65 - settings.light) / 0.5));
  const landscapeStyle = {
    "--meadow-brightness": 0.3 + illumination * 0.7,
    "--meadow-saturation": 0.58 + illumination * 0.42,
    "--meadow-tint": settings.glow,
    "--meadow-haze": settings.bottom,
    "--meadow-tint-opacity": 0.03 + (1 - illumination) * 0.2 + night * 0.12,
    "--paper-illumination": 0.74 + illumination * 0.26,
    "--paper-night-mix": `${night * 100}%`,
    "--paper-night-tint": night * 0.12,
    "--paper-highlight": 0.18 + illumination * 0.82,
  };
  return withSkyInk(
    <footer className="meadow-footer" id="footer" style={landscapeStyle}>
      <div
        className="meadow-contact-layout"
        data-contact-open={contactOpen && !messageSent}
      >
        <div className="meadow-closing" data-message-sent={messageSent}>
          <h2 aria-live="polite" tabIndex={-1}>
            <span className="meadow-copy-before" aria-hidden={messageSent}>
              Thanks for wandering by!
            </span>
            <span className="meadow-copy-after" aria-hidden={!messageSent}>
              I’ll write back soon!
            </span>
          </h2>
          <p>
            <span className="meadow-copy-before" aria-hidden={messageSent}>
              Have a curious idea, a complicated problem, or just something to
              say? I’d love to hear it.
            </span>
            <span className="meadow-copy-after" aria-hidden={!messageSent}>
              Thanks for your note. I’m looking forward to our conversation.
            </span>
          </p>
          <div
            className="meadow-connect"
            style={{ "--contact-width": messageSent ? "200px" : "160px" }}
            data-open={socialOpen || mobile}
            data-ready={mobile || (socialOpen && socialReady)}
            onMouseEnter={() => setSocialOpen(true)}
            onMouseLeave={(event) => {
              if (!event.currentTarget.contains(document.activeElement))
                setSocialOpen(false);
            }}
            onBlur={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget))
                setSocialOpen(false);
            }}
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                event.currentTarget
                  .querySelector("button")
                  .focus({ preventScroll: true });
                setSocialOpen(false);
                setContactOpen(false);
              }
            }}
          >
            <Liquid className="meadow-liquid-group" blur={5} contrast={18}
              fill="white" filterPadding={40} filter={liquidGlassFilter}
              shadow="0 8px 24px rgba(22,35,50,.08)">
            <Liquid.Item scale={buttonScale("contact")} transition={{ duration: reduced ? 0 : 150, ease: "ease-out" }}>
            <button
              {...buttonGestures("contact")}
              className="meadow-contact"
              data-label-expanded={mobile || socialOpen || messageSent}
              aria-label={messageSent ? "Write another note" : mobile || socialOpen ? "Write a note" : "Let’s connect"}
              aria-expanded={contactOpen}
              aria-controls="sky-contact-panel"
              onFocus={() => {
                if (!returningFocus.current) setSocialOpen(true);
              }}
              onClick={() => {
                if (contactOpen) closeContact();
                else {
                  onActivity?.("form_open", "contact");
                  setMessageSent(false);
                  setContactOpen(true);
                  setSocialOpen(true);
                }
              }}
            >
              <span className="meadow-contact-label" aria-hidden="true">
                <span className="meadow-label-connect">Let’s connect</span>
                <span className="meadow-label-note">{messageSent ? "Write another note" : "Write a note"}</span>
              </span>
              <span className="meadow-contact-icons" aria-hidden="true">
                {[false, true].map(note => (
                  <motion.span key={String(note)} initial={false}
                    animate={(mobile || socialOpen || messageSent) === note
                      ? { opacity: 1, scale: 1, filter: "blur(0px)" }
                      : { opacity: 0, scale: .25, filter: "blur(4px)" }}
                    transition={{ type: "spring", duration: reduced ? 0 : .3, bounce: 0 }}>
                    {note ? <PenLine size={18} /> : <Plus size={18} />}
                  </motion.span>
                ))}
              </span>
            </button>
            </Liquid.Item>
            <nav
              id="meadow-social-links"
              className="meadow-socials"
              aria-label="Social links"
              aria-hidden={!mobile && (!socialOpen || !socialReady)}
              inert={!mobile && (!socialOpen || !socialReady)}
            >
              {[
                [
                  "LinkedIn",
                  "https://www.linkedin.com/in/thoufikabdullah",
                  "linkedin",
                ],
                ["X", "https://x.com/ThoufikAbdullah", "x"],
                [
                  "Instagram",
                  "https://www.instagram.com/thoufikabdullah",
                  "instagram",
                ],
              ].map(([name, url, brand], i) => (
                <Liquid.Item key={brand}
                  scale={buttonScale(brand)}
                  x={socialOpen || mobile ? 0 : -82 - i * 58}
                  transition={{ duration: reduced ? 0 : 500, ease: "cubic-bezier(0.2, 0.8, 0.2, 1)" }}>
                <a
                  {...buttonGestures(brand)}
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={name}
                  title={name}
                  data-brand={brand}
                  style={{ "--social-index": i }}
                >
                  <SocialMark brand={brand} />
                </a>
                </Liquid.Item>
              ))}
            </nav>
            </Liquid>
          </div>
        </div>
        <AnimatePresence>
          {contactOpen && (
            <motion.div
              ref={paperRevealRef}
              className="meadow-paper-reveal"
              id="sky-contact-panel"
              initial={
                mobile && !reduced
                  ? {
                      height: 0,
                      marginTop: 0,
                      opacity: 0,
                      overflow: "hidden",
                    }
                  : {
                      opacity: 0,
                      y: 18,
                      scale: 0.94,
                      filter: reduced ? "none" : "blur(4px)",
                    }
              }
              animate={
                mobile && !reduced
                  ? {
                      height: "auto",
                      marginTop: 48,
                      opacity: 1,
                      overflow: "hidden",
                    }
                  : { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }
              }
              exit={
                mobile && !reduced
                  ? {
                      opacity: 0,
                      height: 0,
                      marginTop: 0,
                      overflow: "hidden",
                      transition: { duration: 0.38, ease: [0.2, 0, 0, 1] },
                    }
                  : { opacity: 0, transition: { duration: 0 } }
              }
              transition={
                mobile && !reduced
                  ? {
                      height: { duration: 0.42, ease: [0.2, 0, 0, 1] },
                      marginTop: { duration: 0.42, ease: [0.2, 0, 0, 1] },
                      opacity: { duration: 0.22, delay: 0.18 },
                    }
                  : {
                      duration: reduced ? 0 : 0.38,
                      delay: reduced ? 0 : 0.1,
                      ease: [0.2, 0.7, 0.2, 1],
                    }
              }
              onAnimationComplete={() => {
                if (mobile && contactOpen && paperRevealRef.current)
                  paperRevealRef.current.style.overflow = "visible";
              }}
            >
              {!reduced && (
                <div className="meadow-spawn-stars" aria-hidden="true">
                  {[0, 1, 2, 3, 4, 5].map((i) => (
                    <i key={i} style={{ "--star": i }} />
                  ))}
                </div>
              )}
              <PaperContact
                fields={messageFields}
                setFields={setMessageFields}
                onClose={closeContact}
                onSent={sent}
                onLaunched={() => {
                  setMessageSent(true);
                  document.querySelector(".meadow-closing h2")?.focus({ preventScroll: true });
                }}
                onFailure={() => setMessageSent(false)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div className="meadow-garden" aria-hidden="true">
        <img
          src="/sky/meadow-photographic-v2-optimized.webp"
          alt=""
          width="2172"
          height="724"
          loading="lazy"
          decoding="async"
        />
      </div>
      <div className="meadow-credit">
        <div className="meadow-credit-left">
          <span>© {new Date().getFullYear()} Thoufik Abdullah</span>
          <details className="meadow-analytics">
            <summary>Privacy &amp; analytics</summary>
            <p>
              Anonymous visits and time spent help improve this portfolio.
              No personal tracking.
            </p>
          </details>
        </div>
        <span className="meadow-weather-credit">
          Weather data by{" "}
          <a href="https://open-meteo.com/" target="_blank" rel="noreferrer">
            Open-Meteo
          </a>
          {" · "}<a href="https://aviationweather.gov/" target="_blank" rel="noreferrer" title="Nearby airport cloud observations">AWC</a>
        </span>
      </div>
    </footer>,
  );
}
