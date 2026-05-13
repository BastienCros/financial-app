# Feature: Settings Page & DB Control

## Purpose
Provide a dedicated Settings page as the home for all app-level configuration.
First panel: DB stats and data management actions.

## Settings page
- Route: `/settings`
- Nav entry to add in `MainNavigation.constants.ts`
- Initially contains only the DB panel; designed to host future panels (export, preferences, etc.)

## DB stats panel
Display:
- Transaction row count
- Storage size (computed or estimated — implementation decides; PRAGMA page_count × page_size is the natural SQLite approach)

Actions:
- **Clear all data** — deletes all rows from `transactions`, vacuums DB, invalidates all caches. Requires explicit confirmation (modal or inline confirm).
- **Refresh** — re-reads stats on demand (useful after import or clear).

## DB size limit configuration (separate issue)
Let the user define a max storage threshold.
When the stored size approaches or exceeds the limit, surface a warning (banner, icon, or inline indicator — implementation decides).
Where and how the limit is enforced is an implementation decision.

## Key files
- `app/(dashboard)/settings/page.tsx` — new route
- `src/components/MainNavigation/MainNavigation.constants.ts` — add nav entry
- `src/lib/db/orm/schema.ts` — PRAGMA query for size stats
- `src/hooks/transactions.hooks.ts` — pattern to follow for DB stats hook
