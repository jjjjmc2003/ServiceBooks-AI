interface Props {
  label: string;
  value: string;
  sub?: string;
  accent?: "green" | "red" | "indigo" | "neutral";
}

const ACCENT: Record<NonNullable<Props["accent"]>, { value: string; bg: string }> = {
  green:   { value: "text-emerald-700", bg: "bg-emerald-50" },
  red:     { value: "text-rose-700",    bg: "bg-rose-50"    },
  indigo:  { value: "text-indigo-700",  bg: "bg-indigo-50"  },
  neutral: { value: "text-slate-900",   bg: "bg-white"      },
};

export function StatCard({ label, value, sub, accent = "neutral" }: Props) {
  const { value: valueColor, bg } = ACCENT[accent];
  return (
    <div className={`${bg} border border-slate-200 rounded-lg px-5 py-4`}>
      <p className="text-[11px] font-medium text-slate-400 uppercase tracking-widest mb-2">
        {label}
      </p>
      <p className={`text-xl font-semibold tabular-nums ${valueColor}`}>{value}</p>
      {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
    </div>
  );
}
