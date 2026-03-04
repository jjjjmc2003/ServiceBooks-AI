"use client";

import { Transaction } from "@/lib/mockData";
import { SourceBadge } from "./SourceBadge";
import { ChevronDown, ChevronRight, Sparkles } from "lucide-react";
import { useState } from "react";

interface Bucket {
  glCode: string;
  glCategory: string;
  transactions: Transaction[];
  total: number;
  isIncome: boolean;
}

function isIncomeCode(code: string) { return code.startsWith("4"); }

function bucketColor(code: string) {
  const map: Record<string, { bar: string; badge: string; bg: string }> = {
    "4": { bar: "bg-emerald-500", badge: "bg-emerald-50 text-emerald-700 border-emerald-200", bg: "bg-emerald-50/60" },
    "5": { bar: "bg-rose-400",    badge: "bg-rose-50 text-rose-700 border-rose-200",          bg: "bg-rose-50/60"    },
    "6": { bar: "bg-orange-400",  badge: "bg-orange-50 text-orange-700 border-orange-200",    bg: "bg-orange-50/60"  },
    "7": { bar: "bg-sky-400",     badge: "bg-sky-50 text-sky-700 border-sky-200",             bg: "bg-sky-50/60"     },
    "8": { bar: "bg-violet-400",  badge: "bg-violet-50 text-violet-700 border-violet-200",    bg: "bg-violet-50/60"  },
  };
  return map[code[0]] ?? { bar: "bg-slate-300", badge: "bg-slate-100 text-slate-600 border-slate-200", bg: "bg-slate-50" };
}

export function GLBuckets({ transactions }: { transactions: Transaction[] }) {
  const [expanded, setExpanded]       = useState<string | null>(null);
  const [insight, setInsight]         = useState<string | null>(null);
  const [insightLoading, setInsightLoading] = useState(false);

  const categorized = transactions.filter((t) => t.glCode && t.glCategory);
  if (categorized.length === 0) return null;

  const bucketMap = new Map<string, Bucket>();
  for (const tx of categorized) {
    const key = tx.glCode!;
    if (!bucketMap.has(key)) bucketMap.set(key, { glCode: tx.glCode!, glCategory: tx.glCategory!, transactions: [], total: 0, isIncome: isIncomeCode(tx.glCode!) });
    const b = bucketMap.get(key)!;
    b.transactions.push(tx);
    b.total += tx.amount;
  }

  const buckets    = [...bucketMap.values()].sort((a, b) => a.glCode.localeCompare(b.glCode));
  const totalIncome    = buckets.filter(b => b.isIncome).reduce((s, b) => s + b.total, 0);
  const totalExpenses  = buckets.filter(b => !b.isIncome).reduce((s, b) => s + Math.abs(b.total), 0);
  const maxAbs = Math.max(...buckets.map(b => Math.abs(b.total)));

  const revenue = transactions.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0);

  const analyzeAll = async () => {
    setInsightLoading(true);
    setInsight(null);

    const glSummary = buckets
      .map(b => `${b.glCode} ${b.glCategory}: ${b.total >= 0 ? "+" : ""}$${Math.abs(b.total).toFixed(2)} (${revenue > 0 ? ((Math.abs(b.total) / revenue) * 100).toFixed(1) + "%" : "n/a"} of revenue)`)
      .join("; ");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: `Give me 3 concise bullet-point insights about these GL category totals. Flag anything outside industry benchmarks. Be direct and actionable.\n\nRevenue: $${revenue.toFixed(2)}\nGL Totals: ${glSummary}` }],
          systemContext: `You are a restaurant financial analyst. Be concise — 3 bullets max, each under 20 words. Use plain text, no markdown headers.`,
        }),
      });
      const reader  = res.body!.getReader();
      const decoder = new TextDecoder();
      let full = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        full += decoder.decode(value, { stream: true });
        setInsight(full);
      }
    } catch {
      setInsight("Unable to generate insights. Check your API key.");
    } finally {
      setInsightLoading(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-100">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">GL Categories</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {buckets.length} accounts · {categorized.length} transactions
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium tabular-nums text-emerald-700">
                +${totalIncome.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </p>
              <p className="text-[11px] text-slate-400">Income</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium tabular-nums text-slate-900">
                −${totalExpenses.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </p>
              <p className="text-[11px] text-slate-400">Expenses</p>
            </div>
            <button
              onClick={analyzeAll}
              disabled={insightLoading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white text-xs font-medium rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {insightLoading ? (
                <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
              ) : (
                <Sparkles className="w-3 h-3" />
              )}
              Analyze
            </button>
          </div>
        </div>

        {/* AI Insights panel */}
        {(insight || insightLoading) && (
          <div className="mt-3 bg-indigo-50 border border-indigo-200 rounded-lg px-4 py-3">
            <p className="text-[11px] font-semibold text-indigo-600 uppercase tracking-wide mb-1.5">Claude Analysis</p>
            {insightLoading && !insight ? (
              <div className="flex gap-1 py-1">
                <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            ) : (
              <p className="text-sm text-indigo-900 whitespace-pre-line leading-relaxed">{insight}</p>
            )}
          </div>
        )}
      </div>

      {/* Bucket rows */}
      <div className="divide-y divide-slate-100">
        {buckets.map((bucket) => {
          const color  = bucketColor(bucket.glCode);
          const isOpen = expanded === bucket.glCode;
          const barWidth = `${(Math.abs(bucket.total) / maxAbs) * 100}%`;

          return (
            <div key={bucket.glCode}>
              <button
                className="w-full text-left px-6 py-3 hover:bg-slate-50 transition-colors"
                onClick={() => setExpanded(isOpen ? null : bucket.glCode)}
              >
                <div className="flex items-center gap-4">
                  <span className="text-slate-300 shrink-0">
                    {isOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                  </span>

                  <span className={`text-[11px] font-mono font-semibold px-2 py-0.5 rounded border ${color.badge} shrink-0`}>
                    {bucket.glCode}
                  </span>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm text-slate-700">{bucket.glCategory}</span>
                      <span className="text-[11px] text-slate-400 ml-3 shrink-0">{bucket.transactions.length}</span>
                    </div>
                    <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-500 ${color.bar}`} style={{ width: barWidth }} />
                    </div>
                  </div>

                  <span className={`text-sm font-medium tabular-nums shrink-0 w-28 text-right ${bucket.total >= 0 ? "text-emerald-700" : "text-slate-900"}`}>
                    {bucket.total >= 0 ? "+" : "−"}${Math.abs(bucket.total).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </button>

              {isOpen && (
                <div className={`border-t border-slate-100 ${color.bg}`}>
                  {bucket.transactions.map((tx) => (
                    <div key={tx.id} className="pl-14 pr-6 py-2.5 flex items-baseline gap-3 border-b border-white/60 last:border-0">
                      <SourceBadge source={tx.source} />
                      <span className="text-[11px] text-slate-400 shrink-0">{tx.date}</span>
                      <span className="text-sm text-slate-600 flex-1 truncate">{tx.description}</span>
                      <span className={`text-sm font-medium tabular-nums shrink-0 ${tx.amount >= 0 ? "text-emerald-700" : "text-slate-800"}`}>
                        {tx.amount >= 0 ? "+" : ""}${Math.abs(tx.amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
