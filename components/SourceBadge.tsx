import { TransactionSource } from "@/lib/mockData";

const SOURCE_CONFIG: Record<
  TransactionSource,
  { bg: string; text: string; border: string }
> = {
  Toast: { bg: "bg-orange-50",  text: "text-orange-700", border: "border-orange-200" },
  BofA:  { bg: "bg-rose-50",    text: "text-rose-700",   border: "border-rose-200"   },
  Amex:  { bg: "bg-blue-50",    text: "text-blue-700",   border: "border-blue-200"   },
};

export function SourceBadge({ source }: { source: TransactionSource }) {
  const { bg, text, border } = SOURCE_CONFIG[source];
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border ${bg} ${text} ${border}`}>
      {source}
    </span>
  );
}
