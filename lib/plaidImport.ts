import type { AccountBase, PlaidApi, Transaction as PlaidTransaction } from "plaid";
import type { Transaction } from "@/lib/mockData";

function isoDateDaysAgo(days: number) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().slice(0, 10);
}

export function toSource(account?: AccountBase): Transaction["source"] {
  if (account?.type === "credit" || account?.subtype === "credit card") {
    return "Amex";
  }
  return "BofA";
}

export function toAppTransactions(
  plaidTransactions: PlaidTransaction[],
  accounts: AccountBase[]
): Transaction[] {
  const accountMap = new Map(accounts.map((account) => [account.account_id, account]));

  return plaidTransactions.map((tx) => {
    const account = accountMap.get(tx.account_id);
    const description = tx.merchant_name || tx.name;
    return {
      id: `PLD-${tx.transaction_id}`,
      source: toSource(account),
      date: tx.date,
      description,
      rawDescription: (tx.original_description || tx.name || description).toUpperCase(),
      amount: -tx.amount, // Plaid positive amount = money out, app negative amount = expense
      status: "pending",
    };
  });
}

export async function fetchRecentPlaidTransactions(
  plaidClient: PlaidApi,
  accessToken: string,
  days = 30
) {
  const endDate = new Date().toISOString().slice(0, 10);
  const startDate = isoDateDaysAgo(days);

  const txResponse = await plaidClient.transactionsGet({
    access_token: accessToken,
    start_date: startDate,
    end_date: endDate,
    options: {
      count: 100,
      offset: 0,
    },
  });

  const transactions = toAppTransactions(
    txResponse.data.transactions,
    txResponse.data.accounts
  ).sort((a, b) => b.date.localeCompare(a.date));

  return {
    transactions,
    accountsCount: txResponse.data.accounts.length,
  };
}
