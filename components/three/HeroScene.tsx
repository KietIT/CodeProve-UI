"use client";

import { Canvas } from "@react-three/fiber";
import { Sparkles, AdaptiveDpr } from "@react-three/drei";
import { FluencyCore } from "./FluencyCore";

export function HeroScene({
  rotate = true,
  active = true,
  theme = "dark",
}: {
  rotate?: boolean;
  active?: boolean;
  theme?: "light" | "dark";
}) {
  const light = theme === "light";
  return (
    <Canvas
      // Pulled back + slightly wide so the full core (rings + labelled nodes)
      // is framed with margin and never clips at the canvas edges.
      camera={{ position: [0, 0, 9.6], fov: 36 }}
      dpr={[1, 1.5]}
      // Freeze the render loop entirely when the hero is off-screen → the rest
      // of the page scrolls without the GPU drawing 60fps it can't be seen.
      frameloop={active ? "always" : "never"}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      style={{ background: "transparent" }}
    >
      <ambientLight intensity={0.65} />
      <pointLight position={[5, 5, 5]} intensity={1.3} color="#3ed4c5" />
      <pointLight position={[-5, -2, 2]} intensity={0.7} color="#6c63ff" />
      <pointLight position={[0, 3, -4]} intensity={0.6} color="#2e87f0" />
      {/* Soft front-top fill so the upper brain doesn't read as murky glass. */}
      <pointLight position={[0, 4, 6]} intensity={0.8} color="#cdeffe" />

      <FluencyCore rotate={rotate && active} speed={0.16} theme={theme} />

      <Sparkles
        count={22}
        scale={[9, 7, 4]}
        size={1.4}
        speed={rotate ? 0.25 : 0}
        // Additive sparkles vanish on white, so keep them faint + deep-blue in
        // light mode; bright cyan in dark.
        opacity={light ? 0.18 : 0.35}
        color={light ? "#2f5fd0" : "#3ed4c5"}
      />

      <AdaptiveDpr pixelated />
    </Canvas>
  );
}
