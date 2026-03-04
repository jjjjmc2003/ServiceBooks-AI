import { Configuration, PlaidApi, PlaidEnvironments } from "plaid";

const PLAID_ENVIRONMENTS = {
  sandbox: PlaidEnvironments.sandbox,
  development: PlaidEnvironments.development,
  production: PlaidEnvironments.production,
} as const;

export function getPlaidClient() {
  const clientId = process.env.PLAID_CLIENT_ID;
  const secret = process.env.PLAID_SECRET;
  const envName = (process.env.PLAID_ENV ?? "sandbox") as keyof typeof PLAID_ENVIRONMENTS;
  const basePath = PLAID_ENVIRONMENTS[envName];

  if (!clientId || !secret) {
    throw new Error("Plaid is not configured. Set PLAID_CLIENT_ID and PLAID_SECRET in .env.local.");
  }

  if (!basePath) {
    throw new Error("Invalid PLAID_ENV. Use one of: sandbox, development, production.");
  }

  const config = new Configuration({
    basePath,
    baseOptions: {
      headers: {
        "PLAID-CLIENT-ID": clientId,
        "PLAID-SECRET": secret,
      },
    },
  });

  return new PlaidApi(config);
}
