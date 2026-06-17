"use client";

import { useEffect, useRef } from "react";

const THREE_SCRIPT = "https://cdnjs.cloudflare.com/ajax/libs/three.js/r121/three.min.js";
const VANTA_SCRIPT = "https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.halo.min.js";

export function VantaHalo() {
  const elRef = useRef<HTMLDivElement>(null);
  const effectRef = useRef<{ destroy: () => void } | null>(null);

  useEffect(() => {
    const el = elRef.current;
    if (!el || typeof window === "undefined") return;

    let cancelled = false;

    const loadScript = (src: string): Promise<void> =>
      new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) {
          resolve();
          return;
        }
        const script = document.createElement("script");
        script.src = src;
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error(`Failed to load ${src}`));
        document.head.appendChild(script);
      });

    const init = async () => {
      try {
        await loadScript(THREE_SCRIPT);
        if (cancelled) return;
        await loadScript(VANTA_SCRIPT);
        if (cancelled || !elRef.current) return;

        const VANTA = (window as unknown as { VANTA: { HALO: (opts: Record<string, unknown>) => { destroy: () => void } } }).VANTA;
        if (!VANTA?.HALO) return;

        const effect = VANTA.HALO({
          el: elRef.current,
          mouseControls: false,
          touchControls: false,
          gyroControls: false,
          baseColor: 0x9813ae,
          color2: 0xff6d8f,
          backgroundColor: 0x000000,
          size: 1.2,
          speed: 0.5,
          ringFactor: 1.2,
          amplitudeFactor: 1.0,
          rotationFactor: 1.0,
        });
        if (!cancelled) effectRef.current = effect;
      } catch (err) {
        console.error("Vanta HALO init failed:", err);
      }
    };

    init();
    return () => {
      cancelled = true;
      if (effectRef.current?.destroy) {
        effectRef.current.destroy();
        effectRef.current = null;
      }
    };
  }, []);

  return (
    <div className="fixed inset-0 z-0 h-full w-full min-h-screen overflow-hidden">
      <div
        ref={elRef}
        className="absolute inset-0 h-full w-full bg-black blur-[20px]"
        style={{ transform: "scale(1.15)" }}
        aria-hidden
      />
      <div
        className="absolute inset-0 bg-white/[0.03]"
        aria-hidden
      />
    </div>
  );
}
