"use client";

import type { BrandFinancialMetrics } from "@/lib/brandMetrics";

interface Row {
  brandLabel: string;
  location: string;
  metrics: BrandFinancialMetrics;
}

export function ConsolidatedReporting({ rows }: { rows: Row[] }) {
  const totals = rows.reduce(
    (sum, row) => ({
      revenue: sum.revenue + row.metrics.revenue,
      labor: sum.labor + row.metrics.laborCost,
      food: sum.food + row.metrics.foodCost,
      deliveryFees: sum.deliveryFees + row.metrics.deliveryFees,
      contribution: sum.contribution + row.metrics.contributionMargin,
    }),
    { revenue: 0, labor: 0, food: 0, deliveryFees: 0, contribution: 0 }
  );

  return (
    <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100">
        <h2 className="text-sm font-semibold text-slate-900">Brand / Location Consolidated Reporting</h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Side-by-side margin, labor, food cost, delivery fees, and contribution margin.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wide">
              <th className="text-left px-4 py-2.5">Brand</th>
              <th className="text-right px-4 py-2.5">Revenue</th>
              <th className="text-right px-4 py-2.5">Labor %</th>
              <th className="text-right px-4 py-2.5">Food Cost %</th>
              <th className="text-right px-4 py-2.5">Delivery Fee %</th>
              <th className="text-right px-4 py-2.5">Contribution Margin</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.brandLabel} className="border-t border-slate-100">
                <td className="px-4 py-3">
                  <p className="font-medium text-slate-900">{row.brandLabel}</p>
                  <p className="text-[11px] text-slate-400">{row.location}</p>
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-slate-800">
                  ${row.metrics.revenue.toLocaleString()}
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-slate-800">
                  {row.metrics.laborPct.toFixed(1)}%
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-slate-800">
                  {row.metrics.foodCostPct.toFixed(1)}%
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-slate-800">
                  {row.metrics.deliveryFeePct.toFixed(1)}%
                </td>
                <td className={`px-4 py-3 text-right tabular-nums font-medium ${
                  row.metrics.contributionMargin >= 0 ? "text-emerald-700" : "text-rose-700"
                }`}>
                  ${row.metrics.contributionMargin.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                  <span className="text-[11px] text-slate-400 ml-1">
                    ({row.metrics.contributionMarginPct.toFixed(1)}%)
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-slate-200 bg-slate-50">
              <td className="px-4 py-3 text-sm font-semibold text-slate-900">Total</td>
              <td className="px-4 py-3 text-right font-semibold tabular-nums text-slate-900">
                ${totals.revenue.toLocaleString()}
              </td>
              <td className="px-4 py-3 text-right text-slate-500">
                {totals.revenue > 0 ? ((totals.labor / totals.revenue) * 100).toFixed(1) : "0.0"}%
              </td>
              <td className="px-4 py-3 text-right text-slate-500">
                {totals.revenue > 0 ? ((totals.food / totals.revenue) * 100).toFixed(1) : "0.0"}%
              </td>
              <td className="px-4 py-3 text-right text-slate-500">
                {totals.revenue > 0 ? ((totals.deliveryFees / totals.revenue) * 100).toFixed(1) : "0.0"}%
              </td>
              <td className={`px-4 py-3 text-right font-semibold tabular-nums ${
                totals.contribution >= 0 ? "text-emerald-700" : "text-rose-700"
              }`}>
                ${totals.contribution.toLocaleString("en-US", { maximumFractionDigits: 0 })}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
