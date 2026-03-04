import { NextRequest, NextResponse } from "next/server";
import { fetchRecentPlaidTransactions } from "@/lib/plaidImport";
import { setPlaidItemAccessToken } from "@/lib/plaidItemStore";
import { getPlaidClient } from "@/lib/plaid";

interface ExchangeRequest {
  publicToken?: string;
}

export async function POST(req: NextRequest) {
  let plaidClient;

  try {
    plaidClient = getPlaidClient();
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Plaid is not configured.";
    return NextResponse.json({ error: message }, { status: 503 });
  }

  const body: ExchangeRequest = await req.json();
  if (!body.publicToken) {
    return NextResponse.json({ error: "Missing publicToken" }, { status: 400 });
  }

  try {
    const exchange = await plaidClient.itemPublicTokenExchange({
      public_token: body.publicToken,
    });

    const accessToken = exchange.data.access_token;
    setPlaidItemAccessToken(exchange.data.item_id, accessToken);
    const { transactions, accountsCount } = await fetchRecentPlaidTransactions(
      plaidClient,
      accessToken
    );

    return NextResponse.json({
      itemId: exchange.data.item_id,
      accounts: accountsCount,
      transactions,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to exchange public token.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
