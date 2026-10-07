import { withSkyInk } from "./sky-ink";
import React, { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { PaperPlane } from "./PaperPlane";
import "./paper-contact.css";

import { emailDraft } from "./contact-draft";

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

export default function PaperContact({ onClose, fields, setFields }) {
  const reduced = useReducedMotion();
  const [phase, setPhase] = useState("writing");
  const [errors, setErrors] = useState({});
  const confirmation = useRef(null);
  const busy = phase === "folding" || phase === "flying";
  useEffect(() => {
    if (phase === "folding") {
      const timer = setTimeout(() => setPhase("flying"), 550);
      return () => clearTimeout(timer);
    }
    if (phase === "flying") {
      const timer = setTimeout(() => setPhase("draft"), 850);
      return () => clearTimeout(timer);
    }
    if (phase === "draft") confirmation.current?.focus({ preventScroll: true });
  }, [phase]);
  function fieldError(input) {
    if (!input.value.trim()) return "Required";
    if (input.validity.typeMismatch) return "Check email";
    if (input.validity.tooLong) return "Too long";
    return "";
  }
  function submit(event) {
    event.preventDefault();
    if (busy) return;
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
    window.location.href = emailDraft(fields);
    setPhase(reduced ? "draft" : "folding");
  }
  return withSkyInk(
    <div
      className="sky-paper-contact"
      data-phase={phase}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          event.stopPropagation();
          onClose();
        }
      }}
    >
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
            strokeWidth="1.7"
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
      <motion.form
        className="sky-contact-note"
        onSubmit={submit}
        noValidate
        onInput={(event) => {
          const input = event.target;
          if (errors[input.name])
            setErrors((current) => ({
              ...current,
              [input.name]: fieldError(input),
            }));
        }}
        aria-label="Send a message to Thoufik"
        inert={phase !== "writing"}
        aria-hidden={phase !== "writing"}
        animate={
          phase === "writing"
            ? {
                opacity: 1,
                scale: 1,
                rotate: -2,
                rotateX: 0,
                clipPath: "polygon(0% 0%,100% 0%,100% 100%,0% 100%)",
              }
            : {
                opacity: phase === "folding" ? 1 : 0,
                scale: 0.32,
                rotate: -24,
                rotateX: 48,
                clipPath: "polygon(0% 40%,100% 0%,42% 100%,34% 56%)",
              }
        }
        transition={{ duration: reduced ? 0 : 0.55, ease: [0.2, 0.7, 0.2, 1] }}
      >
        <motion.div
          className="sky-note-content"
          animate={{ opacity: phase === "writing" ? 1 : 0 }}
          transition={{ duration: reduced ? 0 : 0.15 }}
        >
          <h3>Let’s talk.</h3>
          <fieldset disabled={busy}>
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
      {!reduced && phase === "flying" && (
        <motion.div
          className="sky-contact-flight"
          aria-hidden="true"
          initial={{ x: 0, y: 0, rotate: -24, scale: 1, opacity: 1 }}
          animate={{
            x: [0, 80, 300],
            y: [0, -80, -420],
            rotate: [-24, -35, -50],
            scale: [1, 0.8, 0.3],
            opacity: [1, 1, 0],
          }}
          transition={{ duration: 0.85, ease: "easeIn" }}
        >
          <PaperPlane />
        </motion.div>
      )}
      <div
        className="sky-note-confirmation"
        aria-live="polite"
        aria-atomic="true"
      >
        {phase === "draft" && (
          <div ref={confirmation} tabIndex={-1}>
            <h3>Email draft ready.</h3>
            <p>
              Finish sending in your email app. If it didn’t open,{" "}
              <a href={emailDraft(fields)}>open your draft again</a>.
            </p>
            <button type="button" onClick={() => setPhase("writing")}>
              Edit message
            </button>
          </div>
        )}
        {busy && (
          <span className="sky-note-progress">Preparing your email draft…</span>
        )}
      </div>
    </div>,
  );
}
