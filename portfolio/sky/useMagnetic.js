import { useEffect } from "react";
import { useMotionValue, useSpring } from "motion/react";

export default function useMagnetic(ref, reduced) {
  const x = useMotionValue(0), y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 240, damping: 24 });
  const springY = useSpring(y, { stiffness: 240, damping: 24 });
  useEffect(() => {
    const fine = window.matchMedia("(any-hover: hover) and (any-pointer: fine)");
    const reset = () => { x.set(0); y.set(0); };
    if (reduced || !fine.matches) { reset(); return; }
    const move = event => {
      if (!ref.current || event.pointerType === "touch") return;
      const rect = ref.current.getBoundingClientRect();
      const dx = event.clientX - (rect.left + rect.width / 2);
      const dy = event.clientY - (rect.top + rect.height / 2);
      const distance = Math.hypot(dx, dy);
      const pull = Math.max(0, 1 - distance / 120) * .4;
      x.set(Math.max(-12, Math.min(12, dx * pull)));
      y.set(Math.max(-12, Math.min(12, dy * pull)));
    };
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("blur", reset);
    document.addEventListener("pointerleave", reset);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("blur", reset);
      document.removeEventListener("pointerleave", reset);
      reset();
    };
  }, [ref, reduced, x, y, springX, springY]);
  return { x: springX, y: springY };
}
