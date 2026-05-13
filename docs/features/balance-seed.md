# Feature: Account Balance Seed (future)

## Problem
The app may not hold transactions going back to account opening.
Cumulative balances therefore drift from the real account balance.
Monthly summaries are accurate; overall totals are not.

## Proposed solution
During CSV import (or as a standalone action in Settings), the user can optionally
enter their **current real account balance**.

The app computes a synthetic seed amount:
  seed = realBalance − SUM(all stored transaction amounts)

A non-deletable "seed" transaction is inserted, timestamped before the earliest
stored transaction. This anchors the cumulative balance to reality without modifying
any real data.

## Side effects
- Once a seed is set, the dashboard Overview switches from monthly to overall (cumulative)
  balance, since overall becomes meaningful.
- Re-importing CSV should prompt the user to recalculate or keep the existing seed.

## Open points
- Where to store the seed: special flag/metadata row vs. a dedicated `seed_transactions` table
- What happens if the computed seed is negative (real balance lower than stored sum)
- Whether the seed is recalculated automatically on each import or only on explicit user action
- UI entry point: step inside ImportCsvModal, or standalone action in Settings
