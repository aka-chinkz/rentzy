"use client";

import { useRef, useCallback, useEffect, useId, type ReactNode } from "react";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";

interface HoverSpotlightProps {
  title: ReactNode;
  subtitle?: ReactNode;
  className?: string;
  spotlightSize?: number;
}

const VISCOUS_SPRING = { damping: 42, stiffness: 55, mass: 2.1 };

function SpotlightContent({
  title,
  subtitle,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
}) {
  return (
    <div className="spotlight-content flex flex-col items-center justify-center px-6 py-16 text-center md:px-12 md:py-24 lg:py-28">
      <div className="font-display text-6xl font-bold leading-[0.95] tracking-tight text-black md:text-8xl lg:text-[7.5rem]">
        {title}
      </div>
      {subtitle && (
        <p className="mt-6 max-w-sm text-sm leading-relaxed text-black/60 md:max-w-md md:text-base">
          {subtitle}
        </p>
      )}
    </div>
  );
}

export function HoverSpotlight({
  title,
  subtitle,
  className = "",
  spotlightSize = 130,
}: HoverSpotlightProps) {
  const filterId = useId().replace(/:/g, "");
  const containerRef = useRef<HTMLDivElement>(null);
  const spotlightX = useMotionValue(0);
  const spotlightY = useMotionValue(0);
  const smoothX = useSpring(spotlightX, VISCOUS_SPRING);
  const smoothY = useSpring(spotlightY, VISCOUS_SPRING);

  const clipPath = useMotionTemplate`circle(${spotlightSize}px at ${smoothX}px ${smoothY}px)`;
  const transformOrigin = useMotionTemplate`${smoothX}px ${smoothY}px`;
  const lensLeft = useTransform(smoothX, (x) => x - spotlightSize);
  const lensTop = useTransform(smoothY, (y) => y - spotlightSize);
  const lensDiameter = spotlightSize * 2;

  const filmMask = useMotionTemplate`radial-gradient(circle ${spotlightSize + 6}px at ${smoothX}px ${smoothY}px, transparent 0%, transparent 72%, rgba(0,0,0,0.85) 88%, black 100%)`;

  const setSpotlight = useCallback(
    (clientX: number, clientY: number) => {
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      spotlightX.set(clientX - rect.left);
      spotlightY.set(clientY - rect.top);
    },
    [spotlightX, spotlightY]
  );

  const resetToCenter = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    spotlightX.set(rect.width / 2);
    spotlightY.set(rect.height / 2);
  }, [spotlightX, spotlightY]);

  useEffect(() => {
    resetToCenter();
    window.addEventListener("resize", resetToCenter);
    return () => window.removeEventListener("resize", resetToCenter);
  }, [resetToCenter]);

  return (
    <div
      ref={containerRef}
      className={`spotlight-canvas relative overflow-hidden rounded-2xl bg-white md:rounded-3xl ${className}`}
      onMouseMove={(e) => setSpotlight(e.clientX, e.clientY)}
      onMouseLeave={resetToCenter}
      onTouchMove={(e) => {
        const touch = e.touches[0];
        if (touch) setSpotlight(touch.clientX, touch.clientY);
      }}
      onTouchEnd={resetToCenter}
    >
      <svg className="absolute h-0 w-0" aria-hidden>
        <defs>
          <filter
            id={`viscous-${filterId}`}
            x="-25%"
            y="-25%"
            width="150%"
            height="150%"
            colorInterpolationFilters="sRGB"
          >
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.035 0.055"
              numOctaves="3"
              seed="4"
              result="noise"
            />
            <feGaussianBlur in="noise" stdDeviation="1.8" result="smoothNoise" />
            <feDisplacementMap
              in="SourceGraphic"
              in2="smoothNoise"
              scale="14"
              xChannelSelector="R"
              yChannelSelector="G"
              result="displaced"
            />
            <feGaussianBlur in="displaced" stdDeviation="13" result="blurred" />
            <feColorMatrix
              in="blurred"
              type="matrix"
              values="1.15 0 0 0 -0.04
                      0 1.15 0 0 -0.04
                      0 0 1.15 0 -0.04
                      0 0 0 1 0"
            />
          </filter>
        </defs>
      </svg>

      {/* Submerged text — distorted & blurred through viscous medium */}
      <div
        className="spotlight-liquid-blur pointer-events-none"
        style={{ filter: `url(#viscous-${filterId})` }}
        aria-hidden
      >
        <SpotlightContent title={title} subtitle={subtitle} />
      </div>

      {/* Clear droplet window — magnified like light through thick gel */}
      <motion.div
        className="spotlight-lens-clear pointer-events-none absolute inset-0 z-[2]"
        style={{ clipPath, transformOrigin }}
        aria-hidden
      >
        <motion.div
          className="h-full w-full"
          style={{ scale: 1.055, transformOrigin }}
        >
          <SpotlightContent title={title} subtitle={subtitle} />
        </motion.div>
      </motion.div>

      {/* Frosted liquid film over submerged areas */}
      <motion.div
        className="spotlight-liquid-film pointer-events-none absolute inset-0 z-[3]"
        style={{
          WebkitMaskImage: filmMask,
          maskImage: filmMask,
        }}
        aria-hidden
      />

      {/* Caustic shimmer inside the droplet */}
      <motion.div
        className="spotlight-lens-caustic pointer-events-none absolute z-[4] rounded-full"
        style={{
          width: lensDiameter,
          height: lensDiameter,
          left: lensLeft,
          top: lensTop,
        }}
        aria-hidden
      />

      {/* Meniscus rim — surface tension at droplet edge */}
      <motion.div
        className="spotlight-meniscus pointer-events-none absolute z-[5] rounded-full"
        style={{
          width: lensDiameter,
          height: lensDiameter,
          left: lensLeft,
          top: lensTop,
        }}
        aria-hidden
      />
    </div>
  );
}
