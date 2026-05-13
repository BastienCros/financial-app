# CSV Import — Bulk Insert Strategy & File Size Limits

## 1. Why `batchExec` is the right insert strategy

Three alternatives were considered for inserting N parsed rows into SQLite-wasm.

### A) N individual ORM inserts

```ts
for (const row of rows) {
    await orm.insert(table).values(row);
}
```

Each call goes through `createSqliteDriver` → `database.exec` → `postMessage` to the worker → response.
That is **N async `MessageChannel` round-trips**, each crossing the main thread ↔ worker boundary with its own task-queue flush. SQLite also parses and compiles the same SQL string N times (no statement reuse between `exec` calls). No transaction wrapper means each insert is its own commit.

**Verdict: ruled out.**

### B) Single multi-row `VALUES` statement (Drizzle array insert)

```ts
await orm.insert(table).values(allRows);
// → INSERT INTO t (a,b,c) VALUES (?,?,?),(?,?,?),...
```

One `postMessage` round-trip. One parse+compile. Fast.

Limit: SQLite's `SQLITE_MAX_VARIABLE_NUMBER`. Default is **999** in old builds; raised to **32 766** in SQLite ≥ 3.32 (sqlite-wasm ships a recent build, so 32 766 applies). At 4 columns/row that caps you at ~**8 000 rows** per statement before chunking is required. The full params array is also serialized into one large structured-clone payload.

**Verdict: viable for small imports, needs chunking logic for large ones.**

### C) `batchExec` — prepare once, bind N times (chosen)

```ts
// worker internals (BATCH_EXEC handler)
db.exec("BEGIN")
stmt = db.prepare(sql)      // compiled once
for each paramSet:
    stmt.bind(params)
    stmt.step()
    stmt.reset()
db.exec("COMMIT")
stmt.finalize()
```

- **1 `postMessage` round-trip** regardless of N.
- SQL compiled to bytecode **once**; each row only pays `bind + step + reset`.
- Explicit `BEGIN / COMMIT` batches all WAL writes atomically.
- `SQLITE_MAX_VARIABLE_NUMBER` is irrelevant — each `bind()` only binds one row's params.
- JS-side cost: N calls to `drizzle.insert().toSQL()` to extract `paramSets` — pure JS, no worker crossing.

| | N individual | Multi-row VALUES | `batchExec` |
|---|---|---|---|
| `postMessage` trips | N | 1 | 1 |
| SQL parse/compile | N × | 1 × | 1 × |
| Transaction | none | none | BEGIN / COMMIT |
| `SQLITE_MAX_VARIABLE_NUMBER` | no issue | hits at ~8 k rows | no issue |

**Verdict: best choice. No chunking needed, no variable-number limit, one round-trip.**

---

## 2. File size limits — what can actually break

### `postMessage` payload size

No hard browser limit. The structured clone algorithm handles arbitrarily large objects; the only ceiling is available tab memory. Serialization time is O(data size) — it grows linearly but is not a hard wall.

Rough payload sizes for `batchExec` (`paramSets: any[][]`):

| Rows | Cols | Estimated payload |
|---|---|---|
| 1 000 | 4 | ~50 KB |
| 10 000 | 4 | ~500 KB |
| 100 000 | 4 | ~5 MB |

All well within browser limits for the financial-app use case (personal CSV exports are typically hundreds to low thousands of rows).

### SQLite in-transaction memory (WAL)

`BEGIN / COMMIT` holds all uncommitted pages in the WAL buffer. For a personal bank export this is negligible. It would only matter at hundreds of thousands of rows.

### PapaParse memory

PapaParse runs in a worker (`worker: true`). Parsing the entire file into an array of objects before passing to the main thread is the real memory pressure point for very large files, independent of the insert strategy.

### Recommended file size limit

Given the above, a **2 MB** cap on the input file is a reasonable default for a personal finance app:

- A typical French bank CSV export is 5–50 KB for a full year of transactions (~500 rows).
- 2 MB at ~100 bytes/row accommodates ~20 000 rows, well beyond any realistic personal export.
- Stays comfortably under the thresholds where `postMessage` serialization or WAL pressure would be observable.
- Gives a clear user-facing error before parsing starts (check `file.size` before calling PapaParse).

If broader use cases are added later (multi-year imports, shared accounts), raise the limit to **10 MB** and add a progress indicator — PapaParse's streaming mode (`step` callback) would then be worth enabling to avoid holding the full parsed array in memory.
