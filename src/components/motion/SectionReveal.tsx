'use client';

import { forwardRef, type ReactNode } from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import {
  homeViewport,
  sectionRevealVariants,
  staggerContainerVariants,
} from '@/lib/motion';

type SectionRevealProps = Omit<
  HTMLMotionProps<'section'>,
  'initial' | 'whileInView' | 'viewport' | 'variants'
> & {
  stagger?: boolean;
  children: ReactNode;
};

export const SectionReveal = forwardRef<HTMLElement, SectionRevealProps>(function SectionReveal(
  { stagger = false, children, ...props },
  ref,
) {
  return (
    <motion.section
      ref={ref}
      initial="hidden"
      whileInView="visible"
      viewport={homeViewport}
      variants={stagger ? staggerContainerVariants : sectionRevealVariants}
      {...props}
    >
      {children}
    </motion.section>
  );
});
