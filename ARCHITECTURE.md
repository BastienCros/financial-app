# Architecture Documentation

## Overview

Personal Finance Manager is a Next.js-based financial management application for tracking expenses, budgets, recurring bills, and savings goals. The app uses CSV imports for transaction data and provides monthly budget tracking with category-based organization.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **UI Library**: React 19
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **Icons**: Lucide React
- **Package Manager**: npm

## Data Models

### Transaction

The core data structure for financial transactions.

```typescript
{
  id: string | number
  date: Date | string
  description: string
  normalizedDescription?: string  // Optional, used for recurring bill matching
  categoryId: string | number
  amount: number
  typeOperation: 'debit' | 'credit'
  isRecurringMatch: boolean
  recurringBillId: string | number | null
}
```

**Fields:**
- `id`: Unique identifier
- `date`: Transaction date
- `description`: Original transaction description
- `normalizedDescription`: Cleaned/normalized description for matching algorithms
- `categoryId`: Reference to category
- `amount`: Transaction amount
- `typeOperation`: Whether it's an expense (debit) or income (credit)
- `isRecurringMatch`: Whether this transaction matches a recurring bill
- `recurringBillId`: Reference to matched recurring bill, null if not matched

### RecurringBill

Represents recurring expenses like subscriptions, rent, utilities.

```typescript
{
  id: string | number
  name: string
  normalizedDescription: string
  categoryId: string | number
  typicalAmount: number
  amountTolerance: number | string  // e.g., 2 (€) or "10%"
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly'
  nextDueDate: Date | string
  lastPaidDate?: Date | string  // Optional
}
```

**Fields:**
- `id`: Unique identifier
- `name`: User-friendly name for the bill
- `normalizedDescription`: Pattern for matching transactions
- `categoryId`: Reference to category
- `typicalAmount`: Expected amount
- `amountTolerance`: Acceptable variance for matching (absolute value or percentage)
- `frequency`: How often the bill recurs
- `nextDueDate`: When the bill is next expected
- `lastPaidDate`: When it was last paid (for tracking)

### Category

Budget categories for organizing expenses and income.

```typescript
{
  id: string | number
  name: string
  color: string  // Hex color code
  budget: number  // Monthly budget amount
}
```

**Fields:**
- `id`: Unique identifier
- `name`: Category name (e.g., "Food", "Transport", "Entertainment")
- `color`: Visual identifier for UI display
- `budget`: Monthly budget allocation for this category

## High-Level Sections

### Transactions
Manages the import, storage, and display of financial transactions.
- **CSV Import**: Parses and imports transaction data
- **Filtering**: By date range, category, amount
- **Display**: List view with pagination/filtering
- **Status**: ✅ MVP1 Complete

### Budgets
Category-based budget tracking and visualization.
- **Category Management**: Create and configure budget categories
- **Monthly Tracking**: Track spending against budget per category
- **Visualization**: Charts showing budget utilization
- **Status**: ✅ MVP1 Complete

### Pots
Virtual savings goals and fund allocation.
- **Goal Setting**: Define savings targets
- **Progress Tracking**: Monitor progress toward goals
- **Fund Management**: Allocate and withdraw from pots
- **Status**: ✅ MVP1 Complete (Basic functionality)

### Dashboard
Central overview of financial status.
- **Summary Cards**: Balance, income, expenses
- **Grid Layout**: Responsive dashboard organization
- **Quick Stats**: Key financial metrics at a glance
- **Status**: ✅ MVP1 Complete

### Recurring Bills
Automatic tracking and matching of recurring expenses.
- **Bill Definition**: Create recurring bill patterns
- **Transaction Matching**: Auto-link transactions to bills
- **Payment Dashboard**: Track paid and upcoming bills
- **Status**: 📋 Planned for MVP2

## Development Setup

### Prerequisites
- Node.js 20+
- pnpm

### Quick Start

```bash
# Install dependencies
pnpm install

# Run development server
pnpm run dev
```

The app will be available at `http://localhost:3000`

### Build Commands

```bash
# Development
pnpm run dev

# Production build
pnpm run build

# Start production server
pnpm start

# Lint code
pnpm run lint
```

## Project Structure

This project follows a function-based organization approach (inspired by [Josh Comeau's file structure philosophy](https://www.joshwcomeau.com/react/file-structure/)), grouping code by type rather than by feature.

```
financial-app/
├── app/                    # Next.js App Router pages and layouts
├── src/
│   ├── components/         # React UI components
│   │   └── ComponentName/
│   │       ├── ComponentName.tsx
│   │       ├── ComponentName.module.css  # (optional)
│   │       ├── ComponentName.types.ts    # (component-specific)
│   │       ├── ComponentName.helpers.ts  # (component-specific)
│   │       └── index.ts                  # barrel export
│   │
│   ├── contexts/           # React Context providers & hooks
│   │   └── index.ts        # barrel export
│   │
│   ├── hooks/              # Reusable custom React hooks
│   │   └── index.ts        # barrel export
│   │
│   ├── helpers/            # Project-specific utility functions
│   │   └── index.ts        # barrel export
│   │
│   ├── utils/              # Generic, reusable utility functions
│   │   └── index.ts        # barrel export
│   │
│   ├── types/              # Shared TypeScript type definitions
│   │   └── index.ts        # type re-exports
│   │
│   └── data/               # Mock/seed data for development
│       └── index.ts        # barrel export
│
├── public/                 # Static assets (images, icons)
└── package.json
```

### Helpers vs Utils: Understanding the Difference

Following Josh Comeau's distinction:

**helpers/** - Project-specific utility functions
- Functions that contain business logic specific to this application
- Examples: `formatCurrency()`, `calculateBudgetRemaining()`, `matchRecurringBill()`
- These helpers understand the domain and requirements of your financial app
- Not portable to other projects without modification

**utils/** - Generic, reusable utility functions
- Pure functions that could work in any project
- Examples: `cn()` (className utility), `clamp()`, `debounce()`, `formatDate()`
- No knowledge of your app's business domain
- Can be copy-pasted to other projects without changes

### Component Organization

Components keep their specific files co-located:
- `ComponentName.types.ts` - Types only used by this component
- `ComponentName.helpers.ts` - Functions only used by this component
- Component-specific files are promoted to global directories only when shared by multiple components

### Barrel Exports

Index files (`index.ts`) provide clean imports:
```typescript
// Instead of:
import { useLocalStorage } from '@/hooks/use-local-storage'

// Use:
import { useLocalStorage } from '@/hooks'
```

## Notes

This architecture documentation focuses on stable data models and high-level structure. Component-level implementation details are intentionally kept minimal as the architecture continues to evolve during active development.


# Architecture update: data layers

## 1. Data Layers (3-tier structure)

A. Category Configuration (user-defined)

Stable, persistent config that defines:
	•	id
	•	name
	•	color
	•	budget (monthly limit)

These values do not depend on CSV data or month selection.

type CategoryConfig = {
  id: string;
  name: string;
  color: string;
  budget: number;
};


⸻

B. Transactions (CSV source of truth)

Imported from CSV, normalized, and stored once.

type Transaction = {
  id: string;
  date: Date;
  amount: number;
  bankCategory: string;
  categoryId: string; // mapped to our CategoryConfig
};

Transactions do not store budget data; they represent real spending events.

⸻

C. Computed Monthly State (derived)

For any given month, we aggregate:

type CategoryMonthState = {
  categoryId: string;
  spent: number;      // sum of transactions for that category in that month
  remaining: number;  // budget - spent
};

This layer is computed from A + B and never saved directly.

⸻

## 2. UI Data Flow

Pie Chart (Donut)

Displays distribution of spent amounts across categories:
	•	slices = spent per category
	•	center big number = totalSpent
	•	center subtext = of totalBudget limit

This matches intuitive budgeting:
chart = where money actually went.

⸻

Right-hand List (Budget Breakdown)

Shows category-by-category budget state:
	•	category name
	•	spent
	•	budget
	•	remaining = budget - spent

Clear, actionable summary:

“How much did I use? How much do I have left?”

⸻

## 3. Component Responsibilities

PieChart
	•	purely visual (SVG arcs)
	•	receives PieItem[] (id, label, color, value)
	•	does not know about money or budgets
	•	rotation handled internally with <g transform="rotate(...)" />

BudgetCard
	•	computes:
	•	categorySpent
	•	PieItem[]
	•	totalSpent
	•	totalBudget
	•	positions center label absolutely over the pie
	•	displays category list + values

Future Context/Reducer
	•	will store:
	•	categories
	•	transactions
	•	active month
	•	provide selectors:
	•	getTransactionsForMonth()
	•	getSpentByCategoryForMonth()

But not needed for the static preview right now.


## Add pages for transaction: layout idea

```
  Create a shared layout for just the pages that need transactions:
  app/
    ├── layout.tsx (root)
    ├── (dashboard)/
    │   ├── layout.tsx ← TransactionsProvider here
    │   ├── page.tsx (home)
    │   └── transactions/
    │       └── page.tsx
    └── settings/ (doesn't need transactions)
        └── page.tsx
```

## Error Boundaries

**Why**: Prevent component errors from crashing entire app. Provide graceful degradation and error isolation.

**When to implement**: MVP2 (Medium priority)

**Strategy**:
- Use Next.js `error.tsx` convention at page level: `app/(dashboard)/error.tsx`
- Wrap critical components (PieChart, data computations) in custom ErrorBoundary component
- Real-world cases: network failures, invalid data parsing, malformed CSV, chart rendering errors

**Implementation**: Create reusable `ErrorBoundary` component + add `error.tsx` files at key routes

---

## Loading States

**Why**: Essential for API integration (MVP2). Prevents blank screens, layout shifts, and poor UX during data fetching.

**When to implement**: MVP2 when transitioning from mock data to API calls (High priority)

**Strategy**:
- Use Next.js `loading.tsx` convention for page-level loading
- Use React `<Suspense>` for component-level granular loading
- Create skeleton components matching real content layout (TransactionsSkeleton, BudgetsSkeleton, etc.)

**Patterns**:
- Parallel loading for independent sections
- Progressive enhancement (basic info first, details after)
- Skeleton UI with pulse animation for visual feedback

---