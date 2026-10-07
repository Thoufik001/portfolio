import React from "react";
import { ArrowLeft } from "../ui/Icon";
import { useActiveSection } from "../../hooks/useActiveSection";
import "./case-index.css";
export default function CaseIndex({ links }) {
  const active = useActiveSection(links.map(([id]) => id));
  return (
    <aside className="case-index">
      <nav aria-label="On this page">
        <a className="case-index__return" href="/#explore">
          <ArrowLeft size={16} /> Index
        </a>
        <div className="case-index__links">
          {links.map(([id, title]) => (
            <a
              key={id}
              href={`#${id}`}
              aria-current={active === id ? "location" : undefined}
            >
              {title}
            </a>
          ))}
        </div>
      </nav>
    </aside>
  );
}
