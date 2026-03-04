"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ALL_TRANSACTIONS,
  SW_ALL_TRANSACTIONS,
  MQ_DELIVERY_PLATFORMS,
  SW_DELIVERY_PLATFORMS,
  DAILY_SALES,
  SUGAR_WING_DAILY_SALES,
  type Transaction,
  type Brand,
} from "@/lib/mockData";
import { computeBrandFinancialMetrics } from "@/lib/brandMetrics";
import { buildReconciliationAnalysis } from "@/lib/reconciliationEngine";
import { TransactionFeed } from "@/components/TransactionFeed";
import { GLBuckets } from "@/components/GLBuckets";
import { ReconciliationView } from "@/components/ReconciliationView";
import { SalesTrendChart } from "@/components/SalesTrendChart";
import { ChatTab } from "@/components/ChatTab";
import { AddExpenseModal } from "@/components/AddExpenseModal";
import { StatCard } from "@/components/StatCard";
import { DeliveryBreakdown } from "@/components/DeliveryBreakdown";
import { DeliveryProfitability } from "@/components/DeliveryProfitability";
import { CategorizationTab } from "@/components/CategorizationTab";
import { MonthlyCloseWorkflow } from "@/components/MonthlyCloseWorkflow";
import { ConsolidatedReporting } from "@/components/ConsolidatedReporting";
import {
  ReceiptIngestion,
  type IngestedDocument,
} from "@/components/ReceiptIngestion";
import { AlertsDigest } from "@/components/AlertsDigest";
import { ForecastScenario } from "@/components/ForecastScenario";
import { LoginScreen } from "@/components/LoginScreen";
import { ChevronDown, Link2, Lock, LogOut } from "lucide-react";
import { usePlaidLink } from "react-plaid-link";

type Tab =
  | "feed"
  | "categorize"
  | "reconcile"
  | "close"
  | "reporting"
  | "delivery"
  | "ingestion"
  | "alerts"
  | "forecast"
  | "trends"
  | "chat";

const SESSION_KEY = "restaurant-ai-demo-user";
const DEMO_USERNAME = "demo_user";
const DEMO_PASSWORD = "demo_pass";

const TABS: { id: Tab; label: string }[] = [
  { id: "feed", label: "Transactions" },
  { id: "categorize", label: "Categorize" },
  { id: "reconcile", label: "Reconciliation" },
  { id: "close", label: "Month Close" },
  { id: "reporting", label: "Consolidated" },
  { id: "delivery", label: "Delivery P&L" },
  { id: "ingestion", label: "Ingestion" },
  { id: "alerts", label: "AI Alerts" },
  { id: "forecast", label: "Forecast" },
  { id: "trends", label: "Sales Trends" },
  { id: "chat", label: "Ask Claude" },
];

const BRANDS: { id: Brand; label: string; location: string; badge: string }[] = [
  {
    id: "mighty-quinns",
    label: "Mighty Quinn's BBQ",
    location: "Tampa · Dale Mabry",
    badge: "bg-amber-500",
  },
  {
    id: "sugar-wing",
    label: "Sugar Wing",
    location: "Tampa · Ghost Kitchen",
    badge: "bg-rose-500",
  },
];

interface CategoryResult {
  id: string;
  glCode: string;
  glCategory: string;
}

function cloneTransactions(list: Transaction[]) {
  return list.map((tx) => ({ ...tx }));
}

function createInitialTransactionsByBrand(): Record<Brand, Transaction[]> {
  return {
    "mighty-quinns": cloneTransactions(ALL_TRANSACTIONS),
    "sugar-wing": cloneTransactions(SW_ALL_TRANSACTIONS),
  };
}

function createInitialDocumentsByBrand(): Record<Brand, IngestedDocument[]> {
  return {
    "mighty-quinns": [],
    "sugar-wing": [],
  };
}

function fallbackCategorize(tx: Transaction): CategoryResult {
  const value = `${tx.description} ${tx.rawDescription}`.toLowerCase();

  if (tx.amount > 0) {
    if (value.includes("catering")) return { id: tx.id, glCode: "4300", glCategory: "Catering Revenue" };
    if (value.includes("delivery") || value.includes("doordash") || value.includes("uber") || value.includes("grubhub")) {
      return { id: tx.id, glCode: "4100", glCategory: "Food Sales – Delivery" };
    }
    if (value.includes("beer") || value.includes("beverage")) {
      return { id: tx.id, glCode: "4200", glCategory: "Beverage Sales – Beer/NA" };
    }
    return { id: tx.id, glCode: "4000", glCategory: "Food Sales – Dine-In" };
  }

  if (value.includes("adp") || value.includes("payroll") || value.includes("tips")) {
    return { id: tx.id, glCode: "6000", glCategory: "Labor – FOH" };
  }
  if (value.includes("rent") || value.includes("plaza")) {
    return { id: tx.id, glCode: "7800", glCategory: "Rent" };
  }
  if (value.includes("electric") || value.includes("power") || value.includes("comcast") || value.includes("gas")) {
    return { id: tx.id, glCode: "7100", glCategory: "Utilities" };
  }
  if (value.includes("meta") || value.includes("ads") || value.includes("marketing")) {
    return { id: tx.id, glCode: "7000", glCategory: "Marketing & Advertising" };
  }
  if (value.includes("doordash") || value.includes("uber eats") || value.includes("grubhub") || value.includes("commission") || value.includes("fee")) {
    return { id: tx.id, glCode: "7600", glCategory: "Delivery Commission – DoorDash" };
  }
  if (
    value.includes("sysco") ||
    value.includes("tyson") ||
    value.includes("performance food") ||
    value.includes("protein") ||
    value.includes("beef") ||
    value.includes("pork") ||
    value.includes("chicken") ||
    value.includes("produce")
  ) {
    return { id: tx.id, glCode: "5000", glCategory: "Protein Cost – Beef" };
  }
  if (value.includes("packaging") || value.includes("container") || value.includes("box") || value.includes("webstaurant")) {
    return { id: tx.id, glCode: "7700", glCategory: "Packaging & Containers" };
  }
  if (value.includes("maintenance") || value.includes("repair") || value.includes("hardware")) {
    return { id: tx.id, glCode: "7200", glCategory: "Repairs & Maintenance" };
  }
  if (value.includes("insurance")) {
    return { id: tx.id, glCode: "7900", glCategory: "Insurance" };
  }
  if (value.includes("r365") || value.includes("7shifts") || value.includes("software") || value.includes("subscription")) {
    return { id: tx.id, glCode: "8100", glCategory: "Professional Services" };
  }
  if (value.includes("office")) {
    return { id: tx.id, glCode: "8000", glCategory: "Office & Admin" };
  }

  return { id: tx.id, glCode: "7300", glCategory: "Supplies – Kitchen" };
}

export default function Home() {
  const [authReady, setAuthReady] = useState(false);
  const [viewer, setViewer] = useState("");
  const [usernameInput, setUsernameInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);

  const [activeBrand, setActiveBrand] = useState<Brand>("mighty-quinns");
  const [brandOpen, setBrandOpen] = useState(false);
  const [transactionsByBrand, setTransactionsByBrand] = useState<Record<Brand, Transaction[]>>(
    createInitialTransactionsByBrand
  );
  const [documentsByBrand, setDocumentsByBrand] = useState<Record<Brand, IngestedDocument[]>>(
    createInitialDocumentsByBrand
  );

  const [activeTab, setActiveTab] = useState<Tab>("feed");
  const [showAddModal, setShowAddModal] = useState(false);
  const [isCategorizing, setIsCategorizing] = useState(false);
  const [lastCategorizedAt, setLastCategorizedAt] = useState<string | null>(null);
  const [periodLocked, setPeriodLocked] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [plaidLinkToken, setPlaidLinkToken] = useState<string | null>(null);
  const [plaidPendingOpen, setPlaidPendingOpen] = useState(false);
  const [isPreparingPlaid, setIsPreparingPlaid] = useState(false);
  const [isImportingPlaid, setIsImportingPlaid] = useState(false);
  const [plaidConnected, setPlaidConnected] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(SESSION_KEY);
    if (stored) {
      setViewer(stored);
      setUsernameInput(stored);
    }
    setAuthReady(true);
  }, []);

  const login = useCallback(() => {
    const username = usernameInput.trim();
    const password = passwordInput.trim();
    if (!username || !password) return;
    if (username !== DEMO_USERNAME || password !== DEMO_PASSWORD) {
      setAuthError("Invalid credentials. Use the demo username/password.");
      return;
    }
    setViewer(username);
    localStorage.setItem(SESSION_KEY, username);
    setAuthError(null);
    setApiError(null);
  }, [passwordInput, usernameInput]);

  const logout = useCallback(() => {
    localStorage.removeItem(SESSION_KEY);
    setViewer("");
    setUsernameInput("");
    setPasswordInput("");
    setAuthError(null);
    setApiError(null);
  }, []);

  const transactions = transactionsByBrand[activeBrand];
  const documents = documentsByBrand[activeBrand];
  const currentBrand = BRANDS.find((brand) => brand.id === activeBrand)!;
  const dailySales = activeBrand === "mighty-quinns" ? DAILY_SALES : SUGAR_WING_DAILY_SALES;
  const delivery = activeBrand === "mighty-quinns" ? MQ_DELIVERY_PLATFORMS : SW_DELIVERY_PLATFORMS;
  const isSugarWing = activeBrand === "sugar-wing";

  const applyCategories = useCallback((brand: Brand, categories: CategoryResult[]) => {
    setTransactionsByBrand((prev) => ({
      ...prev,
      [brand]: prev[brand].map((tx) => {
        const mapped = categories.find((item) => item.id === tx.id);
        if (!mapped) return tx;
        return {
          ...tx,
          glCode: mapped.glCode,
          glCategory: mapped.glCategory,
          status: "categorized" as const,
        };
      }),
    }));
    setLastCategorizedAt(new Date().toISOString());
  }, []);

  const categorizeTransactions = useCallback(
    async (brand: Brand, toProcess: Transaction[]) => {
      if (periodLocked) {
        setApiError("Period is locked. Unlock month close before categorizing new activity.");
        return;
      }

      const pending = toProcess.filter((tx) => tx.status === "pending");
      if (pending.length === 0) return;

      setIsCategorizing(true);
      setApiError(null);
      try {
        const res = await fetch("/api/categorize", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            transactions: pending.map((tx) => ({
              id: tx.id,
              rawDescription: tx.rawDescription,
              amount: tx.amount,
              source: tx.source,
            })),
          }),
        });

        const data = await res.json();
        if (!res.ok || data.error || !Array.isArray(data.categories)) {
          const fallback = pending.map(fallbackCategorize);
          applyCategories(brand, fallback);
          setApiError("AI categorize unavailable, fallback rules were applied.");
          return;
        }

        const categories = data.categories
          .filter((item: CategoryResult) => item?.id && item?.glCode && item?.glCategory)
          .map((item: CategoryResult) => ({
            id: item.id,
            glCode: item.glCode,
            glCategory: item.glCategory,
          }));

        applyCategories(brand, categories);
      } catch (err) {
        console.error("Categorization failed:", err);
        const fallback = pending.map(fallbackCategorize);
        applyCategories(brand, fallback);
        setApiError("Categorization request failed, fallback rules were applied.");
      } finally {
        setIsCategorizing(false);
      }
    },
    [applyCategories, periodLocked]
  );

  // Required behavior: run categorization on login and brand switch.
  useEffect(() => {
    if (!viewer || periodLocked) return;
    const pending = transactionsByBrand[activeBrand].filter((tx) => tx.status === "pending");
    if (pending.length === 0) return;
    void categorizeTransactions(activeBrand, pending);
  }, [activeBrand, categorizeTransactions, periodLocked, transactionsByBrand, viewer]);

  const handleCategorizeAll = useCallback(() => {
    void categorizeTransactions(activeBrand, transactionsByBrand[activeBrand]);
  }, [activeBrand, categorizeTransactions, transactionsByBrand]);

  const handleAddExpense = useCallback(
    (tx: Transaction, _autoCategorize: boolean) => {
      void _autoCategorize;
      if (periodLocked) {
        setApiError("Period is locked. Unlock month close before adding transactions.");
        return;
      }

      setTransactionsByBrand((prev) => ({
        ...prev,
        [activeBrand]: [tx, ...prev[activeBrand]],
      }));

      // Required behavior: always auto-categorize whenever new data is added.
      setTimeout(() => {
        void categorizeTransactions(activeBrand, [tx]);
      }, 50);
    },
    [activeBrand, categorizeTransactions, periodLocked]
  );

  const applyImportedTransactions = useCallback(
    (imported: Transaction[]) => {
      if (periodLocked) {
        setApiError("Period is locked. Unlock month close before importing transactions.");
        return;
      }

      if (imported.length === 0) {
        setApiError("Plaid connected, but no transactions were returned for the last 30 days.");
        setPlaidConnected(true);
        return;
      }

      const existingIds = new Set(transactions.map((tx) => tx.id));
      const freshTransactions = imported.filter((tx) => !existingIds.has(tx.id));

      if (freshTransactions.length === 0) {
        setPlaidConnected(true);
        return;
      }

      setTransactionsByBrand((prev) => ({
        ...prev,
        [activeBrand]: [...freshTransactions, ...prev[activeBrand]].sort((a, b) =>
          b.date.localeCompare(a.date)
        ),
      }));

      setPlaidConnected(true);
      setTimeout(() => {
        void categorizeTransactions(activeBrand, freshTransactions);
      }, 50);
    },
    [activeBrand, categorizeTransactions, periodLocked, transactions]
  );

  const importPlaidTransactions = useCallback(
    async (publicToken: string) => {
      setIsImportingPlaid(true);
      setApiError(null);
      try {
        const res = await fetch("/api/plaid/exchange-public-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ publicToken }),
        });
        const data = await res.json();

        if (!res.ok || data.error) {
          setApiError(data.error || "Failed to import transactions from Plaid.");
          return;
        }

        const imported = Array.isArray(data.transactions)
          ? (data.transactions as Transaction[])
          : [];

        applyImportedTransactions(imported);
      } catch (err) {
        console.error("Plaid import failed:", err);
        setApiError("Plaid connection failed. Check your Plaid credentials and try again.");
      } finally {
        setIsImportingPlaid(false);
        setPlaidLinkToken(null);
      }
    },
    [applyImportedTransactions]
  );

  const { open: openPlaid, ready: plaidReady } = usePlaidLink({
    token: plaidLinkToken,
    onSuccess: (publicToken) => {
      void importPlaidTransactions(publicToken);
    },
    onExit: (error) => {
      if (error?.error_message) setApiError(`Plaid: ${error.error_message}`);
      setPlaidPendingOpen(false);
    },
  });

  useEffect(() => {
    if (plaidPendingOpen && plaidReady) {
      openPlaid();
      setPlaidPendingOpen(false);
    }
  }, [openPlaid, plaidPendingOpen, plaidReady]);

  const handleConnectPlaid = useCallback(async () => {
    if (periodLocked) {
      setApiError("Period is locked. Unlock month close before importing transactions.");
      return;
    }

    setApiError(null);
    setIsPreparingPlaid(true);
    try {
      const res = await fetch("/api/plaid/create-link-token", { method: "POST" });
      const data = await res.json();
      if (!res.ok || data.error) {
        setApiError(data.error || "Failed to initialize Plaid Link.");
        return;
      }
      setPlaidLinkToken(data.linkToken);
      setPlaidPendingOpen(true);
    } catch (err) {
      console.error("Plaid init failed:", err);
      setApiError("Unable to initialize Plaid Link. Check your server configuration.");
    } finally {
      setIsPreparingPlaid(false);
    }
  }, [periodLocked]);

  const handleExtractDocuments = useCallback(
    (incoming: IngestedDocument[]) => {
      setDocumentsByBrand((prev) => ({
        ...prev,
        [activeBrand]: [...incoming, ...prev[activeBrand]],
      }));
    },
    [activeBrand]
  );

  const handleApproveDocument = useCallback(
    (id: string) => {
      const target = documents.find((doc) => doc.id === id);
      if (!target || target.status !== "pending") return;

      setDocumentsByBrand((prev) => ({
        ...prev,
        [activeBrand]: prev[activeBrand].map((doc) =>
          doc.id === id ? { ...doc, status: "approved" as const } : doc
        ),
      }));

      if (periodLocked) {
        setApiError("Period is locked. Approved docs will not post transactions until unlocked.");
        return;
      }

      const tx: Transaction = {
        id: `ING-${id}`,
        source: "Amex",
        date: target.date,
        description: `Receipt: ${target.vendor}`,
        rawDescription: target.fileName.toUpperCase(),
        amount: -Math.abs(target.amount),
        glCode: target.glCode,
        glCategory: target.glCategory,
        status: "categorized",
      };

      setTransactionsByBrand((prev) => ({
        ...prev,
        [activeBrand]: [tx, ...prev[activeBrand]],
      }));
    },
    [activeBrand, documents, periodLocked]
  );

  const handleRejectDocument = useCallback(
    (id: string) => {
      setDocumentsByBrand((prev) => ({
        ...prev,
        [activeBrand]: prev[activeBrand].map((doc) =>
          doc.id === id ? { ...doc, status: "rejected" as const } : doc
        ),
      }));
    },
    [activeBrand]
  );

  const switchBrand = useCallback((brand: Brand) => {
    setActiveBrand(brand);
    setPlaidConnected(false);
    setApiError(null);
    setBrandOpen(false);
  }, []);

  const totalIncome = transactions
    .filter((tx) => tx.amount > 0)
    .reduce((sum, tx) => sum + tx.amount, 0);
  const totalExpenses = transactions
    .filter((tx) => tx.amount < 0)
    .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
  const netCash = totalIncome - totalExpenses;
  const categorizedCount = transactions.filter(
    (tx) => tx.status === "categorized" || tx.status === "matched"
  ).length;

  const foodCostKeywords = [
    "protein",
    "beef",
    "pork",
    "chicken",
    "tyson",
    "performance food",
    "sysco",
    "produce",
    "dry goods",
  ];
  const foodSalesKeywords = [
    "food sales",
    "bbq sales",
    "wing orders",
    "doordash",
    "ubereats",
    "grubhub",
    "catering",
  ];

  const foodCostTotal = transactions
    .filter((tx) => tx.amount < 0)
    .filter((tx) =>
      foodCostKeywords.some((key) =>
        `${tx.glCategory ?? ""} ${tx.description}`.toLowerCase().includes(key)
      )
    )
    .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);

  const foodSalesTotal = transactions
    .filter((tx) => tx.amount > 0)
    .filter((tx) => foodSalesKeywords.some((key) => tx.description.toLowerCase().includes(key)))
    .reduce((sum, tx) => sum + tx.amount, 0);

  const foodCostPct = foodSalesTotal > 0 ? (foodCostTotal / foodSalesTotal) * 100 : 0;

  const deliveryTotal = delivery.reduce((sum, platform) => sum + platform.grossSales, 0);
  const totalPeriodSales = dailySales.reduce((sum, day) => sum + day.sales, 0);

  const reconciliationAnalysis = useMemo(
    () => buildReconciliationAnalysis(transactions),
    [transactions]
  );

  const approvedReceiptCount = documents.filter((doc) => doc.status === "approved").length;

  const consolidatedRows = useMemo(() => {
    return [
      {
        brandLabel: "Mighty Quinn's BBQ",
        location: "Tampa · Dale Mabry",
        metrics: computeBrandFinancialMetrics(
          "mighty-quinns",
          transactionsByBrand["mighty-quinns"],
          MQ_DELIVERY_PLATFORMS
        ),
      },
      {
        brandLabel: "Sugar Wing",
        location: "Tampa · Ghost Kitchen",
        metrics: computeBrandFinancialMetrics(
          "sugar-wing",
          transactionsByBrand["sugar-wing"],
          SW_DELIVERY_PLATFORMS
        ),
      },
    ];
  }, [transactionsByBrand]);

  if (!authReady) {
    return <div className="min-h-screen bg-slate-50" />;
  }

  if (!viewer) {
    return (
      <LoginScreen
        username={usernameInput}
        password={passwordInput}
        error={authError}
        onUsernameChange={setUsernameInput}
        onPasswordChange={setPasswordInput}
        onLogin={login}
      />
    );
  }

  return (
    <div className="min-h-screen" onClick={() => brandOpen && setBrandOpen(false)}>
      <header className="bg-white/90 backdrop-blur border-b border-slate-200 sticky top-0 z-20 shadow-[0_1px_0_0_rgba(15,23,42,0.03)]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-slate-900 tracking-tight">EMfire Brands</span>
              <span className="text-slate-300">/</span>
              <div className="relative" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => setBrandOpen((open) => !open)}
                  className="flex items-center gap-1.5 text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors"
                >
                  <span className={`w-2 h-2 rounded-full ${currentBrand.badge}`} />
                  {currentBrand.label}
                  <span className="text-[10px] text-slate-400 font-normal">{currentBrand.location}</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>
                {brandOpen && (
                  <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-slate-200 rounded-lg shadow-lg z-20 overflow-hidden">
                    {BRANDS.map((brand) => (
                      <button
                        key={brand.id}
                        onClick={() => switchBrand(brand.id)}
                        className={`w-full flex items-start gap-2.5 px-4 py-3 text-left hover:bg-slate-50 transition-colors ${
                          brand.id === activeBrand ? "bg-indigo-50" : ""
                        }`}
                      >
                        <span className={`w-2 h-2 rounded-full mt-1 flex-shrink-0 ${brand.badge}`} />
                        <div>
                          <p className="text-xs font-semibold text-slate-900">{brand.label}</p>
                          <p className="text-[11px] text-slate-400">{brand.location}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {periodLocked && (
                <span className="inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded border border-amber-300 bg-amber-50 text-amber-700">
                  <Lock className="w-3 h-3" />
                  Period Locked
                </span>
              )}
              <button
                onClick={handleConnectPlaid}
                disabled={isPreparingPlaid || isImportingPlaid || periodLocked}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-md hover:bg-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Link2 className="w-3 h-3" />
                {isPreparingPlaid
                  ? "Preparing Plaid..."
                  : isImportingPlaid
                    ? "Importing..."
                    : plaidConnected
                      ? "Reconnect Plaid"
                      : "Connect Plaid"}
              </button>
              <button
                onClick={logout}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 border border-slate-200 rounded-md hover:bg-slate-50 transition-colors"
              >
                <LogOut className="w-3 h-3" />
                {viewer}
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <div className="flex min-w-max">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2.5 text-xs font-medium border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? tab.id === "chat"
                        ? "border-indigo-600 text-indigo-600"
                        : "border-slate-900 text-slate-900"
                      : "border-transparent text-slate-400 hover:text-slate-600"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[1240px] mx-auto px-6 py-7 space-y-4">
        {apiError && (
          <div className="border border-red-200 bg-red-50 rounded-md px-4 py-3 text-xs text-red-700">
            <span className="font-semibold">Notice:</span> {apiError}
          </div>
        )}

        <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
          <StatCard
            label="Total Income"
            value={`$${totalIncome.toLocaleString("en-US", { minimumFractionDigits: 2 })}`}
            sub="Credits"
            accent="green"
          />
          <StatCard
            label="Total Expenses"
            value={`$${totalExpenses.toLocaleString("en-US", { minimumFractionDigits: 2 })}`}
            sub="Debits"
            accent="neutral"
          />
          <StatCard
            label="Net Cash Flow"
            value={`${netCash >= 0 ? "+" : ""}$${netCash.toLocaleString("en-US", { minimumFractionDigits: 2 })}`}
            sub="Current period"
            accent={netCash >= 0 ? "green" : "red"}
          />
          <StatCard
            label="Food Cost %"
            value={foodCostPct > 0 ? `${foodCostPct.toFixed(1)}%` : "—"}
            sub={foodCostPct > 32 ? "Above target" : "On target"}
            accent={foodCostPct > 32 ? "red" : "green"}
          />
          <StatCard
            label="Delivery Revenue"
            value={`${totalPeriodSales > 0 ? ((deliveryTotal / totalPeriodSales) * 100).toFixed(0) : "100"}%`}
            sub={`$${deliveryTotal.toLocaleString()} via apps`}
            accent={isSugarWing ? "indigo" : "neutral"}
          />
          <StatCard
            label="GL Categorized"
            value={`${categorizedCount} / ${transactions.length}`}
            sub={lastCategorizedAt ? "Auto-run active" : "Waiting"}
            accent={categorizedCount > 0 ? "indigo" : "neutral"}
          />
        </div>

        {activeTab === "feed" && (
          <>
            <TransactionFeed
              transactions={transactions}
              onCategorizeAll={handleCategorizeAll}
              onAddExpense={() => setShowAddModal(true)}
              isLoading={isCategorizing}
            />
            <GLBuckets transactions={transactions} />
          </>
        )}

        {activeTab === "categorize" && (
          <CategorizationTab
            transactions={transactions}
            isLoading={isCategorizing}
            onCategorizeAll={handleCategorizeAll}
            lastRunAt={lastCategorizedAt}
          />
        )}

        {activeTab === "reconcile" && <ReconciliationView transactions={transactions} />}

        {activeTab === "close" && (
          <MonthlyCloseWorkflow
            transactions={transactions}
            reconciliation={reconciliationAnalysis}
            approvedReceiptCount={approvedReceiptCount}
            periodLocked={periodLocked}
            onToggleLock={() => setPeriodLocked((locked) => !locked)}
          />
        )}

        {activeTab === "reporting" && <ConsolidatedReporting rows={consolidatedRows} />}

        {activeTab === "delivery" && (
          <div className="space-y-4">
            <DeliveryBreakdown
              platforms={delivery}
              totalRevenue={totalPeriodSales}
              brandName={currentBrand.label}
            />
            <DeliveryProfitability
              platforms={delivery}
              transactions={transactions}
              brandName={currentBrand.label}
            />
          </div>
        )}

        {activeTab === "ingestion" && (
          <ReceiptIngestion
            documents={documents}
            onExtracted={handleExtractDocuments}
            onApprove={handleApproveDocument}
            onReject={handleRejectDocument}
          />
        )}

        {activeTab === "alerts" && (
          <AlertsDigest
            brand={activeBrand}
            transactions={transactions}
            deliveryPlatforms={delivery}
            brandName={currentBrand.label}
          />
        )}

        {activeTab === "forecast" && (
          <ForecastScenario
            brand={activeBrand}
            brandName={currentBrand.label}
            transactions={transactions}
            dailySales={dailySales}
            deliveryPlatforms={delivery}
          />
        )}

        {activeTab === "trends" && (
          <SalesTrendChart
            dailySales={dailySales}
            brandName={currentBrand.label}
            isSugarWing={isSugarWing}
          />
        )}

        {activeTab === "chat" && <ChatTab transactions={transactions} />}
      </main>

      {showAddModal && (
        <AddExpenseModal
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddExpense}
        />
      )}
    </div>
  );
}
