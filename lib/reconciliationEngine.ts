import type { Transaction } from "@/lib/mockData";

export interface ReconciliationGroup {
  id: string;
  status: "matched" | "exception";
  deposit: Transaction;
  linkedTransactions: Transaction[];
  feeTransactions: Transaction[];
  expectedGross: number;
  expectedNet: number;
  variance: number;
  note: string;
}

export interface ReconciliationAnalysis {
  groups: ReconciliationGroup[];
  matchedCount: number;
  exceptionCount: number;
  unmatchedTransactions: Transaction[];
}

const PLATFORM_KEYS = ["doordash", "uber", "ubereats", "grubhub"];

function toDate(value: string) {
  return new Date(`${value}T00:00:00`);
}

function dateDiffDays(a: string, b: string) {
  const diff = Math.abs(toDate(a).getTime() - toDate(b).getTime());
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

function containsAny(text: string, keys: string[]) {
  const lower = text.toLowerCase();
  return keys.some((key) => lower.includes(key));
}

function detectPlatform(tx: Transaction) {
  const value = `${tx.description} ${tx.rawDescription}`.toLowerCase();
  if (value.includes("doordash")) return "doordash";
  if (value.includes("uber")) return "uber";
  if (value.includes("grubhub")) return "grubhub";
  return null;
}

function isFeeLike(tx: Transaction) {
  const text = `${tx.description} ${tx.rawDescription} ${tx.glCategory ?? ""}`;
  return tx.amount < 0 && containsAny(text, ["fee", "commission", "royalty", ...PLATFORM_KEYS]);
}

function buildSettlementCandidates(
  deposit: Transaction,
  toastCredits: Transaction[],
  usedIds: Set<string>
) {
  const platform = detectPlatform(deposit);
  const pool = toastCredits
    .filter((tx) => !usedIds.has(tx.id))
    .filter((tx) => dateDiffDays(tx.date, deposit.date) <= 1)
    .filter((tx) => {
      if (!platform) return true;
      return detectPlatform(tx) === platform;
    })
    .sort((a, b) => b.amount - a.amount);

  const selected: Transaction[] = [];
  let running = 0;

  for (const tx of pool) {
    if (selected.length >= 3) break;
    if (running > deposit.amount * 1.2) break;
    selected.push(tx);
    running += tx.amount;
  }

  return selected;
}

function buildFeeCandidates(
  deposit: Transaction,
  feePool: Transaction[],
  usedIds: Set<string>
) {
  const platform = detectPlatform(deposit);
  return feePool
    .filter((tx) => !usedIds.has(tx.id))
    .filter((tx) => dateDiffDays(tx.date, deposit.date) <= 2)
    .filter((tx) => {
      if (!platform) return true;
      return detectPlatform(tx) === platform || containsAny(tx.description, ["commission", "fee"]);
    })
    .slice(0, 2);
}

export function buildReconciliationAnalysis(
  transactions: Transaction[]
): ReconciliationAnalysis {
  const groups: ReconciliationGroup[] = [];
  const usedIds = new Set<string>();

  const deposits = transactions
    .filter((tx) => tx.source === "BofA" && tx.amount > 0)
    .sort((a, b) => b.date.localeCompare(a.date));

  const toastCredits = transactions.filter(
    (tx) => tx.source === "Toast" && tx.amount > 0
  );
  const feePool = transactions.filter(isFeeLike);

  deposits.forEach((deposit, index) => {
    const linkedTransactions = buildSettlementCandidates(deposit, toastCredits, usedIds);
    const feeTransactions = buildFeeCandidates(deposit, feePool, usedIds);

    const expectedGross = linkedTransactions.reduce((sum, tx) => sum + tx.amount, 0);
    const feeImpact = feeTransactions.reduce((sum, tx) => sum + tx.amount, 0);
    const expectedNet = expectedGross + feeImpact;
    const variance = deposit.amount - expectedNet;

    const tolerance = Math.max(75, deposit.amount * 0.04);
    const status =
      linkedTransactions.length > 0 && Math.abs(variance) <= tolerance
        ? "matched"
        : "exception";

    if (status === "matched") {
      linkedTransactions.forEach((tx) => usedIds.add(tx.id));
      feeTransactions.forEach((tx) => usedIds.add(tx.id));
      usedIds.add(deposit.id);
    }

    groups.push({
      id: `REC-${String(index + 1).padStart(3, "0")}`,
      status,
      deposit,
      linkedTransactions,
      feeTransactions,
      expectedGross,
      expectedNet,
      variance,
      note:
        status === "matched"
          ? "Deposit auto-matched against Toast sales and fee adjustments."
          : "Needs review: missing batch, wrong fee mapping, or timing mismatch.",
    });
  });

  const groupedIds = new Set<string>();
  groups.forEach((group) => {
    groupedIds.add(group.deposit.id);
    group.linkedTransactions.forEach((tx) => groupedIds.add(tx.id));
    group.feeTransactions.forEach((tx) => groupedIds.add(tx.id));
  });

  const unmatchedTransactions = transactions.filter((tx) => !groupedIds.has(tx.id));

  return {
    groups,
    matchedCount: groups.filter((group) => group.status === "matched").length,
    exceptionCount: groups.filter((group) => group.status === "exception").length,
    unmatchedTransactions,
  };
}
