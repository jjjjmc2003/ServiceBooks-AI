"use client";

import { DeliveryPlatformData } from "@/lib/mockData";

interface Props {
  platforms: DeliveryPlatformData[];
  totalRevenue: number;
  brandName: string;
}

const PLATFORM_DOT: Record<string, string> = {
  DoorDash: "bg-red-500",
  UberEats: "bg-emerald-500",
  Grubhub:  "bg-rose-600",
};

export function DeliveryBreakdown({ platforms, totalRevenue, brandName }: Props) {
  const totalGross = platforms.reduce((s, p) => s + p.grossSales, 0);
  const totalNet   = platforms.reduce((s, p) => s + p.grossSales * (1 - p.commissionPct), 0);
  const totalFees  = totalGross - totalNet;
  const totalOrders = platforms.reduce((s, p) => s + p.orders, 0);
  const deliveryPct = totalRevenue > 0 ? (totalGross / totalRevenue) * 100 : 100;

  return (
    <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">Delivery Platform Analytics</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {brandName} · last 30 days ·{" "}
            <span className="font-medium text-slate-600">
              {deliveryPct.toFixed(0)}% of revenue via 3rd-party delivery
            </span>
          </p>
        </div>
        <div className="text-right">
          <p className="text-lg font-semibold tabular-nums text-rose-700">
            −${totalFees.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </p>
          <p className="text-[11px] text-slate-400">Total platform fees</p>
        </div>
      </div>

      <div className="divide-y divide-slate-100">
        {platforms.map((p) => {
          const net  = p.grossSales * (1 - p.commissionPct);
          const fees = p.grossSales * p.commissionPct;
          const avgOrder = p.grossSales / p.orders;
          const shareOfDelivery = (p.grossSales / totalGross) * 100;

          return (
            <div key={p.platform} className="px-6 py-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${PLATFORM_DOT[p.platform] ?? "bg-slate-400"}`} />
                  <span className="text-sm font-medium text-slate-900">{p.platform}</span>
                  <span className="text-[11px] text-slate-400 bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5">
                    {(p.commissionPct * 100).toFixed(0)}% commission
                  </span>
                </div>
                <div className="flex items-center gap-6 text-right text-xs">
                  <div>
                    <p className="font-semibold tabular-nums text-slate-700">
                      ${p.grossSales.toLocaleString()}
                    </p>
                    <p className="text-slate-400">Gross</p>
                  </div>
                  <div>
                    <p className="font-semibold tabular-nums text-rose-600">
                      −${fees.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    </p>
                    <p className="text-slate-400">Fees</p>
                  </div>
                  <div>
                    <p className="font-semibold tabular-nums text-emerald-700">
                      ${net.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    </p>
                    <p className="text-slate-400">Net payout</p>
                  </div>
                  <div>
                    <p className="font-semibold tabular-nums text-slate-700">{p.orders}</p>
                    <p className="text-slate-400">Orders</p>
                  </div>
                  <div>
                    <p className="font-semibold tabular-nums text-slate-700">
                      ${avgOrder.toFixed(2)}
                    </p>
                    <p className="text-slate-400">Avg order</p>
                  </div>
                </div>
              </div>
              {/* Share bar */}
              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${shareOfDelivery}%`, backgroundColor: p.color }}
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">{shareOfDelivery.toFixed(0)}% of delivery mix</p>
            </div>
          );
        })}
      </div>

      {/* Totals footer */}
      <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-4 text-xs">
          <span className="text-slate-500">
            <span className="font-semibold text-slate-700">{totalOrders.toLocaleString()}</span> total orders
          </span>
          <span className="text-slate-500">
            <span className="font-semibold text-slate-700">
              ${(totalGross / totalOrders).toFixed(2)}
            </span> avg order value
          </span>
        </div>
        <div className="flex items-center gap-6 text-xs text-right">
          <div>
            <span className="font-semibold tabular-nums text-slate-700">
              ${totalGross.toLocaleString()}
            </span>
            <span className="text-slate-400 ml-1">gross</span>
          </div>
          <div>
            <span className="font-semibold tabular-nums text-rose-600">
              −${totalFees.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </span>
            <span className="text-slate-400 ml-1">fees</span>
          </div>
          <div>
            <span className="font-semibold tabular-nums text-emerald-700">
              ${totalNet.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </span>
            <span className="text-slate-400 ml-1">net</span>
          </div>
        </div>
      </div>

      {/* Advisory callout */}
      {totalFees / totalGross > 0.26 && (
        <div className="px-6 py-3 border-t border-amber-200 bg-amber-50">
          <p className="text-xs text-amber-800">
            <span className="font-semibold">Insight:</span> Platform fees average{" "}
            <span className="font-semibold">{((totalFees / totalGross) * 100).toFixed(1)}%</span> of gross delivery
            revenue. Negotiate preferred rates or shift volume to lower-commission platforms to recover margin.
          </p>
        </div>
      )}
    </div>
  );
}
