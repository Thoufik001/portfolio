import React from "react";
import {
  ArrowLeft as Left,
  ArrowRight as Right,
  ArrowUpRight as UpRight,
  Sun as SunIcon,
  Moon as MoonIcon,
  X as Close,
  Check as Tick,
  Cloud as CloudIcon,
  CloudRain as RainIcon,
  MapPin as Pin,
  MapPinOff as PinOff,
  RotateCcw as Reset,
  ChevronDown as Chevron,
  CodeXml as CodeIcon,
  Layers as LayersIcon,
  WandSparkles as WandIcon,
  PenLine as PenIcon,
  MousePointer2 as PointerIcon,
  Pointer as HandIcon,
  Plus as PlusIcon,
  Volume2 as VolumeIcon,
} from "lucide-react";

export const Volume2 = skyIcon(VolumeIcon);

// Sky controls share a single optical stroke weight at every rendered size.
function skyIcon(Component) {
  return function SkyIcon({ size = 18, strokeWidth: _strokeWidth, ...props }) {
    return (
      <Component
        {...props}
        size={size}
        strokeWidth={1.5}
        absoluteStrokeWidth
        aria-hidden="true"
        focusable="false"
      />
    );
  };
}
export const PenLine = skyIcon(PenIcon);
export const MousePointer2 = skyIcon(PointerIcon);
export const Hand = skyIcon(HandIcon);
export const Plus = skyIcon(PlusIcon);
export const ArrowLeft = skyIcon(Left);
export const ArrowRight = skyIcon(Right);
export const ArrowUpRight = skyIcon(UpRight);
export const Sun = skyIcon(SunIcon);
export const Moon = skyIcon(MoonIcon);
export const X = skyIcon(Close);
export const Check = skyIcon(Tick);
export const Cloud = skyIcon(CloudIcon);
export const CloudRain = skyIcon(RainIcon);
export const MapPin = skyIcon(Pin);
export const MapPinOff = skyIcon(PinOff);
export const RotateCcw = skyIcon(Reset);
export const ChevronDown = skyIcon(Chevron);
export const CodeXml = skyIcon(CodeIcon);
export const Layers = skyIcon(LayersIcon);
export const WandSparkles = skyIcon(WandIcon);
export const PositioningIcon = ({ index }) => {
  const Component = [CodeXml, Layers, WandSparkles][index];
  return <Component size={20} />;
};
