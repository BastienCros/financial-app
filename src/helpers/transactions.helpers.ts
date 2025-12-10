import { Transaction } from "@/types";
import { formatMonthValue } from "./date.helpers";

/* Sorting helpers */
export const getTransactionsSortedByDate = (transactions: Transaction[]) => {
    return [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export const getRecentTransactions = (transactions: Transaction[], count: number) => {
    return getTransactionsSortedByDate(transactions).slice(0, count)
}

/* Aggregate helpers */
// Currently aggregation does not take into accoun period (monthly, ..)
export const getTotalIncome = (transactions: Transaction[]) => {
    return transactions
        .filter(t => t.amount > 0)
        .reduce((acc, t) => acc + t.amount, 0);
}

export const getTotalExpenses = (transactions: Transaction[]) => {
    return transactions
        .filter(t => t.amount < 0)
        .reduce((acc, t) => acc + Math.abs(t.amount), 0);
}

export const getBalance = (transactions: Transaction[]) => {
    return transactions
        .reduce((acc, t) => acc + t.amount, 0);
}


/* Format helpers */
export const formatCurrency = (amount: number): string => {
    return `${amount < 0 ? '-' : ''}$${Math.abs(amount).toFixed(2)}`;
}


/* Month helpers */
export const getAvailableMonth = (transactions: Transaction[]) => {
    // Use Set for O(n) performance - automatically handles uniqueness
    const monthSet = new Set(
        transactions.map(t => formatMonthValue(new Date(t.date)))
    );

    // Convert to array and sort (newest first)
    return Array.from(monthSet).sort((a, b) => a.localeCompare(b));
}

export const getMonthTransactions = (transactions: Transaction[], month: Date): Transaction[] => {
    const selectedYear = month.getFullYear();
    const selectedMonth = month.getMonth();

    return transactions.filter(t => {
        const tDate = new Date(t.date);
        return tDate.getFullYear() === selectedYear &&
            tDate.getMonth() === selectedMonth;
    })
}