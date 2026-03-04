"use client";

import type { Brand, Transaction } from "@/lib/mockData";
import { computeBrandFinancialMetrics } from "@/lib/brandMetrics";
import type { DeliveryPlatformData } from "@/lib/mockData";
import { BellRing } from "lucide-react";

interface Props {
  brand: Brand;
  transactions: Transaction[];
  deliveryPlatforms: DeliveryPlatformData[];
  brandName: string;
}

function median(values: number[]) {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

export function AlertsDigest({ brand, transactions, deliveryPlatforms, brandName }: Props) {
  const negatives = transactions.filter((tx) => tx.amount < 0).map((tx) => Math.abs(tx.amount));
  const medianExpense = median(negatives);

  const spikeExpenses = transactions
    .filter((tx) => tx.amount < 0)
    .filter((tx) => Math.abs(tx.amount) > medianExpense * 1.8);

  const duplicateMap = new Map<string, Transaction[]>();
  transactions.forEach((tx) => {
    const key = `${tx.rawDescription}-${tx.amount.toFixed(2)}`;
    if (!duplicateMap.has(key)) duplicateMap.set(key, []);
    duplicateMap.get(key)!.push(tx);
  });
  const duplicates = [...duplicateMap.values()].filter((group) => group.length > 1);

  const metrics = computeBrandFinancialMetrics(brand, transactions, deliveryPlatforms);

  const alerts: { level: "high" | "medium" | "low"; message: string }[] = [];

  if (duplicates.length > 0) {
    alerts.push({
      level: "high",
      message: `${duplicates.length} potential duplicate charge patterns detected. Review and void extra postings.`,
    });
  }

  if (spikeExpenses.length > 0) {
    alerts.push({
      level: "medium",
      message: `${spikeExpenses.length} unusual expense spikes vs median spend. Check vendor invoices and approval logs.`,
    });
  }

  if (metrics.foodCostPct > 35) {
    alerts.push({
      level: "high",
      message: `Food cost drifted to ${metrics.foodCostPct.toFixed(1)}%. Target is 28–35%; tighten procurement and waste controls.`,
    });
  }

  const netCash = metrics.revenue - metrics.expenses;
  const avgDailyBurn = transactions
    .filter((tx) => tx.amount < 0)
    .reduce((sum, tx) => sum + Math.abs(tx.amount), 0) / 30;
  const runwayDays = avgDailyBurn > 0 ? netCash / avgDailyBurn : 999;

  if (runwayDays > 0 && runwayDays < 45) {
    alerts.push({
      level: "high",
      message: `Cash runway is ~${Math.floor(runwayDays)} days at current burn. Delay discretionary spend and tighten cash controls.`,
    });
  }

  if (alerts.length === 0) {
    alerts.push({
      level: "low",
      message: "No critical anomalies in today’s digest. Continue monitoring reconciliation and close checklist.",
    });
  }

  return (
    <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">Proactive AI Alerts</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Daily what-changed digest for {brandName} · generated {new Date().toLocaleString()}
          </p>
        </div>
        <BellRing className="w-4 h-4 text-indigo-600" />
      </div>

      <div className="divide-y divide-slate-100">
        {alerts.map((alert, index) => (
          <div key={`${alert.level}-${index}`} className="px-6 py-3">
            <p className={`text-sm ${
              alert.level === "high"
                ? "text-rose-700"
                : alert.level === "medium"
                  ? "text-amber-700"
                  : "text-slate-700"
            }`}>
              {alert.level === "high" ? "High" : alert.level === "medium" ? "Medium" : "Low"}: {alert.message}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
