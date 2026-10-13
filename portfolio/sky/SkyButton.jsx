import React from "react";

// Uses the existing sky-pill glass, focus and pointer feedback rules.
export default function SkyButton({ href, className = "", children, ...props }) {
  const Tag = href ? "a" : "button";
  return <Tag {...(!href ? { type: "button" } : { href })} {...props} className={`sky-pill ${className}`.trim()}>{children}</Tag>;
}
