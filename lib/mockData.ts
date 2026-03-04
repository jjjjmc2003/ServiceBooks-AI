export type TransactionSource = "Toast" | "BofA" | "Amex";
export type TransactionStatus = "pending" | "categorized" | "matched" | "flagged";
export type Brand = "mighty-quinns" | "sugar-wing";

export interface Transaction {
  id: string;
  source: TransactionSource;
  date: string;
  description: string;
  amount: number; // positive = credit/income, negative = debit/expense
  rawDescription: string;
  glCategory?: string;
  glCode?: string;
  status: TransactionStatus;
  matchedId?: string;
  flagReason?: string;
}

export interface DailySales {
  date: string;
  sales: number;
  covers: number;
  avgCheck: number;
}

// GL Category reference for a fast-casual BBQ / wings operator
export const GL_CATEGORIES: Record<string, string> = {
  "4000": "Food Sales – Dine-In",
  "4100": "Food Sales – Delivery",
  "4200": "Beverage Sales – Beer/NA",
  "4300": "Catering Revenue",
  "5000": "Protein Cost – Beef",
  "5100": "Protein Cost – Pork",
  "5200": "Protein Cost – Chicken",
  "5300": "Dry Goods & Sides",
  "5400": "Beverage Cost",
  "6000": "Labor – FOH",
  "6100": "Labor – BOH / Pit",
  "6200": "Labor – Management",
  "7000": "Marketing & Advertising",
  "7100": "Utilities",
  "7200": "Repairs & Maintenance",
  "7300": "Supplies – Kitchen",
  "7400": "Smoker Fuel & Wood",
  "7500": "Credit Card Processing Fees",
  "7600": "Delivery Commission – DoorDash",
  "7610": "Delivery Commission – UberEats",
  "7620": "Delivery Commission – Grubhub",
  "7650": "Franchise Royalty Fee",
  "7700": "Packaging & Containers",
  "7800": "Rent",
  "7900": "Insurance",
  "8000": "Office & Admin",
  "8100": "Professional Services",
};

// Mighty Quinn's BBQ – Tampa (Dale Mabry) · fast-casual BBQ, avg check ~$22
export const DAILY_SALES: DailySales[] = [
  { date: "2026-02-01", sales: 5840,  covers: 264, avgCheck: 22.1 },
  { date: "2026-02-02", sales: 9120,  covers: 408, avgCheck: 22.4 }, // Mon Presidents' Day
  { date: "2026-02-03", sales: 8480,  covers: 382, avgCheck: 22.2 },
  { date: "2026-02-04", sales: 6920,  covers: 310, avgCheck: 22.3 },
  { date: "2026-02-05", sales: 5480,  covers: 248, avgCheck: 22.1 },
  { date: "2026-02-06", sales: 5120,  covers: 230, avgCheck: 22.3 },
  { date: "2026-02-07", sales: 6340,  covers: 286, avgCheck: 22.2 },
  { date: "2026-02-08", sales: 6640,  covers: 300, avgCheck: 22.1 },
  { date: "2026-02-09", sales: 9640,  covers: 432, avgCheck: 22.3 },
  { date: "2026-02-10", sales: 10180, covers: 458, avgCheck: 22.2 },
  { date: "2026-02-11", sales: 7480,  covers: 336, avgCheck: 22.3 },
  { date: "2026-02-12", sales: 5940,  covers: 268, avgCheck: 22.2 },
  { date: "2026-02-13", sales: 8160,  covers: 366, avgCheck: 22.3 },
  { date: "2026-02-14", sales: 11240, covers: 498, avgCheck: 22.6 }, // Valentine's Day
  { date: "2026-02-15", sales: 6740,  covers: 304, avgCheck: 22.2 },
  { date: "2026-02-16", sales: 6520,  covers: 294, avgCheck: 22.2 },
  { date: "2026-02-17", sales: 7320,  covers: 330, avgCheck: 22.2 },
  { date: "2026-02-18", sales: 7740,  covers: 348, avgCheck: 22.2 },
  { date: "2026-02-19", sales: 9840,  covers: 442, avgCheck: 22.3 },
  { date: "2026-02-20", sales: 9280,  covers: 418, avgCheck: 22.2 },
  { date: "2026-02-21", sales: 7240,  covers: 326, avgCheck: 22.2 },
  { date: "2026-02-22", sales: 6220,  covers: 280, avgCheck: 22.2 },
  { date: "2026-02-23", sales: 6660,  covers: 300, avgCheck: 22.2 },
  { date: "2026-02-24", sales: 7440,  covers: 334, avgCheck: 22.3 },
  { date: "2026-02-25", sales: 9480,  covers: 426, avgCheck: 22.3 },
  { date: "2026-02-26", sales: 9900,  covers: 444, avgCheck: 22.3 },
  { date: "2026-02-27", sales: 7880,  covers: 354, avgCheck: 22.3 },
  { date: "2026-02-28", sales: 6520,  covers: 293, avgCheck: 22.2 },
  { date: "2026-03-01", sales: 7680,  covers: 344, avgCheck: 22.3 },
  { date: "2026-03-02", sales: 8260,  covers: 372, avgCheck: 22.2 },
];

// Sugar Wing – Tampa ghost kitchen · 100% delivery, avg order ~$26
export const SUGAR_WING_DAILY_SALES: DailySales[] = [
  { date: "2026-02-01", sales: 1840, covers: 72,  avgCheck: 25.6 },
  { date: "2026-02-02", sales: 2480, covers: 96,  avgCheck: 25.8 },
  { date: "2026-02-03", sales: 3120, covers: 120, avgCheck: 26.0 },
  { date: "2026-02-04", sales: 2940, covers: 113, avgCheck: 26.0 },
  { date: "2026-02-05", sales: 1920, covers: 74,  avgCheck: 25.9 },
  { date: "2026-02-06", sales: 1760, covers: 68,  avgCheck: 25.9 },
  { date: "2026-02-07", sales: 2080, covers: 80,  avgCheck: 26.0 },
  { date: "2026-02-08", sales: 2200, covers: 85,  avgCheck: 25.9 },
  { date: "2026-02-09", sales: 3040, covers: 117, avgCheck: 26.0 },
  { date: "2026-02-10", sales: 3360, covers: 129, avgCheck: 26.0 },
  { date: "2026-02-11", sales: 2560, covers: 99,  avgCheck: 25.9 },
  { date: "2026-02-12", sales: 2000, covers: 77,  avgCheck: 26.0 },
  { date: "2026-02-13", sales: 2640, covers: 102, avgCheck: 25.9 },
  { date: "2026-02-14", sales: 4080, covers: 156, avgCheck: 26.2 }, // Valentine's spike
  { date: "2026-02-15", sales: 2160, covers: 83,  avgCheck: 26.0 },
  { date: "2026-02-16", sales: 2080, covers: 80,  avgCheck: 26.0 },
  { date: "2026-02-17", sales: 2320, covers: 89,  avgCheck: 26.1 },
  { date: "2026-02-18", sales: 2480, covers: 95,  avgCheck: 26.1 },
  { date: "2026-02-19", sales: 3200, covers: 123, avgCheck: 26.0 },
  { date: "2026-02-20", sales: 3040, covers: 117, avgCheck: 26.0 },
  { date: "2026-02-21", sales: 2400, covers: 92,  avgCheck: 26.1 },
  { date: "2026-02-22", sales: 2080, covers: 80,  avgCheck: 26.0 },
  { date: "2026-02-23", sales: 2240, covers: 86,  avgCheck: 26.0 },
  { date: "2026-02-24", sales: 2560, covers: 98,  avgCheck: 26.1 },
  { date: "2026-02-25", sales: 3280, covers: 126, avgCheck: 26.0 },
  { date: "2026-02-26", sales: 3440, covers: 132, avgCheck: 26.1 },
  { date: "2026-02-27", sales: 2720, covers: 105, avgCheck: 25.9 },
  { date: "2026-02-28", sales: 2160, covers: 83,  avgCheck: 26.0 },
  { date: "2026-03-01", sales: 2640, covers: 102, avgCheck: 25.9 },
  { date: "2026-03-02", sales: 3040, covers: 117, avgCheck: 26.0 },
];

export interface DeliveryPlatformData {
  platform: "DoorDash" | "UberEats" | "Grubhub";
  grossSales: number;
  commissionPct: number;
  orders: number;
  color: string;
}

// Mighty Quinn's – last 30 days delivery breakdown (mix of dine-in + delivery)
export const MQ_DELIVERY_PLATFORMS: DeliveryPlatformData[] = [
  { platform: "DoorDash", grossSales: 8420,  commissionPct: 0.25, orders: 312, color: "#FF3008" },
  { platform: "UberEats", grossSales: 5180,  commissionPct: 0.30, orders: 194, color: "#06C167" },
];

// Sugar Wing – 100% delivery, all three platforms
export const SW_DELIVERY_PLATFORMS: DeliveryPlatformData[] = [
  { platform: "DoorDash", grossSales: 22640, commissionPct: 0.25, orders: 871, color: "#FF3008" },
  { platform: "UberEats", grossSales: 16280, commissionPct: 0.30, orders: 626, color: "#06C167" },
  { platform: "Grubhub",  grossSales: 7820,  commissionPct: 0.25, orders: 301, color: "#F63440" },
];

// ─── MIGHTY QUINN'S BBQ – Tampa Dale Mabry ───────────────────────────────────

// Toast POS transactions
export const TOAST_TRANSACTIONS: Transaction[] = [
  {
    id: "TST-001",
    source: "Toast",
    date: "2026-03-02",
    description: "Lunch Service – BBQ Sales",
    rawDescription: "TOAST POS BATCH SETTLE FOOD 03/02 LUNCH",
    amount: 4280.5,
    status: "pending",
  },
  {
    id: "TST-002",
    source: "Toast",
    date: "2026-03-02",
    description: "Dinner Service – BBQ Sales",
    rawDescription: "TOAST POS BATCH SETTLE FOOD 03/02 DINNER",
    amount: 6940.0,
    status: "pending",
  },
  {
    id: "TST-003",
    source: "Toast",
    date: "2026-03-02",
    description: "DoorDash In-Store Sales",
    rawDescription: "TOAST DELIVERY DOORDASH 03/02",
    amount: 1840.25,
    status: "pending",
  },
  {
    id: "TST-004",
    source: "Toast",
    date: "2026-03-02",
    description: "UberEats In-Store Sales",
    rawDescription: "TOAST DELIVERY UBEREATS 03/02",
    amount: 1120.0,
    status: "pending",
  },
  {
    id: "TST-005",
    source: "Toast",
    date: "2026-03-01",
    description: "Lunch Service – BBQ Sales",
    rawDescription: "TOAST POS BATCH SETTLE FOOD 03/01 LUNCH",
    amount: 3640.0,
    status: "pending",
  },
  {
    id: "TST-006",
    source: "Toast",
    date: "2026-03-01",
    description: "Manager Comp – Guest Recovery",
    rawDescription: "TOAST VOID/COMP MANAGER 03/01",
    amount: -142.0,
    status: "pending",
  },
  {
    id: "TST-007",
    source: "Toast",
    date: "2026-02-28",
    description: "Catering Order – Office Party",
    rawDescription: "TOAST CATERING DEPOSIT 02/28",
    amount: 1800.0,
    status: "pending",
  },
];

// Bank of America checking account
export const BOFA_TRANSACTIONS: Transaction[] = [
  {
    id: "BOF-001",
    source: "BofA",
    date: "2026-03-02",
    description: "Toast POS Settlement",
    rawDescription: "TOAST INC SETTLEMENT 030226 REF#884921",
    amount: 9840.25,
    status: "pending",
  },
  {
    id: "BOF-002",
    source: "BofA",
    date: "2026-03-01",
    description: "Performance Food Group – Beef & Pork",
    rawDescription: "PERFORMANCE FOOD GRP ACH DEBIT 030126",
    amount: -8920.0,
    status: "pending",
  },
  {
    id: "BOF-003",
    source: "BofA",
    date: "2026-03-01",
    description: "FPL – Electric (Smokers)",
    rawDescription: "FLORIDA POWER LIGHT ACH 030126",
    amount: -1240.0,
    status: "pending",
  },
  {
    id: "BOF-004",
    source: "BofA",
    date: "2026-02-28",
    description: "ADP Payroll – Bi-Weekly",
    rawDescription: "ADP PAYROLL FEES 022826 REF#221047",
    amount: -14800.5,
    status: "pending",
  },
  {
    id: "BOF-005",
    source: "BofA",
    date: "2026-02-28",
    description: "Rent – 202 N Dale Mabry Hwy",
    rawDescription: "MABRY PLAZA LLC ACH 022826",
    amount: -8500.0,
    status: "pending",
  },
  {
    id: "BOF-006",
    source: "BofA",
    date: "2026-02-28",
    description: "Mighty Quinn's Franchise Royalty (6%)",
    rawDescription: "MIGHTY QUINNS FRANCHISE ROYALTY 022826",
    amount: -4620.0,
    status: "pending",
  },
  {
    id: "BOF-007",
    source: "BofA",
    date: "2026-02-27",
    description: "DoorDash Payout",
    rawDescription: "DOORDASH INC TRANSFER 022726",
    amount: 1890.42,
    status: "pending",
  },
  {
    id: "BOF-008",
    source: "BofA",
    date: "2026-02-27",
    description: "UberEats Payout",
    rawDescription: "UBER EATS TRANSFER 022726",
    amount: 1162.0,
    status: "pending",
  },
  {
    id: "BOF-009",
    source: "BofA",
    date: "2026-02-26",
    description: "Toast POS Settlement",
    rawDescription: "TOAST INC SETTLEMENT 022626 REF#881432",
    amount: 9900.0,
    status: "pending",
  },
  {
    id: "BOF-010",
    source: "BofA",
    date: "2026-02-25",
    description: "Republic Services – Waste",
    rawDescription: "REPUBLIC SERVICES ACH 022526",
    amount: -318.5,
    status: "pending",
  },
];

// American Express corporate card
export const AMEX_TRANSACTIONS: Transaction[] = [
  {
    id: "AMX-001",
    source: "Amex",
    date: "2026-03-02",
    description: "Restaurant Depot – Kitchen Supplies",
    rawDescription: "RESTAURANT DEPOT #0412 TAMPA FL",
    amount: -820.38,
    status: "pending",
  },
  {
    id: "AMX-002",
    source: "Amex",
    date: "2026-03-01",
    description: "BBQr's Delight – Oak/Cherry Wood Pellets",
    rawDescription: "BBQRS DELIGHT SMOKER FUEL 03012026",
    amount: -680.0,
    status: "pending",
  },
  {
    id: "AMX-003",
    source: "Amex",
    date: "2026-03-01",
    description: "Meta Ads – Tampa Market Campaign",
    rawDescription: "META ADS FACEBOOK ADS 03012026",
    amount: -450.0,
    status: "pending",
  },
  {
    id: "AMX-004",
    source: "Amex",
    date: "2026-02-28",
    description: "7Shifts – Staff Scheduling",
    rawDescription: "7SHIFTS SOFTWARE SUB 022826",
    amount: -99.0,
    status: "pending",
  },
  {
    id: "AMX-005",
    source: "Amex",
    date: "2026-02-28",
    description: "Ecolab – Sanitation & Cleaning",
    rawDescription: "ECOLAB INC ACH 022826",
    amount: -410.0,
    status: "pending",
  },
  {
    id: "AMX-006",
    source: "Amex",
    date: "2026-02-27",
    description: "Ace Hardware – Maintenance",
    rawDescription: "ACE HARDWARE #1847 02272026",
    amount: -187.42,
    status: "pending",
  },
  {
    id: "AMX-007",
    source: "Amex",
    date: "2026-02-27",
    description: "Sysco – Produce & Dry Goods",
    rawDescription: "SYSCO FOODS INC ACH DEBIT 022726",
    amount: -1840.0,
    status: "pending",
  },
  {
    id: "AMX-008",
    source: "Amex",
    date: "2026-02-26",
    description: "R365 – Restaurant365 SaaS",
    rawDescription: "RESTAURANT365 INC SUB 022626",
    amount: -399.0,
    status: "pending",
  },
  {
    id: "AMX-009",
    source: "Amex",
    date: "2026-02-26",
    description: "Packaging – To-Go Containers",
    rawDescription: "WEBSTAURANTSTORE.COM 02262026",
    amount: -342.0,
    status: "pending",
  },
  {
    id: "AMX-010",
    source: "Amex",
    date: "2026-02-25",
    description: "Office & Admin Supplies",
    rawDescription: "OFFICE DEPOT #2244 02252026",
    amount: -94.17,
    status: "pending",
  },
];

// ─── SUGAR WING – Tampa Ghost Kitchen ────────────────────────────────────────

export const SW_TOAST_TRANSACTIONS: Transaction[] = [
  {
    id: "SW-TST-001",
    source: "Toast",
    date: "2026-03-02",
    description: "DoorDash Wing Orders",
    rawDescription: "TOAST DELIVERY DOORDASH 03/02 SUGAR WING",
    amount: 3840.0,
    status: "pending",
  },
  {
    id: "SW-TST-002",
    source: "Toast",
    date: "2026-03-02",
    description: "UberEats Wing Orders",
    rawDescription: "TOAST DELIVERY UBEREATS 03/02 SUGAR WING",
    amount: 2920.0,
    status: "pending",
  },
  {
    id: "SW-TST-003",
    source: "Toast",
    date: "2026-03-02",
    description: "Grubhub Wing Orders",
    rawDescription: "TOAST DELIVERY GRUBHUB 03/02 SUGAR WING",
    amount: 1480.0,
    status: "pending",
  },
  {
    id: "SW-TST-004",
    source: "Toast",
    date: "2026-03-01",
    description: "DoorDash Wing Orders",
    rawDescription: "TOAST DELIVERY DOORDASH 03/01 SUGAR WING",
    amount: 2980.0,
    status: "pending",
  },
  {
    id: "SW-TST-005",
    source: "Toast",
    date: "2026-03-01",
    description: "UberEats Wing Orders",
    rawDescription: "TOAST DELIVERY UBEREATS 03/01 SUGAR WING",
    amount: 2160.0,
    status: "pending",
  },
  {
    id: "SW-TST-006",
    source: "Toast",
    date: "2026-03-01",
    description: "Grubhub Wing Orders",
    rawDescription: "TOAST DELIVERY GRUBHUB 03/01 SUGAR WING",
    amount: 1040.0,
    status: "pending",
  },
];

export const SW_BOFA_TRANSACTIONS: Transaction[] = [
  {
    id: "SW-BOF-001",
    source: "BofA",
    date: "2026-03-01",
    description: "DoorDash Payout (net 75%)",
    rawDescription: "DOORDASH INC TRANSFER 030126 SUGAR WING",
    amount: 2880.0,
    status: "pending",
  },
  {
    id: "SW-BOF-002",
    source: "BofA",
    date: "2026-03-01",
    description: "UberEats Payout (net 70%)",
    rawDescription: "UBER EATS TRANSFER 030126 SUGAR WING",
    amount: 2044.0,
    status: "pending",
  },
  {
    id: "SW-BOF-003",
    source: "BofA",
    date: "2026-03-01",
    description: "Tyson Foods – Chicken Wings",
    rawDescription: "TYSON FOODS INC ACH 030126",
    amount: -4200.0,
    status: "pending",
  },
  {
    id: "SW-BOF-004",
    source: "BofA",
    date: "2026-02-28",
    description: "Grubhub Payout (net 75%)",
    rawDescription: "GRUBHUB INC TRANSFER 022826",
    amount: 1110.0,
    status: "pending",
  },
  {
    id: "SW-BOF-005",
    source: "BofA",
    date: "2026-02-28",
    description: "Ghost Kitchen Facility Fee",
    rawDescription: "KITCHEN UNITED MIX ACH 022826",
    amount: -2200.0,
    status: "pending",
  },
  {
    id: "SW-BOF-006",
    source: "BofA",
    date: "2026-02-28",
    description: "ADP Payroll – Kitchen Staff",
    rawDescription: "ADP PAYROLL FEES 022826 SUGAR WING",
    amount: -6400.0,
    status: "pending",
  },
  {
    id: "SW-BOF-007",
    source: "BofA",
    date: "2026-02-27",
    description: "DoorDash Payout",
    rawDescription: "DOORDASH INC TRANSFER 022726",
    amount: 2340.0,
    status: "pending",
  },
  {
    id: "SW-BOF-008",
    source: "BofA",
    date: "2026-02-26",
    description: "UberEats Payout",
    rawDescription: "UBER EATS TRANSFER 022626",
    amount: 1820.0,
    status: "pending",
  },
];

export const SW_AMEX_TRANSACTIONS: Transaction[] = [
  {
    id: "SW-AMX-001",
    source: "Amex",
    date: "2026-03-02",
    description: "Restaurant Depot – Sauces & Dry Goods",
    rawDescription: "RESTAURANT DEPOT #0412 TAMPA FL",
    amount: -620.0,
    status: "pending",
  },
  {
    id: "SW-AMX-002",
    source: "Amex",
    date: "2026-03-01",
    description: "Packaging – Wing Boxes & Containers",
    rawDescription: "WEBSTAURANTSTORE.COM 03012026",
    amount: -380.0,
    status: "pending",
  },
  {
    id: "SW-AMX-003",
    source: "Amex",
    date: "2026-03-01",
    description: "Meta Ads – Sugar Wing Campaign",
    rawDescription: "META ADS FACEBOOK ADS 03012026 SW",
    amount: -320.0,
    status: "pending",
  },
  {
    id: "SW-AMX-004",
    source: "Amex",
    date: "2026-02-28",
    description: "7Shifts – Scheduling",
    rawDescription: "7SHIFTS SOFTWARE SUB 022826 SW",
    amount: -49.0,
    status: "pending",
  },
];

// Mighty Quinn's – all sources combined
export const ALL_TRANSACTIONS: Transaction[] = [
  ...TOAST_TRANSACTIONS,
  ...BOFA_TRANSACTIONS,
  ...AMEX_TRANSACTIONS,
];

// Sugar Wing – all sources combined
export const SW_ALL_TRANSACTIONS: Transaction[] = [
  ...SW_TOAST_TRANSACTIONS,
  ...SW_BOFA_TRANSACTIONS,
  ...SW_AMEX_TRANSACTIONS,
];
