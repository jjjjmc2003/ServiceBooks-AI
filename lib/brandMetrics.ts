import type {
  Brand,
  DailySales,
  DeliveryPlatformData,
  Transaction,
} from "@/lib/mockData";

export interface BrandFinancialMetrics {
  brand: Brand;
  revenue: number;
  expenses: number;
  laborCost: number;
  foodCost: number;
  deliveryFees: number;
  contributionMargin: number;
  contributionMarginPct: number;
  foodCostPct: number;
  laborPct: number;
  deliveryFeePct: number;
}

export interface DeliveryProfitabilityRow {
  platform: DeliveryPlatformData["platform"];
  orders: number;
  grossSales: number;
  commission: number;
  promos: number;
  refunds: number;
  packaging: number;
  cogs: number;
  netContribution: number;
  trueMarginPct: number;
  marginPerOrder: number;
}

const FOOD_KEYWORDS = [
  "protein",
  "beef",
  "pork",
  "chicken",
  "tyson",
  "sysco",
  "dry goods",
  "produce",
];

const LABOR_KEYWORDS = ["adp", "payroll", "labor", "tips"];
const PACKAGING_KEYWORDS = ["packaging", "container", "box", "to-go"];

function includesAny(value: string, keys: string[]) {
  const lower = value.toLowerCase();
  return keys.some((key) => lower.includes(key));
}

export function computeBrandFinancialMetrics(
  brand: Brand,
  transactions: Transaction[],
  platforms: DeliveryPlatformData[]
): BrandFinancialMetrics {
  const revenue = transactions
    .filter((tx) => tx.amount > 0)
    .reduce((sum, tx) => sum + tx.amount, 0);

  const expenses = transactions
    .filter((tx) => tx.amount < 0)
    .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);

  const laborCost = transactions
    .filter((tx) => tx.amount < 0)
    .filter((tx) => {
      const gl = tx.glCode ?? "";
      const ref = `${tx.description} ${tx.rawDescription} ${tx.glCategory ?? ""}`;
      return gl.startsWith("6") || includesAny(ref, LABOR_KEYWORDS);
    })
    .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);

  const foodCost = transactions
    .filter((tx) => tx.amount < 0)
    .filter((tx) => {
      const gl = tx.glCode ?? "";
      const ref = `${tx.description} ${tx.rawDescription} ${tx.glCategory ?? ""}`;
      return gl.startsWith("5") || includesAny(ref, FOOD_KEYWORDS);
    })
    .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);

  const deliveryFees = platforms.reduce(
    (sum, platform) => sum + platform.grossSales * platform.commissionPct,
    0
  );

  const contributionMargin = revenue - (laborCost + foodCost + deliveryFees);
  const safeRevenue = revenue > 0 ? revenue : 1;

  return {
    brand,
    revenue,
    expenses,
    laborCost,
    foodCost,
    deliveryFees,
    contributionMargin,
    contributionMarginPct: (contributionMargin / safeRevenue) * 100,
    foodCostPct: (foodCost / safeRevenue) * 100,
    laborPct: (laborCost / safeRevenue) * 100,
    deliveryFeePct: (deliveryFees / safeRevenue) * 100,
  };
}

export function computeDeliveryProfitability(
  platforms: DeliveryPlatformData[],
  transactions: Transaction[]
): DeliveryProfitabilityRow[] {
  const totalOrders = platforms.reduce((sum, platform) => sum + platform.orders, 0) || 1;

  const packagingPool = transactions
    .filter((tx) => tx.amount < 0)
    .filter((tx) =>
      includesAny(`${tx.description} ${tx.rawDescription} ${tx.glCategory ?? ""}`, PACKAGING_KEYWORDS)
    )
    .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);

  return platforms.map((platform) => {
    const grossSales = platform.grossSales;
    const orderShare = platform.orders / totalOrders;
    const commission = grossSales * platform.commissionPct;

    // Assumption model for MVP profitability. These are tunable controls later.
    const promoRate = platform.platform === "UberEats" ? 0.05 : platform.platform === "DoorDash" ? 0.04 : 0.03;
    const refundRate = platform.platform === "DoorDash" ? 0.025 : 0.02;
    const cogsRate = 0.32;

    const promos = grossSales * promoRate;
    const refunds = grossSales * refundRate;
    const packaging = packagingPool * orderShare;
    const cogs = grossSales * cogsRate;

    const netContribution =
      grossSales - commission - promos - refunds - packaging - cogs;

    return {
      platform: platform.platform,
      orders: platform.orders,
      grossSales,
      commission,
      promos,
      refunds,
      packaging,
      cogs,
      netContribution,
      trueMarginPct: grossSales > 0 ? (netContribution / grossSales) * 100 : 0,
      marginPerOrder: platform.orders > 0 ? netContribution / platform.orders : 0,
    };
  });
}

export function averageDailySales(dailySales: DailySales[]) {
  if (dailySales.length === 0) return 0;
  return dailySales.reduce((sum, day) => sum + day.sales, 0) / dailySales.length;
}
