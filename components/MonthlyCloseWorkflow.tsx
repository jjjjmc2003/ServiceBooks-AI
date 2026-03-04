"use client";

import type { Transaction } from "@/lib/mockData";
import type { ReconciliationAnalysis } from "@/lib/reconciliationEngine";
import { Lock, Unlock, CheckCircle2, AlertTriangle } from "lucide-react";

interface Props {
  transactions: Transaction[];
  reconciliation: ReconciliationAnalysis;
  approvedReceiptCount: number;
  periodLocked: boolean;
  onToggleLock: () => void;
}

export function MonthlyCloseWorkflow({
  transactions,
  reconciliation,
  approvedReceiptCount,
  periodLocked,
  onToggleLock,
}: Props) {
  const uncategorizedCount = transactions.filter((tx) => tx.status === "pending").length;
  const unmatchedCount =
    reconciliation.groups.filter((group) => group.status === "exception").length +
    reconciliation.unmatchedTransactions.length;

  const highValueExpenses = transactions.filter((tx) => tx.amount < -250).length;
  const missingDocsCount = Math.max(highValueExpenses - approvedReceiptCount, 0);

  const hasRent = transactions.some((tx) =>
    `${tx.description} ${tx.rawDescription}`.toLowerCase().includes("rent")
  );
  const hasPayroll = transactions.some((tx) =>
    `${tx.description} ${tx.rawDescription}`.toLowerCase().includes("payroll")
  );
  const hasUtilities = transactions.some((tx) =>
    `${tx.description} ${tx.rawDescription}`.toLowerCase().includes("electric")
  );
  const accrualReminderCount = [hasRent, hasPayroll, hasUtilities].filter((ready) => !ready).length;

  const checklist = [
    { label: "Uncategorized transactions", open: uncategorizedCount },
    { label: "Unmatched reconciliation items", open: unmatchedCount },
    { label: "Missing receipt/invoice support", open: missingDocsCount },
    { label: "Accrual reminders outstanding", open: accrualReminderCount },
  ];

  const readyToClose = checklist.every((item) => item.open === 0);

  return (
    <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">Monthly Close Workflow</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Checklist + lock control for close discipline.
          </p>
        </div>
        <button
          onClick={onToggleLock}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-xs font-medium transition-colors ${
            periodLocked
              ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
              : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
          }`}
        >
          {periodLocked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
          {periodLocked ? "Period Locked" : "Lock Period"}
        </button>
      </div>

      <div className="p-6 space-y-3">
        {checklist.map((item) => (
          <div
            key={item.label}
            className={`rounded-md border px-3 py-2.5 flex items-center justify-between ${
              item.open === 0
                ? "border-emerald-200 bg-emerald-50"
                : "border-amber-200 bg-amber-50"
            }`}
          >
            <div className="flex items-center gap-2">
              {item.open === 0 ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-amber-600" />
              )}
              <span className={`text-sm ${item.open === 0 ? "text-emerald-800" : "text-amber-900"}`}>
                {item.label}
              </span>
            </div>
            <span className={`text-sm font-semibold tabular-nums ${item.open === 0 ? "text-emerald-700" : "text-amber-800"}`}>
              {item.open}
            </span>
          </div>
        ))}
      </div>

      <div className="px-6 py-3 border-t border-slate-100 bg-slate-50">
        <p className={`text-xs ${readyToClose ? "text-emerald-700" : "text-amber-700"}`}>
          {readyToClose
            ? "Close-ready. All checklist items are clear."
            : "Close not ready. Resolve open items before locking."}
        </p>
      </div>
    </div>
  );
}
