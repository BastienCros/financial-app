import { useCallback } from "react";
import { Transaction } from "@/types";
import { formatToIsoString } from "@/helpers";
import { bulkInsert } from "@/lib/db";
import { transactions } from "@/lib/db/orm/schema";
import { and, desc, gte, lt, sql, AnyColumn } from "drizzle-orm";
import { useMutation, useQuery } from "./useQuery.hooks";

// Invalidation key - all transaction queries share this key
// When invalidate("transactions") is called, all hooks using this key re-run
const KEY = "transactions";

/* Local Helper */

// Get start and next months in ISO format
function getMonthBounds(monthStr: string) {
    const start = `${monthStr}-01T00:00:00.000Z`;
    const [year, m] = monthStr.split("-").map(Number);
    const end = new Date(Date.UTC(year, m, 1)).toISOString();

    return { start, end };
}

// Check if data is in month range
const isWithinMonth = (col: AnyColumn, start: string, end: string) => {
    return and(gte(col, start), lt(col, end));
};

/* ============================================
   QUERY HOOKS
   ============================================ */

/**
 * Get transactions sorted by date (newest first) with optional limit
 */
export function useTransactionsGetSortedByDate(limit?: number) {
    return useQuery<Transaction[]>(
        KEY,
        (orm) => {
            const q = orm
                .select()
                .from(transactions)
                .orderBy(desc(transactions.date));
            return (limit !== undefined ? q.limit(limit) : q) as Promise<
                Transaction[]
            >;
        },
        [limit],
    );
}

/**
 * Get all unique months that have transactions
 * Returns array of month strings in "YYYY-MM" format
 * Note: limit default to 10 (we rarely need to display more than 10 months)
 */
export function useAvailableMonths(limit: number = 10) {
    const { data, loading, error } = useQuery<string[]>(
        KEY,
        async (orm) => {
            const rows = await orm
                .selectDistinct({
                    month: sql<string>`strftime('%Y-%m', ${transactions.date})`,
                })
                .from(transactions)
                // Referencing the result of the first column
                .orderBy(sql`1 DESC`)
                .limit(limit);

            return rows.map((r) => r.month);
        },
        [limit],
    );

    const months = data ?? [];
    return { months, loading, error };
}

/**
 * Get all transactions for a specific month
 */
export function useMonthTransactions(month: string | null) {
    return useQuery<Transaction[]>(
        KEY,
        async (orm) => {
            if (!month) return [];
            const { start, end } = getMonthBounds(month);

            return await orm
                .select()
                .from(transactions)
                .where(isWithinMonth(transactions.date, start, end))
                .orderBy(desc(transactions.date));
        },
        [month],
    );
}

/**
 * Get aggregated statistics for a specific month
 */
type MonthStats = { balance: number; income: number; expenses: number };

export function useMonthStats(month: string | null) {
    const { data, loading, error } = useQuery<MonthStats | undefined>(
        KEY,
        async (orm) => {
            if (!month) return undefined;
            const { start, end } = getMonthBounds(month);

            return (
                await orm
                    .select({
                        balance: sql<number>`SUM(${transactions.amount})`,
                        income: sql<number>`SUM(CASE WHEN ${transactions.amount} > 0 THEN ${transactions.amount} ELSE 0 END)`,
                        expenses: sql<number>`SUM(CASE WHEN ${transactions.amount} < 0 THEN ABS(${transactions.amount}) ELSE 0 END)`,
                    })
                    .from(transactions)
                    .where(isWithinMonth(transactions.date, start, end))
            )[0];
        },
        [month],
    );

    const { balance, income, expenses } = data ?? {
        balance: 0,
        income: 0,
        expenses: 0,
    };

    return { balance, income, expenses, loading, error };
}

/* ============================================
   MUTATION HOOKS
   ============================================ */

/**
 * Add one or more transactions using batch insert
 * Usage:
 *   - Single: mutate([transaction])
 *   - Multiple: mutate([tx1, tx2, tx3])
 */
export function useAddTransactions() {
    const insertFn = useCallback(
        (data: Transaction[]) =>
            bulkInsert(
                transactions,
                data.map(({ date, description, categoryId, amount }) => ({
                    date: formatToIsoString(date),
                    description,
                    categoryId,
                    amount,
                })),
            ),
        [],
    );

    return useMutation<Transaction>(KEY, insertFn);
}
