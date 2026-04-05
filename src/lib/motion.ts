import type { Transition, Variants } from 'framer-motion';

/** Stiff, low-overshoot spring for premium UI (use with `transition={{ type: 'spring', ...SPRING_PREMIUM }}`). */
export const SPRING_PREMIUM = { type: 'spring' as const, stiffness: 100, damping: 20, mass: 1 };

export const MOTION_EASE = [0.16, 1, 0.3, 1] as const;

export const MOTION_DURATION = 0.8;

export const MOTION_TRANSITION: Transition = {
  duration: MOTION_DURATION,
  ease: MOTION_EASE,
};

/** Single block: fade in */
export const sectionRevealVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: MOTION_TRANSITION,
  },
};

export const staggerContainerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.08,
    },
  },
};

export const staggerItemVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: MOTION_TRANSITION,
  },
};

export const homeViewport = {
  once: true,
  amount: 0.15 as const,
  margin: '0px 0px -72px 0px' as const,
};
