"use client";

import { Transaction } from "@/lib/mockData";
import { SourceBadge } from "./SourceBadge";
import { Check, AlertTriangle, Minus, Plus, Sparkles } from "lucide-react";

interface Props {
  transactions: Transaction[];
  onCategorizeAll: () => void;
  onAddExpense: () => void;
  isLoading: boolean;
}

function StatusDot({ status }: { status: Transaction["status"] }) {
  switch (status) {
    case "categorized":
    case "matched":
      return <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" strokeWidth={2.5} />;
    case "flagged":
      return <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />;
    default:
      return <Minus className="w-3.5 h-3.5 text-slate-300 shrink-0" />;
  }
}

export function TransactionFeed({ transactions, onCategorizeAll, onAddExpense, isLoading }: Props) {
  const pending = transactions.filter((t) => t.status === "pending").length;

  return (
    <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">Transactions</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {transactions.length} entries · Toast, BofA, Amex
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onAddExpense}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 border border-slate-200 rounded-md hover:bg-slate-50 transition-colors"
          >
            <Plus className="w-3 h-3" />
            Add
          </button>
          {pending > 0 && (
            <button
              onClick={onCategorizeAll}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 text-white text-xs font-medium rounded-md hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <>
                  <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Categorizing…
                </>
              ) : (
                <>
                  <Sparkles className="w-3 h-3" />
                  Auto-categorize
                </>
              )}
            </button>
          )}
        </div>
      </div>

      <div className="divide-y divide-slate-50">
        {transactions.map((tx) => (
          <div
            key={tx.id}
            className={`px-6 py-3 flex items-center gap-4 hover:bg-slate-50/60 transition-colors ${
              tx.status === "flagged" ? "bg-amber-50/50" : ""
            }`}
          >
            <StatusDot status={tx.status} />

            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2 mb-0.5">
                <SourceBadge source={tx.source} />
                <span className="text-[11px] text-slate-400">{tx.date}</span>
                {tx.status === "flagged" && tx.flagReason && (
                  <span className="text-[11px] text-amber-700 font-medium">{tx.flagReason}</span>
                )}
              </div>
              <p className="text-sm text-slate-800 truncate">{tx.description}</p>
              {tx.glCategory && (
                <p className="text-[11px] text-indigo-500 mt-0.5 font-mono">
                  {tx.glCode} · {tx.glCategory}
                </p>
              )}
            </div>

            <div className="text-right shrink-0">
              <p className={`text-sm font-medium tabular-nums ${tx.amount >= 0 ? "text-emerald-700" : "text-slate-900"}`}>
                {tx.amount >= 0 ? "+" : ""}${Math.abs(tx.amount).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <p className="text-[11px] text-slate-400 capitalize mt-0.5">{tx.status}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
