# ADR: State Management Architecture

## Context

`MainNavigation` lives in `app/layout.tsx` (root layout, no DB provider).  
`QueryClientProvider` — which initializes the SQLite WASM database and exposes the ORM instance — is scoped to `app/(dashboard)/layout.tsx`.

The CSV import modal needs DB access (`useAddTransactions` → `useMutation` → `useQueryClient`). This creates a React context hierarchy problem: the modal, rendered inside `MainNavigation`, has no `QueryClientProvider` ancestor.

## Options considered

### Move `QueryClientProvider` to root layout
Simple fix. But `QueryClientProvider` is a client component that initializes PGlite/sql.js — heavy JS that would ship to every page including future static pages (about, help, etc.). `app/layout.tsx` would also become a client boundary, preventing static pages from being Server Components.

**Rejected:** breaks static page performance.

### `ImportModalContext` at root level
Lightweight context holding only open/close state. Nav triggers it; modal renders inside dashboard where `QueryClientProvider` exists.

**Rejected:** throwaway code. This context would be deleted when Zustand is adopted (see below). Writing, testing, then deleting it adds cost with no lasting value.

### Zustand migration now
Replace `QueryClientContext` with a Zustand store. No provider needed — any component at any layout level accesses the store directly. Correct long-term architecture.

**Rejected for now:** scope is too wide mid-feature. Deferred to dedicated issue.

### Move import trigger to dashboard (chosen — temporary)
Import modal trigger lives inside the dashboard (inside `QueryClientProvider` scope). Nav "Import CSV" item stays but is disabled with a TODO referencing the Zustand issue.

**Chosen:** minimal, intentional, no throwaway code. Explicitly temporary.

## Temporary implementation

- `ImportCsvModal` renders inside the dashboard, not in `MainNavigation`
- "Import CSV" in `MainNavigation` is disabled with a TODO comment
- Once Zustand migration is done, the nav item is re-enabled and the dashboard trigger is removed

## Future architecture: Zustand migration

Zustand stores are module-level singletons — no React provider needed in the component tree. This solves the hierarchy constraint without affecting static page performance.

### Target architecture

```
app/layout.tsx                  ← Server Component, stays clean
  ├── <DbInitializer />         ← small "use client" component, triggers async DB init on mount
  ├── MainNavigation            ← "use client", imports Zustand store directly
  └── {children}                ← Server or Client, each page decides
        └── app/(dashboard)/layout.tsx
              └── {children}    ← no QueryClientProvider needed anymore
```

### Migration scope

| File | Change |
|---|---|
| `src/contexts/QueryClientContext.tsx` | Rewrite as Zustand store |
| `src/hooks/useQuery.hooks.ts` | Replace `useQueryClient()` with store hook — ~2 lines |
| `app/(dashboard)/layout.tsx` | Remove `QueryClientProvider` |
| `app/layout.tsx` | Add `<DbInitializer />` |

`transactions.hooks.ts`, `useImportTransaction.hooks.ts` and all consumers — untouched. Hook interfaces stay the same.

### Why this is better

- `app/layout.tsx` stays a Server Component
- Static pages (`/about`, `/help`) remain Server Components and ship no DB JS
- Nav, dashboard, settings, export, sync — all access the store without caring about layout level
- No provider hierarchy to reason about
