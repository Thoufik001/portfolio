import React, { useRef } from 'react';
import { motion } from 'motion/react';
import { useLiquid } from './useLiquid';
import './liquid.css';

// Drop-in opt-in: removing `liquid` restores the original selection styling.
export default function LiquidGlass({ className, options, ...props }) {
  const ref = useRef(null);
  useLiquid(ref, options);
  return <motion.span {...props} ref={ref} className={className} />;
}
