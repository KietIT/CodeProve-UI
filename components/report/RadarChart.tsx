"use client";

export type RadarAxis = { label: string; value: number | null };

/**
 * Self-drawn radar for the Fluency axes (SVG, no chart dependency). Generalised
 * to N axes. null = not applicable (drawn at the centre, label dimmed).
 * Values are percentages (0–100). Display only — no scoring here.
 */
export function RadarChart({ data, size = 320 }: { data: RadarAxis[]; size?: number }) {
  const n = data.length;
  if (n < 3) {
    return <p className="font-label-mono text-label-mono text-on-surface-variant/50">—</p>;
  }

  const cx = size / 2;
  const cy = size / 2;
  const maxR = size / 2 - 44; // leave room for labels

  const angle = (i: number) => (-90 + (360 / n) * i) * (Math.PI / 180);
  const point = (i: number, r: number) => {
    const a = angle(i);
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)] as const;
  };
  const clamp = (v: number) => Math.min(100, Math.max(0, v));

  const rings = [1, 0.66, 0.33];
  const gridPoly = (scale: number) =>
    data.map((_, i) => point(i, maxR * scale).map((x) => x.toFixed(1)).join(",")).join(" ");

  const valuePts = data.map((d, i) => point(i, (clamp(d.value ?? 0) / 100) * maxR));
  const valuePoly = valuePts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="h-auto w-full max-w-[360px]" role="img" aria-label="Fluency radar">
      {/* grid rings */}
      {rings.map((s) => (
        <polygon key={s} points={gridPoly(s)} fill="none" stroke="rgb(var(--outline-variant))" strokeWidth="1" />
      ))}
      {/* spokes */}
      {data.map((_, i) => {
        const [x, y] = point(i, maxR);
        return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="rgb(var(--outline-variant))" strokeWidth="1" />;
      })}
      {/* value polygon */}
      <polygon points={valuePoly} fill="rgb(var(--primary) / 0.18)" stroke="rgb(var(--primary))" strokeWidth="2" />
      {valuePts.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="3.5" fill="rgb(var(--primary))" />
      ))}
      {/* labels */}
      {data.map((d, i) => {
        const [x, y] = point(i, maxR + 20);
        const anchor = Math.abs(x - cx) < 8 ? "middle" : x > cx ? "start" : "end";
        return (
          <text
            key={i}
            x={x}
            y={y}
            textAnchor={anchor as "start" | "middle" | "end"}
            dominantBaseline="middle"
            className="fill-on-surface-variant font-label-mono"
            fontSize="10"
            opacity={d.value === null ? 0.45 : 1}
          >
            {d.value === null ? `${d.label} —` : d.label}
          </text>
        );
      })}
    </svg>
  );
}
