import { CountryCode, Products } from "plaid";
import { NextResponse } from "next/server";
import { getPlaidClient } from "@/lib/plaid";

export async function POST() {
  let plaidClient;

  try {
    plaidClient = getPlaidClient();
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Plaid is not configured.";
    return NextResponse.json({ error: message }, { status: 503 });
  }

  try {
    const response = await plaidClient.linkTokenCreate({
      user: {
        client_user_id: `restaurant-ai-${Date.now()}`,
      },
      client_name: "Restaurant AI Demo",
      products: [Products.Transactions],
      country_codes: [CountryCode.Us],
      language: "en",
    });

    return NextResponse.json({ linkToken: response.data.link_token });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to create Plaid link token.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
