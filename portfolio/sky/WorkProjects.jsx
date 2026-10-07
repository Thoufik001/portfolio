import React from "react";
import { withSkyInk } from "./sky-ink";
import { ArrowUpRight } from "./SkyIcons";
import { ProjectMark } from "./WorkInteractions";
import "./work-projects.css";

export default function WorkProjects({ projects, Preview }) {
  return withSkyInk(
    <div className="sky-work-projects">
      {projects.map((project, index) => (
        <article className="sky-work-project" key={project.id}>
          <a
            className="sky-project-link"
            href={`/sky/?project=${project.id}`}
            aria-label={`Explore ${project.name}${project.id === "notch" ? " concept" : " case study"}`}
          >
            <div className="sky-work-preview">
              <Preview project={project} />
            </div>
            <div className="sky-project-caption">
              <span className="sky-project-number">0{index + 1}</span>
              <span>
                <h3>{project.caseTitle || project.title || project.name}</h3>
                <small>
                  <ProjectMark name={project.name} /> {project.name}
                  {project.year ? ` · ${project.year}` : ""}
                </small>
              </span>
              <ArrowUpRight size={20} />
            </div>
          </a>
        </article>
      ))}
    </div>,
  );
}
