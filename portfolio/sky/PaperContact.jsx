import { withSkyInk } from "./sky-ink";
import React, { useEffect, useRef, useState } from "react";
import { animate, motion, useMotionValue, useTransform, useReducedMotion } from "motion/react";
import "./paper-contact.css";

import PaperCrumple from "./vendor/paper-crumple/PaperCrumple";
import { paperSnapshot } from "./paper-snapshot";

import { captureNote } from "./lib/capture-note";
import { createPaperFold, measureNote } from "./lib/paper-fold-tuned";

import { CONTACT_DELIVERY_ENABLED, submitContact } from "./contact-submit";
import { PAPER_THROW_DELAY, preparePaperSound, playPaperCloseSound } from "./paper-sounds";

function HandwrittenError({ id, message }) {
  return (
    <span id={id} className="sky-note-error">
      {message && (
        <>
          <span className="sky-note-error-readable">{message}</span>
          <span aria-hidden="true" key={message}>
            {Array.from(message).map((letter, index) => (
              <span
                className="sky-note-error-letter"
                key={index}
                style={{ "--letter": index }}
              >
                {letter}
              </span>
            ))}
          </span>
        </>
      )}
    </span>
  );
}

function NoteClose({ onClose }) {
  return (
    <button
        type="button"
        className="sky-note-close"
        aria-label="Close message form"
        onClick={onClose}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M5 4.5C8 8 14.5 14 19 19.5M19.5 5C15 8 9 14.5 4.5 19"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            d="M6 4.8L18.2 19M19 6L5.3 18.5"
            stroke="currentColor"
            strokeWidth=".6"
            strokeLinecap="round"
            opacity=".4"
          />
        </svg>
      </button>
  );
}

export default function PaperContact({ onClose, onSent, onLaunched, onFailure, fields, setFields }) {
  const reduced = useReducedMotion();
  const [phase, setPhase] = useState("writing");
  const [closing, setClosing] = useState(false);
  const [closePressed, setClosePressed] = useState(false);
  const prepared = useRef(null);
  const throwRoute = useRef({ x: -240, y: 260 });
  const throwProgress = useMotionValue(0);
  const throwX = useTransform(throwProgress, t => 240 * (1 - t) * t + throwRoute.current.x * t * t);
  const throwY = useTransform(throwProgress, t => -840 * (1 - t) * t + throwRoute.current.y * t * t);
  const throwScale = useTransform(throwProgress, t => Math.max(.06, 1 - .94 * (t / .9)));
  const throwRotation = useTransform(throwProgress, t => 115 * t);
  const throwOpacity = useTransform(throwProgress, t => Math.max(0, Math.min(1, (.9 - t) / .3)));
  const throwFilter = useTransform(throwProgress, t => `blur(${Math.min(1, Math.max(0, (t - .52) / .38)) * 8}px)`);
  const dismissing = useRef(false);
  const noteRef = useRef(null);
  const [snapshot, setSnapshot] = useState(null);
  const fold = useRef(null);
  const foldReady = useRef(null);
  useEffect(() => {
    let cancelled = false;
    foldReady.current = import("paper-three").then(THREE => {
      if (!cancelled) fold.current = createPaperFold(THREE, {
        speed: 1.5, zIndex: 40, creaseLines: false, skipCenterCrease: true, mergeFinalFolds: true,
        heading: -.38, angle: .14, power: 5.3, breeze: .18, verticalScale: .24,
        flightSeconds: 4.2, fadeSeconds: 1.6, flightBlur: 7, dropShadow: '',
        tilt: [.16, -.22], sideView: [.26, -.52],
        ambientIntensity: .55, keyIntensity: .42, fillIntensity: .05,
      });
      return fold.current;
    });
    return () => { cancelled = true; fold.current?.dispose(); fold.current = null; };
  }, []);
  async function dismiss() {
    if (dismissing.current) return;
    dismissing.current = true;
    request.current?.abort();
    fold.current?.cancel();
    setClosePressed(true);
    if (reduced) { onClose(); return; }
    preparePaperSound();
    const rect = noteRef.current?.getBoundingClientRect();
    if (rect) {
      throwRoute.current = {
        x: window.innerWidth * .5 - (rect.left + rect.width / 2),
        y: window.innerHeight * .7 - (rect.top + rect.height / 2),
      };
    }
    if (prepared.current?.key === snapshotKey && prepared.current.ready) {
      setClosing(true);
      return;
    }
    try {
      const image = await paperSnapshot(noteRef.current);
      if (mounted.current) {
        prepared.current = { key: snapshotKey, ready: false };
        setSnapshot(image);
      }
    } catch { if (mounted.current) setClosing(true); }
  }
  useEffect(() => {
    if (!closing) return;
    playPaperCloseSound();
    const playback = animate(throwProgress, .9, { duration: .99, delay: PAPER_THROW_DELAY, ease: "easeIn" });
    playback.then(() => { if (mounted.current) onClose(); });
    return () => playback.stop();
  }, [closing, onClose, throwProgress]);
  const [errors, setErrors] = useState({});
  const request = useRef(null);
  const mounted = useRef(true);
  const [submitError, setSubmitError] = useState("");
  const snapshotKey = JSON.stringify([fields, errors, submitError]);
  useEffect(() => {
    if (reduced || phase !== "writing" || closePressed) return;
    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        const image = await paperSnapshot(noteRef.current);
        if (cancelled || dismissing.current || !mounted.current) return;
        prepared.current = { key: snapshotKey, ready: false };
        setSnapshot(image);
      } catch { /* The close handler captures again if preparation failed. */ }
    }, prepared.current ? 500 : 750);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [snapshotKey, phase, reduced, closePressed]);
  const writing = !closing;
  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; request.current?.abort(); };
  }, []);
  const busy = phase === "waiting" || phase === "folding" || phase === "flying";
  useEffect(() => {
    if (phase === "sent") onSent?.();
  }, [phase, onSent]);
  function fieldError(input) {
    if (!CONTACT_DELIVERY_ENABLED) return "";
    if (!input.value.trim()) return "Required";
    if (input.validity.typeMismatch) return "Check email";
    if (input.name === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(input.value.trim())) return "Check email";
    if (input.validity.tooLong) return "Too long";
    return "";
  }
  async function submit(event) {
    event.preventDefault();
    if (busy || request.current) return;
    const nextErrors = {};
    for (const key of ["name", "email", "message"]) {
      const input = event.currentTarget.elements.namedItem(key);
      const error = fieldError(input);
      if (error) nextErrors[key] = error;
    }
    setErrors(nextErrors);
    const firstInvalid = Object.keys(nextErrors)[0];
    if (firstInvalid) {
      event.currentTarget.elements.namedItem(firstInvalid).focus();
      return;
    }
    const website = event.currentTarget.elements.namedItem("website").value;
    setSubmitError("");
    const controller = new AbortController();
    request.current = controller;
    const sheetHost = noteRef.current.parentElement;
    sheetHost.style.translate = getComputedStyle(sheetHost).translate;
    setPhase("waiting");
    // Start delivery before preparing the texture, and handle a fast rejection immediately.
    let failed = false;
    const delivery = submitContact({ ...fields, website }, { signal: controller.signal }).catch(error => {
      failed = true;
      fold.current?.cancel();
      if (mounted.current && !dismissing.current) {
        if (noteRef.current) noteRef.current.style.visibility = "visible";
        sheetHost.style.removeProperty("translate");
        setSubmitError(error.message);
        setPhase("writing");
        onFailure?.();
      }
    });
    try {
      const player = await foldReady.current;
      await document.fonts.ready;
      const card = noteRef.current;
      // A capture failure keeps the real note intact; never replace its texture with a repaint.
      const front = await captureNote(card);
      if (!mounted.current || dismissing.current || failed) return;
      const m = measureNote(card);
      const paperColor = getComputedStyle(card).backgroundColor;
      setPhase("folding");
      await player.play({ ...m, front, fields, paperColor, backColor: paperColor,
        onReady: () => { card.style.visibility = "hidden"; },
        onLaunch: () => { if (!failed && mounted.current) { setPhase("flying"); onLaunched?.(); } } });
      await delivery;
      if (!failed && mounted.current && !dismissing.current) setPhase("sent");
    } catch (error) {
      fold.current?.cancel();
      await delivery;
      if (mounted.current && !dismissing.current && !failed) {
        // Delivery succeeded even if WebGL or texture capture was unavailable.
        onLaunched?.(); setPhase("sent");
      }
    } finally { if (request.current === controller) request.current = null; }
  }
  return withSkyInk(
    <motion.div
      initial={false}
      style={{ x: throwX, y: throwY, scale: throwScale, rotate: throwRotation, filter: throwFilter, opacity: throwOpacity }}
      className="sky-paper-contact"
      data-phase={closing ? "crumpling" : phase}
      data-mesh={Boolean(snapshot && closing)}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          event.stopPropagation();
          dismiss();
        }
      }}
    >
      <motion.form
        ref={noteRef}
        className="sky-contact-note"
        onSubmit={submit}
        noValidate
        aria-busy={busy}
        onInput={(event) => {
          const input = event.target;
          if (errors[input.name])
            setErrors((current) => ({
              ...current,
              [input.name]: fieldError(input),
            }));
        }}
        aria-label="Send a message to Thoufik"
        inert={busy || !writing || closePressed}
        aria-hidden={phase === "folding" || phase === "flying" || !writing}
        initial={false}
        animate={{ opacity: !closing && !writing ? 0 : 1, rotate: -2, scale: closePressed && !closing ? .97 : 1 }}
        transition={{ duration: reduced ? 0 : .12 }}
      >
        <motion.div
          className="sky-note-content"
          animate={{ opacity: writing ? 1 : 0 }}
          transition={{ duration: reduced ? 0 : 0.15 }}
        >
          <NoteClose onClose={dismiss} />
          <h3>Let’s talk.</h3>
          <fieldset disabled={busy}>
            <input className="sky-note-honeypot" type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" />
            <div className="sky-note-field">
              <div className="sky-note-field-heading">
                <label htmlFor="sky-note-name">Your name</label>
                <HandwrittenError
                  id="sky-note-name-error"
                  message={errors.name}
                />
              </div>
              <input
                id="sky-note-name"
                name="name"
                aria-invalid={errors.name ? true : undefined}
                aria-describedby={
                  errors.name ? "sky-note-name-error" : undefined
                }
                autoComplete="name"
                required
                maxLength={100}
                value={fields.name}
                onChange={(event) =>
                  setFields({ ...fields, name: event.target.value })
                }
              />
            </div>
            <div className="sky-note-field">
              <div className="sky-note-field-heading">
                <label htmlFor="sky-note-email">Your email</label>
                <HandwrittenError
                  id="sky-note-email-error"
                  message={errors.email}
                />
              </div>
              <input
                id="sky-note-email"
                name="email"
                aria-invalid={errors.email ? true : undefined}
                aria-describedby={
                  errors.email ? "sky-note-email-error" : undefined
                }
                type="email"
                autoComplete="email"
                required
                maxLength={254}
                value={fields.email}
                onChange={(event) =>
                  setFields({ ...fields, email: event.target.value })
                }
              />
            </div>
            <div className="sky-note-field">
              <div className="sky-note-field-heading">
                <label htmlFor="sky-note-message">Your message</label>
                <HandwrittenError
                  id="sky-note-message-error"
                  message={errors.message}
                />
              </div>
              <textarea
                id="sky-note-message"
                name="message"
                aria-invalid={errors.message ? true : undefined}
                aria-describedby={
                  errors.message ? "sky-note-message-error" : undefined
                }
                required
                maxLength={2000}
                rows={3}
                value={fields.message}
                onChange={(event) =>
                  setFields({ ...fields, message: event.target.value })
                }
              />
            </div>
            <button className="sky-note-tape" type="submit">
              Send message
            </button>
          </fieldset>
        </motion.div>
      </motion.form>
      {snapshot && (
        <div className="sky-crumple-overlay" aria-hidden="true" inert>
          <PaperCrumple src={snapshot.src} backSrc={snapshot.src} width={snapshot.width} height={snapshot.height}
            sceneHeight={snapshot.height + 48} autoCrumple={closing} crumpleAmount={.92}
            crumpleDuration={.48} foldCount={7} detail={72} rotation={-2}
            draggable={false} shadow={false} paperColor="#fffaf0" paperTexture={.06}
            lightIntensity={1.25} ambientIntensity={1.8} lightingStrength={.18} shadowOpacity={0}
            onReady={() => {
              if (!mounted.current) return;
              if (prepared.current) prepared.current.ready = true;
              if (dismissing.current) setClosing(true);
            }}
            onError={() => {
              if (mounted.current) { setSnapshot(null); if (dismissing.current) setClosing(true); }
            }} />
        </div>
      )}
      <span className="sky-note-error-readable" role="status">{busy ? CONTACT_DELIVERY_ENABLED ? "Sending your message" : "Previewing paper animation" : submitError}</span>

    </motion.div>,
  );
}
