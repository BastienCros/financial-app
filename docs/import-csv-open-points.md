## Architecture Analysis — CSV Import Feature

### The core architectural problem

A background process has two properties that define where it should live:
- **Lifetime**: it should outlive its trigger
- **Scope**: it should be owned at the level of all its consumers

`ImportCsvModal` fails both. It is the trigger, not the owner. Its lifetime is controlled by the user (closing the modal kills the process). Its consumers span beyond it — the nav icon, future toast — but the modal cannot reach them without prop drilling or callbacks.

`MainNavigation` fails the scope criterion. It is one consumer of the process status, not the owner of the process. Owning I/O in a navigation component is a responsibility mismatch.

### Handling state

A dedicated `React Context` at layout level satisfies both properties:
- **Lifetime**: the layout is stable for the session
- **Scope**: all consumers — modal, nav, future toast — are layout children

Decided: deferred to BAB-48 (Zustand migration). See `docs/adr-state-management.md`.

### What disappears with the right architecture

The `onStatusChange` callback and the bridging `useEffect` in `ImportCsvModal` are symptoms of the hook being in the wrong place. Move the hook to the right owner and they are no longer needed.

### UX and architecture

These are related but independent. The architectural conclusion — `ImportContext` at layout level — holds regardless of UX choice. The UX choice only determines what the modal does after triggering the import: stay open or close immediately. Both are coherent once the hook is in the right place.

---

## Implementation status

### File Picker

✅ Done: drag-and-drop `FileUploader` component wrapping a hidden `<input type="file">`.

Open point: no file size validation yet. 2 MB is a reasonable cap for personal bank exports (~500 rows, 5–50 KB). See `docs/csv-import-bulk-insert-analysis.md` for the full analysis.

### Parsing

✅ Done: PapaParse with `worker: true` (offloads parsing off main thread). Vanilla library, no React wrapper needed.

### Transformation layer

✅ Done: `SCHEMA_MAP` with case-insensitive key normalization (`normalizeRowKeys`). `CATEGORY_MAP` with keyword matching via `deburr`.

Ideas for later:
- Preview 5–10 rows so the user can review the header ↔ field mapping before confirming
- Fuzzy matching (e.g. Fuse.js) as a fallback if the keyword mapping finds nothing

---

## Decisions

Small choices made during implementation that are worth tracking explicitly.

### Error handling strategy: fail-safe per row

Current decision: invalid rows are silently dropped, the import never aborts entirely.
This applies at two levels:
- **PapaParse row-level errors** (malformed quotes, field count mismatch): rows that generated a parse error are removed by index, the rest are processed normally.
- **Transformation errors** (`csvToTransaction` returns `undefined`): rows that fail mapping are filtered out before the bulk insert.

Open question: should the user be informed of how many rows were dropped, and why?

### Per-field fallback behavior

Each field has its own fallback strategy — the choice of what "missing or unrecognized value" means differs per field:

| Field | Missing/unrecognized | Rationale |
|---|---|---|
| `date` | `null` → row rejected | A transaction without a date is not meaningful |
| `category` | `"other"` → row kept | Losing categorization is acceptable, data is preserved |
| `amount` | `0` → row kept | Awkward but acceptable for now; strategy not yet defined |

Open question: is `amount: 0` a valid state or silent data loss? Should rows with no resolvable amount be rejected like rows with no date?

### Encoding

CSV encoding is hardcoded to `ISO-8859-1` (French bank CSV format).
Open question: auto-detect encoding using a library like `jschardet` for broader compatibility.

### Outcome when all rows are filtered out

If every row fails (parse error + transformation), the import resolves as `"success"` with nothing inserted.
This is consistent with the fail-safe strategy but may be surprising to the user.
Open question: distinguish between "import succeeded with N rows" and "import ran but nothing was saved".
