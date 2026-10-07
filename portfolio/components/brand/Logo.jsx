import React from "react";
export const LOGO_PATH =
  "M78.052 136.718V119.699C78.052 112.955 83.5188 107.489 90.2625 107.489H126.882C132.266 107.489 136.63 103.124 136.63 97.7405C136.63 92.3567 132.266 87.9924 126.882 87.9924H48.7481C43.3644 87.9924 39 83.628 39 78.2443C39 72.8606 43.3644 68.4962 48.7481 68.4962H146.408C151.792 68.4962 156.156 64.1318 156.156 58.7481C156.156 53.3644 151.792 49 146.408 49H109.789C103.045 49 97.578 54.4668 97.578 61.2105V136.718C97.578 142.11 93.2069 146.481 87.815 146.481C82.423 146.481 78.052 142.11 78.052 136.718Z";
export default function Logo({ size = 32, className, ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="30 30 135 135"
      fill="none"
      className={className}
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <path d={LOGO_PATH} stroke="currentColor" strokeWidth="5.39494" />
    </svg>
  );
}
