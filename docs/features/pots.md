# Feature: Pots (Savings Goals)

## Concept
A pot is a named savings goal with a color accent.
Its balance is the cumulative sum of all transactions linked to it — not monthly, always total.

Deposits and withdrawals are real transactions stored in the `transactions` table
(category: Savings), with a nullable `pot_id` linking them back to the pot.
This keeps the transaction ledger as the single source of truth.

## Data model

### `pots` table
| Column | Type | Notes |
|---|---|---|
| id | integer PK | |
| name | text NOT NULL | |
| color | text NOT NULL | hex or named color |
| created_at | text | ISO timestamp |

### `transactions` table extension
Add nullable `pot_id` (integer, FK → pots.id).
Balance of a pot = `SUM(amount) WHERE pot_id = <id>` (all-time, no month filter).

## Actions on a pot
- **Create** — name + color; starts at $0 (no seed transaction)
- **Deposit** — user enters amount → inserts `-$X` transaction (Savings category, linked pot_id); pot balance increases
- **Withdraw** — user enters amount → inserts `+$X` transaction (Savings category, linked pot_id); pot balance decreases
- **Edit** — rename or change color only (does not affect balance)
- **Delete** — only allowed when balance is $0; otherwise user must withdraw first (or force-withdraw flow — implementation decides)

## /pots page layout
1. **Summary banner** — total saved across all pots
2. **Pot list** — per pot: name, color accent, current balance, quick actions (deposit / withdraw / edit / delete)
3. **Per-pot detail** — on click, expand or navigate to show the pot's own transaction history (its deposits and withdrawals only)

## Dashboard integration
`PotsSection` stub (currently hardcoded) replaced with live data:
- Total saved (sum across all pots)
- Per-pot breakdown (name, color, balance)

## Key files
- `src/lib/db/orm/schema.ts` — add `pots` table + `pot_id` to transactions
- `src/components/PotsSection/PotsSection.tsx` — wire to live data
- `src/hooks/pots.hooks.ts` — new hooks file (follows `transactions.hooks.ts` pattern)
- `app/(dashboard)/pots/page.tsx` — new route
- `src/components/MainNavigation/MainNavigation.constants.ts` — enable /pots nav item

## Open points
- pot_id FK: nullable column on transactions vs. separate join table (nullable column preferred for simplicity)
- Delete with non-zero balance: block + message, or force-withdraw flow?
- Deposit/withdraw UI: inline form per pot, or shared modal?
