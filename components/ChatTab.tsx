"use client";

import { useState, useRef, useEffect } from "react";
import { Transaction, DAILY_SALES } from "@/lib/mockData";
import { Send, RotateCcw } from "lucide-react";

function renderMarkdown(text: string) {
  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const lineIndex = i;

    // H3
    if (line.startsWith("### ")) {
      elements.push(<h3 key={`h3-${lineIndex}`} className="font-bold text-base mt-3 mb-1">{parseBold(line.slice(4))}</h3>);
    }
    // H2
    else if (line.startsWith("## ")) {
      elements.push(<h2 key={`h2-${lineIndex}`} className="font-bold text-base mt-3 mb-1">{parseBold(line.slice(3))}</h2>);
    }
    // Table row
    else if (line.startsWith("|")) {
      const tableStart = i;
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].startsWith("|")) {
        tableLines.push(lines[i]);
        i++;
      }
      elements.push(<table key={`table-${tableStart}`} className="text-xs border-collapse my-2 w-full">{renderTable(tableLines)}</table>);
      continue;
    }
    // Empty line
    else if (line.trim() === "") {
      elements.push(<br key={`br-${lineIndex}`} />);
    }
    // Normal paragraph
    else {
      elements.push(<p key={`p-${lineIndex}`} className="mb-1">{parseBold(line)}</p>);
    }
    i++;
  }
  return elements;
}

function renderTable(lines: string[]) {
  const rows = lines.map(l => l.split("|").filter((_, i, a) => i > 0 && i < a.length - 1).map(c => c.trim()));
  const [header, , ...body] = rows;
  return (
    <>
      <thead><tr>{header?.map((c, i) => <th key={i} className="border border-slate-300 px-2 py-1 bg-slate-100 font-semibold text-left">{c}</th>)}</tr></thead>
      <tbody>{body.map((row, ri) => <tr key={ri}>{row.map((c, ci) => <td key={ci} className="border border-slate-300 px-2 py-1">{parseBold(c)}</td>)}</tr>)}</tbody>
    </>
  );
}

function parseBold(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((p, i) =>
    p.startsWith("**") && p.endsWith("**")
      ? <strong key={i}>{p.slice(2, -2)}</strong>
      : p
  );
}

interface Message {
  role: "user" | "assistant";
  content: string;
}

const SUGGESTED = [
  "Summarize my financial health this period",
  "What's my food cost as a % of revenue?",
  "Am I over the labor benchmark?",
  "Flag any unusual or duplicate charges",
  "Forecast next month's revenue at this trend",
  "What's my prime cost ratio?",
  "Where should I cut costs first?",
  "Break down my top 5 expenses",
];

function buildContext(transactions: Transaction[]) {
  const revenue  = transactions.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0);
  const expenses = transactions.filter(t => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);

  // GL totals
  const glMap = new Map<string, { cat: string; total: number }>();
  for (const tx of transactions) {
    if (!tx.glCode) continue;
    if (!glMap.has(tx.glCode)) glMap.set(tx.glCode, { cat: tx.glCategory || tx.glCode, total: 0 });
    glMap.get(tx.glCode)!.total += tx.amount;
  }
  const glSummary = [...glMap.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([code, { cat, total }]) => `  ${code} ${cat}: ${total >= 0 ? "+" : ""}$${Math.abs(total).toFixed(2)}`)
    .join("\n");

  const salesTotal = DAILY_SALES.reduce((s, d) => s + d.sales, 0);
  const salesAvg   = salesTotal / DAILY_SALES.length;
  const peakDay    = DAILY_SALES.reduce((a, b) => b.sales > a.sales ? b : a);

  const txLines = transactions
    .map(t => `  ${t.date} | ${t.source} | ${t.description} | ${t.amount >= 0 ? "+" : ""}$${Math.abs(t.amount).toFixed(2)}${t.glCategory ? ` | GL: ${t.glCode} ${t.glCategory}` : ""}`)
    .join("\n");

  return `PERIOD: Feb 1 – Mar 2, 2026

KEY METRICS:
  Total Revenue:  $${revenue.toFixed(2)}
  Total Expenses: $${expenses.toFixed(2)}
  Net Cash Flow:  ${(revenue - expenses) >= 0 ? "+" : ""}$${(revenue - expenses).toFixed(2)}
  Categorized:    ${transactions.filter(t => t.glCode).length} / ${transactions.length} transactions

GL CATEGORY TOTALS:
${glSummary || "  (run auto-categorize first)"}

30-DAY SALES PERFORMANCE:
  Total:    $${salesTotal.toLocaleString()}
  Avg/Day:  $${Math.round(salesAvg).toLocaleString()}
  Peak Day: ${peakDay.date} at $${peakDay.sales.toLocaleString()} (${peakDay.covers} covers)

ALL TRANSACTIONS:
${txLines}`;
}

export function ChatTab({ transactions }: { transactions: Transaction[] }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput]       = useState("");
  const [streaming, setStreaming] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streaming]);

  const send = async (text: string) => {
    if (!text.trim() || streaming) return;
    const userMsg: Message = { role: "user", content: text.trim() };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput("");
    setStreaming(true);

    // Placeholder for assistant response
    setMessages(m => [...m, { role: "assistant", content: "" }]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: next.map(m => ({ role: m.role, content: m.content })),
          systemContext: buildContext(transactions),
        }),
      });

      if (!res.ok || !res.body) throw new Error("Stream failed");

      const reader  = res.body.getReader();
      const decoder = new TextDecoder();
      let full = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        full += decoder.decode(value, { stream: true });
        setMessages(m => [...m.slice(0, -1), { role: "assistant", content: full }]);
      }
    } catch {
      setMessages(m => [...m.slice(0, -1), { role: "assistant", content: "Sorry, something went wrong. Check your API key." }]);
    } finally {
      setStreaming(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  };

  return (
    <div className="flex flex-col h-[620px] bg-white border border-slate-200 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="px-6 py-3.5 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">Financial Assistant</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Claude has full context of your {transactions.length} transactions and 30-day sales data
          </p>
        </div>
        {messages.length > 0 && (
          <button
            onClick={() => setMessages([])}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            Clear
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center gap-6">
            <div className="text-center">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                <span className="text-white text-base font-bold">C</span>
              </div>
              <p className="text-sm font-medium text-slate-700">Ask anything about your finances</p>
              <p className="text-xs text-slate-400 mt-1">
                I can see all your transactions, GL categories, and sales trends
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-2 max-w-xl">
              {SUGGESTED.map((q) => (
                <button
                  key={q}
                  onClick={() => send(q)}
                  className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-full text-xs text-slate-600 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-700 transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg, i) => (
            <div
              key={i}
              className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
            >
              {/* Avatar */}
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold ${
                msg.role === "user"
                  ? "bg-slate-200 text-slate-600"
                  : "bg-indigo-600 text-white"
              }`}>
                {msg.role === "user" ? "JP" : "C"}
              </div>

              {/* Bubble */}
              <div className={`max-w-[75%] rounded-xl px-4 py-2.5 text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-indigo-600 text-white rounded-tr-sm"
                  : "bg-slate-50 border border-slate-200 text-slate-800 rounded-tl-sm"
              }`}>
                {msg.content
                  ? msg.role === "assistant"
                    ? <div className="prose prose-sm max-w-none">{renderMarkdown(msg.content)}</div>
                    : msg.content
                  : (
                  <span className="flex gap-1 py-0.5">
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </span>
                )}
              </div>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggested chips when there are messages */}
      {messages.length > 0 && !streaming && (
        <div className="px-6 pb-2 flex gap-2 overflow-x-auto scrollbar-hide">
          {SUGGESTED.slice(0, 4).map((q) => (
            <button
              key={q}
              onClick={() => send(q)}
              className="shrink-0 px-3 py-1 bg-slate-50 border border-slate-200 rounded-full text-[11px] text-slate-500 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-600 transition-colors"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="px-4 pb-4 pt-2 border-t border-slate-100">
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Ask about your finances… (Enter to send)"
            rows={1}
            className="flex-1 resize-none rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            style={{ minHeight: "40px", maxHeight: "120px" }}
          />
          <button
            onClick={() => send(input)}
            disabled={!input.trim() || streaming}
            className="w-10 h-10 flex items-center justify-center bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
