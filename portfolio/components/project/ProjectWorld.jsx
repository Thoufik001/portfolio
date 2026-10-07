import React from "react";
import { projectWorlds } from "../../data/projectWorlds";
import "./project-world.css";
export default function ProjectWorld({
  project,
  as: Element = "div",
  className = "",
  children,
  ...props
}) {
  const world = projectWorlds[project] || projectWorlds.zyephr;
  return (
    <Element
      {...props}
      className={`project-world ${className}`}
      data-world={project}
      style={{ "--project-world-image": `url("${world.image}")` }}
    >
      {children}
    </Element>
  );
}
