import React from "react";

export function PaperPlane({ className = "", ...props }) {
  return (
    <svg
      className={className}
      viewBox="0 0 160 100"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <path d="M8 44 151 9 66 91 57 58Z" fill="#e9edf5" />
      <path d="M8 44 151 9 57 58Z" fill="#fffdf8" />
      <path d="M57 58 151 9 66 91Z" fill="#d6ddeb" />
      <path d="M57 58 151 9 82 61 66 91Z" fill="#f5f3ff" />
      <path
        d="m57 58 9 33M57 58 151 9"
        fill="none"
        stroke="#aebbd0"
        strokeWidth="1"
      />
    </svg>
  );
}

