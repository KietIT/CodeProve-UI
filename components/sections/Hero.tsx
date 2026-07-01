"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { HeroCanvas } from "@/components/three/HeroCanvas";
import { CircuitField } from "@/components/three/CircuitField";
import { Button } from "@/components/ui/Button";
import { useI18n } from "@/lib/i18n";

export function Hero() {
  const { t } = useI18n();
  const sectionRef = useRef<HTMLElement>(null);
  // Only animate the 3D core + circuits while the hero is on (or near) screen.
  // Once scrolled past, everything freezes so the rest of the page stays smooth.
  const [active, setActive] = useState(true);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setActive(entry.isIntersecting),
      { rootMargin: "200px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="intro"
      className="relative overflow-hidden pt-28 pb-16 sm:pt-32 lg:pt-36"
    >
      {/* backdrop */}
      <div className="bg-grid pointer-events-none absolute inset-0 -z-10" aria-hidden="true" />
      <div
        className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[480px] w-[820px] -translate-x-1/2 rounded-full opacity-60 blur-3xl"
        style={{
          background:
            "radial-gradient(closest-side, rgba(62,212,197,0.20), rgba(46,135,240,0.10) 55%, transparent 80%)",
        }}
        aria-hidden="true"
      />

      {/* Circuit field - energy traces flowing out from behind the AI sphere.
          Only mounted while the hero is on screen (perf). */}
      {active && (
        <CircuitField
          className="pointer-events-none absolute inset-0 z-0 h-full w-full"
          originX={905}
          originY={360}
          count={14}
        />
      )}

      <div className="container-site grid items-center gap-10 lg:grid-cols-2 lg:gap-6">
        {/* Copy */}
        <div className="relative z-10 max-w-xl lg:pl-8 xl:pl-14">
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.05 }}
            className="text-balance text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl lg:text-[3.4rem]"
          >
            {t.hero.titleA}{" "}
            <span className="text-gradient">{t.hero.titleB}</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.12 }}
            className="mt-6 max-w-lg text-base leading-relaxed text-muted sm:text-lg"
          >
            {t.hero.sub}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.18 }}
            className="mt-8"
          >
            <Button href="/dashboard" size="lg">
              {t.hero.ctaPrimary}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </motion.div>
        </div>

        {/* 3D core */}
        <div className="relative z-0 flex items-center justify-center lg:justify-end">
          <HeroCanvas active={active} />
        </div>
      </div>
    </section>
  );
}
