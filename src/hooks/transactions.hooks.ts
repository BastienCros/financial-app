import { useCallback } from "react";
import { Transaction } from "@/types";
import { formatMonthValue, formatToIsoString } from "@/helpers";
import { useMutation, useQuery } from "./useQuery.hooks";

// Invalidation key - all transaction queries share this key
// When invalidate("transactions") is called, all hooks using this key re-run
const KEY = "transactions";

/* ============================================
   QUERY HOOKS
   ============================================ */

/**
 * Get transactions sorted by date (newest first) with optional limit
 * LIMIT -1 is SQLite syntax for "no limit"
 */
export function useTransactionsGetSortedByDate(limit?: number) {
    const sql = `SELECT * FROM transactions ORDER BY date DESC LIMIT ?`
    const args = limit ?? -1;

    const { data, loading, error } = useQuery<Transaction[]>(KEY, sql, [args]);

    return {
        data,
        loading,
        error
    };
}

/**
 * Get all unique months that have transactions
 * Returns array of month strings in "YYYY-MM" format
 *
 * Type transformation:
 * - SQL returns: [{month: "2024-12"}, {month: "2024-11"}]
 * - Extracted to: ["2024-12", "2024-11"]
 */
type AvalaibleMonth = { month: string };
export function useAvailableMonths(limit?: number) {
    const sql = `
        SELECT DISTINCT strftime('%Y-%m', date) as month
        FROM transactions
        ORDER BY month DESC
        LIMIT ?
    `;
    const args = limit ?? -1;

    const { data, loading, error } = useQuery<AvalaibleMonth[]>(KEY, sql, [args]);

    // Extract month strings from objects
    const months = data?.map(row => row.month) ?? [];

    return {
        months,
        loading,
        error
    };
}

/**
 * Get all transactions for a specific month
 */
export function useMonthTransactions(month: Date) {
    const monthStr = formatMonthValue(month);
    const sql = `
        SELECT *
        FROM transactions
        WHERE strftime('%Y-%m', date) = ?
        ORDER BY date DESC
    `;

    const { data, loading, error } = useQuery<Transaction[]>(KEY, sql, [monthStr]);

    return {
        data,
        loading,
        error
    };
}

/**
 * Get aggregated statistics for a specific month
 *
 * SQL aggregations return single row wrapped in array: [{balance: 100, income: 500, expenses: 400}]
 * Extracted the first element with data?.[0]
 */
type MonthStats = { balance: number, income: number, expenses: number };

export function useMonthStats(month: Date) {
    const monthStr = formatMonthValue(month);
    const sql = `
        SELECT
            SUM(amount) as balance,
            SUM(CASE WHEN amount > 0 THEN amount else 0 END) as income,
            SUM(CASE WHEN amount < 0 THEN ABS(amount) else 0 END) as expenses
        FROM transactions
        WHERE strftime('%Y-%m', date) = ?
    `;

    const { data, loading, error } = useQuery<MonthStats[]>(KEY, sql, [monthStr]);
    // Extract first (and only) row from aggregation result
    const { balance, income, expenses } = data?.[0] ?? { balance: 0, income: 0, expenses: 0 };

    return {
        balance, income, expenses,
        loading,
        error
    };
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
    // Memoize to prevent mutate function recreation on every render
    const prepareParams = useCallback((t: Transaction) => [
        formatToIsoString(t.date),
        t.description,
        t.categoryId,
        t.amount
    ], []);

    const { mutate, loading, error } = useMutation<Transaction>(
        KEY,
        `INSERT INTO transactions (date, description, categoryId, amount) VALUES (?,?,?,?)`,
        prepareParams
    );

    return { mutate, loading, error }
}