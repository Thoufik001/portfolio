import React from "react";
import { withSkyInk } from "./sky-ink";

export default function ExperienceSection({ items, placement = "about" }) {
  const titleId = `sky-${placement}-experience-title`;
  return withSkyInk(
    <section
      className={`sky-experience sky-experience--${placement}`}
      aria-labelledby={titleId}
    >
      <h2 id={titleId}>Experience</h2>
      {items.map((item) => (
        <div className="sky-experience-row" key={item.company}>
          <div>
            <h3>{item.company}</h3>
            <p>{item.role}</p>
            <p>{item.detail}</p>
          </div>
          <span>{item.dates}</span>
        </div>
      ))}
    </section>,
  );
}
