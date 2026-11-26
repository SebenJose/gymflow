'use client';

import { motion } from 'motion/react';
import type { ReactNode } from 'react';

type FadeInProps = { children: ReactNode; className?: string };

const OFFSET_PX = 8;

/** Entrada suave de conteúdo; respeita `prefers-reduced-motion` pelo próprio motion. */
export function FadeIn({ children, className }: FadeInProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: OFFSET_PX }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}
