"use client";

import { useEffect } from "react";
import { Sym } from "@/components/app/AppChrome";
import { useVisualizerStore } from "@/lib/stores/useVisualizerStore";
import { useI18n } from "@/lib/i18n";

const BASE_INTERVAL_MS = 900;
const SPEEDS = [0.5, 1, 2];

const copy = {
  vi: { step: "Bước", of: "/", speed: "Tốc độ" },
  en: { step: "Step", of: "/", speed: "Speed" },
} as const;

export function StepPlayer() {
  const { locale } = useI18n();
  const c = copy[locale];
  const { frames, step, playing, speed, next, prev, goto, setPlaying, setSpeed } =
    useVisualizerStore();

  const last = frames.length - 1;
  const atStart = step <= 0;
  const atEnd = step >= last;

  // Playback loop: advance one frame per tick while playing.
  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => next(), BASE_INTERVAL_MS / speed);
    return () => clearInterval(id);
  }, [playing, speed, next]);

  if (frames.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-1">
        <PlayerButton label="prev" disabled={atStart} onClick={prev} icon="skip_previous" />
        {playing ? (
          <PlayerButton label="pause" onClick={() => setPlaying(false)} icon="pause" primary />
        ) : (
          <PlayerButton
            label="play"
            disabled={atEnd}
            onClick={() => {
              if (atEnd) return;
              setPlaying(true);
            }}
            icon="play_arrow"
            primary
          />
        )}
        <PlayerButton label="next" disabled={atEnd} onClick={next} icon="skip_next" />
      </div>

      <span className="font-label-mono text-label-mono text-on-surface-variant whitespace-nowrap">
        {c.step} {step + 1} {c.of} {frames.length}
      </span>

      <input
        type="range"
        min={0}
        max={last}
        value={step}
        onChange={(e) => goto(Number(e.target.value))}
        aria-label={c.step}
        className="h-1 flex-1 min-w-32 cursor-pointer accent-primary"
      />

      <div className="flex items-center gap-1">
        {SPEEDS.map((s) => (
          <button
            key={s}
            onClick={() => setSpeed(s)}
            aria-pressed={speed === s}
            className={`rounded-md px-2 py-1 font-label-mono text-[11px] transition-colors ${
              speed === s ? "bg-primary text-on-primary" : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            {s}x
          </button>
        ))}
      </div>
    </div>
  );
}

function PlayerButton({
  label,
  icon,
  onClick,
  disabled,
  primary,
}: {
  label: string;
  icon: string;
  onClick: () => void;
  disabled?: boolean;
  primary?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors disabled:opacity-40 ${
        primary
          ? "bg-primary text-on-primary hover:opacity-90 disabled:hover:opacity-40"
          : "border border-outline-variant/60 text-on-surface-variant hover:text-on-surface"
      }`}
    >
      <Sym name={icon} className="text-[20px]" />
    </button>
  );
}
