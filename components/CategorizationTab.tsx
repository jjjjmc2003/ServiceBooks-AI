"use client";

import { useState } from "react";
import type { Transaction } from "@/lib/mockData";
import { GLBuckets } from "@/components/GLBuckets";
import { ChevronDown, ChevronRight, Sparkles } from "lucide-react";

interface Props {
  transactions: Transaction[];
  isLoading: boolean;
  onCategorizeAll: () => void;
  lastRunAt: string | null;
}

export function CategorizationTab({
  transactions,
  isLoading,
  onCategorizeAll,
  lastRunAt,
}: Props) {
  const [showAllExpenses, setShowAllExpenses] = useState(false);

  const pending = transactions.filter((tx) => tx.status === "pending");
  const categorized = transactions.filter(
    (tx) => tx.status === "categorized" || tx.status === "matched"
  );
  const flagged = transactions.filter((tx) => tx.status === "flagged");
  const expenses = [...transactions]
    .filter((tx) => tx.amount < 0)
    .sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="space-y-4">
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Categorization Queue</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Auto-runs on login and whenever new data is imported or added.
            </p>
            {lastRunAt && (
              <p className="text-[11px] text-slate-400 mt-1">
                Last run: {new Date(lastRunAt).toLocaleString()}
              </p>
            )}
          </div>
          <button
            onClick={onCategorizeAll}
            disabled={isLoading || pending.length === 0}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 text-white text-xs font-medium rounded-md hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <>
                <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Categorizing...
              </>
            ) : (
              <>
                <Sparkles className="w-3 h-3" />
                Run Now
              </>
            )}
          </button>
        </div>

        <div className="px-6 py-3 border-b border-slate-100 grid grid-cols-3 gap-2 text-center">
          <div className="rounded-md border border-slate-200 bg-slate-50 py-2">
            <p className="text-lg font-semibold text-slate-900">{pending.length}</p>
            <p className="text-[11px] text-slate-500">Pending</p>
          </div>
          <div className="rounded-md border border-emerald-200 bg-emerald-50 py-2">
            <p className="text-lg font-semibold text-emerald-700">{categorized.length}</p>
            <p className="text-[11px] text-emerald-600">Categorized</p>
          </div>
          <div className="rounded-md border border-amber-200 bg-amber-50 py-2">
            <p className="text-lg font-semibold text-amber-700">{flagged.length}</p>
            <p className="text-[11px] text-amber-600">Flagged</p>
          </div>
        </div>

        <button
          onClick={() => setShowAllExpenses((open) => !open)}
          className="w-full px-6 py-3 text-left flex items-center justify-between hover:bg-slate-50 transition-colors"
        >
          <span className="text-sm font-medium text-slate-800">
            All Expenses ({expenses.length})
          </span>
          {showAllExpenses ? (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronRight className="w-4 h-4 text-slate-400" />
          )}
        </button>

        {showAllExpenses && (
          <div className="border-t border-slate-100 divide-y divide-slate-100 max-h-[300px] overflow-y-auto">
            {expenses.map((tx) => (
              <div key={tx.id} className="px-6 py-3 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm text-slate-800 truncate">{tx.description}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {tx.id} · {tx.source} · {tx.date}
                  </p>
                  <p className="text-[11px] mt-1 font-mono text-indigo-600 truncate">
                    {tx.glCode && tx.glCategory
                      ? `${tx.glCode} · ${tx.glCategory}`
                      : "Uncategorized"}
                  </p>
                </div>
                <p className="text-sm font-medium tabular-nums shrink-0 text-slate-800">
                  -${Math.abs(tx.amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </p>
              </div>
            ))}
            {expenses.length === 0 && (
              <div className="px-6 py-8 text-center text-sm text-slate-500">
                No expense transactions found.
              </div>
            )}
          </div>
        )}
      </div>

      <GLBuckets transactions={transactions} />
    </div>
  );
}
