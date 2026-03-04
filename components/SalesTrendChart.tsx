"use client";

import {
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Line,
  ComposedChart,
} from "recharts";
import type { TooltipContentProps } from "recharts/types/component/Tooltip";
import type { NameType, ValueType } from "recharts/types/component/DefaultTooltipContent";
import { DAILY_SALES, type DailySales } from "@/lib/mockData";
import { linearRegression } from "@/lib/regression";

type CustomTooltipProps = Partial<TooltipContentProps<ValueType, NameType>>;

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-3 text-xs">
        <p className="font-semibold text-slate-700 mb-1.5">{label}</p>
        {payload.map((entry, index) => (
          <div key={`${entry.name ?? "series"}-${index}`} className="flex items-center gap-2 text-slate-500">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color ?? "#94a3b8" }} />
            <span>{String(entry.name ?? "Value")}:</span>
            <span className="font-semibold text-slate-800 tabular-nums">
              ${Number(entry.value).toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
}

interface Props {
  dailySales?: DailySales[];
  brandName?: string;
  isSugarWing?: boolean;
}

export function SalesTrendChart({ dailySales = DAILY_SALES, brandName = "Restaurant", isSugarWing = false }: Props) {
  const points = dailySales.map((d, i) => ({ x: i, y: d.sales }));
  const reg    = linearRegression(points);

  const chartData = dailySales.map((d, i) => ({
    date:  d.date.slice(5),
    Sales: d.sales,
    Trend: Math.round(reg.predict(i)),
  }));

  const totalSales = dailySales.reduce((s, d) => s + d.sales, 0);
  const avgDaily   = dailySales.length > 0 ? totalSales / dailySales.length : 0;
  const weeklyGrowth =
    ((dailySales.slice(-7).reduce((s, d) => s + d.sales, 0) / 7 -
      dailySales.slice(0, 7).reduce((s, d) => s + d.sales, 0) / 7) /
      (dailySales.slice(0, 7).reduce((s, d) => s + d.sales, 0) / 7 || 1)) * 100;
  const isPositive = reg.slope > 0;

  return (
    <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">30-Day Sales Trend · {brandName}</h2>
            <p className="text-xs text-slate-400 mt-0.5">Feb 1 – Mar 2, 2026 · linear regression overlay</p>
          </div>
          <div className="flex gap-8 text-right">
            <div>
              <p className="text-lg font-semibold tabular-nums text-slate-900">${totalSales.toLocaleString()}</p>
              <p className="text-[11px] text-slate-400">30-Day Revenue</p>
            </div>
            <div>
              <p className="text-lg font-semibold tabular-nums text-slate-900">${Math.round(avgDaily).toLocaleString()}</p>
              <p className="text-[11px] text-slate-400">Avg Daily</p>
            </div>
            <div>
              <p className={`text-lg font-semibold tabular-nums ${isPositive ? "text-emerald-700" : "text-rose-700"}`}>
                {weeklyGrowth > 0 ? "+" : ""}{weeklyGrowth.toFixed(1)}%
              </p>
              <p className="text-[11px] text-slate-400">Week-over-Week</p>
            </div>
          </div>
        </div>

        <div className="mt-3 flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 text-[11px] text-indigo-600 font-mono bg-indigo-50 border border-indigo-200 rounded px-2 py-1">
            R² = {reg.rSquared.toFixed(3)}
            <span className="text-indigo-300">·</span>
            {isPositive ? "+" : "−"}${Math.round(Math.abs(reg.slope)).toLocaleString()}/day
          </span>
          <span className="flex items-center gap-2 text-[11px] text-slate-400">
            <span className="inline-block w-5 border-t-2 border-indigo-500" />
            Daily sales
          </span>
          <span className="flex items-center gap-2 text-[11px] text-slate-400">
            <span className="inline-block w-5 border-t-2 border-dashed border-amber-400" />
            Trend
          </span>
        </div>
      </div>

      <div className="px-2 pt-4 pb-2">
        <ResponsiveContainer width="100%" height={260}>
          <ComposedChart data={chartData} margin={{ top: 4, right: 20, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#94a3b8" }} tickLine={false} axisLine={false} interval={4} />
            <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} tickLine={false} axisLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} domain={["auto", "auto"]} />
            <Tooltip content={<CustomTooltip />} />
            <defs>
              <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area type="monotone" dataKey="Sales" stroke="#6366f1" strokeWidth={2} fill="url(#salesGradient)" dot={false} activeDot={{ r: 4, fill: "#6366f1" }} />
            <Line  type="monotone" dataKey="Trend" stroke="#f59e0b" strokeWidth={2} strokeDasharray="5 3" dot={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="px-6 pb-4">
        <div className={`border rounded-lg px-4 py-3 ${isSugarWing ? "bg-rose-50 border-rose-200" : "bg-indigo-50 border-indigo-200"}`}>
          <p className={`text-[11px] font-semibold uppercase tracking-wide mb-1 ${isSugarWing ? "text-rose-600" : "text-indigo-600"}`}>Analysis</p>
          <p className={`text-sm ${isSugarWing ? "text-rose-900" : "text-indigo-900"}`}>
            Revenue trending <span className="font-semibold">+${Math.round(Math.abs(reg.slope)).toLocaleString()}/day</span>.
            Valentine&apos;s Day (2/14) was the period high at $18,900 (+65%).
            Week-over-week: <span className="font-semibold">{weeklyGrowth.toFixed(1)}%</span>.
            March projection: <span className="font-semibold">${Math.round(reg.predict(44) * 31).toLocaleString()}</span>.
          </p>
        </div>
      </div>
    </div>
  );
}
