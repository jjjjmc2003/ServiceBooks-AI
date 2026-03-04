import { NextRequest, NextResponse } from "next/server";
import { fetchRecentPlaidTransactions } from "@/lib/plaidImport";
import { getPlaidItemAccessToken } from "@/lib/plaidItemStore";
import { getPlaidClient } from "@/lib/plaid";

interface RefreshTransactionsRequest {
  itemId?: string;
}

export async function POST(req: NextRequest) {
  let plaidClient;

  try {
    plaidClient = getPlaidClient();
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Plaid is not configured.";
    return NextResponse.json({ error: message }, { status: 503 });
  }

  const body: RefreshTransactionsRequest = await req.json();
  const itemId = body.itemId?.trim();
  if (!itemId) {
    return NextResponse.json({ error: "Missing itemId" }, { status: 400 });
  }

  const accessToken = getPlaidItemAccessToken(itemId);
  if (!accessToken) {
    return NextResponse.json(
      { error: "Unknown itemId for this server process. Reconnect the item first." },
      { status: 404 }
    );
  }

  try {
    await plaidClient.transactionsRefresh({
      access_token: accessToken,
    });

    const { transactions, accountsCount } = await fetchRecentPlaidTransactions(
      plaidClient,
      accessToken
    );

    return NextResponse.json({
      itemId,
      accounts: accountsCount,
      transactions,
      refreshed: true,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to refresh transactions.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
