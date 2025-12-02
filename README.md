# Personal Finance Manager

A modern financial management application for tracking expenses, managing budgets, and achieving savings goals. Built with Next.js 16 and React 19 as part of a Frontend Mentor challenge.

## About the Project

This application helps users take control of their personal finances through intuitive expense tracking, budget management, and savings goal visualization.

**What it does:** Provides a comprehensive dashboard for managing transactions, tracking spending against category-based budgets, and monitoring progress toward savings goals. The app supports CSV imports for easy transaction data entry and offers monthly spending analytics.

**Why it exists:** Built to practice modern React patterns, TypeScript development, and responsive design while creating a practical tool for personal financial management.

**How it works:** Users import transactions via CSV, which are automatically categorized. The dashboard provides real-time insights into spending patterns, budget utilization, and savings progress across customizable categories.

## Key Features

### ✅ Implemented (MVP1)

- **Transaction Management**: CSV import with automatic parsing and categorization
- **Category-Based Budgets**: Define and track monthly budgets per category
- **Monthly Overview**: Visualize spending patterns and budget utilization
- **Dashboard Grid**: Responsive layout with key financial metrics
- **Pots (Savings Goals)**: Track progress toward savings targets
- **Balance Summary**: At-a-glance financial overview

### 📋 Planned Features

#### MVP2: Smart Bill Management
- Manual recurring bill tracking
- Automatic transaction-to-bill linking
- Payment status indicators
- Upcoming bills dashboard
- Smart matching with tolerance ranges

#### MVP3: Advanced Financial Tools
- Enhanced pots with savings targets and progress tracking
- "Available to spend" calculation
- Income vs expenses analytics
- Month-over-month trend comparisons
- Export and reporting capabilities
- Monthly closing functionality

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **UI**: React 19, TypeScript, Tailwind CSS 4
- **Icons**: Lucide React
- **Features**: Server Components, CSS Modules

## Current Status

**Development Phase**: MVP1 - Core Features

- ✅ Transaction list with filtering
- ✅ Category management with budgets
- ✅ Monthly budget tracking
- ✅ Basic pots functionality
- ✅ Responsive dashboard layout

## Roadmap

### Near Term (MVP2)
1. Recurring bill tracking system
2. Smart transaction matching for bills
3. Bill payment status dashboard

### Future (MVP3)
1. Enhanced savings pots with detailed progress tracking
2. Comprehensive income vs expenses analytics
3. Historical trend analysis (month-over-month)
4. Data export and custom reporting

## Getting Started

```bash
# Install dependencies
pnpm install

# Run development server
pnpm run dev

# Build for production
pnpm run build
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Project Structure

```
financial-app/
├── app/                    # Next.js App Router pages
├── src/
│   ├── components/         # React components
│   │   ├── ...
│   └── lib/               # Utilities and helpers
└── public/                # Static assets
```

For detailed technical documentation, see [ARCHITECTURE.md](./ARCHITECTURE.md).

## Development Notes

- Built with modern React Server Components
- Component styling via CSS Modules
- Full TypeScript type safety
- Responsive design with Tailwind CSS 4
- Optimized fonts with `next/font`
