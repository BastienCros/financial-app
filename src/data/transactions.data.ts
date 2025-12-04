import { Transaction } from "@/types";

export const mockTransactions: Transaction[] = [
  {
    id: "t-001",
    date: "2025-10-31",
    description: "Spotify",
    category: "Entertainment",
    amount: -21.24,
  },
  {
    id: "t-002",
    date: "2025-10-30",
    description: "Emma Richardson",
    category: "Other", // e.g. “Friend reimbursement”
    amount: +75.5,
  },
  {
    id: "t-003",
    date: "2025-10-29",
    description: "Savory Bites Bistro",
    category: "Dining Out",
    amount: -55.5,
  },
  {
    id: "t-004",
    date: "2025-10-28",
    description: "Daniel Carter",
    category: "Other",
    amount: -42.3,
  },
  {
    id: "t-005",
    date: "2025-10-27",
    description: "Sun Park",
    category: "Other",
    amount: +120,
  },
  {
    id: "t-006",
    date: "2025-10-26",
    description: "Urban Services Hub",
    category: "Bills",
    amount: -65,
  },
  {
    id: "t-007",
    date: "2025-10-25",
    description: "Groceries - Local Market",
    category: "Groceries",
    amount: -82.4,
  },
  {
    id: "t-008",
    date: "2025-10-24",
    description: "Rent - City Apartments",
    category: "Rent",
    amount: -950,
  },
  {
    id: "t-009",
    date: "2025-10-23",
    description: "Freelance Payment - Client X",
    category: "Salary",
    amount: +450,
  },
  {
    id: "t-010",
    date: "2025-10-22",
    description: "Electricity Bill",
    category: "Bills",
    amount: -78.9,
  },
];