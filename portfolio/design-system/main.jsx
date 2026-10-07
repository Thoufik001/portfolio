import React from "react";
import { ArrowLeft } from "../components/ui/Icon";
import { createRoot } from "react-dom/client";
import "../styles/base.css";
import "./style.css";
function Foundation() {
  const [dark, setDark] = React.useState(false);
  return (
    <main className="foundation">
      <header>
        <a href="/">
          <ArrowLeft size={16} /> Portfolio
        </a>
        <button
          onClick={() => {
            const next = !dark;
            setDark(next);
            document.documentElement.dataset.theme = next ? "dark" : "light";
          }}
        >
          {dark ? "Light" : "Dark"} appearance
        </button>
      </header>
      <h1 className="type-case-title">
        One foundation.
        <br />
        Room for personality.
      </h1>
      <p className="type-lead">
        Geist, clear hierarchy, quiet surfaces, useful motion.
      </p>
      <section>
        <h2>Typography</h2>
        <div className="foundation-types">
          {[
            ["Display", "type-display"],
            ["Case title", "type-case-title"],
            ["Section", "type-section"],
            ["Project title", "type-title"],
            ["Lead paragraph", "type-lead"],
            ["Body paragraph", "type-body"],
            ["Navigation and controls", "type-label"],
            ["Caption and attribution", "type-caption"],
          ].map(([label, role]) => (
            <div key={role}>
              <span className="type-caption">{role}</span>
              <p className={role}>{label}</p>
            </div>
          ))}
        </div>
      </section>
      <section>
        <h2>Reading</h2>
        <p className="foundation-prose">
          I design directly in code, moving between the structure of a product
          and the details that make it feel coherent. A shared foundation gives
          every page the same rhythm, while leaving the work itself room to be
          different.
        </p>
      </section>
      <section>
        <h2>Color roles</h2>
        <div className="foundation-colors">
          {[
            "page",
            "surface",
            "card",
            "text",
            "text-secondary",
            "accent",
            "accent-soft",
          ].map((role) => (
            <div key={role}>
              <div
                style={{ background: `var(--color-${role})` }}
                className="swatch"
              />
              <p className="type-caption">{role}</p>
            </div>
          ))}
        </div>
      </section>
      <section>
        <h2>Compact navigation</h2>
        <nav className="foundation-index" aria-label="Example index">
          {[
            "Overview",
            "The problem",
            "The approach",
            "Building it",
            "Impact",
            "Takeaways",
          ].map((label, i) => (
            <a
              key={label}
              href="#"
              aria-current={i === 0 ? "location" : undefined}
            >
              {label}
            </a>
          ))}
        </nav>
      </section>
    </main>
  );
}
createRoot(document.getElementById("root")).render(<Foundation />);
