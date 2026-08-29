import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { RevenueSeries } from "../types";

function formatTick(iso: string, granularity: string): string {
  const date = new Date(iso);
  if (granularity === "month") {
    return date.toLocaleDateString(undefined, { month: "short", year: "2-digit" });
  }
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function CustomTooltip({
  active,
  payload,
  granularity,
}: {
  active?: boolean;
  payload?: { value: number; payload: { periodStart: string } }[];
  granularity: string;
}) {
  if (!active || !payload || payload.length === 0) return null;
  const point = payload[0];
  return (
    <div className="border-2 border-term-amber bg-term-panel px-3 py-2 text-xs">
      <p className="text-term-green/70">{formatTick(point.payload.periodStart, granularity)}</p>
      <p className="mt-1 font-semibold text-term-green">${point.value.toFixed(2)}</p>
    </div>
  );
}

export function RevenueChart({ series }: { series: RevenueSeries }) {
  if (series.points.length === 0) {
    return <p className="mt-6 text-sm text-term-green/60">No revenue in this range.</p>;
  }

  return (
    <div className="mt-4 h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={series.points} margin={{ top: 4, right: 4, left: 4, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke="rgba(143, 254, 9, 0.12)" />
          <XAxis
            dataKey="periodStart"
            tickFormatter={(v) => formatTick(v, series.granularity)}
            tick={{ fill: "#8ffe0999", fontSize: 11, fontFamily: "IBM Plex Mono, monospace" }}
            axisLine={{ stroke: "#8ffe0933" }}
            tickLine={false}
          />
          <YAxis
            tickFormatter={(v) => `$${v}`}
            tick={{ fill: "#8ffe0999", fontSize: 11, fontFamily: "IBM Plex Mono, monospace" }}
            axisLine={{ stroke: "#8ffe0933" }}
            tickLine={false}
            width={64}
          />
          <Tooltip
            cursor={{ fill: "rgba(143, 254, 9, 0.08)" }}
            content={<CustomTooltip granularity={series.granularity} />}
          />
          <Bar dataKey="revenue" fill="#8ffe09" radius={[4, 4, 0, 0]} maxBarSize={48} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
