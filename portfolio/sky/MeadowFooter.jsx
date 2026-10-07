import { withSkyInk } from "./sky-ink";
import React, { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import SocialMark from "./SocialMark";
import LiquidSocials from "./LiquidSocials";
import { ArrowUpRight } from "./SkyIcons";
import "./meadow-footer.css";
import PaperContact from "./PaperContact";

export default function MeadowFooter({ settings }) {
  const [socialOpen, setSocialOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const reduced = useReducedMotion();
  const [socialReady, setSocialReady] = useState(false);
  useEffect(() => {
    setSocialReady(false);
    if (!socialOpen) return;
    if (reduced) {
      setSocialReady(true);
      return;
    }
    // Logo starts as the droplet settles; the last blur resolves at 580ms.
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
      <div className="meadow-contact-layout" data-contact-open={contactOpen}>
        <div className="meadow-closing">
          <h2>Thanks for wandering by.</h2>
          <p>
            Have a curious idea, a complicated problem, or just something to
            say? I’d love to hear it.
          </p>
          <div
            className="meadow-connect"
            data-open={socialOpen}
            data-ready={socialOpen && socialReady}
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
            <LiquidSocials open={socialOpen} />
            <button
              className="meadow-contact"
              aria-expanded={contactOpen}
              aria-controls="sky-contact-panel"
              onFocus={() => setSocialOpen(true)}
              onClick={() => {
                setContactOpen(!contactOpen);
                setSocialOpen(true);
              }}
            >
              Connect with me <ArrowUpRight size={18} />
            </button>
            <nav
              id="meadow-social-links"
              className="meadow-socials"
              aria-label="Social links"
              aria-hidden={!socialOpen || !socialReady}
              inert={!socialOpen || !socialReady}
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
                <a
                  key={brand}
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
              ))}
            </nav>
          </div>
        </div>
        <AnimatePresence>
          {contactOpen && (
            <motion.div
              className="meadow-paper-reveal"
              id="sky-contact-panel"
              initial={{
                opacity: 0,
                y: 28,
                scale: 0.88,
                filter: reduced ? "none" : "blur(18px)",
              }}
              animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
              exit={{
                opacity: 0,
                y: -12,
                scale: 0.94,
                filter: reduced ? "none" : "blur(12px)",
              }}
              transition={{
                duration: reduced ? 0 : 0.6,
                ease: [0.2, 0.7, 0.2, 1],
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
                onClose={() => {
                  setContactOpen(false);
                  document
                    .querySelector(".meadow-contact")
                    ?.focus({ preventScroll: true });
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div className="meadow-garden" aria-hidden="true">
        <img
          src="/sky/meadow-photographic-v2.webp"
          alt=""
          width="2172"
          height="724"
          loading="lazy"
          decoding="async"
        />
      </div>
      <div className="meadow-credit">
        © {new Date().getFullYear()} Thoufik Abdullah
        <span className="meadow-weather-credit">
          Weather data by{" "}
          <a href="https://open-meteo.com/" target="_blank" rel="noreferrer">
            Open-Meteo
          </a>
        </span>
      </div>
    </footer>,
  );
}
