"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { HeroPoster } from "./HeroPoster";
import { useTheme } from "@/lib/theme";

// Lazy-load the WebGL scene so it never blocks First Contentful Paint.
const HeroScene = dynamic(
  () => import("./HeroScene").then((m) => m.HeroScene),
  { ssr: false, loading: () => <HeroPoster /> },
);

function supportsWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext("webgl") || canvas.getContext("experimental-webgl"))
    );
  } catch {
    return false;
  }
}

export function HeroCanvas({ active = true }: { active?: boolean }) {
  const { theme } = useTheme();
  // null = undecided (render poster), true = 3D, false = poster
  const [use3D, setUse3D] = useState<boolean | null>(null);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const prefersReduced = motionQuery.matches;
    setReduced(prefersReduced);

    // Treat <= 4GB as "weak" → static poster (proposal §5.3 fallback).
    const lowMemory =
      typeof (navigator as Navigator & { deviceMemory?: number }).deviceMemory ===
        "number" &&
      (navigator as Navigator & { deviceMemory?: number }).deviceMemory! <= 2;

    // Phones/tablets get the lightweight SVG poster: the WebGL scene costs ~2s+
    // of main-thread work under mobile CPU throttling (huge TBT/TTI hit) for a
    // decoration, and the hero stacks to one column below `lg` anyway.
    const wideQuery = window.matchMedia("(min-width: 1024px)");
    const decide = () => setUse3D(supportsWebGL() && !lowMemory && wideQuery.matches);
    decide();

    const onReduced = (e: MediaQueryListEvent) => setReduced(e.matches);
    motionQuery.addEventListener("change", onReduced);
    wideQuery.addEventListener("change", decide);
    return () => {
      motionQuery.removeEventListener("change", onReduced);
      wideQuery.removeEventListener("change", decide);
    };
  }, []);

  if (!use3D) return <HeroPoster />;

  return (
    <div className="relative aspect-square w-full max-w-[620px]">
      <div className="hero-glow absolute inset-0 scale-110" aria-hidden="true" />
      <div className="absolute inset-0">
        {/* Reduced-motion → frozen 3D. Off-screen → render loop paused (active=false). */}
        <HeroScene rotate={!reduced} active={active} theme={theme} />
      </div>
    </div>
  );
}
