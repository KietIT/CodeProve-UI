/**
 * Page-wide ambient backdrop: slow-drifting aurora blobs + a vignette, fixed
 * behind all marketing content. Lightweight (no per-frame circuit animation) —
 * the animated circuit field lives only in the hero, where the 3D core is.
 *
 * Purely decorative — pointer-events disabled, hidden from assistive tech, and
 * frozen automatically under prefers-reduced-motion (global CSS rule).
 */
export function AmbientBackdrop() {
  return (
    <div
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      aria-hidden="true"
    >
      {/* teal — top right */}
      <div
        className="aurora-blob"
        style={{
          top: "-12%",
          right: "-8%",
          width: "46vw",
          height: "46vw",
          background: "rgba(0, 85, 255, 0.14)",
          animationDelay: "0s",
        }}
      />
      {/* blue — left */}
      <div
        className="aurora-blob"
        style={{
          top: "18%",
          left: "-12%",
          width: "42vw",
          height: "42vw",
          background: "rgba(110, 168, 255, 0.12)",
          animationDelay: "-7s",
        }}
      />
      {/* violet — bottom center */}
      <div
        className="aurora-blob"
        style={{
          bottom: "-18%",
          left: "30%",
          width: "50vw",
          height: "50vw",
          background: "rgba(58, 216, 255, 0.10)",
          animationDelay: "-13s",
        }}
      />
      {/* subtle darkening vignette so content keeps contrast (dark theme only) */}
      <div
        className="absolute inset-0 hidden dark:block"
        style={{
          background:
            "radial-gradient(120% 90% at 50% 0%, transparent 40%, rgba(16,20,21,0.5) 100%)",
        }}
      />
    </div>
  );
}
