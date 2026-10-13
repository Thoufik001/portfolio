import React, { useId } from "react";

export function PaperPlane({ className = "", texture, ...props }) {
  const patternId = useId();
  return (
    <svg
      className={className}
      viewBox="0 0 160 100"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {texture && <defs><pattern id={patternId} width="160" height="100" patternUnits="userSpaceOnUse"><image href={texture} width="160" height="100" preserveAspectRatio="xMidYMid slice" /></pattern></defs>}
      <path d="M8 44 151 9 66 91 57 58Z" fill={texture ? `url(#${patternId})` : "#e9edf5"} />
      <path d="M8 44 151 9 57 58Z" fill={texture ? "#fff9" : "#fffdf8"} />
      <path d="M57 58 151 9 66 91Z" fill={texture ? "#34435b36" : "#d6ddeb"} />
      <path d="M57 58 151 9 82 61 66 91Z" fill={texture ? "#fff8" : "#f5f3ff"} />
      <path
        d="m57 58 9 33M57 58 151 9"
        fill="none"
        stroke="#aebbd0"
        strokeWidth="1"
      />
    </svg>
  );
}
