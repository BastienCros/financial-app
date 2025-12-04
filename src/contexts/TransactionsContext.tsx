'use client'
import { createContext, useContext, useReducer } from 'react';
import { Transaction } from '@/types';
import { mockTransactions } from '@/data';

type TransactionAction =
    | { type: 'ADD'; payload: Transaction }

const TransactionsContext = createContext<{
    transactions: Transaction[];
    dispatch: React.Dispatch<TransactionAction>;
} | null>(null);

interface Props {
    children: React.ReactNode;
}

export function TransactionsProvider({ children }: Props) {

    const [transactions, dispatch] = useReducer(transactionReducer, mockTransactions);

    return (
        <TransactionsContext.Provider value={{ transactions, dispatch }} >
            {children}
        </TransactionsContext.Provider>
    );
}

function transactionReducer(state: Transaction[], action: TransactionAction): Transaction[] {
    switch (action.type) {
        case 'ADD': {
            return [
                ...state,
                action.payload
            ];
        }
        default: {
            throw Error('Unknown action: ' + action.type);
        }
    }
}

export function useTransactions() {
    const context = useContext(TransactionsContext);
    if (context === null) {
        throw new Error('useTransactions must be used within a TransactionsProvider');
    }
    return context;
}