'use client';

import { useEffect, useRef, ReactNode } from 'react';
import { motion, useInView, useAnimation, Variants } from 'framer-motion';

// ─── Scroll Reveal Wrapper ────────────────────────────────────────────────────
interface RevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'scale';
  duration?: number;
  once?: boolean;
}

const directionVariants: Record<string, Variants> = {
  up: {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0 },
  },
  down: {
    hidden: { opacity: 0, y: -40 },
    visible: { opacity: 1, y: 0 },
  },
  left: {
    hidden: { opacity: 0, x: -40 },
    visible: { opacity: 1, x: 0 },
  },
  right: {
    hidden: { opacity: 0, x: 40 },
    visible: { opacity: 1, x: 0 },
  },
  scale: {
    hidden: { opacity: 0, scale: 0.88 },
    visible: { opacity: 1, scale: 1 },
  },
};

export function Reveal({
  children,
  className,
  delay = 0,
  direction = 'up',
  duration = 0.65,
  once = true,
}: RevealProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once, margin: '-10% 0px' });
  const controls = useAnimation();

  useEffect(() => {
    if (isInView) {
      controls.start('visible');
    } else if (!once) {
      controls.start('hidden');
    }
  }, [isInView, controls, once]);

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={directionVariants[direction]}
      transition={{
        duration,
        delay,
        ease: [0.16, 1, 0.3, 1], // cinematic ease
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─── Stagger Container ────────────────────────────────────────────────────────
interface StaggerProps {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
  once?: boolean;
}

export function Stagger({ children, className, staggerDelay = 0.08, once = true }: StaggerProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once, margin: '-5% 0px' });

  const containerVariants: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: 0.05,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 28, scale: 0.97 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.55,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  };

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={containerVariants}
      className={className}
    >
      {Array.isArray(children)
        ? children.map((child, i) => (
            <motion.div key={i} variants={itemVariants}>
              {child}
            </motion.div>
          ))
        : <motion.div variants={itemVariants}>{children}</motion.div>
      }
    </motion.div>
  );
}

// ─── Page Transition Wrapper ──────────────────────────────────────────────────
export function PageTransition({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{
        duration: 0.45,
        ease: [0.16, 1, 0.3, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─── Floating Orb ────────────────────────────────────────────────────────────
export function FloatingOrb({
  size = 'md',
  color = 'bg-foreground/5',
  className = '',
  speed = 'normal',
}: {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: string;
  className?: string;
  speed?: 'slow' | 'normal' | 'fast';
}) {
  const sizes = { sm: 'w-24 h-24', md: 'w-48 h-48', lg: 'w-72 h-72', xl: 'w-96 h-96' };
  const durations = { slow: 10, normal: 6, fast: 3.5 };

  return (
    <motion.div
      className={`rounded-full blur-3xl pointer-events-none ${sizes[size]} ${color} ${className}`}
      animate={{
        y: [-12, 12, -12],
        x: [-6, 6, -6],
        scale: [1, 1.05, 1],
      }}
      transition={{
        duration: durations[speed],
        ease: 'easeInOut',
        repeat: Infinity,
        repeatType: 'loop',
      }}
    />
  );
}

// ─── Count Up Animation ───────────────────────────────────────────────────────
import { useState } from 'react';

export function CountUp({ value, duration = 1.2 }: { value: number; duration?: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const end = value;
    if (start === end) return;
    const totalMilSecDur = duration * 1000;
    const incrementTime = totalMilSecDur / end;
    const timer = setInterval(() => {
      start += 1;
      setCount(start);
      if (start === end) clearInterval(timer);
    }, incrementTime);
    return () => clearInterval(timer);
  }, [isInView, value, duration]);

  return <span ref={ref} className="counter">{count}</span>;
}
