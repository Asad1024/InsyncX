'use client';

import { type ReactNode } from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { staggerItemVariants } from '@/lib/motion';

type RevealItemProps = Omit<HTMLMotionProps<'div'>, 'variants' | 'initial'> & {
  children: ReactNode;
};

export function RevealItem({ children, ...props }: RevealItemProps) {
  return (
    <motion.div variants={staggerItemVariants} {...props}>
      {children}
    </motion.div>
  );
}
