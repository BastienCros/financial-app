# Integration Tests — SQLite WASM Query Layer

Tests exercise the full stack: React hooks → Web Worker message protocol → SQLite WASM → React state.
They run in a real Chromium browser (Playwright) against a real in-memory SQLite database.

Each test starts from a clean database (`DELETE FROM transactions`). Mock seed data is suppressed —
fixtures are inserted manually per test.

---

## Query behavior

Verifies the read path returns correct data and reacts to argument changes.

- **Empty database** — hooks return `[]` (not null/undefined) with no error state.
- **Filtered query** — `useMonthTransactions` returns only rows matching the requested month.
- **Args change triggers re-fetch** — changing the month argument fetches new data; no stale result
  from the previous month leaks through.

These tests guard against bugs in the Worker's request/response ID correlation: a mis-routed
response would silently return wrong-month data.

---

## Mutation → query cycle

Verifies the write path and the custom invalidation system.

- **Single insert round-trip** — one `mutate()` call inserts a row and the query hook reflects it.
- **Shared-key invalidation** — multiple hooks subscribed to the same query key all update after a
  mutation, not just the hook co-located with the write.
- **Batch insert** — inserting multiple rows in one call commits all of them.
- **Stats aggregation** — `useMonthStats` computes income, expenses, and balance correctly from raw
  rows.

The invalidation system is custom-built (no React Query). A missed subscriber notification would
produce stale UI with no error signal.

---

## Error and atomicity

Verifies that failed writes leave the database and cached query data unchanged.

- **Prepare error writes 0 rows** — a mutation targeting a non-existent table is caught before
  execution; no rows are written and the hook surfaces an error.
- **Mid-batch rollback** *(pending BAB-28)* — a constraint violation mid-batch rolls back the entire
  batch. The test verifies three things: DB row count unchanged, cached query data unchanged, and
  error surfaced at the React layer. The first two already work; error propagation is not yet
  implemented.

---

## Concurrency and robustness

Verifies that the single-threaded Worker serializes concurrent requests without cross-wiring
responses or dropping messages.

- **Simultaneous queries** — two hooks querying different months concurrently each receive their own
  correct result; no response ID collision.
- **Simultaneous mutations** — two parallel `mutate()` calls both commit without one overwriting the
  other.
- **Rapid sequential mutations** — five back-to-back mutations all commit; the Worker queue handles
  load without dropping messages.
- **Args change before first response** — if the month arg changes before the initial fetch returns,
  the stale response is discarded and only the latest result is applied.
