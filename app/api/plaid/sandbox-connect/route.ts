import { Products } from "plaid";
import { NextRequest, NextResponse } from "next/server";
import { fetchRecentPlaidTransactions } from "@/lib/plaidImport";
import { setPlaidItemAccessToken } from "@/lib/plaidItemStore";
import { getPlaidClient } from "@/lib/plaid";

interface SandboxConnectRequest {
  institutionId?: string;
  username?: string;
  password?: string;
}

export async function POST(req: NextRequest) {
  if ((process.env.PLAID_ENV ?? "sandbox") !== "sandbox") {
    return NextResponse.json(
      { error: "Sandbox connect is only available when PLAID_ENV=sandbox." },
      { status: 400 }
    );
  }

  let plaidClient;

  try {
    plaidClient = getPlaidClient();
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Plaid is not configured.";
    return NextResponse.json({ error: message }, { status: 503 });
  }

  const body: SandboxConnectRequest = await req.json();
  const institutionId = body.institutionId?.trim() || "ins_109508";

  try {
    const sandboxToken = await plaidClient.sandboxPublicTokenCreate({
      institution_id: institutionId,
      initial_products: [Products.Transactions],
      options: {
        override_username: body.username?.trim() || "user_good",
        override_password: body.password?.trim() || "pass_good",
      },
    });

    const exchange = await plaidClient.itemPublicTokenExchange({
      public_token: sandboxToken.data.public_token,
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
    const message = err instanceof Error ? err.message : "Failed to create sandbox item.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
