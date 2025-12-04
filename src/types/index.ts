export interface Category {
  label: string;
  budget: number;
  color: string;
}

export type TransactionCategory =
  | "Salary"
  | "Rent"
  | "Groceries"
  | "Entertainment"
  | "Bills"
  | "Transport"
  | "Dining Out"
  | "Shopping"
  | "Other";

export interface Transaction {
  id: string;
  date: string;        // ISO string: "2025-10-31"
  description: string; // what you show in the list
  category: TransactionCategory | string;
  amount: number;      // > 0 = income, < 0 = expense
}