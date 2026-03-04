# Restaurant AI Demo

Restaurant accounting dashboard with:
- Transaction feed + manual expense entry
- AI GL categorization (Anthropic)
- Reconciliation + sales trend views
- Plaid sandbox import via Plaid Link

## Setup

1. Install dependencies:
```bash
npm install
```

2. Copy env template and fill keys:
```bash
cp .env.example .env.local
```

Required variables:
- `ANTHROPIC_API_KEY`
- `PLAID_CLIENT_ID`
- `PLAID_SECRET`
- `PLAID_ENV` (`sandbox` for local testing)

3. Start dev server:
```bash
npm run dev
```

4. Open `http://localhost:3000`

## Plaid Sandbox Connection

Use the `Connect Plaid` button in the top bar.

In Plaid Link sandbox login, use:
- Username: `user_good`
- Password: `pass_good`

After successful link:
- Public token is exchanged server-side
- Last 30 days of transactions are imported
- Imported transactions are auto-categorized with Claude

## Advanced Sandbox Testing

Use the `Plaid Sandbox API Connect` panel to test credentials that can be ignored by OAuth Link flows.

Defaults:
- Institution ID: `ins_109508` (First Platypus Bank, non-OAuth)
- Username: `user_good`
- Password: `pass_good`

Examples:
- Dynamic transactions: `user_transactions_dynamic` + any password
- MFA device flow: `user_good` + `mfa_device`
- Error simulation: `user_good` + `error_ITEM_LOCKED` (or other supported `error_*` values)

For dynamic transaction personas, connect first, then use `Refresh Transactions` to call Plaid `/transactions/refresh`.
