# Performance comparison — ORM ready → first data

## What was measured

Time between the ORM becoming available and the first SQL query returning data.
This isolates the propagation cost (how fast the ORM signal reaches a consumer and a query executes),
excluding WASM init which is identical in both approaches.

### Instrumentation

Two insertion points, no React involved:

**1. Mark ORM ready** — right before the state update that makes the ORM available to consumers.

Zustand (`src/store/db.store.ts`):
```ts
const newOrm = getOrm();
(window as any).__ormReadyAt = performance.now(); // ← stamp
set({ orm: newOrm, errorDb: null });
```

Context (`src/contexts/QueryClientContext.tsx`):
```ts
await initORM(db);
(window as any).__ormReadyAt = performance.now(); // ← stamp
setOrm(getOrm());
```

**2. Consume the mark** — inside the `queryFn` callback, after the first query resolves.

Both branches (`src/hooks/transactions.hooks.ts`):
```ts
const result = (await orm.select({...}).from(transactions).where(...))[0];

const ormReadyAt = (window as any).__ormReadyAt;
if (ormReadyAt) {
    console.log(`[PERF] ORM ready → first data: ${(performance.now() - ormReadyAt).toFixed(2)}ms`);
    delete (window as any).__ormReadyAt;
}

return result;
```

This measures: state update fires → subscriber notified → `useQuery` effect re-runs → query executes → result returns.
No render-tick jitter on either boundary.

## Results

| Approach | Observed range |
|---|---|
| Context (`QueryClientProvider`) | 35–45ms |
| Zustand (`useDbStore`) | 60–80ms |

Initial measurements on the Zustand branch were 80–100ms. Removing a redundant `set({ errorDb: null })`
call that fired immediately after `set({ orm: newOrm, errorDb: null })` brought it down to 60–80ms,
confirming that double notifications have a measurable cost.

## Hypotheses for the remaining gap (~20–35ms)

These are not confirmed — they are plausible explanations based on how React and Zustand work internally.

**`useSyncExternalStore` vs `useState` scheduling.**
Context propagates via a plain `useState` update inside the provider tree. React owns the whole path
and can commit it in a single pass. Zustand goes through an extra hop: `set()` notifies subscribers
synchronously outside React, each subscriber then triggers React's `forceUpdate` via
`useSyncExternalStore`. That re-entry into the scheduler may cost a scheduling pass.

**Two independent subscriptions per `useQuery`.**
```ts
const orm = useDbStore((s) => s.orm);           // subscription 1
const invalidationKey = useDbStore((s) => s.invalidations[key]); // subscription 2
```
Both are notified when `set({ orm })` fires. React may process them in separate update passes
rather than a single batched commit, unlike a single context value update.

## Takeaway

The ~40ms total gap is real and consistent. It is the structural cost of Zustand's provider-free model:
state lives outside React's scheduler, so propagating it back into the render tree has overhead.
For state that changes rarely (theme, auth), this is invisible. For a hot path like
"ORM becomes ready → first render with data", it is measurable.

Whether this architecture is the right fit for this use case is a separate question.
