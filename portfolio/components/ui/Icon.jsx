import React from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowLeft02Icon,
  ArrowRight02Icon,
  ArrowUpRight01Icon,
  ArrowUp02Icon,
  Moon02Icon,
  Sun03Icon,
  Cancel01Icon,
  Tick01Icon,
  CommandIcon,
  Layers01Icon,
  Cursor01Icon,
  RotateLeft01Icon,
} from "@hugeicons/core-free-icons";
function makeIcon(icon) {
  return function Icon({ size = 18, weight, ...props }) {
    return (
      <HugeiconsIcon
        icon={icon}
        size={size}
        strokeWidth={1.5}
        aria-hidden="true"
        focusable="false"
        {...props}
      />
    );
  };
}
export const ArrowLeft = makeIcon(ArrowLeft02Icon);
export const ArrowRight = makeIcon(ArrowRight02Icon);
export const ArrowUpRight = makeIcon(ArrowUpRight01Icon);
export const ArrowUp = makeIcon(ArrowUp02Icon);
export const Moon = makeIcon(Moon02Icon);
export const Sun = makeIcon(Sun03Icon);
export const X = makeIcon(Cancel01Icon);
export const Check = makeIcon(Tick01Icon);
export const Command = makeIcon(CommandIcon);
export const Stack = makeIcon(Layers01Icon);
export const Cursor = makeIcon(Cursor01Icon);
export const ArrowCounterClockwise = makeIcon(RotateLeft01Icon);
