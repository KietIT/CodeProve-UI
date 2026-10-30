"use client";

import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { compactVnd } from "./_api";

type Point = { label: string; value: number };

// The theme stores colours as "r g b" channels, so charts read them through rgb(var(--token)).
const token = (name: string, alpha = 1) => `rgb(var(--${name}) / ${alpha})`;
export const chartTones = ["primary", "secondary", "warning", "error", "outline"].map((name) => token(name));

const axisTick = { fontSize: 11, fill: token("on-surface-variant") };
const grid = <CartesianGrid vertical={false} strokeDasharray="3 3" stroke={token("outline-variant", 0.5)} />;

type TooltipProps = { active?: boolean; payload?: { value?: number; payload?: Point }[]; label?: string; format: (value: number) => string; tone: string };

/** The shadcn chart tooltip: a small rounded panel with a colour dot, the label and the value. */
function ChartTooltip({ active, payload, label, format, tone }: TooltipProps) {
  if (!active || !payload?.length) return null;
  const entry = payload[0];
  return <div className="grid min-w-32 gap-1.5 rounded-lg border border-outline-variant/60 bg-surface-container-lowest px-3 py-2 text-xs shadow-xl">
      <p className="font-semibold">{entry.payload?.label ?? label}</p>
      <p className="flex items-center gap-2"><span className="h-2.5 w-2.5 shrink-0 rounded-[2px]" style={{ background: tone }} /><span className="font-mono font-medium tabular-nums">{format(Number(entry.value ?? 0))}</span></p>
  </div>;
}

/** Area chart with a gradient fade, for a value over time. */
export function AreaTrend({ data, format }: { data: Point[]; format: (value: number) => string }) {
  const tone = chartTones[0];
  return <ResponsiveContainer width="100%" height={280}>
    <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
      <defs>
        <linearGradient id="revenue-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" style={{ stopColor: tone, stopOpacity: 0.45 }} />
          <stop offset="95%" style={{ stopColor: tone, stopOpacity: 0.03 }} />
        </linearGradient>
      </defs>
      {grid}
      <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} minTickGap={24} tick={axisTick} />
      <YAxis tickLine={false} axisLine={false} width={48} tick={axisTick} tickFormatter={(value: number) => compactVnd(value)} allowDecimals={false} />
      <Tooltip cursor={{ stroke: token("outline"), strokeDasharray: "3 3" }} content={<ChartTooltip format={format} tone={tone} />} />
      <Area dataKey="value" type="monotone" stroke={tone} strokeWidth={2} fill="url(#revenue-fill)" activeDot={{ r: 4 }} />
    </AreaChart>
  </ResponsiveContainer>;
}

/** Rounded vertical bars for a count over time. */
export function CountBars({ data, format }: { data: Point[]; format: (value: number) => string }) {
  const tone = chartTones[1];
  return <ResponsiveContainer width="100%" height={240}>
    <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
      {grid}
      <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} minTickGap={24} tick={axisTick} />
      <YAxis tickLine={false} axisLine={false} width={32} tick={axisTick} allowDecimals={false} />
      <Tooltip cursor={{ fill: token("surface-container-high", 0.5) }} content={<ChartTooltip format={format} tone={tone} />} />
      <Bar dataKey="value" fill={tone} radius={[4, 4, 0, 0]} maxBarSize={28} />
    </BarChart>
  </ResponsiveContainer>;
}

/** Donut with the total in the middle and a legend beside it. */
export function StatusDonut({ data, centre, caption }: { data: Point[]; centre: string; caption: string }) {
  return <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
    <div className="relative h-[200px] w-[200px] shrink-0">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Tooltip content={<ChartTooltip format={(value) => String(value)} tone="transparent" />} />
          <Pie data={data} dataKey="value" nameKey="label" innerRadius={62} outerRadius={90} paddingAngle={2} cornerRadius={4} stroke="none">
            {data.map((slice, index) => <Cell key={slice.label} fill={chartTones[index % chartTones.length]} />)}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 grid place-content-center text-center"><p className="text-3xl font-bold tabular-nums">{centre}</p><p className="text-xs text-on-surface-variant">{caption}</p></div>
    </div>
    <ul className="min-w-40 space-y-2.5 text-sm">{data.map((slice, index) => <li key={slice.label} className="flex items-center gap-2.5"><span className="h-2.5 w-2.5 shrink-0 rounded-[2px]" style={{ background: chartTones[index % chartTones.length] }} /><span className="flex-1 text-on-surface-variant">{slice.label}</span><span className="font-semibold tabular-nums">{slice.value}</span></li>)}</ul>
  </div>;
}

/** Horizontal bars ranked by value, for revenue per plan. */
export function PlanBars({ data, format }: { data: Point[]; format: (value: number) => string }) {
  const tone = chartTones[0];
  return <ResponsiveContainer width="100%" height={Math.max(120, data.length * 56)}>
    <BarChart data={data} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
      <CartesianGrid horizontal={false} strokeDasharray="3 3" stroke={token("outline-variant", 0.5)} />
      <XAxis type="number" tickLine={false} axisLine={false} tick={axisTick} tickFormatter={(value: number) => compactVnd(value)} allowDecimals={false} />
      <YAxis type="category" dataKey="label" tickLine={false} axisLine={false} width={96} tick={{ ...axisTick, fill: token("on-surface") }} />
      <Tooltip cursor={{ fill: token("surface-container-high", 0.5) }} content={<ChartTooltip format={format} tone={tone} />} />
      <Bar dataKey="value" fill={tone} radius={[0, 4, 4, 0]} maxBarSize={26} />
    </BarChart>
  </ResponsiveContainer>;
}
