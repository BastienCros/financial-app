import { vi, describe, it, expect, beforeAll, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import React from "react";
import type { Transaction } from "@/types";
import { formatToIsoString } from "@/helpers";
import { QueryClientProvider } from "@/contexts/QueryClientContext";
import {
    useTransactionsGetSortedByDate,
    useAddTransactions,
    useMonthTransactions,
    useMonthStats,
    useAvailableMonths,
} from "@/hooks/transactions.hooks";
import { useQuery } from "@/hooks/useQuery.hooks";
import { getDb, getOrmObject } from "../setup";

// Prevent populateDb from seeding mock data — each test manages its own fixtures
vi.mock("@/data", () => ({ mockTransactions: [] }));

const wrapper = ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, null, children);

const tx1: Omit<Transaction, "id"> = {
    date: "2025-01-15",
    description: "Coffee",
    categoryId: "food",
    amount: -5.5,
};
const tx2: Omit<Transaction, "id"> = {
    date: "2025-01-20",
    description: "Salary",
    categoryId: "income",
    amount: 3000,
};
const tx3: Omit<Transaction, "id"> = {
    date: "2025-02-10",
    description: "Rent",
    categoryId: "housing",
    amount: -1200,
};

const INSERT_SQL =
    "INSERT INTO transactions (date, description, categoryId, amount) VALUES (?,?,?,?)";

// TODO BAB-45 formatToIsoString is required here to match the format written by production hooks.
// The schema has no CHECK constraint enforcing this
function txParams(t: Omit<Transaction, "id">): [string, string, string, number] {
    return [formatToIsoString(t.date), t.description, t.categoryId, t.amount];
}

beforeAll(async () => {
    // Warm up database before test
    await getDb();
    await getOrmObject();
});

beforeEach(async () => {
    const db = await getDb();
    await db.exec?.({ sql: "DELETE FROM transactions" });
});

// ============================================================
// QUERY BEHAVIOR
// ============================================================

describe("query behavior", () => {
    it("empty db returns []", async () => {
        const { result } = renderHook(() => useTransactionsGetSortedByDate(), {
            wrapper,
        });
        await waitFor(() => expect(result.current.data).toEqual([]));
        expect(result.current.loading).toBe(false);
        expect(result.current.error).toBe("");
    });

    it("query with args returns correct subset", async () => {
        const db = await getDb();
        await db.batchExec?.(INSERT_SQL, [txParams(tx1), txParams(tx3)]);

        const { result } = renderHook(() => useMonthTransactions("2025-01"), {
            wrapper,
        });
        await waitFor(() => expect(result.current.data).toHaveLength(1));
        expect(result.current.data![0].description).toBe("Coffee");
    });

    it("args change re-fetches with new result", async () => {
        const db = await getDb();
        await db.batchExec?.(INSERT_SQL, [txParams(tx1), txParams(tx3)]);

        const { result, rerender } = renderHook(
            ({ month }: { month: string }) => useMonthTransactions(month),
            { wrapper, initialProps: { month: "2025-01" } },
        );
        await waitFor(() =>
            expect(result.current.data![0]?.description).toBe("Coffee"),
        );

        rerender({ month: "2025-02" });
        await waitFor(() =>
            expect(result.current.data![0]?.description).toBe("Rent"),
        );
    });

    // TODO BAB-28: error case needs to be handled
    // Error propagation infrastructure is in place (sql-driver re-throws, useQuery catches).
    // A real test requires a way to inject a DB-level failure through the ORM interface.
    it.todo("DB-level query error surfaces in error state", async () => {
        const { result } = renderHook(
            () =>
                useQuery("transactions", async (_orm) => {
                    throw new Error("simulated");
                }),
            { wrapper },
        );
        await waitFor(() => expect(result.current.error).not.toBe(""));
        expect(result.current.loading).toBe(false);
    });

    it("useMonthStats aggregation is correct", async () => {
        const db = await getDb();
        await db.batchExec?.(INSERT_SQL, [
            ["2025-01-15", "Income", "income", 500],
            ["2025-01-20", "Expense", "food", -200],
        ]);

        const { result } = renderHook(() => useMonthStats("2025-01"), {
            wrapper,
        });
        await waitFor(() => {
            expect(result.current.loading).toBe(false);
            expect(result.current.balance).toBe(300);
            expect(result.current.income).toBe(500);
            expect(result.current.expenses).toBe(200);
        });
    });
});

// ============================================================
// useAvailableMonths
// ============================================================

describe("useAvailableMonths", () => {
    it("returns [] when no transactions exist", async () => {
        const { result } = renderHook(() => useAvailableMonths(), { wrapper });
        await waitFor(() => {
            expect(result.current.loading).toBe(false);
            expect(result.current.months).toEqual([]);
            expect(result.current.error).toBe("");
        });
    });

    it("returns distinct months sorted newest first", async () => {
        const db = await getDb();
        // tx1=Jan, tx2=Jan, tx3=Feb — two distinct months
        await db.batchExec?.(INSERT_SQL, [
            txParams(tx1),
            txParams(tx2),
            txParams(tx3),
        ]);
        const { result } = renderHook(() => useAvailableMonths(), { wrapper });
        await waitFor(() =>
            expect(result.current.months).toEqual(["2025-02", "2025-01"]),
        );
        expect(result.current.loading).toBe(false);
    });

    it("respects the limit parameter", async () => {
        const db = await getDb();
        await db.batchExec?.(INSERT_SQL, [
            txParams(tx1),
            txParams(tx2),
            txParams(tx3),
        ]);
        const { result } = renderHook(() => useAvailableMonths(1), { wrapper });
        await waitFor(() => {
            expect(result.current.months).toHaveLength(1);
            expect(result.current.months[0]).toBe("2025-02");
        });
        expect(result.current.loading).toBe(false);
    });
});

// ============================================================
// MUTATION → QUERY CYCLE
// ============================================================

describe("mutation → query cycle", () => {
    it("single insert round-trip", async () => {
        const { result } = renderHook(
            () => ({
                list: useTransactionsGetSortedByDate(),
                add: useAddTransactions(),
            }),
            { wrapper },
        );
        await waitFor(() => expect(result.current.list.data).toEqual([]));

        await act(async () => {
            await result.current.add.mutate([tx1]);
        });

        await waitFor(() => expect(result.current.list.data).toHaveLength(1));
        expect(result.current.list.data![0].description).toBe("Coffee");
    });

    it("mutation invalidates all watchers of the same key", async () => {
        const { result } = renderHook(
            () => ({
                list1: useTransactionsGetSortedByDate(),
                list2: useTransactionsGetSortedByDate(),
                add: useAddTransactions(),
            }),
            { wrapper },
        );
        await waitFor(() => expect(result.current.list1.data).toEqual([]));

        await act(async () => {
            await result.current.add.mutate([tx1]);
        });

        await waitFor(() => {
            expect(result.current.list1.data).toHaveLength(1);
            expect(result.current.list2.data).toHaveLength(1);
        });
    });

    it("batch insert commits all rows", async () => {
        const { result } = renderHook(
            () => ({
                list: useTransactionsGetSortedByDate(),
                add: useAddTransactions(),
            }),
            { wrapper },
        );
        await waitFor(() => expect(result.current.list.data).toEqual([]));

        await act(async () => {
            await result.current.add.mutate([tx1, tx2, tx3]);
        });

        await waitFor(() => expect(result.current.list.data).toHaveLength(3));
    });
});

// ============================================================
// ERROR / ATOMICITY
// ============================================================

describe("error and atomicity", () => {
    // TODO BAB-28: DB rollback works and query data stays unchanged (both verified below),
    // but the mutation error is not surfaced at the React layer yet.
    it.todo(
        "mid-batch UNIQUE violation rolls back DB, keeps query data, and surfaces error",
        async () => {
            const db = await getDb();
            await db.exec?.({
                sql: "INSERT INTO transactions (date, description, categoryId, amount) VALUES (?,?,?,?)",
                bind: txParams(tx1),
            });

            const { result } = renderHook(
                () => ({
                    list: useTransactionsGetSortedByDate(),
                    add: useAddTransactions(),
                }),
                { wrapper },
            );
            await waitFor(() =>
                expect(result.current.list.data).toHaveLength(1),
            );

            // tx1 duplicate as 3rd element — causes UNIQUE failure, rolling back tx2 and tx3 too
            const duplicate: Transaction = { ...tx1, id: 99 };
            await act(async () => {
                await result.current.add.mutate([tx2, tx3, duplicate]);
            });

            await waitFor(() => expect(result.current.add.loading).toBe(false));

            // DB layer: entire batch rolled back
            const rows = (await db.exec?.({
                sql: "SELECT COUNT(*) as n FROM transactions",
            })) as Array<{ n: number }>;
            expect(rows[0].n).toBe(1);

            // React layer: cached query data unchanged
            expect(result.current.list.data).toHaveLength(1);

            // TODO BAB-28: error format not defined yet
            expect(result.current.add.error).not.toBe("");
        },
    );

    it("duplicate insert is a silent no-op and writes 0 additional rows", async () => {
        const { result } = renderHook(
            () => ({
                list: useTransactionsGetSortedByDate(),
                add: useAddTransactions(),
            }),
            { wrapper },
        );
        await waitFor(() => expect(result.current.list.data).toEqual([]));

        await act(async () => {
            await result.current.add.mutate([tx1]);
        });
        await waitFor(() => expect(result.current.list.data).toHaveLength(1));

        await act(async () => {
            await result.current.add.mutate([tx1]);
        });
        await waitFor(() => expect(result.current.add.loading).toBe(false));

        expect(result.current.add.error).toBe("");

        const db = await getDb();
        const rows = (await db.exec?.({
            sql: "SELECT COUNT(*) as n FROM transactions",
        })) as Array<{ n: number }>;
        expect(rows[0].n).toBe(1);
    });
});

// ============================================================
// CONCURRENCY & ROBUSTNESS
// ============================================================

describe("concurrency and robustness", () => {
    it("two simultaneous queries with different args resolve independently", async () => {
        const db = await getDb();
        await db.batchExec?.(INSERT_SQL, [txParams(tx1), txParams(tx3)]);

        const { result: r1 } = renderHook(
            () => useMonthTransactions("2025-01"),
            { wrapper },
        );
        const { result: r2 } = renderHook(
            () => useMonthTransactions("2025-02"),
            { wrapper },
        );

        await waitFor(() => {
            expect(r1.current.data).toHaveLength(1);
            expect(r2.current.data).toHaveLength(1);
        });
        expect(r1.current.data![0].description).toBe("Coffee");
        expect(r2.current.data![0].description).toBe("Rent");
    });

    it("two simultaneous mutations both commit", async () => {
        const { result: r1 } = renderHook(
            () => ({ add: useAddTransactions() }),
            {
                wrapper,
            },
        );
        const { result: r2 } = renderHook(
            () => ({ add: useAddTransactions() }),
            {
                wrapper,
            },
        );

        await act(async () => {
            await Promise.all([
                r1.current.add.mutate([tx1]),
                r2.current.add.mutate([tx2]),
            ]);
        });

        await waitFor(() => expect(r1.current.add.loading).toBe(false));
        await waitFor(() => expect(r2.current.add.loading).toBe(false));

        const db = await getDb();
        const rows = (await db.exec?.({
            sql: "SELECT COUNT(*) as n FROM transactions",
        })) as Array<{ n: number }>;
        expect(rows[0].n).toBe(2);
    });

    it("rapid sequential mutations all commit without data corruption", async () => {
        const txs: Omit<Transaction, "id">[] = Array.from({ length: 5 }, (_, i) => ({
            date: `2025-0${i + 1}-01`,
            description: `Tx ${i + 1}`,
            categoryId: "food" as const,
            amount: -(i + 1) * 10,
        }));

        const { result } = renderHook(
            () => ({
                list: useTransactionsGetSortedByDate(),
                add: useAddTransactions(),
            }),
            { wrapper },
        );
        await waitFor(() => expect(result.current.list.data).toEqual([]));

        await act(async () => {
            await Promise.all(txs.map((tx) => result.current.add.mutate([tx])));
        });

        // Intentionally asserts via hook (not direct DB query): verifies the full pipeline —
        // invalidation fired, re-fetch ran, and the React layer reflects all 5 commits.
        await waitFor(() => expect(result.current.list.data).toHaveLength(5));
    });

    it("query args change before first result — final data matches new args", async () => {
        const db = await getDb();
        await db.batchExec?.(INSERT_SQL, [txParams(tx1), txParams(tx3)]);

        const { result, rerender } = renderHook(
            ({ month }: { month: string }) => useMonthTransactions(month),
            { wrapper, initialProps: { month: "2025-01" } },
        );

        // Change args immediately without waiting for initial fetch to complete
        rerender({ month: "2025-02" });

        // Final result must match the latest args — no stale Jan data
        await waitFor(() => expect(result.current.data).toHaveLength(1));
        expect(result.current.data![0].description).toBe("Rent");
    });
});
