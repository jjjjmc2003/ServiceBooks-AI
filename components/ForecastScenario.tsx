"use client";

import { useMemo, useState } from "react";
import type { DailySales, Transaction } from "@/lib/mockData";
import { averageDailySales, computeBrandFinancialMetrics } from "@/lib/brandMetrics";
import type { DeliveryPlatformData, Brand } from "@/lib/mockData";
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { TooltipContentProps } from "recharts/types/component/Tooltip";
import type { NameType, ValueType } from "recharts/types/component/DefaultTooltipContent";

interface Props {
  brand: Brand;
  brandName: string;
  transactions: Transaction[];
  dailySales: DailySales[];
  deliveryPlatforms: DeliveryPlatformData[];
}

type ForecastTooltipProps = Partial<TooltipContentProps<ValueType, NameType>>;

function ForecastTooltip({ active, payload, label }: ForecastTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-3 text-xs">
      <p className="font-semibold text-slate-700 mb-1.5">{label}</p>
      {payload.map((entry, index) => (
        <div key={`${entry.name ?? "series"}-${index}`} className="flex items-center gap-2 text-slate-500">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color ?? "#94a3b8" }} />
          <span>{String(entry.name ?? "Value")}:</span>
          <span className="font-semibold text-slate-800 tabular-nums">
            ${Number(entry.value).toLocaleString("en-US", { maximumFractionDigits: 0 })}
          </span>
        </div>
      ))}
    </div>
  );
}

export function ForecastScenario({
  brand,
  brandName,
  transactions,
  dailySales,
  deliveryPlatforms,
}: Props) {
  const [rentDeltaPct, setRentDeltaPct] = useState(8);
  const [deliveryMixDeltaPct, setDeliveryMixDeltaPct] = useState(15);

  const baseline = useMemo(
    () => computeBrandFinancialMetrics(brand, transactions, deliveryPlatforms),
    [brand, deliveryPlatforms, transactions]
  );

  const avgDaily = averageDailySales(dailySales);
  const monthlyRent = transactions
    .filter((tx) => tx.amount < 0)
    .filter((tx) => `${tx.description} ${tx.rawDescription}`.toLowerCase().includes("rent"))
    .reduce((sum, tx) => sum + Math.abs(tx.amount), 0) || 7000;

  const variableCostRatio =
    baseline.revenue > 0
      ? (baseline.foodCost + baseline.laborCost + baseline.deliveryFees) / baseline.revenue
      : 0.62;

  const horizons = [30, 60, 90].map((days) => {
    const months = days / 30;
    const revenue = avgDaily * days * (1 + (deliveryMixDeltaPct / 100) * 0.35);
    const variableCosts = revenue * variableCostRatio;
    const fixedRent = monthlyRent * months * (1 + rentDeltaPct / 100);
    const projectedCash = revenue - variableCosts - fixedRent;
    return { days, revenue, variableCosts, fixedRent, projectedCash };
  });

  const chartData = horizons.map((row) => ({
    horizon: `${row.days}d`,
    Revenue: Math.round(row.revenue),
    "Variable Costs": Math.round(row.variableCosts),
    "Projected Net Cash": Math.round(row.projectedCash),
  }));

  const net90 = horizons[horizons.length - 1]?.projectedCash ?? 0;
  const revenue90 = horizons[horizons.length - 1]?.revenue ?? 0;
  const margin90 = revenue90 > 0 ? (net90 / revenue90) * 100 : 0;

  return (
    <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Forecast + Scenario Planning</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {brandName} · 30/60/90 day projection with scenario controls.
            </p>
          </div>
          <div className="flex gap-8 text-right">
            <div>
              <p className="text-lg font-semibold tabular-nums text-slate-900">
                ${Math.round(revenue90).toLocaleString()}
              </p>
              <p className="text-[11px] text-slate-400">90-Day Revenue</p>
            </div>
            <div>
              <p className={`text-lg font-semibold tabular-nums ${net90 >= 0 ? "text-emerald-700" : "text-rose-700"}`}>
                ${Math.round(net90).toLocaleString()}
              </p>
              <p className="text-[11px] text-slate-400">90-Day Net Cash</p>
            </div>
            <div>
              <p className={`text-lg font-semibold tabular-nums ${margin90 >= 0 ? "text-emerald-700" : "text-rose-700"}`}>
                {margin90.toFixed(1)}%
              </p>
              <p className="text-[11px] text-slate-400">90-Day Net Margin</p>
            </div>
          </div>
        </div>

        <div className="mt-4 grid md:grid-cols-2 gap-4">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span>Rent increase scenario</span>
              <span>{rentDeltaPct}%</span>
            </div>
            <input
              type="range"
              min={-5}
              max={20}
              value={rentDeltaPct}
              onChange={(e) => setRentDeltaPct(Number(e.target.value))}
              className="w-full"
            />
          </div>
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span>Delivery mix increase scenario</span>
              <span>{deliveryMixDeltaPct}%</span>
            </div>
            <input
              type="range"
              min={-20}
              max={30}
              value={deliveryMixDeltaPct}
              onChange={(e) => setDeliveryMixDeltaPct(Number(e.target.value))}
              className="w-full"
            />
          </div>
        </div>
      </div>

      <div className="px-2 pt-4 pb-2 border-b border-slate-100">
        <ResponsiveContainer width="100%" height={260}>
          <ComposedChart data={chartData} margin={{ top: 4, right: 20, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="horizon" tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
            <YAxis
              tick={{ fontSize: 10, fill: "#94a3b8" }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
              domain={["auto", "auto"]}
            />
            <Tooltip content={<ForecastTooltip />} />
            <defs>
              <linearGradient id="forecastRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="Revenue"
              stroke="#2563eb"
              strokeWidth={2}
              fill="url(#forecastRevenue)"
              dot={{ r: 2 }}
            />
            <Line
              type="monotone"
              dataKey="Variable Costs"
              stroke="#f97316"
              strokeWidth={2}
              strokeDasharray="5 3"
              dot={{ r: 2 }}
            />
            <Line
              type="monotone"
              dataKey="Projected Net Cash"
              stroke="#16a34a"
              strokeWidth={2.2}
              dot={{ r: 3 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wide">
              <th className="text-left px-4 py-2.5">Horizon</th>
              <th className="text-right px-4 py-2.5">Projected Revenue</th>
              <th className="text-right px-4 py-2.5">Variable Costs</th>
              <th className="text-right px-4 py-2.5">Fixed Rent</th>
              <th className="text-right px-4 py-2.5">Projected Net Cash</th>
            </tr>
          </thead>
          <tbody>
            {horizons.map((row) => (
              <tr key={row.days} className="border-t border-slate-100">
                <td className="px-4 py-3 font-medium text-slate-900">{row.days} days</td>
                <td className="px-4 py-3 text-right tabular-nums text-slate-800">
                  ${row.revenue.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-rose-700">
                  -${row.variableCosts.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-rose-700">
                  -${row.fixedRent.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                </td>
                <td
                  className={`px-4 py-3 text-right tabular-nums font-medium ${
                    row.projectedCash >= 0 ? "text-emerald-700" : "text-rose-700"
                  }`}
                >
                  ${row.projectedCash.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
