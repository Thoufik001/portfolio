import React, { useLayoutEffect, useMemo, useRef, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { AnimatePresence, LayoutGroup, motion, useReducedMotion, useSpring } from "motion/react";
import { X } from "../components/ui/Icon";
import "./archive-gallery.css";

// Adapted from React Bits Masonry's shortest-column placement and Flip Card's
// spring pointer tilt. References and license: ./vendor/gallery/LICENSE.md.
const artwork = [
  { title: "A2A Point", image: "identity-1.png", alt: "A2A Point real estate platform presentation", width: 1024, height: 576 },
  { title: "Vdat", image: "archive/work-0.webp", alt: "Vdat fashion brand identity in warm cream and terracotta", width: 1024, height: 683 },
  { title: "SecuQR", image: "identity-2-optimized.webp", alt: "SecuQR product benefits presentation", width: 1920, height: 1080 },
  { title: "Lavinora", image: "archive/work-1.webp", alt: "Lavinora identity embroidered on a burgundy hoodie", width: 1024, height: 657 },
  { title: "GCT Coimbatore", image: "deck-1-optimized.webp", alt: "Geometric illustration of Government College of Technology, Coimbatore", width: 2000, height: 1258 },
  { title: "Black hole", image: "archive/work-4.webp", alt: "Illustration of a glowing black hole above a planet", width: 1024, height: 819 },
  { title: "College identity", image: "archive/work-2.webp", alt: "College crest with green and gold details", width: 1024, height: 768 },
  { title: "Moonlit cat", image: "archive/work-5.webp", alt: "White cat watching the moon from a purple rooftop", width: 1024, height: 1024 },
  { title: "Brand in relief", image: "archive/work-3.webp", alt: "Embossed brand mark on a green case", width: 1024, height: 768 },
  { title: "Equality", image: "archive/work-7.webp", alt: "Paired posters about gender inequality and overcoming obstacles", width: 910, height: 1024 },
  { title: "ISHRAE", image: "archive/work-8.webp", alt: "Circular green ISHRAE identity with a multicolored center", width: 1024, height: 1024 },
];

const tiltSpring = { stiffness: 240, damping: 24, mass: 0.6 };

function ArtworkTile({ item, onOpen, selected, priority }) {
  const reduced = useReducedMotion();
  const rotateX = useSpring(0, tiltSpring);
  const rotateY = useSpring(0, tiltSpring);
  const scale = useSpring(1, { stiffness: 320, damping: 26 });
  const reset = () => { rotateX.set(0); rotateY.set(0); scale.set(1); };
  return (
    <button
      type="button"
      className="sky-art-tile"
      aria-label={`Enlarge ${item.title} artwork`}
      aria-haspopup="dialog"
      onClick={(event) => { reset(); onOpen(item, event.currentTarget); }}
      onPointerMove={(event) => {
        if (reduced || event.pointerType === "touch") return;
        const rect = event.currentTarget.getBoundingClientRect();
        const x = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
        const y = Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height));
        rotateX.set((0.5 - y) * 12);
        rotateY.set((x - 0.5) * 12);
        scale.set(1.025);
      }}
      onPointerLeave={reset}
      onBlur={reset}
    >
      <motion.div className="sky-art-tilt" style={reduced ? undefined : { rotateX, rotateY, scale }}>
        <motion.img
          layoutId={reduced ? undefined : `sky-art-${item.image}`}
          src={`/playground/${item.image}`}
          alt={item.alt}
          width={item.width}
          height={item.height}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          draggable={false}
          style={{ opacity: selected ? 0 : 1 }}
          transition={{ type: "spring", duration: 0.3, bounce: 0 }}
        />
      </motion.div>
    </button>
  );
}

export default function ArchiveGallery() {
  const container = useRef(null);
  const opener = useRef(null);
  const [width, setWidth] = useState(0);
  const [selected, setSelected] = useState(null);
  const reduced = useReducedMotion();
  useLayoutEffect(() => {
    const element = container.current;
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    setWidth(element.getBoundingClientRect().width);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  const { items, height } = useMemo(() => {
    const columns = width >= 800 ? 3 : width >= 480 ? 2 : 1;
    const gap = width >= 480 ? 24 : 16;
    const columnWidth = (width - gap * (columns - 1)) / columns;
    const heights = Array(columns).fill(0);
    const items = width > 0 ? artwork.map((item) => {
      const column = heights.indexOf(Math.min(...heights));
      const height = columnWidth * item.height / item.width;
      const placement = { ...item, x: column * (columnWidth + gap), y: heights[column], w: columnWidth, h: height };
      heights[column] += height + gap;
      return placement;
    }) : [];
    return { items, height: Math.max(0, ...heights) - (items.length ? gap : 0) };
  }, [width]);
  const open = (item, button) => { opener.current = button; setSelected(item); };
  return (
    <LayoutGroup id="sky-archive">
      <div ref={container} className="sky-art-gallery" role="region" aria-label="Artwork from my visual archive" style={{ height }}>
        {items.map((item, index) => (
          <motion.div key={item.image} className="sky-art-position" initial={false}
            animate={{ x: item.x, y: item.y, width: item.w, height: item.h }}
            transition={{ duration: reduced ? 0 : 0.3, ease: [0.2, 0, 0, 1] }}>
            <ArtworkTile item={item} onOpen={open} selected={selected?.image === item.image} priority={index < 3} />
          </motion.div>
        ))}
      </div>
      <Dialog.Root open={Boolean(selected)} onOpenChange={(open) => { if (!open) setSelected(null); }}>
        <AnimatePresence>
          {selected && (
            <Dialog.Portal forceMount>
              <Dialog.Overlay asChild forceMount>
                <motion.div className="sky-art-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reduced ? 0 : 0.2 }} />
              </Dialog.Overlay>
              <Dialog.Content asChild forceMount aria-describedby={undefined}
                onCloseAutoFocus={(event) => { event.preventDefault(); opener.current?.focus({ preventScroll: true }); }}>
                <motion.div className="sky-art-expanded"
                  style={{ width: `min(1000px, calc(100vw - 48px), calc(80svh * ${selected.width / selected.height}))` }}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reduced ? 0 : 0.2 }}>
                  <Dialog.Title className="sky-art-accessible-title">{selected.title} artwork</Dialog.Title>
                  <motion.img layoutId={reduced ? undefined : `sky-art-${selected.image}`}
                    src={`/playground/${selected.image}`} alt={selected.alt}
                    width={selected.width} height={selected.height}
                    transition={{ type: "spring", duration: 0.3, bounce: 0 }} />
                  <Dialog.Close className="sky-art-close" aria-label="Close artwork"><X size={18} /></Dialog.Close>
                </motion.div>
              </Dialog.Content>
            </Dialog.Portal>
          )}
        </AnimatePresence>
      </Dialog.Root>
    </LayoutGroup>
  );
}
