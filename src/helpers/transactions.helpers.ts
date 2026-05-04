/**
 * Transaction Helpers
 *
 * Pure utility functions for transaction formatting and display.
 *
 * Note: Data fetching, filtering, and aggregation moved to hooks/transactions.hooks.ts
 * Those operations now use SQL queries for better performance and consistency.
 */

/* Format helpers */
export const formatCurrency = (amount: number): string => {
    return `${amount < 0 ? '-' : ''}$${Math.abs(amount).toFixed(2)}`;
}
