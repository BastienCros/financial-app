'use client'
import { useMemo } from "react";
import { categories } from "@/src/config";
import { calculateCategoryTotal, getCategoryColor, getMonthTransactions } from "@/helpers";
import { useTransactions } from "@/contexts/TransactionsContext";
import Card from "@/components/Card";
import PieChart, { PieItem } from "@/components/PieChart";
import CategoryItem from "@/components/CategoryItem";

import styles from "./budgets.module.css";

// Static computations - only depend on categories config
const budgetCategories = categories.filter(c => c.id !== 'income');
const totalBudget = budgetCategories.reduce((acc, item) => acc + item.budget, 0);

interface SummaryProps {
  total: number,
  limit: number,
}

function Summary({ total, limit }: SummaryProps) {
  return (
    <div className={styles.summaryWrapper}>
      <div className={styles.summary}>
        <p className="text-2xl font-mono font-bold pb-3">${total.toFixed(2)}</p>
        <p className=" text-fg-subtle">of ${limit.toFixed(2)} limit</p>
      </div>
    </div>
  )
}

interface BudgetsProps {
  selectedMonth: Date;
  className?: string;
}

function Budgets({ className, selectedMonth }: BudgetsProps) {
  const { transactions } = useTransactions();

  const currentMonthTransactions = useMemo(
    () => getMonthTransactions(transactions, selectedMonth),
    [transactions, selectedMonth]
  );


  const categorySpend = useMemo(() => {
    return budgetCategories.map(c => ({
      ...c,
      spend: calculateCategoryTotal(c.id, currentMonthTransactions)
    })).filter(c => c.spend !== 0);
  }, [currentMonthTransactions]);

  const totalSpent = useMemo(() => categorySpend.reduce((acc, item) => acc + item.spend, 0), [categorySpend]);

  const pieItems = useMemo(() => {
    return categorySpend.map((item) => ({
      id: item.id,
      label: item.label,
      value: item.spend,
      color: getCategoryColor(item.id)
    } as PieItem))
  }, [categorySpend]);

  // TODO: Add empty state when currentMonthTransactions.length === 0 (no data for selected month)

  return (
    <Card title="Budgets" className={className}>
      {/* TODO Budget container shall be flexible according to its container size instead of viewport size */}
      <div className={styles.container}>
        <div className={styles.chartWrapper}>
          <PieChart items={pieItems} />
          <Summary total={totalSpent} limit={totalBudget} />
        </div>
        <div className={styles.listWrapper}>
          <ul className={styles.list}>
            {categorySpend.map((item) => (
              <CategoryItem
                key={item.id}
                label={item.label}
                budget={item.budget}
                spend={item.spend}
                color={item.color}
              />
            ))}
          </ul>
        </div>
      </div>
    </Card>
  );
}

export default Budgets;
