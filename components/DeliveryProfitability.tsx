"use client";

import type { DeliveryPlatformData, Transaction } from "@/lib/mockData";
import { computeDeliveryProfitability } from "@/lib/brandMetrics";

interface Props {
  platforms: DeliveryPlatformData[];
  transactions: Transaction[];
  brandName: string;
}

export function DeliveryProfitability({ platforms, transactions, brandName }: Props) {
  const rows = computeDeliveryProfitability(platforms, transactions);

  return (
    <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100">
        <h2 className="text-sm font-semibold text-slate-900">Delivery Profitability Module</h2>
        <p className="text-xs text-slate-400 mt-0.5">
          {brandName} · true margin per order after commission, promos, refunds, packaging, and COGS.
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wide">
              <th className="text-left px-4 py-2.5">Platform</th>
              <th className="text-right px-4 py-2.5">Gross</th>
              <th className="text-right px-4 py-2.5">Commission</th>
              <th className="text-right px-4 py-2.5">Promos</th>
              <th className="text-right px-4 py-2.5">Refunds</th>
              <th className="text-right px-4 py-2.5">Packaging</th>
              <th className="text-right px-4 py-2.5">COGS</th>
              <th className="text-right px-4 py-2.5">True Margin / Order</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.platform} className="border-t border-slate-100">
                <td className="px-4 py-3 font-medium text-slate-900">
                  {row.platform}
                  <p className="text-[11px] text-slate-400">{row.orders} orders</p>
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-slate-800">${row.grossSales.toLocaleString()}</td>
                <td className="px-4 py-3 text-right tabular-nums text-rose-700">-${row.commission.toLocaleString("en-US", { maximumFractionDigits: 0 })}</td>
                <td className="px-4 py-3 text-right tabular-nums text-rose-700">-${row.promos.toLocaleString("en-US", { maximumFractionDigits: 0 })}</td>
                <td className="px-4 py-3 text-right tabular-nums text-rose-700">-${row.refunds.toLocaleString("en-US", { maximumFractionDigits: 0 })}</td>
                <td className="px-4 py-3 text-right tabular-nums text-rose-700">-${row.packaging.toLocaleString("en-US", { maximumFractionDigits: 0 })}</td>
                <td className="px-4 py-3 text-right tabular-nums text-rose-700">-${row.cogs.toLocaleString("en-US", { maximumFractionDigits: 0 })}</td>
                <td className={`px-4 py-3 text-right tabular-nums font-medium ${row.marginPerOrder >= 0 ? "text-emerald-700" : "text-rose-700"}`}>
                  ${row.marginPerOrder.toFixed(2)}
                  <p className="text-[11px] text-slate-400">{row.trueMarginPct.toFixed(1)}% margin</p>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
