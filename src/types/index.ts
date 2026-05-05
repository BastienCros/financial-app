export interface Transaction {
  id: number;
  date: string;        // ISO string: "2025-10-31"
  description: string; // what you show in the list
  categoryId: CategoryId;
  amount: number;      // > 0 = income, < 0 = expense
}

export type CategoryId =
  | "transport"
  | "entertainment"
  | "food"
  | "housing"
  | "health"
  | "shopping"
  | "fees"
  | "other"
  | "income";

export interface Category {
  id: CategoryId;
  label: string;
  color: string;  // Hex color code
  budget: number;  // Monthly budget amount
  iconUrl: string;
}
