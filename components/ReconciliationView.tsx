"use client";

import { useMemo, useState } from "react";
import { Check, ArrowRight, CircleCheck } from "lucide-react";
import type { Transaction } from "@/lib/mockData";
import { SourceBadge } from "./SourceBadge";
import { buildReconciliationAnalysis } from "@/lib/reconciliationEngine";

export function ReconciliationView({ transactions }: { transactions: Transaction[] }) {
  const analysis = useMemo(() => buildReconciliationAnalysis(transactions), [transactions]);
  const [resolvedIds, setResolvedIds] = useState<Set<string>>(new Set());

  const visibleExceptions = analysis.groups.filter(
    (group) => group.status === "exception" && !resolvedIds.has(group.id)
  );

  const unresolvedUnmatched = analysis.unmatchedTransactions.filter(
    (tx) => !resolvedIds.has(tx.id)
  );

  return (
    <div className="space-y-4">
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-900">Real Reconciliation Engine</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Auto-matching deposits, payouts, and fees across Toast, BofA, and cards.
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 px-6 py-4">
          <MetricCard label="Matched Groups" value={String(analysis.matchedCount)} tone="green" />
          <MetricCard label="Exceptions" value={String(visibleExceptions.length)} tone="amber" />
          <MetricCard label="Unmatched Txns" value={String(unresolvedUnmatched.length)} tone="amber" />
          <MetricCard
            label="Coverage"
            value={`${analysis.groups.length > 0 ? Math.round((analysis.matchedCount / analysis.groups.length) * 100) : 0}%`}
            tone="neutral"
          />
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h3 className="text-sm font-semibold text-slate-900">Matched Settlements</h3>
        </div>
        <div className="divide-y divide-slate-100">
          {analysis.groups.filter((group) => group.status === "matched").map((group) => (
            <div key={group.id} className="px-6 py-3">
              <div className="flex items-start gap-2">
                <CircleCheck className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-slate-800">{group.note}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Variance: ${Math.abs(group.variance).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    {group.linkedTransactions.map((tx, index) => (
                      <span key={tx.id} className="inline-flex items-center gap-1.5 text-[11px] bg-slate-100 rounded px-2 py-1">
                        <SourceBadge source={tx.source} />
                        {tx.id}
                        {index < group.linkedTransactions.length - 1 && (
                          <ArrowRight className="w-3 h-3 text-slate-300" />
                        )}
                      </span>
                    ))}
                    <span className="inline-flex items-center gap-1 text-[11px] bg-emerald-50 text-emerald-700 border border-emerald-200 rounded px-2 py-1">
                      Deposit {group.deposit.id}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white border border-amber-200 rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-amber-100 bg-amber-50/60">
          <h3 className="text-sm font-semibold text-amber-800">Exceptions Queue</h3>
          <p className="text-xs text-amber-700 mt-0.5">
            Resolve exceptions quickly, then re-run reconciliation.
          </p>
        </div>
        <div className="divide-y divide-amber-100">
          {visibleExceptions.map((group) => (
            <div key={group.id} className="px-6 py-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm text-amber-900">{group.note}</p>
                  <p className="text-[11px] text-amber-700 mt-0.5">
                    {group.deposit.id} · expected ${group.expectedNet.toLocaleString("en-US", { minimumFractionDigits: 2 })} · actual ${group.deposit.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-[11px] text-amber-700 mt-0.5">
                    Variance ${Math.abs(group.variance).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <button
                  onClick={() => setResolvedIds((prev) => new Set(prev).add(group.id))}
                  className="shrink-0 text-xs font-medium px-2.5 py-1.5 rounded border border-amber-300 text-amber-800 hover:bg-amber-100 transition-colors"
                >
                  Mark Resolved
                </button>
              </div>
            </div>
          ))}

          {unresolvedUnmatched.slice(0, 15).map((tx) => (
            <div key={tx.id} className="px-6 py-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm text-amber-900">{tx.description}</p>
                  <p className="text-[11px] text-amber-700 mt-0.5">
                    {tx.id} · {tx.source} · {tx.date}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <p className={`text-sm font-medium tabular-nums ${tx.amount >= 0 ? "text-emerald-700" : "text-amber-900"}`}>
                    {tx.amount >= 0 ? "+" : ""}${Math.abs(tx.amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </p>
                  <button
                    onClick={() => setResolvedIds((prev) => new Set(prev).add(tx.id))}
                    className="text-xs font-medium px-2.5 py-1.5 rounded border border-amber-300 text-amber-800 hover:bg-amber-100 transition-colors"
                  >
                    Resolve
                  </button>
                </div>
              </div>
            </div>
          ))}

          {visibleExceptions.length === 0 && unresolvedUnmatched.length === 0 && (
            <div className="px-6 py-10 text-center">
              <Check className="w-5 h-5 text-emerald-600 mx-auto mb-2" />
              <p className="text-sm text-slate-700">No open exceptions. Reconciliation is clean.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "green" | "amber" | "neutral";
}) {
  const toneClass =
    tone === "green"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : tone === "amber"
        ? "border-amber-200 bg-amber-50 text-amber-800"
        : "border-slate-200 bg-slate-50 text-slate-800";

  return (
    <div className={`rounded-md border px-3 py-2 ${toneClass}`}>
      <p className="text-lg font-semibold leading-none">{value}</p>
      <p className="text-[11px] mt-1">{label}</p>
    </div>
  );
}
