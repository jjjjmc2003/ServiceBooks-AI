import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic();

const GL_REFERENCE = `
Restaurant GL Chart of Accounts:
4000 – Food Sales
4100 – Beverage Sales – Liquor
4200 – Beverage Sales – Beer
4300 – Beverage Sales – Wine
4400 – Non-Alcoholic Beverage Sales
5000 – Cost of Food
5100 – Cost of Beverage
6000 – Labor – FOH
6100 – Labor – BOH
6200 – Labor – Management
7000 – Marketing & Advertising
7100 – Utilities
7200 – Repairs & Maintenance
7300 – Supplies – Kitchen
7400 – Supplies – FOH
7500 – Credit Card Processing Fees
7600 – Delivery Platform Fees
7700 – Linen & Uniforms
7800 – Rent
7900 – Insurance
8000 – Office & Admin
8100 – Professional Services
`;

export interface CategorizeRequest {
  transactions: {
    id: string;
    rawDescription: string;
    amount: number;
    source: string;
  }[];
}

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === "your_api_key_here") {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY not configured in .env.local" }, { status: 503 });
  }

  const body: CategorizeRequest = await req.json();

  const txList = body.transactions
    .map(
      (tx) =>
        `ID: ${tx.id} | Source: ${tx.source} | Amount: ${tx.amount > 0 ? "+" : ""}${tx.amount.toFixed(2)} | Description: ${tx.rawDescription}`
    )
    .join("\n");

  let message;
  try {
    message = await client.messages.create({
    model: "claude-opus-4-5",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: `You are a restaurant accountant. Categorize each transaction below into the correct GL account from the chart of accounts provided.

${GL_REFERENCE}

Transactions to categorize:
${txList}

Respond with ONLY a JSON array in this exact format, no other text:
[
  {"id": "...", "glCode": "4000", "glCategory": "Food Sales", "confidence": "high"},
  ...
]

Rules:
- Toast POS food settlements → 4000 Food Sales
- Toast POS bar settlements → 4100/4200/4300 based on type (use 4100 if unclear)
- Delivery platform payouts (DoorDash, etc.) → 4000 Food Sales
- Food distributors (Sysco, US Foods, Chef's Garden) → 5000 Cost of Food
- Beverage distributors (Southern Glazers, Republic Beverage) → 5100 Cost of Beverage
- ADP Payroll → 6000 Labor – FOH
- Marketing (Meta, Google Ads) → 7000 Marketing & Advertising
- Utilities (Comcast, electric, gas) → 7100 Utilities
- Repairs/maintenance (ACE Hardware, plumbing) → 7200 Repairs & Maintenance
- Kitchen supplies (Restaurant Depot, kitchen items) → 7300 Supplies – Kitchen
- Linen/uniforms (Unifirst) → 7700 Linen & Uniforms
- Rent → 7800 Rent
- SaaS (OpenTable, 7Shifts, Restaurant365, R365) → 8100 Professional Services
- Tips collected → 6000 Labor – FOH
- Office supplies → 8000 Office & Admin
- Comps/voids → 4000 Food Sales (negative)
- DoorDash fees → 7600 Delivery Platform Fees`,
      },
    ],
  });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  const text = message.content[0].type === "text" ? message.content[0].text : "";

  // Parse the JSON response
  const jsonMatch = text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) {
    return NextResponse.json({ error: "Failed to parse response" }, { status: 500 });
  }

  const categories = JSON.parse(jsonMatch[0]);
  return NextResponse.json({ categories });
}
