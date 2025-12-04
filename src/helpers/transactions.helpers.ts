/* 
getRecentTransactions(transactions, count)
getTransactionsSortedByDate(transactions)
getTotalIncome(transactions)
getTotalExpenses(transactions)
getBalance(transactions)
*/

import { Transaction } from "@/types";

export const getTransactionsSortedByDate = (transactions: Transaction[]) => {
    return [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export const getRecentTransactions = (transactions: Transaction[], count: number) => {
    return getTransactionsSortedByDate(transactions).slice(0, count)
}

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

export const formatCurrency = (amount: number): string => {
    return `${amount < 0 ? '-' : ''}$${Math.abs(amount).toFixed(2)}`;
}
