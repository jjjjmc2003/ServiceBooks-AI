"use client";

import { useState } from "react";
import { Transaction, TransactionSource } from "@/lib/mockData";
import { X } from "lucide-react";

interface Props {
  onClose: () => void;
  onAdd: (tx: Transaction, autoCategorize: boolean) => void;
}

const SOURCES: TransactionSource[] = ["Toast", "BofA", "Amex"];

let idCounter = 100;

export function AddExpenseModal({ onClose, onAdd }: Props) {
  const today = new Date().toISOString().slice(0, 10);
  const [date, setDate]             = useState(today);
  const [source, setSource]         = useState<TransactionSource>("Amex");
  const [description, setDescription] = useState("");
  const [amount, setAmount]         = useState("");
  const [isIncome, setIsIncome]     = useState(false);
  const [autoCat, setAutoCat]       = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || !amount) return;

    const parsedAmt = parseFloat(amount);
    if (isNaN(parsedAmt) || parsedAmt <= 0) return;

    const id = `MAN-${String(++idCounter).padStart(3, "0")}`;
    const tx: Transaction = {
      id,
      source,
      date,
      description: description.trim(),
      rawDescription: description.trim().toUpperCase(),
      amount: isIncome ? parsedAmt : -parsedAmt,
      status: "pending",
    };

    onAdd(tx, autoCat);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Card */}
      <div className="relative bg-white rounded-xl border border-slate-200 shadow-xl w-full max-w-md mx-4 p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-sm font-semibold text-slate-900">Add Transaction</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Type toggle */}
          <div className="flex rounded-lg border border-slate-200 overflow-hidden">
            <button
              type="button"
              onClick={() => setIsIncome(false)}
              className={`flex-1 py-2 text-xs font-medium transition-colors ${
                !isIncome
                  ? "bg-rose-50 text-rose-700 border-r border-rose-200"
                  : "text-slate-400 hover:text-slate-600 border-r border-slate-200"
              }`}
            >
              Expense
            </button>
            <button
              type="button"
              onClick={() => setIsIncome(true)}
              className={`flex-1 py-2 text-xs font-medium transition-colors ${
                isIncome
                  ? "bg-emerald-50 text-emerald-700"
                  : "text-slate-400 hover:text-slate-600"
              }`}
            >
              Income
            </button>
          </div>

          {/* Date + Source */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-1.5">
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-1.5">
                Source
              </label>
              <select
                value={source}
                onChange={(e) => setSource(e.target.value as TransactionSource)}
                className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                {SOURCES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-1.5">
              Description
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Sysco weekly delivery"
              className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          {/* Amount */}
          <div>
            <label className="block text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-1.5">
              Amount
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                {isIncome ? "+" : "−"}$
              </span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full rounded-md border border-slate-200 pl-8 pr-3 py-2 text-sm text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Auto-categorize toggle */}
          <label className="flex items-center gap-3 cursor-pointer">
            <div
              onClick={() => setAutoCat(!autoCat)}
              className={`relative w-9 h-5 rounded-full transition-colors ${
                autoCat ? "bg-indigo-600" : "bg-slate-200"
              }`}
            >
              <span
                className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${
                  autoCat ? "translate-x-4" : "translate-x-0.5"
                }`}
              />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-700">Auto-categorize with Claude</p>
              <p className="text-[11px] text-slate-400">Assign a GL code automatically</p>
            </div>
          </label>

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 text-sm text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!description.trim() || !amount}
              className="flex-1 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Add Transaction
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
