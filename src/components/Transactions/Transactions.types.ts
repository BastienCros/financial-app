export type Transaction = {
  id: string;
  name: string;
  avatarUrl: string;
  amount: number;       // positive = income, negative = expense
  currency: string;
  date: string;         // ISO 8601, e.g. "2024-08-19T00:00:00.000Z"
};