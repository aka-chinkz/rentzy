"use client";

import { useRef, useCallback, type ReactNode } from "react";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";

interface Hero3DHoverProps {
  title: ReactNode;
  highlight?: ReactNode;
  subtitle?: ReactNode;
  className?: string;
  scrollProgress?: MotionValue<number>;
}

const TILT_SPRING = { damping: 22, stiffness: 180, mass: 0.6 };

export function Hero3DHover({
  title,
  highlight,
  subtitle,
  className = "",
  scrollProgress,
}: Hero3DHoverProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const fallbackProgress = useMotionValue(0);
  const progress = scrollProgress ?? fallbackProgress;
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const smoothX = useSpring(mouseX, TILT_SPRING);
  const smoothY = useSpring(mouseY, TILT_SPRING);

  const rotateX = useTransform(smoothY, [-0.5, 0.5], [14, -14]);
  const rotateY = useTransform(smoothX, [-0.5, 0.5], [-14, 14]);

  const glareX = useTransform(smoothX, [-0.5, 0.5], [0, 100]);
  const glareY = useTransform(smoothY, [-0.5, 0.5], [0, 100]);
  const glareBg = useMotionTemplate`radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255,255,255,0.22) 0%, transparent 55%)`;

  const orb1X = useTransform(smoothX, [-0.5, 0.5], [-28, 28]);
  const orb1Y = useTransform(smoothY, [-0.5, 0.5], [-18, 18]);
  const orb2X = useTransform(smoothX, [-0.5, 0.5], [22, -22]);
  const orb2Y = useTransform(smoothY, [-0.5, 0.5], [16, -16]);

  const chip1X = useTransform(smoothX, [-0.5, 0.5], [-12, 12]);
  const chip1Y = useTransform(smoothY, [-0.5, 0.5], [-8, 8]);
  const chip2X = useTransform(smoothX, [-0.5, 0.5], [10, -10]);
  const chip2Y = useTransform(smoothY, [-0.5, 0.5], [6, -6]);

  const scrollRotateX = useTransform(progress, [0, 1], [0, 22]);
  const scrollTitleY = useTransform(progress, [0, 1], [0, -80]);
  const scrollTitleOpacity = useTransform(progress, [0, 0.55, 1], [1, 0.6, 0]);
  const scrollSubtitleOpacity = useTransform(progress, [0, 0.35, 0.7], [1, 0.4, 0]);
  const scrollOrbScale = useTransform(progress, [0, 1], [1, 1.6]);

  const combinedRotateX = useTransform(
    [rotateX, scrollRotateX],
    ([mouse, scroll]) => (mouse as number) + (scroll as number)
  );

  const handleMove = useCallback(
    (clientX: number, clientY: number) => {
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      mouseX.set((clientX - rect.left) / rect.width - 0.5);
      mouseY.set((clientY - rect.top) / rect.height - 0.5);
    },
    [mouseX, mouseY]
  );

  const handleLeave = useCallback(() => {
    mouseX.set(0);
    mouseY.set(0);
  }, [mouseX, mouseY]);

  return (
    <div
      ref={containerRef}
      className={`hero-3d-scene relative ${className}`}
      onMouseMove={(e) => handleMove(e.clientX, e.clientY)}
      onMouseLeave={handleLeave}
      onTouchMove={(e) => {
        const touch = e.touches[0];
        if (touch) handleMove(touch.clientX, touch.clientY);
      }}
      onTouchEnd={handleLeave}
    >
      <motion.div
        className="hero-3d-stage relative mx-auto w-full max-w-4xl"
        style={{ rotateX: combinedRotateX, rotateY, transformStyle: "preserve-3d" }}
      >
        {/* Deep background orbs */}
        <motion.div
          className="hero-3d-orb hero-3d-orb-violet pointer-events-none absolute -left-8 top-8 h-48 w-48 rounded-full md:h-64 md:w-64"
          style={{ x: orb1X, y: orb1Y, translateZ: -120, scale: scrollOrbScale }}
          aria-hidden
        />
        <motion.div
          className="hero-3d-orb hero-3d-orb-blue pointer-events-none absolute -right-6 bottom-12 h-40 w-40 rounded-full md:h-56 md:w-56"
          style={{ x: orb2X, y: orb2Y, translateZ: -90, scale: scrollOrbScale }}
          aria-hidden
        />

        {/* Floating depth chips */}
        <motion.div
          className="hero-3d-chip pointer-events-none absolute -left-2 top-1/4 hidden md:block"
          style={{ x: chip1X, y: chip1Y, translateZ: 60 }}
          aria-hidden
        >
          Borrow
        </motion.div>
        <motion.div
          className="hero-3d-chip pointer-events-none absolute -right-2 bottom-1/4 hidden md:block"
          style={{ x: chip2X, y: chip2Y, translateZ: 80 }}
          aria-hidden
        >
          Share
        </motion.div>

        {/* Main glass card */}
        <motion.div
          className="hero-3d-card relative overflow-hidden rounded-3xl border border-white/10 px-8 py-14 text-center md:px-14 md:py-20"
          style={{ translateZ: 0 }}
        >
          <motion.div
            className="pointer-events-none absolute inset-0"
            style={{ background: glareBg }}
            aria-hidden
          />

          <motion.div
            className="hero-3d-title-wrap relative"
            style={{
              transformStyle: "preserve-3d",
              y: scrollTitleY,
              opacity: scrollTitleOpacity,
            }}
          >
            <h1 className="hero-3d-title font-display text-4xl font-bold leading-tight tracking-tight md:text-6xl lg:text-7xl">
              {title}
              {highlight && (
                <span className="hero-3d-highlight mt-1 block bg-gradient-to-r from-violet-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  {highlight}
                </span>
              )}
            </h1>
          </motion.div>

          {subtitle && (
            <motion.p
              className="relative z-10 mx-auto mt-6 max-w-xl text-base leading-relaxed text-text-secondary md:text-lg"
              style={{ opacity: scrollSubtitleOpacity }}
            >
              {subtitle}
            </motion.p>
          )}

          <div
            className="hero-3d-edge pointer-events-none absolute inset-0 rounded-3xl"
            aria-hidden
          />
        </motion.div>
      </motion.div>
    </div>
  );
}
